const defaultShare = {
  title: '今晚有谱：下班不知道吃什么，就让它帮你配一餐',
  path: '/pages/home/home',
  imageUrl: '/assets/images/brand/app-avatar.jpg'
};

function enableShareMenu() {
  if (!wx.showShareMenu) return;
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  });
}

function getDefaultShare(options = {}) {
  return {
    ...defaultShare,
    ...options
  };
}

function getTimelineShare(options = {}) {
  const share = getDefaultShare(options);
  const queryIndex = share.path.indexOf('?');
  return {
    title: share.title,
    query: queryIndex >= 0 ? share.path.slice(queryIndex + 1) : '',
    imageUrl: share.imageUrl
  };
}

module.exports = {
  enableShareMenu,
  getDefaultShare,
  getTimelineShare
};
