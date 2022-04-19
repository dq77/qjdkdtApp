import { NativeModules, Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import PermissionUtils from './PermissionUtils'
import { getLocation } from './LocationUtils'
import store from '../store/index'
import ajaxStore from './ajaxStore'

export async function onPageStart (name) {
  // console.log('hxl', '打开：' + name)
  if (Platform.OS === 'android') {
    NativeModules.UMAnalyticsModule.onPageStart(name)
  } else {
    NativeModules.QJDStatistical.onPageStart(name)
  }
}
export async function onPageEnd (name) {
  // console.log('hxl', '关闭：' + name)
  if (Platform.OS === 'android') {
    NativeModules.UMAnalyticsModule.onPageEnd(name)
  } else {
    NativeModules.QJDStatistical.onPageEnd(name)
  }
}
export async function onKillProcess () {
  if (Platform.OS === 'android') {
    NativeModules.UMAnalyticsModule.onKillProcess()
  } else {

  }
}
// export async function onEvent (eventID, property = null) {
//   if (Platform.OS === 'android') {
//     NativeModules.UMAnalyticsModule.onEventObject(eventID, property)
//   } else {
//     NativeModules.QJDStatistical.onEvent(eventID, property)
//   }
// }

/**
 * 点击埋点
 * @param {*} target 事件名称
 * @param {*} pathname 页面路径
 * @param {*} property 事件其他参数
 */
export async function onClickEvent (target, pathname, property = {}) {
  onEvent(target, pathname, '', property, false)
}

/**
 * 埋点
 * 默认参数： 触发时间  设备类型 操作系统 app版本号 gps  用户id 操作人员
 * @param {*} target 事件名称
 * @param {*} pathname 页面路径
 * @param {*} element 事件请求的接口url
 * @param {*} property 事件其他参数
 */
export async function onEvent (target, pathname, element, property = {}, isAjax = true) {
  // 触发时间
  const webCreateTime = new Date().getTime()
  // 设备类型
  const host = Platform.OS
  // 操作系统
  const os = host + DeviceInfo.getSystemVersion()
  // app版本号
  const versionNo = DeviceInfo.getVersion()
  // 设备号
  const deviceId = DeviceInfo.getDeviceId()
  // 设备名称
  const deviceName = await DeviceInfo.getDeviceName()
  // mac地址
  const mac = await DeviceInfo.getMacAddress()
  // id
  const ip = await DeviceInfo.getIpAddress()
  // uniqueId
  const uniqueId = await DeviceInfo.getUniqueId()
  // gps
  const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.location, false)
  let gps = ''
  if (hasPermission) {
    gps = await getLocation()
  }

  const state = store.getState()
  let id, operator, customerId, companyName
  if (state && state.user && state.user.userInfo) {
    // 用户id  cifcompanyid
    id = state.company.companyId
    // 操作人员 memberId
    operator = state.user.userInfo.memberId
    // 公司名称
    companyName = state.company.corpName || state.user.userInfo.corpName || state.user.userInfo.userName
    // 新版用户id
    customerId = state.company.customerId
  }
  id = id || property.cifCompanyId || ''
  operator = operator || property.memberId || ''
  companyName = companyName || property.companyName || ''

  const custom = Object.assign(
    {
      os,
      versionNo,
      deviceId,
      deviceName,
      ip,
      mac,
      uniqueId,
      gps,
      id,
      operator
    },
    property
  )

  const prop = {
    webCreateTime,
    info: {
      host,
      method: isAjax ? 'ajaxCallback' : 'self-button',
      pathname,
      element,
      target,
      result: JSON.stringify(custom)
    },
    userInfo: {
      id, // 旧参数名，暂时保留
      operator, // 旧参数名，暂时保留
      customerId,
      companyName: companyName || '',
      cifCompanyId: id || '',
      memberId: operator || ''
    }
  }
  console.log(prop)
  global.showError = false
  ajaxStore.common.sendEvent({ data: JSON.stringify(prop) })
  global.showError = true
}
