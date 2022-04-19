import { NativeModules, Platform } from 'react-native'

export function share (text, weburl, title, callback) {
  if (Platform.OS === 'android') {
    NativeModules.UMShareModule.shareboard(text, 'res/icon', weburl, title, [2], callback)
  } else {
    // 创建原生模块
    var NativeShare = require('react-native').NativeModules.QJDShareFunction

    // 方法调用
    NativeShare.shareFunction({ text: text, weburl: weburl, title: title }, (index, message) => {
      callback(index, message)
      console.log(callback)
    })
  }
}
