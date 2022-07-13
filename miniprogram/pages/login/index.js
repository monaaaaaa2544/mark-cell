//自定义变量，存储用户输入的账号
let account = ''
//自定义变量，存储用户输入的密码
let password = ''
Page({

  //点击跳转到注册页
  toSign(){
    wx.navigateTo({
      url: '/pages/sign/sign',
    })
  },

    //获取用户输入的账号、密码
    getAccount(e){
        // console.log("用户输入的账号",e.detail.value);
        account = e.detail.value
    },
  getPassword(e){
    // console.log("用户输入的密码",e.detail.value);
    password = e.detail.value
  },

  //登录功能
  loadByAccount(){
    //校验账号
    if(account.length<4){
      wx.showToast({
        title: '账号至少4位',
        icon:"none"
      })
      return
    }
    //校验密码长度
    if(password.length<3){
        wx.showToast({
        title: '密码至少3位',
        icon:"none"
        })
        return
    }

    //登录功能的实现
    wx.cloud.database().collection("users")
    .where({
      account:account
    })
    .get({})
    .then(res=>{
      console.log("获取账号成功",res);
     
      //校验密码是否等于数据库中的密码
      if(password==res.data[0].password){
        console.log("登录成功",res);
        //显示登录成功提示
        wx.showToast({
          title: '登录成功',
          icon:"success",
          duration:2000,
          //提示2秒后自动跳转到首页
          success:function(){
            setTimeout(function(){
                wx.redirectTo({
                    url: '../markCell/index',  //跳转至首页
                })
            },500)
          }
        })
      }else{
        console.log("密码不正确，登录失败");
        wx.showToast({
          title: '密码不正确',
          icon:"none"
        })
      }
    })
    .catch(err=>{
      console.log("获取账号失败",err);
      wx.showToast({
        title: '账号不存在',
        icon:"none"
      })
    })
  },
})