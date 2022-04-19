import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast } from '../../utils/Utility'
import { callPhone } from '../../utils/PhoneUtils'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import { getRegionTextArr } from '../../utils/Region'
import CustomerService from '../../component/CustomerService'
import { connect } from 'react-redux'
import { setFailReason } from '../../actions'

class CreditFail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      reason: ''
    }
  }

  componentDidMount () {
    this.getFailResult()
  }

  getFailResult = async () => {
    const res = await ajaxStore.credit.creditFailReason()
    if (res.data && res.data.code === '0') {
      this.setState({ reason: res.data.data.comment })
      setFailReason(res.data.data.comment)
    }
  }

  render () {
    const { navigation, userInfo } = this.props
    return (
      <View >

        <NavBar title={'授信额度申请失败'} navigation={navigation} />
        <View style={styles.container}>
          <Iconfont name={'icon-warn'} size={dp(220)} style={styles.icon} />
          <Text style={styles.title}>授信额度申请失败</Text>
          <Text style={styles.content}>{`失败原因：${this.state.reason}`}</Text>
          <SolidBtn text='重新上传授信额度申请资料' style={{ marginTop: dp(70) }}
            onPress={() => {
              navigation.navigate('BusinessTypeSelect')
            }} />
          <StrokeBtn text='拨打客服咨询热线' style={{ marginTop: dp(30) }}
            onPress={() => {
              callPhone(4006121666)
            }} />
          <Text style={styles.hint}>
            工作时间：全年 9:00-21:00
          </Text>
          <CustomerService navigation={navigation} name={userInfo.userName} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  icon: {
    marginTop: dp(100)
  },
  title: {
    fontSize: dp(40),
    marginTop: dp(40),
    fontWeight: 'bold',
    color: Color.TEXT_MAIN
  },
  content: {
    fontSize: dp(29),
    marginTop: dp(40),
    color: Color.TEXT_LIGHT,
    marginHorizontal: dp(45),
    lineHeight: dp(45)
  },
  hint: {
    fontSize: dp(25),
    marginTop: dp(30),
    color: Color.TEXT_LIGHT
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo
  }
}

export default connect(mapStateToProps)(CreditFail)
