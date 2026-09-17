/**
 * UGC / 审核 前端对接工具集（投稿 submitDish + 审核 auditDish）
 * 约定：
 *  - submitDish action: add / update / listMine / delete
 *  - auditDish action: checkAdmin / listPending / approve / reject
 *  - 封面文件走 wx.cloud.uploadFile，路径统一为 dishes/cover_<timestamp>.<ext>
 */

function ensureCloud() {
  if (!wx.cloud || !wx.cloud.callFunction) {
    throw new Error('cloud unavailable');
  }
}

function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    ensureCloud();
    wx.cloud.callFunction({ name, data }).then((res) => {
      const result = res && res.result;
      if (!result || !result.ok) {
        reject(new Error((result && result.message) || '云函数调用失败'));
        return;
      }
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
  });
}

/**
 * submitDish 封装
 * payload: { action, ...其它字段 }
 * add/update 传入 name/totalTime/tags/cover/tools/taboos/ingredients/steps
 * update 需带 _id，delete 需带 _id
 */
function submitDish(payload) {
  return callFunction('submitDish', payload);
}

/**
 * auditDish 封装
 * payload: { action, ... }
 * reject 需带 _id 与 reason
 */
function auditDish(payload) {
  return callFunction('auditDish', payload);
}

/**
 * 上传菜品封面
 * tempFilePath: wx.chooseMedia 得到的本地临时路径
 * 返回 fileID；路径 dishes/cover_<timestamp>.<ext>
 */
function uploadCover(tempFilePath) {
  return new Promise((resolve, reject) => {
    ensureCloud();
    const match = /\.([a-zA-Z0-9]+)$/.exec(tempFilePath || '');
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const cloudPath = `dishes/cover_${Date.now()}.${ext}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    }).then((res) => {
      resolve(res.fileID);
    }).catch(reject);
  });
}

module.exports = {
  submitDish,
  auditDish,
  uploadCover
};