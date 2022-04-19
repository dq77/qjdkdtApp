import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, TouchableWithoutFeedback } from 'react-native'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import ajaxStore from '../../utils/ajaxStore'
import Iconfont from '../../iconfont/Icon'
import { DashLine } from '../../component/DashLine'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Touchable from '../../component/Touchable'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'
import Picker from 'react-native-picker'
import { toAmountStr } from '../../utils/Utility'

export default class MembershipRule extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showShadow: false,
      isShowModal: false,
      isShowModalType: '1',
      selectLevelIcon: 'Vputongkehu', // 当前vip等级icon
      cumulativeTimeShip: '-', // 累计出货次数
      cumulativeMoneyShip: '-', // 累计出货金额
      membershipFee: '-', // 会员年费
      comprehensiveServiceCharge: '-', // 综合服务费
      advanceDeliveryGood: '-', // 信息系统服务费（现金）
      advanceDeliveryGoodSilver: '-', // 信息系统服务费（银承）
      comprehensiveServiceCharge2: '-', // 综合服务费
      advanceDeliveryGood2: '-', // 信息系统服务费（现金）
      advanceDeliveryGoodSilver2: '-', // 信息系统服务费（银承）
      numberQueries: '-', // 风险管理科查询次数（简版）
      numberQueriesD: '-', // 风险管理科查询次数（深度版）
      temporaryLines: '-', // 可申请最高临时额度
      periodValidity: '-', // 临时额度最长有效期
      fixedQuota: '-', // 可申请最高固定额度
      publicOpinionPush: '-', // 舆情推送
      businessWarning: '-', // 经营预警
      accountStatement: '-', // 企业对账单
      substituteType: [
        '普通用户',
        'V1',
        'V2',
        'V3',
        'V4',
        'V5',
        'V6',
        'V7',
        'V8'
      ],
      form: {
        substituteType: '普通用户'
      },
      type: '创建',
      text: '',
      title: '',
      getMemberVipFree: []
    }
  }

  componentDidMount () {
    this.getMemberVipFree()
  }

  async getMemberVipFree () {
    const res = await ajaxStore.company.getMemberVipFree()
    if (res.data && res.data.code === '0') {
      this.setState({
        getMemberVipFree: res.data.data
      })
      const vipLevelCode = parseInt(this.props.navigation.state.params.vipLevelCode)
      switch (vipLevelCode) {
        case 0:
          this.vipData('普通用户', vipLevelCode)
          break
        case 1:
          this.vipData('V1', vipLevelCode)
          break
        case 2:
          this.vipData('V2', vipLevelCode)
          break
        case 3:
          this.vipData('V3', vipLevelCode)
          break
        case 4:
          this.vipData('V4', vipLevelCode)
          break
        case 5:
          this.vipData('V5', vipLevelCode)
          break
        case 6:
          this.vipData('V6', vipLevelCode)
          break
        case 7:
          this.vipData('V7', vipLevelCode)
          break
        case 8:
          this.vipData('V8', vipLevelCode)
          break
        default:
          this.vipData('普通用户', vipLevelCode)
          break
      }
    } else {

    }
  }

  alertModal = () => {
    if (this.state.isShowModalType === '1') {
      this.setState({
        title: '会员专享价规则说明',
        text: '1.仟金顶收费类目包括综合服务费和信息系统服务费。会员等级越高，综合服务费和信息系统服务费越低。\n2.部分产品方案不享受会员优惠价，如有免费期产品方案、有阶梯费率产品方案、共同付费或厂家付费的产品方案、诚信采和诚信销、第三方资金产品方案、有手续费的产品方案、平移托盘产品方案、非100%现金或100%银承付款方式产品方案、非6个月银承付款方式产品方案等其余特殊产品方案。\n3.综合服务费：按年化收取。包括大数据风险查询服务、大数据风险评估服务、大数据风险预警服务、第三方对接服务。\n4.信息系统服务费：按年化收取。包括订单管理系统、资金管理系统、客户管理系统、数据加密系统、区块链技术服务。\n5.工程项目类：取客户项目准入时会员等级对应的会员价（即同一个项目下的多笔订单价格不随等级变化而变化）。\n非工程项目类：取客户下单时会员等级对应的会员价（即同一笔订单下的多笔赊销货款不随等级变化而变化）。'
      })
    } else if (this.state.isShowModalType === '2') {
      this.setState({
        title: '诚信认证专享价规则说明',
        text: '1.仟金顶的诚信认证会员在享受会员等级相应的价格优惠基础上，还可享受到更低的价格。\n2.会员等级达到V4及以上的诚信认证会员才可享受诚信认证的专享价格。'
      })
    } else if (this.state.isShowModalType === '3') {
      this.setState({

        title: '风险管理服务规则说明',
        text: '1.通过仟金顶大数据技术支持，全面捕捉企业资质信息，形成高质量的商业信息报告。会员的等级越高，可免费获得的报告越多。\n2.使用方式：①点击“去使用”进入查询网站；②输入企业名称；③确认选择企业，点击“更多详情”获得企业商业信息报告。\n3.只限在仟金顶平台注册企业。\n4.每个等级可获取次数不累加，每升级一次可获取的免费次数重新刷新。'
      })
    } else if (this.state.isShowModalType === '4') {
      this.setState({
        title: '申请临额规则说明',
        text: '1.V2及以上每次升级均有1次临额申请机会，申请通过后，该次机会被使用即失效，如申请未通过保留该等级申请机会。\n2.在线申请临额、提额福利暂仅开放直营采、分销采产品，其余产品申请临额、提额需求请联系在线客服或拨打400-6121-666受理。\n3.临额申请攻略：申请直营采、分销采临时额度前，须先将货款及服务费还清再申请。\n4.最终额度及有效期均以最终审批结果为准。'
      })
    } else if (this.state.isShowModalType === '5') {
      this.setState({
        title: '提升授信额度规则说明',
        text: '1.升级至V4及以上即有1次申请提额机会，申请通过后，该次机会被使用即失效，如申请未通过则保留。\n2.最终额度以最终审批结果为准。'
      })
    } else if (this.state.isShowModalType === '6') {
      this.setState({
        title: '舆情推送规则说明',
        text: '1、会员需手动开启舆情推送服务会员需手动开启舆情推送服务，推送内容为合作伙伴的裁判文书推送内容为合作伙伴的裁判文书，诉讼信息等诉讼信息等；\n2、当您的合作伙伴出现舆情信息当您的合作伙伴出现舆情信息，次日早次日早9点会以邮件的形式下达点会以邮件的形式下达；\n3、合作伙伴合作伙伴：您在仟金顶合作您在仟金顶合作（（包括注册包括注册）过的上下游企业过的上下游企业；\n4、接收形式为邮件接收形式为邮件，账号增减可前往至账号增减可前往至“账户设置账户设置”内操作内操作（每种形式最多添加每种形式最多添加5个账号个账号；\n5、累计监测到的舆情只展示近1年的舆情信息'
      })
    } else if (this.state.isShowModalType === '7') {
      this.setState({
        title: '经营预警规则说明',
        text: '1、贸易数据每日更新，会员可登录官网进行查看；\n2、选择并开通预警功能后，若企业当月出货额触发预警机制时，则会在当月26日以短信形式提醒您；\n3、预警机制：以“本月出货额同比下降70%以上”为例：当月截止到25日24点的出货总额低于上一整个月的70%时触发短信预警（即上个月出货总额100万，本月截止至25日出货总额仍低于30万时系统触发短信预警）'
      })
    } else if (this.state.isShowModalType === '8') {
      this.setState({
        title: '企业对账单规则说明',
        text: '1、每月1号更新上个月的对账单，会员可登录官网进行下载；\n2、对账单更新后会以短信方式通知到会员；\n3、对账单内“未结清金额“和”未开票金额“只包含货款金额，不包含其他费用'
      })
    }
    return <Modal
      onTouchOutside={() => {
        this.setState({ isShowModal: false })
      }}
      width={0.9}
      visible={this.state.isShowModal}
      onSwipeOut={() => this.setState({ isShowModal: false })}
      modalAnimation={new ScaleAnimation({
        initialValue: 0.5, // optional
        useNativeDriver: true // optional
      })}
      onHardwareBackPress={() => {
        this.setState({ isShowModal: false })
        return true
      }}
      footer={
        <ModalFooter>
          <ModalButton
            text="确定"
            onPress={
              () => {
                this.setState({ isShowModal: false })
              }
            }
            key="button-1"
            textStyle={{ color: '#02BB00', fontWeight: 'bold', fontSize: dp(36) }}
          />
        </ModalFooter>
      }
    >
      <ModalContent style={{ alignItems: 'stretch' }}>
        <Text style={{
          fontSize: dp(36),
          textAlign: 'center',
          fontWeight: 'bold'
        }}>{this.state.title}</Text>

        <Text style={{
          fontSize: dp(30),
          // textAlign: 'center',
          marginTop: dp(20),
          color: '#888888',
          lineHeight: dp(42)
        }}>{this.state.text}</Text>

      </ModalContent>

    </Modal>
  }

  // 查看规则点击按钮
  lookRule = (type) => {
    this.setState({
      isShowModalType: type,
      isShowModal: true
    })
  }

  // 查看规则界面
  lookRuleView = (type) => {
    return <Touchable onPress={() => {
      this.lookRule(type)
    }}>
      <Text style={styles.cashImgTitleRightText}>查看规则</Text>
    </Touchable>
  }

  vipData = (pickedValue, pickedIndex) => {
    console.log(pickedValue, pickedIndex)
    this.setState({
      advanceDeliveryGood: this.state.getMemberVipFree[pickedIndex].cashServiceFreeRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].cashServiceFreeRate * 100, 2, true)}%` : '-', // 信息系统服务费（现金）
      advanceDeliveryGoodSilver: this.state.getMemberVipFree[pickedIndex].silverServiceFreeRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].silverServiceFreeRate * 100, 2, true)}%` : '-', // 信息系统服务费（银承）
      comprehensiveServiceCharge: this.state.getMemberVipFree[pickedIndex].comprehensiveServiceFreeRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].comprehensiveServiceFreeRate * 100, 2, true)}%` : '-', // 综合服务费
      comprehensiveServiceCharge2: this.state.getMemberVipFree[pickedIndex].comprehensiveServiceFreeRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].comprehensiveServiceFreeRate * 100, 2, true)}%` : '-', // 综合服务费
      advanceDeliveryGood2: this.state.getMemberVipFree[pickedIndex].cashCreditRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].cashCreditRate * 100, 2, true)}%` : '-', // 信息系统服务费（现金）
      advanceDeliveryGoodSilver2: this.state.getMemberVipFree[pickedIndex].silverCreditRate ? `${toAmountStr(this.state.getMemberVipFree[pickedIndex].silverCreditRate * 100, 2, true)}%` : '-', // 信息系统服务费（银承）
      membershipFee: `${this.state.getMemberVipFree[pickedIndex].memberFree}元` // 会员年费
    })
    if (pickedIndex === 0) {
      this.setState({
        selectLevelIcon: 'Vputongkehu',
        cumulativeTimeShip: '-', // 累计出货次数
        cumulativeMoneyShip: '-', // 累计出货金额
        membershipFee: '-', // 会员年费
        numberQueries: '-', // 风险管理科查询次数
        numberQueriesD: '-',
        temporaryLines: '-', // 可申请最高临时额度
        periodValidity: '-', // 临时额度最长有效期
        fixedQuota: '-', // 可申请最高固定额度
        publicOpinionPush: '-', // 舆情推送
        businessWarning: '-', // 经营预警
        accountStatement: '-' // 企业对账单
      })
    } else if (pickedIndex === 1) {
      this.setState({
        selectLevelIcon: 'Vdianliang4',
        cumulativeTimeShip: '0-2次', // 累计出货次数
        cumulativeMoneyShip: '0＜X≤50万元', // 累计出货金额
        numberQueries: '5次', // 风险管理科查询次数
        numberQueriesD: '3次',
        temporaryLines: '-', // 可申请最高临时额度
        periodValidity: '-', // 临时额度最长有效期
        fixedQuota: '-', // 可申请最高固定额度
        publicOpinionPush: '-', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 2) {
      this.setState({
        selectLevelIcon: 'Vdianliang2',
        cumulativeTimeShip: '3-5次', // 累计出货次数
        cumulativeMoneyShip: '50万元＜X≤120万元', // 累计出货金额
        numberQueries: '8次', // 风险管理科查询次数
        numberQueriesD: '5次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '60天', // 临时额度最长有效期
        fixedQuota: '-', // 可申请最高固定额度
        publicOpinionPush: '-', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 3) {
      this.setState({
        selectLevelIcon: 'Vdianliang',
        cumulativeTimeShip: '6-8次', // 累计出货次数
        cumulativeMoneyShip: '120万元＜X≤200万元', // 累计出货金额
        numberQueries: '8次', // 风险管理科查询次数
        numberQueriesD: '5次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '-', // 可申请最高固定额度
        publicOpinionPush: '-', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 4) {
      this.setState({
        selectLevelIcon: 'Vdianliang1',
        cumulativeTimeShip: '9-40次', // 累计出货次数
        cumulativeMoneyShip: '200万元＜X≤1200万元', // 累计出货金额
        numberQueries: '10次', // 风险管理科查询次数
        numberQueriesD: '6次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '已有额度的1.5倍', // 可申请最高固定额度
        publicOpinionPush: '免费', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 5) {
      this.setState({
        selectLevelIcon: 'Vdianliang5',
        cumulativeTimeShip: '41-100次', // 累计出货次数
        cumulativeMoneyShip: '1200万元＜X≤3000万元', // 累计出货金额
        numberQueries: '10次', // 风险管理科查询次数
        numberQueriesD: '6次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '已有额度的1.5倍', // 可申请最高固定额度
        publicOpinionPush: '免费', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 6) {
      this.setState({
        selectLevelIcon: 'Vdianliang3',
        cumulativeTimeShip: '101-200次', // 累计出货次数
        cumulativeMoneyShip: '3000万元＜X≤5500万元', // 累计出货金额
        numberQueries: '10次', // 风险管理科查询次数
        numberQueriesD: '6次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '已有额度的1.5倍', // 可申请最高固定额度
        publicOpinionPush: '免费', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 7) {
      console.log('pickedValue', pickedIndex)
      this.setState({
        selectLevelIcon: 'Vdianliang6',
        cumulativeTimeShip: '201-300次', // 累计出货次数
        cumulativeMoneyShip: '5500万元＜X≤8000万元', // 累计出货金额
        numberQueries: '15次', // 风险管理科查询次数
        numberQueriesD: '8次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '已有额度的1.5倍', // 可申请最高固定额度
        publicOpinionPush: '免费', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    } else if (pickedIndex === 8) {
      this.setState({
        selectLevelIcon: 'Vdianliang7',
        cumulativeTimeShip: '301次以上', // 累计出货次数
        cumulativeMoneyShip: '8000万元以上', // 累计出货金额
        numberQueries: '15次', // 风险管理科查询次数
        numberQueriesD: '8次',
        temporaryLines: '已有额度的50%', // 可申请最高临时额度
        periodValidity: '90天', // 临时额度最长有效期
        fixedQuota: '已有额度的1.5倍', // 可申请最高固定额度
        publicOpinionPush: '免费', // 舆情推送
        businessWarning: '免费', // 经营预警
        accountStatement: '免费' // 企业对账单
      })
    }
    this.setState({
      form: {
        substituteType: pickedValue
      }
    })
    console.log(this.state.form.substituteType)
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'会员规则'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <Touchable onPress={() => {
            this.showDatePicker()
          }}>
            <View style={styles.topTipSwitch}>
              <Text style={styles.topTipSwitchText}>点击切换会员等级</Text>
              <Iconfont style={styles.iconsItem} name={this.state.selectLevelIcon} size={dp(60)} />
            </View>
          </Touchable>
          {/* 升级规则 */}
          <Text style={{ fontSize: dp(32), fontWeight: 'bold', marginLeft: dp(20) }}>升级规则</Text>
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={[styles.memberPriceTitleBG, { backgroundColor: '#F8E4E4' }]}>
              <Text style={styles.cashImgTitleText}>会员等级划分门槛及年费</Text>
              <Touchable onPress={() => {
                global.alert.show({
                  title: '重要提示',
                  content: '会员只要达到”累计出货次数“和”累计出货额“里任一门槛条件即可缴费升级，无需都满足才可升级！'
                })
              }}>
                <Text style={styles.cashImgTitleRightText}>重要提示</Text>
              </Touchable>
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>累计出货次数</Text>
              <Text style={styles.cashTitleText}>{this.state.cumulativeTimeShip}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>累计出货额（X万元)</Text>
              <Text style={styles.cashTitleText}>{this.state.cumulativeMoneyShip}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>会员年费</Text>
              <Text style={styles.cashTitleText}>{this.state.membershipFee}</Text>
            </View>
          </View>
          <Text style={{ fontSize: dp(32), fontWeight: 'bold', marginLeft: dp(20), marginTop: dp(40) }}>会员特权</Text>
          {/* 会员专享价 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>会员专享价</Text>
              {this.lookRuleView('1')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>综合服务费</Text>
              <Text style={styles.cashTitleText}>{this.state.comprehensiveServiceCharge}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <View style={styles.memberTitleBoxBG}>
                <Text style={styles.cashTitleText}>信息系统服务费</Text>
                <View style={{ borderRadius: dp(8), borderColor: Color.GOLD, borderWidth: dp(2), margin: dp(10), width: dp(64), height: dp(32), justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.cashTitleTip1Text}>现金</Text>
                </View>
              </View>
              <Text style={styles.cashTitleText}>{this.state.advanceDeliveryGood}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <View style={styles.memberTitleBoxBG}>
                <Text style={styles.cashTitleText}>信息系统服务费</Text>
                <View style={{ borderRadius: dp(8), backgroundColor: Color.GOLD, margin: dp(10), width: dp(64), height: dp(32), justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.cashTitleTip2Text}>银承</Text>
                </View>
              </View>
              <Text style={styles.cashTitleText}>{this.state.advanceDeliveryGoodSilver}</Text>
            </View>
          </View>
          {/* 诚信认证会员专享价格 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>诚信认证会员专享价格</Text>
              {this.lookRuleView('2')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>综合服务费</Text>
              <Text style={styles.cashTitleText}>{this.state.comprehensiveServiceCharge2}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <View style={styles.memberTitleBoxBG}>
                <Text style={styles.cashTitleText}>信息系统服务费</Text>
                <View style={{ borderRadius: dp(8), borderColor: Color.GOLD, borderWidth: dp(2), margin: dp(10), width: dp(64), height: dp(32), justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.cashTitleTip1Text}>现金</Text>
                </View>
              </View>
              <Text style={styles.cashTitleText}>{this.state.advanceDeliveryGood2}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <View style={styles.memberTitleBoxBG}>
                <Text style={styles.cashTitleText}>信息系统服务费</Text>
                <View style={{ borderRadius: dp(8), backgroundColor: Color.GOLD, margin: dp(10), width: dp(64), height: dp(32), justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.cashTitleTip2Text}>银承</Text>
                </View>
              </View>
              <Text style={styles.cashTitleText}>{this.state.advanceDeliveryGoodSilver2}</Text>
            </View>
          </View>
          {/* 风险管理服务 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>风险管理服务</Text>
              {this.lookRuleView('3')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>风险管理可查询次数(简版)</Text>
              <Text style={styles.cashTitleText}>{this.state.numberQueries}</Text>
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>风险管理可查询次数(深度版)</Text>
              <Text style={styles.cashTitleText}>{this.state.numberQueriesD}</Text>
            </View>
          </View>
          {/* 舆情推送服务 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>舆情推送</Text>
              {this.lookRuleView('6')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>可享推送服务</Text>
              <Text style={styles.cashTitleText}>{this.state.publicOpinionPush}</Text>
            </View>
            <Text style={styles.tips}>该服务仅支持PC客户端</Text>
          </View>
          {/* 经营预警服务 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>经营预警</Text>
              {this.lookRuleView('7')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>可享服务</Text>
              <Text style={styles.cashTitleText}>{this.state.businessWarning}</Text>
            </View>
            <Text style={styles.tips}>该服务仅支持PC客户端</Text>
          </View>
          {/* 企业对账单 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>企业对账单</Text>
              {this.lookRuleView('8')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>可享服务</Text>
              <Text style={styles.cashTitleText}>{this.state.accountStatement}</Text>
            </View>
            <Text style={styles.tips}>该服务仅支持PC客户端</Text>
          </View>
          {/* 申请临时授信额度 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>申请临时授信额度</Text>
              {this.lookRuleView('4')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>可申请最高临时额度</Text>
              <Text style={styles.cashTitleText}>{this.state.temporaryLines}</Text>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH - dp(40)} />
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>临时额度最长有效期</Text>
              <Text style={styles.cashTitleText}>{this.state.periodValidity}</Text>
            </View>
          </View>
          {/* 提升授信额度 */}
          <View style={[styles.memberPriceBG, { marginTop: dp(20) }]}>
            <View style={styles.memberPriceTitleBG}>
              <Text style={styles.cashImgTitleText}>提升授信额度</Text>
              {this.lookRuleView('5')}
            </View>
            <View style={styles.memberTitleBG}>
              <Text style={styles.cashTitleText}>可申请最高固定额度</Text>
              <Text style={styles.cashTitleText}>{this.state.fixedQuota}</Text>
            </View>
          </View>
          {/* 底部分割线 */}
          <Text style={{ width: DEVICE_WIDTH, color: '#BFBFBF', textAlign: 'center', marginVertical: dp(40) }}>—— 到底了 ——</Text>
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}><View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
        {this.alertModal()}
      </View>
    )
  }

  initPicker = () => {
    Picker.init({
      pickerData: this.state.substituteType,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择会员等级',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.form.substituteType],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.vipData(pickedValue[0], pickedIndex[0])
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {

      }
    })
  }

  showDatePicker = () => {
    this.showShadow()
    this.initPicker()
    Picker.show()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  topTipSwitch: {
    flexDirection: 'row',
    borderWidth: dp(2),
    borderRadius: dp(45),
    borderColor: '#3B3C5A',
    marginHorizontal: dp(30),
    height: dp(90),
    marginTop: dp(60),
    marginBottom: dp(50),
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topTipSwitchText: {
    fontSize: dp(28),
    color: '#3B3C5A',
    marginLeft: dp(30)
  },
  iconsItem: {
    margin: dp(20)
  },
  memberPriceBG: {
    marginHorizontal: dp(20)
    // backgroundColor: '#FEFCF4'
  },
  memberPriceTitleBG: {
    backgroundColor: '#FCF5D3',
    height: dp(80),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cashImgTitleText: {
    color: '#353535',
    fontSize: dp(28),
    marginLeft: dp(40),
    fontWeight: 'bold'
  },
  cashImgTitleRightText: {
    color: '#353535',
    fontSize: dp(28),
    marginRight: dp(40),
    textDecorationLine: 'underline'
  },
  memberTitleBG: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: dp(40),
    justifyContent: 'space-between'
  },
  cashTitleText: {
    color: '#353535',
    fontSize: dp(28)
  },
  memberTitleBoxBG: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cashTitleTip1Text: {
    color: Color.GOLD,
    fontSize: dp(24)
  },
  cashTitleTip2Text: {
    color: 'white',
    fontSize: dp(24)
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  tips: {
    color: '#AE8B08',
    fontSize: dp(24),
    marginLeft: dp(40),
    marginTop: dp(-20),
    marginBottom: dp(20)
  }
})
