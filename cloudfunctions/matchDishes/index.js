const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 前端食材 ID -> 可匹配的中文词（本菜名 + 别名）
const INGREDIENT_KEYWORDS = {
  egg: ['鸡蛋', '蛋'],
  tomato: ['番茄', '西红柿'],
  potato: ['土豆', '马铃薯'],
  carrot: ['胡萝卜', '红萝卜'],
  green_pepper: ['青椒', '菜椒'],
  broccoli: ['西兰花'],
  chicken_breast: ['鸡胸肉', '鸡胸'],
  tofu: ['豆腐'],
  lettuce: ['生菜', '球生菜'],
  rice: ['米饭', '大米', '剩饭'],
  shrimp: ['虾仁', '虾'],
  beef: ['牛肉', '牛里脊'],
  mushroom: ['香菇', '蘑菇', '菌菇'],
  cucumber: ['黄瓜'],
  corn: ['玉米', '玉米粒'],
  onion: ['洋葱'],
  garlic: ['大蒜', '蒜'],
  ginger: ['生姜', '姜'],
  scallion: ['小葱', '葱'],
  pork: ['猪肉末', '肉末', '猪肉'],
  chicken_thigh: ['鸡腿肉', '鸡腿'],
  bok_choy: ['小青菜', '青菜', '油菜'],
  eggplant: ['茄子', '长茄'],
  napa_cabbage: ['娃娃菜', '白菜', '小白菜'],
  spinach: ['菠菜'],
  enoki: ['金针菇', '菌菇'],
  pumpkin: ['南瓜'],
  white_radish: ['白萝卜', '萝卜'],
  pork_belly: ['五花肉', '猪五花'],
  chicken_wing: ['鸡翅', '翅中'],
  fish_fillet: ['鱼片', '鱼肉'],
  ham_sausage: ['火腿肠', '火腿', '香肠'],
  noodles: ['面条', '面'],
  vermicelli: ['粉丝', '粉条'],
  millet: ['小米', '小米粥'],
  sweet_potato: ['红薯', '地瓜'],
  dried_chili: ['干辣椒', '辣椒'],
  sichuan_pepper: ['花椒', '麻椒'],
  oyster_sauce: ['蚝油'],
  doubanjiang: ['豆瓣酱', '郫县豆瓣'],
  cabbage: ['白菜', '大白菜'],
  rapeseed_greens: ['油菜', '上海青'],
  youmai: ['油麦菜'],
  celery: ['芹菜'],
  chive: ['韭菜'],
  yam: ['山药'],
  lotus_root: ['莲藕', '藕'],
  long_bean: ['豆角', '豇豆'],
  cauliflower: ['菜花', '花菜'],
  black_fungus: ['木耳', '黑木耳'],
  cilantro: ['香菜', '芫荽'],
  pork_loin: ['里脊肉', '猪里脊'],
  ribs: ['排骨', '猪排骨'],
  pig_trotter: ['猪蹄'],
  lamb: ['羊肉'],
  duck_leg: ['鸭腿'],
  ham: ['火腿'],
  duck_egg: ['鸭蛋'],
  quail_egg: ['鹌鹑蛋'],
  century_egg: ['皮蛋', '松花蛋'],
  salted_duck_egg: ['咸鸭蛋', '咸蛋'],
  soft_tofu: ['嫩豆腐', '内酯豆腐'],
  firm_tofu: ['老豆腐', '北豆腐'],
  tofu_skin: ['千张', '豆皮'],
  tofu_dry: ['豆腐干', '豆干'],
  yuba: ['腐竹'],
  fried_tofu: ['油豆腐'],
  soybean_sprouts: ['黄豆芽'],
  mungbean_sprouts: ['绿豆芽'],
  whole_fish: ['鱼', '整鱼', '鲜鱼'],
  prawn: ['基围虾', '鲜虾'],
  crayfish: ['小龙虾', '龙虾尾'],
  crab: ['大闸蟹', '螃蟹'],
  clam: ['花甲', '蛤蜊'],
  scallop: ['扇贝'],
  oyster: ['生蚝', '牡蛎'],
  squid: ['鱿鱼'],
  kelp: ['海带'],
  seaweed: ['紫菜'],
  flour: ['面粉'],
  mantou: ['馒头'],
  baozi: ['包子'],
  dumpling: ['饺子'],
  rice_noodle: ['米粉'],
  rice_cake: ['年糕'],
  apple: ['苹果'],
  pear: ['梨', '雪梨'],
  banana: ['香蕉'],
  orange: ['橙子'],
  mandarin: ['橘子', '桔子'],
  grapefruit: ['柚子'],
  strawberry: ['草莓'],
  grape: ['葡萄'],
  watermelon: ['西瓜'],
  mango: ['芒果'],
  dragon_fruit: ['火龙果'],
  kiwi: ['猕猴桃', '奇异果'],
  peach: ['桃子'],
  cherry: ['樱桃']
};

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item) : [];
}

// 调料/佐料，不参与主要食材匹配。注意别剔除真正的食材（油豆腐、油麦菜、洋葱等）。
function isSeasoning(name) {
  const text = String(name || '');
  const seasoningTerms = [
    '食用油', '玉米油', '植物油', '猪油', '橄榄油', '菜籽油', '色拉油', '香油', '芝麻油', '麻油', '黄油',
    '生抽', '老抽', '蒸鱼豉油', '酱油', '鱼露', '蚝油', '豆瓣酱', '甜面酱', '黄豆酱', '辣椒酱', '海鲜酱',
    '番茄酱', '豆豉', '盐和黑胡椒', '盐或糖', '食盐', '盐', '鸡精', '味精', '白糖', '红糖', '冰糖', '砂糖', '糖',
    '淀粉', '水淀粉', '生粉', '面包糠',
    '黑胡椒', '白胡椒', '胡椒粉', '花椒油', '花椒粉', '花椒', '麻椒', '干辣椒', '辣椒粉', '辣椒面', '小米辣',
    '剁椒', '泡椒', '孜然粉', '孜然', '五香粉', '咖喱粉', '八角', '桂皮', '香叶',
    '姜', '生姜', '姜片', '姜丝', '姜末', '蒜', '大蒜', '蒜末', '蒜片', '蒜蓉', '蒜泥',
    '葱花', '小葱', '香葱', '大葱', '葱白', '葱丝', '葱段',
    '米醋', '陈醋', '香醋', '白醋', '醋', '料酒', '黄酒',
    '清水', '温水', '热水', '开水', '白开水', '凉水',
    '无糖酸奶', '原味酸奶', '酸奶', '油醋汁', '低脂酱汁', '沙拉酱', '酱汁', '料汁', '黑椒汁', '照烧汁'
  ];
  return seasoningTerms.some((term) => text.indexOf(term) >= 0);
}

// 把用户选的食材 ID 转成中文关键词（兼容直接传中文名的情况）
function resolveIngredientKeywords(ids) {
  const keywords = [];
  ids.forEach((id) => {
    if (INGREDIENT_KEYWORDS[id]) {
      INGREDIENT_KEYWORDS[id].forEach((kw) => keywords.push(kw));
    } else if (/[\u4e00-\u9fa5]/.test(id)) {
      keywords.push(id);
    }
  });
  return keywords;
}

// 一个主要食材名是否被用户已选的中文关键词覆盖
function isCovered(mainName, selectedKeywords) {
  if (!mainName) return false;
  return selectedKeywords.some((kw) => {
    if (mainName === kw) return true;
    if (mainName.length >= 2 && kw.length >= 2) {
      return mainName.indexOf(kw) >= 0 || kw.indexOf(mainName) >= 0;
    }
    return false;
  });
}

// 取菜品的"主要食材"：优先用 mainIngredientIds（转中文），没有则从 ingredients 排除调料推导
function getMainIngredientNames(dish) {
  const mainIds = asStringArray(dish.mainIngredientIds);
  if (mainIds.length) {
    const names = [];
    mainIds.forEach((id) => {
      if (INGREDIENT_KEYWORDS[id]) {
        // 主要食材取第一个（本菜名），避免别名造成误匹配
        names.push(INGREDIENT_KEYWORDS[id][0]);
      } else if (/[\u4e00-\u9fa5]/.test(id)) {
        names.push(id);
      }
    });
    if (names.length) return names;
  }
  return (Array.isArray(dish.ingredients) ? dish.ingredients : [])
    .map((item) => (typeof item === 'string' ? item : item && item.name))
    .filter((name) => typeof name === 'string' && name && !isSeasoning(name));
}

function toolsMatch(dishTools, selectedToolIds) {
  if (!Array.isArray(dishTools) || dishTools.length === 0) return true;
  return dishTools.every((tool) => {
    if (!tool) return true;
    return selectedToolIds.some((sel) => {
      if (!sel) return false;
      if (tool === sel) return true;
      if (tool.length >= 2 && sel.length >= 2) {
        return tool.indexOf(sel) >= 0 || sel.indexOf(tool) >= 0;
      }
      return false;
    });
  });
}

function taboosMatch(dishTaboos, selectedTabooIds) {
  if (!Array.isArray(dishTaboos) || dishTaboos.length === 0) return true;
  return !dishTaboos.some((taboo) => taboo && selectedTabooIds.indexOf(taboo) >= 0);
}

function matchesDish(dish, selectedIngredientIds, selectedToolIds, selectedTabooIds) {
  const selectedKeywords = resolveIngredientKeywords(selectedIngredientIds);
  const mainNames = getMainIngredientNames(dish);
  const mainCovered = mainNames.length === 0 || mainNames.every((name) => isCovered(name, selectedKeywords));
  return mainCovered
    && toolsMatch(dish.tools, selectedToolIds)
    && taboosMatch(dish.taboos, selectedTabooIds);
}

function projectDish(dish) {
  return {
    _id: dish._id,
    name: dish.name,
    cover: dish.cover,
    totalTime: dish.totalTime,
    tags: dish.tags || [],
    tools: dish.tools || [],
    taboos: dish.taboos || [],
    mainIngredientIds: asStringArray(dish.mainIngredientIds),
    mainIngredients: getMainIngredientNames(dish)
  };
}

exports.matchesDish = matchesDish;
exports.main = async (event = {}) => {
  const selectedIngredientIds = asStringArray(event.selectedIngredientIds || event.ingredients);
  const selectedToolIds = asStringArray(event.selectedToolIds || event.tools);
  const selectedTabooIds = asStringArray(event.selectedTabooIds || event.taboos);

  const result = await db.collection('dishes').where({ auditStatus: 1 }).limit(100).get();
  const dishes = result.data
    .filter((dish) => matchesDish(dish, selectedIngredientIds, selectedToolIds, selectedTabooIds))
    .map(projectDish);

  return {
    ok: true,
    data: dishes
  };
};