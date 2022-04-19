import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, BackHandler } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  getCompanyInfo,
  getMemberVipInfo
} from '../../actions'
import { customerServiceUrl, baseUrl } from '../../utils/config'
import MineVipStatus from './component/MineVipStatus'
import OperationWarn from './component/OperationWarn'
import TimePeriodSelection from './component/TimePeriodSelection'
import Picker from 'react-native-picker'
import ajaxStore from '../../utils/ajaxStore'
import { getFullDate, getTimeDifference } from '../../utils/DateUtils'
import { open } from '../../utils/FileReaderUtils'
import { onEvent } from '../../utils/AnalyticsUtil'

class MemberCenter extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      timePeriodSelectionModal: false,
      opinionListData: [],
      page: 1,
      opinionListDataOpen: 5, // 舆情推送当前展开的数据
      opinionListDatatotal: 0, // 舆情推送总数据
      upSupplier: [],
      stateTime: getFullDate(1), // 上月第一天默认
      endTime: getFullDate(), // 上月最后一天默认
      price1: 0,
      price2: 0,
      price3: 0,
      pagedRecords1: {},
      pagedRecords2: {},
      pagedRecords3: {},
      dataNormal: [],
      dataUse: [],
      dataOver: [],
      dataReceive: [],
      isCooperationWithYashi: false
    }
  }

  componentDidMount () {
    this.init()
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.init()
      }
    )
  }

  async init () {
    await getCompanyInfo()
    await getMemberVipInfo(this.props.companyInfo.companyId)
    await this.couponFind('1')
    await this.couponFind('2')
    await this.couponFind('3')
    await this.marketFind()
    await this.marketFindUpgradeable(this.props.companyInfo.memberInfo.upgradeableLevels)
    await this.marketFindRenewal()
    const vipLevelCode = this.props.companyInfo.memberInfo ? this.props.companyInfo.memberInfo.vipLevelCode : ''
    if (vipLevelCode !== '0' && vipLevelCode !== '') {
      await this.setState({
        page: 1,
        opinionListData: [],
        opinionListDatatotal: 0
      })
      this.opinionList()
    }
    this.isCooperationWithYashi()
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  // 查询升级会员费直降列表
  async marketFindUpgradeable (level) {
    const { memberInfo } = this.props.companyInfo
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
      const pagedRecords = res.data.data.pagedRecords
      if (parseInt(memberInfo.upgradeableLevels) > 1 && parseInt(memberInfo.vipLevelCode) === 0) {
        this.marketFind1(pagedRecords)// 逾期用户查询可以升级v1的直降活动
      } else {
        this.setState({
          price1: pagedRecords.length > 0 ? pagedRecords[0].price : 0,
          pagedRecords1: pagedRecords.length > 0 ? pagedRecords[0] : {}
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async marketFind1 (pagedRecordList) {
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
      const pagedRecords = res.data.data.pagedRecords
      this.setState({
        price3: pagedRecords.length > 0 ? pagedRecords[0].price : 0,
        pagedRecords3: pagedRecords.length > 0 ? pagedRecords[0] : {},
        price1: pagedRecordList.length > 0 ? pagedRecordList[0].price : 0,
        pagedRecords1: pagedRecordList.length > 0 ? pagedRecordList[0] : {}
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  isCooperationWithYashi = async () => {
    const res = await ajaxStore.company.isCooperationWithYashi()
    if (res.data && res.data.code === '0') {
      this.setState({
        isCooperationWithYashi: res.data.data
      })
    }
  }

  // 查询续费会员费直降列表
  async marketFindRenewal () {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '1', // 1 会员费直降 2 优惠券 不传则全部查出来
      level: companyInfo.memberInfo.vipLevelCode || '', // 可续费会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'price',
      order: 'DESC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)

    if (res.data && res.data.code === '0') {
      const pagedRecords = res.data.data.pagedRecords
      this.setState({
        price2: pagedRecords.length > 0 ? pagedRecords[0].price : 0,
        pagedRecords2: pagedRecords.length > 0 ? pagedRecords[0] : {}
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 优惠券列表1: 正常 2. 已使用 3. 过期
  async couponFind (type) {
    let data = {}
    if (type === '1') {
      data = {
        timeBetween: true,
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        orderBy: 'endTime',
        pageNo: '1',
        pageSize: '100'
      }
    } else if (type === '2') {
      data = {
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        orderBy: 'endTime',
        pageNo: '1',
        pageSize: '100'
      }
    } else if (type === '3') {
      data = {
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        pageNo: '1',
        orderBy: 'endTime',
        pageSize: '100'
      }
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      const pagedRecords = res.data.data.pagedRecords
      switch (type) {
        case '1':
          this.setState({
            dataNormal: pagedRecords
          })
          break
        case '2':
          this.setState({
            dataUse: pagedRecords
          })
          break
        case '3':
          this.setState({
            dataOver: pagedRecords
          })
          break
        default:
          break
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 查询可用优惠券列表
  async marketFind () {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '2', // 1 会员费直降 2 优惠券 不传则全部查出来
      // level: companyInfo.vipLevelCode, // 当前会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'end_time',
      order: 'ASC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        dataReceive: res.data.data.pagedRecords
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async resetData (orderStartTime, orderEndTime) {
    await this.setState({
      stateTime: orderStartTime, //
      endTime: orderEndTime //
    })
  }

  async billExport (orderStartTime, orderEndTime) {
    const data = {
      cifCompanyId: this.props.companyInfo.companyId,
      orderStartTime: orderStartTime,
      orderEndTime: orderEndTime
    }
    const res = await ajaxStore.company.billExport(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data) {
        onEvent('会员中心-生成对账单', 'mine/MemberCenter', '/ai/crm/bill/export')

        global.loading.show()
        open(`${baseUrl}/ofs/front/file/preview?fileKey=${res.data.data}`)
        global.loading.hide()
      } else {
        global.alert.show({
          content: '账单为空,无法导出'
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async opinionList () {
    const data = {
      companyId: this.props.companyInfo.companyId,
      pageNum: this.state.page,
      pageSize: this.state.opinionListDataOpen,
      readFlag: 0
    }
    const res = await ajaxStore.company.opinionList(data)
    if (res.data && res.data.code === '0') {
      const dataList = res.data.data || []
      const opinionListDatalist = [...this.state.opinionListData, ...dataList]
      this.setState({
        opinionListData: opinionListDatalist,
        opinionListDatatotal: res.data.total
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async opinionRead (item) {
    const { navigation, companyInfo } = this.props

    console.log(companyInfo.companyId, item.id)
    const data = {
      companyId: companyInfo.companyId,
      companyOpinionId: item.id
    }
    const res = await ajaxStore.company.opinionRead(data)
    if (res.data && res.data.code === '0') {
      navigation.navigate('WebView', { url: item.webSite, title: item.source })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async opinionListDataAdd () {
    await this.setState({
      page: this.state.page + 1
    })
    await this.opinionList()
  }

  toCustomerService () {
    const name = this.props.userInfo.userName
    this.props.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${name}`
    })
  }

  timePeriodSelection () {
    this.setState({
      timePeriodSelectionModal: true
    })
  }

  coupons (num, status) {
    return (
      <View>
        <View style={styles.couponsBG}>
          <Text style={styles.couponsNum}>{num}</Text>
          <Text style={styles.couponsStatus}>{status}</Text>
        </View>
        {(status === '可领取' && num > 0) && <View style={styles.couponsRedPoint}></View>}
      </View>
    )
  }

  opinionListItem (item, index) {
    return (
      <Touchable onPress={() => {
        this.opinionRead(item)
      }} key={index}>
        <View key={index}>
          <View style={styles.opinionItemBG}>
            <View style={styles.pushBG}>
              <Text style={styles.opinionItemCompanyName}>{item.companyName}</Text>
              <Text style={styles.opinionItemPublishTime}>{item.publishTime}</Text>
            </View>
            <Text style={styles.opinionItemTitle}>{item.title}</Text>
            <View style={styles.opinionItemBGNull}></View>
          </View>
        </View>
      </Touchable>
    )
  }

  render () {
    const { navigation, companyInfo, userInfo } = this.props

    let price = 0
    let pagedRecords = []
    const vipLevelCode = companyInfo.memberInfo ? companyInfo.memberInfo.vipLevelCode : '0'
    const upgradeableLevels = companyInfo.memberInfo ? companyInfo.memberInfo.vipLevelCode : ''
    const validEndTime = companyInfo.memberInfo ? companyInfo.memberInfo.validEndTime : ''
    const opinionListData = this.state.opinionListData

    if ((parseInt(vipLevelCode) === 0 && parseInt(upgradeableLevels) > 1)) {
      if (this.state.price1 > this.state.price3) {
        price = this.state.price1
        pagedRecords = this.state.pagedRecords1
      } else {
        price = this.state.price3
        pagedRecords = this.state.pagedRecords3
      }
    } else {
      // 只可升级
      if ((Number(upgradeableLevels) > Number(vipLevelCode)) && (getTimeDifference(validEndTime) > 90)) {
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
        <NavBar title={'会员中心'} navigation={navigation} rightIcon="navibar_kefu" rightIconSize={dp(60)} style={styles.navBarBG} stateBarStyle={styles.navBarBG} navBarStyle={styles.navBarBG} onRightPress={() => {
          this.toCustomerService()
        }} />
        <ScrollView keyboardShouldPersistTaps="handled" >
          {/* 接口异常判断 */}
          {companyInfo.memberInfo && (companyInfo.memberInfo.id !== '' ? <MineVipStatus navigation={navigation} companyInfo={companyInfo} userInfo={userInfo} supplierInfo={this.props.supplierInfo}
            price={price}
            price1={this.state.price1}
            price2={this.state.price2}
            pagedRecords={pagedRecords}>
          </MineVipStatus> : null)}

          {/* 亚士对账单 */}
          {this.state.isCooperationWithYashi
            ? <View>
              <Text style={[styles.title1Style, styles.marginTopNull]}>亚士对账单</Text>
              <Touchable onPress={() => {
                navigation.navigate('YSBill')
              }} >
                <View style={styles.timePeriodBG1}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.timePeriodText}>亚士经销商专享对账单服务</Text>
                    <View style={styles.timePeriodLookBG}>
                      <Text style={styles.timePeriodLookText}>前往签署</Text>
                      <Iconfont style={{}} name={'arrow-right1'} size={dp(24)} />
                    </View>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#F8F8FA',
                    borderRadius: dp(10),
                    paddingVertical: dp(14),
                    paddingHorizontal: dp(20),
                    marginBottom: dp(40)
                  }}>
                    <Iconfont name={'jinggao'} size={dp(24)} />

                    <Text style={{
                      color: '#91969A',
                      marginLeft: dp(10),
                      fontSize: dp(24)
                    }}>对账单合同需每月签署，两次未签署则无法下单</Text>
                  </View>
                </View>

              </Touchable>
            </View>
            : null}

          {vipLevelCode >= 1 && <Text style={[styles.title1Style, styles.marginTopNull]}>企业对账单</Text>}
          {vipLevelCode >= 1 && <Touchable onPress={() => {
            this.timePeriodSelection()
          }} >
            <View style={styles.timePeriodBG}>
              <Text style={styles.timePeriodText}>每月1号出账单，企业对账不用愁</Text>
              <View style={styles.timePeriodLookBG}>
                <Text style={styles.timePeriodLookText}>查看</Text>
                <Iconfont style={{}} name={'arrow-right1'} size={dp(24)} />
              </View>
            </View>
          </Touchable>}

          {vipLevelCode > 3 && <Touchable onPress={() => {
            navigation.navigate('HistoricalOpinionInfo', { companyId: companyInfo.companyId })
          }} >
            <View style={styles.pushBG}>
              <Text style={styles.title1Style}>舆情推送</Text>
              <View style={styles.pushLookBG}>
                <Text style={[styles.title2Style, { marginRight: 0 }]}>查看历史舆情消息</Text>
                <Iconfont style={styles.title2Style} name={'arrow-right1'} size={dp(24)} />
              </View>
            </View>
          </Touchable>}
          {vipLevelCode > 3 && (opinionListData.length > 0 ? <View style={styles.opinionListBG}>
            {opinionListData.map((item, index) => {
              return (
                this.opinionListItem(item, index)
              )
            })}
            {(this.state.opinionListDatatotal > opinionListData.length) &&
              <Touchable onPress={() => {
                this.opinionListDataAdd()
              }} >
                <View style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: dp(30), height: dp(90) }}>
                  <Text style={{ color: '#91969A', fontSize: dp(28) }}>展开更多数据 </Text>
                  <Iconfont name={'arrow-right1'} size={dp(24)} />
                </View>
              </Touchable>}
          </View>
            : <View style={{ backgroundColor: '#FFFFFF', alignItems: 'center', borderRadius: dp(16), marginLeft: dp(30), marginRight: dp(30), marginTop: dp(40) }}>
              <Text style={{ color: '#A7ADB0', fontSize: dp(28), marginVertical: dp(40) }}>暂无舆情数据</Text>
            </View>)}
          <Text style={styles.title1Style}>风险管理</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', alignItems: 'center', borderRadius: dp(16), paddingLeft: dp(30), paddingRight: dp(30), marginLeft: dp(30), marginRight: dp(30), marginTop: dp(40) }}>
            <Text style={{ color: '#A7ADB0', fontSize: dp(28), paddingVertical: dp(40) }}>暂不支持手机端查看，可登录仟金顶官网进行查看</Text>
          </View>
          <Text style={styles.title1Style}>优惠券</Text>
          <Touchable onPress={() => {
            this.props.navigation.navigate('IntroducPackage')
          }} >
            <View style={{ marginTop: dp(40), backgroundColor: 'white', borderRadius: dp(16), flexDirection: 'row', paddingVertical: dp(30), marginHorizontal: dp(30), alignItems: 'center' }}>
              {this.coupons(`${this.state.dataNormal.length}`, '可使用')}
              <View style={{ width: dp(1), height: dp(44), backgroundColor: Color.SPLIT_LINE }}></View>
              {this.coupons(`${this.state.dataUse.length}`, '已使用')}
              <View style={{ width: dp(1), height: dp(44), backgroundColor: Color.SPLIT_LINE }}></View>
              {this.coupons(`${this.state.dataOver.length}`, '已失效')}
              <View style={{ width: dp(1), height: dp(44), backgroundColor: Color.SPLIT_LINE }}></View>
              {this.coupons(`${this.state.dataReceive.length}`, '可领取')}
            </View>
          </Touchable>
          <View style={{ marginTop: dp(108), alignItems: 'center', justifyContent: 'center', marginBottom: dp(107) }}>
            <Text style={{ fontSize: dp(24), color: '#C7C7D6' }}>—— 页面到底了 ——</Text>
          </View>
        </ScrollView>
        <TimePeriodSelection
          navigation={this.props.navigation}
          companyId={this.props.companyInfo.companyId}
          orderStartTime={this.state.stateTime}
          orderEndTime={this.state.endTime}
          cancel={() => {
            this.setState({
              timePeriodSelectionModal: false
            })
          }}
          comfirm={(orderStartTime, orderEndTime) => {
            this.resetData(orderStartTime, orderEndTime)
            this.billExport(orderStartTime, orderEndTime)
          }}
          infoModal={this.state.timePeriodSelectionModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  opinionItemBGNull: {
    flex: 1,
    height: dp(1),
    backgroundColor: Color.SPLIT_LINE,
    marginTop: dp(40)
  },
  opinionItemTitle: {
    marginTop: dp(24),
    color: '#1A97F6',
    fontSize: dp(24),
    lineHeight: dp(35)
  },
  opinionItemPublishTime: {
    color: '#A5A5A5',
    fontSize: dp(24)
  },
  opinionItemCompanyName: {
    color: '#2D2926',
    fontSize: dp(24),
    fontWeight: 'bold'
  },
  opinionItemBG: {
    marginHorizontal: dp(30),
    marginTop: dp(40)
  },
  opinionListBG: {
    marginTop: dp(40),
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16)
  },
  pushLookBG: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pushBG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timePeriodLookText: {
    color: '#A7ADB0',
    fontSize: dp(28)
  },
  timePeriodLookBG: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  timePeriodText: {
    color: '#2D2926',
    fontSize: dp(28),
    paddingVertical: dp(40)
  },
  timePeriodBG: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderRadius: dp(16),
    paddingLeft: dp(30),
    paddingRight: dp(30),
    marginLeft: dp(30),
    marginRight: dp(30),
    marginTop: dp(40)
  },
  timePeriodBG1: {
    backgroundColor: '#FFFFFF',
    borderRadius: dp(16),
    paddingLeft: dp(30),
    paddingRight: dp(30),
    marginLeft: dp(30),
    marginRight: dp(30),
    marginTop: dp(40)
  },
  marginTopNull: {
    marginTop: dp(60)
  },
  navBarBG: {
    backgroundColor: Color.DEFAULT_BG
  },
  couponsRedPoint: {
    borderRadius: dp(6),
    width: dp(12),
    height: dp(12),
    backgroundColor: Color.RED,
    position: 'absolute',
    marginLeft: ((DEVICE_WIDTH - dp(60) - dp(3)) / 4) / 2 + dp(20)
  },
  couponsNum: {
    fontSize: dp(32),
    color: '#2D2926'
  },
  couponsStatus: {
    fontSize: dp(24),
    color: '#91969A',
    marginTop: dp(20)
  },
  couponsBG: {
    alignItems: 'center',
    width: (DEVICE_WIDTH - dp(60) - dp(3)) / 4
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
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
  title1Style: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    marginTop: dp(120),
    marginLeft: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5',
    marginTop: dp(120),
    marginRight: dp(30)
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    newMemberFeeContractList: state.contract.newMemberFeeContractList
  }
}

export default connect(mapStateToProps)(MemberCenter)
