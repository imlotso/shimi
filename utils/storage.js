const FAVORITE_KEY = 'yp_favorite_recipe_ids';
const HISTORY_KEY = 'yp_recipe_history_ids';

function readIds(key) {
  try {
    return wx.getStorageSync(key) || [];
  } catch (error) {
    return [];
  }
}

function writeIds(key, ids) {
  wx.setStorageSync(key, ids);
}

function getFavoriteIds() {
  return readIds(FAVORITE_KEY);
}

function isFavorite(id) {
  return getFavoriteIds().indexOf(id) >= 0;
}

function toggleFavorite(id) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(id);
  if (index >= 0) {
    ids.splice(index, 1);
  } else {
    ids.unshift(id);
  }
  writeIds(FAVORITE_KEY, ids);
  return ids.indexOf(id) >= 0;
}

function addHistory(id) {
  const ids = readIds(HISTORY_KEY).filter((item) => item !== id);
  ids.unshift(id);
  writeIds(HISTORY_KEY, ids.slice(0, 20));
}

function getHistoryIds() {
  return readIds(HISTORY_KEY);
}

module.exports = {
  getFavoriteIds,
  isFavorite,
  toggleFavorite,
  addHistory,
  getHistoryIds
};
