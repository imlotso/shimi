const { ingredientCategories, ingredients, toolList, tabooList } = require('../../utils/data');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');
function matchIngredient (item, keyword) {
  if (!keyword) return true;
  const text = [item.name].concat (item.aliases || []).join (' ').toLowerCase ();
  return text.indexOf (keyword.toLowerCase ()) >= 0;
}
Page ({
  data: {
    categories: ingredientCategories,
    activeCategory: 'common',
    query: '',
    selectedIds: [],
    selectedIngredients: [],
    visibleIngredients: [],
    tools: [],
    taboos: [],
    toolList: [],
    tabooList: []
  },
  onLoad() {
    enableShareMenu();
    this.refreshIngredients();
    this.initToolTaboo();
  },
  initToolTaboo(){
    const initTools = toolList.map(item=> ({...item, selected:false}))
    const initTaboos = tabooList.map(item=> ({...item, selected:false}))
    console.log(initTaboos)
    this.setData({
      toolList: initTools,
      tabooList: initTaboos
    })
  },
  refreshIngredients () {
    const { activeCategory, query, selectedIds } = this.data;
    const visible = ingredients
      .filter ((item) => {
        if (query) return matchIngredient (item, query);
        if (activeCategory === 'common') return item.common;
        return item.category === activeCategory;
      })
      .map ((item) => ({
        ...item,
        selected: selectedIds.indexOf (item.id) >= 0
      }));
    const selectedIngredients = selectedIds
      .map ((id) => ingredients.find ((i) => i.id === id))
      .filter (Boolean);
    this.setData ({
      visibleIngredients: visible,
      selectedIngredients
    });
  },
  switchCategory (event) {
    const id = event.currentTarget.dataset.id;
    this.setData ({
      activeCategory: id,
      query: ''
    });
    if (id !== '__tool__' && id !== '__taboo__') {
      this.refreshIngredients ();
    }
  },
  onSearchInput (event) {
    this.setData ({
      query: event.detail.value
    }, () => this.refreshIngredients ());
  },
  clearSearch () {
    this.setData ({
      query: ''
    }, () => this.refreshIngredients ());
  },
  toggleIngredient (event) {
    console.log(event)
    const id = event.currentTarget.dataset.id;
    const selectedIds = [...this.data.selectedIds];
    const index = selectedIds.indexOf (id);
    if (index >= 0) {
      selectedIds.splice (index, 1);
    } else {
      selectedIds.push (id);
    }
    this.setData ({ selectedIds }, () => this.refreshIngredients ());
  },
  removeSelected (event) {
    const id = event.currentTarget.dataset.id;
    const type = event.currentTarget.dataset.type;

    if (type === 'ingredient') {
      // 食材：id数组
      const selectedIds = this.data.selectedIds.filter((x) => x !== id);
      this.setData({ selectedIds }, () => this.refreshIngredients());
    } else if (type === 'taboo') {
      // 忌口：完整对象数组
      const taboos = this.data.taboos.filter(item => item.id !== id);
      const tabooList = this.data.tabooList.map(item =>
        item.id === id ? {...item, selected: false} : item
      );
      this.setData({ taboos, tabooList });
    } else if (type === 'tool') {
      // 厨具：和忌口完全相同逻辑，存储完整对象
      const tools = this.data.tools.filter(item => item.id !== id);
      const toolList = this.data.toolList.map(item =>
        item.id === id ? {...item, selected: false} : item
      );
      this.setData({ tools, toolList });
    }
  },
  clearSelected () {
    this.setData ({
      selectedIds: []
    }, () => this.refreshIngredients ());
  },
  toggleTool (e) {
    const id = e.currentTarget.dataset.id;
    const toolList = this.data.toolList.map(item => {
      if(item.id === id){
        return {...item, selected: !item.selected}
      }
      return item;
    })
    // 和忌口保持一致：存储完整对象，不转id数组
    const tools = toolList.filter(i=>i.selected);
    console.log(this.data.toolList)
    this.setData({toolList, tools});
  },
  toggleTaboo (e) {
    const id = e.currentTarget.dataset.id;
    const tabooList = this.data.tabooList.map(item => {
      if(item.id === id){
        return {...item, selected: !item.selected}
      }
      return item;
    })
    const taboos = tabooList.filter(i=>i.selected);
    console.log(tabooList)
    console.log(taboos)
    this.setData({tabooList, taboos});
  },
  clearAllSelect () {
    const toolList = this.data.toolList.map(item => ({...item, selected:false}));
    const tabooList = this.data.tabooList.map(item => ({...item, selected:false}));
    this.setData ({
      selectedIds: [],
      tools: [],
      taboos: [],
      toolList,
      tabooList
    }, () => this.refreshIngredients ());
  },
  onStartMatch () {
    if (!this.data.selectedIds.length) {
      wx.showToast ({
        title: ' 请选择食物 ',
        icon: 'none'
      });
      return;
    }
    const params = {
      ingredients: this.data.selectedIds,
      tools: this.data.tools,
      taboos: this.data.taboos
    };
    console.log ('【云函数请求参数】', params);
    // tools、taboos现在是对象数组，跳转时提取id
    wx.navigateTo ({
      url: `/pages/recommendations/recommendations?ids=${params.ingredients.join(',')}&tools=${params.tools.map(i=>i.id).join(',')}&taboos=${params.taboos.map(i=>i.id).join(',')}`
    });
  },
  goRecommendations () {
    if (!this.data.selectedIds.length) {
      wx.showToast ({ title: ' 先选择食材 ', icon: 'none' });
      return;
    }
    wx.navigateTo ({
      url: `/pages/recommendations/recommendations?ids=${this.data.selectedIds.join(',')}`
    });
  },
  onShareAppMessage () {
    return getDefaultShare ();
  },
  onShareTimeline () {
    return getTimelineShare ();
  }
});
