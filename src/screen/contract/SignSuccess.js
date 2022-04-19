import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import {
  getSecondContractInfo,
  getOtherContractList,
  getCSContractList,
  getProductContractList
} from '../../actions'
import { connect } from 'react-redux'
import { contractType } from '../../utils/enums'
import { injectUnmount } from '../../utils/Utility'
import { StackActions, NavigationActions } from 'react-navigation'
@injectUnmount
class SignSuccess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      tipsTitle: '',
      info: '',
      time: 5,
      nav: 'Home',
      showGoHome: true,
      showGoDetail: false,
      route: {
        MainTabs: '首页',
        Home: '首页',
        ContractList: '合同列表',
        Login: '首页',
        AgentList: '授权委托列表'
      }
    }
    this.toContractDetail = this.toContractDetail.bind(this)
  }

  async validContractType () {
    const type = this.props.navigation.state.params.contractType
    const { route } = this.state
    let tipsTitle
    let info
    let nav
    let showGoHome = true
    let showGoDetail = false
    const title = contractType[parseInt(type)]
    switch (type) {
      case '0':
        tipsTitle = '企业真实性核实成功！'
        info = '在电脑端完善电子签章信息后即可在线签署合同了'
        nav = 'MainTabs'
        break
      case '10':
      case '12':
      case '23':
      case '16':
      case '17':
        tipsTitle = `${title}签署成功！`
        nav = 'ContractList'
        info = `5秒后自动跳转到${route[nav]}`
        showGoDetail = true
        break
      case '13':
        tipsTitle = '最高额保证合同签署成功！'
        if (this.props.sessionId && this.props.faceExtraData.source !== 'share') {
          nav = 'ContractList'
          info = `5秒后自动跳转到${route[nav]}`
        } else {
          nav = 'MainTabs'
          info = ''
          showGoHome = false
          showGoDetail = true
        }
        break
      case '29':
        tipsTitle = '授权委托协议签署成功！'
        nav = 'AgentList'
        info = `5秒后自动跳转到${route[nav]}`
        break
      case '29.1':
        tipsTitle = '授权委托协议签署成功！'
        nav = 'RealNameAuth'
        info = `5秒后自动跳转到${route[nav]}`
        break
      case '34':
      case '35':
        tipsTitle = '合同签署成功！'
        if (this.props.sessionId && this.props.faceExtraData.source !== 'share') {
          nav = 'ContractList'
          info = `5秒后自动跳转到${route[nav]}`
        } else {
          nav = 'MainTabs'
          info = ''
          showGoHome = false
          showGoDetail = true
        }
        break
      default:
        break
    }
    await this.setState({
      title,
      tipsTitle,
      nav,
      showGoHome,
      showGoDetail,
      info
    })
    if (type !== '0') {
      if (this.props.faceExtraData.source === 'share') {
        showGoHome = false
        this.setState({
          showGoHome
        })
      } else {
        this.countDown()
      }
    }
  }

  componentWillUnmount () {
    this.time && clearTimeout(this.time)
  }

  countDown () {
    let time = this.state.time
    const { route, nav } = this.state
    this.time = setTimeout(() => {
      time--
      this.setState({
        time,
        info: `${time}秒后自动跳转到${route[nav]}`
      })
      if (time === 0) {
        this.props.navigation.navigate(nav)
      } else {
        this.countDown()
      }
    }, 1000)
  }

  componentDidMount () {
    this.validContractType()
  }

  toContractDetail () {
    const navigation = this.props.navigation
    const { nav } = this.state
    const { contractCode, processInstanceId, version } = this.props.faceExtraData
    const type = this.props.faceExtraData.contractType
    this.time && clearTimeout(this.time)
    const resetAction = nav === 'ContractList' ? {
      index: 2,
      actions: [
        NavigationActions.navigate({ routeName: 'MainTabs' }),
        NavigationActions.navigate({ routeName: nav })
      ]
    } : {
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: nav })
      ]
    }
    switch (type) {
      case '10':
        resetAction.actions.push(
          NavigationActions.navigate({
            routeName: 'ContractDetail',
            params: {
              title: contractType[parseInt(type)],
              contractType: type,
              contractCode: this.memberFeeContractList[0].code
            }
          })
        )
        break
      case '12':
      case '13':
      case '16':
      case '17':
      case '23':
        if (version) {
          resetAction.actions.push(
            NavigationActions.navigate({
              routeName: 'CSContractDetail',
              params: {
                processInstanceId,
                contractCode,
                contractType: type
              }
            })
          )
        } else {
          resetAction.actions.push(
            NavigationActions.navigate({
              routeName: 'ContractDetail',
              params: {
                title: contractType[parseInt(type)],
                contractType: type,
                contractCode
              }
            })
          )
        }
        break
      case '34':
      case '35':
        resetAction.actions.push(
          NavigationActions.navigate({
            routeName: 'CSContractDetail',
            params: {
              processInstanceId,
              contractCode,
              contractType: type
            }
          })
        )
        break
      default:
        break
    }
    this.props.navigation.dispatch(StackActions.reset(resetAction))
  }

  render () {
    const { navigation } = this.props
    const { title, tipsTitle, info, nav, btn, showGoHome, showGoDetail, route } = this.state
    return (
      <View >
        <NavBar title={title} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <Iconfont style={styles.icon} name={'icon-result-success1'} size={dp(250)} />
            <Text style={styles.title}>{tipsTitle}</Text>
            <Text style={styles.info}>{info}</Text>
            <View style={styles.btn}>
              {showGoHome &&
                <SolidBtn style={styles.btnItem} text={`返回${route[nav]}`} onPress={() => {
                  navigation.navigate(nav)
                }} />
              }
              {showGoDetail &&
                <StrokeBtn text={'查看签署详情'} onPress={() => {
                  this.toContractDetail()
                }} />
              }
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  pageMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: dp(200)
  },
  title: {
    fontSize: dp(40),
    width: DEVICE_WIDTH,
    textAlign: 'center',
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  info: {
    width: DEVICE_WIDTH * 0.7,
    fontSize: dp(30),
    color: '#888',
    textAlign: 'center'
  },
  btn: {
    marginTop: dp(80)
  },
  btnItem: {
    marginBottom: dp(30)
  }
})

const mapStateToProps = state => {
  return {
    sessionId: state.user.sessionId,
    faceExtraData: state.cache.faceExtraData,
    memberFeeContractList: state.contract.memberFeeContractList,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(SignSuccess)
