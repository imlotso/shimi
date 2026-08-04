const fs = require('fs');
const { recipes, ingredients } = require('../utils/data');

const ingredientTerms = ingredients.map((item) => ({
  id: item.id,
  name: item.name,
  image: item.image,
  terms: [item.name].concat(item.aliases || []).filter(Boolean)
}));

function actionFor(text, index, total) {
  if (index === total - 1) return 'final';
  if (/泡软|泡发|浸泡|吐沙|洗|切|剥|去皮|处理|划|腌|备好|撕|掰|拍/.test(text)) return 'prep';
  if (/打散|搅|蛋液|面糊|抓匀|调成|调汁|酱汁/.test(text)) return 'mix';
  if (/蒸|上锅|盖上|保鲜膜|蒸锅/.test(text)) return 'steam';
  if (/焯水|冷水下锅|水开.*捞|煮开.*捞/.test(text)) return 'blanch';
  if (/煮|炖|焖|汤|粥|加水|热水|清水|电饭锅|水开/.test(text)) return 'pot';
  if (/拌|淋|沙拉|酸奶|放入碗|盘中|碗中|装盘|冷藏/.test(text)) return 'plate';
  if (/炒香|爆香|煸香|蒜末|姜片|葱段/.test(text)) return 'aromatic';
  if (/调味|生抽|老抽|盐|糖|醋|蚝油|酱|淋/.test(text)) return 'seasoning';
  if (/锅|炒|煎|煸|炸|收汁|倒入|翻炒|油/.test(text)) return 'pan';
  return index === 0 ? 'prep' : 'pan';
}

function matchedIngredients(recipe, text) {
  const direct = ingredientTerms.filter((item) => item.terms.some((term) => text.includes(term)));
  const ids = direct.length ? direct.map((item) => item.id) : (recipe.mainIngredientIds || recipe.ingredientIds || []).slice(0, 4);
  return Array.from(new Set(ids))
    .map((id) => ingredientTerms.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 4);
}

const manifest = recipes.map((recipe) => ({
  id: recipe.id,
  name: recipe.name,
  image: recipe.image,
  steps: recipe.steps.map((text, index) => ({
    index,
    text,
    action: actionFor(text, index, recipe.steps.length),
    ingredients: matchedIngredients(recipe, text)
  }))
}));

fs.mkdirSync('scripts/.generated', { recursive: true });
fs.writeFileSync('scripts/.generated/step-auto-manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log(`manifest recipes=${manifest.length}`);
