const { toolList, tabooList } = require('../../utils/data');
const { enableShareMenu, getDefaultShare, getTimelineShare } = require('../../utils/share');
const { submitDish, uploadCover } = require('../../utils/ugc');

function blankIngredient() {
  return { name: '', num: '' };
}

function blankStep() {
  return { desc: '', time: '' };
}

function normalizeTags(text) {
  return String(text || '')
    .split(/[,，;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

Page({
  data: {
    editingId: '',
    name: '',
    totalTime: '',
    tags: '',
    coverTemp: '',
    coverFileID: '',
    toolList: [],
    tabooList: [],
    toolsSelected: [],
    taboosSelected: [],
    ingredients: [],
    steps: [],
    submitting: false
  },

  onLoad(options) {
    enableShareMenu();
    this.setData({
      toolList: toolList.map((item) => ({ ...item, selected: false })),
      tabooList: tabooList.map((item) => ({ ...item, selected: false })),
      ingredients: [blankIngredient(), blankIngredient()],
      steps: [blankStep(), blankStep()]
    });

    const dishId = String(options.dishId || '').trim();
    if (dishId) {
      this.setData({ editingId: dishId });
      wx.setNavigationBarTitle({ title: '编辑菜谱' });
      this.loadDish(dishId);
    } else {
      wx.setNavigationBarTitle({ title: '传菜谱' });
    }
  },

  loadDish(dishId) {
    if (!wx.cloud || !wx.cloud.callFunction) {
      wx.showToast({ title: '云开发不可用', icon: 'none' });
      return;
    }
    wx.cloud.callFunction({
      name: 'getDishDetail',
      data: { dishId }
    }).then((res) => {
      const dish = res && res.result && res.result.ok
        ? res.result.data
        : null;
      if (!dish) {
        wx.showToast({ title: '菜谱不存在', icon: 'none' });
        wx.navigateBack();
        return;
      }
      const toolNames = Array.isArray(dish.tools) ? dish.tools.map((t) => String(t)) : [];
      const tabooNames = Array.isArray(dish.taboos) ? dish.taboos.map((t) => String(t)) : [];
      const toolList = this.data.toolList.map((item) => ({
        ...item,
        selected: toolNames.indexOf(item.name) >= 0
      }));
      const tabooList = this.data.tabooList.map((item) => ({
        ...item,
        selected: tabooNames.indexOf(item.name) >= 0
      }));

      this.setData({
        name: dish.name || '',
        totalTime: dish.totalTime ? String(dish.totalTime) : '',
        tags: (Array.isArray(dish.tags) ? dish.tags : []).join('、'),
        coverTemp: dish.cover || '',
        coverFileID: dish.cover || '',
        toolList,
        tabooList,
        toolsSelected: toolNames,
        taboosSelected: tabooNames,
        ingredients: (Array.isArray(dish.ingredients) ? dish.ingredients : [])
          .map((item) => ({
            name: typeof item === 'string' ? item : (item.name || ''),
            num: typeof item === 'string' ? '' : (item.num || item.amount || '')
          })),
        steps: (Array.isArray(dish.steps) ? dish.steps : [])
          .map((item) => ({
            desc: typeof item === 'string' ? item : (item.desc || ''),
            time: typeof item === 'string' ? '' : ((item.time != null) ? String(item.time) : '')
          }))
      });
    }).catch((error) => {
      console.warn('加载投稿失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const temp = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath;
        if (!temp) return;
        this.setData({ coverTemp: temp, coverFileID: '' });
      }
    });
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value });
  },

  onTotalTimeInput(event) {
    this.setData({ totalTime: event.detail.value });
  },

  onTagsInput(event) {
    this.setData({ tags: event.detail.value });
  },

  toggleTool(event) {
    const id = event.currentTarget.dataset.id;
    const toolList = this.data.toolList.map((item) => {
      if (item.id !== id) return item;
      return { ...item, selected: !item.selected };
    });
    this.setData({
      toolList,
      toolsSelected: toolList.filter((item) => item.selected).map((item) => item.name)
    });
  },

  toggleTaboo(event) {
    const id = event.currentTarget.dataset.id;
    const tabooList = this.data.tabooList.map((item) => {
      if (item.id !== id) return item;
      return { ...item, selected: !item.selected };
    });
    this.setData({
      tabooList,
      taboosSelected: tabooList.filter((item) => item.selected).map((item) => item.name)
    });
  },

  addIngredient() {
    this.setData({ ingredients: this.data.ingredients.concat([blankIngredient()]) });
  },

  removeIngredient(event) {
    const index = Number(event.currentTarget.dataset.index);
    const ingredients = this.data.ingredients.slice();
    if (ingredients.length <= 1) return;
    ingredients.splice(index, 1);
    this.setData({ ingredients });
  },

  onIngredientNameInput(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setData({ [`ingredients[${index}].name`]: event.detail.value });
  },

  onIngredientNumInput(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setData({ [`ingredients[${index}].num`]: event.detail.value });
  },

  addStep() {
    this.setData({ steps: this.data.steps.concat([blankStep()]) });
  },

  removeStep(event) {
    const index = Number(event.currentTarget.dataset.index);
    const steps = this.data.steps.slice();
    if (steps.length <= 1) return;
    steps.splice(index, 1);
    this.setData({ steps });
  },

  onStepDescInput(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setData({ [`steps[${index}].desc`]: event.detail.value });
  },

  onStepTimeInput(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setData({ [`steps[${index}].time`]: event.detail.value });
  },

  validate() {
    const { name, totalTime, tags, coverTemp, toolsSelected, ingredients, steps } = this.data;

    if (!name.trim()) return '菜名不能为空';
    const totalTimeNum = Number(totalTime);
    if (!totalTimeNum || totalTimeNum <= 0) return '总用时必须是大于 0 的分钟数';

    const realIngredients = ingredients.filter((item) => item.name.trim());
    if (!realIngredients.length) return '请至少填写一种食材';
    if (realIngredients.some((item) => !String(item.num).trim())) return '每种食材都要填写用量';

    const realSteps = steps.filter((item) => item.desc.trim());
    if (!realSteps.length) return '请至少填写一个步骤';
    for (const step of realSteps) {
      const timeNum = Number(step.time);
      if (!step.desc.trim()) return '步骤描述不能为空';
      if (!timeNum || timeNum <= 0) return '每个步骤都要填写耗时分钟';
    }

    if (!toolsSelected.length) return '请至少选择一件厨具';
    if (!coverTemp) return '请选择一张封面图';
    return '';
  },

  buildPayload() {
    const { name, totalTime, tags, coverFileID, toolsSelected, taboosSelected, ingredients, steps } = this.data;
    return {
      name: name.trim(),
      totalTime: Number(totalTime),
      tags: normalizeTags(tags),
      cover: coverFileID,
      tools: toolsSelected,
      taboos: taboosSelected,
      ingredients: ingredients
        .filter((item) => item.name.trim())
        .map((item) => ({ name: item.name.trim(), num: String(item.num).trim() })),
      steps: steps
        .filter((item) => item.desc.trim())
        .map((item) => ({ desc: item.desc.trim(), time: Number(item.time) }))
    };
  },

  async submit() {
    if (this.data.submitting) return;
    const errorText = this.validate();
    if (errorText) {
      wx.showToast({ title: errorText, icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      let cover = this.data.coverFileID;
      if (!cover && this.data.coverTemp) {
        cover = await uploadCover(this.data.coverTemp);
      }

      const payload = this.buildPayload();
      payload.cover = cover;
      if (this.data.editingId) {
        payload._id = this.data.editingId;
        await submitDish({ action: 'update', ...payload });
        wx.showToast({ title: '已更新，重新等待审核', icon: 'success' });
      } else {
        await submitDish({ action: 'add', ...payload });
        wx.showToast({ title: '已提交，等待审核', icon: 'success' });
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1200);
    } catch (error) {
      console.warn('投稿失败', error);
      wx.showToast({
        title: (error && error.message) || '提交失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onShareAppMessage() {
    return getDefaultShare({
      title: '今晚有谱：把你常做的菜分享出来',
      path: '/pages/dishUpload/dishUpload'
    });
  },

  onShareTimeline() {
    return getTimelineShare({
      title: '今晚有谱：上传自己的拿手菜',
      path: '/pages/dishUpload/dishUpload'
    });
  }
});