const { getRecipesByIds } = require('../../utils/recommender');
const { getFavoriteIds, getHistoryIds } = require('../../utils/storage');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

const FEEDBACK_MAX_LENGTH = 300;
const FEEDBACK_MIN_LENGTH = 4;

function projectDish(dish) {
  return {
    ...dish,
    id: dish._id || dish.id,
    image: dish.cover || dish.image,
    time: dish.totalTime || dish.time || 0,
    name: dish.name,
    calories: '',
    protein: ''
  };
}

function listCollect() {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !wx.cloud.callFunction) {
      reject(new Error('cloud unavailable'));
      return;
    }
    wx.cloud.callFunction({
      name: 'manageCollect',
      data: { action: 'list' }
    }).then((res) => {
      if (!res.result || !res.result.ok) {
        reject(new Error((res.result && res.result.message) || '收藏读取失败'));
        return;
      }
      resolve(res.result.data || []);
    }).catch(reject);
  });
}

Page({
  data: {
    favorites: [],
    history: [],
    feedbackText: '',
    feedbackCount: 0,
    feedbackSubmitting: false,
    feedbackMessage: '',
    feedbackMessageType: ''
  },

  onLoad() {
    enableShareMenu();
  },

  onShow() {
    this.setData({
      history: getRecipesByIds(getHistoryIds()).slice(0, 6)
    });
    this.loadFavorites();
  },

  loadFavorites() {
    // 优先从云数据库 collect 集合拉取收藏；云不可用时回退到本地历史收藏
    const fallback = () => {
      const local = getRecipesByIds(getFavoriteIds()).map(projectDish);
      this.setData({ favorites: local });
    };

    listCollect().then((collectCards) => {
      const cards = Array.isArray(collectCards) ? collectCards : [];
      const favorites = cards
        .map(projectDish)
        .filter((dish) => dish.id);
      this.setData({ favorites });
    }).catch((error) => {
      console.warn('拉取云端收藏失败，使用本地收藏', error);
      fallback();
    });
  },

  goIngredients() {
    wx.navigateTo({
      url: '/pages/ingredients/ingredients'
    });
  },

  goFatLoss() {
    wx.switchTab({
      url: '/pages/fatloss/fatloss'
    });
  },

  onFeedbackInput(event) {
    const value = (event.detail.value || '').slice(0, FEEDBACK_MAX_LENGTH);
    this.setData({
      feedbackText: value,
      feedbackCount: value.length,
      feedbackMessage: '',
      feedbackMessageType: ''
    });
  },

  submitFeedback() {
    const content = this.data.feedbackText.trim();

    if (content.length < FEEDBACK_MIN_LENGTH) {
      wx.showToast({
        title: '再多写一点点',
        icon: 'none'
      });
      return;
    }

    if (!wx.cloud || !wx.cloud.callFunction) {
      this.saveFeedbackDraft(content, '当前环境未开通云开发');
      return;
    }

    this.setData({
      feedbackSubmitting: true,
      feedbackMessage: '',
      feedbackMessageType: ''
    });

    wx.cloud.callFunction({
      name: 'submitFeedback',
      data: {
        content,
        source: 'profile'
      }
    }).then((res) => {
      if (!res.result || !res.result.ok) {
        throw new Error((res.result && res.result.message) || '反馈提交失败');
      }

      this.setData({
        feedbackText: '',
        feedbackCount: 0,
        feedbackMessage: '已收到，我们会认真看每一条反馈。',
        feedbackMessageType: 'success'
      });
      wx.showToast({
        title: '反馈已发送',
        icon: 'success'
      });
    }).catch((error) => {
      this.saveFeedbackDraft(content, error.message || '网络异常');
    }).finally(() => {
      this.setData({
        feedbackSubmitting: false
      });
    });
  },

  saveFeedbackDraft(content, reason) {
    const drafts = wx.getStorageSync('yp_feedback_drafts') || [];
    drafts.unshift({
      content,
      reason,
      createdAt: Date.now()
    });
    wx.setStorageSync('yp_feedback_drafts', drafts.slice(0, 10));

    this.setData({
      feedbackMessage: '暂时没发出去，已先存在本机，稍后可再提交。',
      feedbackMessageType: 'error',
      feedbackSubmitting: false
    });
    wx.showModal({
      title: '反馈已暂存',
      content: '云开发配置完成后，再点一次提交就能发送给管理员。',
      showCancel: false
    });
  },

  openRecipe(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/detail/detail/detail?dishId=${encodeURIComponent(id)}`
    });
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '今晚有谱：把常做菜、减脂餐和反馈入口都放这里',
      path: '/pages/profile/profile'
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：下班做饭不纠结',
      path: '/pages/profile/profile'
    });
  }
});
