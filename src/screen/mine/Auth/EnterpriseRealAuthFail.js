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
import ajaxStore from '../../../utils/ajaxStore'
import { SolidBtn, StrokeBtn } from '../../../component/CommonButton'

export default class EnterpriseRealAuthFail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      failReason: ''
    }
  }

  render () {
    const { navigation } = this.props
    const buzKey = navigation.state.params

    return (
      <View >
        <NavBar isReturnRoot='1' title={'认证失败'} navigation={navigation} />
        <View style={{ alignItems: 'center' }}>
          <Iconfont name={'icon-warn'} size={dp(220)} style={{ marginTop: dp(100) }} />
          <Text style={{ fontSize: dp(40), marginTop: dp(40), color: Color.TEXT_MAIN }}>{buzKey.buzKey.type === '1' ? '实名认证失败' : '企业实名认证失败'}</Text>
          <Text style={{ fontSize: dp(30), marginTop: dp(40), color: Color.TEXT_LIGHT }}>{`失败原因：${buzKey.buzKey.resultMessage}`}</Text>
          <SolidBtn text='再次认证' style={{ marginTop: dp(70) }} onPress={() => {
            navigation.navigate('RealNameAuth')
          }} />
          <StrokeBtn text='返回实名认证列表' style={{ marginTop: dp(30) }} onPress={() => {
            navigation.navigate('RealNameAuth')
          }} />
        </View>
      </View>
    )
  }

  componentDidMount () {
    // this.getLicenseData()
  }
}

const styles = StyleSheet.create({
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(7)
  }
})
