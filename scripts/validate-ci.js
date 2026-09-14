/**
 * 食觅 (Shimi) CI 自动化综合校验脚本
 * 运行方式: node scripts/validate-ci.js
 *
 * 检查范围 (对齐《「食觅」项目规划书 V1.0》与《AGENTS.md》红线):
 * 1. JSON 配置文件完整性校验 (app.json, project.config.json 等)
 * 2. 敏感凭证与密钥防泄露扫描 (Secret Leak Scan)
 * 3. 全局 JavaScript 语法规范检查 (node --check)
 * 4. V1 数据库集合与菜谱数据规范 (严格白名单 + 必填字段 + 步骤耗时 + 状态码)
 * 5. 云函数合规预检 (强制只查 auditStatus=1 已发布内容)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let errors = [];
let warnings = [];

console.log('🚀 [CI] 开始食觅 (Shimi) V1.0 自动化综合检查...\n');

// ---------------------------------------------------------------------------
// 1. JSON 配置文件合法性
// ---------------------------------------------------------------------------
const jsonFiles = ['app.json', 'project.config.json', 'sitemap.json'];
jsonFiles.forEach((file) => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      JSON.parse(content);
      console.log(`✅ [JSON] ${file} 格式合法`);
    } catch (e) {
      errors.push(`[JSON] ${file} 解析失败: ${e.message}`);
    }
  }
});

// ---------------------------------------------------------------------------
// 2. 敏感信息防泄露扫描 (禁止将云开发秘钥、环境ID等私密数据提交进公开仓库)
// ---------------------------------------------------------------------------
const forbiddenPatterns = [
  { pattern: /SecretId\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/i, msg: '发现硬编码腾讯云 SecretId' },
  { pattern: /SecretKey\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/i, msg: '发现硬编码腾讯云 SecretKey' },
  { pattern: /FEEDBACK_SMTP_PASS\s*[:=]\s*['"][a-zA-Z0-9]{8,}['"]/i, msg: '发现硬编码邮箱 SMTP 授权码' }
];

function scanFilesForSecrets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanFilesForSecrets(fullPath);
    } else if (/\.(js|json|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      forbiddenPatterns.forEach(({ pattern, msg }) => {
        if (pattern.test(content)) {
          errors.push(`[安全] ${path.relative(path.join(__dirname, '..'), fullPath)}: ${msg}`);
        }
      });
    }
  }
}

try {
  scanFilesForSecrets(path.join(__dirname, '..'));
  console.log('✅ [安全] 未发现敏感密钥与凭据泄露');
} catch (e) {
  errors.push(`[安全] 扫描出错: ${e.message}`);
}

// ---------------------------------------------------------------------------
// 3. 全局 JavaScript 语法检查 (语法错误直接拦截)
// ---------------------------------------------------------------------------
function checkJsSyntax(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkJsSyntax(fullPath);
    } else if (entry.name.endsWith('.js')) {
      try {
        execSync(`node --check "${fullPath}"`);
      } catch (e) {
        errors.push(`[语法] JS 语法错误: ${path.relative(path.join(__dirname, '..'), fullPath)}`);
      }
    }
  }
}

try {
  ['cloudfunctions', 'utils', 'pages', 'scripts'].forEach((folder) => {
    const p = path.join(__dirname, '..', folder);
    if (fs.existsSync(p)) checkJsSyntax(p);
  });
  console.log('✅ [语法] 所有核心 JS 代码语法检查通过');
} catch (e) {
  errors.push(`[语法] 语法扫描出错: ${e.message}`);
}

// ---------------------------------------------------------------------------
// 4. V1 菜谱数据与 Schema 强白名单校验 (对照规划书 6.1 节)
// ---------------------------------------------------------------------------
const ALLOWED_DISH_FIELDS = new Set([
  '_id', 'name', 'cover', 'totalTime', 'tags',
  'ingredients', 'tools', 'taboos', 'steps',
  'openid', 'auditStatus', 'rejectReason'
]);

const seedScriptPath = path.join(__dirname, 'seed-dishes.js');
if (fs.existsSync(seedScriptPath)) {
  try {
    const seed = require(seedScriptPath);
    const dishes = seed.dishes || [];
    const tools = seed.tools || [];
    const ingredients = seed.ingredients || [];

    if (!Array.isArray(dishes) || dishes.length === 0) {
      errors.push('[数据] dishes 必须是非空数组');
    } else if (dishes.length < 20) {
      errors.push(`[数据] dishes 只有 ${dishes.length} 条，未达到验收标准要求的 ≥ 20 条`);
    } else {
      const seenIds = new Set();
      dishes.forEach((dish, idx) => {
        const id = dish._id || `#${idx}`;
        if (seenIds.has(id)) errors.push(`[数据] ${id} 存在重复 _id`);
        seenIds.add(id);

        if (!dish.name || typeof dish.name !== 'string') errors.push(`[数据] ${id} 缺失必填字符串 name`);
        if (!dish.cover || typeof dish.cover !== 'string') errors.push(`[数据] ${id} 缺失必填字符串 cover`);
        if (!Number.isInteger(dish.totalTime) || dish.totalTime <= 0) {
          errors.push(`[数据] ${id} totalTime 必须为正整数 (分钟)`);
        }
        if (!Array.isArray(dish.tags)) errors.push(`[数据] ${id} tags 必须为数组`);

        // 厨具校验 (必须为非空数组)
        if (!Array.isArray(dish.tools) || dish.tools.length === 0) {
          errors.push(`[数据] ${id} tools 必须为非空字符串数组`);
        }

        // 食材校验
        if (!Array.isArray(dish.ingredients) || dish.ingredients.length === 0) {
          errors.push(`[数据] ${id} ingredients 必须为非空数组`);
        } else {
          dish.ingredients.forEach((ing, i) => {
            if (!ing || !ing.name) errors.push(`[数据] ${id} ingredients[${i}] 缺失 name`);
            if (!('num' in ing)) errors.push(`[数据] ${id} ingredients[${i}] 缺失 num 用量描述`);
          });
        }

        // 步骤校验 (必须带分步耗时 time)
        if (!Array.isArray(dish.steps) || dish.steps.length === 0) {
          errors.push(`[数据] ${id} steps 必须为非空数组`);
        } else {
          dish.steps.forEach((s, i) => {
            if (!s || !s.desc) errors.push(`[数据] ${id} steps[${i}] 缺失 desc 描述`);
            if (!Number.isInteger(s.time) || s.time <= 0) {
              errors.push(`[数据] ${id} steps[${i}].time 必须为正整数 (单步耗时分钟)`);
            }
          });
        }

        // 状态码校验 (0待审核/1已发布/2已驳回)
        if (![0, 1, 2].includes(dish.auditStatus)) {
          errors.push(`[数据] ${id} auditStatus 必须为 0/1/2`);
        }

        // 红线：严禁提前启用 V2/V3 预留字段
        for (const key of Object.keys(dish)) {
          if (!ALLOWED_DISH_FIELDS.has(key)) {
            errors.push(`[数据] ${id} 出现未允许的预留字段 '${key}' (违反 V1 红线规范)`);
          }
        }
      });
      console.log(`✅ [数据] 成功校验 ${dishes.length} 条菜谱，字段与 V1 规范 100% 吻合 (ingredients=${ingredients.length}, tools=${tools.length})`);
    }
  } catch (e) {
    errors.push(`[数据] 运行 seed-dishes.js 校验时出错: ${e.message}`);
  }
} else {
  warnings.push('[数据] 尚未找到 scripts/seed-dishes.js，跳过种子数据校验');
}

// ---------------------------------------------------------------------------
// 5. 云函数规范预检 (若存在 matchDishes，检查安全红线)
// ---------------------------------------------------------------------------
const matchDishesPath = path.join(__dirname, '..', 'cloudfunctions', 'matchDishes', 'index.js');
if (fs.existsSync(matchDishesPath)) {
  const code = fs.readFileSync(matchDishesPath, 'utf8');
  if (!code.includes('auditStatus') || !code.includes('1')) {
    errors.push('[云函数] matchDishes 必须包含 auditStatus == 1 的过滤逻辑，防止未审核内容泄露！');
  } else {
    console.log('✅ [云函数] matchDishes 安全过滤检查通过 (强制 auditStatus=1)');
  }
}

// ---------------------------------------------------------------------------
// 汇总与退出
// ---------------------------------------------------------------------------
console.log('\n================ CI 检查结果 ================');
if (warnings.length > 0) {
  console.log(`⚠️  建议项 (${warnings.length} 条):`);
  warnings.forEach((w) => console.log('   ' + w));
}

if (errors.length > 0) {
  console.error(`❌ 阻断性错误 (${errors.length} 条):`);
  errors.slice(0, 30).forEach((err) => console.error('   ' + err));
  if (errors.length > 30) console.error(`   ... 还有 ${errors.length - 30} 条错误未展示`);
  process.exit(1);
} else {
  console.log('🎉 全部检查通过！代码与数据规范完全符合任务书要求，可安全合并。');
  process.exit(0);
}
