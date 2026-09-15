const { tabooList } = require('../../utils/data');
Page({
  data:{
    tabooList:[],
    selectedTaboos:[]
  },
  onLoad(){
    //初始化，带上selected标记，和ingredients逻辑完全对齐
    const init = tabooList.map(item=>({...item,selected:false}))
    this.setData({tabooList:init})
  },
  //勾选/取消忌口，复用toggle逻辑
  toggleTaboo(e){
    const id = e.currentTarget.dataset.id
    const tabooList = this.data.tabooList.map(item=>{
      if(item.id === id){
        return {...item,selected:!item.selected}
      }
      return item
    })
    const selectedTaboos = tabooList.filter(i=>i.selected)
    this.setData({tabooList,selectedTaboos})
  },
  //提交，携带忌口id跳转到推荐页
  submitTaboo(){
    if(this.data.selectedTaboos.length === 0){
      return wx.showToast({title:'请选择忌口食材',icon:'none'})
    }
    const tabooIds = this.data.selectedTaboos.map(i=>i.id).join(',')
    wx.navigateTo({
      url:`/pages/recommendations/recommendations?taboos=${tabooIds}`
    })
  }
})
