const { getPageHeroRecipe } = require('../../utils/hero');
const { searchRecipes } = require('../../utils/recommender');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

const filters = [
  { id: 'all', name: '全部', copy: '随便看看' },
  { id: 'homestyle', name: '家常下饭', copy: '米饭搭子' },
  { id: 'fresh', name: '清爽轻口', copy: '低油不腻' },
  { id: 'sour', name: '酸甜开胃', copy: '番茄系灵感' },
  { id: 'pepper', name: '椒香锅气', copy: '青椒蒜香' },
  { id: 'soup', name: '热汤慢炖', copy: '暖胃一碗' },
  { id: 'staple', name: '主食救场', copy: '饭面碳水' },
  { id: 'veggie', name: '素菜也香', copy: '绿叶豆腐' },
  { id: 'meat', name: '肉肉满足', copy: '牛鸡虾猪' },
  { id: 'tofu', name: '豆腐菌菇', copy: '温和鲜香' }
];

Page({
  data: {
    keyword: '',
    heroRecipe: null,
    filters,
    activeFilter: 'all',
    results: []
  },

  onLoad() {
    enableShareMenu();
    this.setData({
      heroRecipe: getPageHeroRecipe('search')
    });
    this.refresh();
  },

  onShow() {
    if (!this.data.heroRecipe) {
      this.setData({
        heroRecipe: getPageHeroRecipe('search')
      });
    }
    const seed = wx.getStorageSync('yp_search_seed');
    if (seed) {
      wx.removeStorageSync('yp_search_seed');
      this.setData({
        keyword: seed
      }, () => this.refresh());
      return;
    }
    this.refresh();
  },

  refresh() {
    this.setData({
      results: searchRecipes(this.data.keyword, this.data.activeFilter)
    });
  },

  onInput(event) {
    this.setData({
      keyword: event.detail.value
    }, () => this.refresh());
  },

  clearKeyword() {
    this.setData({
      keyword: ''
    }, () => this.refresh());
  },

  setFilter(event) {
    this.setData({
      activeFilter: event.currentTarget.dataset.id
    }, () => this.refresh());
  },

  openRecipe(event) {
    wx.navigateTo({
      url: `/packages/detail/detail/detail?id=${event.currentTarget.dataset.id}`
    });
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '今晚不知道吃什么？这里有一份下班菜谱库',
      path: '/pages/search/search'
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：下班菜谱库',
      path: '/pages/search/search'
    });
  }
});
