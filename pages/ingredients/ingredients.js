const { ingredientCategories, ingredients } = require('../../utils/data');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

function matchIngredient(item, keyword) {
  if (!keyword) return true;
  const text = [item.name].concat(item.aliases || []).join(' ').toLowerCase();
  return text.indexOf(keyword.toLowerCase()) >= 0;
}

Page({
  data: {
    categories: ingredientCategories,
    activeCategory: 'common',
    query: '',
    selectedIds: [],
    selectedIngredients: [],
    visibleIngredients: []
  },

  onLoad() {
    enableShareMenu();
    this.refreshIngredients();
  },

  refreshIngredients() {
    const { activeCategory, query, selectedIds } = this.data;
    const visible = ingredients
      .filter((item) => {
        if (query) return matchIngredient(item, query);
        if (activeCategory === 'common') return item.common;
        return item.category === activeCategory;
      })
      .map((item) => ({
        ...item,
        selected: selectedIds.indexOf(item.id) >= 0
      }));

    const selectedIngredients = selectedIds
      .map((id) => ingredients.find((item) => item.id === id))
      .filter(Boolean);

    this.setData({
      visibleIngredients: visible,
      selectedIngredients
    });
  },

  switchCategory(event) {
    this.setData({
      activeCategory: event.currentTarget.dataset.id,
      query: ''
    }, () => this.refreshIngredients());
  },

  onSearchInput(event) {
    this.setData({
      query: event.detail.value
    }, () => this.refreshIngredients());
  },

  clearSearch() {
    this.setData({
      query: ''
    }, () => this.refreshIngredients());
  },

  toggleIngredient(event) {
    const id = event.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.slice();
    const index = selectedIds.indexOf(id);
    if (index >= 0) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(id);
    }
    this.setData({ selectedIds }, () => this.refreshIngredients());
  },

  removeSelected(event) {
    const id = event.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.filter((item) => item !== id);
    this.setData({ selectedIds }, () => this.refreshIngredients());
  },

  clearSelected() {
    this.setData({
      selectedIds: []
    }, () => this.refreshIngredients());
  },

  goRecommendations() {
    if (!this.data.selectedIds.length) {
      wx.showToast({
        title: '先选几样食材',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/recommendations/recommendations?ids=${this.data.selectedIds.join(',')}`
    });
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '打开冰箱点几样食材，今晚吃什么就有谱了',
      path: '/pages/ingredients/ingredients'
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：按食材配一餐',
      path: '/pages/ingredients/ingredients'
    });
  }
});
