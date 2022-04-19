import React, { PureComponent } from 'react'
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import CheckBox from 'react-native-check-box'
import { NavigationActions, StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import { clearLoginInfo, setSaasInfo, setUserInfo } from '../../actions'
import CustomerService from '../../component/CustomerService'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent } from '../../utils/AnalyticsUtil'
import Color from '../../utils/Color'
import { vChineseName, vCompanyName, vPassword, vPhone, vSmsVerifyCode } from '../../utils/reg'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import StorageUtil from '../../utils/storageUtil'
import { assign, formValid, showToast } from '../../utils/Utility'

class Register extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isSecure: true,
      form: {
        corpName: '',
        name: '',
        loginName: '',
        passwd: '',
        needLogin: '1',
        code: '',
        inviteCode: '',
      },
      rule: [
        {
          id: 'corpName',
          required: true,
          reg: vCompanyName,
          name: '企业名称',
        },
        {
          id: 'name',
          required: true,
          reg: vChineseName,
          name: '联系人',
        },
        {
          id: 'loginName',
          required: true,
          reg: vPhone,
          name: '手机号码',
        },
        {
          id: 'smsVerifyCode',
          required: true,
          reg: vSmsVerifyCode,
          name: '短信验证码',
        },
        {
          id: 'passwd',
          required: true,
          reg: vPassword,
          regErrorMsg: '请输入6-16位数字或字母',
          name: '密码',
        },
        {
          id: 'inviteCode',
          required: false,
          reg: /^[a-zA-Z0-9]{6}$/,
          regErrorMsg: '请输入6位邀请码',
          name: '邀请码',
        },
      ],
      count: 0,
      checkbox: true,
    }
    this.toRegister = this.toRegister.bind(this)
    this.getSmsCode = this.getSmsCode.bind(this)
  }

  componentDidMount() {}

  async toRegister() {
    const { navigation } = this.props
    const valid = formValid(this.state.rule, this.state.form)
    if (valid.result && this.state.checkbox) {
      // 邀请码合法性校验
      if (this.state.form.inviteCode) {
        const res = await ajaxStore.common.getInviteCodeValid({ inviteCode: this.state.form.inviteCode.toUpperCase() })
        if (res.data.code === '0' && !res.data.data) {
          global.alert.show({ content: '邀请码不正确' })
          return false
        }
      }
      const res = await ajaxStore.common.goToRegister(this.state.form)
      if (res.data && res.data.code === '0') {
        // 注册后绑定用户邀请来源
        if (this.state.form.inviteCode) {
          ajaxStore.common.saveInviteCode({
            inviteCode: this.state.form.inviteCode.toUpperCase(),
            memberId: res.data.data.loginResult.memberId,
            source: `APP(${Platform.OS})`,
          })
        }
        await StorageUtil.save('memberId', res.data.data.loginResult.memberId).then(res => {
          if (!res) {
            console.log('memberId save success')
          }
        })
        await clearLoginInfo()
        await setUserInfo({
          userInfo: res.data.data,
        })
        const resetAction = {
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'MainTabs',
            }),
            NavigationActions.navigate({
              routeName: 'Certification',
              params: { isUpdate: false },
            }),
          ],
        }
        this.props.navigation.dispatch(StackActions.reset(resetAction))
        // navigation.navigate('Certification', { isUpdate: false })
        if (res.data.data.tenantVO) {
          setSaasInfo(res.data.data.tenantVO)
        }
        onEvent('用户登录成功', 'Register', '/ofs/weixin/user/register', {
          cifCompanyId: '',
          companyName: res.data.data.loginResult ? res.data.data.loginResult.userName : '',
          memberId: res.data.data.loginResult ? res.data.data.loginResult.memberId : '',
        })
        showToast('注册成功')
      }
    } else {
      global.alert.show({
        content: valid.msg || '请认真阅读并同意《仟金顶用户协议》',
      })
    }
  }

  countCode(count) {
    if (count === 0) {
    } else {
      count--
      this.setState({ count: count })
      setTimeout(() => {
        this.countCode(count)
      }, 1000)
    }
  }

  async getSmsCode() {
    const phoneRule = this.state.rule.filter(item => {
      return item.id === 'loginName'
    })
    const valid = formValid(phoneRule, this.state.form)
    if (valid.result) {
      const res = await ajaxStore.common.getSmscodeForRegister({
        phone: this.state.form.loginName,
      })
      console.log(res, 'dddd')
      if (res.data && res.data.code === '0') {
        this.countCode(60)
      }
    } else {
      global.alert.show({
        content: valid.msg || '请认真阅读并同意《仟金顶用户协议》',
      })
    }
  }

  render() {
    const { navigation, themeColor } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'注册'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-companyName'} size={dp(70)} />
              <TextInput
                autoFocus
                placeholder={'企业名称'}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.textInput}
                value={this.state.form.corpName}
                maxLength={30}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    corpName: text,
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-uname'} size={dp(70)} />
              <TextInput
                placeholder={'联系人'}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.textInput}
                value={this.state.form.name}
                maxLength={10}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    name: text,
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-phone'} size={dp(70)} />
              <TextInput
                placeholder={'手机号码'}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                keyboardType={'phone-pad'}
                style={styles.textInput}
                maxLength={11}
                value={this.state.form.loginName}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    loginName: text,
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-valcode'} size={dp(70)} />
              <TextInput
                placeholder={'短信验证码'}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.smsTextInput}
                value={this.state.form.smsVerifyCode}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    smsVerifyCode: text,
                  })
                  this.setState({ form: data })
                }}
              />
              {this.state.count === 0 ? (
                <Touchable onPress={this.getSmsCode}>
                  <Text style={styles.smsBtn}>{'获取短信验证码'}</Text>
                </Touchable>
              ) : (
                <Text style={[styles.smsBtn, styles.countBtn]}>{this.state.count + '秒后重新发送'}</Text>
              )}
            </View>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-pwd'} size={dp(70)} />
              <TextInput
                placeholder={'6-16位字符密码'}
                placeholderTextColor={Color.TEXT_DARK}
                style={styles.textInput}
                value={this.state.form.passwd}
                maxLength={16}
                secureTextEntry={this.state.isSecure}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    passwd: text,
                  })
                  this.setState({ form: data })
                }}
              />
              <Touchable
                activeOpacity={1}
                isPreventDouble={false}
                style={styles.eye}
                onPress={() => {
                  this.setState({ isSecure: !this.state.isSecure })
                }}
              >
                <Iconfont
                  name={this.state.isSecure ? 'icon-pwdhide' : 'icon-pwdsee'}
                  size={dp(80)}
                  color={themeColor}
                />
              </Touchable>
            </View>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'yaoqingma'} size={dp(70)} />
              <TextInput
                placeholder={'邀请码'}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.textInput}
                value={this.state.form.inviteCode}
                maxLength={6}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    inviteCode: text,
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            <View style={styles.checkboxWrapper}>
              <CheckBox
                style={styles.checkbox}
                checkBoxColor={Color.TEXT_LIGHT}
                uncheckedCheckBoxColor={Color.TEXT_LIGHT}
                checkedCheckBoxColor={'#00b2a9'}
                onClick={() => {
                  this.setState({
                    checkbox: !this.state.checkbox,
                  })
                }}
                isChecked={this.state.checkbox}
                checkedImage={
                  <Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
                }
                unCheckedImage={
                  <Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
                }
                rightText={'我已阅读并同意'}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <Touchable
                style={styles.linkTextMain}
                onPress={() => {
                  navigation.navigate('WebView', {
                    url: 'https://webtools.qjdchina.com/userAgreement.html',
                    title: '用户协议及隐私政策',
                  })
                  // navigation.navigate('RegisterContact')
                }}
              >
                <Text style={styles.linkText}>{'《仟金顶用户协议》'}</Text>
              </Touchable>
            </View>
            {formValid(this.state.rule, this.state.form).result && this.state.checkbox ? (
              <Touchable style={{ ...styles.register, backgroundColor: themeColor }} onPress={this.toRegister}>
                <Text style={styles.registerText}>{'注册'}</Text>
              </Touchable>
            ) : (
              <Touchable
                style={{ ...styles.register, backgroundColor: themeColor, ...styles.disabled, marginBottom: dp(30) }}
                onPress={this.toRegister}
              >
                <Text style={styles.registerText}>{'注册'}</Text>
              </Touchable>
            )}

            <CustomerService navigation={navigation} />
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.WHITE,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: dp(100),
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Color.ICON_GRAY,
    borderBottomWidth: dp(1),
  },
  textInput: {
    width: DEVICE_WIDTH * 0.7,
    height: dp(80),
    margin: dp(20),
    paddingLeft: dp(5),
    paddingRight: dp(50),
    color: Color.TEXT_MAIN,
  },
  register: {
    width: DEVICE_WIDTH * 0.9,
    marginTop: dp(60),
    padding: dp(30),
    borderRadius: dp(10),
  },
  registerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(32),
  },
  eye: {
    position: 'absolute',
    right: dp(20),
    padding: dp(5),
  },
  smsTextInput: {
    width: DEVICE_WIDTH * 0.4,
    height: dp(80),
    margin: dp(20),
    paddingLeft: dp(5),
    paddingRight: dp(50),
    color: Color.TEXT_MAIN,
  },
  smsBtn: {
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    color: '#00b2a9',
    borderColor: '#00b2a9',
    padding: dp(15),
    borderWidth: dp(2),
    borderRadius: dp(10),
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead',
  },
  countBtn: {
    color: Color.TEXT_LIGHT,
    borderColor: Color.TEXT_LIGHT,
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingTop: dp(30),
    paddingHorizontal: dp(50),
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.34,
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
  },
  linkTextMain: {},
  linkText: {
    color: '#2ea2db',
  },
  customerServiceWrapper: {
    flex: 1,
    marginTop: dp(50),
  },
  customerServiceMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerServiceText: {
    color: Color.TEXT_LIGHT,
    marginLeft: dp(10),
  },
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
  }
}

export default connect(mapStateToProps)(Register)
