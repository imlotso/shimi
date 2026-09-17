const { auditDish } = require('../../utils/ugc');

function decorate(dish) {
  return {
    ...dish,
    id: dish._id,
    image: dish.cover || dish.image || '',
    time: dish.totalTime || 0,
    tagsText: (Array.isArray(dish.tags) ? dish.tags : []).join('、'),
    rejecting: false,
    rejectReason: ''
  };
}

Page({
  data: {
    isAdmin: false,
    checked: false,
    loading: true,
    loadFailed: false,
    dishes: []
  },

  onShow() {
    this.checkAdmin();
  },

  checkAdmin() {
    if (!wx.cloud || !wx.cloud.callFunction) {
      this.setData({ checked: true, isAdmin: false });
      return;
    }
    auditDish({ action: 'checkAdmin' }).then((result) => {
      const isAdmin = Boolean(result.data && (result.data.isAdmin || result.data.admin));
      this.setData({ checked: true, isAdmin });
      if (isAdmin) {
        this.loadPending();
      }
    }).catch((error) => {
      console.warn('管理员身份检查失败', error);
      this.setData({ checked: true, isAdmin: false });
    });
  },

  loadPending() {
    this.setData({ loading: true, loadFailed: false });
    auditDish({ action: 'listPending' }).then((result) => {
      const list = Array.isArray(result.data) ? result.data : [];
      this.setData({ dishes: list.map(decorate) });
    }).catch((error) => {
      console.warn('待审核列表读取失败', error);
      this.setData({ loadFailed: true });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goPreview(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/detail/detail/detail?dishId=${encodeURIComponent(id)}`
    });
  },

  startReject(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({
      [`dishes[${this.findIndex(id)}].rejecting`]: true
    });
  },

  cancelReject(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({
      [`dishes[${this.findIndex(id)}].rejecting`]: false,
      [`dishes[${this.findIndex(id)}].rejectReason`]: ''
    });
  },

  onRejectReasonInput(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ [`dishes[${this.findIndex(id)}].rejectReason`]: event.detail.value });
  },

  findIndex(id) {
    return this.data.dishes.findIndex((item) => item.id === id);
  },

  approve(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '通过审核',
      content: '通过后该菜谱会对所有用户可见，确定通过吗？',
      confirmText: '通过',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中', mask: true });
        auditDish({ action: 'approve', dishId: id }).then(() => {
          wx.hideLoading();
          wx.showToast({ title: '已通过', icon: 'success' });
          this.loadPending();
        }).catch((error) => {
          wx.hideLoading();
          wx.showToast({
            title: (error && error.message) || '操作失败',
            icon: 'none'
          });
        });
      }
    });
  },

  reject(event) {
    const id = event.currentTarget.dataset.id;
    const index = this.findIndex(id);
    const reason = (this.data.dishes[index] && this.data.dishes[index].rejectReason || '').trim();
    if (!reason) {
      wx.showToast({ title: '请填写驳回原因', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '处理中', mask: true });
    auditDish({ action: 'reject', dishId: id, reason }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '已驳回', icon: 'none' });
      this.loadPending();
    }).catch((error) => {
      wx.hideLoading();
      wx.showToast({
        title: (error && error.message) || '操作失败',
        icon: 'none'
      });
    });
  }
});