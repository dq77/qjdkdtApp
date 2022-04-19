import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions'
import { Alert, Platform } from 'react-native'

export default class PermissionUtils {
    static PERMISSION ={
      location: {
        name: '定位',
        permission: Platform.OS === 'android' ? [PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] : [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
      },
      video: {
        name: '人脸识别',
        permission: Platform.OS === 'android' ? [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
          : [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE]
      },
      file: {
        name: '存储读写',
        permission: Platform.OS === 'android' ? [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
          : [PERMISSIONS.IOS.MICROPHONE]
      }
    }

    static async checkPermission (type, autoRequest = true) {
      const result = await Promise.all(type.permission.map(item => check(item)))
      // console.log('permission', result)
      let state = false
      for (let i = 0; i < result.length; i++) {
        if (result[i] === RESULTS.UNAVAILABLE) {
          console.log('设备不支持该功能')
          state = false
          break
        } else if (result[i] === RESULTS.DENIED) {
          console.log('无权限，可请求')
          if (autoRequest) { state = await PermissionUtils.requestPermission(type.permission[i], type) }
          if (!state) { break }
        } else if (result[i] === RESULTS.GRANTED) {
          console.log('有权限')
          state = true
        } else {
          console.log('已禁止该权限请求')
          state = false
          if (autoRequest) { PermissionUtils.showAlert(type) }
          break
        }
      }
      return state
    }

    static showAlert (type, openSetting = true) {
      Alert.alert(
        '提示',
            `你已拒绝${type.name}权限，需开启才能使用`,
            [
              { text: '取消', onDismiss: () => { }, style: 'cancel' },
              {
                text: '去开启',
                onPress: () => {
                  if (openSetting) {
                    PermissionUtils.openSetting()
                  } else {
                    this.checkPermission(type)
                  }
                }
              }
            ],
            { cancelable: false }
      )
    }

    static async requestPermission (item, type) {
      const result = await request(item)
      console.log('request', result)
      if (result === RESULTS.GRANTED) {
        return true
      } else if (result === RESULTS.DENIED) {
        PermissionUtils.showAlert(type, false)
        return false
      } else if (result === RESULTS.BLOCKED) {
        PermissionUtils.showAlert(type)
        return false
      } else {
        return false
      }
    }

    static openSetting () {
      openSettings().catch(() => console.warn('cannot open settings'))
    }
}
