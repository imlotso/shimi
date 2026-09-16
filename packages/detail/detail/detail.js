const { ingredients } = require('../../../utils/data');
const { addHistory, isFavorite, toggleLocalFavorite } = require('../../../utils/storage');
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

function getIngredientImage(name, fallbackImage) {
  const text = String(name || '');
  const seasoningImage = getSeasoningImage(text);
  if (seasoningImage) return seasoningImage;
  const ingredient = getIngredientMatch(text);
  return (ingredient && ingredient.image) || fallbackImage || '';
}

function getMainIngredientImage(dish) {
  const names = Array.isArray(dish.mainIngredientIds) ? dish.mainIngredientIds : [];
  const matched = names.length ? ingredients.find((item) => item.id === names[0]) : null;
  return (matched && matched.image) || dish.cover || '';
}

function withDisplayFields(dish) {
  const main = dish.mainIngredients || [];
  const fallbackImage = getMainIngredientImage(dish) || dish.cover;
  const decoratedIngredients = (Array.isArray(dish.ingredients) ? dish.ingredients : [])
    .map((item) => {
      const name = typeof item === 'string' ? item : item.name;
      const num = typeof item === 'string' ? '' : item.num || item.amount || '';
      return {
        name,
        amount: num,
        image: getIngredientImage(name, fallbackImage)
      };
    })
    .filter((item) => item.name);
  const steps = Array.isArray(dish.steps) ? dish.steps : [];
  const decoratedSteps = steps.map((step, index) => {
    const text = typeof step === 'string' ? step : step.desc || step.text || '';
    const action = getStepAction(text, index, steps.length);
    return {
      id: `step-${index + 1}`,
      text,
      time: typeof step === 'string' ? '' : (step.time || ''),
      action,
      actionClass: `step-scene-${action}`,
      image: index === steps.length - 1 ? dish.cover : ''
    };
  });

  return {
    ...dish,
    image: dish.cover,
    time: dish.totalTime || dish.time || 0,
    subtitle: '',
    difficulty: 1,
    calories: '',
    protein: '',
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
    decoratedIngredients,
    decoratedSteps,
    difficultyText: '照着步骤做就行'
  };
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

function copyDishForRelated(dish) {
  return {
    ...dish,
    image: dish.cover,
    time: dish.totalTime || dish.time || 0,
    tags: dish.tags || [],
    reason: '相似灵感'
  };
}

function callCollect(action, dishId) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud || !wx.cloud.callFunction) {
      reject(new Error('cloud unavailable'));
      return;
    }
      wx.cloud.callFunction({
        name: 'manageCollect',
        data: {
          action,
          dishId
        }
      }).then((res) => {
        if (!res.result || !res.result.ok) {
          reject(new Error((res.result && res.result.message) || '收藏操作失败'));
          return;
        }
        resolve(res.result);
      }).catch(reject);
  });
}

Page({
  data: {
    dishId: '',
    recipe: null,
    loadFailed: false,
    isFavorite: false,
    relatedRecipes: []
  },

  onLoad(options) {
    enableShareMenu();
    const dishId = String(options.dishId || options.id || '').trim();
    this.setData({ dishId });

    if (!dishId) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: '菜谱不存在',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 600);
      return;
    }

    const canUseCloud = Boolean(wx.cloud && wx.cloud.callFunction);
    if (!canUseCloud) {
      this.setData({
        recipe: null,
        isFavorite: false,
        loadFailed: true
      });
      wx.showToast({
        title: '云开发不可用',
        icon: 'none'
      });
      return;
    }

    // 记录本地历史（兼容旧版本地菜谱）
    try {
      addHistory(dishId);
    } catch (error) {
      console.warn('addHistory 失败', error);
    }

    Promise.all([
      wx.cloud.callFunction({ name: 'getDishDetail', data: { dishId } }),
      callCollect('check', dishId).catch(() => ({ favorited: false }))
    ]).then(([detailRes, collectRes]) => {
      const dish = detailRes.result && detailRes.result.ok ? detailRes.result.data : null;
      if (!dish) {
        this.setData({ loadFailed: true });
        wx.showToast({
          title: '菜谱不存在',
          icon: 'none'
        });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      const favorited = Boolean(collectRes.favorited || (collectRes.data && collectRes.data.isCollected));
      try {
        if (favorited !== isFavorite(dishId)) toggleLocalFavorite(dishId, favorited);
      } catch (error) {
        console.warn('同步本地收藏状态失败', error);
      }
      this.setData({
        recipe: withDisplayFields(dish),
        isFavorite: favorited
      });
      this.loadRelated(dishId);
    }).catch((error) => {
      console.error('加载菜谱详情失败', error);
      this.setData({ loadFailed: true });
    });
  },

  loadRelated(currentId) {
    if (!wx.cloud || !wx.cloud.callFunction) return;
    wx.cloud.callFunction({
      name: 'matchDishes',
      data: { selectedIngredientIds: [], selectedToolIds: [], selectedTabooIds: [] }
    }).then((res) => {
      const all = (res.result && res.result.data) || [];
      const related = all
        .filter((item) => (item._id || item.id) !== currentId)
        .slice(0, 3)
        .map(copyDishForRelated);
      this.setData({ relatedRecipes: related });
    }).catch((error) => {
      console.warn('加载相似灵感失败', error);
    });
  },

  toggleFavorite() {
    const dishId = this.data.dishId;
    const current = this.data.isFavorite;
    callCollect(current ? 'remove' : 'add', dishId).then((res) => {
      const favorited = res.data && typeof res.data.isCollected === 'boolean'
        ? res.data.isCollected
        : !current;
      try {
        toggleLocalFavorite(dishId, favorited);
      } catch (error) {
        console.warn('同步本地收藏状态失败', error);
      }
      this.setData({ isFavorite: favorited });
      wx.showToast({
        title: favorited ? '已收藏' : '已取消',
        icon: 'none'
      });
    }).catch((error) => {
      console.warn('收藏操作失败', error);
      wx.showToast({
        title: '收藏失败，请重试',
        icon: 'none'
      });
      // 本地回退：避免与云端不同步
      this.setData({ isFavorite: current });
    });
  },

  openRecipe(event) {
    const id = event.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/packages/detail/detail/detail?dishId=${encodeURIComponent(id)}`
    });
  },

  onShareAppMessage() {
    const recipe = this.data.recipe;
    if (!recipe) return getDefaultShare();
    return getDefaultShare({
      title: `今晚有谱：${recipe.name}，照着做不慌`,
      path: `/packages/detail/detail/detail?dishId=${encodeURIComponent(this.data.dishId)}`,
      imageUrl: recipe.image
    });
  },

  onShareTimeline() {
    const recipe = this.data.recipe;
    if (!recipe) return getTimelineShare();
    return getTimelineShare({
      title: `今晚有谱：${recipe.name}`,
      path: `/packages/detail/detail/detail?dishId=${encodeURIComponent(this.data.dishId)}`,
      imageUrl: recipe.image
    });
  }
});