const { ingredients } = require('../../../utils/data');
const { recommendRecipes, getRecipeById } = require('../../../utils/recommender');
const { addHistory, isFavorite, toggleFavorite } = require('../../../utils/storage');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../../utils/share');

const seasoningImageRules = [
  { keywords: ['食用油', '少量油', '底油', '油'], image: '/assets/images/ingredients/seasonings/oil.jpg' },
  { keywords: ['黑胡椒', '白胡椒', '胡椒'], image: '/assets/images/ingredients/seasonings/black_pepper.jpg' },
  { keywords: ['盐'], image: '/assets/images/ingredients/seasonings/salt.jpg' },
  { keywords: ['糖'], image: '/assets/images/ingredients/seasonings/sugar.jpg' },
  { keywords: ['生抽', '老抽', '酱油'], image: '/assets/images/ingredients/seasonings/soy_sauce.jpg' },
  { keywords: ['淀粉水', '淀粉'], image: '/assets/images/ingredients/seasonings/starch.jpg' },
  { keywords: ['米醋', '香醋', '油醋汁', '醋'], image: '/assets/images/ingredients/seasonings/vinegar.jpg' },
  { keywords: ['温水', '热水', '清水', '水'], image: '/assets/images/ingredients/seasonings/water.jpg' },
  { keywords: ['酱汁'], image: '/assets/images/ingredients/seasonings/soy_sauce.jpg' }
];

function getDifficultyText(level) {
  if (level <= 1) return '1 星 · 很适合新手';
  if (level === 2) return '2 星 · 稍微看火';
  return '3 星 · 需要耐心';
}

function getSeasoningImage(text) {
  const rule = seasoningImageRules.find((item) =>
    item.keywords.some((keyword) => text.indexOf(keyword) >= 0)
  );
  return rule ? rule.image : '';
}

function getIngredientMatch(text) {
  const ingredient = ingredients.find((item) => {
    if (text.indexOf(item.name) >= 0 || item.name.indexOf(text) >= 0) {
      return true;
    }
    return (item.aliases || []).some((alias) => text.indexOf(alias) >= 0 || alias.indexOf(text) >= 0);
  });

  return ingredient || null;
}

function getIngredientImage(name) {
  const text = String(name || '');
  const seasoningImage = getSeasoningImage(text);
  if (seasoningImage) return seasoningImage;

  const ingredient = getIngredientMatch(text);
  return ingredient ? ingredient.image : '';
}

function getMainIngredientImages(recipe) {
  return (recipe.ingredientIds || recipe.mainIngredientIds || [])
    .map((id) => ingredients.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => item.image);
}

function getStepAction(text, index, total) {
  if (index === total - 1) return 'final';
  if (/泡软|泡发|浸泡|吐沙|洗|切|剥|去皮|处理|划|腌|备好|撕|掰|拍/.test(text)) return 'prep';
  if (/打散|搅|蛋液|面糊|抓匀|调成|调汁|酱汁/.test(text)) return 'mix';
  if (/蒸|上锅|盖上|保鲜膜|蒸锅/.test(text)) return 'steam';
  if (/焯水|冷水下锅|水开.*捞|煮开.*捞/.test(text)) return 'blanch';
  if (/煮|炖|焖|汤|粥|加水|热水|清水|电饭锅|水开/.test(text)) return 'pot';
  if (/拌|淋|调汁|沙拉|酸奶|放入碗|盘中|碗中|冷藏/.test(text)) return 'mix';
  if (/炒香|爆香|煸香|蒜末|姜片|葱段/.test(text)) return 'aromatic';
  if (/调味|生抽|老抽|盐|糖|醋|蚝油|酱|淋/.test(text)) return 'seasoning';
  if (/锅|炒|煎|煸|炸|收汁|倒入|翻炒|油/.test(text)) return 'pan';
  return index === 0 ? 'prep' : 'pan';
}

function getRecipeStageType(recipe) {
  const ids = recipe.ingredientIds || recipe.mainIngredientIds || [];
  const text = `${recipe.name} ${(recipe.ingredients || []).map((item) => item.name).join(' ')}`;
  if (ids.some((id) => ['shrimp', 'fish_fillet', 'whole_fish', 'squid', 'clam', 'scallop', 'oyster', 'crayfish'].includes(id)) || /鱼|虾|鱿鱼|花甲|扇贝|生蚝|海鲜/.test(text)) {
    return 'seafood';
  }
  if (ids.some((id) => ['pork', 'pork_belly', 'pork_loin', 'pig_trotter', 'beef', 'lamb', 'chicken_breast', 'chicken_thigh', 'chicken_wing', 'duck_leg'].includes(id)) || /肉|牛|羊|鸡|鸭|猪蹄|排骨|五花/.test(text)) {
    return 'meat';
  }
  if (ids.some((id) => ['egg', 'duck_egg', 'quail_egg', 'salted_duck_egg', 'century_egg'].includes(id)) || /蛋/.test(text)) {
    return 'egg';
  }
  return 'vegetable';
}

function getFallbackStepImage(recipe, action) {
  const type = getRecipeStageType(recipe);
  const base = '/packages/detail/assets/images/step-library';

  if (action === 'mix' && type === 'egg') return `${base}/mix-egg.jpg`;
  if (action === 'prep' && type === 'egg') return `${base}/mix-egg.jpg`;
  if ((action === 'pan' || action === 'aromatic' || action === 'seasoning') && type === 'egg') return `${base}/pan-egg.jpg`;
  if (action === 'blanch' && type === 'seafood') return `${base}/blanch-seafood.jpg`;

  const normalized = action === 'steam' ? 'pot' : action === 'seasoning' ? 'pan' : action === 'mix' ? 'prep' : action;
  const key = ['prep', 'aromatic', 'pan', 'pot'].includes(normalized) ? normalized : 'pan';
  const typed = type === 'egg' ? 'vegetable' : type;
  return `${base}/${key}-${typed}.jpg`;
}

const recipeStepImageOverrides = {
  'braised-trotter': [
    '/packages/detail/assets/images/step-custom/braised-trotter/step-1.jpg',
    '/packages/detail/assets/images/step-custom/braised-trotter/step-2.jpg',
    '/packages/detail/assets/images/step-custom/braised-trotter/step-3.jpg',
    '/packages/detail/assets/images/step-custom/braised-trotter/step-4.jpg',
    '/packages/detail/assets/images/step-custom/braised-trotter/step-5.jpg'
  ],
  'carrot-beef-stew': [
    '/packages/detail/assets/images/step-custom/carrot-beef-stew/step-1.jpg',
    '/packages/detail/assets/images/step-custom/carrot-beef-stew/step-2.jpg',
    '/packages/detail/assets/images/step-custom/carrot-beef-stew/step-3.jpg',
    '/packages/detail/assets/images/step-custom/carrot-beef-stew/step-4.jpg',
    '/packages/detail/assets/images/step-custom/carrot-beef-stew/step-5.jpg'
  ],
  'tomato-egg': [
    '/packages/detail/assets/images/step-custom/tomato-egg/step-1.jpg',
    '/packages/detail/assets/images/step-custom/tomato-egg/step-2.jpg',
    '/packages/detail/assets/images/step-custom/tomato-egg/step-3.jpg',
    '/packages/detail/assets/images/step-custom/tomato-egg/step-4.jpg',
    '/packages/detail/assets/images/step-custom/tomato-egg/step-5.jpg'
  ],
  'clam-vermicelli-pot': [
    '/packages/detail/assets/images/step-custom/clam-vermicelli-pot/step-1.jpg',
    '/packages/detail/assets/images/step-custom/clam-vermicelli-pot/step-2.jpg',
    '/packages/detail/assets/images/step-custom/clam-vermicelli-pot/step-3.jpg',
    '/packages/detail/assets/images/step-custom/clam-vermicelli-pot/step-4.jpg',
    '/packages/detail/assets/images/step-custom/clam-vermicelli-pot/step-5.jpg'
  ],
  'napa-vermicelli-pot': [
    '/packages/detail/assets/images/step-custom/napa-vermicelli-pot/step-1.jpg',
    '/packages/detail/assets/images/step-custom/napa-vermicelli-pot/step-2.jpg',
    '/packages/detail/assets/images/step-custom/napa-vermicelli-pot/step-3.jpg',
    '/packages/detail/assets/images/step-custom/napa-vermicelli-pot/step-4.jpg',
    '/packages/detail/assets/images/step-custom/napa-vermicelli-pot/step-5.jpg'
  ],
  'squid-green-pepper': [
    '/packages/detail/assets/images/step-custom/squid-green-pepper/step-1.jpg',
    '/packages/detail/assets/images/step-custom/squid-green-pepper/step-2.jpg',
    '/packages/detail/assets/images/step-custom/squid-green-pepper/step-3.jpg',
    '/packages/detail/assets/images/step-custom/squid-green-pepper/step-4.jpg',
    '/packages/detail/assets/images/step-custom/squid-green-pepper/step-5.jpg'
  ]
};

function getStepImage(text, recipe, action, index, total) {
  const overrideImages = recipeStepImageOverrides[recipe.id];
  if (overrideImages && overrideImages[index]) return overrideImages[index];
  if (index === total - 1 || action === 'final') return recipe.image;
  return getFallbackStepImage(recipe, action);
}

function decorateRecipe(recipe) {
  const mainImages = getMainIngredientImages(recipe);
  const fallbackImage = mainImages[0] || recipe.image;
  const decoratedIngredients = recipe.ingredients.map((item, index) => ({
    ...item,
    image: getIngredientImage(item.name) || recipe.image || fallbackImage
  }));
  const decoratedSteps = recipe.steps.map((text, index) => {
    const action = getStepAction(text, index, recipe.steps.length);
    return {
      id: `step-${index + 1}`,
      text,
      action,
      actionClass: `step-scene-${action}`,
      image: getStepImage(text, recipe, action, index, recipe.steps.length)
    };
  });

  return {
    ...recipe,
    decoratedIngredients,
    decoratedSteps,
    difficultyText: getDifficultyText(recipe.difficulty)
  };
}

Page({
  data: {
    recipe: null,
    loadFailed: false,
    isFavorite: false,
    relatedRecipes: []
  },

  onLoad(options) {
    enableShareMenu();
    const recipe = getRecipeById(options.id);
    if (!recipe) {
      this.setData({
        loadFailed: true
      });
      wx.showToast({
        title: '菜谱不存在',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 600);
      return;
    }

    addHistory(recipe.id);
    const relatedRecipes = recommendRecipes(recipe.mainIngredientIds, 4)
      .filter((item) => item.id !== recipe.id)
      .slice(0, 3);

    this.setData({
      recipe: decorateRecipe(recipe),
      isFavorite: isFavorite(recipe.id),
      relatedRecipes
    });
  },

  toggleFavorite() {
    const recipe = this.data.recipe;
    const next = toggleFavorite(recipe.id);
    this.setData({
      isFavorite: next
    });
    wx.showToast({
      title: next ? '已收藏' : '已取消',
      icon: 'none'
    });
  },

  openRecipe(event) {
    wx.redirectTo({
      url: `/packages/detail/detail/detail?id=${event.currentTarget.dataset.id}`
    });
  },

  onShareAppMessage() {
    const recipe = this.data.recipe;
    if (!recipe) return getDefaultShare();
    return getDefaultShare({
      title: `今晚有谱：${recipe.name}，照着做不慌`,
      path: `/packages/detail/detail/detail?id=${recipe.id}`,
      imageUrl: recipe.image
    });
  },

  onShareTimeline() {
    const recipe = this.data.recipe;
    if (!recipe) return getTimelineShare();
    return getTimelineShare({
      title: `今晚有谱：${recipe.name}`,
      path: `/packages/detail/detail/detail?id=${recipe.id}`,
      imageUrl: recipe.image
    });
  }
});
