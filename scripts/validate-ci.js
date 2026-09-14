/**
 * scripts/validate-ci.js
 *
 * CI 数据格式校验（任务卡 1 验收标准）。
 *
 * 用法：node scripts/validate-ci.js
 *
 * 校验对象：scripts/seed-dishes.js 导出的 dishes 数组。
 * 规则来源：docs/数据说明.md 里 dishes 集合字段定义 + AGENTS.md 全局红线。
 * 任何一条不满足都打印 [FAIL] 并以 exit code 1 退出；
 * 全部通过打印 [PASS] 并 exit 0。
 *
 * 不连云端、不读环境变量，纯本地静态校验，保证在任何机器上都能跑。
 */

'use strict';

const { dishes, ingredients, tools } = require('./seed-dishes.js');

// dishes 集合允许出现的字段白名单。
// 不在此列表里的字段一律视为"预留/未启用字段被误用"，按 AGENTS.md 红线第 3 条报错。
const ALLOWED_DISH_FIELDS = new Set([
  '_id', 'name', 'cover', 'totalTime', 'tags',
  'ingredients', 'tools', 'taboos', 'steps',
  'openid', 'auditStatus', 'rejectReason'
]);

const errors = [];
const warnings = [];

function fail(dishId, msg) {
  errors.push(`[FAIL] dish id=${dishId || '(unknown)'}: ${msg}`);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInt(v) {
  return Number.isInteger(v) && v > 0;
}

// ---------------------------------------------------------------------------
// dishes 逐条校验
// ---------------------------------------------------------------------------
if (!Array.isArray(dishes) || dishes.length === 0) {
  errors.push('[FAIL] dishes 必须是非空数组');
} else if (dishes.length < 20) {
  // 任务卡 AC：dishes 集合 ≥ 20 条完整数据
  errors.push(`[FAIL] dishes 只有 ${dishes.length} 条，未达到 AC 要求的 ≥ 20 条`);
}

const seenIds = new Set();

(dishes || []).forEach((dish, idx) => {
  const id = dish._id || `#${idx}`;

  if (seenIds.has(id)) fail(id, '_id 重复');
  seenIds.add(id);

  if (!isNonEmptyString(dish.name)) fail(id, 'name 必须是非空字符串');
  if (!isNonEmptyString(dish.cover)) fail(id, 'cover 必须是非空字符串');
  if (!isPositiveInt(dish.totalTime)) fail(id, `totalTime 必须是正整数（当前: ${JSON.stringify(dish.totalTime)}）`);

  if (!Array.isArray(dish.tags)) fail(id, 'tags 必须是数组（可为空）');

  if (!Array.isArray(dish.tools) || dish.tools.length === 0) {
    fail(id, 'tools 必须是非空字符串数组');
  } else {
    dish.tools.forEach((t) => {
      if (!isNonEmptyString(t)) fail(id, 'tools 数组里存在空字符串项');
    });
  }

  if (!Array.isArray(dish.taboos)) fail(id, 'taboos 必须是数组（允许为空）');
  else dish.taboos.forEach((t) => {
    if (!isNonEmptyString(t)) fail(id, 'taboos 数组里存在空字符串项');
  });

  if (!Array.isArray(dish.ingredients) || dish.ingredients.length === 0) {
    fail(id, 'ingredients 必须是非空数组');
  } else {
    dish.ingredients.forEach((ing, i) => {
      if (!ing || typeof ing !== 'object') { fail(id, `ingredients[${i}] 不是对象`); return; }
      if (!isNonEmptyString(ing.name)) fail(id, `ingredients[${i}].name 非空字符串`);
      if (!('num' in ing) || !isNonEmptyString(String(ing.num))) {
        fail(id, `ingredients[${i}].num 必须存在且为用量描述字符串`);
      }
    });
  }

  if (!Array.isArray(dish.steps) || dish.steps.length === 0) {
    fail(id, 'steps 必须是非空数组');
  } else {
    dish.steps.forEach((s, i) => {
      if (!s || typeof s !== 'object') { fail(id, `steps[${i}] 不是对象`); return; }
      if (!isNonEmptyString(s.desc)) fail(id, `steps[${i}].desc 非空字符串`);
      if (!isPositiveInt(s.time)) fail(id, `steps[${i}].time 必须是正整数（分钟），当前: ${JSON.stringify(s.time)}`);
    });
  }

  if (!isNonEmptyString(dish.openid)) fail(id, 'openid 必须是非空字符串（种子数据用 __seed_system__）');
  if (![0, 1, 2].includes(dish.auditStatus)) {
    fail(id, `auditStatus 必须是 0/1/2，当前: ${JSON.stringify(dish.auditStatus)}`);
  }
  if (dish.auditStatus === 2 && !isNonEmptyString(dish.rejectReason)) {
    warnings.push(`[WARN] dish id=${id} 已驳回(2) 但未填 rejectReason`);
  }

  // 字段白名单：禁止出现预留字段
  for (const key of Object.keys(dish)) {
    if (!ALLOWED_DISH_FIELDS.has(key)) {
      fail(id, `出现未在 dishes 字段字典里的字段: ${key}（V1 红线：不要提前启用预留字段）`);
    }
  }
});

// ---------------------------------------------------------------------------
// ingredients / tools 集合字典表校验
// ---------------------------------------------------------------------------
(dishes || []).forEach((dish) => {
  const toolSet = new Set((tools || []).map((t) => t.name));
  (dish.tools || []).forEach((t) => {
    if (!toolSet.has(t)) {
      warnings.push(`[WARN] dish id=${dish._id} 用到了 tools 集合里没有的厨具: ${t}（建议在 scripts/seed-dishes.js 的 EXTRA_TOOLS 或推断规则里补）`);
    }
  });
});

// ---------------------------------------------------------------------------
// 汇总
// ---------------------------------------------------------------------------
warnings.forEach((w) => console.warn(w));

if (errors.length > 0) {
  console.error('\n[FAIL] 数据格式校验未通过，共', errors.length, '个错误：');
  errors.slice(0, 50).forEach((e) => console.error('  ' + e));
  if (errors.length > 50) console.error('  ... 其余 ' + (errors.length - 50) + ' 个错误省略');
  process.exit(1);
}

console.log(`[PASS] 数据格式校验通过：dishes=${(dishes || []).length} 条，ingredients=${(ingredients || []).length} 条，tools=${(tools || []).length} 条`);
if (warnings.length) console.log(`（${warnings.length} 条 warning 不阻断 CI，建议处理）`);
process.exit(0);
//（注：内容由AI生成）
