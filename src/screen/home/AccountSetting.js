import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, BackHandler, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  clearLoginInfo,
  getCompanyInfo,
  setFaceExtraData,
  getPaymentAccount,
  getAgentList,
  getMemberVipInfo
} from '../../actions'
import { vIdcardNumber } from '../../utils/reg'
import { onClickEvent } from '../../utils/AnalyticsUtil'
import { customerServiceUrl } from '../../utils/config'
import ComfirmModal from '../../component/ComfirmModal'
import { resetLoginPage, handleBackPress } from '../../utils/Utility'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import AuthUtil from '../../utils/AuthUtil'
import ajaxStore from '../../utils/ajaxStore'
import { TopBar } from './component/TopBar'
import { checkCreadit, logout } from '../../utils/UserUtils'
/**
 * 我的
 */
class AccountSetting extends PureComponent {
  static getDerivedStateFromProps (nextProps) {
    return {
      refreshing: !nextProps.companyInfo.corpName
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      messageListNum: 0
    }
    this.toRealName = this.toRealName.bind(this)
    this.toAcconut = this.toAcconut.bind(this)
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        StatusBar.setBarStyle('dark-content')
        getCompanyInfo()
        getAgentList(this.props.companyInfo.companyId)
        getMemberVipInfo(this.props.companyInfo.companyId)
        this.messageListData()
      }
    )
    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async messageListData () {
    const data = {
      messageStatus: 'SUCCESS',
      companyName: this.props.companyInfo.corpName,
      pageNo: 1,
      pageSize: 100
    }
    const res = await ajaxStore.company.messageList(data)
    if (res.data && res.data.code === '0') {
      const messageList = res.data.data.pagedRecords
      this.setState({
        messageListNum: messageList.length || 0
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 实名认证
  async toRealName () {
    let legalPersonCertId = this.props.companyInfo.legalPersonCertId
    legalPersonCertId = vIdcardNumber.test(legalPersonCertId) ? legalPersonCertId : ''
    await setFaceExtraData({
      contractType: '0',
      isSign: '0'
    })
    if (this.props.companyInfo.sealStatus) {
      this.props.navigation.navigate('FaceIdentity', {
        idcardName: this.props.companyInfo.legalPerson,
        idcardNumber: legalPersonCertId
      })
    } else {
      this.props.navigation.navigate('EtcSign', { nextPage: 'FaceIdentity' })
    }
  }

  toContactUs () {
    this.props.navigation.navigate('ContactUs')
  }

  toMembershipRule () {
    // this.props.navigation.navigate('MembershipRule')
    this.props.navigation.navigate('MembershipRule', { vipLevelCode: this.props.companyInfo.memberInfo.vipLevelCode })
  }

  @checkCreadit
  toAgentAuth () {
    // if (this.props.companyInfo.sealStatus) {
    onClickEvent('我的模块-代理人授权', 'home/AccountSetting')
    this.props.navigation.navigate('AgentList')
    // } else {
    //   this.props.navigation.navigate('EtcSign', { nextPage: 'FaceIdentity' })
    // }
  }

  toCustomerService () {
    const name = this.props.userInfo.userName
    this.props.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${name}`
    })
  }

  toContractList () {
    // if (this.props.companyInfo.sealStatus) {
    this.props.navigation.navigate('ContractList')
    // } else {
    //   this.props.navigation.navigate('EtcSign', { nextPage: 'ContractList' })
    // }
  }

  @checkCreadit
  async toAcconut () {
    onClickEvent('我的模块-代付账户', 'home/AccountSetting')
    if (!this.props.companyInfo.paymentAccount.length) {
      await getPaymentAccount()
      if (this.props.companyInfo.paymentAccount.length) {
        this.props.navigation.navigate('AccountList')
      } else {
        this.props.navigation.navigate('AccountCreate', { from: 'Mine' })
      }
    } else {
      this.props.navigation.navigate('AccountList')
    }
  }

  @checkCreadit
  toInvoice () {
    onClickEvent('我的模块-开票信息', 'home/AccountSetting')
    this.props.navigation.navigate('InvoiceInfo')
  }

  quit () {
    this.setState({
      infoModal: true,
      vipModal: false
    })

    // const { title, desc, url } = {
    //   title: '实名认证',
    //   desc: '实名认证',
    //   url: 'https://www/baidu.com'
    // }
    // console.log('转发认证' + url)
    // share(desc, url, title, (index, message) => {
    //   console.log(index + '--' + message)
    // })
  }

  @checkCreadit
  toRealNameAuth () {
    onClickEvent('我的模块-实名认证', 'home/AccountSetting')
    this.props.navigation.navigate('RealNameAuth')
  }

  render () {
    const { navigation, companyInfo, userInfo, agentStatus, memberInfo } = this.props

    const companyTag = companyInfo.companyTag || ''
    return (
      <View style={styles.container}>

        <TopBar title={'我的'} navigation={navigation} messageListNum={this.state.messageListNum} />

        <ScrollView keyboardShouldPersistTaps="handled" >
          <Text style={styles.title1Style}>企业信息维护</Text>
          <View style={styles.content}>
            <Touchable onPress={() => {
              onClickEvent('我的模块-企业信息', 'home/AccountSetting')
              navigation.navigate('CompanyBaseInfo')
            }} >
              <View style={[styles.item, styles.itemRudius]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Iconfont style={styles.arrow1} name={'qiyexinxi2x'} size={dp(38)} />
                  <Text style={styles.itemTitle}>企业信息</Text>
                </View>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
              </View>
            </Touchable>
            <View style={{ marginLeft: 0, height: dp(1), backgroundColor: 'white', marginRight: 0 }}>
              <View style={{ marginLeft: dp(80), height: dp(1), backgroundColor: Color.SPLIT_LINE, marginRight: 0 }}></View>
            </View>
            <Touchable onPress={() => {
              this.toRealNameAuth()
            }} >
              <View style={styles.item}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Iconfont style={styles.arrow1} name={'shimingrenzheng2x'} size={dp(38)} />
                  <Text style={styles.itemTitle}>实名认证（企业、法人、授权人）</Text>
                </View>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
              </View>
            </Touchable>
            <View style={{ marginLeft: 0, height: dp(1), backgroundColor: 'white', marginRight: 0 }}>
              <View style={{ marginLeft: dp(80), height: dp(1), backgroundColor: Color.SPLIT_LINE, marginRight: 0 }}></View>
            </View>
            {/* {((companyTag.isSupportwoDistribution === '1' && companyInfo.sequence && companyInfo.sequence >= 4) || companyTag.isSupportwoDistribution === '0' || true) &&
                <Touchable  onPress={() => this.toContractList()} style={[styles.item, styles.itemRudius]}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>合同列表</Text>
                    <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                  </View>
                </Touchable>
            } */}

            <Touchable onPress={() => {
              this.toAgentAuth()
            }} >
              <View style={styles.item}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Iconfont style={styles.arrow1} name={'dailirenshouquan'} size={dp(38)} />
                  <Text style={styles.itemTitle}>代理人授权</Text>
                </View>
                <View style={styles.itemRight}>
                  {agentStatus ? (
                    <Text style={styles.itemStatus}>已授权</Text>
                  ) : (
                    <Text style={styles.itemStatus}>未授权</Text>
                  )}
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </View>
            </Touchable>
            <View style={{ marginLeft: 0, height: dp(1), backgroundColor: 'white', marginRight: 0 }}>
              <View style={{ marginLeft: dp(80), height: dp(1), backgroundColor: Color.SPLIT_LINE, marginRight: 0 }}></View>
            </View>
            {companyTag.isSupportwoDistribution === '1' && companyInfo.sequence >= 2 && companyInfo.sealStatus
              ? <Touchable onPress={() => {
                this.toAcconut()
              }} >
                <View style={styles.item}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Iconfont style={styles.arrow1} name={'daifuzhanghu2x'} size={dp(38)} />
                    <Text style={styles.itemTitle}>代付账户</Text>
                  </View>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
              : null
            }
            {companyTag.isSupportwoDistribution === '1' && companyInfo.sequence >= 2 && companyInfo.sealStatus
              ? <View style={{ marginLeft: 0, height: dp(1), backgroundColor: 'white', marginRight: 0 }}>
                <View style={{ marginLeft: dp(80), height: dp(1), backgroundColor: Color.SPLIT_LINE, marginRight: 0 }}></View>
              </View>
              : null
            }
            <Touchable onPress={() => {
              this.toInvoice()
            }}>
              <View style={[styles.item, styles.itemBoottomRudius, { borderColor: 'white' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Iconfont style={styles.arrow1} name={'kaipiaoxinxi2x'} size={dp(38)} />
                  <Text style={styles.itemTitle}>开票信息</Text>
                </View>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
              </View>
            </Touchable>

          </View>

        </ScrollView>

        <Text style={styles.logout} onPress={() => this.quit()} >退出登录</Text>

        <ComfirmModal
          title={'警告'}
          content={'是否退出登录'}
          cancelText={'取消'}
          comfirmText={'退出'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={async () => {
            this.setState({
              infoModal: false
            })
            logout()
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  headerTopBlue: {
    height: dp(300),
    width: DEVICE_WIDTH,
    backgroundColor: Color.THEME,
    position: 'absolute'
  },
  headerTop: {
    // flex:1,
    width: DEVICE_WIDTH,
    backgroundColor: Color.DEFAULT_BG
  },
  headerTopRule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: dp(30),
    marginVertical: dp(40)
  },
  membershipRule: {
    fontSize: dp(28),
    color: Color.GOLD
  },
  corpName: {
    fontSize: dp(34),
    color: 'white'
  },
  deadLineText: {
    color: '#888',
    fontSize: dp(28),
    marginBottom: dp(20)
  },
  content: {
    marginHorizontal: dp(30)
  },
  itemRudius: {
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16)
  },
  itemBoottomRudius: {
    borderBottomLeftRadius: dp(16),
    borderBottomRightRadius: dp(16)
  },
  item: {
    backgroundColor: Color.WHITE,
    height: dp(100),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: dp(30)
  },
  itemRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  itemTitle: {
    marginLeft: dp(8),
    color: '#2D2926',
    fontSize: dp(28)
  },
  emptyIcon: {
    marginRight: dp(35)
  },
  arrow1: {
    marginHorizontal: dp(20)
  },
  arrow: {
    marginLeft: dp(10)
  },
  itemStatus: {
    fontSize: dp(28),
    color: '#888'
  },
  singleItem: {
    marginTop: dp(40)
  },
  title1Style: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: 'bold',
    marginTop: dp(60),
    marginLeft: dp(30),
    marginBottom: dp(30)
  },
  logout: {
    color: '#91969A',
    fontWeight: 'bold',
    marginTop: dp(70),
    borderRadius: dp(48),
    textAlign: 'center',
    fontSize: dp(30),
    marginHorizontal: dp(30),
    paddingVertical: dp(28),
    borderColor: '#C7C7D6',
    borderWidth: dp(2),
    marginBottom: dp(60),
    overflow: 'hidden'
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    agentStatus: state.company.agentStatus,
    newMemberFeeContractList: state.contract.newMemberFeeContractList
  }
}

export default connect(mapStateToProps)(AccountSetting)
