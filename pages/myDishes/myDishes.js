const { submitDish } = require('../../utils/ugc');

const STATUS_MAP = {
  0: { label: '待审核', type: 'pending' },
  1: { label: '已发布', type: 'published' },
  2: { label: '已驳回', type: 'rejected' }
};

function decorate(dish) {
  const status = dish.auditStatus;
  const meta = STATUS_MAP[status] || { label: '未知', type: 'pending' };
  return {
    ...dish,
    id: dish._id,
    image: dish.cover || dish.image || '',
    time: dish.totalTime || 0,
    tags: Array.isArray(dish.tags) ? dish.tags : [],
    statusLabel: meta.label,
    statusType: meta.type
  };
}

Page({
  data: {
    dishes: [],
    loading: true,
    loadFailed: false
  },

  onShow() {
    this.loadMine();
  },

  loadMine() {
    if (!wx.cloud || !wx.cloud.callFunction) {
      this.setData({ loading: false, loadFailed: true });
      return;
    }
    this.setData({ loading: true, loadFailed: false });
    submitDish({ action: 'listMine' }).then((result) => {
      const list = Array.isArray(result.data) ? result.data : [];
      this.setData({ dishes: list.map(decorate) });
    }).catch((error) => {
      console.warn('我的投稿读取失败', error);
      this.setData({ loadFailed: true });
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  goEdit(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dishUpload/dishUpload?dishId=${encodeURIComponent(id)}`
    });
  },

  goPreview(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/detail/detail/detail?dishId=${encodeURIComponent(id)}`
    });
  },

  confirmDelete(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '删除投稿',
      content: '删除后不可恢复，确定要删除这道菜吗？',
      confirmText: '删除',
      confirmColor: '#bd573c',
      success: (res) => {
        if (res.confirm) {
          this.deleteDish(id);
        }
      }
    });
  },

  deleteDish(id) {
    wx.showLoading({ title: '删除中', mask: true });
    submitDish({ action: 'delete', dishId: id }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '已删除', icon: 'none' });
      this.loadMine();
    }).catch((error) => {
      wx.hideLoading();
      wx.showToast({
        title: (error && error.message) || '删除失败',
        icon: 'none'
      });
    });
  }
});