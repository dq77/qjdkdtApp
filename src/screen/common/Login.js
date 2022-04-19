import React, { PureComponent } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { NavigationActions, StackActions } from 'react-navigation'
import { getAreaData, setCreditStatus, setSessionInfo, setUserInfo } from '../../actions'
import CustomerService from '../../component/CustomerService'
import EnvInfo from '../../component/EnvInfo'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent, onPageStart } from '../../utils/AnalyticsUtil'
import AuthUtil from '../../utils/AuthUtil'
import Color from '../../utils/Color'
import { baseUrl, pwd, shenheBaseUrl, version } from '../../utils/config'
import Dimen from '../../utils/Dimen'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp, getStatusBarHeight } from '../../utils/screenUtil'
import StorageUtil from '../../utils/storageUtil'
import { enc, handleSetCookie } from '../../utils/Utility'

/**
 * LoginScreen
 */
export default class Login extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loginName: '',
      passwd: '',
      verifyCode: '',
      loadingText: '登录中',
      verifyKey: '',
      verifyCodeImg: '',
    }
    this.toLogin = this.toLogin.bind(this)
    this.refreshVerifyCode = this.refreshVerifyCode.bind(this)
  }

  async componentDidMount() {
    onPageStart('Login') // 统计登录页特殊处理

    // BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
    // setTimeout(async () => {
    //   let autologinInfo = await AuthUtil.getAutoLoginInfo()
    //   autologinInfo = autologinInfo ? autologinInfo.split('&') : []
    //   if (autologinInfo.length) {
    //     await this.setState({
    //       loginName: dec(autologinInfo[0], pwd),
    //       passwd: dec(autologinInfo[1], pwd)
    //     })
    //     this.toLogin()
    //   }
    // })
  }

  // componentWillUnmount () {
  //   BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  // }

  async refreshVerifyCode() {
    // const res = await ajaxStore.common.refreshVerifyCode({
    //   verifyKey: this.state.verifyKey
    // })
    // if (res.data && res.data.code === '0') {
    //   this.setState({
    //     verifyCodeImg: res.data.data.verifyCode
    //   })
    // }
    const date = new Date()
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    this.setState({
      verifyCodeImg: `${defaultUrl}/user/captcha/picture?&${date}`,
    })
  }

  async toLogin() {
    Keyboard.dismiss()
    const { navigation } = this.props
    if (this.state.loginName === '13300500016') {
      // shneghe账号 pres  密码 pres
      await StorageUtil.save('isShenHe', '1').then(res => {
        if (!res) {
          console.log('save success')
        }
      })
    } else {
      await StorageUtil.save('isShenHe', '0')
    }

    if (this.state.loginName === '') {
      global.alert.show({
        content: '账号不能为空',
      })
    } else if (this.state.passwd === '') {
      global.alert.show({
        content: '密码不能为空',
      })
    } else {
      const { loginName, passwd, loadingText, verifyCode } = this.state
      const res = await ajaxStore.common.login({
        loginName,
        passwd,
        loadingText,
        code: verifyCode,
      })
      if (res.data && res.data.code === '0') {
        await setUserInfo({
          userInfo: res.data.data,
        })
        await AuthUtil.saveAutoLoginInfo(enc(this.state.loginName, pwd), enc(this.state.passwd, pwd))
        getAreaData()
        if (res.data.data.tenantVO) {
          setSessionInfo(res.data.data.tenantVO[0])
        }
        onEvent('用户登录成功', 'Login', '/ofs/front/user/SSOlogin', {
          cifCompanyId: res.data.data.cifCompanyId,
          companyName: res.data.data.loginResult
            ? res.data.data.loginResult.corpName || res.data.data.loginResult.userName
            : '',
          memberId: res.data.data.loginResult ? res.data.data.loginResult.memberId : '',
        })
        // 清空登录信息
        this.setState({
          loginName: '',
          passwd: '',
          verifyCode: '',
        })
        this.loginNameClear.clear()
        this.passwdClear.clear()
        this.verifyCodeClear && this.verifyCodeClear.clear()
        const response = res.data.data
        if (response.memberApplyVO && response.memberApplyVO.step === 1) {
          // 认证成功
          setCreditStatus({
            creditStatus: response.creaditToOfsVO.status || '',
          })

          const resetAction = {
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'MainTabs',
                action: NavigationActions.navigate({
                  routeName: 'Home',
                }),
              }),
            ],
          }
          this.props.navigation.dispatch(StackActions.reset(resetAction))

          // //判断授信
          // if (response.creaditToOfsVO == null || response.creaditToOfsVO.status === 'TODO' || response.creaditToOfsVO.status === null) {
          //   navigation.replace('AddSupplier')
          // } else if (response.creaditToOfsVO.status === 'REJECT') {
          //   navigation.replace('CreditFail')
          // } else if (response.creaditToOfsVO.status === 'PROCESS') {
          //   navigation.replace('Crediting')
          // } else if (response.creaditToOfsVO.status === 'DONE' || response.creaditToOfsVO.status === 'INVALID') {
          //   const resetAction = {
          //     index: 0,
          //     actions: [
          //       NavigationActions.navigate({
          //         routeName: 'MainTabs',
          //         action: NavigationActions.navigate({
          //           routeName: 'Home'
          //         })
          //       })
          //     ]
          //   }
          //   this.props.navigation.dispatch(StackActions.reset(resetAction))
          //   // navigation.navigate('MainTabs')
          // }
        } else {
          // 真实性认证流程判断
          const res = await ajaxStore.credit.processTask({
            memberId: response.loginResult.memberId,
            processDefKey: 'USER_REGISTER',
          })
          if (res.data && res.data.code === '0') {
            await StorageUtil.save('memberId', response.loginResult.memberId).then(res => {
              if (!res) {
                console.log('memberId save success')
              }
            })
            const processTaskData = res.data.data
            if (processTaskData.taskDefKey === 'AWAIT_APPROVE') {
              navigation.replace('CertificationFail')
            } else if (processTaskData.taskDefKey === 'SUBMIT_ENTERPRISE_INFORMATION') {
              navigation.replace('Certification', { isUpdate: false })
            }
          } else {
            global.alert.show({
              content: res.data.message,
            })
          }
        }
      } else if (res.data && res.data.code === 'D00001') {
        this.refreshVerifyCode()
      }
    }
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <Image
          source={require('../../images/login-bac.jpg')}
          style={{
            position: 'absolute',
            flex: 1,
            width: DEVICE_WIDTH,
          }}
          resizeMode="cover"
        />
        <NavBar title={'登录'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.title}>欢迎使用仟金顶</Text>
            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-uname'} size={dp(55)} style={styles.icon} />
              <TextInput
                // autoFocus
                placeholder={'请输入账号'}
                placeholderTextColor={Color.TEXT_LIGHT}
                autoCapitalize={'none'}
                style={styles.textInput}
                keyboardType="number-pad"
                maxLength={11}
                onChangeText={text => {
                  this.setState({ loginName: text })
                }}
                ref={input => {
                  this.loginNameClear = input
                }}
              />
            </View>

            <View style={styles.textInputWrapper}>
              <Iconfont name={'icon-pwd'} size={dp(55)} style={styles.icon} />
              <TextInput
                placeholder={'请输入密码'}
                placeholderTextColor={Color.TEXT_LIGHT}
                style={styles.textInput}
                secureTextEntry={true}
                maxLength={20}
                onChangeText={text => {
                  this.setState({ passwd: text })
                }}
                ref={input => {
                  this.passwdClear = input
                }}
              />
            </View>
            {this.state.verifyCodeImg ? (
              <View style={styles.textInputWrapper}>
                <Iconfont name={'icon_code'} size={dp(55)} />
                <TextInput
                  // autoFocus
                  placeholder={'请输入验证码'}
                  placeholderTextColor={Color.TEXT_LIGHT}
                  autoCapitalize={'none'}
                  style={[styles.textInput, styles.verifyCodeInput]}
                  maxLength={6}
                  onChangeText={text => {
                    this.setState({ verifyCode: text })
                  }}
                  ref={input => {
                    this.verifyCodeClear = input
                  }}
                />
                <Touchable onPress={() => this.refreshVerifyCode()}>
                  <Image
                    style={styles.verifyCodeImg}
                    source={{ uri: this.state.verifyCodeImg }}
                    onLoad={() => {
                      handleSetCookie()
                    }}
                  />
                </Touchable>
              </View>
            ) : null}
            <Touchable style={[styles.login]} onPress={this.toLogin}>
              <Text style={styles.loginText}>{'登录'}</Text>
            </Touchable>

            <Touchable style={[styles.register]} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>{'没有账号？立即注册'}</Text>
            </Touchable>

            <CustomerService navigation={navigation} style={{ marginTop: dp(50) }} />
            <EnvInfo style={styles.env} />
            <Text style={styles.version}>{`V ${version}`}</Text>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    paddingTop: 0.15 * (DEVICE_HEIGHT - (Dimen.BAR_HEIGHT + getStatusBarHeight())),
    height: DEVICE_HEIGHT - (Dimen.BAR_HEIGHT + getStatusBarHeight()),
  },
  title: {
    fontSize: dp(40),
    marginBottom: dp(30),
  },
  textInputWrapper: {
    width: DEVICE_WIDTH * 0.8,
    paddingHorizontal: dp(25),
    marginTop: dp(60),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: dp(10),
    justifyContent: 'center',
  },
  textInput: {
    alignSelf: 'center',
    paddingVertical: dp(20),
    paddingHorizontal: DEVICE_WIDTH * 0.2,
    color: Color.TEXT_MAIN,
    textAlign: 'left',
    fontSize: dp(34),
  },
  icon: {
    position: 'absolute',
    left: dp(30),
  },
  login: {
    backgroundColor: Color.THEME,
    width: DEVICE_WIDTH * 0.82,
    paddingVertical: dp(28),
    marginTop: dp(50),
    borderRadius: dp(10),
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(35),
  },

  register: {
    backgroundColor: Color.WHITE,
    width: DEVICE_WIDTH * 0.82,
    paddingVertical: dp(28),
    marginTop: dp(50),
    borderRadius: dp(10),
    borderColor: '#999999',
    borderWidth: 1,
  },
  registerText: {
    color: Color.TEXT_MAIN,
    textAlign: 'center',
    fontSize: dp(35),
  },
  verifyCodeInput: {
    width: DEVICE_WIDTH * 0.4,
    textAlign: 'right',
    paddingLeft: 0,
    paddingRight: dp(60),
  },
  // verifyCodeInputWrapper: {
  //   paddingHorizontal: dp(25),
  //   marginTop: dp(60),
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: 'white',
  //   borderRadius: dp(10),
  //   justifyContent: 'center'
  // },
  verifyCodeImg: {
    width: DEVICE_WIDTH * 0.25,
    height: dp(70),
  },
  version: {
    textAlign: 'center',
    color: '#666666',
    position: 'absolute',
    bottom: dp(50),
  },
  env: {
    position: 'absolute',
    bottom: dp(100),
  },
})
