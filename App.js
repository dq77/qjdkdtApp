import React, { PureComponent } from 'react'
import { StatusBar, View, Clipboard, SafeAreaView, AppState, Platform } from 'react-native'
import { Provider } from 'react-redux'
// import SplashScreen from 'react-native-splash-screen';
import { pickBy, identity } from 'lodash'
import AppNavigator from './src'
import store from './src/store'
import { setUserInfo, setCreditStatus, toInitialAuthInfo, getAreaData } from './src/actions'
import AuthUtil from './src/utils/AuthUtil'
import ajaxStore from './src/utils/ajaxStore'
import Toast from './src/component/Toast'
import SplashScreen from 'react-native-splash-screen'
import Loading from './src/component/LoadingView'
import { showToast, enc, dec, getQuery } from './src/utils/Utility'
import { endText, startText, pwd } from './src/utils/config'
import ComfirmModal from './src/component/ComfirmModal'
import Alert from './src/component/Alert'
import Confirm from './src/component/Confirm'
import StorageUtil from './src/utils/storageUtil'
import { onNavigationStateChange } from './src/utils/NavigationUtil'
import { update, hotUpdate } from './src/utils/UpdateUtils'
import { onPageStart, onEvent } from './src/utils/AnalyticsUtil'
import { autoLogin } from './src/utils/UserUtils'

// const codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL }

class App extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currentAppState: AppState.currentState,
      contractModal: false,
      contractContent: '',
      loading: true
    }
    this.initialInfo = this.initialInfo.bind(this)
    this._handleAppStateChange = this._handleAppStateChange.bind(this)
    this.clearClipBoard = this.clearClipBoard.bind(this)
    this.goSign = this.goSign.bind(this)
  }

  async componentDidMount () {
    console.log('app')
    // 热更新
    hotUpdate(this.refs.loading)
    // Android普通更新
    update()

    // 全局引用赋值
    global.toast = this.refs.toast
    global.loading = this.refs.loading
    global.alert = this.refs.alert
    global.confirm = this.refs.confirm
    global.showError = true
    global.currentScreen = 'Home'

    // if (__DEV__) {
    //   // 设置chrome network可看
    //   global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest
    // }
    // this.initialInfo()

    await StorageUtil.save('contractUrl', '')
    AppState.addEventListener('change', this._handleAppStateChange)
    // this.pasteFromClipboard()

    // 登录
    await autoLogin()

    await this.setState({ loading: false })

    getAreaData()
    SplashScreen.hide()
  }

  componentWillUnmount () {
    // this.time && clearTimeout(this.time)
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  async _handleAppStateChange (nextAppState) {
    console.log('nextAppState', nextAppState)
    if (nextAppState === 'active') {
      // this.pasteFromClipboard()
      hotUpdate(this.refs.loading)
    }
    await this.setState({ currentAppState: nextAppState })
  }

  // 从剪贴板中读取字符串
  async pasteFromClipboard () {
    let text = await Clipboard.getString()
    if (text) {
      text = text.slice(text.indexOf('€') + 1, text.length)
      const content = decodeURIComponent(dec(text.replace(endText, ''), pwd))
      console.log(content, '剪切板内容')
      if (content && getQuery(content).contractType) {
        const oldUrl = await StorageUtil.get('contractUrl')
        console.log(oldUrl, '========>oldUrl')
        if (oldUrl !== content) {
          this.setState({
            contractContent: content,
            contractModal: true
          })
        } else {
          // this.clearClipBoard()
        }
      }
    }
  }

  goSign () {
    console.log(this.state.contractContent, '========>合同内容')
    const item = getQuery(this.state.contractContent)
    item.source = 'share'
    console.log(item)
    switch (item.contractType) {
      case '13': // 最高额担保
      case '34': // 担保函
      case '35': // 宜宾无票
        global.navigation.navigate('ContractSign', item)
        break
      case '-1': // 诚信销/采
        global.navigation.navigate('CSContractSign', item)
        break
      default:
        global.navigation.navigate('OtherContractSign', item)
        break
    }
  }

  clearClipBoard () {
    Clipboard.setString('')
  }

  async initialInfo () {
    const sessionId = await AuthUtil.getSessionId()
    const ssoCookie = await AuthUtil.getSsoCookie()
    const userInfo = await AuthUtil.getUserInfo()
    const authInfo = pickBy(
      {
        sessionId,
        ssoCookie,
        userInfo: userInfo.loginResult
      },
      identity
    )
    if (Object.keys(authInfo).length === 0) {
      return
    }
    console.log('初始化缓存信息', authInfo)
    toInitialAuthInfo(authInfo)
  }

  render () {
    return (
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <StatusBar
            barStyle={'dark-content'}
            translucent={true}
            backgroundColor={'transparent'}
          />
          {this.state.loading
            ? null
            : <AppNavigator
              onNavigationStateChange={
                (prevState, currentState) => {
                  onNavigationStateChange(prevState, currentState)
                }}
            />}

          <Toast ref='toast' />
          <Loading ref='loading' />
          <Alert ref='alert' />
          <Confirm ref='confirm' />
          <ComfirmModal
            title={'您有一份合同等待签署'}
            content={'请及时处理您的委托'}
            cancelText={'取消'}
            comfirmText={'立即签署'}
            cancel={() => {
              this.clearClipBoard()
              this.setState({
                contractModal: false
              })
            }}
            confirm={async () => {
              this.clearClipBoard()
              await this.setState({
                contractModal: false
              })
              setTimeout(() => {
                this.goSign()
              }, 500)
            }}
            infoModal={this.state.contractModal} />
        </View>
      </Provider>
    )
  }
}

export default App
