const { recipes } = require('./data');

const assignedByPage = {};

function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

function pickRecipe(pageKey, candidates) {
  if (assignedByPage[pageKey]) {
    return assignedByPage[pageKey];
  }

  const assignedIds = Object.keys(assignedByPage).map((key) => assignedByPage[key].id);
  const unused = candidates.filter((item) => assignedIds.indexOf(item.id) < 0);
  const pool = unused.length ? unused : candidates;
  const recipe = pool[randomIndex(pool.length)] || recipes[0];

  assignedByPage[pageKey] = recipe;
  return recipe;
}

function getPageHeroRecipe(pageKey, options = {}) {
  let candidates = recipes;
  if (options.fatOnly) {
    candidates = recipes.filter((item) => item.fatLoss);
  }

  return pickRecipe(pageKey, candidates.length ? candidates : recipes);
}

module.exports = {
  getPageHeroRecipe
};
