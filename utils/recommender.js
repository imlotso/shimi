const { recipes, ingredients } = require('./data');

function getIngredientMap() {
  return ingredients.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
}

function getRecipeById(id) {
  return recipes.find((recipe) => recipe.id === id);
}

function getIngredientById(id) {
  return ingredients.find((ingredient) => ingredient.id === id);
}

function normalizeKeyword(value) {
  return String(value || '').trim().toLowerCase();
}

function getIngredientTerms(ingredient) {
  return [ingredient.name].concat(ingredient.aliases || [])
    .map(normalizeKeyword)
    .filter(Boolean);
}

function getQueryIngredientIds(keyword) {
  const ingredientMap = getIngredientMap();
  const matchedIds = Object.keys(ingredientMap).filter((id) => {
    const terms = getIngredientTerms(ingredientMap[id]);
    return terms.some((term) => {
      if (!term || term.length < 2) return false;
      return keyword.indexOf(term) >= 0 || term.indexOf(keyword) >= 0;
    });
  });
  const derivedIds = [];
  if (/辣椒|尖椒|青椒/.test(keyword)) derivedIds.push('green_pepper', 'dried_chili');
  if (/炒肉|猪肉|肉片|肉丝|五花/.test(keyword)) derivedIds.push('pork_belly', 'pork_loin', 'pork');
  if (/鸡腿|鸡腿肉/.test(keyword)) derivedIds.push('chicken_thigh');
  if (/鸡翅|翅中/.test(keyword)) derivedIds.push('chicken_wing');
  if (/鸡胸|鸡胸肉/.test(keyword)) derivedIds.push('chicken_breast');
  return Array.from(new Set(matchedIds.concat(derivedIds)));
}

function getRecipeSearchText(recipe) {
  const ingredientMap = getIngredientMap();
  const ingredientAliasText = recipe.ingredientIds
    .map((id) => ingredientMap[id])
    .filter(Boolean)
    .map((item) => getIngredientTerms(item).join(' '))
    .join(' ');
  const text = [
    recipe.name,
    recipe.subtitle,
    recipe.category,
    recipe.tags.join(' '),
    recipe.ingredients.map((item) => item.name).join(' '),
    ingredientAliasText
  ].join(' ').toLowerCase();
  return text;
}

function getCharacterOverlapScore(source, keyword) {
  const chars = Array.from(new Set(keyword.split('').filter((char) => /\S/.test(char))));
  if (!chars.length) return 0;
  const hits = chars.filter((char) => source.indexOf(char) >= 0).length;
  const ratio = hits / chars.length;
  if (chars.length <= 2 && ratio < 1) return 0;
  if (chars.length > 2 && ratio < 0.55) return 0;
  return hits * 3 + (ratio >= 0.75 ? 16 : 0);
}

function recipeHasIngredientCategory(recipe, categories) {
  const ingredientMap = getIngredientMap();
  return recipe.ingredientIds.some((id) => {
    const ingredient = ingredientMap[id];
    return ingredient && categories.indexOf(ingredient.category) >= 0;
  });
}

function recipeMatchesFilter(recipe, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'homestyle') return /家常|肉菜/.test(recipe.category) || recipe.tags.indexOf('下饭') >= 0 || recipe.tags.indexOf('家常') >= 0;
    if (filter === 'fresh') return recipe.fatLoss || /清爽|低油|低卡|少油|清淡|清甜|热粥/.test(recipe.tags.join(' '));
    if (filter === 'sour') return /番茄|酸甜|酸辣|开胃|香醋|米醋/.test([recipe.name, recipe.subtitle, recipe.tags.join(' '), recipe.ingredients.map((item) => item.name).join(' ')].join(' '));
    if (filter === 'pepper') return /青椒|蒜|椒|辣|锅气|豆瓣酱/.test([recipe.name, recipe.subtitle, recipe.tags.join(' '), recipe.ingredients.map((item) => item.name).join(' ')].join(' '));
    if (filter === 'soup') return /汤|炖|煲|粥/.test(recipe.category) || /汤|炖|煲|粥/.test(recipe.name);
    if (filter === 'staple') return /主食|粥/.test(recipe.category) || recipeHasIngredientCategory(recipe, ['staple']);
    if (filter === 'veggie') return recipeHasIngredientCategory(recipe, ['vegetable']) || /素菜|绿叶|低卡/.test(recipe.tags.join(' '));
    if (filter === 'meat') return recipeHasIngredientCategory(recipe, ['meat', 'seafood']);
    if (filter === 'tofu') return recipeHasIngredientCategory(recipe, ['soy']) || ['mushroom', 'enoki', 'black_fungus'].some((id) => recipe.ingredientIds.indexOf(id) >= 0);
    return true;
}

function scoreRecipeForSearch(recipe, keyword, queryIngredientIds) {
  if (!keyword) {
    return recipe.rating * 3 + (recipe.time <= 20 ? 2 : 0) + (recipe.fatLoss ? 1 : 0);
  }

  const name = normalizeKeyword(recipe.name);
  const subtitle = normalizeKeyword(recipe.subtitle);
  const category = normalizeKeyword(recipe.category);
  const tagText = normalizeKeyword(recipe.tags.join(' '));
  const ingredientText = normalizeKeyword(recipe.ingredients.map((item) => item.name).join(' '));
  const searchText = getRecipeSearchText(recipe);
  let score = 0;

  if (name === keyword) score += 180;
  if (name.indexOf(keyword) >= 0) score += 120;
  if (keyword.indexOf(name) >= 0 && name.length >= 2) score += 90;
  if (subtitle.indexOf(keyword) >= 0) score += 42;
  if (category.indexOf(keyword) >= 0 || tagText.indexOf(keyword) >= 0) score += 28;
  if (ingredientText.indexOf(keyword) >= 0) score += 38;
  if (searchText.indexOf(keyword) >= 0) score += 18;

  const mainSet = new Set(recipe.mainIngredientIds || []);
  const ingredientSet = new Set(recipe.ingredientIds || []);
  queryIngredientIds.forEach((id) => {
    if (mainSet.has(id)) score += 72;
    else if (ingredientSet.has(id)) score += 34;
  });

  score += getCharacterOverlapScore(name, keyword);
  score += recipe.rating;
  if (recipe.time <= 20) score += 1;
  return score;
}

function searchRecipes(keyword, filter) {
  const key = normalizeKeyword(keyword);
  const queryIngredientIds = getQueryIngredientIds(key);
  return recipes
    .filter((recipe) => recipeMatchesFilter(recipe, filter))
    .map((recipe) => ({
      recipe,
      score: scoreRecipeForSearch(recipe, key, queryIngredientIds)
    }))
    .filter((item) => {
      if (!key) return true;
      if (item.score <= 10) return false;
      if (!queryIngredientIds.length) return true;
      const ingredientSet = new Set(item.recipe.ingredientIds || []);
      const hasQueryIngredient = queryIngredientIds.some((id) => ingredientSet.has(id));
      const recipeName = normalizeKeyword(item.recipe.name);
      return hasQueryIngredient || recipeName.indexOf(key) >= 0 || key.indexOf(recipeName) >= 0;
    })
    .sort((a, b) => b.score - a.score || b.recipe.rating - a.recipe.rating || a.recipe.time - b.recipe.time)
    .map((item) => item.recipe);
}

function getMainRecipeCounts(selectedIds) {
  return selectedIds.reduce((counts, id) => {
    counts[id] = recipes.filter((recipe) => recipe.mainIngredientIds.indexOf(id) >= 0).length || 1;
    return counts;
  }, {});
}

function scoreRecipe(recipe, selectedIds, mainRecipeCounts) {
  if (!selectedIds.length) {
    return recipe.rating * 2 + (recipe.time <= 18 ? 2 : 0) + (recipe.fatLoss ? 1 : 0);
  }

  const selected = new Set(selectedIds);
  const mainHits = recipe.mainIngredientIds.filter((id) => selected.has(id)).length;
  const ingredientHits = recipe.ingredientIds.filter((id) => selected.has(id)).length;
  const selectedCoverage = selectedIds.filter((id) => recipe.ingredientIds.indexOf(id) >= 0).length;
  const timeBonus = recipe.time <= 20 ? 1.5 : 0;
  const beginnerBonus = recipe.difficulty <= 2 ? 1 : 0;
  const missingMainCount = recipe.mainIngredientIds.filter((id) => !selected.has(id)).length;
  const rarityBonus = recipe.mainIngredientIds
    .filter((id) => selected.has(id))
    .reduce((sum, id) => sum + 8 / (mainRecipeCounts[id] || 1), 0);

  return mainHits * 12 + ingredientHits * 3 + selectedCoverage * 4 + rarityBonus + timeBonus + beginnerBonus + recipe.rating - missingMainCount * 0.8;
}

function getRecommendationStats(recipe, selectedIds) {
  const ingredientMap = getIngredientMap();
  const selected = new Set(selectedIds);
  const nonSeasoningSelectedIds = selectedIds.filter((id) => {
    const ingredient = ingredientMap[id];
    return ingredient && ingredient.category !== 'seasoning';
  });
  const matchedIds = recipe.ingredientIds.filter((id) => selected.has(id));
  const mainMatchedIds = recipe.mainIngredientIds.filter((id) => selected.has(id));
  const matchedNonSeasoningMainIds = recipe.mainIngredientIds.filter((id) => nonSeasoningSelectedIds.indexOf(id) >= 0);

  return {
    matchedIds,
    mainMatchedIds,
    matchedNonSeasoningMainIds,
    selectedHasNonSeasoning: nonSeasoningSelectedIds.length > 0
  };
}

function isEligibleRecommendation(recipe, selectedIds) {
  if (!selectedIds.length) return true;
  const stats = getRecommendationStats(recipe, selectedIds);
  if (!stats.matchedIds.length) return false;
  if (stats.selectedHasNonSeasoning) {
    return stats.matchedNonSeasoningMainIds.length > 0;
  }
  return stats.mainMatchedIds.length > 0 || stats.matchedIds.length > 0;
}

function buildRecommendation(recipe, selectedIds) {
  const ingredientMap = getIngredientMap();
  const selected = new Set(selectedIds);
  const matchedIds = getRecommendationStats(recipe, selectedIds).matchedIds;
  const missingMainIds = recipe.mainIngredientIds.filter((id) => !selected.has(id));
  const missingMainNames = missingMainIds.map((id) => ingredientMap[id]).filter(Boolean).map((item) => item.name);
  const matchedNames = matchedIds.map((id) => ingredientMap[id]).filter(Boolean).map((item) => item.name);

  return {
    ...recipe,
    matchCount: matchedIds.length,
    matchedNames,
    missingMainNames,
    reason: matchedIds.length
      ? `已用上 ${matchedNames.join('、')}`
      : '不挑食材，今晚也能直接开饭'
  };
}

function recommendRecipes(selectedIds, limit) {
  const cleanSelected = Array.from(new Set((selectedIds || []).filter(Boolean)));
  const mainRecipeCounts = getMainRecipeCounts(cleanSelected);
  const ranked = recipes
    .filter((recipe) => isEligibleRecommendation(recipe, cleanSelected))
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, cleanSelected, mainRecipeCounts)
    }))
    .sort((a, b) => b.score - a.score || a.recipe.time - b.recipe.time)
    .map((item) => buildRecommendation(item.recipe, cleanSelected));

  return typeof limit === 'number' ? ranked.slice(0, limit) : ranked;
}

function getCommonIngredients(limit) {
  const list = ingredients.filter((item) => item.common);
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

function getRecipesByIds(ids) {
  return (ids || []).map(getRecipeById).filter(Boolean);
}

module.exports = {
  getIngredientMap,
  getIngredientById,
  getRecipeById,
  getRecipesByIds,
  searchRecipes,
  recommendRecipes,
  getCommonIngredients
};
