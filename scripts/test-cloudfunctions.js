const assert = require('assert');
const { matchesDish } = require('../cloudfunctions/matchDishes');
const { canViewDish } = require('../cloudfunctions/getDishDetail');
const { validateEvent, collectQuery } = require('../cloudfunctions/manageCollect');

// 数据库实际结构：无 mainIngredientIds，靠 ingredients 中文名 + 调料过滤推断主要食材
const tomatoEgg = {
  name: '番茄炒蛋',
  ingredients: [
    { name: '番茄', num: '2 个' },
    { name: '鸡蛋', num: '2 个' },
    { name: '小葱', num: '1 根' },
    { name: '食用油', num: '1 汤匙' },
    { name: '盐', num: '少量' }
  ],
  tools: ['炒锅'],
  taboos: []
};

// 主要食材：番茄 + 鸡蛋（小葱/油/盐是调料，不参与）
assert.strictEqual(matchesDish(tomatoEgg, ['tomato', 'egg'], ['炒锅'], []), true);
// 纯忌口模式：食材和厨具为空时，只执行忌口过滤
assert.strictEqual(matchesDish(tomatoEgg, [], [], []), true);
assert.strictEqual(matchesDish({ ...tomatoEgg, taboos: ['花生'] }, [], [], ['花生']), false);
// 缺鸡蛋不命中
assert.strictEqual(matchesDish(tomatoEgg, ['tomato'], ['炒锅'], []), false);
// 缺主要食材不命中
assert.strictEqual(matchesDish(tomatoEgg, ['tomato'], ['炒锅'], []), false);
// 纯忌口兼容：未提供厨具筛选时不限制厨具
assert.strictEqual(matchesDish(tomatoEgg, ['tomato', 'egg'], [], []), true);
// 提供不匹配的厨具时不命中
assert.strictEqual(matchesDish(tomatoEgg, ['tomato', 'egg'], ['蒸锅'], []), false);
// 菜品声明忌口且用户选择相同忌口时不命中
assert.strictEqual(matchesDish({ ...tomatoEgg, taboos: ['花生'] }, ['tomato', 'egg'], ['炒锅'], ['花生']), false);
// 菜品未声明忌口时，用户忌口不影响匹配
assert.strictEqual(matchesDish(tomatoEgg, ['tomato', 'egg'], ['炒锅'], ['花生']), true);
// tools 为空时不受厨具限制
assert.strictEqual(matchesDish({ ...tomatoEgg, tools: [] }, ['tomato', 'egg'], [], []), true);
// 别名匹配：西红柿、蛋
assert.strictEqual(matchesDish(tomatoEgg, ['tomato'], ['炒锅'], []), false);
assert.strictEqual(matchesDish(tomatoEgg, ['tomato', 'egg'], ['炒锅'], []), true);

// 详情可见性
assert.strictEqual(canViewDish({ auditStatus: 1 }, 'user-a', []), true);
assert.strictEqual(canViewDish({ auditStatus: 0, openid: 'user-a' }, 'user-a', []), true);
assert.strictEqual(canViewDish({ auditStatus: 0, openid: 'user-a' }, 'user-b', []), false);
assert.strictEqual(canViewDish({ auditStatus: 2, openid: 'user-a' }, 'admin-a', ['admin-a']), true);

// 收藏参数和用户隔离条件
assert.strictEqual(validateEvent({ action: 'list' }).ok, true);
assert.strictEqual(validateEvent({ action: 'unknown' }).code, 'INVALID_ACTION');
assert.strictEqual(validateEvent({ action: 'add' }).code, 'INVALID_DISH_ID');
assert.deepStrictEqual(collectQuery('user-a', 'dish-1'), { openid: 'user-a', dishId: 'dish-1' });

console.log('cloud function rule tests passed');
