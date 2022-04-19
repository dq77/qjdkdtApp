import React, { PureComponent } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import Picker from 'react-native-picker'
import { connect } from 'react-redux'
import { getCompanyInfo, getMemberVipInfo } from '../../actions'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { DEVICE_WIDTH, getBottomSpace, getRealDP as dp } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'
import GoodInfoData from '../mine/component/GoodInfoData'
import ManufacturerData from '../mine/component/ManufacturerData'
import OperationWarn from '../mine/component/OperationWarn'
import SixMonthData from '../mine/component/SixMonthData'
import SixMonthDataProgress from '../mine/component/SixMonthDataProgress'
import LimitOverview from './component/LimitOverview'

class DataPage extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      pickerData: ['本月', '本季度', '本年'],
      selectSubstituteType: '本月',
      warnManageUpSupplierSelectSubstituteType: '本月',
      productInfoData: [],
      upSupplier: [],
      aiManageWarnData: {},
      memberFeeContractV: '0', // 0未开启   1已开启
      customerManageWarnDataVo: {},
      customerManageWarnPersonDataVo: {},
      newInformation: {},
      infoModal: false,
    }
  }

  componentDidMount() {
    this.init()
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.init()
    })
    // BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    // BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async init() {
    this.setState({
      refreshing: true,
    })
    await getCompanyInfo()
    await getMemberVipInfo(this.props.companyInfo.companyId)
    await this.newInformation()
    const vipLevelCode = this.props.companyInfo.memberInfo ? this.props.companyInfo.memberInfo.vipLevelCode : ''

    const warnManageUpSupplierSelectSubstituteType = this.state.warnManageUpSupplierSelectSubstituteType
    if (vipLevelCode !== '0' && vipLevelCode !== '') {
      await this.warnManage(
        this.state.selectSubstituteType === '本月' ? '1' : this.state.selectSubstituteType === '本季度' ? '2' : '0',
      )
      await this.warnManageUpSupplier(
        warnManageUpSupplierSelectSubstituteType === '本月'
          ? '1'
          : warnManageUpSupplierSelectSubstituteType === '本季度'
          ? '2'
          : '0',
      )
      await this.customerGetCustomerManageWarnVo()
    }

    this.creditAll()
    this.creditSupplier()
    this.setState({
      refreshing: false,
    })
  }

  async creditSupplier() {
    const data = {
      pageNo: 1,
      pageSize: 100,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditSupplier(data)
    if (res.data && res.data.code === '0') {
      const creditSupplierInfoList = res.data.data.pagedRecords || []
      const creditSupplierInfo = []
      creditSupplierInfoList.forEach((item, index) => {
        const dicData = {
          title: '1',
          key1: '3',
          data: [
            {
              money: item.availableLine || 0,
              rate: item.availableRate || 0,
              name: item.supplierInfo ? item.supplierInfo.name : '',
              status: item.status,
            },
            {
              money: item.usedLine || 0,
              rate: item.usedRate || 0,
              status: item.status,
            },
          ],
        }
        creditSupplierInfo.push(dicData)
      })
      this.setState({ creditSupplierInfo: creditSupplierInfo })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async creditAll(refresh) {
    const data = {
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditAll(data)
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      // 仟金顶授信
      const creditQjdInfo = data.creditQjdInfo || {}

      const creditQjdInfoData = [
        {
          title: '1',
          key1: '1',
          data: [
            {
              money: creditQjdInfo.availableLine || 0,
              rate: creditQjdInfo.availableRate || 0,
              status: creditQjdInfo.status,
            },
            {
              money: creditQjdInfo.usedLine || 0,
              rate: creditQjdInfo.usedRate || 0,
              status: creditQjdInfo.status,
            },
          ],
        },
      ]

      this.setState({ creditQjdInfo: creditQjdInfoData })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async warnManage(type) {
    const data = {
      cifCompanyId: this.props.companyInfo.companyId,
      timeType: type === '1' ? 0 : type === '2' ? 1 : 2, // 时间类型:0：本月；1：本季度；2：本年度
    }
    const res = await ajaxStore.company.customerGetTrendVo(data)
    if (res.data && res.data.code === '0') {
      const productInfoData = res.data.data.data
      this.setState({
        productInfoData: productInfoData.productInfo || [],
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async warnManageUpSupplier(type) {
    const data = {
      cifCompanyId: this.props.companyInfo.companyId,
      timeType: type === '1' ? 0 : type === '2' ? 1 : 2, // 时间类型:0：本月；1：本季度；2：本年度
    }
    const res = await ajaxStore.company.customerGetTrendVo(data)
    if (res.data && res.data.code === '0') {
      const upSupplier = res.data.data.data.upSupplier || []
      // 后台数据出错，主动剔除一下
      const memberFeeContractList = upSupplier.filter(item => {
        return item.supplierId !== null && item.supplierId !== ''
      })
      this.setState({
        upSupplier: memberFeeContractList || [],
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async newInformation() {
    const res = await ajaxStore.company.newInformation()
    if (res.data && res.data.code === '0') {
      this.setState({
        newInformation: res.data.data || {},
      })

      // this.setState({
      //   newInformation: {
      //     tradePayable: 23, // 最近应付货款
      //     tradePayableStatus: 'normal', // 最近应付货款状态 normal 正常 overdue逾期
      //     servicePayable: 12, // 最近应付服务费
      //     servicePayableStatus: 'normal', // 最近应付服务费状态 normal 正常 overdue逾期
      //     compositeFeePayable: 32, // 最近应付综合服务费
      //     compositeFeePayableStatus: 'normal', // 最近应付综合服务费状态  normal 正常 overdue逾期
      //     repaymentDate: '2020-07-29', // 到期日期
      //     finalRepaymentDate: '' // 货款到期日期
      //   }
      // })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  onRefresh = () => {
    this.init()
  }

  async customerGetCustomerManageWarnVo() {
    const data = {
      cifCompanyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.company.customerGetCustomerManageWarnVo(data)
    if (res.data && res.data.code === '0') {
      const aiManageWarn = res.data.data.aiManageWarn.data
      const customerManageWarnPersonDataVo = res.data.data.customerManageWarnPersonDataVo
      const customerManageWarnDataVo = res.data.data.customerManageWarnDataVo
      this.setState({
        aiManageWarnData: aiManageWarn || {},
        memberFeeContractV:
          customerManageWarnPersonDataVo.isMonthWarnShipmentAmountOne === 1
            ? '1'
            : customerManageWarnPersonDataVo.isMonthWarnShipmentAmountTwo === 1
            ? '1'
            : customerManageWarnPersonDataVo.isYearWarnShipmentAmountOne === 1
            ? '1'
            : customerManageWarnPersonDataVo.isYearWarnShipmentAmountTwo === 1
            ? '1'
            : '0',
        customerManageWarnDataVo: customerManageWarnDataVo,
        customerManageWarnPersonDataVo: customerManageWarnPersonDataVo,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  pickerConfirm(pickedValue, type) {
    const selectType = pickedValue === '本月' ? '1' : pickedValue === '本季度' ? '2' : '0' // 时间类型:0：本月；1：本季度；2：本年度
    switch (type) {
      case '1':
        this.setState({
          warnManageUpSupplierSelectSubstituteType: pickedValue,
        })
        this.warnManageUpSupplier(selectType)
        break
      case '2':
        this.setState({
          selectSubstituteType: pickedValue,
        })
        this.warnManage(selectType)
        break
      default:
        break
    }
    this.hideShadow()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  showDatePicker = type => {
    this.showShadow()
    this.initPicker(type)
    Picker.show()
  }

  // 1.合作厂家数据  2.商品信息
  initPicker = type => {
    const selectedValue = [
      type === '1' ? this.state.warnManageUpSupplierSelectSubstituteType : this.state.selectSubstituteType,
    ]
    Picker.init({
      pickerData: this.state.pickerData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: selectedValue,
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.pickerConfirm(pickedValue[0], type)
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {},
    })
  }

  renderSupplier = () => {
    const supplierViews = []
    for (let index = 0; index < this.state.creditSupplierInfo.length; index++) {
      const element = this.state.creditSupplierInfo[index]
      const status = element.data[1].status
      const titleStatus =
        status === 'TODO'
          ? '未审批'
          : status === 'PROCESS'
          ? '审批中'
          : status === 'REJECT'
          ? '审批不通过'
          : status === 'DONE'
          ? '已生效'
          : status === 'INVALID'
          ? '失效'
          : ''
      const titleStatusColor =
        status === 'TODO'
          ? '#91969a'
          : status === 'PROCESS'
          ? '#fecd00'
          : status === 'REJECT'
          ? '#f55849'
          : status === 'DONE'
          ? '#2a6ee7'
          : status === 'INVALID'
          ? '#f55849'
          : ''
      supplierViews.push(
        <LimitOverview
          key={`${index}`}
          indexKey={`${index}`}
          titleStatus={titleStatus}
          titleStatusColor={titleStatusColor}
          paymentNum={element.data[1].rate}
          colorsStart={['#B4C4E3', '#7D92C2']}
          colorsEnd={['#ABA0FF', '#766DDB']}
          textTopFont={dp(24)}
          textTop={'违约占比'}
          title={element.data[0].name}
          num1={element.data[1].money}
          num2={element.data[0].money}
          type={2}
          dataType={3}
        />,
      )
    }
    return supplierViews
  }

  render() {
    const { navigation, companyInfo, userInfo } = this.props
    const { aiManageWarnData } = this.state
    const creditSaleTotalCount = `${aiManageWarnData.creditSaleTotalCount ? aiManageWarnData.creditSaleTotalCount : 0}`
    const freeServiceTotalCount = `${
      aiManageWarnData.freeServiceTotalCount ? aiManageWarnData.freeServiceTotalCount : 0
    }`
    const creditSaleTotalAmount = `${
      aiManageWarnData.creditSaleTotalAmount ? toAmountStr(aiManageWarnData.creditSaleTotalAmount / 10000, 2, true) : 0
    }`
    const shipmentTotalAmount = `${
      aiManageWarnData.shipmentTotalAmount ? toAmountStr(aiManageWarnData.shipmentTotalAmount / 10000, 2, true) : 0
    }`
    const normalRepaymentTotalCount = aiManageWarnData.normalRepaymentTotalCount
      ? aiManageWarnData.normalRepaymentTotalCount
      : 0
    const unnormalRepaymentTotalCount = aiManageWarnData.unnormalRepaymentTotalCount
      ? aiManageWarnData.unnormalRepaymentTotalCount
      : 0
    const freeServiceRepayment = aiManageWarnData.freeServiceRepayment ? aiManageWarnData.freeServiceRepayment : 0
    const outOfFreeServiceRepayment = aiManageWarnData.outOfFreeServiceRepayment
      ? aiManageWarnData.outOfFreeServiceRepayment
      : 0
    const status = this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].status : ''
    const titleStatus =
      status === 'TODO'
        ? '未审批'
        : status === 'PROCESS'
        ? '审批中'
        : status === 'REJECT'
        ? '审批不通过'
        : status === 'DONE'
        ? '已生效'
        : status === 'INVALID'
        ? '失效'
        : ''
    const titleStatusColor =
      status === 'TODO'
        ? '#91969a'
        : status === 'PROCESS'
        ? '#fecd00'
        : status === 'REJECT'
        ? '#f55849'
        : status === 'DONE'
        ? '#2a6ee7'
        : status === 'INVALID'
        ? '#f55849'
        : 'transparent'

    return (
      <View style={{ backgroundColor: '#F7F7F9', flex: 1 }}>
        <NavBar title={'数据看板'} navigation={navigation} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              colors={[Color.THEME]}
              // tintColor={'white'}
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
        >
          <View style={{ backgroundColor: '#F7F7F9', borderRadius: dp(16) }}>
            <View style={styles.pushBG}>
              <Text style={styles.title1Style}>经营趋势</Text>
            </View>
            <View
              style={{
                marginTop: dp(40),
                backgroundColor: 'white',
                marginHorizontal: dp(30),
                borderRadius: dp(16),
                paddingVertical: dp(40),
              }}
            >
              <View
                style={{
                  marginHorizontal: dp(30),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={[styles.title1Style, { fontSize: dp(28), marginTop: 0, marginLeft: 0 }]}>经营预警</Text>
                <Touchable
                  onPress={() => {
                    this.setState({
                      infoModal: true,
                    })
                  }}
                >
                  <View style={styles.pushLookBG}>
                    <Text style={{ marginRight: dp(8), fontSize: dp(24), color: '#91969A' }}>{`${
                      this.state.memberFeeContractV === '1' ? '已开启' : '未开启'
                    }`}</Text>
                    <Iconfont style={{ marginRight: 0 }} name={'arrow-right1'} size={dp(24)} />
                  </View>
                </Touchable>
              </View>
              {this.state.memberFeeContractV === '1' && (
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: dp(30), marginTop: dp(60) }}
                >
                  <Iconfont style={{ marginRight: 0 }} name={'jingshi'} size={dp(30)} />
                  {this.state.customerManageWarnPersonDataVo.isMonthWarnShipmentAmountOne === 1 && (
                    <Text
                      style={{ marginLeft: dp(10), fontSize: dp(28), color: '#2D2926' }}
                    >{`请注意！本月出货金额低于上月${this.state.customerManageWarnDataVo.monthWarnShipmentAmountOneVal}%以上`}</Text>
                  )}
                  {this.state.customerManageWarnPersonDataVo.isMonthWarnShipmentAmountTwo === 1 && (
                    <Text
                      style={{ marginLeft: dp(10), fontSize: dp(28), color: '#2D2926' }}
                    >{`请注意！本月出货金额低于上月${this.state.customerManageWarnDataVo.monthWarnShipmentAmountTwoVal}%以上`}</Text>
                  )}
                  {this.state.customerManageWarnPersonDataVo.isYearWarnShipmentAmountOne === 1 && (
                    <Text
                      style={{ marginLeft: dp(10), fontSize: dp(28), color: '#2D2926' }}
                    >{`请注意！本月出货金额低于上年同期${this.state.customerManageWarnDataVo.yearWarnShipmentAmountOneVal}%以上`}</Text>
                  )}
                  {this.state.customerManageWarnPersonDataVo.isYearWarnShipmentAmountTwo === 1 && (
                    <Text
                      style={{ marginLeft: dp(10), fontSize: dp(28), color: '#2D2926' }}
                    >{`请注意！本月出货金额低于上年同期${this.state.customerManageWarnDataVo.yearWarnShipmentAmountTwoVal}%以上`}</Text>
                  )}
                </View>
              )}
            </View>
            <ManufacturerData
              data={this.state.upSupplier}
              title1={this.state.warnManageUpSupplierSelectSubstituteType}
              confirm={() => {
                this.showDatePicker('1')
              }}
            />
            {
              <GoodInfoData
                companyInfo={companyInfo}
                confirm={() => {
                  this.showDatePicker('2')
                }}
                title1={this.state.selectSubstituteType}
                data={this.state.productInfoData}
              />
            }
            <View
              style={[
                styles.pushBG,
                { marginTop: dp(120), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
              ]}
            >
              <Text style={styles.title1Style}>数据总览</Text>
              <Text style={styles.title1DecStyle}>近6个月数据</Text>
            </View>
            <SixMonthData
              key={'1'}
              title={'赊销/免服务费笔数'}
              num1Name={'累计赊销'}
              num1={creditSaleTotalCount}
              num2Name={'累计免费服务'}
              num2={freeServiceTotalCount}
              creditSaleInfo={aiManageWarnData.creditSaleInfo}
              type={1}
              dataType={1}
            />
            <SixMonthData
              key={'2'}
              title={'赊销/出货额度'}
              num1Name={'累计赊销金额'}
              num1={creditSaleTotalAmount}
              num2Name={'累计出货金额'}
              num2={shipmentTotalAmount}
              creditSaleInfo={aiManageWarnData.creditSaleInfo}
              type={3}
              dataType={2}
            />
            <View style={{ flexDirection: 'row' }}>
              <SixMonthDataProgress
                key={'3'}
                colorsStart={['#E3ECFB', '#C3D5F5']}
                colorsEnd={['#F2799F', '#E72A56']}
                textTopFont={dp(24)}
                textTop={'违约占比'}
                title={'诚信/违约还款次数'}
                num1V={normalRepaymentTotalCount}
                num1Name={'诚信还款'}
                num1={`${normalRepaymentTotalCount}次`}
                num2Name={'违约还款'}
                num2V={unnormalRepaymentTotalCount}
                num2={`${unnormalRepaymentTotalCount}次`}
                type={2}
                dataType={3}
              />
              <SixMonthDataProgress
                key={'4'}
                colorsStart={['#E3ECFB', '#C3D5F5']}
                colorsEnd={['#AFA6EF', '#776DDB']}
                textTopFont={dp(20)}
                textTop={'缴纳服务费占比'}
                title={'还款情况'}
                num1Name={'免缴服务费'}
                num1={`${freeServiceRepayment}笔`}
                num2Name={'缴纳服务费'}
                num2={`${outOfFreeServiceRepayment}笔`}
                num1V={aiManageWarnData.freeServiceRepayment}
                num2V={aiManageWarnData.outOfFreeServiceRepayment}
                type={2}
                dataType={4}
              />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <SixMonthDataProgress
                key={'5'}
                colorsStart={['#E3ECFB', '#C3D5F5']}
                colorsEnd={['#79A5F2', '#2A6EE7']}
                title={'平均赊销账期'}
                num1Name={'平均赊销账期'}
                num1V={
                  this.state.aiManageWarnData.averageAccountTotalPeriod
                    ? this.state.aiManageWarnData.averageAccountTotalPeriod
                    : 0
                }
                num1={`${
                  this.state.aiManageWarnData.averageAccountTotalPeriod
                    ? this.state.aiManageWarnData.averageAccountTotalPeriod
                    : 0
                }天`}
                creditSaleInfo={this.state.aiManageWarnData.creditSaleInfo}
                type={3}
                dataType={5}
                baseData={360.0}
              />
              <SixMonthDataProgress
                key={'6'}
                colorsStart={['#E3ECFB', '#C3D5F5']}
                colorsEnd={['#79A5F2', '#2A6EE7']}
                title={'赊销状态情况'}
                num1Name={'已完结'}
                num1={`${this.state.aiManageWarnData.overCount ? this.state.aiManageWarnData.overCount : 0}笔`}
                num2Name={'未完结'}
                num2={`${this.state.aiManageWarnData.unOverCount ? this.state.aiManageWarnData.unOverCount : 0}笔`}
                creditSaleInfo={this.state.aiManageWarnData.creditSaleInfo}
                num1V={this.state.aiManageWarnData.overCount}
                num2V={this.state.aiManageWarnData.unOverCount}
                type={4}
                dataType={6}
              />
            </View>
            <View
              style={[
                styles.pushBG,
                { marginTop: dp(120), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
              ]}
            >
              <Text style={styles.title1Style}>额度总览</Text>
            </View>
            {this.state.creditQjdInfo && (
              <LimitOverview
                key={'7'}
                titleStatus={titleStatus}
                titleStatusColor={titleStatusColor}
                paymentNum={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].rate : 0}
                colorsStart={['#B4C4E3', '#7D92C2']}
                colorsEnd={['#79A5F2', '#2A6EE7']}
                textTopFont={dp(24)}
                textTop={'违约占比'}
                title={'仟金顶额度'}
                num1={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].money : 0}
                num2={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[0].money : 0}
                type={2}
                dataType={3}
              />
            )}
            {this.state.creditSupplierInfo && this.renderSupplier()}

            <View style={styles.end}>
              <Text style={styles.endText}>—— 页面到底了 ——</Text>
            </View>
          </View>
        </ScrollView>
        {this.state.showShadow ? (
          <Touchable
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </Touchable>
        ) : null}
        <OperationWarn
          navigation={this.props.navigation}
          companyId={this.props.companyInfo.companyId}
          cancel={() => {
            this.setState({
              infoModal: false,
            })
          }}
          comfirm={selectItemData => {
            this.setState({
              infoModal: false,
            })
            this.customerGetCustomerManageWarnVo()
          }}
          infoModal={this.state.infoModal}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  pushLookBG: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title1DecStyle: {
    fontSize: dp(26),
    color: '#91969A',
    marginRight: dp(30),
  },
  title1Style: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: 'bold',
    marginLeft: dp(30),
  },
  pushBG: {
    marginTop: dp(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
  },
  bgTopView: {
    backgroundColor: '#2C2D65',
    width: DEVICE_WIDTH,
    position: 'absolute',
    height: dp(480),
  },
  end: {
    alignItems: 'center',
    marginBottom: dp(93) + getBottomSpace(),
    marginTop: dp(90) + getBottomSpace(),
  },
  endText: {
    fontSize: dp(24),
    color: '#A7ADB0',
  },
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    newMemberFeeContractList: state.contract.newMemberFeeContractList,
  }
}

export default connect(mapStateToProps)(DataPage)
