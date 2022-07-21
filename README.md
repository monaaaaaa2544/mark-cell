# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 网页设计图
<a href="https://www.figma.com/file/Dy1muYpadKle7DboNcdcxF/%E7%99%BD%E7%BB%86%E8%83%9E%E6%A0%87%E6%B3%A8APP?node-id=0%3A1">APP设计图</a>

## 技术栈
Vant Weapp、微信小程序、云服务、Canvas

## 功能
- [x]  涂抹标注感兴趣区域（类似于微信中马赛克）
- [x]  清空绘图
- []  切换到下一张、上一张
- [x]  筛选已标注、未标注、细胞类型
- [x]  标记细胞良性、恶性
- [x]  提示（是否保存、图片已标注完）
- []  保存图片（云存储，设置合法域名）
- [x]   上传本地图片到云存储，同步到数据库
- []   下载图片到本地


## 问题
- 异步问题
```javascript
实现以下子函数异步执行
onChangeMarked:function(e){
        this.NotifySaveImg("")
        this.LoadImgs()
        this.ImgIsEmpty()
        this.setData({
            hasMarked:e.detail
        })
    },

修改NotifySaveImg函数：
NotifySaveImg(str){
    return new Promise((resolve, reject)=>{
        let _this=this
        wx.showModal({
            title: '是否保存图片',
            content: str,
            success (res) {
                if (res.confirm) {
                _this.saveImg()
                } else if (res.cancel) {
                console.log('用户点击取消')
                }
                resolve('heihei')
            },
            fail(err){
                reject(err)
            }
            })
    })
},

修改后可以异步执行：
onChangeMarked:function(e){
        this.NotifySaveImg("").then(res=>{
            this.LoadImgs()
            this.ImgIsEmpty()
            this.setData({
                hasMarked:e.detail
            })
        })
    },

```

- 上传一组图片，需要Promise.all
```javascript
const tempFiles = res.tempFiles
let httpData=[]
for (let i = 0; i < tempFiles.length; i++) {
    httpData.push(_this.upload(tempFiles[i]))
}
console.log(httpData)
Promise.all(httpData).then(res=>{
    wx.showToast({
        title: '上传成功',
        icon: 'success',
        duration:0
    })
})

```


- 图片懒加载
