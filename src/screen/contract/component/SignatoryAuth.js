import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import { SolidBtn } from '../../../component/CommonButton'

export default class SignatoryAuth extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      count: 0

    }
  }

  componentWillUnmount () {
    this.time && clearTimeout(this.time)
  }

  countCode (count) {
    if (count === 0) {
    } else {
      count--
      this.setState({ count: count })
      this.time = setTimeout(() => {
        this.countCode(count)
      }, 1000)
    }
  }

  async getSmsCode () {
    // const phoneRule = this.state.rule.filter(item => {
    //   return item.id === 'loginName'
    // })
    // const valid = formValid(phoneRule, this.state.form)
    // if (valid.result) {
    //   const res = await ajaxStore.common.getSmscodeForRegister({
    //     phone: this.state.form.loginName
    //   })
    //   if (res.data && res.data.code === '0') {
    this.countCode(60)
    //   }
    // } else {
    //   global.alert.show({
    //     content: valid.msg || '请认真阅读并同意《仟金顶用户协议》'
    //   })
    // }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'签署人身份验证'} navigation={navigation} />
        <Text style={{ fontSize: dp(34), marginLeft: dp(30), marginTop: dp(40) }}>短信验证</Text>
        <Text style={{ fontSize: dp(28), marginLeft: dp(30), marginTop: dp(20), color: '#888888' }}>短信验证码发送至136****7306</Text>
        <View style={styles.centerStepBg}>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>验证码</Text>
            <TextInput placeholder={'请输入验证码'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={[styles.itemInput, { width: DEVICE_WIDTH - dp(180) - dp(60) - DEVICE_WIDTH * 0.3 }]}
              // value={this.state.form.corpName}
              maxLength={6}
              onChangeText={text => {
                // this.setState({
                //   form: { ...this.state.form, corpName: text }
                // })
              }}
            />
            {this.state.count === 0 ? (
              <Touchable onPress={() => { this.getSmsCode() }}>
                <Text style={styles.smsBtn}>{'获取短信验证码'}</Text>
              </Touchable>
            ) : (
              <Text style={[styles.smsBtn, styles.countBtn]}>
                {this.state.count + '秒后重新发送'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            // navigation.navigate('EnterpriseRealAuthSuccess', { type: '1' })
            navigation.navigate('EnterpriseRealAuthFail', { type: '1' })
          }} style={styles.btn} text={'立即认证'} />
        </View>
        <Touchable onPress={() => {

        }}>
          <Text style={{ fontSize: dp(28), textAlign: 'center', marginTop: dp(60), color: '#0F8EE9' }}>{'收不到短信？切换人脸识别方式验证身份'}</Text>
        </Touchable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  btn: {
    marginTop: dp(60)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  topStepBg: {
    height: dp(240),
    width: DEVICE_WIDTH
  },
  topStepNumBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    height: dp(56)
  },
  topStepNBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centerStepBg: {
    marginTop: dp(20),
    width: DEVICE_WIDTH,
    backgroundColor: 'white'
  },
  topStepLineBg: {
    top: dp(57) + dp(31),
    height: dp(6),
    backgroundColor: 'white',
    marginHorizontal: dp(130)
  },
  topStepTextBg: {
    top: dp(56) + dp(28),
    marginHorizontal: dp(60),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemInput: {
    fontSize: dp(28),
    height: dp(90),
    width: DEVICE_WIDTH - dp(180) - dp(60),
    color: Color.TEXT_MAIN,
    marginLeft: dp(180),
    position: 'absolute'
  },
  smsBtn: {
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    color: '#00b2a9',
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    textAlign: 'center'
  },
  countBtn: {
    color: Color.TEXT_LIGHT,
    borderColor: Color.TEXT_LIGHT
  }
})
