/**
 * 生成审核联调数据，不连接云端、不读取管理员 openid。
 * 用法：node scripts/prepare-audit-fixtures.js --export-json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { dishes } = require('./seed-dishes.js');

function cloneDish(source, id, auditStatus, rejectReason) {
  return {
    ...source,
    _id: id,
    name: `${source.name}（审核联调）`,
    openid: '__audit_fixture__',
    auditStatus,
    ...(rejectReason ? { rejectReason } : {})
  };
}

const template = dishes[0];
if (!template) throw new Error('没有可用的菜谱模板');

const fixtures = [
  cloneDish(template, 'audit-fixture-pending', 0),
  cloneDish(template, 'audit-fixture-rejected', 2, '审核联调：用于验证驳回原因展示')
];

module.exports = { fixtures };

if (require.main === module) {
  const output = path.join(__dirname, '.generated', 'audit-fixtures.json');
  if (!process.argv.includes('--export-json')) {
    console.log('[audit-fixtures] 准备完成，共', fixtures.length, '条');
    console.log('[audit-fixtures] 加 --export-json 生成云开发控制台可导入的 JSON Lines 文件');
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  const jsonl = fixtures.map((item) => JSON.stringify(item)).join('\n') + '\n';
  fs.writeFileSync(output, jsonl, 'utf8');
  console.log('[audit-fixtures] 已写出', path.relative(process.cwd(), output));
  console.log('[audit-fixtures] 导入 dishes 集合后，可分别用 audit-fixture-pending 和 audit-fixture-rejected 联调审核流程。');
}
