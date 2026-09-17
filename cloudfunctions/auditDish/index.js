const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const ACTIONS = new Set(['approve', 'reject']);

function getAdminOpenids() {
  return String(process.env.ADMIN_OPENIDS || '')
    .split(',')
    .map((openid) => openid.trim())
    .filter(Boolean);
}

function validateEvent(event = {}) {
  const action = typeof event.action === 'string' ? event.action.trim() : '';
  const dishId = typeof event.dishId === 'string' ? event.dishId.trim() : '';
  const reason = typeof event.reason === 'string' ? event.reason.trim() : '';
  if (!ACTIONS.has(action)) {
    return { ok: false, code: 'INVALID_ACTION', message: 'action 必须是 approve 或 reject' };
  }
  if (!dishId) return { ok: false, code: 'INVALID_DISH_ID', message: 'dishId 必填' };
  if (action === 'reject' && !reason) {
    return { ok: false, code: 'INVALID_REASON', message: '驳回时 reason 必填' };
  }
  return { ok: true, action, dishId, reason };
}

function nextDishPatch(input) {
  if (input.action === 'approve') return { auditStatus: 1, rejectReason: null };
  return { auditStatus: 2, rejectReason: input.reason };
}

function auditLogDoc(input, dishId, adminOpenid) {
  return {
    dishId,
    adminOpenid,
    action: input.action,
    reason: input.reason || ''
  };
}

exports.getAdminOpenids = getAdminOpenids;
exports.validateEvent = validateEvent;
exports.nextDishPatch = nextDishPatch;
exports.auditLogDoc = auditLogDoc;
exports.main = async (event = {}) => {
  const input = validateEvent(event);
  if (!input.ok) return input;

  const { OPENID } = cloud.getWXContext();
  if (!OPENID || !getAdminOpenids().includes(OPENID)) {
    return { ok: false, code: 'FORBIDDEN', message: '仅管理员可审核菜品' };
  }

  try {
    const dishResult = await db.collection('dishes').doc(input.dishId).get();
    if (!dishResult.data) {
      return { ok: false, code: 'DISH_NOT_FOUND', message: '菜品不存在' };
    }

    const patch = nextDishPatch(input);
    await db.collection('dishes').doc(input.dishId).update({ data: patch });
    const logResult = await db.collection('audit_log').add({
      data: auditLogDoc(input, input.dishId, OPENID)
    });

    return {
      ok: true,
      data: { dishId: input.dishId, auditStatus: patch.auditStatus, auditLogId: logResult._id }
    };
  } catch (error) {
    return { ok: false, code: 'AUDIT_OPERATION_FAILED', message: '审核操作失败' };
  }
};
