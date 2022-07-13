// // 云函数入口文件
// const cloud = require('wx-server-sdk')

// cloud.init()

// // 云函数入口函数
// exports.main = async (event, context) => {
//     const wxContext = cloud.getWXContext()

//     return {
//         event,
//         openid: wxContext.OPENID,
//         appid: wxContext.APPID,
//         unionid: wxContext.UNIONID,
//     }
// }


const cloud = require('wx-server-sdk')
const CloudBase = require('@cloudbase/manager-node')
/* 初始化 */
cloud.init()
const {
  storage
} = new CloudBase()
exports.main = async (event, context) => {
  /* 
  listDirectoryFiles(cloudPath: string): Promise列出文件夹下所有文件的名称
  downloadDirectory(options): Promise下载文件夹
  listCollections(options: object): object来获取所有集合的名称，然后使用export(collectionName: string, file: object, options: object): object接口来导出所有记录到指定的json或csv文件里。
  */
  const res = await storage.getFileInfo('/ALL_IDB2/test/all/Im001_1.tif')
  console.log(res)
  return {
    data: {res},
  }
}