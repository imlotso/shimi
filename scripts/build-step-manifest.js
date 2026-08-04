const fs = require('fs');
const path = require('path');

const out = process.argv[2];
const force = process.argv[3] === 'true';
const root = path.resolve(__dirname, '..');
const { recipes, ingredients } = require('../utils/data');

function assetExists(assetPath) {
  return fs.existsSync(path.join(root, assetPath.replace(/^\//, '')));
}

function actionFor(text, index, lastIndex) {
  if (index === lastIndex) return 'final';
  if (/打散|搅|蛋液|面糊|抓匀|调成/.test(text)) return 'beat';
  if (/泡|吐沙|洗|切|剥|去皮|处理|划|腌|备好|撕|掰|拍/.test(text)) return 'prep';
  if (/蒸|上锅|盖上|保鲜膜|蒸锅/.test(text)) return 'steam';
  if (/焯水|水开|煮|炖|焖|汤|粥|加水|热水|清水|电饭锅/.test(text)) return 'pot';
  if (/拌|淋|调汁|沙拉|酸奶|放入碗|盘中|碗中|冷藏/.test(text)) return 'mix';
  if (/锅|炒|煎|煸|炸|收汁|倒入|翻炒|油/.test(text)) return 'pan';
  return index === 0 ? 'prep' : 'pan';
}

function mentionedIngredientIds(text, recipe) {
  const hits = [];
  for (const item of ingredients) {
    const names = [item.name].concat(item.aliases || []);
    if (names.some((name) => name && text.indexOf(name) >= 0)) {
      hits.push(item.id);
    }
  }
  const fallback = recipe.mainIngredientIds || recipe.ingredientIds || [];
  return Array.from(new Set(hits.length ? hits : fallback)).slice(0, 5);
}

const picked = recipes
  .filter((recipe) =>
    force || recipe.steps.some((_, index) => !assetExists(`/assets/images/steps/${recipe.id}/step-${index + 1}.jpg`))
  )
  .map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    image: recipe.image,
    steps: recipe.steps.map((text, index) => ({
      index: index + 1,
      action: actionFor(text, index, recipe.steps.length - 1),
      ingredientIds: mentionedIngredientIds(text, recipe)
    }))
  }));

fs.writeFileSync(out, JSON.stringify(picked, null, 2), 'utf8');
