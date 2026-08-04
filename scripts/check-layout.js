const fs = require('fs');

const cardClasses = [
  'search-card',
  'fat-recipe',
  'recommend-card',
  'home-recipe',
  'profile-recipe',
  'history-card',
  'related-card',
  'ingredient-item'
];

const wxmlFiles = fs.readdirSync('pages', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `pages/${entry.name}/${entry.name}.wxml`)
  .filter(fs.existsSync);

for (const file of wxmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const cls of cardClasses) {
    const buttonCard = new RegExp(`<button[^>]*class="[^"]*${cls}[^"]*"`, 'm').test(source);
    if (buttonCard) {
      throw new Error(`${file}: ${cls} must use <view>, not <button>`);
    }
  }

  for (const tag of ['view', 'button', 'text', 'scroll-view']) {
    const open = (source.match(new RegExp(`<${tag}(\\s|>)`, 'g')) || []).length;
    const close = (source.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) {
      throw new Error(`${file}: ${tag} tag mismatch, open ${open}, close ${close}`);
    }
  }
}

const ingredientStyle = fs.readFileSync('pages/ingredients/ingredients.wxss', 'utf8');
if (!/\.ingredient-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/m.test(ingredientStyle)) {
  throw new Error('pages/ingredients/ingredients.wxss: ingredient grid must stay two columns');
}

for (const [file, cls] of [
  ['pages/search/search.wxss', 'search-card'],
  ['pages/fatloss/fatloss.wxss', 'fat-recipe'],
  ['pages/recommendations/recommendations.wxss', 'recommend-card'],
  ['pages/profile/profile.wxss', 'profile-recipe']
]) {
  const style = fs.readFileSync(file, 'utf8');
  const block = new RegExp(`\\.${cls}\\s*\\{[\\s\\S]*?\\n\\}`, 'm').exec(style);
  if (!block || !/width:\s*100%;/.test(block[0])) {
    throw new Error(`${file}: .${cls} must include width: 100%`);
  }
}

console.log('layout checks ok');
