const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 收藏集合：{ openid, dishId }。权限为“仅创建者及管理员可读写”，
// 客户端一律通过本云函数读写。
// action:
//   - list   : 返回当前用户收藏的 dishId 数组 { ok:true, data:[dishId...], count }
//   - toggle : 切换收藏状态，返回 { ok:true, favorited, dishId }
//   - check  : 查询是否已收藏，返回 { ok:true, favorited }
function cleanDishId(value) {
  return String(value || '').trim();
}

async function getCollectRecords(openid) {
  const result = await db
    .collection('collect')
    .where({ openid })
    .limit(1000)
    .get();
  return result.data || [];
}

exports.main = async (event = {}) => {
  const action = String(event.action || 'list');
  const dishId = cleanDishId(event.dishId);
  const { OPENID } = cloud.getWXContext();

  if (!OPENID) {
    return { ok: false, code: 'NO_OPENID', message: '无法获取用户身份' };
  }

  if (action === 'list') {
    const records = await getCollectRecords(OPENID);
    const data = records.map((record) => String(record.dishId || '')).filter(Boolean);
    return { ok: true, data, count: data.length };
  }

  if (!dishId) {
    return { ok: false, code: 'INVALID_DISH_ID', message: 'dishId 必填' };
  }

  const existResult = await db
    .collection('collect')
    .where({ openid: OPENID, dishId })
    .limit(1)
    .get();
  const exist = existResult.data && existResult.data[0];

  if (action === 'check') {
    return { ok: true, favorited: Boolean(exist) };
  }

  if (action === 'toggle') {
    if (exist) {
      await db.collection('collect').doc(exist._id).remove();
      return { ok: true, favorited: false, dishId };
    }
    await db.collection('collect').add({
      data: { openid: OPENID, dishId, createdAt: db.serverDate() }
    });
    return { ok: true, favorited: true, dishId };
  }

  return { ok: false, code: 'INVALID_ACTION', message: `未知操作：${action}` };
};
