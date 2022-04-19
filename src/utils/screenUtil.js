import { PixelRatio, Dimensions, Platform, StatusBar, StyleSheet } from 'react-native'

export const DEVICE_WIDTH = Dimensions.get('window').width
export const DEVICE_HEIGHT = Dimensions.get('window').height
export const isAndroid = Platform.OS === 'android'

/**
 * 本项目设计基准像素为750 * 1334，使用时视情况调整
 * 按比例将设计的px转换成适应不同屏幕的dp
 * @param designPx 设计稿标注的px值
 * @returns {number}
 */
export function getRealDP (designPx) {
  if (designPx === 1) {
    return StyleSheet.hairlineWidth
  }
  return PixelRatio.roundToNearestPixel((designPx / 750) * DEVICE_WIDTH)
}

// 是否iphoneX系列（iPhone X, XS, XS Max & XR）
export function isIphoneX () {
  const X_WIDTH = 375
  const X_HEIGHT = 812
  const XSMAX_WIDTH = 414
  const XSMAX_HEIGHT = 896
  // const PAD_WIDTH = 768
  // const PAD_HEIGHT = 1024
  const IPHONE12_H = 844
  const IPHONE12_W = 390
  const IPHONE12MAX_H = 926
  const IPHONE12MAX_W = 428
  const IPHONE12Mini = 780

  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (
      DEVICE_HEIGHT === X_HEIGHT ||
      DEVICE_WIDTH === X_HEIGHT ||
      (DEVICE_HEIGHT === XSMAX_HEIGHT || DEVICE_WIDTH === XSMAX_HEIGHT) ||
      (DEVICE_HEIGHT === IPHONE12_H || DEVICE_WIDTH === IPHONE12_H) ||
      (DEVICE_HEIGHT === IPHONE12MAX_H || DEVICE_WIDTH === IPHONE12MAX_H) ||
      (DEVICE_HEIGHT === IPHONE12Mini || DEVICE_WIDTH === IPHONE12Mini)
    )
  )
}

// 获取状态栏高度
export function getStatusBarHeight () {
  return Platform.select({
    ios: ifIphoneX(44, 20),
    android: StatusBar.currentHeight
  })
}

// 适配iphoneX屏幕底部距离
export function getBottomSpace () {
  return Platform.select({
    ios: ifIphoneX(34, 0),
    android: 0
  })
}

/**
 * 根据是否是iPhoneX返回不同的样式
 * @param iphoneXStyle
 * @param iosStyle
 * @param androidStyle
 * @returns {*}
 */
export function ifIphoneX (iphoneXStyle, iosStyle = {}, androidStyle) {
  if (isIphoneX()) {
    return iphoneXStyle
  } else if (Platform.OS === 'ios') {
    return iosStyle
  } else {
    if (androidStyle) {
      return androidStyle
    }
    return iosStyle
  }
}
