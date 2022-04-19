import StorageUtil from './storageUtil'

const userInfoKey = '@userInfo'
const cookieKey = '@cookie'
const themeColorKey = '@themeColor'
const sessionId = '@sessionId'
const ssoCookie = '@ssoCookie'
const tempOrderInfo = '@tempOrderInfo'// 缓存二级订单
const autoLoginInfo = '@autoLoginInfo'
const buyCarProductInfo = '@buyCarProductInfo'
const receiveAddressInfo = '@receiveAddressInfo'

class AuthUtil {
  static saveSessionId = id => {
    return StorageUtil.save(sessionId, id)
  }

  static getSessionId = () => {
    return StorageUtil.get(sessionId)
  }

  static saveSsoCookie = id => {
    return StorageUtil.save(ssoCookie, id)
  }

  static getSsoCookie = () => {
    return StorageUtil.get(ssoCookie)
  }

  static saveAutoLoginInfo = (loginName, passwd) => {
    console.log(loginName, passwd)
    return StorageUtil.save(autoLoginInfo, `${loginName}&${passwd}`)
  }

  static clearAutoLoginInfo = () => {
    return StorageUtil.delete(autoLoginInfo)
  }

  static getAutoLoginInfo = () => {
    return StorageUtil.get(autoLoginInfo)
  }

  static saveThemeColor = color => {
    return StorageUtil.save(themeColorKey, color)
  }

  static getThemeColor = () => {
    return StorageUtil.get(themeColorKey)
  }

  static saveUserInfo = info => {
    return StorageUtil.save(userInfoKey, info)
  }

  static getUserInfo = () => {
    return StorageUtil.get(userInfoKey)
  }

  static removeUserInfo = () => {
    return StorageUtil.delete(userInfoKey)
  }

  static saveCookie (cookie) {
    return StorageUtil.save(cookieKey, cookie)
  }

  static getCookie = () => {
    return StorageUtil.get(cookieKey)
  }

  static removeCookie = () => {
    return StorageUtil.delete(cookieKey)
  }

  static removeAllKeys = async () => {
    return StorageUtil.delete(await StorageUtil.keys())
  }

  static saveTempOrderInfo = info => {
    console.log('save tempOrderInfo :' + info)
    return StorageUtil.save(tempOrderInfo, info)
  }

  static removeTempOrderInfo = () => {
    console.log('delete tempOrderInfo')
    return StorageUtil.delete(tempOrderInfo)
  }

  static getTempOrderInfo = () => {
    console.log('getTempOrderInfo')
    return StorageUtil.get(tempOrderInfo)
  }

  static saveBuyCarProductInfo = info => {
    console.log('save buyCarProductInfo :' + info)
    return StorageUtil.save(buyCarProductInfo, info)
  }

  static removeBuyCarProductInfo = () => {
    console.log('delete buyCarProductInfo')
    return StorageUtil.delete(buyCarProductInfo)
  }

  static getBuyCarProductInfo = () => {
    console.log('getBuyCarProductInfo')
    return StorageUtil.get(buyCarProductInfo)
  }

  static saveReceiveAddressInfo = info => {
    console.log('save receiveAddressInfo :' + info)
    return StorageUtil.save(receiveAddressInfo, info)
  }

  static removeReceiveAddressInfo = () => {
    console.log('delete receiveAddressInfo')
    return StorageUtil.delete(receiveAddressInfo)
  }

  static getReceiveAddressInfo = () => {
    console.log('getReceiveAddressInfo')
    return StorageUtil.get(receiveAddressInfo)
  }
}

export default AuthUtil
