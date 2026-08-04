const { ingredients } = require('../../utils/data');
const { recommendRecipes } = require('../../utils/recommender');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

function parseIds(options) {
  return String(options.ids || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function getSelectedIngredients(ids) {
  return ids.map((id) => ingredients.find((item) => item.id === id)).filter(Boolean);
}

function withDisplayFields(list) {
  return list.map((item) => ({
    ...item,
    missingText: item.missingMainNames && item.missingMainNames.length
      ? `再补：${item.missingMainNames.join('、')}`
      : '主食材已齐',
    matchText: item.matchCount ? `命中 ${item.matchCount} 种` : '今日灵感'
  }));
}

function getNoticeText(selectedIds, recommendations) {
  if (!selectedIds.length || recommendations.length >= 3) return '';
  if (!recommendations.length) return '暂时没有真正命中这些食材的菜，建议换一个常见主食材一起选。';
  return '这里只展示真正用到已选食材的菜，不会用无关菜凑数量。';
}

Page({
  data: {
    selectedIds: [],
    selectedIngredients: [],
    allRecommendations: [],
    recommendations: [],
    offset: 0,
    topRecipe: null,
    canShuffle: false,
    noticeText: ''
  },

  onLoad(options) {
    enableShareMenu();
    const selectedIds = parseIds(options);
    const allRecommendations = withDisplayFields(recommendRecipes(selectedIds));
    this.setData({
      selectedIds,
      selectedIngredients: getSelectedIngredients(selectedIds),
      allRecommendations,
      recommendations: allRecommendations.slice(0, 6),
      topRecipe: allRecommendations[0] || null,
      canShuffle: allRecommendations.length > 6,
      noticeText: getNoticeText(selectedIds, allRecommendations)
    });
  },

  shuffleRecipes() {
    const all = this.data.allRecommendations;
    if (!all.length) return;
    const offset = (this.data.offset + 3) % all.length;
    const looped = all.concat(all);
    this.setData({
      offset,
      recommendations: looped.slice(offset, offset + Math.min(6, all.length)),
      topRecipe: looped[offset],
      noticeText: getNoticeText(this.data.selectedIds, all)
    });
  },

  reselectIngredients() {
    wx.navigateBack({
      delta: 1
    });
  },

  openRecipe(event) {
    wx.navigateTo({
      url: `/packages/detail/detail/detail?id=${event.currentTarget.dataset.id}`
    });
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '我用今晚有谱配了一组晚餐，你也试试',
      path: `/pages/recommendations/recommendations?ids=${this.data.selectedIds.join(',')}`
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：按现有食材推荐晚餐',
      path: `/pages/recommendations/recommendations?ids=${this.data.selectedIds.join(',')}`
    });
  }
});
