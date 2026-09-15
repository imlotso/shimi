const catalogExtra = require('./catalog-extra');

const ingredientCategories = [
  { id: 'common', name: '常用' },
  { id: 'vegetable', name: '蔬菜' },
  { id: 'protein', name: '肉蛋豆' },
  { id: 'seafood', name: '海鲜水产' },
  { id: 'staple', name: '主食' },
  { id: 'fruit', name: '水果' },
  { id: 'seasoning', name: '调味' },
  { id: 'tool', name: '厨具' },
  { id: 'taboo', name: '忌口排除' }
];


const ingredients = [
  { id: 'egg', name: '鸡蛋', category: 'protein', common: true, image: '/assets/images/ingredients/egg.jpg', aliases: ['蛋'] },
  { id: 'tomato', name: '番茄', category: 'vegetable', common: true, image: '/assets/images/ingredients/tomato.jpg', aliases: ['西红柿'] },
  { id: 'potato', name: '土豆', category: 'vegetable', common: true, image: '/assets/images/ingredients/potato.jpg', aliases: ['马铃薯'] },
  { id: 'carrot', name: '胡萝卜', category: 'vegetable', common: true, image: '/assets/images/ingredients/carrot.jpg', aliases: ['红萝卜'] },
  { id: 'green_pepper', name: '青椒', category: 'vegetable', common: true, image: '/assets/images/ingredients/green_pepper.jpg', aliases: ['菜椒'] },
  { id: 'broccoli', name: '西兰花', category: 'vegetable', common: true, image: '/assets/images/ingredients/broccoli.jpg', aliases: [] },
  { id: 'chicken_breast', name: '鸡胸肉', category: 'protein', common: true, image: '/assets/images/ingredients/chicken_breast.jpg', aliases: ['鸡胸'] },
  { id: 'tofu', name: '豆腐', category: 'protein', common: true, image: '/assets/images/ingredients/tofu.jpg', aliases: [] },
  { id: 'lettuce', name: '生菜', category: 'vegetable', common: true, image: '/assets/images/ingredients/lettuce.jpg', aliases: ['球生菜'] },
  { id: 'rice', name: '米饭', category: 'staple', common: true, image: '/assets/images/ingredients/rice.jpg', aliases: ['大米', '剩饭'] },
  { id: 'shrimp', name: '虾仁', category: 'protein', common: false, image: '/assets/images/ingredients/shrimp.jpg', aliases: ['虾'] },
  { id: 'beef', name: '牛肉', category: 'protein', common: false, image: '/assets/images/ingredients/beef.jpg', aliases: ['牛里脊'] },
  { id: 'mushroom', name: '香菇', category: 'vegetable', common: false, image: '/assets/images/ingredients/mushroom.jpg', aliases: ['蘑菇', '菌菇'] },
  { id: 'cucumber', name: '黄瓜', category: 'vegetable', common: false, image: '/assets/images/ingredients/cucumber.jpg', aliases: [] },
  { id: 'corn', name: '玉米', category: 'staple', common: false, image: '/assets/images/ingredients/corn.jpg', aliases: ['玉米粒'] },
  { id: 'onion', name: '洋葱', category: 'vegetable', common: false, image: '/assets/images/ingredients/onion.jpg', aliases: [] },
  { id: 'garlic', name: '大蒜', category: 'seasoning', common: false, image: '/assets/images/ingredients/garlic.jpg', aliases: ['蒜'] },
  { id: 'ginger', name: '生姜', category: 'seasoning', common: false, image: '/assets/images/ingredients/ginger.jpg', aliases: ['姜'] },
  { id: 'scallion', name: '小葱', category: 'seasoning', common: false, image: '/assets/images/ingredients/scallion.jpg', aliases: ['葱'] },
  { id: 'pork', name: '猪肉末', category: 'protein', common: false, image: '/assets/images/ingredients/pork.jpg', aliases: ['肉末', '猪肉'] },
  { id: 'chicken_thigh', name: '鸡腿肉', category: 'protein', common: false, image: '/assets/images/ingredients/chicken_thigh.jpg', aliases: ['鸡腿'] },
  { id: 'bok_choy', name: '小青菜', category: 'vegetable', common: false, image: '/assets/images/ingredients/bok_choy.jpg', aliases: ['青菜', '油菜'] },
  { id: 'eggplant', name: '茄子', category: 'vegetable', common: true, image: '/assets/images/ingredients/eggplant.jpg', aliases: ['长茄'] },
  { id: 'napa_cabbage', name: '娃娃菜', category: 'vegetable', common: true, image: '/assets/images/ingredients/napa_cabbage.jpg', aliases: ['白菜', '小白菜'] },
  { id: 'spinach', name: '菠菜', category: 'vegetable', common: true, image: '/assets/images/ingredients/spinach.jpg', aliases: [] },
  { id: 'enoki', name: '金针菇', category: 'vegetable', common: true, image: '/assets/images/ingredients/enoki.jpg', aliases: ['菌菇'] },
  { id: 'pumpkin', name: '南瓜', category: 'vegetable', common: false, image: '/assets/images/ingredients/pumpkin.jpg', aliases: [] },
  { id: 'white_radish', name: '白萝卜', category: 'vegetable', common: false, image: '/assets/images/ingredients/white_radish.jpg', aliases: ['萝卜'] },
  { id: 'pork_belly', name: '五花肉', category: 'protein', common: false, image: '/assets/images/ingredients/pork_belly.jpg', aliases: ['猪五花'] },
  { id: 'chicken_wing', name: '鸡翅', category: 'protein', common: true, image: '/assets/images/ingredients/chicken_wing.jpg', aliases: ['翅中'] },
  { id: 'fish_fillet', name: '鱼片', category: 'protein', common: true, image: '/assets/images/ingredients/fish_fillet.jpg', aliases: ['鱼肉'] },
  { id: 'ham_sausage', name: '火腿肠', category: 'protein', common: false, image: '/assets/images/ingredients/ham_sausage.jpg', aliases: ['火腿', '香肠'] },
  { id: 'noodles', name: '面条', category: 'staple', common: true, image: '/assets/images/ingredients/noodles.jpg', aliases: ['面'] },
  { id: 'vermicelli', name: '粉丝', category: 'staple', common: false, image: '/assets/images/ingredients/vermicelli.jpg', aliases: ['粉条'] },
  { id: 'millet', name: '小米', category: 'staple', common: false, image: '/assets/images/ingredients/millet.jpg', aliases: ['小米粥'] },
  { id: 'sweet_potato', name: '红薯', category: 'staple', common: false, image: '/assets/images/ingredients/sweet_potato.jpg', aliases: ['地瓜'] },
  { id: 'dried_chili', name: '干辣椒', category: 'seasoning', common: false, image: '/assets/images/ingredients/dried_chili.jpg', aliases: ['辣椒'] },
  { id: 'sichuan_pepper', name: '花椒', category: 'seasoning', common: false, image: '/assets/images/ingredients/sichuan_pepper.jpg', aliases: ['麻椒'] },
  { id: 'oyster_sauce', name: '蚝油', category: 'seasoning', common: false, image: '/assets/images/ingredients/oyster_sauce.jpg', aliases: [] },
  { id: 'doubanjiang', name: '豆瓣酱', category: 'seasoning', common: false, image: '/assets/images/ingredients/doubanjiang.jpg', aliases: ['郫县豆瓣'] }
  
];
// 厨具
const toolList = [
  { id: 'wok', name: '炒锅', image: '/assets/images/tools/wok.png' },
  { id: 'rice_cooker', name: '电饭煲', image: '/assets/images/tools/rice_cooker.png' },
  { id: 'air_fryer', name: '空气炸锅', image: '/assets/images/tools/air_fryer.png' }
];

// 忌口
const tabooList = [
  { id: 'spicy', name: '不吃辣', image: '/assets/images/taboos/spicy.png' },
  { id: 'seafood', name: '不吃海鲜', image: '/assets/images/taboos/seafood.png' }
];

const recipes = [
  {
    id: 'tomato-egg',
    name: '番茄炒蛋',
    subtitle: '酸甜下饭，厨房新手的稳定开局',
    category: '家常快手',
    image: '/assets/images/recipes/tomato-egg.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.9,
    calories: 320,
    protein: 19,
    fatLoss: false,
    tags: ['快手菜', '新手友好', '下饭'],
    mainIngredientIds: ['tomato', 'egg'],
    ingredientIds: ['tomato', 'egg', 'scallion'],
    ingredients: [
      { name: '番茄', amount: '2 个' },
      { name: '鸡蛋', amount: '2 个' },
      { name: '小葱', amount: '1 根，可不放' },
      { name: '食用油', amount: '约 1 汤匙' },
      { name: '盐', amount: '1/3 小勺' },
      { name: '糖', amount: '1/2 小勺，可选' }
    ],
    steps: [
      '番茄洗净切块，鸡蛋打入碗中，加一点点盐搅散。',
      '锅烧热后倒油，倒入蛋液，刚凝固时用铲子推成大块，盛出备用。',
      '锅里留少量油，放入番茄块，中火翻炒到出汁。',
      '倒回鸡蛋，加盐调味；喜欢酸甜口可以加少量糖。',
      '翻炒 30 秒让鸡蛋裹上番茄汁，撒小葱后出锅。'
    ]
  },
  {
    id: 'green-pepper-potato',
    name: '青椒土豆丝',
    subtitle: '清脆便宜，适合配饭和带饭',
    category: '素菜',
    image: '/assets/images/recipes/green-pepper-potato.jpg',
    time: 18,
    difficulty: 2,
    rating: 4.7,
    calories: 260,
    protein: 5,
    fatLoss: false,
    tags: ['家常菜', '便宜好做', '素菜'],
    mainIngredientIds: ['green_pepper', 'potato'],
    ingredientIds: ['green_pepper', 'potato', 'garlic'],
    ingredients: [
      { name: '土豆', amount: '1 个' },
      { name: '青椒', amount: '1 个' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '食用油', amount: '约 1 汤匙' },
      { name: '盐', amount: '1/3 小勺' },
      { name: '米醋', amount: '1 小勺，可选' }
    ],
    steps: [
      '土豆去皮切细丝，放清水里冲洗两遍，沥干水分。',
      '青椒去籽切丝，大蒜切片或切末。',
      '热锅倒油，先放蒜炒香，再放土豆丝快速翻炒。',
      '土豆丝变得半透明时放青椒丝，继续翻炒 1 到 2 分钟。',
      '加盐调味，喜欢清爽口感可沿锅边淋一点米醋，炒匀出锅。'
    ]
  },
  {
    id: 'broccoli-chicken',
    name: '西兰花炒鸡胸肉',
    subtitle: '高蛋白、低负担，减脂期也能吃饱',
    category: '减脂餐',
    image: '/assets/images/recipes/broccoli-chicken.jpg',
    time: 22,
    difficulty: 2,
    rating: 4.8,
    calories: 330,
    protein: 38,
    fatLoss: true,
    tags: ['高蛋白', '减脂友好', '带饭'],
    mainIngredientIds: ['broccoli', 'chicken_breast'],
    ingredientIds: ['broccoli', 'chicken_breast', 'garlic'],
    ingredients: [
      { name: '鸡胸肉', amount: '180 克' },
      { name: '西兰花', amount: '半颗' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 小勺' },
      { name: '淀粉', amount: '1 小勺' },
      { name: '盐和黑胡椒', amount: '适量' }
    ],
    steps: [
      '鸡胸肉切薄片，加生抽、黑胡椒和淀粉抓匀，腌 8 分钟。',
      '西兰花掰小朵，水开后焯 1 分钟，捞出沥干。',
      '锅中放少量油，放蒜末炒香，再放鸡胸肉片翻炒到变白。',
      '倒入西兰花，加入少量盐，快速翻炒均匀。',
      '鸡肉完全熟透后关火，装盘即可。'
    ]
  },
  {
    id: 'shrimp-steamed-egg',
    name: '虾仁蒸蛋',
    subtitle: '嫩滑清淡，适合晚餐和新手',
    category: '蒸菜',
    image: '/assets/images/recipes/shrimp-steamed-egg.jpg',
    time: 18,
    difficulty: 2,
    rating: 4.8,
    calories: 230,
    protein: 24,
    fatLoss: true,
    tags: ['清淡', '高蛋白', '新手友好'],
    mainIngredientIds: ['shrimp', 'egg'],
    ingredientIds: ['shrimp', 'egg', 'scallion'],
    ingredients: [
      { name: '鸡蛋', amount: '2 个' },
      { name: '虾仁', amount: '8 到 10 只' },
      { name: '温水', amount: '约蛋液 1.5 倍' },
      { name: '盐', amount: '少量' },
      { name: '生抽', amount: '1 小勺' },
      { name: '小葱', amount: '少量，可不放' }
    ],
    steps: [
      '鸡蛋打散，加入少量盐，再加入温水搅匀。',
      '用勺子撇掉表面泡沫，倒入浅碗中。',
      '盖上保鲜膜或盘子，水开后中小火蒸 8 分钟。',
      '放上虾仁，继续蒸 4 到 5 分钟，直到虾仁变色熟透。',
      '出锅后淋少量生抽，撒小葱即可。'
    ]
  },
  {
    id: 'cucumber-tofu-egg',
    name: '黄瓜鸡蛋拌豆腐',
    subtitle: '不开火也能吃到蛋白质',
    category: '轻食',
    image: '/assets/images/recipes/cucumber-tofu-egg.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.6,
    calories: 280,
    protein: 22,
    fatLoss: true,
    tags: ['低油', '清爽', '减脂友好'],
    mainIngredientIds: ['cucumber', 'tofu', 'egg'],
    ingredientIds: ['cucumber', 'tofu', 'egg', 'garlic'],
    ingredients: [
      { name: '黄瓜', amount: '1 根' },
      { name: '嫩豆腐', amount: '半盒' },
      { name: '鸡蛋', amount: '1 到 2 个' },
      { name: '大蒜', amount: '1 瓣，可不放' },
      { name: '生抽', amount: '1 小勺' },
      { name: '香醋', amount: '1 小勺' }
    ],
    steps: [
      '鸡蛋煮熟后剥壳切块，黄瓜洗净拍碎或切片。',
      '嫩豆腐倒掉多余水分，切成大块放入碗中。',
      '把黄瓜和鸡蛋放到豆腐上。',
      '生抽、香醋和蒜末调成料汁，淋到碗里。',
      '轻轻拌匀即可，避免把豆腐搅得太碎。'
    ]
  },
  {
    id: 'chicken-corn-salad',
    name: '鸡胸玉米沙拉',
    subtitle: '清爽高蛋白，适合午餐盒',
    category: '减脂餐',
    image: '/assets/images/recipes/chicken-corn-salad.jpg',
    time: 20,
    difficulty: 2,
    rating: 4.7,
    calories: 360,
    protein: 36,
    fatLoss: true,
    tags: ['高蛋白', '带饭', '少油'],
    mainIngredientIds: ['chicken_breast', 'corn', 'lettuce'],
    ingredientIds: ['chicken_breast', 'corn', 'lettuce', 'cucumber'],
    ingredients: [
      { name: '鸡胸肉', amount: '180 克' },
      { name: '玉米粒', amount: '半碗' },
      { name: '生菜', amount: '一大把' },
      { name: '黄瓜', amount: '半根' },
      { name: '盐和黑胡椒', amount: '适量' },
      { name: '无糖酸奶或油醋汁', amount: '少量，可选' }
    ],
    steps: [
      '鸡胸肉用盐和黑胡椒腌 8 分钟。',
      '平底锅少油煎鸡胸肉，两面煎到熟透后切片。',
      '玉米粒焯熟，生菜洗净沥干，黄瓜切片。',
      '把蔬菜、玉米和鸡胸肉放入碗中。',
      '吃前加少量无糖酸奶或油醋汁，拌匀即可。'
    ]
  },
  {
    id: 'garlic-lettuce',
    name: '蒜蓉生菜',
    subtitle: '三分钟上桌，晚餐补一盘绿叶菜',
    category: '素菜',
    image: '/assets/images/recipes/garlic-lettuce.jpg',
    time: 8,
    difficulty: 1,
    rating: 4.5,
    calories: 120,
    protein: 3,
    fatLoss: true,
    tags: ['快手', '低卡', '素菜'],
    mainIngredientIds: ['lettuce', 'garlic'],
    ingredientIds: ['lettuce', 'garlic'],
    ingredients: [
      { name: '生菜', amount: '1 颗' },
      { name: '大蒜', amount: '3 瓣' },
      { name: '食用油', amount: '少量' },
      { name: '生抽', amount: '1 小勺' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '生菜一片片掰开洗净，沥干水分。',
      '大蒜切末，锅中放少量油，小火炒香蒜末。',
      '转大火放入生菜，快速翻炒。',
      '生菜刚变软时加入生抽和少量盐。',
      '翻匀后马上出锅，保持清脆口感。'
    ]
  },
  {
    id: 'tomato-beef-soup',
    name: '番茄牛肉汤',
    subtitle: '有肉有汤，适合下班后暖一碗',
    category: '汤菜',
    image: '/assets/images/recipes/tomato-beef-soup.jpg',
    time: 28,
    difficulty: 2,
    rating: 4.8,
    calories: 380,
    protein: 32,
    fatLoss: true,
    tags: ['高蛋白', '暖胃', '少油'],
    mainIngredientIds: ['tomato', 'beef'],
    ingredientIds: ['tomato', 'beef', 'ginger', 'scallion'],
    ingredients: [
      { name: '牛肉片', amount: '180 克' },
      { name: '番茄', amount: '2 个' },
      { name: '姜片', amount: '2 片' },
      { name: '小葱', amount: '1 根，可不放' },
      { name: '盐', amount: '适量' },
      { name: '生抽', amount: '1 小勺' }
    ],
    steps: [
      '番茄切块，牛肉片用少量生抽抓匀。',
      '锅中放少量油，放姜片和番茄，中火炒到番茄出汁。',
      '加入一大碗热水，煮开后转中火煮 8 分钟。',
      '放入牛肉片，用筷子拨散，煮到牛肉变色熟透。',
      '加盐调味，撒小葱后出锅。'
    ]
  },
  {
    id: 'mushroom-egg-soup',
    name: '香菇鸡蛋汤',
    subtitle: '鲜味轻汤，适合凑一餐',
    category: '汤菜',
    image: '/assets/images/recipes/mushroom-egg-soup.jpg',
    time: 15,
    difficulty: 1,
    rating: 4.6,
    calories: 180,
    protein: 13,
    fatLoss: true,
    tags: ['低卡', '快手汤', '新手友好'],
    mainIngredientIds: ['mushroom', 'egg'],
    ingredientIds: ['mushroom', 'egg', 'scallion'],
    ingredients: [
      { name: '香菇', amount: '4 到 5 朵' },
      { name: '鸡蛋', amount: '1 个' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '白胡椒粉', amount: '少量，可选' }
    ],
    steps: [
      '香菇洗净切片，鸡蛋打散。',
      '锅中加水烧开，放入香菇片煮 5 分钟。',
      '加入盐和少量白胡椒调味。',
      '保持汤微微沸腾，慢慢倒入蛋液形成蛋花。',
      '撒小葱后关火。'
    ]
  },
  {
    id: 'pan-chicken-veggie',
    name: '香煎鸡胸配时蔬',
    subtitle: '一口锅完成，清爽但不寡淡',
    category: '减脂餐',
    image: '/assets/images/recipes/pan-chicken-veggie.jpg',
    time: 25,
    difficulty: 2,
    rating: 4.8,
    calories: 390,
    protein: 40,
    fatLoss: true,
    tags: ['高蛋白', '一人食', '低油'],
    mainIngredientIds: ['chicken_breast', 'broccoli', 'carrot'],
    ingredientIds: ['chicken_breast', 'broccoli', 'carrot', 'garlic'],
    ingredients: [
      { name: '鸡胸肉', amount: '200 克' },
      { name: '西兰花', amount: '半颗' },
      { name: '胡萝卜', amount: '半根' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '黑胡椒', amount: '适量' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      '鸡胸肉切成两片，用盐和黑胡椒抹匀腌 10 分钟。',
      '西兰花和胡萝卜切小块，焯水 1 分钟后捞出。',
      '平底锅刷少量油，放入鸡胸肉，中小火煎熟。',
      '鸡肉盛出后放蒜末、蔬菜翻炒，加一点盐。',
      '鸡胸肉切条，与蔬菜一起装盘。'
    ]
  },
  {
    id: 'homestyle-tofu',
    name: '家常豆腐',
    subtitle: '外香里嫩，米饭杀手',
    category: '家常菜',
    image: '/assets/images/recipes/homestyle-tofu.jpg',
    time: 24,
    difficulty: 2,
    rating: 4.7,
    calories: 350,
    protein: 18,
    fatLoss: false,
    tags: ['下饭', '豆制品', '家常'],
    mainIngredientIds: ['tofu', 'green_pepper'],
    ingredientIds: ['tofu', 'green_pepper', 'garlic', 'scallion'],
    ingredients: [
      { name: '北豆腐', amount: '1 块' },
      { name: '青椒', amount: '1 个' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '盐', amount: '少量' },
      { name: '淀粉水', amount: '半小碗' }
    ],
    steps: [
      '豆腐切厚片，青椒切块，大蒜切末。',
      '锅中放油，把豆腐两面煎到微黄后盛出。',
      '锅里留底油，放蒜末和青椒炒香。',
      '倒回豆腐，加入生抽和少量清水，中火煮 2 分钟。',
      '淋入淀粉水，轻轻推动到汤汁变浓即可。'
    ]
  },
  {
    id: 'onion-beef',
    name: '洋葱炒牛肉',
    subtitle: '香气足，适合晚餐补蛋白',
    category: '家常肉菜',
    image: '/assets/images/recipes/onion-beef.jpg',
    time: 20,
    difficulty: 2,
    rating: 4.8,
    calories: 420,
    protein: 34,
    fatLoss: false,
    tags: ['高蛋白', '下饭', '快手肉菜'],
    mainIngredientIds: ['onion', 'beef'],
    ingredientIds: ['onion', 'beef', 'ginger'],
    ingredients: [
      { name: '牛肉片', amount: '200 克' },
      { name: '洋葱', amount: '半个' },
      { name: '姜丝', amount: '少量' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '淀粉', amount: '1 小勺' },
      { name: '黑胡椒', amount: '适量' }
    ],
    steps: [
      '牛肉片加生抽、黑胡椒和淀粉抓匀，腌 10 分钟。',
      '洋葱切丝，姜切丝。',
      '热锅倒油，先放牛肉片快速炒到变色，盛出。',
      '锅中放洋葱和姜丝炒软。',
      '倒回牛肉，翻炒均匀后根据口味补少量盐。'
    ]
  },
  {
    id: 'mushroom-greens',
    name: '香菇小青菜',
    subtitle: '清爽鲜香，补一盘蔬菜很稳',
    category: '素菜',
    image: '/assets/images/recipes/mushroom-greens.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.6,
    calories: 130,
    protein: 5,
    fatLoss: true,
    tags: ['低卡', '素菜', '快手'],
    mainIngredientIds: ['mushroom', 'bok_choy'],
    ingredientIds: ['mushroom', 'bok_choy', 'garlic'],
    ingredients: [
      { name: '香菇', amount: '5 朵' },
      { name: '小青菜', amount: '一把' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '食用油', amount: '少量' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      '香菇切片，小青菜洗净沥干。',
      '锅中少油，放蒜末炒香。',
      '放入香菇片翻炒到变软。',
      '加入小青菜，大火快速翻炒。',
      '青菜断生后加盐调味，立刻出锅。'
    ]
  },
  {
    id: 'minced-pork-tofu',
    name: '肉末豆腐',
    subtitle: '温和下饭，适合不想做复杂菜的时候',
    category: '家常菜',
    image: '/assets/images/recipes/minced-pork-tofu.jpg',
    time: 20,
    difficulty: 2,
    rating: 4.7,
    calories: 430,
    protein: 27,
    fatLoss: false,
    tags: ['下饭', '豆制品', '家常'],
    mainIngredientIds: ['pork', 'tofu'],
    ingredientIds: ['pork', 'tofu', 'garlic', 'scallion'],
    ingredients: [
      { name: '豆腐', amount: '1 块' },
      { name: '猪肉末', amount: '100 克' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '淀粉水', amount: '半小碗' },
      { name: '小葱', amount: '少量，可不放' }
    ],
    steps: [
      '豆腐切小块，蒜切末。',
      '锅中少油，放肉末炒散炒到变色。',
      '加入蒜末和生抽炒香。',
      '倒入豆腐和半碗水，中火煮 4 分钟。',
      '淋入淀粉水收汁，撒小葱即可。'
    ]
  },
  {
    id: 'potato-chicken',
    name: '土豆烧鸡腿肉',
    subtitle: '浓郁耐吃，一锅解决主菜',
    category: '家常肉菜',
    image: '/assets/images/recipes/potato-chicken.jpg',
    time: 32,
    difficulty: 2,
    rating: 4.8,
    calories: 520,
    protein: 35,
    fatLoss: false,
    tags: ['一锅菜', '下饭', '带饭'],
    mainIngredientIds: ['potato', 'chicken_thigh'],
    ingredientIds: ['potato', 'chicken_thigh', 'ginger', 'scallion'],
    ingredients: [
      { name: '鸡腿肉', amount: '250 克' },
      { name: '土豆', amount: '1 个' },
      { name: '姜片', amount: '2 片' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '老抽', amount: '半小勺，可选' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      '鸡腿肉切块，土豆去皮切滚刀块。',
      '锅中放少量油，放姜片和鸡腿肉翻炒到表面变色。',
      '加入生抽和少量老抽炒匀上色。',
      '放入土豆，加水到食材一半高度，中火焖 15 分钟。',
      '土豆软了后加盐，转大火收汁即可。'
    ]
  },
  {
    id: 'beef-fried-rice',
    name: '牛肉蛋炒饭',
    subtitle: '剩饭变正餐，适合一个人快速解决',
    category: '主食',
    image: '/assets/images/recipes/beef-fried-rice.jpg',
    time: 16,
    difficulty: 2,
    rating: 4.7,
    calories: 560,
    protein: 32,
    fatLoss: false,
    tags: ['一人食', '主食', '快手'],
    mainIngredientIds: ['beef', 'egg', 'rice'],
    ingredientIds: ['beef', 'egg', 'rice', 'scallion'],
    ingredients: [
      { name: '米饭', amount: '1 碗' },
      { name: '牛肉丁', amount: '100 克' },
      { name: '鸡蛋', amount: '1 个' },
      { name: '小葱', amount: '少量' },
      { name: '生抽', amount: '1 小勺' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '牛肉切小丁，鸡蛋打散，小葱切碎。',
      '锅中放油，倒入蛋液炒散后盛出。',
      '放牛肉丁炒到变色，倒入米饭压散翻炒。',
      '倒回鸡蛋，加入生抽和少量盐。',
      '撒小葱，翻炒均匀后出锅。'
    ]
  },
  {
    id: 'shrimp-broccoli',
    name: '虾仁炒西兰花',
    subtitle: '清爽鲜甜，低油也好吃',
    category: '减脂餐',
    image: '/assets/images/recipes/shrimp-broccoli.jpg',
    time: 18,
    difficulty: 2,
    rating: 4.7,
    calories: 260,
    protein: 28,
    fatLoss: true,
    tags: ['低卡', '高蛋白', '少油'],
    mainIngredientIds: ['shrimp', 'broccoli'],
    ingredientIds: ['shrimp', 'broccoli', 'garlic'],
    ingredients: [
      { name: '虾仁', amount: '150 克' },
      { name: '西兰花', amount: '半颗' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '盐', amount: '适量' },
      { name: '黑胡椒', amount: '少量' },
      { name: '食用油', amount: '少量' }
    ],
    steps: [
      '虾仁洗净沥干，用少量盐和黑胡椒抓匀。',
      '西兰花掰小朵，水开后焯 1 分钟。',
      '锅中少油，放蒜末炒香。',
      '放入虾仁炒到变色，再放西兰花。',
      '加盐调味，翻炒均匀即可。'
    ]
  },
  {
    id: 'corn-egg-rice',
    name: '玉米鸡蛋拌饭',
    subtitle: '甜口清爽，适合不想大炒的时候',
    category: '主食',
    image: '/assets/images/recipes/corn-egg-rice.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.5,
    calories: 470,
    protein: 18,
    fatLoss: false,
    tags: ['一人食', '快手', '主食'],
    mainIngredientIds: ['corn', 'egg', 'rice'],
    ingredientIds: ['corn', 'egg', 'rice', 'scallion'],
    ingredients: [
      { name: '米饭', amount: '1 碗' },
      { name: '玉米粒', amount: '半碗' },
      { name: '鸡蛋', amount: '1 到 2 个' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '生抽', amount: '1 小勺' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '玉米粒焯熟或用熟玉米粒，鸡蛋打散。',
      '锅中少油，倒入蛋液炒散。',
      '放入米饭和玉米粒，翻炒到米饭松散。',
      '加入生抽和少量盐调味。',
      '撒小葱后盛出。'
    ]
  },
  {
    id: 'carrot-beef-stew',
    name: '胡萝卜牛肉小炖',
    subtitle: '软烂鲜甜，适合提前多做一点',
    category: '炖菜',
    image: '/assets/images/recipes/carrot-beef-stew.jpg',
    time: 45,
    difficulty: 3,
    rating: 4.7,
    calories: 480,
    protein: 36,
    fatLoss: false,
    tags: ['炖菜', '带饭', '高蛋白'],
    mainIngredientIds: ['carrot', 'beef'],
    ingredientIds: ['carrot', 'beef', 'ginger', 'scallion'],
    ingredients: [
      { name: '牛肉块', amount: '250 克' },
      { name: '胡萝卜', amount: '1 根' },
      { name: '姜片', amount: '2 片' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '盐', amount: '适量' },
      { name: '热水', amount: '适量' }
    ],
    steps: [
      '牛肉切小块，冷水下锅焯水，捞出冲掉浮沫。',
      '胡萝卜去皮切滚刀块。',
      '锅中少油，放姜片和牛肉翻炒，加入生抽炒匀。',
      '加入热水没过牛肉，小火炖 30 分钟。',
      '放入胡萝卜继续炖 10 到 15 分钟，最后加盐调味。'
    ]
  },
  {
    id: 'green-pepper-beef',
    name: '青椒牛柳',
    subtitle: '香辣爽口，米饭很搭',
    category: '家常肉菜',
    image: '/assets/images/recipes/green-pepper-beef.jpg',
    time: 22,
    difficulty: 2,
    rating: 4.8,
    calories: 430,
    protein: 35,
    fatLoss: false,
    tags: ['高蛋白', '下饭', '快手肉菜'],
    mainIngredientIds: ['green_pepper', 'beef'],
    ingredientIds: ['green_pepper', 'beef', 'garlic'],
    ingredients: [
      { name: '牛肉条', amount: '200 克' },
      { name: '青椒', amount: '2 个' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '淀粉', amount: '1 小勺' },
      { name: '黑胡椒', amount: '适量' }
    ],
    steps: [
      '牛肉切条，加生抽、黑胡椒和淀粉抓匀，腌 10 分钟。',
      '青椒去籽切条，大蒜切片。',
      '热锅少油，先把牛肉炒到变色后盛出。',
      '锅中放蒜片和青椒炒香。',
      '倒回牛肉，快速翻炒均匀即可。'
    ]
  },
  {
    id: 'lettuce-chicken-wrap',
    name: '生菜鸡肉卷',
    subtitle: '不用主食也能有饱腹感',
    category: '轻食',
    image: '/assets/images/recipes/lettuce-chicken-wrap.jpg',
    time: 22,
    difficulty: 2,
    rating: 4.6,
    calories: 310,
    protein: 35,
    fatLoss: true,
    tags: ['低碳水', '高蛋白', '减脂友好'],
    mainIngredientIds: ['lettuce', 'chicken_breast', 'cucumber'],
    ingredientIds: ['lettuce', 'chicken_breast', 'cucumber', 'carrot'],
    ingredients: [
      { name: '鸡胸肉', amount: '180 克' },
      { name: '生菜叶', amount: '6 片' },
      { name: '黄瓜', amount: '半根' },
      { name: '胡萝卜', amount: '半根' },
      { name: '盐和黑胡椒', amount: '适量' },
      { name: '低脂酱汁', amount: '少量，可选' }
    ],
    steps: [
      '鸡胸肉用盐和黑胡椒腌 8 分钟，煎熟后撕成条。',
      '生菜洗净沥干，黄瓜和胡萝卜切细条。',
      '把鸡肉、黄瓜和胡萝卜放到生菜叶中间。',
      '按口味加少量低脂酱汁。',
      '把生菜从两侧包起来即可食用。'
    ]
  },
  {
    id: 'tomato-potato-soup',
    name: '番茄土豆汤',
    subtitle: '酸甜饱腹，冰箱边角料也能用',
    category: '汤菜',
    image: '/assets/images/recipes/tomato-potato-soup.jpg',
    time: 24,
    difficulty: 1,
    rating: 4.5,
    calories: 220,
    protein: 5,
    fatLoss: true,
    tags: ['低卡', '素汤', '饱腹'],
    mainIngredientIds: ['tomato', 'potato'],
    ingredientIds: ['tomato', 'potato', 'scallion'],
    ingredients: [
      { name: '番茄', amount: '2 个' },
      { name: '土豆', amount: '1 个' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '食用油', amount: '少量' }
    ],
    steps: [
      '番茄切块，土豆去皮切小块。',
      '锅中少油，放番茄炒到出汁。',
      '加入土豆块和热水，水量没过食材。',
      '中火煮 15 分钟，直到土豆变软。',
      '加盐调味，撒小葱即可。'
    ]
  },
  {
    id: 'tofu-mushroom-stew',
    name: '菌菇豆腐煲',
    subtitle: '清淡鲜美，晚餐负担小',
    category: '轻炖',
    image: '/assets/images/recipes/tofu-mushroom-stew.jpg',
    time: 20,
    difficulty: 1,
    rating: 4.6,
    calories: 260,
    protein: 18,
    fatLoss: true,
    tags: ['低卡', '豆制品', '暖胃'],
    mainIngredientIds: ['tofu', 'mushroom'],
    ingredientIds: ['tofu', 'mushroom', 'scallion'],
    ingredients: [
      { name: '豆腐', amount: '1 块' },
      { name: '香菇', amount: '5 朵' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '白胡椒粉', amount: '少量，可选' }
    ],
    steps: [
      '豆腐切块，香菇切片。',
      '锅中加水烧开，放入香菇煮 5 分钟。',
      '放入豆腐块，中小火煮 6 分钟。',
      '加盐和少量白胡椒调味。',
      '撒小葱后关火。'
    ]
  },
  {
    id: 'egg-fried-rice',
    name: '黄金蛋炒饭',
    subtitle: '冰箱只剩蛋和饭也能稳住',
    category: '主食',
    image: '/assets/images/recipes/egg-fried-rice.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.6,
    calories: 520,
    protein: 18,
    fatLoss: false,
    tags: ['一人食', '快手', '主食'],
    mainIngredientIds: ['egg', 'rice'],
    ingredientIds: ['egg', 'rice', 'scallion'],
    ingredients: [
      { name: '米饭', amount: '1 碗' },
      { name: '鸡蛋', amount: '2 个' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '食用油', amount: '约 1 汤匙' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      '鸡蛋打散，米饭提前压散。',
      '锅烧热倒油，倒入蛋液炒到半凝固。',
      '放入米饭，快速翻炒到米粒松散。',
      '加盐调味，继续翻炒 1 分钟。',
      '撒小葱后出锅。'
    ]
  },
  {
    id: 'garlic-eggplant',
    name: '蒜香茄子',
    subtitle: '软糯入味，素菜也能很下饭',
    category: '家常素菜',
    image: '/assets/images/recipes/garlic-eggplant.jpg',
    time: 18,
    difficulty: 2,
    rating: 4.7,
    calories: 280,
    protein: 5,
    fatLoss: false,
    tags: ['蒜香', '下饭', '素菜'],
    mainIngredientIds: ['eggplant', 'garlic'],
    ingredientIds: ['eggplant', 'garlic', 'scallion'],
    ingredients: [
      { name: '茄子', amount: '2 根' },
      { name: '大蒜', amount: '3 瓣' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '食用油', amount: '约 1 汤匙' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '茄子洗净切条，放清水里泡 3 分钟，大蒜切末。',
      '锅中放油，放入茄子中火煎炒到变软。',
      '茄子拨到一边，放蒜末炒出香味。',
      '加入生抽和少量盐，继续翻炒到茄子均匀入味。',
      '撒小葱，翻匀后出锅。'
    ]
  },
  {
    id: 'napa-vermicelli-pot',
    name: '娃娃菜粉丝煲',
    subtitle: '热乎清爽，下班后煮一锅很省心',
    category: '汤煲',
    image: '/assets/images/recipes/napa-vermicelli-pot.jpg',
    time: 20,
    difficulty: 1,
    rating: 4.7,
    calories: 240,
    protein: 6,
    fatLoss: true,
    tags: ['热汤', '清爽', '素菜'],
    mainIngredientIds: ['napa_cabbage', 'vermicelli'],
    ingredientIds: ['napa_cabbage', 'vermicelli', 'garlic'],
    ingredients: [
      { name: '娃娃菜', amount: '1 颗' },
      { name: '粉丝', amount: '1 小把' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 小勺' },
      { name: '盐', amount: '适量' },
      { name: '清水', amount: '1 大碗' }
    ],
    steps: [
      '粉丝用温水泡软，娃娃菜洗净切成大块。',
      '锅中少油，放蒜末小火炒香。',
      '放入娃娃菜翻炒 1 分钟，再加入清水煮开。',
      '放入泡软的粉丝，煮 2 到 3 分钟。',
      '加入生抽和盐调味，煮到娃娃菜变软后出锅。'
    ]
  },
  {
    id: 'tomato-fish-soup',
    name: '番茄鱼片汤',
    subtitle: '酸甜开胃，有汤有蛋白',
    category: '汤菜',
    image: '/assets/images/recipes/tomato-fish-soup.jpg',
    time: 24,
    difficulty: 2,
    rating: 4.8,
    calories: 300,
    protein: 30,
    fatLoss: true,
    tags: ['酸甜开胃', '高蛋白', '热汤'],
    mainIngredientIds: ['tomato', 'fish_fillet'],
    ingredientIds: ['tomato', 'fish_fillet', 'ginger', 'scallion'],
    ingredients: [
      { name: '鱼片', amount: '200 克' },
      { name: '番茄', amount: '2 个' },
      { name: '生姜', amount: '2 片' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '食用油', amount: '少量' }
    ],
    steps: [
      '鱼片加姜丝和一点盐抓匀，番茄切块。',
      '锅中少油，放番茄中火炒到出汁。',
      '加入一大碗热水，煮开后再煮 5 分钟。',
      '放入鱼片，用筷子轻轻拨散，煮到鱼片变白熟透。',
      '加盐调味，撒小葱后出锅。'
    ]
  },
  {
    id: 'spinach-egg-noodles',
    name: '菠菜鸡蛋面',
    subtitle: '一碗热面，十几分钟把晚餐稳住',
    category: '主食',
    image: '/assets/images/recipes/spinach-egg-noodles.jpg',
    time: 15,
    difficulty: 1,
    rating: 4.6,
    calories: 430,
    protein: 20,
    fatLoss: false,
    tags: ['主食', '清爽', '一人食'],
    mainIngredientIds: ['spinach', 'egg', 'noodles'],
    ingredientIds: ['spinach', 'egg', 'noodles', 'scallion'],
    ingredients: [
      { name: '面条', amount: '1 人份' },
      { name: '菠菜', amount: '1 小把' },
      { name: '鸡蛋', amount: '1 个' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '生抽', amount: '1 小勺' }
    ],
    steps: [
      '菠菜洗净切段，鸡蛋打散，小葱切碎。',
      '锅中少油，倒入蛋液炒成嫩蛋，先盛出。',
      '另起锅烧水，水开后放入面条煮到快熟。',
      '放入菠菜煮 30 秒，再加盐和生抽调味。',
      '把面条盛入碗中，放上鸡蛋和小葱即可。'
    ]
  },
  {
    id: 'potato-chicken-wing-rice',
    name: '土豆鸡翅焖饭',
    subtitle: '一锅有肉有饭，适合不想多洗锅',
    category: '主食',
    image: '/assets/images/recipes/potato-chicken-wing-rice.jpg',
    time: 35,
    difficulty: 2,
    rating: 4.8,
    calories: 620,
    protein: 32,
    fatLoss: false,
    tags: ['焖饭', '下饭', '一锅菜'],
    mainIngredientIds: ['chicken_wing', 'potato', 'rice'],
    ingredientIds: ['chicken_wing', 'potato', 'rice', 'ginger'],
    ingredients: [
      { name: '鸡翅', amount: '4 到 5 个' },
      { name: '土豆', amount: '1 个' },
      { name: '大米', amount: '1 杯' },
      { name: '生姜', amount: '2 片' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '大米淘洗好，鸡翅划两刀，土豆去皮切块。',
      '锅中少油，放姜片和鸡翅，煎到两面微黄。',
      '放入土豆块，加入生抽和少量盐翻炒均匀。',
      '把米和水放入电饭锅，再倒入鸡翅和土豆，按煮饭键。',
      '焖熟后把饭和食材拌匀即可。'
    ]
  },
  {
    id: 'pumpkin-millet-porridge',
    name: '南瓜小米粥',
    subtitle: '清甜热乎，晚餐想轻一点就喝它',
    category: '粥',
    image: '/assets/images/recipes/pumpkin-millet-porridge.jpg',
    time: 35,
    difficulty: 1,
    rating: 4.6,
    calories: 260,
    protein: 7,
    fatLoss: true,
    tags: ['热粥', '清甜', '主食'],
    mainIngredientIds: ['pumpkin', 'millet'],
    ingredientIds: ['pumpkin', 'millet'],
    ingredients: [
      { name: '南瓜', amount: '200 克' },
      { name: '小米', amount: '半杯' },
      { name: '清水', amount: '约 5 杯' },
      { name: '盐或糖', amount: '少量，可不放' }
    ],
    steps: [
      '南瓜去皮切小块，小米淘洗干净。',
      '锅中加清水和小米，煮开后转小火。',
      '放入南瓜块，继续小火煮 25 分钟。',
      '煮到南瓜变软后，用勺子轻轻压几下让粥更浓。',
      '按口味加一点盐或糖，也可以直接盛出。'
    ]
  },
  {
    id: 'spicy-pork-belly-pepper',
    name: '香辣五花肉青椒',
    subtitle: '锅气足，适合想吃点重口的晚上',
    category: '家常肉菜',
    image: '/assets/images/recipes/spicy-pork-belly-pepper.jpg',
    time: 22,
    difficulty: 2,
    rating: 4.8,
    calories: 560,
    protein: 28,
    fatLoss: false,
    tags: ['香辣', '下饭', '无辣不欢'],
    mainIngredientIds: ['pork_belly', 'green_pepper'],
    ingredientIds: ['pork_belly', 'green_pepper', 'dried_chili', 'garlic'],
    ingredients: [
      { name: '五花肉', amount: '180 克' },
      { name: '青椒', amount: '2 个' },
      { name: '干辣椒', amount: '2 到 3 个' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '五花肉切薄片，青椒切块，干辣椒剪段，大蒜切片。',
      '锅烧热后放五花肉，小火煸到边缘微卷出油。',
      '放入蒜片和干辣椒，炒出香味。',
      '放入青椒，大火翻炒到青椒略微变软。',
      '加入生抽和少量盐，翻匀后出锅。'
    ]
  },
  {
    id: 'enoki-beef-roll',
    name: '金针菇牛肉卷',
    subtitle: '鲜香有嚼劲，看着精致但做法简单',
    category: '家常肉菜',
    image: '/assets/images/recipes/enoki-beef-roll.jpg',
    time: 20,
    difficulty: 2,
    rating: 4.7,
    calories: 420,
    protein: 34,
    fatLoss: false,
    tags: ['鲜香', '肉菜', '下饭'],
    mainIngredientIds: ['enoki', 'beef'],
    ingredientIds: ['enoki', 'beef', 'scallion'],
    ingredients: [
      { name: '金针菇', amount: '1 把' },
      { name: '牛肉薄片', amount: '180 克' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '生抽', amount: '1 汤匙' },
      { name: '清水', amount: '半小碗' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '金针菇切掉根部，分成小束。',
      '用牛肉薄片把金针菇卷起来，收口压在下面。',
      '平底锅少油，放入牛肉卷，先把收口面煎定型。',
      '加入生抽、少量盐和半小碗水，盖上盖子焖 2 分钟。',
      '打开锅盖收一收汁，撒小葱后装盘。'
    ]
  },
  {
    id: 'sour-spicy-napa',
    name: '酸辣娃娃菜',
    subtitle: '清脆开胃，没胃口时很救场',
    category: '素菜',
    image: '/assets/images/recipes/sour-spicy-napa.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.6,
    calories: 160,
    protein: 5,
    fatLoss: true,
    tags: ['酸辣', '开胃', '快手素菜'],
    mainIngredientIds: ['napa_cabbage', 'dried_chili'],
    ingredientIds: ['napa_cabbage', 'dried_chili', 'garlic'],
    ingredients: [
      { name: '娃娃菜', amount: '1 颗' },
      { name: '干辣椒', amount: '2 个' },
      { name: '大蒜', amount: '2 瓣' },
      { name: '米醋', amount: '1 小勺' },
      { name: '生抽', amount: '1 小勺' },
      { name: '盐', amount: '少量' }
    ],
    steps: [
      '娃娃菜洗净切条，干辣椒剪段，大蒜切片。',
      '锅中少油，先放蒜片和干辣椒小火炒香。',
      '放入娃娃菜帮，大火翻炒 1 分钟。',
      '再放娃娃菜叶，加入生抽和少量盐翻炒。',
      '出锅前沿锅边淋米醋，快速翻匀即可。'
    ]
  },
  {
    id: 'radish-beef-soup',
    name: '白萝卜牛肉汤',
    subtitle: '清甜暖胃，肉汤不油也有满足感',
    category: '汤菜',
    image: '/assets/images/recipes/radish-beef-soup.jpg',
    time: 35,
    difficulty: 2,
    rating: 4.7,
    calories: 360,
    protein: 32,
    fatLoss: true,
    tags: ['热汤', '清爽', '高蛋白'],
    mainIngredientIds: ['white_radish', 'beef'],
    ingredientIds: ['white_radish', 'beef', 'ginger', 'scallion'],
    ingredients: [
      { name: '白萝卜', amount: '半根' },
      { name: '牛肉片', amount: '180 克' },
      { name: '生姜', amount: '2 片' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '清水', amount: '1 大碗' }
    ],
    steps: [
      '白萝卜去皮切片，牛肉片用清水快速冲一下。',
      '锅中加水和姜片，放入萝卜片煮开。',
      '转中小火煮 15 分钟，直到萝卜变软半透明。',
      '放入牛肉片，用筷子拨散，煮到变色熟透。',
      '加盐调味，撒小葱后盛出。'
    ]
  },
  {
    id: 'ham-veggie-noodles',
    name: '火腿青菜汤面',
    subtitle: '十二分钟热汤面，适合一个人快速开饭',
    category: '主食',
    image: '/assets/images/recipes/ham-veggie-noodles.jpg',
    time: 12,
    difficulty: 1,
    rating: 4.5,
    calories: 480,
    protein: 18,
    fatLoss: false,
    tags: ['主食', '热汤面', '省心'],
    mainIngredientIds: ['ham_sausage', 'bok_choy', 'noodles'],
    ingredientIds: ['ham_sausage', 'bok_choy', 'noodles', 'scallion'],
    ingredients: [
      { name: '面条', amount: '1 人份' },
      { name: '火腿肠', amount: '1 根' },
      { name: '小青菜', amount: '1 把' },
      { name: '小葱', amount: '少量，可不放' },
      { name: '盐', amount: '适量' },
      { name: '生抽', amount: '1 小勺' }
    ],
    steps: [
      '火腿肠切片，小青菜洗净，小葱切碎。',
      '锅中烧水，水开后放入面条。',
      '面条煮到快熟时，放入青菜和火腿片。',
      '加入盐和生抽调味，再煮 30 秒。',
      '盛入碗中，撒小葱即可。'
    ]
  },
  {
    id: 'sweet-potato-egg-salad',
    name: '红薯鸡蛋轻食碗',
    subtitle: '有碳水有蛋白，轻一点也能吃饱',
    category: '轻食',
    image: '/assets/images/recipes/sweet-potato-egg-salad.jpg',
    time: 22,
    difficulty: 1,
    rating: 4.6,
    calories: 330,
    protein: 14,
    fatLoss: true,
    tags: ['清爽', '主食', '减脂友好'],
    mainIngredientIds: ['sweet_potato', 'egg', 'cucumber'],
    ingredientIds: ['sweet_potato', 'egg', 'cucumber'],
    ingredients: [
      { name: '红薯', amount: '1 个' },
      { name: '鸡蛋', amount: '1 个' },
      { name: '黄瓜', amount: '半根' },
      { name: '无糖酸奶', amount: '1 汤匙，可选' },
      { name: '盐', amount: '少量' },
      { name: '黑胡椒', amount: '少量，可选' }
    ],
    steps: [
      '红薯洗净切块，放入锅中蒸到能轻松戳透。',
      '鸡蛋冷水下锅，水开后煮 8 分钟，捞出剥壳。',
      '黄瓜洗净切片，鸡蛋切块。',
      '把红薯、鸡蛋和黄瓜放入碗中。',
      '加少量盐和黑胡椒，喜欢更顺口可以拌一点无糖酸奶。'
    ]
  }
];

const fatPlan = [
  { day: '周一', title: '高蛋白开局', recipeIds: ['broccoli-chicken', 'mushroom-egg-soup'] },
  { day: '周二', title: '清爽少油', recipeIds: ['shrimp-broccoli', 'garlic-lettuce'] },
  { day: '周三', title: '酸甜热汤', recipeIds: ['tomato-fish-soup', 'cucumber-tofu-egg'] },
  { day: '周四', title: '低碳轻食', recipeIds: ['lettuce-chicken-wrap', 'tofu-mushroom-stew'] },
  { day: '周五', title: '轻主食日', recipeIds: ['pumpkin-millet-porridge', 'napa-vermicelli-pot'] }
];

const allIngredients = ingredients.concat(catalogExtra.extraIngredients).map((item) => ({
  ...item,
  category: catalogExtra.categoryOverrides[item.id] || item.category
}));

const seasoningAmountRules = [
  { names: ['食用油', '油'], amount: '10 ml（约 2 小勺）', type: 'liquid' },
  { names: ['生抽', '蒸鱼豉油'], amount: '15 ml（约 1 汤匙）', type: 'liquid' },
  { names: ['老抽'], amount: '3 ml（约半小勺）', type: 'liquid' },
  { names: ['蚝油'], amount: '10 ml（约 2 小勺）', type: 'liquid' },
  { names: ['米醋', '香醋', '醋'], amount: '5 ml（约 1 小勺）', type: 'liquid' },
  { names: ['番茄酱'], amount: '30 g（约 2 汤匙）', type: 'paste' },
  { names: ['豆瓣酱'], amount: '15 g（约 1 汤匙）', type: 'paste' },
  { names: ['盐'], amount: '1 g（约 1/5 小勺）', type: 'dry' },
  { names: ['糖', '冰糖'], amount: '3 g（约半小勺）', type: 'dry' },
  { names: ['淀粉'], amount: '5 g（约 1 小勺）', type: 'dry' },
  { names: ['黑胡椒', '白胡椒粉', '孜然粉'], amount: '0.5 g（约一小撮）', type: 'dry' },
  { names: ['花椒'], amount: '1 g（约 1 小勺）', type: 'dry' },
  { names: ['干辣椒'], amount: '2 g（约 2 个）', type: 'dry' },
  { names: ['姜', '姜片', '姜丝', '生姜'], amount: '5 g' },
  { names: ['小葱', '葱', '葱丝'], amount: '5 g' },
  { names: ['大蒜', '蒜', '蒜末', '蒜片'], amount: '8 g' },
  { names: ['清水', '热水', '温水', '水'], amount: '200 ml（约 1 小碗）', type: 'water' },
  { names: ['无糖酸奶'], amount: '60 ml（约 4 汤匙）', type: 'liquid' },
  { names: ['油醋汁'], amount: '10 ml（约 2 小勺）', type: 'liquid' }
];

function isLooseAmount(amount) {
  return /少量|适量|可选|可不放|几片|几瓣|几根|一点|半小勺|1\/2 小勺|1\/3 小勺|小勺|汤匙|勺|碗|杯|倍|片|瓣|根|个/.test(String(amount || ''));
}

function amountBySpoon(name, amount, rule) {
  const amountText = String(amount || '');
  if (!rule.type) return rule.amount;

  if (/半小勺|1\/2\s*小勺/.test(amountText)) {
    if (rule.type === 'liquid') return '2.5 ml（约半小勺）';
    if (rule.type === 'paste') return '7 g（约半汤匙）';
    if (/盐/.test(name)) return '2 g（约半小勺）';
    return '3 g（约半小勺）';
  }

  if (/1\/3\s*小勺/.test(amountText)) {
    if (rule.type === 'liquid') return '2 ml（约 1/3 小勺）';
    if (/盐/.test(name)) return '1 g（约 1/3 小勺）';
    return '2 g（约 1/3 小勺）';
  }

  if (/小勺/.test(amountText) && !/汤匙/.test(amountText)) {
    if (rule.type === 'liquid') return '5 ml（约 1 小勺）';
    if (rule.type === 'paste') return '8 g（约 1 小勺）';
    if (/盐/.test(name)) return '3 g（约 1 小勺）';
    return '5 g（约 1 小勺）';
  }

  if (/汤匙/.test(amountText)) {
    const count = amountText.match(/\d+/);
    const spoonCount = count ? Number(count[0]) : 1;
    if (rule.type === 'liquid') return `${spoonCount * 15} ml（约 ${spoonCount} 汤匙）`;
    return `${spoonCount * 15} g（约 ${spoonCount} 汤匙）`;
  }

  if (/倍/.test(amountText) && rule.type === 'water') return `${amountText}（约 120 到 150 ml）`;
  if (/半碗/.test(amountText)) return '100 ml（约半小碗）';
  if (/碗|杯/.test(amountText) && rule.type === 'water') return '200 ml（约 1 小碗）';
  return rule.amount;
}

function preciseAmountFor(name, amount) {
  const text = `${name || ''}${amount || ''}`;
  const amountText = String(amount || '');
  const countMatch = amountText.match(/\d+/);
  const count = countMatch ? Number(countMatch[0]) : 0;
  if (/大蒜|蒜/.test(name) && /瓣|少量|适量|可不放/.test(amountText)) {
    return count ? `${amountText}（约 ${count * 4} g）` : '8 g（约 2 瓣）';
  }
  if (/姜/.test(name) && /片|丝|少量|适量|可不放/.test(amountText)) {
    return count ? `${amountText}（约 ${count * 2} g）` : '5 g（约 2 到 3 片）';
  }
  if (/小葱|葱/.test(name) && /根|少量|适量|可不放/.test(amountText)) {
    return count ? `${amountText}（约 ${count * 5} g）` : '5 g（约 1 根）';
  }
  if (/干辣椒/.test(name) && /个|少量|适量/.test(amountText)) {
    return count ? `${amountText}（约 ${count} g）` : '2 g（约 2 个）';
  }
  const rule = seasoningAmountRules.find((item) =>
    item.names.some((keyword) => text.indexOf(keyword) >= 0)
  );
  if (!rule || !isLooseAmount(amount)) return amount;
  return amountBySpoon(name, amount, rule);
}

function decorateIngredientAmounts(recipe) {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((item) => ({
      ...item,
      amount: preciseAmountFor(item.name, item.amount)
    }))
  };
}

const allRecipes = recipes
  .concat(catalogExtra.extraRecipes)
  .map(decorateIngredientAmounts);

  module.exports = {
    ingredientCategories: catalogExtra.ingredientCategories,
    ingredients: allIngredients,
    recipes: allRecipes,
    fatPlan,
    toolList,   // 新增
    tabooList   // 新增
  };
  
