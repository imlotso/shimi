const { recipes, fatPlan } = require('../../utils/data');
const { getPageHeroRecipe } = require('../../utils/hero');
const { getRecipesByIds } = require('../../utils/recommender');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');

const goals = [
  { id: 'balanced', name: '稳稳吃', copy: '蔬菜、蛋白和热量都照顾到', mark: '01', metric: '均衡' },
  { id: 'satiety', name: '抗饿蛋白', copy: '鸡胸、牛肉、虾仁优先上桌', mark: '02', metric: '饱腹' },
  { id: 'light', name: '轻晚餐', copy: '晚餐热量低一点，睡前没负担', mark: '03', metric: '低卡' },
  { id: 'soup', name: '热汤轻负担', copy: '想喝点热乎的，也不乱来', mark: '04', metric: '暖胃' }
];

function buildGoalRecipes(goal) {
  let list = recipes.filter((item) => item.fatLoss);
  if (goal === 'satiety') {
    list = list.filter((item) => item.protein >= 28);
  }
  if (goal === 'light') {
    list = list.filter((item) => item.calories <= 320);
  }
  if (goal === 'soup') {
    list = list.filter((item) => /汤|炖|煲/.test(item.category) || /汤|炖|煲/.test(item.name));
  }
  return list.slice(0, 6);
}

function buildPlan() {
  return fatPlan.map((day) => {
    const dayRecipes = getRecipesByIds(day.recipeIds);
    const calories = dayRecipes.reduce((sum, item) => sum + item.calories, 0);
    const protein = dayRecipes.reduce((sum, item) => sum + item.protein, 0);
    return {
      ...day,
      recipes: dayRecipes,
      calories,
      protein
    };
  });
}

Page({
  data: {
    heroRecipe: null,
    goals,
    activeGoal: 'balanced',
    goalRecipes: buildGoalRecipes('balanced'),
    plan: buildPlan()
  },

  onLoad() {
    enableShareMenu();
    this.setData({
      heroRecipe: getPageHeroRecipe('fatloss', { fatOnly: true })
    });
  },

  setGoal(event) {
    const activeGoal = event.currentTarget.dataset.id;
    this.setData({
      activeGoal,
      goalRecipes: buildGoalRecipes(activeGoal)
    });
  },

  openRecipe(event) {
    wx.navigateTo({
      url: `/packages/detail/detail/detail?id=${event.currentTarget.dataset.id}`
    });
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '减脂也要吃得像样，今晚有谱给你排轻食',
      path: '/pages/fatloss/fatloss'
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：减脂轻食也能好好吃',
      path: '/pages/fatloss/fatloss'
    });
  }
});
