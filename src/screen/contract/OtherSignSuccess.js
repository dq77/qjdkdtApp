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
  getRealDP as dp
} from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import { connect } from 'react-redux'
import { injectUnmount } from '../../utils/Utility'
import { StackActions, NavigationActions } from 'react-navigation'
@injectUnmount
class OtherSignSuccess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      info: '',
      time: 5,
      nav: '',
      showGoHome: false,
      showGoDetail: false
    }
    this.toContractDetail = this.toContractDetail.bind(this)
  }

  async showDetail () {
    let showGoHome = true
    let info
    let nav
    const showGoDetail = true
    if (this.props.faceExtraData.source === 'share') {
      showGoHome = false
      info = ''
      nav = 'Login'
    } else {
      info = '5秒后自动跳转到合同列表'
      this.countDown()
      nav = 'ContractList'
    }
    this.setState({
      showGoHome,
      showGoDetail,
      info,
      nav
    })
  }

  componentWillUnmount () {
    this.time && clearTimeout(this.time)
  }

  countDown () {
    let time = this.state.time
    this.time = setTimeout(() => {
      time--
      this.setState({
        time,
        info: `${time}秒后自动跳转到合同列表`
      })
      if (time === 0) {
        this.props.navigation.navigate(this.state.nav)
      } else {
        this.countDown()
      }
    }, 1000)
  }

  componentDidMount () {
    this.showDetail()
  }

  toContractDetail () {
    const navigation = this.props.navigation
    const { nav } = this.state
    const { contractCode, cifCompanyId, source } = this.props.faceExtraData
    const type = this.props.faceExtraData.contractType
    this.time && clearTimeout(this.time)
    const resetAction = source === 'share' ? {
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: nav })
      ]
    } : {
      index: 2,
      actions: [
        NavigationActions.navigate({ routeName: 'MainTabs' }),
        NavigationActions.navigate({ routeName: nav })
      ]
    }
    resetAction.actions.push(
      NavigationActions.navigate({
        routeName: 'OtherContractDetail',
        params: {
          cifCompanyId,
          contractCode
        }
      })
    )
    this.props.navigation.dispatch(StackActions.reset(resetAction))
  }

  render () {
    const { navigation } = this.props
    const { info, nav, showGoHome, showGoDetail } = this.state
    return (
      <View >
        <NavBar title={'合同签约'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <Iconfont style={styles.icon} name={'icon-result-success1'} size={dp(250)} />
            <Text style={styles.title}>{'合同签署成功！'}</Text>
            <Text style={styles.info}>{info}</Text>
            <View style={styles.btn}>
              {showGoHome &&
                <SolidBtn style={styles.btnItem} text={'返回合同列表'} onPress={() => {
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
    memberFeeContractList: state.contract.memberFeeContractList
  }
}

export default connect(mapStateToProps)(OtherSignSuccess)
