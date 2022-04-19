import React, { PureComponent } from 'react'
import { Share, View, alert, BackHandler, Platform, NativeModules } from 'react-native'
import WebView from 'react-native-webview'
import ProgressBar from '../../component/ProgressBar'
import globalStyles from '../../styles/globalStyles'
import NavBar from '../../component/NavBar'
import { getQuery, updateUrlParams } from '../../utils/Utility'
import { share } from '../../utils/ShareUtil'
import { version } from '../../utils/config'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import { getLocation } from '../../utils/LocationUtils'
import PermissionUtils from '../../utils/PermissionUtils'
import { isAndroid } from '../../utils/screenUtil'

/**
 * WebViewScreen
 */
class WebViewScreen extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      canGoBack: false,
      progress: 0,
      title: this.props.navigation.getParam('title', '')
    }
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress = () => {
    if (!this.props.navigation.isFocused()) { return false }
    const { backFace } = this.props.navigation.state.params

    const { typeNav } = this.props
    if ((typeNav && typeNav === '1') || (backFace && backFace === '1')) {
      this.props.navigation.goBack()
    }
    if (this.state.canGoBack) {
      this.webView.goBack()
    } else {
      this.props.navigation.goBack()
    }
    return true // true自己处理 false系统处理
  }

  onNavigationStateChange (navState) {
    this.setState({
      canGoBack: navState.canGoBack
    })
  }

  // 接收js消息
  onMessage = (e) => {
    const message = e.nativeEvent.data
    try {
      if (typeof (JSON.parse(message)) === 'object') {
        const data = JSON.parse(message)
        // console.log(data)
        switch (data.type) {
          case 'consoleLog': // 打印日志
            this.consoleLog(data)
            break
          case 'share': // 分享
            this.share(data)
            break
          case 'navigate': // 跳转
            this.navigate(data)
            break
          case 'getLocation': // 获取经纬度
            this.getLocation()
            break
          case 'getVideoAuth': // 获取相机权限
            this.getVideoAuth()
            break
          case 'exit': // 按后退键返回
            this.exit()
            break
          case 'title': // 修改title
            this.title(data)
            break
          default:
            break
        }
      }
    } catch (e) {
      console.log('不是json对象', message)
    }
  }

  jsBridge (message) {
    this.webView && this.webView.injectJavaScript(`window.JSBridge.postMessage(${message})`)
  }

  getVideoAuth = async () => {
    const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
    if (hasPermission) {
      this.jsBridge(JSON.stringify({
        type: 'getVideoAuth',
        params: {
          result: true
        }
      }))
    } else {
      this.jsBridge(JSON.stringify({
        type: 'getVideoAuth',
        params: {
          result: false
        }
      }))
    }
  }

  exit = () => {
    console.log('exit')
    this.setState({
      canGoBack: false
    })
  }

  consoleLog = (data) => {
    console.log(data.params)
  }

  share = (data) => {
    console.log(data, 'shareData')
    const { title, desc, url } = data.params
    share(desc, url, title, (index, message) => {
      console.log(index + '------' + message)
    })
  }

  navigate = (data) => {
    switch (data.params.action) {
      case 'goBack':
        this.props.navigation.goBack()
        break
      case 'replace':
        this.props.navigation.replace(data.params.url, { buzKey: data.params.params, version: '2' })
        break
      default:
        this.props.navigation.navigate(data.params.url, { buzKey: data.params.params, version: '2' })
        break
    }
  }

  getLocation = async () => {
    const map = await getLocation()
    if (!map) {
      this.jsBridge(JSON.stringify({
        type: 'getLocation',
        params: {
          lng: '',
          lat: ''
        }
      }))
    } else {
      this.jsBridge(JSON.stringify({
        type: 'getLocation',
        params: {
          lng: map.longitude,
          lat: map.latitude
        }
      }))
    }
  }

  title (data) {
    const { title } = data.params
    this.setState({
      title: title
    })
  }

  render () {
    const { navigation, sessionId, companyInfo } = this.props
    let url = updateUrlParams(navigation.getParam('url', ''), 'sessionId', sessionId)
    url = updateUrlParams(url, 'companyId', companyInfo.companyId)
    const title = this.state.title
    const platform = isAndroid ? 'android' : 'iphone'
    console.log(url)
    return (
      <View style={globalStyles.container}>
        <NavBar
          title={title}
          navigation={navigation}
          onLeftPress={this.handleBackPress}
        />
        <ProgressBar progress={this.state.progress} />
        <WebView
          ref={webView => { this.webView = webView }}
          source={{
            uri: url
          }}
          cacheEnabled={false}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          userAgent={`qjdkdt@${version} ${platform}`}
          javaScriptEnabled={true}
          showsVerticalScrollIndicator={false}
          onNavigationStateChange={e => this.onNavigationStateChange(e)}
          onLoadProgress={({ nativeEvent }) => {
            this.setState({ progress: nativeEvent.progress })
          }}
          onLoad={syntheticEvent => {
            const { nativeEvent } = syntheticEvent
            const url = decodeURIComponent(nativeEvent.url).split('?')[1]
            if (url && url.indexOf('qjdkdt://') !== -1) {
              this.props.navigation.navigate(url.replace('qjdkdt://', ''))
            }
          }}
          onMessage={this.onMessage}
        />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    ssoCookie: state.user.ssoCookie,
    sessionId: state.user.sessionId,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(WebViewScreen)
