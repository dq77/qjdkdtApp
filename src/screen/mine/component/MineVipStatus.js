import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Iconfont from '../../../iconfont/Icon'
import Color from '../../../utils/Color'
import { getTimeDifference } from '../../../utils/DateUtils'
import { DashLine } from '../../../component/DashLine'
import Touchable from '../../../component/Touchable'
import { toAmountStr } from '../../../utils/Utility'
import VipModal from './VipPayModal'
import { vIdcardNumber } from '../../../utils/reg'
import {
  setFaceExtraData
} from '../../../actions'
import ajaxStore from '../../../utils/ajaxStore'
import { webUrl } from '../../../utils/config'

export default class MineVipStatus extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      memberFeeContractList: [],
      processId: '',
      companyInfo: {},
      isMerberMoney: false,
      isMerberExclusiveMoney: false,
      merberMoneycash: '', // 会员价格现金
      merberExclusiveMoneycash: '', // 诚信认证会员专享价格现金
      merberMoneySilver: '', // 会员价格银承
      merberExclusiveMoneySilver: '', // 诚信认证会员专享价格银承
      vipModal: false,
      isExpand: true,
      isManageService: false, // 风险管理服务
      isUseManageService: false, // 风险管理服务是否使用
      isTemporaryLine: false, // 申请临时授信额度
      isUseTemporaryLine: false, // 申请临时授信额度是否使用
      isAscensionLine: false, // 提升授信额度
      isPublicOpinionPush: false, // 舆情推送
      isBusinessWarning: true, // 经营预警
      isAccountStatement: true, // 企业对账单
      processStatus: 0,
      isManageServiceNum: '-', // 会员服务次数(简版)
      isManageServiceDNum: '-', // 会员服务次数(深度版)
      isTemporaryLineNum: '-', // 临额可提升额度
      isTemporaryLineNumTime: '-', // 临额可提升额度期限
      isAscensionLineNum: '-', // 固额可提升额度
      isPublicOpinionPushNum: '-', // 舆情推送
      isBusinessWarningNum: '免费',
      isAccountStatementNum: '免费',
      getMemberVipFree: []
    }
  }

  static getDerivedStateFromProps (nextProps) {
    return {
      companyInfo: nextProps.companyInfo
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
    } else {

    }
  }

  async checkProcessStatus () {
    const res = await ajaxStore.company.checkProcessStatus({ companyId: this.state.companyInfo.companyId })
    console.log(res.data.data, 'processStatus')
    if (res.data && res.data.data && res.data.code === '0') {
      const data = {
        processStatus: -1,
        ...res.data.data
      }
      this.setState({
        processStatus: data.processStatus,
        processId: data.processId
      })
    } else {
      console.log('普通用户，未实名完成或者实名完成')
    }
  }

  topIcon = () => {
    return <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: dp(30) }}>
        <View style={{ flexDirection: 'row' }}>
          {this.state.companyInfo.memberInfo.vipLevelCode === '0'
            ? <Iconfont style={styles.iconsCreditItem} name={'Vputongkehu'} size={dp(72)} />
            : this.state.companyInfo.memberInfo.vipLevelCode === '1'
              ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang4'} size={dp(72)} />
              : this.state.companyInfo.memberInfo.vipLevelCode === '2'
                ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang2'} size={dp(72)} />
                : this.state.companyInfo.memberInfo.vipLevelCode === '3'
                  ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang'} size={dp(72)} />
                  : this.state.companyInfo.memberInfo.vipLevelCode === '4'
                    ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang1'} size={dp(72)} />
                    : this.state.companyInfo.memberInfo.vipLevelCode === '5'
                      ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang5'} size={dp(72)} />
                      : this.state.companyInfo.memberInfo.vipLevelCode === '6'
                        ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang3'} size={dp(72)} />
                        : this.state.companyInfo.memberInfo.vipLevelCode === '7'
                          ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang6'} size={dp(72)} />
                          : this.state.companyInfo.memberInfo.vipLevelCode === '8'
                            ? <Iconfont style={styles.iconsCreditItem} name={'Vdianliang7'} size={dp(72)} />
                            : <View ></View> }
          {this.state.companyInfo.memberInfo.creditType === 1 ? <Iconfont style={[styles.iconsCreditItem, { marginLeft: dp(15) }]} name={'xinyongbiao'} size={dp(72)} /> : null}
        </View>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate('MembershipRule', { vipLevelCode: this.props.companyInfo.memberInfo.vipLevelCode })
        }} >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: dp(24), marginRight: dp(10) }}>会员特权</Text>
            <Iconfont name={'arrow-right1'} size={dp(20)} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.textVipLevelBgStyle}>
        {(this.state.companyInfo.memberInfo.vipLevelCode === '0' || this.state.companyInfo.memberInfo.vipLevelCode === '') ? <Iconfont name={'putongyonghu'} size={dp(30)} /> : <Text style={styles.textVipLevelStyle}>{`V${this.state.companyInfo.memberInfo.vipLevelCode}`}</Text>}
        {this.state.companyInfo.memberInfo.vipLevelCode !== '8' && <Iconfont name={'xingzhuang'} size={dp(30)} />}
        {this.state.companyInfo.memberInfo.vipLevelCode === '8' ? <Text style={styles.textVipLevelStyle}>{'V8'}</Text> : <Text style={styles.textVipLevelStyle}>{`V${(Number(this.state.companyInfo.memberInfo.upgradeableLevels) > Number(this.state.companyInfo.memberInfo.vipLevelCode)) ? Number(this.state.companyInfo.memberInfo.upgradeableLevels) : 1 + Number(this.state.companyInfo.memberInfo.vipLevelCode)}`}</Text>}
      </View>
      <View style={styles.vipLevelLineBgStyle}>
        <View style={[styles.vipLevelLineStyle, { borderTopLeftRadius: dp(6), borderBottomLeftRadius: dp(6) }]}></View>
        <View style={[styles.vipLevelLineStyle, { backgroundColor: this.state.companyInfo.memberInfo.vipLevelCode === '8' ? '#FFFFFF' : '#696990', borderTopRightRadius: dp(6), borderBottomRightRadius: dp(6) }]}></View>
      </View>
    </View>
  }

  // 升级续费弹窗，统一管理
  upgradeRenewalModal = () => {
    return <VipModal
      navigation={this.props.navigation}
      companyId={this.props.companyInfo.companyId}
      supplierId={this.props.supplierInfo.id}
      companyId={this.props.companyInfo.companyId}
      memberInfo={this.props.companyInfo.memberInfo}
      cancel={() => {
        this.setState({
          vipModal: false
        })
      }}
      show={() => {
        this.setState({
          vipModal: true
        })
      }}
      infoModal={this.state.vipModal} />
  }

  // 立即升级 或者  成为会员
  async upgradeImmediately () {
    const { companyInfo } = this.props
    const { companyTag } = companyInfo
    if (companyTag.isSupportwoDistribution === 1) {
      // 当前处于未认证成功
    // 实名认证
      global.alert.show({
        title: '请先进行法人实名认证',
        content: '点击确定进行法人实名认证',
        callback: () => {
          this.props.navigation.navigate('RealNameAuth')
        }
      })
    } else {
      // 交费弹窗 （sequence === 2 或者 会员过期）
      // this.setState({ vipModal: true })
      this.props.navigation.navigate('VipUpgradeRenewal')
    }
  }

  // 立即签署合同
  signContractImmediately = () => {
    this.getCSContractList({
      name: '',
      page: 1,
      pageSize: 100,
      ownerList: [this.state.companyInfo.companyId, this.props.supplierInfo.id]
    })
  }

  async getCSContractList (data) {
    let contractList
    const res = await ajaxStore.contract.getCSContractList(data)
    console.log(res, 'CSres')
    if (res.data && res.data.code === '0') {
      contractList = res.data.data ? res.data.data.records : []
      const memberFeeContractList = contractList.filter((item) => {
        return item.type === '37'
      })
      this.setState({
        memberFeeContractList
      })
      this.processVariables()
    }
  }

  async processVariables () {
    const { memberFeeContractList } = this.state
    const res = await ajaxStore.company.processVariables({ processInstanceId: this.state.processId })
    console.log('processVariables' + res.data.code)
    if (res.data && res.data.data && res.data.code === '0') {
      global.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${res.data.data.contractSignProcessId}&contractCode=${memberFeeContractList[0].code}`, title: '合同签约' })
    }
  }

  // &sessionId=${memberFeeContractList[0].code}
  // 展开查看会员特权
  expandMembershipBenefit = () => {
    this.setState({
      isExpand: !this.state.isExpand
    })
  }

  // 背景蓝色
  backgroundUI () {
    return (
      <Image
        source={require('../../../images/huiyuanditu.png')}
        style={{
          position: 'absolute',
          width: dp(690),
          height: dp(390)
        }}
        resizeMode="cover"
      />
    )
  }

  // 活动提示栏  除了过期，其他状态，只要这个经销商有活动，且升级或续费的会员等级满足，就显示这个活动标签
  activityPromptBar () {
    return (
      <View style={{ backgroundColor: 'white', margin: dp(30), borderRadius: dp(16) }}>
        <Text style={{ fontSize: dp(28), color: '#2D2926', marginHorizontal: dp(40), marginVertical: dp(30) }}>{this.props.pagedRecords.startTime} 至 {this.props.pagedRecords.endTime} 期间会员费续费或升级费用<Text style={{ color: Color.RED }}>
直降{this.props.pagedRecords.price}
        </Text>元</Text>
        <Iconfont style={{ position: 'absolute' }} name={'sale2x'} size={dp(70)} />
      </View>
    )
  }

  // 会员状态
  render () {
    if (!this.state.companyInfo.memberInfo) {
      return (
        <View>
        </View>
      )
    }
    if (this.state.companyInfo.memberInfo.blackType === 1) { // 黑名单用户
      return (
        <View style={styles.header}>
          {this.backgroundUI()}
          <View>
            {this.topIcon()}
            <View style={{ alignItems: 'flex-end', marginTop: dp(40), marginRight: dp(40) }}>
              <Text style={styles.textTipStyle}>您当前的会员等级被冻结,如有疑问请联系客服</Text>
            </View>
            {this.upgradeRenewalModal()}
          </View>
        </View>
      )
    } else {
      // 先判断是否是会员  vipLevelCode  ，是会员走升级续费流程 ，不是会员再看流程有没有走完，走完了就是普通用户，没走完就走流程
      this.checkProcessStatus()
      if (this.state.companyInfo.memberInfo.vipLevelCode === '0' || this.state.companyInfo.memberInfo.vipLevelCode === '') {
        if (this.state.processStatus === 1) {
          console.log('立即签署会员服务费协议 ')
          return (
            <View style={styles.header}>
              {this.backgroundUI()}
              <View>
                {this.topIcon()}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30), marginHorizontal: dp(40) }}>
                  <Touchable onPress={() => {
                    this.signContractImmediately()
                  }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: dp(32), width: dp(176), height: dp(64) }}>
                      <Text style={{ fontSize: dp(24), color: '#2D2926' }}>签署合同</Text>
                    </View>
                  </Touchable>
                  {this.state.companyInfo.memberInfo.validEndTime && <Text style={styles.textTipStyle}>{`会员有效期至${this.state.companyInfo.memberInfo.validEndTime}`}</Text>}
                </View>
              </View>
              {this.upgradeRenewalModal()}
            </View>
          )
        } else {
          console.log('普通用户，未实名完成或者实名完成')
          return (
            <View>
              <View style={styles.header}>
                {this.backgroundUI()}
                <View>
                  {this.topIcon()}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30), marginHorizontal: dp(40) }}>
                    <Touchable onPress={() => {
                      this.upgradeImmediately()
                    }}>
                      <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: dp(32), width: dp(176), height: dp(64) }}>
                        <Text style={{ fontSize: dp(24), color: '#2D2926' }}>成为会员</Text>
                      </View>
                    </Touchable>
                  </View>
                  {this.upgradeRenewalModal()}
                </View>
              </View>
              {this.props.price > 0 && this.activityPromptBar()}
            </View>
          )
        }
      } else {
      // 可升级vip等级  大于  当前用户等级  ，则提示可升级
      // 可续费  当前时间超过validLastThreeMonthTime的时间提示可续费
        if (((Number(this.state.companyInfo.memberInfo.upgradeableLevels) > Number(this.state.companyInfo.memberInfo.vipLevelCode)) && (getTimeDifference(this.state.companyInfo.memberInfo.validLastThreeMonthTime) <= 0) && this.state.processStatus !== 1) || (Number(this.state.companyInfo.memberInfo.upgradeableLevels) > Number(this.state.companyInfo.memberInfo.vipLevelCode) && this.state.processStatus !== 1)) {
          console.log('可升级或者可续费    只可升级 都在这判断')
          return (
            <View>
              <View style={styles.header}>
                {this.backgroundUI()}
                <View>
                  {this.topIcon()}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30), marginHorizontal: dp(40) }}>
                    <Touchable onPress={() => {
                      this.upgradeImmediately()
                    }}>
                      <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: dp(32), width: dp(176), height: dp(64) }}>
                        <Text style={{ fontSize: dp(24), color: '#2D2926' }}>立即升级</Text>
                      </View>
                    </Touchable>
                    {this.state.companyInfo.memberInfo.validEndTime && <Text style={styles.textTipStyle}>{`会员有效期至${this.state.companyInfo.memberInfo.validEndTime}`}</Text>}
                  </View>
                  {this.upgradeRenewalModal()}
                </View>
              </View>
              {/* 只可升级，不可续费,此处只判断是否展示 */}
              {(Number(this.state.companyInfo.memberInfo.upgradeableLevels) > Number(this.state.companyInfo.memberInfo.vipLevelCode)) && (getTimeDifference(this.state.companyInfo.memberInfo.validEndTime) > 90) && this.props.price1 > 0 && this.activityPromptBar() }

              {/* 既可升级，也可续费,此处只判断是否展示 */}
              {(Number(this.state.companyInfo.memberInfo.upgradeableLevels) > Number(this.state.companyInfo.memberInfo.vipLevelCode)) && (getTimeDifference(this.state.companyInfo.memberInfo.validEndTime) <= 90) && (this.props.price1 > 0 || this.props.price2 > 0) && this.activityPromptBar()}

            </View>
          )
        } else if (getTimeDifference(this.state.companyInfo.memberInfo.validLastThreeMonthTime) <= 0 && this.state.processStatus !== 1) { // 只能续费 if (getTimeDifference(companyInfo.memberInfo.validLastThreeMonthTime) <= 0)
          console.log('只能续费')
          return (
            <View>
              <View style={styles.header}>
                {this.backgroundUI()}
                <View>
                  {this.topIcon()}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30), marginHorizontal: dp(40) }}>
                    <Touchable onPress={() => {
                      this.upgradeImmediately()
                    }}>
                      <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: dp(32), width: dp(176), height: dp(64) }}>
                        <Text style={{ fontSize: dp(24), color: '#2D2926' }}>立即续费</Text>
                      </View>
                    </Touchable>
                    {this.state.companyInfo.memberInfo.validEndTime && <Text style={styles.textTipStyle}>{`会员有效期至${this.state.companyInfo.memberInfo.validEndTime}`}</Text>}
                  </View>
                  {this.upgradeRenewalModal()}
                </View>
              </View>
              {this.props.price2 > 0 && this.activityPromptBar()}
            </View>
          )
        } else {
          console.log('既不能续费也不能升级')
          return (
            <View style={styles.header}>
              {this.backgroundUI()}
              <View>
                {this.topIcon()}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30), marginHorizontal: dp(30) }}>
                  {(this.state.processStatus === 1) ? <Touchable onPress={() => {
                    this.signContractImmediately()
                  }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: dp(32), width: dp(176), height: dp(64) }}>
                      <Text style={{ fontSize: dp(24), color: '#2D2926' }}>签署合同</Text>
                    </View>
                  </Touchable> : null}
                  {this.state.companyInfo.memberInfo.validEndTime && <Text style={styles.textTipStyle}>{`会员有效期至${this.state.companyInfo.memberInfo.validEndTime}`}</Text>}
                </View>
              </View>
              {this.upgradeRenewalModal()}
            </View>
          )
        }
      }
    }
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(50),
    height: dp(390),
    borderRadius: dp(16)
  },
  iconsItem: {
    marginVertical: dp(40),
    marginLeft: dp(40)
  },
  iconsCreditItem: {
    marginVertical: dp(40)
  },
  textTipStyle: {
    fontSize: dp(24),
    color: '#FFFFFF'
  },
  textRenewalTipStyle: {
    fontSize: dp(20),
    color: Color.RED,
    margin: dp(25),
    textAlign: 'center'
  },
  deadLine: {
    color: Color.TEXT_DARK,
    marginVertical: dp(30),
    textAlign: 'center',
    fontSize: dp(28)
  },
  becomeMember: {
    color: 'white',
    fontSize: dp(34)
  },
  becomeBgMember: {
    margin: dp(40),
    height: dp(90),
    backgroundColor: Color.THEME,
    alignItems: 'center',
    borderRadius: dp(45),
    justifyContent: 'center'
  },
  textVipLevelStyle: {
    color: '#FFFFFF',
    fontSize: dp(34)
  },
  textVipLevelBgStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dp(30)
  },
  vipLevelLineStyle: {
    backgroundColor: '#FFFFFF',
    width: (DEVICE_WIDTH - dp(120)) / 2,
    height: dp(12),
    marginBottom: dp(30)
  },
  vipLevelLineBgStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dp(30),
    marginTop: dp(10)
  },
  memberPriceGrayBG: {
    borderRadius: dp(16),
    marginHorizontal: dp(40),
    marginTop: dp(40),
    backgroundColor: '#F9F9FB'
  },
  memberPriceBG: {
    borderRadius: dp(16),
    marginHorizontal: dp(40),
    marginTop: dp(40),
    backgroundColor: '#FEFCF4'
  },
  memberPriceTitleBG: {
    borderTopRightRadius: dp(16),
    borderTopLeftRadius: dp(16),
    backgroundColor: '#FCF5D3',
    height: dp(80),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  memberTitleBG: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: dp(40),
    justifyContent: 'space-between'
  },
  cashTitleText: {
    color: '#353535',
    fontSize: dp(32)
  },
  cashTitleValueText: {
    color: '#AE8B08',
    fontSize: dp(32)
  },
  cashImg: {
    marginHorizontal: dp(40)
  },
  cashImgTitleText: {
    color: '#AE8B08',
    fontSize: dp(32),
    marginLeft: dp(37)
  },
  cashDecText: {
    color: '#888888',
    fontSize: dp(28),
    marginVertical: dp(10),
    marginHorizontal: dp(40)
  },
  tips: {
    color: '#AE8B08',
    fontSize: dp(24),
    marginLeft: dp(40),
    marginTop: dp(-20),
    marginBottom: dp(40)
  }
})
