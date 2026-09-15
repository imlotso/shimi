const { recipes } = require('../../utils/data');
const { getPageHeroRecipe } = require('../../utils/hero');
const { getCommonIngredients, recommendRecipes } = require('../../utils/recommender');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');
const showcaseBuckets = [
  (recipe) => !recipe.fatLoss && /肉|牛|鸡|猪|虾|鱼|翅|五花/.test(recipe.name + recipe.category),
  (recipe) => recipe.fatLoss,
  (recipe) => /素菜|豆腐|菌菇|青菜|生菜|茄子|菠菜|娃娃菜/.test(recipe.name + recipe.category + recipe.tags.join(' ')),
  (recipe) => /主食|汤|炖|煲|粥|饭|面/.test(recipe.name + recipe.category)
];
function randomize(list) {
  const copied = list.slice();
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    const temp = copied[index];
    copied[index] = copied[target];
    copied[target] = temp;
  }
  return copied;
}
function getHomeShowcaseRecipes() {
  const picked = [];
  showcaseBuckets.forEach((match) => {
    const pool = randomize(recipes.filter((recipe) => match(recipe) && picked.indexOf(recipe) < 0));
    if (pool[0]) picked.push(pool[0]);
  });
  const fallback = randomize(recipes.filter((recipe) => picked.indexOf(recipe) < 0));
  while (picked.length < 4 && fallback.length) {
    picked.push(fallback.shift());
  }
  return randomize(picked).slice(0, 4);
}
function decorateIngredients(selectedIds) {
  return getCommonIngredients(16).map((item) => ({
    ...item,
    selected: selectedIds.indexOf(item.id) >= 0
  }));
}
function toIngredientColumns(list) {
  const columns = [];
  for (let index = 0; index < list.length; index += 2) {
    columns.push({
      id: `col-${index}`,
      items: list.slice(index, index + 2)
    });
  }
  return columns;
}
Page({
  data: {
    heroRecipe: null,
    selectedIds: [],
    quickIngredients: decorateIngredients([]),
    quickIngredientColumns: toIngredientColumns(decorateIngredients([])),
    hotRecipes: getHomeShowcaseRecipes(),
    fatRecipes: recipes.filter((item) => item.fatLoss).slice(0, 3),
    searchText: ''
  },
  onLoad() {
    enableShareMenu();
    this.setData({
      heroRecipe: getPageHeroRecipe('home')
    });
  },
  onShow() {
    this.setData({
      heroRecipe: this.data.heroRecipe || getPageHeroRecipe('home'),
      hotRecipes: getHomeShowcaseRecipes()
    });
  },
  onSearchInput(event) {
    this.setData({
      searchText: event.detail.value
    });
  },
  goSearch() {
    const keyword = this.data.searchText.trim();
    if (keyword) {
      wx.setStorageSync('yp_search_seed', keyword);
    }
    wx.switchTab({
      url: '/pages/search/search'
    });
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
    this.setData({
      selectedIds,
      quickIngredients: decorateIngredients(selectedIds),
      quickIngredientColumns: toIngredientColumns(decorateIngredients(selectedIds))
    });
  },
  goIngredients() {
    wx.navigateTo({
      url: '/pages/ingredients/ingredients'
    });
  },
  goRecommendations() {
    const ids = this.data.selectedIds.join(',');
    if (!ids) {
      this.goIngredients();
      return;
    }
    wx.navigateTo({
      url: `/pages/recommendations/recommendations?ids=${ids}`
    });
  },
  // 新增：跳转忌口选择普通页面，非tab页面，使用wx.navigateTo
  goTaboo(){
    wx.navigateTo({
      url: '/pages/tabooSelect/tabooSelect'
    })
  },
  goFatLoss() {
    wx.switchTab({
      url: '/pages/fatloss/fatloss'
    });
  },
  openRecipe(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/detail/detail/detail?id=${id}`
    });
  },
  onShareAppMessage() {
    return getDefaultShare();
  },
  onShareTimeline() {
    return getTimelineShare();
  }
});
