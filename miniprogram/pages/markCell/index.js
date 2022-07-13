

Page({
    data: {
        penSize : 10, //画笔粗细默认值
        penColor : "rgba(255,0,0,0.6)",//画笔颜色默认值
        cellType: [
            { text: 'ALL', value: 0 },
            { text: 'AML', value: 1 },
            { text: 'Other', value: 2 },
        ],
        cellTypeValue: 0,
        hasMarked: false,
        noMarked: true,
        // markedImg:[ 
        //     {type:"ALL", src:"https://i-s2.328888.xyz/2022/06/28/62ba60a760a3d.bmp"},
        // ],
        // noMarkedImg:[
        //     {type: "ALL", src:"https://i-s2.328888.xyz/2022/06/28/62ba601980808.bmp"},
        //     {type: "AML", src:"https://s1.328888.xyz/2022/06/17/0in7q.png"},
        // ],
        allImgList:[
            // {id:0, type: "ALL", src:"https://i-s2.328888.xyz/2022/06/28/62ba601980808.bmp", benign:true, marked:true},
            // {id:1, type: "AML", src:"https://s1.328888.xyz/2022/06/17/0in7q.png", benign:true,  marked:false},
            // {id:2, type:"ALL", src:"https://i-s2.328888.xyz/2022/06/28/62ba60a760a3d.bmp",  benign:true, marked:false},
        ],
        currentImgList:[],
        currentImg:null,
        fileIDs:[]
    },

    

    startX: 0, //保存X坐标轴变量
    startY: 0, //保存X坐标轴变量
    isClear : false, //是否启用橡皮擦标记
    //手指触摸动作开始

    
    context:null,
    backContext:null,
    myCanvas:null,
    backCanvas:null,
    canvasWidth:0,
    canvasHeight:0,


    onLoad(){
        // wx.cloud.callFunction({
        //     name:"loging",
        //     data:{
        //         a:1,
        //         b:2,
        //     },
        // }).then((res)=>{
        //     console.log(res.result)
        // })


        // 获取图片
        wx.cloud.database().collection("images")
            .get()
            .then(res=>{
                console.log("请求成功",res);
                this.setData({
                    allImgList:res.data
                })
                console.log(this.data.allImgList)
            })
            .catch(err=>{
            console.log("请求失败",err);
        }).then((res)=>{
                // 上层绘图图层
                wx.createSelectorQuery()
                .select('#myCanvas') // 在 WXML 中填入的 id
                .fields({ node: true, size: true })
                .exec((res) => {
                    // Canvas 对象
                    const canvas = res[0].node
                    // 渲染上下文
                    const ctx = canvas.getContext('2d')

                    // Canvas 画布的实际绘制宽高
                    this.canvasWidth = res[0].width
                    this.canvasHeight= res[0].height

                    // 初始化画布大小
                    const dpr = 2
                    canvas.width = this.canvasWidth * dpr
                    canvas.height = this.canvasHeight * dpr
                    ctx.scale(dpr, dpr)

                    // ctx.globalAlpha = 0.3

                    this.context=ctx
                    this.myCanvas=canvas
                
                })

                // 背景图层
                wx.createSelectorQuery()
                .select('#backCanvas') // 在 WXML 中填入的 id
                .fields({ node: true, size: true })
                .exec((res) => {
                    // Canvas 对象
                    const canvas = res[0].node
                    // 渲染上下文
                    const ctx = canvas.getContext('2d')

                    // Canvas 画布的实际绘制宽高
                    this.canvasWidth = res[0].width
                    this.canvasHeight= res[0].height
                    

                    // 初始化画布大小
                    const dpr = 2
                    canvas.width = this.canvasWidth * dpr
                    canvas.height = this.canvasHeight * dpr
                    ctx.scale(dpr, dpr)

                    // let img=canvas.createImage();
                    // img.src="https://s1.328888.xyz/2022/06/17/0in7q.png"
                    // img.onload=function(){
                    //     ctx.drawImage(img, 0, 0, 300, 300)
                    // }
                    

                    this.backContext=ctx
                    this.backCanvas=canvas
                
                    })

                    // 加载图片
                this.LoadImgs()
                    
            })


    },

    // 根据筛选条件加载图片列表
    LoadImgs(){

        // 清空列表
        this.setData({
            currentImgList:[]
        })


        // 添加已标注图片
        if(this.data.hasMarked){
            // 筛选出类型ALL+已标记的图片
            let addImg=this.data.allImgList.filter((item)=>{
                let currentType=this.data.cellType.filter(item=> item.value===this.data.cellTypeValue)
                if(item.type===currentType[0].text && item.marked===true){
                    return true
                }
            })

            
            // 添加图片
            let tmp=this.data.currentImgList.concat(addImg)
            this.setData({
                currentImgList:tmp
            })
        }

        // 添加未标注图片
        if(this.data.noMarked){
            // 筛选出类型ALL+未标记的图片
            let addImg=this.data.allImgList.filter((item)=>{
                let currentType=this.data.cellType.filter(item=> item.value===this.data.cellTypeValue)
                if(item.type===currentType[0].text && item.marked===false){
                    return true
                }
            })


            let tmp=this.data.currentImgList.concat(addImg)
            this.setData({
                currentImgList:tmp
            })
        }

        console.log("current_image:",this.data.currentImgList)
        
        // 刷新当前图片
        if(this.data.currentImgList.length===0){
            this.setData({
                currentImg:''
            })
        }else{
            this.setData({
                currentImg:this.data.currentImgList[0]
            })
        }
    },

    onChangeMarked:function(e){
        this.NotifySaveImg("").then(res=>{
            console.log(res)
            this.setData({
                hasMarked:e.detail
            })
            this.LoadImgs()
            this.ImgIsEmpty()
            this.clearMyCanvas()
        })
    },

    onChangeNoMarked:function(e){
        this.NotifySaveImg("").then(res=>{
            this.setData({
                noMarked:e.detail
            })
            this.LoadImgs()
            this.ImgIsEmpty()
            this.clearMyCanvas()
        })
       
    },

    ChangeType:function(e){
        this.NotifySaveImg("").then(res=>{
            this.setData({
                cellTypeValue:e.detail
            })
            this.LoadImgs()
            this.ImgIsEmpty()
            this.clearMyCanvas()
            
        })
    },

    
    touchStart:function(e){
       
        // 得到触摸点的坐标
        this.startX = e.changedTouches[0].x
        this.startY = e.changedTouches[0].y
        // console.log(this.startX, this.startY)

        let X=e.touches[0].x
        let Y=e.touches[0].y


        // 矩形
        // this.context.clearRect(e.touches[0].x, e.touches[0].y, this.data.penSize, this.data.penSize)
        // this.context.fillStyle=this.data.penColor
        // this.context.fillRect(e.touches[0].x, e.touches[0].y, this.data.penSize, this.data.penSize)

        // 圆形
        this.context.beginPath();
        // this.clearArc(this.context, X, Y, this.data.penSize)
        this.context.fillStyle=this.data.penColor
        this.context.arc(X, Y, this.data.penSize, 0, Math.PI*2);
        this.context.fill();
    },

    lastX:0,
    lastY:0,
     //手指触摸后移动
    touchMove: function (e) {
            var startX1 = e.changedTouches[0].x
            var startY1 = e.changedTouches[0].y
            // console.log(startX1, startY1)
            // console.log(this.context)
            
            let X=e.touches[0].x
            let Y=e.touches[0].y
            // 矩形
            // this.context.clearRect(X, Y, this.data.penSize, this.data.penSize)
            // this.context.fillStyle=this.data.penColor
            // this.context.fillRect(X, Y, this.data.penSize, this.data.penSize)

            // 圆形
            this.clearArc(this.context, X, Y, this.data.penSize)
            this.context.beginPath();
            this.context.fillStyle=this.data.penColor
            this.context.arc(X, Y, this.data.penSize, 0, Math.PI*2);
            this.context.fill();

    },

    // //手指触摸动作结束
    touchEnd: function () {
    },

    pageNext:function(){
        this.saveImg().then(res=>{
            this.LoadImgs()
            this.ImgIsEmpty()
            this.clearMyCanvas()
        })
    },

    
    pagePre:function(){
        this.saveImg().then(res=>{
            this.LoadImgs()
            this.ImgIsEmpty()
            this.clearMyCanvas()
        })
    },

    saveImg:function(){
        console.log('save')
        return new Promise((resolve, reject)=>{
                // 保存图片
                wx.canvasToTempFilePath({
                    canvas: this.myCanvas,
                    success: function (res) {
                        //把图片保存到相册
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath, //canvasToTempFilePath返回的tempFilePath
                        })
                        resolve('succ')
                    },
                    fail:(err)=>{
                        reject(err)
                    }
                })
        
                // wx.canvasToTempFilePath({
                //     canvas: this.backCanvas,
                //     success: function (res) {
                //         console.log(res.tempFilePath, res)
                //         //把图片保存到相册
                //         wx.saveImageToPhotosAlbum({
                //             filePath: res.tempFilePath, //canvasToTempFilePath返回的tempFilePath
                //         })
                //         resolve("succ")
                //     },
                //     fail:(err)=>{
                //         reject(err)
                //     }
                // })

                console.log(this.data.currentImg)

                wx.downloadFile({
                  url: this.data.currentImg,
                  success:(res)=>{
                      wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath
                      })
                      console.log(res.tempFilePath)
                  },
                  fail(err){
                      console.log('err')
                  }
                })
                
        

        })    


    },

    uploadImage:function(){
        let _this=this
        //选取图片

        new Promise((resolve, reject)=>{
            wx.chooseMedia({
                count: 9,
                mediaType: ['image','video'],
                sourceType: ['album', 'camera'],
                maxDuration: 30,
                camera: 'back',
                success(res) {
                        //   console.log(res.tempFiles)
                        //   console.log(res.tempFiles[0].size)
        
                    //上传图片
                    // 获取选取的图片
                    const tempFiles = res.tempFiles
                    let httpData=[]
                    for (let i = 0; i < tempFiles.length; i++) {
                        httpData.push(_this.upload(tempFiles[i]))
                    }
                    // console.log(httpData)
                    Promise.all(httpData).then(res=>{
                        wx.showToast({
                            title: '上传成功',
                            icon: 'success',
                            duration:0
                        })
                        resolve("上传所有图片成功！")
                    })
                    
                }
            })
            
        }).then(res=>{
                // 同步到数据库
                console.log(res)
                console.log(this.data.fileIDs)
        })


    },

    upload(file){
       return new Promise((resolve, reject)=>{
        //    let uploadStatus=false //记录是否上传成功
           // 循环上传每一张选取的图片
                wx.cloud.uploadFile({
                        cloudPath: new Date().getTime() +'.png', // 上传至云端的路径
                        filePath: file.tempFilePath, // 小程序临时文件路径
                        success:res=>{
                            this.setData({
                                fileIDs: this.data.fileIDs.concat(res.fileID)
                            })
                            resolve()
                        },
                        fail:err=>{
                            reject()
                        }
                })

       })             
    },



    clearArc(context, x, y, radius) {
        // context.save();
        context.globalCompositeOperation = 'xor';
        context.beginPath();
        context.fillStyle="rgba(255,0,0,0.1)"
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
        // context.restore();
    },

    clearMyCanvas(){
        console.log('clear')
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

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

    ImgIsEmpty(){
        if(this.data.currentImgList.length===0){
            // wx.showModal({
            //     title: '没有图片了',
            //     content: "",
            //     success (res) {
            //       if (res.confirm) {
            //         console.log("确定")
            //       } else if (res.cancel) {
            //         console.log('用户点击取消')
            //       }
            //     }
            //   })
           console.log("没有图片了")
        }
    }

    
  });