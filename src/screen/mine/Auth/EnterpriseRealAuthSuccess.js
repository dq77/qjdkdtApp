import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

import NavBar from '../../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import { StrokeBtn } from '../../../component/CommonButton'

export default class EnterpriseRealAuthSuccess extends PureComponent {
  render () {
    const { navigation } = this.props
    const params = navigation.state.params
    return (
      <View >
        <NavBar isReturnRoot='1' title={'认证成功'} navigation={navigation} />
        <View style={{ alignItems: 'center' }}>
          <Iconfont name={'icon-result-success1'} size={dp(220)} style={{ marginTop: dp(100) }} />
          <Text style={{ fontSize: dp(40), marginTop: dp(50), color: Color.TEXT_MAIN }}>{params.type === '1' ? '实名认证成功' : '企业实名认证成功'}</Text>
          <Text style={{ fontSize: dp(30), marginTop: dp(30), color: Color.TEXT_LIGHT }}>已为您办理数字证书和电子印章</Text>
          <StrokeBtn text='返回实名认证列表' style={{ marginTop: dp(60) }} onPress={() => {
            navigation.navigate('RealNameAuth')
          }} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(7)
  }
})
