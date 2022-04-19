import { Linking, Alert } from 'react-native'
import { showToast } from './Utility'

/**
 * 拨打电话
 */
export function callPhone (phoneNum) {
  Alert.alert(
    '是否拨打电话',
    `${phoneNum || '400-612-1666'}`,
    [
      { text: '取消', onPress: () => {}, style: 'red' },
      {
        text: '确定',
        onPress: () => {
          const url = `tel:${phoneNum}`
          Linking.canOpenURL(url)
            .then((supported) => {
              if (!supported) {
                global.alert.show({
                  content: '您的设备不支持自动拨打，请手动拨打'
                })
                return
              }
              return Linking.openURL(url)
            })
            .catch((err) => {
              global.alert.show({
                content: `出错了：${err}`
              })
            })
        },
        style: { color: 'red' }
      }
    ],
    { cancelable: false }
  )
}
