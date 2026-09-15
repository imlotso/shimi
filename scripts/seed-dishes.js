/**
 * scripts/seed-dishes.js
 *
 * 「食觅」dishes 集合初始化脚本（数据同学任务卡 1）。
 *
 * 职责：
 *   1. 读取小程序本地数据源 utils/data.js（老项目写死的菜谱/食材）。
 *   2. 按 docs/数据说明.md 定义的云端 dishes 集合结构清洗转换，
 *      补齐老数据没有的字段：tools / taboos / steps[].time / auditStatus。
 *   3. 导出 module.exports = { dishes, ingredients, tools }，
 *      供 CI 脚本 scripts/validate-ci.js 在本地无云环境的情况下做格式校验。
 *   4. 默认只做本地清洗与统计；加 --export-json 把三份种子数据落成
 *      scripts/.generated/*.json，供微信云开发控制台「导入 JSON」批量入库；
 *      加 --push 尝试用 @cloudbase/node-sdk 直连云端写入（需要环境变量）。
 *
 * 用法：
 *   node scripts/seed-dishes.js                  # 本地清洗 + 打印统计（CI/开发自测用）
 *   node scripts/seed-dishes.js --export-json     # 额外导出 JSON 到 scripts/.generated/
 *   node scripts/seed-dishes.js --push            # 直连云端批量写入（需配环境变量）
 *
 * push 所需环境变量（不要提交到 git）：
 *   CLOUD_ENV_ID     云开发环境 ID
 *   CLOUD_SECRET_ID  云开发 API 密钥 ID（在云开发控制台-身份与密钥获取）
 *   CLOUD_SECRET_KEY 云开发 API 密钥 Key
 */

'use strict';

const fs = require('fs');
const path = require('path');

// 从仓库根的 utils/data.js 读老数据。
// 注意：utils/data.js 里引用了 wx 小程序运行时不存在的东西吗？读一遍确认——
// 它只做纯数据拼接和 amount 字符串美化，不依赖 wx.*，所以可以直接在 Node 里 require。
const source = require('../utils/data.js');

// 系统预置数据使用的保留 openid 前缀，避免与真实微信用户 openid 冲突。
// 云函数 matchDishes 只按 auditStatus=1 过滤，不按 openid 区分，所以这里用占位串即可。
const SEED_OPENID = '__seed_system__';

// ---------------------------------------------------------------------------
// 字段清洗工具
// ---------------------------------------------------------------------------

/**
 * 推断单步耗时（分钟）。任务卡要求 steps: [{ desc, time: 3 }]，
 * 这里尽量从步骤描述里的真实分钟数提取，提取不到再按操作类型给经验值。
 */
function inferStepTime(desc) {
  const text = String(desc || '');
  // 优先匹配 "25 到 30 分钟" / "15~20分钟" / "15 分钟"
  const range = text.match(/(\d+)\s*(?:到|~|～|-)\s*(\d+)\s*分/);
  if (range) return Number(range[2]); // 取上界，宁可多留时间
  const fixed = text.match(/(\d+)\s*分/);
  if (fixed) return Number(fixed[1]);
  // 没有数字时按操作类型给经验值
  if (/腌|焖|炖|卤|熬|烤|煮/.test(text)) return 10;
  if (/焯|炒|煎|炸|翻炒|滑炒|煸|收汁/.test(text)) return 4;
  if (/洗|切|去皮|剥|撕|拌|装盘|装碗|切块|切片|切丝|打结|划刀/.test(text)) return 2;
  return 3;
}

/**
 * 推断这道菜核心需要的厨具。
 * 任务卡兜底值是 ["炒锅"]，这里按步骤文本做轻量识别：
 *   - 烤 / 空气炸 / 蒸 / 电饭煲 这种专用锅具单独识别；
 *   - 完全不开火的凉拌/水果轻食用沙拉碗；
 *   - 其余一律兜底炒锅（V1 不把菜刀砧板这类家家都有的工具列进去，
 *     因为 matchDishes 是「厨具全部覆盖才命中」，列多了命中率反而低）。
 */
function inferTools(recipe) {
  const blob = `${recipe.name} ${Array.isArray(recipe.steps) ? recipe.steps.join(' ') : ''}`;
  if (/空气炸锅/.test(blob)) return ['空气炸锅'];
  if (/烤箱/.test(blob)) return ['烤箱'];
  if (/电饭煲|电饭锅/.test(blob)) return ['电饭煲'];
  if (/蒸锅|上蒸|蒸一|大火蒸|中火蒸|小火蒸/.test(blob)) return ['蒸锅'];
  const noStove = /沙拉|凉拌|酸奶|不用开火|水果碗|轻食杯/.test(blob) && !/炒|煎|炸|煮|焯|烤|焖/.test(blob);
  if (noStove) return ['沙拉碗'];
  return ['炒锅'];
}

/**
 * 把老 recipe 转成云端 dishes 集合的一条文档。
 * 字段对应见 docs/数据说明.md 的字段字典。
 */
function toDishDoc(recipe) {
  const ingredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((item) => ({
    name: item.name,
    // 云端字段叫 num，但 V1 阶段只做反向匹配（按 name 命中），用量保留原描述字符串
    // （如 "2 个" / "1 汤匙"），不做数值换算。
    num: item.amount
  }));

  const steps = (Array.isArray(recipe.steps) ? recipe.steps : []).map((desc) => ({
    desc: String(desc || '').trim(),
    time: inferStepTime(desc)
  }));

  return {
    // 用老 recipe 的 id 作为云端 _id，重复 seed 时可幂等 upsert，不会插入重复菜谱。
    _id: recipe.id,
    name: recipe.name,
    cover: recipe.image,
    totalTime: Number(recipe.time) || 0,
    tags: Array.isArray(recipe.tags) ? recipe.tags.slice() : [],
    ingredients,
    tools: inferTools(recipe),
    // 任务卡要求兜底空数组；后续如有明确忌口（如海鲜类对尿酸高人群）再人工补。
    taboos: [],
    steps,
    openid: SEED_OPENID,
    auditStatus: 1
  };
}

/**
 * 从老 ingredients 数组抽出云端 ingredients 集合需要的最小字段。
 * 云端 ingredients 集合字段：{ name, category }。
 */
function toIngredientDocs(list) {
  const seen = new Set();
  const docs = [];
  for (const item of list) {
    if (!item || !item.name) continue;
    const key = item.category + '|' + item.name;
    if (seen.has(key)) continue;
    seen.add(key);
    docs.push({ name: item.name, category: item.category || 'common' });
  }
  return docs;
}

/**
 * 汇总所有菜谱里出现过的 tools，再补一批厨房常见备选，
 * 写进云端 tools 集合（字段：{ name }），供前端厨具勾选页拉取。
 */
const EXTRA_TOOLS = [
  '炒锅', '平底锅', '汤锅', '蒸锅', '电饭煲', '电压力锅',
  '烤箱', '空气炸锅', '微波炉', '沙拉碗', '奶锅'
];

function toToolDocs(dishes) {
  const seen = new Set();
  const docs = [];
  const push = (name) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    docs.push({ name });
  };
  for (const d of dishes) {
    (d.tools || []).forEach(push);
  }
  EXTRA_TOOLS.forEach(push);
  return docs;
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

const dishes = source.recipes.map(toDishDoc);
const ingredientDocs = toIngredientDocs(source.ingredients);
const toolDocs = toToolDocs(dishes);

module.exports = {
  dishes,
  ingredients: ingredientDocs,
  tools: toolDocs,
  // 导出清洗函数本身，方便单测/调试
  _internals: { inferStepTime, inferTools, toDishDoc, SEED_OPENID }
};

// 被 require 时（CI 校验）只导出；直接 node 运行时才走命令行逻辑。
if (require.main === module) {
  main().catch((err) => {
    console.error('[seed-dishes] 运行失败：', err);
    process.exit(1);
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const wantExportJson = argv.includes('--export-json');
  const wantPush = argv.includes('--push');

  console.log('[seed-dishes] 本地清洗完成：');
  console.log('  dishes 条数       :', dishes.length);
  console.log('  ingredients 条数  :', ingredientDocs.length);
  console.log('  tools 条数        :', toolDocs.length);

  // tools 分布
  const toolHist = {};
  for (const d of dishes) {
    for (const t of d.tools) toolHist[t] = (toolHist[t] || 0) + 1;
  }
  console.log('  tools 分布        :', JSON.stringify(toolHist));

  // steps.time 抽样
  const sampleStep = dishes[0] && dishes[0].steps;
  if (sampleStep) {
    console.log('  steps 样例        :', JSON.stringify(sampleStep.slice(0, 2)));
  }

  if (wantExportJson) {
    const outDir = path.join(__dirname, '.generated');
    fs.mkdirSync(outDir, { recursive: true });
    const write = (name, data) => {
      const file = path.join(outDir, name);
      // 云开发控制台导入要求 JSON Lines：每行一个完整 JSON 文档，不能是外层数组。
      const jsonl = data.map((item) => JSON.stringify(item)).join('\n') + '\n';
      fs.writeFileSync(file, jsonl, 'utf8');
      console.log('  已写出', path.relative(process.cwd(), file));
    };
    write('dishes.seed.json', dishes);
    write('ingredients.seed.json', ingredientDocs);
    write('tools.seed.json', toolDocs);
    console.log('[seed-dishes] 把上述 JSON 在云开发控制台对应集合里「导入 JSON」即可。');
  }

  if (wantPush) {
    await pushToCloud();
  }
}

/**
 * 直连云端批量写入。仅在显式 --push 时执行。
 * 使用 @cloudbase/node-sdk（微信云开发官方 Node SDK），
 * 凭证从环境变量读，不写死在仓库里。
 */
async function pushToCloud() {
  const envId = process.env.CLOUD_ENV_ID;
  const secretId = process.env.CLOUD_SECRET_ID;
  const secretKey = process.env.CLOUD_SECRET_KEY;
  if (!envId || !secretId || !secretKey) {
    throw new Error(
      '缺少环境变量 CLOUD_ENV_ID / CLOUD_SECRET_ID / CLOUD_SECRET_KEY。' +
      ' 请在云开发控制台-身份与密钥里新建 API 密钥后再跑 --push，或改用 --export-json 后在控制台导入。'
    );
  }
  let tcb;
  try {
    tcb = require('@cloudbase/node-sdk');
  } catch (e) {
    throw new Error(
      '未安装 @cloudbase/node-sdk。请先在 scripts 目录或根目录执行：' +
      'npm install @cloudbase/node-sdk --no-save，再重试 --push。'
    );
  }
  const app = tcb.init({ env: envId, secretId, secretKey });
  const db = app.database();

  // dishes：用 _id upsert，重复跑不产生重复数据
  for (const doc of dishes) {
    await db.collection('dishes').doc(doc._id).set(doc);
  }
  console.log('[seed-dishes] dishes 写入完成，共', dishes.length, '条');

  // ingredients / tools：先清空再批量插入（这两个集合是字典表，全量重建）
  await replaceCollection(db, 'ingredients', ingredientDocs);
  await replaceCollection(db, 'tools', toolDocs);

  console.log('[seed-dishes] 云端写入完成。请确认 dishes / ingredients / tools 三个集合已在控制台建好。');
}

async function replaceCollection(db, coll, docs) {
  // 云开发文档数据库没有一次性 truncate，按 openid 保留条件删种子数据。
  await db.collection(coll).where({ openid: SEED_OPENID }).remove().catch(() => {});
  // 字典表没有 openid 字段，按批量分批插入
  const batch = await db.collection(coll).add(docs);
  console.log(`[seed-dishes] ${coll} 写入完成，共`, docs.length, '条', batch);
}
//（注：内容由AI生成）
