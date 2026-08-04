App({
  onLaunch() {
    this.globalData.cloudReady = false;
    if (wx.cloud) {
      try {
        wx.cloud.init({
          traceUser: false
        });
        this.globalData.cloudReady = true;
      } catch (error) {
        console.warn('cloud init failed', error);
      }
    }
  },

  globalData: {
    cloudReady: false,
    selectedIngredientIds: []
  }
});
