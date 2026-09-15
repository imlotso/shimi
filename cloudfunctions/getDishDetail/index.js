const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

function getAdminOpenids() {
  return String(process.env.ADMIN_OPENIDS || '')
    .split(',')
    .map((openid) => openid.trim())
    .filter(Boolean);
}

function canViewDish(dish, openid, adminOpenids) {
  return dish.auditStatus === 1
    || Boolean(openid && dish.openid === openid)
    || adminOpenids.includes(openid);
}

exports.canViewDish = canViewDish;
exports.main = async (event = {}) => {
  const dishId = typeof event.dishId === 'string' ? event.dishId.trim() : '';
  if (!dishId) {
    return { ok: false, code: 'INVALID_DISH_ID', message: 'dishId 必填' };
  }

  const { OPENID } = cloud.getWXContext();
  const result = await db.collection('dishes').doc(dishId).get().catch((error) => {
    if (error.errCode === -1 || error.errCode === 1105) return null;
    throw error;
  });
  const dish = result && result.data;

  if (!dish || !canViewDish(dish, OPENID, getAdminOpenids())) {
    return { ok: false, code: 'DISH_NOT_FOUND', message: '菜品不存在或无权查看' };
  }

  return { ok: true, data: dish };
};
