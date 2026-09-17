const { ingredients, toolList, tabooList } = require('../../utils/data');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

const PAGE_SIZE = 6;

function parseIds(value) {
  let decoded = String(value || '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch (error) {
    console.warn('推荐参数解码失败', error);
  }
  return decoded
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

function normalizeNames(ids, catalog) {
  return ids.map((id) => {
    const item = catalog.find((entry) => entry.id === id || entry.name === id);
    return item ? item.name : id;
  });
}

function getSelectedIngredients(ids) {
  return ids.map((id) => ingredients.find((item) => item.id === id)).filter(Boolean);
}

function withDisplayFields(dish) {
  const main = dish.mainIngredients || [];
  const id = dish._id || dish.id;
  return {
    ...dish,
    id,
    image: dish.cover || dish.image,
    time: dish.totalTime || dish.time || 0,
    subtitle: main.length ? `主食材：${main.join('、')}` : '',
    category: (dish.tags || [])[0] || '菜谱',
    missingText: main.length
      ? `已用上 ${main.join('、')}`
      : '主食材已齐',
    matchText: main.length ? '已命中主食材' : '今日灵感',
    reason: main.length ? `用上 ${main.join('、')} 做这道菜` : '不挑食材，今晚也能直接开饭'
  };
}

function getNoticeText(selectedIds, recommendations) {
  if (!selectedIds.length || recommendations.length >= 3) return '';
  if (!recommendations.length) return '暂时没有真正命中这些食材的菜，建议换一个常见主食材一起选。';
  return '这里只展示真正用到已选食材的菜，不会用无关菜凑数量。';
}

Page({
  data: {
    selectedIds: [],
    selectedToolIds: [],
    selectedTabooIds: [],
    selectedTools: [],
    selectedTaboos: [],
    selectedIngredients: [],
    allRecommendations: [],
    recommendations: [],
    offset: 0,
    topRecipe: null,
    canShuffle: false,
    noticeText: '',
    loading: false,
    loadFailed: false
  },

  onLoad(options) {
    enableShareMenu();
    const selectedIds = parseIds(options.ids);
    const selectedToolIds = parseIds(options.tools);
    const selectedTabooIds = parseIds(options.taboos);
    const selectedTools = normalizeNames(selectedToolIds, toolList);
    const selectedTaboos = normalizeNames(selectedTabooIds, tabooList);
    this.setData({
      selectedIds,
      selectedToolIds,
      selectedTabooIds,
      selectedTools,
      selectedTaboos,
      selectedIngredients: getSelectedIngredients(selectedIds),
      allRecommendations: [],
      recommendations: [],
      topRecipe: null,
      canShuffle: false,
      noticeText: '',
      loading: true,
      loadFailed: false
    });
    this.fetchRecommendations(selectedIds, selectedTools, selectedTaboos);
  },

  fetchRecommendations(selectedIds, selectedToolIds, selectedTabooIds) {
    if (!wx.cloud || !wx.cloud.callFunction) {
      this.setData({ loading: false, loadFailed: true });
      return;
    }
    wx.cloud.callFunction({
      name: 'matchDishes',
      data: {
        selectedIngredientIds: selectedIds,
        selectedToolIds,
        selectedTabooIds
      }
    }).then((res) => {
      const data = (res.result && res.result.data) || [];
      const allRecommendations = data.map(withDisplayFields);
      this.setData({
        allRecommendations,
        recommendations: allRecommendations.slice(0, PAGE_SIZE),
        topRecipe: allRecommendations[0] || null,
        canShuffle: allRecommendations.length > PAGE_SIZE,
        noticeText: getNoticeText(selectedIds, allRecommendations),
        loading: false
      });
    }).catch((error) => {
      console.error('matchDishes 失败', error);
      this.setData({ loading: false, loadFailed: true });
    });
  },

  shuffleRecipes() {
    const all = this.data.allRecommendations;
    if (!all.length) return;
    const offset = (this.data.offset + 3) % all.length;
    const looped = all.concat(all);
    this.setData({
      offset,
      recommendations: looped.slice(offset, offset + Math.min(PAGE_SIZE, all.length)),
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
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/detail/detail/detail?dishId=${encodeURIComponent(id)}`
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
