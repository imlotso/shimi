const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const ACTIONS = new Set(['add', 'remove', 'check', 'list']);

function validateEvent(event = {}) {
  const action = typeof event.action === 'string' ? event.action.trim() : '';
  if (!ACTIONS.has(action)) return { ok: false, code: 'INVALID_ACTION', message: 'action 必须是 add、remove、check 或 list' };
  if (action !== 'list') {
    const dishId = typeof event.dishId === 'string' ? event.dishId.trim() : '';
    if (!dishId) return { ok: false, code: 'INVALID_DISH_ID', message: 'dishId 必填' };
    return { ok: true, action, dishId };
  }
  return { ok: true, action };
}

function collectQuery(openid, dishId) {
  return { openid, dishId };
}

function cardFromDish(dish, collect) {
  return {
    _id: dish._id,
    name: dish.name,
    cover: dish.cover,
    totalTime: dish.totalTime,
    tags: dish.tags || [],
    collectId: collect._id
  };
}

exports.validateEvent = validateEvent;
exports.collectQuery = collectQuery;
exports.main = async (event = {}) => {
  const input = validateEvent(event);
  if (!input.ok) return input;

  const { OPENID } = cloud.getWXContext();
  if (!OPENID) return { ok: false, code: 'UNAUTHENTICATED', message: '无法识别当前用户' };

  try {
    if (input.action === 'list') {
      const collects = (await db.collection('collect').where({ openid: OPENID }).get()).data;
      const cards = [];
      for (const collect of collects) {
        const result = await db.collection('dishes').where({ _id: collect.dishId, auditStatus: 1 }).limit(1).get();
        if (result.data.length) cards.push(cardFromDish(result.data[0], collect));
      }
      return { ok: true, data: cards };
    }

    const query = collectQuery(OPENID, input.dishId);
    if (input.action === 'check') {
      const result = await db.collection('collect').where(query).limit(1).get();
      return { ok: true, data: { isCollected: result.data.length > 0 } };
    }

    if (input.action === 'add') {
      const dish = await db.collection('dishes').where({ _id: input.dishId, auditStatus: 1 }).limit(1).get();
      if (!dish.data.length) return { ok: false, code: 'DISH_NOT_FOUND', message: '菜品不存在或未发布' };
      const existing = await db.collection('collect').where(query).limit(1).get();
      if (existing.data.length) return { ok: true, data: { isCollected: true, created: false } };
      const result = await db.collection('collect').add({ data: query });
      return { ok: true, data: { isCollected: true, created: true, collectId: result._id } };
    }

    const result = await db.collection('collect').where(query).remove();
    return { ok: true, data: { isCollected: false, removed: result.stats.removed > 0 } };
  } catch (error) {
    return { ok: false, code: 'COLLECT_OPERATION_FAILED', message: '收藏操作失败' };
  }
};
