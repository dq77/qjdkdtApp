import React, { PureComponent } from 'react'
import { View, StyleSheet, SectionList, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import {
  getCompanyInfo,
  getMemberVipInfo
} from '../../actions'
import { SolidBtn } from '../../component/CommonButton'
import ChooseCoupon from './component/ChooseCoupon'
import { onEvent } from '../../utils/AnalyticsUtil'
import { toAmountStr } from '../../utils/Utility'
import { getTimeDifference } from '../../utils/DateUtils'
import { DEFAULT_NAVBAR_HEIGHT } from 'react-native-pure-navigation-bar'

class VipUpgradeRenewal extends PureComponent {
  constructor (props) {
    super(props)
    const memberInfo = this.props.companyInfo.memberInfo
    this.state = {
      selectNum: (Number(memberInfo.upgradeableLevels) > Number(memberInfo.vipLevelCode)) ? 0 : 1,
      infoModal: false,
      dataNormalNum: 0,
      dataNormalData: [],
      orderType: (Number(memberInfo.upgradeableLevels) > Number(memberInfo.vipLevelCode)) ? '1' : '2', // 1.第一栏 2.第二栏
      pagedRecords1: [], // 第一栏的直降列表数据
      pagedRecords2: [], // 第二栏的直降列表数据
      totalAmount1: 0, // 第一栏减去会员费直降之后的金额
      totalAmount2: 0, // 第二栏减去会员费直降之后的金额
      selectItemData: {},
      pricea: 0, // 优惠券金额
      remark: ''
    }
  }

  componentDidMount () {
    this.customerListData()
  }

  // 优惠券列表1: 正常 2. 已使用 3. 过期
  async couponFind () {
    const data = {
      state: '1', // 状态， 1: 正常 2. 已使用 3. 过期
      pageNo: '1',
      pageSize: '100',
      scene: '2', // 会员抵扣传 2   ，  还款抵扣传  1,
      timeBetween: true,
      order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
      orderBy: 'endTime'
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      let pricea = 0
      const couponFindData = res.data.data.pagedRecords
      if (couponFindData.length === 1) {
        pricea = couponFindData[0].price ? couponFindData[0].price : 0
        this.setState({
          selectItemData: couponFindData[0],
          pricea: pricea
        })
      }
      this.setState({
        dataNormalNum: couponFindData.length,
        dataNormalData: couponFindData
      })

      this.selectNum()
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 查询升级会员费直降列表
  async marketFindUpgradeable (orderType) {
    const memberInfo = this.props.companyInfo.memberInfo
    const data = {
      timeBetween: true,
      marketCate: '1', // 1 会员费直降 2 优惠券 不传则全部查出来
      level: orderType === '1' ? memberInfo.upgradeableLevels : (parseInt(memberInfo.vipLevelCode) === 0 && parseInt(memberInfo.upgradeableLevels) > 1) ? '1' : memberInfo.vipLevelCode, // 可升级会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'price',
      order: 'DESC'// asc 升序， desc 降序
    }
    const res = await ajaxStore.company.marketFind(data)
    if (res.data && res.data.code === '0') {
      const pagedRecords = res.data.data.pagedRecords
      if (orderType === '1') {
        if (pagedRecords.length > 0) {
          const memberFreePay = (memberInfo.memberFreePay - pagedRecords[0].price) < 0 ? 0 : (memberInfo.memberFreePay - pagedRecords[0].price)
          this.setState({
            pagedRecords1: pagedRecords,
            totalAmount1: memberFreePay
          })
        } else {
          this.setState({
            pagedRecords1: pagedRecords,
            totalAmount1: parseFloat(memberInfo.memberFreePay)
          })
        }
      } else {
        // 先判断是否是逾期用户
        if (pagedRecords.length > 0) {
          if (parseInt(memberInfo.vipLevelCode) === 0 && parseInt(memberInfo.upgradeableLevels) > 1) {
            const price = (1000 - pagedRecords[0].price) < 0 ? 0 : (1000 - pagedRecords[0].price)
            this.setState({
              pagedRecords2: pagedRecords,
              totalAmount2: pagedRecords.length > 0 ? price : 1000
            })
          } else {
            const price = (memberInfo.memberFreeRenew - pagedRecords[0].price) < 0 ? 0 : (memberInfo.memberFreeRenew - pagedRecords[0].price)
            this.setState({
              pagedRecords2: pagedRecords,
              totalAmount2: pagedRecords.length > 0 ? price : parseFloat(memberInfo.memberFreeRenew)
            })
          }
        } else {
          this.setState({
            pagedRecords2: pagedRecords,
            totalAmount2: 1000
          })
        }
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

 customerListData = async () => {
   await getCompanyInfo()
   await getMemberVipInfo(this.props.companyInfo.companyId)
   await this.marketFindUpgradeable('1')
   await this.marketFindUpgradeable('2')
   await this.couponFind()
 }

 selectNum () {
   let pricea = 0
   if (this.state.selectNum === 0) {
     if (this.state.pagedRecords1.length > 0) {
       this.setState({
         selectItemData: {},
         pricea: 0 // 优惠券金额
       })
     } else {
       if (this.state.dataNormalNum === 1) {
         pricea = this.state.dataNormalData[0].price ? this.state.dataNormalData[0].price : 0
         this.setState({
           selectItemData: this.state.dataNormalData[0],
           pricea: pricea
         })
       } else {
         this.setState({
           selectItemData: {},
           pricea: 0 // 优惠券金额
         })
       }
     }
   } else {
     if (this.state.pagedRecords2.length > 0) {
       this.setState({
         selectItemData: {},
         pricea: 0 // 优惠券金额
       })
     } else {
       if (this.state.dataNormalNum === 1) {
         pricea = this.state.dataNormalData[0].price ? this.state.dataNormalData[0].price : 0
         this.setState({
           selectItemData: this.state.dataNormalData[0],
           pricea: pricea
         })
       } else {
         this.setState({
           selectItemData: {},
           pricea: 0 // 优惠券金额
         })
       }
     }
   }
 }

 // 优惠券和直降同时存在的时候，优惠券功能隐藏
 async payFee () {
   const memberInfo = this.props.companyInfo.memberInfo
   const pricea = this.state.selectItemData.price ? this.state.selectItemData.price : 0

   const discountId = this.state.orderType === '1' ? ((this.state.pagedRecords1.length < 1 && pricea === 0) ? null : (this.state.pagedRecords1.length > 0 ? this.state.pagedRecords1[0].id : this.state.selectItemData.id)) : ((this.state.pagedRecords2.length < 1 && pricea === 0) ? null : (this.state.pagedRecords2.length > 0 ? this.state.pagedRecords2[0].id : this.state.selectItemData.id))

   const couponCode = this.state.orderType === '1' ? ((this.state.pagedRecords1.length < 1 && pricea === 0) ? null : (this.state.pagedRecords1.length > 0 ? null : this.state.selectItemData.couponCode)) : ((this.state.pagedRecords2.length < 1 && pricea === 0) ? null : (this.state.pagedRecords2.length > 0 ? null : this.state.selectItemData.couponCode))

   const discountType = this.state.orderType === '1' ? (this.state.pagedRecords1.length > 0 ? 'fall' : (pricea === 0 ? null : 'coupon')) : (this.state.pagedRecords2.length > 0 ? 'fall' : (pricea === 0 ? null : 'coupon'))

   let orderType = ''
   if (parseInt(memberInfo.vipLevelCode) === 0 && parseInt(memberInfo.upgradeableLevels) > 1) {
     orderType = '1'
   } else {
     orderType = this.state.orderType
   }

   const data = {
     orderType: orderType, // 订单类型:1-升级,2-续费
     companyId: this.props.companyInfo.companyId,
     nowVipCode: orderType === '1' ? (this.state.selectNum === 0 ? memberInfo.upgradeableLevels : '1') : null, // 过期的会员，选择升级时，可以升级到最高等级，也可以选择升级1级
     discountType: discountType, // 优惠类型:fall-直降活动,coupon-优惠券
     discountId: discountId, // 优惠活动Id
     couponCode: couponCode// 优惠券code
   }
   const res = await ajaxStore.company.payMemberFee(data)
   if (res.data && res.data.code === '0') {
     onEvent('发起会员费缴纳', 'VipUpgradeRenewal', '/ofs/front/memberVip/pushMemberLevelUpgrade', {
       currentMemberLevel: this.props.companyInfo.vipLevelCode,
       memberProcessNo: ''
     })
     this.checkProcessStatus()
   } else {
     global.alert.show({
       content: res.data.message
     })
   }
 }

 async checkProcessStatus () {
   const res = await ajaxStore.company.checkProcessStatus({ companyId: this.props.companyInfo.companyId })
   console.log(res.data.data, 'processStatus')
   if (res.data && res.data.data && res.data.code === '0') {
     const data = { processStatus: -1, ...res.data.data }
     this.setState({
       processStatus: data.processStatus,
       processId: data.processId,
       remark: data.remark
     })
     this.statusAlert()
   }
 }

 statusAlert () {
   // 流程状态:0-流程发起,1-冻结成功，2-合同签署成功，3-合同签署失败，4-订单结束，5-人工终止，6-冻结失败，7-订单失败
   const processStatus = this.state.processStatus
   if (this.props.companyInfo.memberInfo.blackType === 1) {
     global.alert.show({
       title: '提示',
       content: '您当前的会员等级被冻结，如有疑问请联系客服',
       callback: () => {
       }
     })
   } else if (processStatus === 1) {
     //  global.alert.show({
     //    title: '签署会员服务费协议',
     //    content: '点击按钮立即签署会员服务费协议',
     //    callback: () => {
     //      this.processVariables()
     //    }
     //  })
     this.props.navigation.goBack()
   } else if (processStatus === 6) {
     global.alert.show({
       title: '账户可用余额不足',
       content: '请向账户充值足够金额后重试',
       callback: () => {
         global.alert.hide()
       }
     })
   } else {
     global.alert.show({
       content: this.state.remark
     })
   }
 }

 clickOneBox (type) {
   this.setState({
     selectNum: type === '1' ? 0 : 1,
     orderType: type
   })
   this.selectNum()
 }

 refuseClickSelectCoupon () {
   this.state.dataNormalNum !== 0 && this.setState({ infoModal: true })
 }

 refuseClickSelectCouponCancel () {
   this.setState({
     infoModal: false
   })
 }

 refuseClickSelectCouponComfirm (selectItemData) {
   const pricea = selectItemData.price ? selectItemData.price : 0
   this.setState({
     selectItemData: selectItemData,
     pricea: pricea
   })
 }

 iconfont (vipLevelCode) {
   const name = vipLevelCode === '0' ? 'Vputongkehu' : vipLevelCode === '1' ? 'Vdianliang4' : vipLevelCode === '2' ? 'Vdianliang2' : vipLevelCode === '3' ? 'Vdianliang' : vipLevelCode === '4' ? 'Vdianliang1' : vipLevelCode === '5' ? 'Vdianliang5' : vipLevelCode === '6' ? 'Vdianliang3' : vipLevelCode === '7' ? 'Vdianliang6' : 'Vdianliang7'
   return (
     <Iconfont style={{ marginLeft: dp(35) }} name={name} size={dp(60)} />
   )
 }

 renewalColumn () {
   const memberInfo = this.props.companyInfo.memberInfo
   const memberFreeRenew = memberInfo.memberFreeRenew
   const pagedRecords2 = this.state.pagedRecords2
   const price = pagedRecords2.length > 0 ? pagedRecords2[0].price : 0
   // 当前用户是逾期用户
   const isLimitUser = parseInt(memberInfo.vipLevelCode) === 0 && parseInt(memberInfo.upgradeableLevels) > 1
   const limitUserPrice = (1000 - price) < 0 ? 0 : (1000 - price)
   const noLimitUserPrice = (memberFreeRenew - price) < 0 ? 0 : (memberFreeRenew - price)

   const boxDec = pagedRecords2.length > 0 ? (`活动价：￥${isLimitUser ? limitUserPrice : noLimitUserPrice}元`) : (`需缴纳会员费：￥${isLimitUser ? '1000' : memberFreeRenew}元`)
   const boxDecMoney = isLimitUser ? '￥1000元' : `￥${memberFreeRenew}元`
   return (
     <Text style={[styles.textDecStyle, { marginTop: dp(10), color: this.state.selectNum === 1 ? 'white' : '#353535' }]}>{boxDec}{
       pagedRecords2.length > 0 && <Text style={[styles.textDecStyle, { marginTop: dp(10), color: this.state.selectNum === 1 ? 'white' : '#353535', textDecorationLine: 'line-through' }]}>{boxDecMoney}</Text>
     }
     </Text>
   )
 }

 renewalColumnShow () {
   const isShow = (this.state.orderType === '1' && this.state.pagedRecords1.length > 0) || (this.state.orderType === '2' && this.state.pagedRecords2.length > 0)
   const price = `-￥${this.state.pricea}`
   return (
     isShow &&
     <View style={styles.rColumnShow}>
       <Text style={styles.rColumnShowTitle}>优惠券</Text>
       <Text style={styles.rColumnShowDec}>{price}</Text>
     </View>
   )
 }

 nullLine () {
   const pagedRecords1 = this.state.pagedRecords1
   const pagedRecords2 = this.state.pagedRecords2
   const orderType = this.state.orderType
   const isPagedRecords1 = pagedRecords1.length < 1 && orderType === '1'
   const isPagedRecords2 = pagedRecords2.length < 1 && orderType === '2'
   return (
     (isPagedRecords1 || isPagedRecords2) && <View style={styles.nullLine}></View>
   )
 }

 oneBoxUI () {
   console.log('isUpgradeable')
   const memberInfo = this.props.companyInfo.memberInfo
   const isUpgradeable = Number(memberInfo.upgradeableLevels) > Number(memberInfo.vipLevelCode) // true 升级   false续费
   const selectNum = this.state.selectNum
   const pagedRecords1 = this.state.pagedRecords1
   const upgradeableText = `升级V${memberInfo.upgradeableLevels}`
   const price = pagedRecords1.length > 0 ? `活动价：￥${(memberInfo.memberFreePay - pagedRecords1[0].price) < 0 ? 0 : (memberInfo.memberFreePay - pagedRecords1[0].price)}元` : `需缴纳会员费：￥${memberInfo.memberFreePay}元`
   const isVip = memberInfo.vipLevelCode === '0' || memberInfo.vipLevelCode === '' // true 不是会员
   const boxOneMoney = `￥${memberInfo.memberFree}元`

   return (
     isUpgradeable &&
     <Touchable isNativeFeedback={true} onPress={() => {
       this.clickOneBox('1')
     }} >
       <View style={[styles.bgStyle, { backgroundColor: selectNum === 0 ? '#5F5F87' : '#FFFFFF' }]}>
         <View style={styles.flexDirectionRow}>
           {this.iconfont(memberInfo.upgradeableLevels)}
           <View style={{ marginLeft: dp(20) }}>
             <Text style={[styles.textDecStyle, { color: selectNum === 0 ? 'white' : '#353535' }]}>{upgradeableText}</Text>
             <Text style={[styles.textDecStyle, { marginTop: dp(10), color: selectNum === 0 ? 'white' : '#353535', maxWidth: dp(450) }]}>{price}
               {isVip ? (pagedRecords1.length > 0 && <Text style={[styles.textDecStyle, { marginTop: dp(10), color: selectNum === 0 ? 'white' : '#353535', textDecorationLine: 'line-through' }]}>{boxOneMoney}</Text>)
                 : <Text style={[styles.textDecStyle, { marginTop: dp(10), color: selectNum === 0 ? 'white' : '#353535', textDecorationLine: 'line-through' }]}>{boxOneMoney}</Text>
               }
             </Text>
           </View>
         </View>
         {selectNum === 0 ? <Iconfont style={{ marginHorizontal: dp(30) }} name={'xuanze' } size={dp(40)}/> : null}
       </View>
     </Touchable>
   )
 }

 twoBoxUI () {
   const memberInfo = this.props.companyInfo.memberInfo
   const isLimitUser = parseInt(memberInfo.vipLevelCode) === 0 && parseInt(memberInfo.upgradeableLevels) > 1 // 当前用户是逾期用户 true 是
   const selectNum = this.state.selectNum
   const isRenewalUser = parseInt(memberInfo.vipLevelCode) !== 0 && getTimeDifference(this.props.companyInfo.memberInfo.validLastThreeMonthTime) <= 0 // 当前用户是需要续费用户 true 是
   const renewalText = `续费V${memberInfo.vipLevelCode}`

   return (
     isLimitUser ? <Touchable isNativeFeedback={true} onPress={() => {
       this.clickOneBox('2')
     }} >
       <View style={[styles.bgStyle, { backgroundColor: selectNum === 1 ? '#5F5F87' : '#FFFFFF' }]}>
         <View style={styles.flexDirectionRow}>
           {this.iconfont('1')}
           <View style={{ marginLeft: dp(20) }}>
             <Text style={[styles.textDecStyle, { color: selectNum === 1 ? 'white' : '#353535' }]}>升级V1</Text>
             {this.renewalColumn()}
           </View>
         </View>
         {selectNum === 1 ? <Iconfont style={{ marginHorizontal: dp(30) }} name={'xuanze' } size={dp(40)}/> : null}
       </View>
     </Touchable> : (isRenewalUser && <Touchable isNativeFeedback={true} onPress={() => {
       this.clickOneBox('2')
     }} >
       <View style={[styles.bgStyle, { backgroundColor: selectNum === 1 ? '#5F5F87' : '#FFFFFF' }]}>
         <View style={styles.flexDirectionRow}>
           {this.iconfont(memberInfo.vipLevelCode)}
           <View style={{ marginLeft: dp(20) }}>
             <Text style={[styles.textDecStyle, { color: selectNum === 1 ? 'white' : '#353535' }]}>{renewalText}</Text>
             {this.renewalColumn()}
           </View>
         </View>
         {selectNum === 1 ? <Iconfont style={{ marginHorizontal: dp(30) }} name={'xuanze' } size={dp(40)}/> : null}
       </View>
     </Touchable>)
   )
 }

 couponUI () {
   const pagedRecords1 = this.state.pagedRecords1
   const pagedRecords2 = this.state.pagedRecords2
   return (
     this.state.orderType === '1'
       ? ((pagedRecords1.length < 1 && this.state.dataNormalNum > 0)
         ? (this.state.totalAmount1 === 0 ? this.noUseColumn() : this.useColumn()) : this.renewalColumnShow())
       : ((pagedRecords2.length < 1 && this.state.dataNormalNum > 0)
         ? (this.state.totalAmount2 === 0 ? this.noUseColumn() : this.useColumn()) : this.renewalColumnShow())
   )
 }

 useColumn () {
   const selectCoupon = this.state.selectItemData.price ? `-￥${this.state.selectItemData.price}` : `${this.state.dataNormalNum}张可用`

   return (
     <Touchable isNativeFeedback={true} onPress={() => {
       this.refuseClickSelectCoupon()
     }} >
       <View style={styles.selectCouponBG}>
         <Text style={styles.selectCouponTitle}>选择优惠券</Text>
         <View style={styles.flexDirectionRow}>
           <Text style={ { color: this.state.selectItemData.price ? '#F55849' : '#888888', fontSize: dp(28) }}>{selectCoupon}</Text>
           <Iconfont style={styles.selectCouponArrow} name={'arrow-right1' } size={dp(26)}/>
         </View>
       </View>
     </Touchable>
   )
 }

 noUseColumn () {
   return (
     <View style={styles.selectCouponBG}>
       <Text style={styles.selectCouponTitle}>选择优惠券</Text>
       <View style={styles.flexDirectionRow}>
         <Text style={ styles.selectCouponDec}>不使用优惠券</Text>
         <Iconfont style={styles.selectCouponArrow} name={'arrow-right1' } size={dp(26)}/>
       </View>
     </View>
   )
 }

 combineUI () {
   const totalAmount1 = `￥${(this.state.totalAmount1 - this.state.pricea < 0 ? 0 : (this.state.totalAmount1 - this.state.pricea))}`
   const totalAmount2 = `￥${(this.state.totalAmount2 - this.state.pricea < 0 ? 0 : (this.state.totalAmount2 - this.state.pricea))}`
   return (
     <View style={styles.combineBG}>
       {this.state.orderType === '1' ? <Text style={styles.combine}>合计：<Text style={styles.combineDec}>{totalAmount1}</Text></Text>
         : <Text style={styles.combine}>合计：<Text style={styles.combineDec}>{totalAmount2}</Text></Text>}
       <Touchable isNativeFeedback={true} onPress={() => {
         this.payFee()
       }} >
         <View style={styles.submitOrderBG}>
           <Text style={styles.submitOrderText}>提交订单</Text>
         </View>
       </Touchable>
     </View>
   )
 }

 costDetailUI () {
   const memberInfo = this.props.companyInfo.memberInfo
   // 判断是升级还是续费
   const isUpgradeable = Number(memberInfo.upgradeableLevels) > Number(memberInfo.vipLevelCode) // true 升级   false续费
   const originalMembershipFee = `￥${this.state.orderType === '1' ? this.state.totalAmount1 : this.state.totalAmount2}` // 会员费原价
   const isUpgradeableLevelThanOne = parseInt(memberInfo.vipLevelCode) > 0 && parseInt(memberInfo.upgradeableLevels) > 1 // 当前会员等级大于0，可升级会员等级大于1
   const differenceReduction = `￥${this.state.totalAmount1 - memberInfo.memberFree}`

   return (
     <View>
       <Text style={styles.textTitleStyle}>费用明细</Text>
       <View style={styles.originalMembershipFeeBG}>
         <Text style={styles.rColumnShowTitle}>会员费原价</Text>
         <Text style={styles.rColumnShowTitle}>{originalMembershipFee}</Text>
       </View>
       {/* 首先要要是第一栏，然后当前会员等级大于0，可升级会员等级大于1，然后必须是升级状态才能显示差价减免 */}
       {this.state.orderType === '1' && isUpgradeableLevelThanOne && isUpgradeable && <View style={styles.differenceReductionBG}>
         <Text style={styles.rColumnShowTitle}>差价减免</Text>
         <Text style={styles.rColumnShowTitle}>{differenceReduction}</Text>
       </View>}
     </View>
   )
 }
 // 当会员等级为0的时候，判断可升级等级是否大于1，大于1的就是过期用户

 // 第一格
 // 如果当前等级是v0，升级到v1(升级)
 // 1.有营销活动  划线
 //  2.没有营销活动 不划线
 // 升级到v6(升级)
 // 1.有营销活动  划线
 //  2.没有营销活动 不划线

 // 如果当前等级不是v0，升级到v2345678(升级)
 // 1.有营销活动  划线
 //  2.没有营销活动 划线

 // 第2格
 // 如果当前等级是v0，升级到v1(升级)
 // 1.有营销活动  划线
 //  2.没有营销活动 不划线
 // 续费到v12345678(续费)
 // 1.有营销活动 划线
 //  2.没有营销活动 不划线

 //  先判断orderType为1  ，则为第一栏,先判断orderType为2  ，则为第二栏后面
 //  1.再判断有没有会员直降活动，如果没有而且优惠券列表有优惠券，那么展示选择优惠券页面，其他情况隐藏选择优惠券页面
 //  ，然后判断totalAmount1就是升级金额为0.则直接展示不使用优惠券，禁止用户选择优惠券，否者容许用户选着优惠券
 //  2.再判断有没有会员直降活动，如果没有而且优惠券列表有优惠券，那么展示选择优惠券页面，其他情况隐藏选择优惠券页面  ，
 //  然后判断totalAmount2就是升级金额为0.则直接展示不使用优惠券，禁止用户选择优惠券，否者容许用户选着优惠券

 render () {
   const { navigation } = this.props
   const memberInfo = this.props.companyInfo.memberInfo
   // 判断是升级还是续费
   const isUpgradeable = Number(memberInfo.upgradeableLevels) > Number(memberInfo.vipLevelCode) // true 升级   false续费
   const navBarTitle = isUpgradeable ? '升级会员' : '续费会员'
   return (
     <View style={styles.container}>
       <NavBar title={ navBarTitle } navigation={navigation} />
       <View style={styles.oneBox}>
         <Text style={styles.textTitleStyle}>选择操作</Text>
         {/* 第一栏 */}
         {this.oneBoxUI()}
         {/* 第二栏 */}
         {this.twoBoxUI()}
         {this.nullLine()}
       </View>
       <View style={styles.costDetailBG}>
         {/* 会员费原价。差价减免 */}
         {this.costDetailUI()}
         {/* 优惠券UI */}
         {this.couponUI()}
       </View>
       {this.nullLine()}
       {/* 合计UI */}
       {this.combineUI()}
       <ChooseCoupon
         navigation={this.props.navigation}
         //  companyId={this.props.companyInfo.companyId}
         scene='2'// 会员抵扣传 2   ，  还款抵扣传  1
         cancel={() => {
           this.refuseClickSelectCouponCancel()
         }}
         comfirm={(selectItemData) => {
           this.refuseClickSelectCouponComfirm(selectItemData)
         }}
         infoModal={this.state.infoModal} />
     </View>
   )
 }
}

const styles = StyleSheet.create({
  submitOrderText: {
    fontSize: dp(28),
    color: 'white'
  },
  submitOrderBG: {
    alignItems: 'center',
    width: dp(192),
    height: dp(70),
    borderRadius: dp(36),
    justifyContent: 'center',
    backgroundColor: '#464678',
    marginHorizontal: dp(30),
    marginTop: dp(30)
  },
  combineDec: {
    fontSize: dp(32),
    color: '#F55849'
  },
  combineBG: {
    marginTop: DEVICE_HEIGHT - dp(186),
    backgroundColor: 'white',
    width: DEVICE_WIDTH,
    height: dp(186),
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  selectCouponArrow: {
    marginRight: dp(30),
    marginLeft: dp(20)
  },
  selectCouponDec: {
    color: '#888888',
    fontSize: dp(28)
  },
  selectCouponTitle: {
    color: '#353535',
    fontSize: dp(28),
    marginLeft: dp(30)
  },
  selectCouponBG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(40)
  },
  differenceReductionBG: {
    marginHorizontal: dp(30),
    marginBottom: dp(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  originalMembershipFeeBG: {
    marginHorizontal: dp(30),
    marginVertical: dp(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  costDetailBG: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    borderRadius: dp(16),
    marginTop: dp(40)
  },
  oneBox: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    borderRadius: dp(16)
  },
  rColumnShow: {
    marginHorizontal: dp(30),
    marginBottom: dp(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rColumnShowTitle: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  rColumnShowDec: {
    color: '#F55849',
    fontSize: dp(28)
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  textTitleStyle: {
    marginTop: dp(40),
    marginLeft: dp(30),
    color: '#2D2926',
    fontSize: dp(32),
    fontWeight: 'bold'
  },
  bgStyle: {
    marginHorizontal: dp(30),
    marginTop: dp(40),
    borderRadius: dp(10),
    height: dp(140),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#5F5F87',
    borderWidth: dp(1)
  },
  textDecStyle: {
    color: 'white',
    fontSize: dp(28)
  },
  combine: {
    marginLeft: dp(30),
    marginTop: dp(50),
    fontSize: dp(32)
  },
  flexDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nullLine: {
    height: dp(1),
    backgroundColor: 'white',
    width: DEVICE_WIDTH,
    marginTop: dp(40)
  }
})

const mapStateToProps = state => {
  return {
    supplierInfo: state.company.supplier,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(VipUpgradeRenewal)
