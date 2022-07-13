// index.js


Page({
   onLoad(){
    wx.navigateTo({
        // url: '/pages/login/index', 
        url: '/pages/markCell/index', //调试时暂时这样

        success: function(res) {
            console.log("redirect to login pages")
        }
      })
   }
  });
  