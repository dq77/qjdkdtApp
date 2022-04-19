import { NativeModules, Platform } from 'react-native'
import PermissionUtils from './PermissionUtils'

export async function open (fileUrl, sessionId = '') {
  const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.file)

  if (hasPermission) {
    if (Platform.OS === 'android') {
      if (sessionId) {
        await NativeModules.X5FileReaderModule.setCookie(fileUrl, 'JSESSIONID', sessionId)
      }
      await NativeModules.X5FileReaderModule.openFileReader(fileUrl)
    } else {
      global.navigation.navigate('WebView', { url: fileUrl, title: '' })
    }
  }
}
