import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, BackHandler } from 'react-native'
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
import { customerServiceUrl } from '../../utils/config'
import ComfirmModal from '../../component/ComfirmModal'
import MineVipStatus from './component/MineVipStatus'
import { resetLoginPage, handleBackPress } from '../../utils/Utility'
import { share } from '../../utils/ShareUtil'
import ajaxStore from '../../utils/ajaxStore'
import { getTimeDifference } from '../../utils/DateUtils'
/**
 * 我的
 */
class Mine extends PureComponent {
  // static getDerivedStateFromProps (nextProps) {
  //   return {
  //     refreshing: !nextProps.companyInfo.corpName
  //   }
  // }

  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      dataNormalNum: 0,
      price1: 0,
      price2: 0,
      price3: 0,
      pagedRecords1: {},
      pagedRecords2: {},
      pagedRecords3: {}
    }
    this.toRealName = this.toRealName.bind(this)
    this.toAcconut = this.toAcconut.bind(this)
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.init()
      }
    )
    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async init () {
    await getCompanyInfo()
    const { companyInfo } = this.props
    await getAgentList(this.props.companyInfo.companyId)
    await getMemberVipInfo(this.props.companyInfo.companyId)
    console.log(this.props.memberFeeContractList, 'this.props.memberFeeContractList')
    await this.couponFind()
    await this.marketFindUpgradeable(companyInfo.memberInfo.upgradeableLevels)
    this.marketFindRenewal()
  }

  // 查询升级会员费直降列表
  async marketFindUpgradeable (level) {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '1', // 1 会员费直降 2 优惠券 不传则全部查出来
      level: level, // 可升级会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'price',
      order: 'DESC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)
    if (res.data && res.data.code === '0') {
      if (parseInt(companyInfo.memberInfo.upgradeableLevels) > 1 && parseInt(companyInfo.memberInfo.vipLevelCode) === 0) {
        this.marketFind1(res.data.data.pagedRecords)// 逾期用户查询可以升级v1的直降活动
      } else {
        this.setState({
          price1: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0].price : 0,
          pagedRecords1: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0] : {}
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async marketFind1 (pagedRecords) {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '1', // 1 会员费直降 2 优惠券 不传则全部查出来
      level: '1', // 可升级会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'price',
      order: 'DESC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        price3: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0].price : 0,
        pagedRecords3: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0] : {},
        price1: pagedRecords.length > 0 ? pagedRecords[0].price : 0,
        pagedRecords1: pagedRecords.length > 0 ? pagedRecords[0] : {}
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 查询续费会员费直降列表
  async marketFindRenewal () {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '1', // 1 会员费直降 2 优惠券 不传则全部查出来
      level: companyInfo.memberInfo.vipLevelCode, // 可续费会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'price',
      order: 'DESC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)

    if (res.data && res.data.code === '0') {
      this.setState({
        price2: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0].price : 0,
        pagedRecords2: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords[0] : {}
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 优惠券列表1: 正常 2. 已使用 3. 过期
  async couponFind () {
    const data = {
      state: '1', // 状态， 1: 正常 2. 已使用 3. 过期
      pageNo: '1',
      pageSize: '100',
      timeBetween: true,
      order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
      orderBy: 'endTime'
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        dataNormalNum: res.data.data.pagedRecords.length
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

  introducPackage () {
    this.props.navigation.navigate('IntroducPackage')
  }

  toContactUs () {
    this.props.navigation.navigate('ContactUs')
  }

  toMembershipRule () {
    // this.props.navigation.navigate('MembershipRule')
    this.props.navigation.navigate('MembershipRule', { vipLevelCode: this.props.companyInfo.memberInfo.vipLevelCode })
  }

  toAgentAuth () {
    // if (this.props.companyInfo.sealStatus) {
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

  async toAcconut () {
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

  toInvoice () {
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

  render () {
    const { navigation, companyInfo, userInfo, agentStatus } = this.props

    const companyTag = companyInfo.companyTag || ''

    let price = 0
    let pagedRecords = []
    if ((parseInt(companyInfo.memberInfo.vipLevelCode) === 0 && parseInt(companyInfo.memberInfo.upgradeableLevels) > 1)) {
      if (this.state.price1 > this.state.price3) {
        price = this.state.price1
        pagedRecords = this.state.pagedRecords1
      } else {
        price = this.state.price3
        pagedRecords = this.state.pagedRecords3
      }
      console.log(price, this.state.price1, this.state.price3, '12222223333')
    } else {
      // 只可升级
      if ((Number(companyInfo.memberInfo.upgradeableLevels) > Number(companyInfo.memberInfo.vipLevelCode)) && (getTimeDifference(companyInfo.memberInfo.validEndTime) > 90)) {
        price = this.state.price1
        pagedRecords = this.state.pagedRecords1
      } else {
        if (this.state.price1 > this.state.price2) {
          price = this.state.price1
          pagedRecords = this.state.pagedRecords1
        } else {
          price = this.state.price2
          pagedRecords = this.state.pagedRecords2
        }
      }
      console.log(price, '2111111')
    }
    return (
      <View style={styles.container}>
        <NavBar title={'我的'} navigation={navigation} leftIcon="none" />
        <ScrollView keyboardShouldPersistTaps="handled" >
          <View style={styles.headerTopBlue}>
          </View>
          <View style={styles.headerTop}>
            <View >
              <View style={styles.headerTopRule}>
                <Text style={styles.corpName}>{userInfo.corpName || companyInfo.corpName}</Text>
                <Touchable onPress={() => { this.toMembershipRule() }}>
                  <Text style={styles.membershipRule}>会员规则</Text>
                </Touchable>
              </View>
              {/* 接口异常判断 */}
              {companyInfo.memberInfo && (companyInfo.memberInfo.id !== '' ? <MineVipStatus navigation={navigation} companyInfo={companyInfo} userInfo={userInfo} supplierInfo={this.props.supplierInfo}
                price={price}
                price1={this.state.price1} price2={this.state.price2}
                pagedRecords={pagedRecords}>
              </MineVipStatus> : null)}
            </View>
            <View style={styles.content}>
              <Touchable onPress={() => { navigation.navigate('CompanyBaseInfo') }}>
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>企业信息</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
              <Touchable onPress={() => {
                navigation.navigate('RealNameAuth')
              }}>
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>实名认证</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                  {/* <Text style={{ ...styles.itemStatus, ...styles.emptyIcon }}>已认证</Text> */}
                </View>
              </Touchable>
              {/* {companyInfo.sequence && companyInfo.sequence > 1 ? (
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>法定代表人实名认证</Text>
                  <Text style={{ ...styles.itemStatus, ...styles.emptyIcon }}>已认证</Text>
                </View>
              ) : (
                <Touchable  onPress={() => this.toRealName()}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>法定代表人实名认证</Text>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemStatus}>未认证</Text>
                      <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                    </View>
                  </View>
                </Touchable>
              )} */}
              {((companyTag.isSupportwoDistribution === '1' && companyInfo.sequence && companyInfo.sequence >= 4) || companyTag.isSupportwoDistribution === '0' || true) &&
                <Touchable onPress={() => this.toContractList()}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>合同列表</Text>
                    <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                  </View>
                </Touchable>
              }
              <Touchable onPress={() => this.toAgentAuth()}>
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>代理人授权</Text>
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
              {companyTag.isSupportwoDistribution === '1' && companyInfo.sequence >= 2 && companyInfo.sealStatus
                ? <Touchable onPress={() => this.toAcconut()}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>个人代付账户</Text>
                    <View style={styles.itemRight}>
                      <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                    </View>
                  </View>
                </Touchable> : null
              }
              <Touchable isNativeFeedback={true} onPress={() => this.introducPackage()}>
                <View style={{ ...styles.item, ...styles.singleItem }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.itemTitle}>优惠卡包</Text>
                    {this.state.dataNormalNum === 0 ? null : <View style={{ backgroundColor: 'red', height: dp(36), borderRadius: dp(18), marginLeft: dp(20), alignItems: 'center', minWidth: dp(36) }}>
                      {/* 展示数量为可用优惠券数量，当可用数量为0的时候不展示 */}
                      <Text style={{ fontSize: dp(26), color: 'white' }}>{this.state.dataNormalNum}</Text>
                    </View>}
                  </View>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
              <Touchable isNativeFeedback={true} onPress={() => this.toInvoice()}>
                <View style={styles.item}>
                  <Text style={styles.itemTitle}>开票信息维护</Text>
                  <View style={styles.itemRight}>
                    <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                  </View>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toContactUs()}>
                <View style={{ ...styles.item, ...styles.singleItem }}>
                  <Text style={styles.itemTitle}>联系我们</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
              <Touchable onPress={() => this.toCustomerService()}>
                <View style={{ ...styles.item, ...styles.singleItem }}>
                  <Text style={styles.itemTitle}>在线客服</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
              <Touchable onPress={() => this.quit()}>
                <View style={{ ...styles.item, ...styles.singleItem }}>
                  <Text style={styles.itemTitle}>退出</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                </View>
              </Touchable>
            </View>
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
              confirm={() => {
                this.setState({
                  infoModal: false
                })
                clearLoginInfo()
                setTimeout(() => {
                  resetLoginPage(this.props.navigation)
                }, 500)
              }}
              infoModal={this.state.infoModal} />
          </View>
        </ScrollView>
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
    width: DEVICE_WIDTH
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
    marginTop: dp(10)
  },
  item: {
    backgroundColor: Color.WHITE,
    paddingVertical: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    paddingRight: dp(30)
  },
  itemRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  itemTitle: {
    marginLeft: dp(30)
  },
  emptyIcon: {
    marginRight: dp(35)
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

export default connect(mapStateToProps)(Mine)
