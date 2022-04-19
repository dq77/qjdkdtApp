import React, { PureComponent } from 'react'
import { Clipboard, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import Modal, { ModalButton, ModalContent, ModalFooter, ScaleAnimation } from 'react-native-modals'
import { connect } from 'react-redux'
import AlertModal from '../../component/AlertModal'
import ComfirmModal from '../../component/ComfirmModal'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { customerServiceUrl } from '../../utils/config'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { getProductDetail, showToast, toAmountStr } from '../../utils/Utility'

class LoanDetail extends PureComponent {
  constructor(props) {
    super(props)
    this.loanStatus = {
      0: '未支付货款',
      1: '审批中',
      2: '审批未通过',
      3: '已支付货款',
      4: '已完成',
      DEL: '已删除',
    }
    this.state = {
      refreshing: false,
      loanCode: '',
      supplierName: '',
      statusName: '',
      principalRemain: 0,
      makeLoanAmount: 0,
      tabType: 1, // 当前tab类型 1：还款计划表  2：放款信息 3: 借款信息（南京） 4：还款记录
      refundPlanVOList: [],
      refundPlanVOListByNanJing: [],
      refundSummaryVO: {},
      loanStatus: {
        0: '未支付货款',
        1: '审批中',
        2: '审批未通过',
        3: '已支付货款',
        4: '已完成',
        DEL: '已删除',
      },
      repayStatus: {
        DONE: {
          text: '已付清',
          icon: 'icon-complete1',
          index: 'index',
          date: 'date',
          state: 'state',
          dashed: 'dashed',
          money: 'money',
          cent: 'cent',
        },
        INTERESTDELAY: {
          text: '已违约',
          icon: 'icon-warn',
          index: 'index1',
          date: 'date1',
          state: 'state1',
          dashed: 'dashed',
          money: 'money1',
          cent: 'cent1',
        },
        PRINCIPALDELAY: {
          text: '已违约',
          icon: 'icon-warn',
          index: 'index1',
          date: 'date1',
          state: 'state1',
          dashed: 'dashed',
          money: 'money1',
          cent: 'cent1',
        },
        INTERESTING: {
          text: '本期应还总额',
          icon: 'icon-status-1',
          index: 'index',
          date: 'date',
          state: 'state',
          dashed: 'dashed1',
          money: 'money2',
          cent: 'cent2',
        },
        UNINTEREST: {
          text: '未开始',
          icon: 'icon-status-',
          index: 'index2',
          date: 'date2',
          state: 'state2',
          dashed: 'dashed',
          money: 'money3',
          cent: 'cent3',
        },
      },
      repayStatusByNanJing: {
        4: {
          text: '已付清',
          icon: 'icon-complete1',
          index: 'index',
          date: 'date',
          state: 'state',
          dashed: 'dashed2',
          money: 'money',
          cent: 'cent',
          desc: 'desc1',
        },
        3: {
          text: '已违约',
          icon: 'icon-warn',
          index: 'index1',
          date: 'date1',
          state: 'state1',
          dashed: 'dashed2',
          money: 'money1',
          cent: 'cent1',
          desc: 'desc',
        },
        2: {
          text: '已违约',
          icon: 'icon-warn',
          index: 'index1',
          date: 'date1',
          state: 'state1',
          dashed: 'dashed2',
          money: 'money1',
          cent: 'cent1',
          desc: 'desc',
        },
        1: {
          text: '本期应还总额',
          icon: 'icon-status-1',
          index: 'index',
          date: 'date',
          state: 'state',
          dashed: 'dashed3',
          money: 'money2',
          cent: 'cent2',
          desc: 'desc',
        },
        0: {
          text: '未开始',
          icon: 'icon-status-',
          index: 'index2',
          date: 'date2',
          state: 'state2',
          dashed: 'dashed2',
          money: 'money3',
          cent: 'cent3',
          desc: 'desc1',
        },
      },
      loanInfo: {},
      loanInfoByNanJing: {},
      repayInfo: {},
      refundInfo: {},
      totalRepay: {},
      historyData: [],
      useRate: null, // 会员费率
      useSource: '0',
      comprehensiveServiceFreeRate: '', // 综合服务费率
      showProductModal: false,
      modalContent: '',
      alertModal: false,
      alertTitle: '',
      alertContent: '',
      alertConfirm: '确定',
      alertType: 0,
      topUpSwitch: false, // 是否显示充值入口  true 为开启 flase为关闭
      firstClassCard: '', // 一类卡号
      secondClassCard: '', // 二类卡号
      secondClassCardBankName: '', // 二类卡开户行行名
      confirmModal: false,
      ybModal: false,
      rechargeModal: false,
      dialog: {
        dateStr: '',
        totalAmount: '',
        repayAcct: '',
        repayAcctBank: '',
        principal: '',
        interest: '',
        fee: '',
      },
      receitAccount: '',
    }
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state
    await this.setState({
      loanCode: params.loanCode || '',
    })
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      this.onRefresh()
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  async getProductInfo() {
    const res = await ajaxStore.order.getProductInfo({ productCode: this.state.loanInfo.productCode })
    if (res.data && res.data.code === '0') {
      // res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
      // const productInfo = res.data.data
      // const interestRate = productInfo.interestRate
      // let rateVoList = interestRate.rateVoList
      // let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

      // if (this.state.useRate) {
      //   rateVoList = this.state.useRate.rateVoList
      //   if (rateVoList && rateVoList.length > 0) {
      //     content += '信息系统服务费率：\n'
      //     for (var j = 0; j < rateVoList.length; j++) {
      //       if (this.state.useSource === '1' || this.state.useSource === '2') {
      //         content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
      //       } else { // 信用认证会员费率
      //         content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
      //       }
      //     }
      //   }
      // } else {
      //   if (rateVoList && rateVoList.length > 0) {
      //     content += '信息系统服务费率：\n'
      //     for (var i = 0; i < rateVoList.length; i++) {
      //       content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%\n`
      //     }
      //   }
      // }

      const content = await getProductDetail(this.state.loanInfo.productCode, this.props.ofsCompanyId)

      this.setState({
        modalContent: content,
        fundSource: res.data.data.fundSource,
        tabType: res.data.data.fundSource === '4' ? 3 : 1,
      })
      await this.getLoanDetailInfo(res.data.data.fundSource)
      await this.getHistoryList(res.data.data.fundSource)
    }
  }

  getLoanDetailInfo = async (fundSource) => {
    const res = await ajaxStore.loan.getLoanDetailInfo({
      loanCode: this.state.loanCode,
      fundSource,
      isFactory: '0',
    })
    if (res.data && res.data.code === '0') {
      this.setState({
        principalRemain: res.data.data.principalRemain,
        supplierName: res.data.data.supplierName,
        makeLoanAmount: res.data.data.makeLoanAmount,
        statusName: res.data.data.statusName,
      })
    }
    if (fundSource === '0') {
      this.getSyLoanBillInfo()
    }
  }

  // 查询回款账户
  async getSyLoanBillInfo() {
    // 还款计划，修改。上下游调同一个接口，isFactory用作区分 0 => 下游 1 => 上游
    global.showError = false
    const res = await ajaxStore.loan.getSyLoanBillInfo({
      loanId: this.state.loanCode,
      isFactory: 0,
    })
    global.showError = true
    if (res.data && res.data.code === '0') {
      this.setState({
        receitAccount: res.data.data,
      })
    }
  }

  // async getXyRepayDetail () {
  //   global.showError = false
  //   const res = await ajaxStore.loan.getXyRepayDetail({
  //     loanInfoId: this.state.loanCode
  //   })
  //   global.showError = true
  //   if (res.data && res.data.code === '0') {
  //     this.setState({
  //       repayInfo: res.data.data,
  //       statusText: res.data.data.statusName
  //     })
  //   }
  // }

  async getHistoryList(fundSource) {
    console.log('fundSource', fundSource)
    let res
    if (fundSource === '0') {
      res = await ajaxStore.loan.getRepaymentDetailList({
        loanInfoId: this.state.loanCode,
        type: 0,
      })
    } else {
      res = await ajaxStore.loan.getHistoryList({
        loanCode: this.state.loanCode,
      })
    }

    if (res.data && res.data.code === '0') {
      this.setState({ historyData: res.data.data })
    }
  }

  async getLoanBillInfo() {
    const res = await ajaxStore.loan.getLoanDetail({ loanCode: this.state.loanCode })
    if (res.data && res.data.code === '0') {
      await this.initData(res.data.data)
      if (this.state.fundSource === '4') {
        this.getAccountInfoByNanJing()
      } else {
        this.setState({ refreshing: false })
      }
    } else {
      this.setState({ refreshing: false })
    }
  }

  // 南京银行获取账户信息
  async getAccountInfoByNanJing() {
    const res = await ajaxStore.loan.getAccountInfoByNanJing()
    if (res.data && res.data.code === '0') {
      const BalanceStr = toAmountStr(res.data.data.Balance * 1, 2)
      this.setState({
        Balance: res.data.data.Balance,
        BalanceStr,
        accountInfo: res.data.data,
      })
      this.getLoanInfoByNanJing()
    } else {
      this.setState({ refreshing: false })
    }
  }

  async getLoanInfoByNanJing() {
    const res = await ajaxStore.loan.getLoanInfoByNanJing({ cpTxNo: this.state.loanCode, bank: '4' })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const loanInfoByNanJing = data
      const currentIssueAmountStr = data.currentIssueAmount && toAmountStr(data.currentIssueAmount * 1, 2, true)
      const totalAmountStr = data.totalAmount && toAmountStr(data.totalAmount * 1, 2, true)
      loanInfoByNanJing.currentIssueAmountInt = currentIssueAmountStr ? currentIssueAmountStr.split('.')[0] : ''
      loanInfoByNanJing.currentIssueAmountDec = currentIssueAmountStr ? currentIssueAmountStr.split('.')[1] : ''
      loanInfoByNanJing.totalAmountInt = totalAmountStr ? totalAmountStr.split('.')[0] : ''
      loanInfoByNanJing.totalAmountDec = totalAmountStr ? totalAmountStr.split('.')[1] : ''
      this.setState({
        loanInfoByNanJing,
        topUpSwitch: data.topUpSwitch,
        firstClassCard: data.firstClassCard,
        secondClassCard: data.secondClassCard,
        secondClassCardBankName: data.secondClassCardBankName,
      })
      this.getLoanListByNanJing()
    } else {
      this.setState({ refreshing: false })
    }
  }

  // 获取南京银行还款列表
  async getLoanListByNanJing() {
    const res = await ajaxStore.loan.getLoanListByNanJing({ cpTxNo: this.state.loanCode })
    if (res.data && res.data.code === '0') {
      let refundPlanVOListByNanJing = []
      refundPlanVOListByNanJing = res.data.data
      refundPlanVOListByNanJing.map(function (item, index) {
        const arr2 = toAmountStr(item.totalAmount * 1, 2, true).split('.')
        item.totalAmountInt = arr2[0]
        item.totalAmountDec = arr2[1]
        return item
      })

      this.setState({ refundPlanVOListByNanJing, refreshing: false })
    } else {
      this.setState({ refreshing: false })
    }
  }

  // 初始数据
  async initData(data) {
    const refundPlanVOList = data.refundPlanVOList
    const refundSummaryVO = data.refundSummaryVO
    const prepayShow = data.prepayShow
    const loanInfo = {
      orderName: data.orderName,
      projectName: data.projectName,
      productCode: data.productCode,
      productName: data.productName,
    }
    const arr = toAmountStr(refundSummaryVO.maxRepayAmount * 1, 2, true).split('.')
    const totalRepay = {
      int: arr[0],
      dec: arr[1],
    }
    refundPlanVOList.map(function (item, index) {
      const arr2 = toAmountStr(item.totalReceivable * 1, 2, true).split('.')
      item.int = arr2[0]
      item.dec = arr2[1]
      return item
    })

    // 会员费率
    let useRate = null
    let comprehensiveServiceFreeRate = ''
    if (data.useSource && data.useSource !== '0') {
      useRate = JSON.parse(data.useRate)
      comprehensiveServiceFreeRate = data.comprehensiveServiceFreeRate
    }

    await this.setState({
      refundPlanVOList,
      refundSummaryVO,
      loanInfo,
      totalRepay,
      prepayShow,
      useRate,
      useSource: data.useSource,
      comprehensiveServiceFreeRate,
    })
    await this.getProductInfo()
  }

  switchTab = (tabType) => {
    this.setState({ tabType })
  }

  onRefresh = async () => {
    this.setState({
      refreshing: true,
    })
    this.getLoanBillInfo()
  }

  showProductModal = () => {
    this.setState({ showProductModal: true })
  }

  tapToRepayment = (repayType) => {
    const loanCode = this.state.loanCode
    if (this.state.Balance < this.state.loanInfoByNanJing.currentIssueAmount) {
      this.setState({
        alertTitle: '账户余额不足',
        alertContent: '账户余额不足，请先对账户充值。',
        alertConfirm: '账户充值',
        alertType: 1,
        confirmModal: true,
      })
    } else if (repayType === '1') {
      this.setState({
        alertTitle: '还款提醒',
        alertContent:
          '请将本期应还金额足额充值到您的账户余额中，银行将于还款日晚间23点后进行代扣，还款结果请留意银行短信通知！',
        alertConfirm: '确定',
        alertType: 0,
        alertModal: true,
      })
    } else {
      this.props.navigation.navigate('LoanRepayment', { loanCode, repayType })
    }
  }

  tapToRecharge = () => {
    if (this.state.topUpSwitch) {
      const accountInfo = this.state.accountInfo
      this.props.navigation.navigate('RechargeByNanJing', {
        userName: accountInfo.UserName,
        idNo: accountInfo.IdNo,
        mobilePhone: accountInfo.MobilePhone,
      })
    } else {
      this.setState({
        rechargeModal: true,
      })
    }
  }

  tapToExtract = () => {
    const accountInfo = this.state.accountInfo
    this.props.navigation.navigate('ExtractByNanJing', {
      userName: accountInfo.UserName,
      idNo: accountInfo.IdNo,
      mobilePhone: accountInfo.MobilePhone,
      balance: accountInfo.Balance,
    })
  }

  tapReapyment = async () => {
    const loanInfoId = this.state.loanCode
    const res = await ajaxStore.loan.yiPrepayJudge(loanInfoId)
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const dialog = {
        dateStr: data.dateStr,
        totalAmount: toAmountStr(data.totalAmount * 1, 2, true),
        principal: toAmountStr(data.principal * 1, 2, true),
        interest: toAmountStr(data.interest * 1, 2, true),
        fee: toAmountStr(data.fee * 1, 2, true),
        repayAcct: data.repayAcct,
        repayAcctBank: data.repayAcctBank,
      }
      this.setState({
        dialog,
        repaymentData: data,
        ybModal: true,
      })
    }
  }

  submitReapyment = async () => {
    const loanInfoId = this.state.loanCode
    const res = await ajaxStore.loan.yiPrepay({
      loanInfoId,
      fee: this.state.repaymentData.fee,
      interest: this.state.repaymentData.interest,
      principal: this.state.repaymentData.principal,
      totalAmount: this.state.repaymentData.totalAmount,
    })
    if (res.data && res.data.code === '0') {
      const bankUrl = res.data.data
      // const backXcx = encodeURIComponent('/customerPages/pages/erji_loanList/erji_loanList')
      // const webUrl = encodeURIComponent(bankUrl + '&cpUrl=') + backXcx
      this.props.navigation.navigate('WebView', {
        url:
          bankUrl +
          '&cpUrl=' +
          encodeURIComponent('https://wx.zhuozhuwang.com/ofs_weixin/html/wxRedirectTo.html?qjdkdt://Loan'),
      })
    }
  }

  copyToClipBoard = (text) => {
    Clipboard.setString(text)
    showToast('复制成功')
  }

  renderAlertModal() {
    return (
      <AlertModal
        title={this.state.alertTitle}
        content={this.state.alertContent}
        comfirmText={this.state.alertConfirm}
        cancel={() => {
          this.setState({ alertModal: false })
        }}
        confirm={() => {
          this.setState({ alertModal: false })
        }}
        infoModal={this.state.alertModal}
      />
    )
  }

  renderConfirmModal() {
    return (
      <ComfirmModal
        title={this.state.alertTitle}
        content={this.state.alertContent}
        comfirmText={this.state.alertConfirm}
        cancelText={'取消'}
        cancel={() => {
          this.setState({ confirmModal: false })
        }}
        confirm={() => {
          this.setState({ confirmModal: false })
          if (this.state.alertType === 1) {
            this.tapToRecharge()
          }
        }}
        infoModal={this.state.confirmModal}
      />
    )
  }

  renderProductModal() {
    return (
      <AlertModal
        title={'产品要素'}
        content={this.state.modalContent}
        comfirmText={'确定'}
        cancel={() => {
          this.setState({ showProductModal: false })
        }}
        confirm={() => {
          this.setState({ showProductModal: false })
        }}
        infoModal={this.state.showProductModal}
      />
    )
  }

  renderRepaymentPlan() {
    return (
      <View style={styles.content}>
        {this.state.fundSource === '4'
          ? // 南京银行还款计划
            this.renderNJPlanList()
          : // 默认还款计划
            this.renderPlanList()}
      </View>
    )
  }

  goServer = () => {
    this.props.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${'客户'}`,
    })
  }

  renderNJPlanList() {
    const views = []
    const { refundPlanVOListByNanJing, repayStatusByNanJing } = this.state
    for (let i = 0; i < refundPlanVOListByNanJing.length; i++) {
      const item = refundPlanVOListByNanJing[i]
      const status = repayStatusByNanJing[item.status]
      views.push(
        <View key={i}>
          {item.status === 1 ? <View style={styles.mask} /> : null}
          <View style={styles.itemRow}>
            <Text style={styles[status.index]}>{item.status === 1 ? '本期' : i + 1 > 9 ? i + 1 : '0' + (i + 1)}</Text>
            <Iconfont name={status.icon} size={dp(40)} />
            <Text style={styles[status.date]}>{`还款日${item.repaymentDate}`}</Text>
            <Text style={styles[status.state]}>{status.text}</Text>
          </View>
          <View style={styles.itemRow1}>
            <View
              style={
                i < refundPlanVOListByNanJing.length - 1
                  ? styles[status.dashed]
                  : [styles[status.dashed], { borderColor: '#ffffffff' }]
              }
            />
            <View>
              <View style={styles.amountRow}>
                <Text style={styles[status.money]}>{`￥${item.totalAmountInt}.`}</Text>
                <Text style={styles[status.cent]}>{item.totalAmountDec}</Text>
              </View>
              <View style={{ marginLeft: dp(50) }}>
                <Text style={styles[status.desc]}>{`赊销货款：${
                  this.state.loanInfoByNanJing.status === 3 ? item.remainPrincipalString : item.principalExprectedString
                }`}</Text>
                <Text style={styles[status.desc]}>{`利息：${item.interestExprectedString}`}</Text>
                {item.status === 2 || item.status === 3 ? (
                  <Text style={styles[status.desc]}>{`罚息：${item.penaltyExpertedString}`}</Text>
                ) : null}
                {item.status === 2 || item.status === 3 ? (
                  <Text style={styles[status.desc]}>{`复利：${item.compInterExpertedString}`}</Text>
                ) : null}
                <Text style={styles[status.desc]}>{`服务费：${item.feeExpertedString}`}</Text>
              </View>
            </View>
          </View>
        </View>,
      )
    }
    return views
  }

  renderPlanList() {
    const views = []
    const { refundPlanVOList, repayStatus } = this.state
    for (let i = 0; i < refundPlanVOList.length; i++) {
      const item = refundPlanVOList[i]
      const status = repayStatus[item.status]
      views.push(
        <View key={i}>
          {item.status === 'INTERESTING' ? <View style={styles.mask} /> : null}
          <View style={styles.itemRow}>
            <Text style={styles[status.index]}>
              {item.status === 'INTERESTING' ? '本期' : i + 1 > 9 ? i + 1 : '0' + (i + 1)}
            </Text>
            <Iconfont name={status.icon} size={dp(40)} />
            <Text style={styles[status.date]}>{`还款日${item.repaymentDate}`}</Text>
            <Text style={styles[status.state]}>{status.text}</Text>
          </View>
          <View style={styles.itemRow1}>
            <View
              style={
                i < refundPlanVOList.length - 1
                  ? styles[status.dashed]
                  : [styles[status.dashed], { borderColor: '#ffffffff' }]
              }
            />
            <View style={styles.amountRow}>
              <Text style={styles[status.money]}>{`￥${item.int}.`}</Text>
              <Text style={styles[status.cent]}>{item.dec}</Text>
            </View>
          </View>
        </View>,
      )
    }

    // 宜宾银行提前还款  弹窗
    if (this.state.fundSource === '1' && this.state.prepayShow === 'show') {
      views.push(
        <View key={refundPlanVOList.length} style={{ alignItems: 'center', marginTop: dp(50), marginBottom: dp(40) }}>
          <SolidBtn style={{ width: DEVICE_WIDTH * 0.8 }} text={'提前结清'} onPress={this.tapReapyment} />
        </View>,
      )
    }
    return views
  }

  renderLoanHistory() {
    return (
      <View>
        {this.state.historyData.length > 0 ? (
          <View style={styles.itemContent}>
            <Text style={styles.title}>还款记录</Text>
            {this.renderHistoryItem()}
          </View>
        ) : (
          <Text style={styles.empty}>暂无数据</Text>
        )}
      </View>
    )
  }

  renderHistoryItem() {
    const views = []
    const { historyData, fundSource } = this.state
    for (let i = 0; i < historyData.length; i++) {
      const item = historyData[i]
      views.push(
        <View key={i}>
          <View style={styles.itemHeader}>
            <Text
              style={[styles.itemText2, { color: '#2D2926', marginBottom: 0, marginLeft: 0 }]}
            >{`还款金额：${item.totalRepay.toFixed(2)}`}</Text>
            <Text style={[styles.itemText2, { textAlign: 'right', marginBottom: 0, marginLeft: 0 }]}>
              {item.repayDate}
            </Text>
          </View>
          <Text style={styles.itemText2}>{`已还货款：${item.principal.toFixed(2)}`}</Text>
          <Text style={styles.itemText2}>{`已还信息系统服务费：${item.interest.toFixed(2)}`}</Text>
          {item.compositeFee ? (
            <Text style={styles.itemText2}>{`已还综合服务费：${item.compositeFee.toFixed(2)}`}</Text>
          ) : null}
          <Text style={styles.itemText2}>{`已付违约金：${(item.penalty + item.overdueFine).toFixed(2)}`}</Text>
          {fundSource !== '0' ? <Text style={styles.itemText2}>{`已还费用：${item.fees.toFixed(2)}`}</Text> : null}
        </View>,
      )
    }
    return views
  }

  renderLoanInfo(receitAccount) {
    const { receiptBank, receiptSubBank, receiptAccountNum, receiptAccountName } = receitAccount
    return (
      <View style={styles.itemContent}>
        <Text style={styles.title}>货款信息</Text>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'支付货款编号：'}</Text>
          <Text style={styles.itemText}>{this.state.loanCode || ''}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'支付货款金额：'}</Text>
          <Text style={styles.itemText}>{toAmountStr(this.state.makeLoanAmount, 2, true)}</Text>
        </View>
        {receiptBank ? (
          <View style={styles.infoRow}>
            <Text style={styles.itemText1}>{'回款银行名称：'}</Text>
            <Text style={styles.itemText}>{receiptBank}</Text>
          </View>
        ) : null}
        {receiptSubBank ? (
          <View style={styles.infoRow}>
            <Text style={styles.itemText1}>{'回款支行名称：'}</Text>
            <Text style={styles.itemText}>{receiptSubBank}</Text>
          </View>
        ) : null}
        {receiptAccountName ? (
          <View style={styles.infoRow}>
            <Text style={styles.itemText1}>{'回款户名：'}</Text>
            <Text style={styles.itemText}>{receiptAccountName}</Text>
          </View>
        ) : null}
        {receiptAccountNum ? (
          <View style={styles.infoRow}>
            <Text style={styles.itemText1}>{'回款账号：'}</Text>
            <Text style={styles.itemText}>{receiptAccountNum}</Text>
          </View>
        ) : null}
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'货款状态：'}</Text>
          <Text style={styles.itemText}>{this.state.statusName || ''}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'项目名称：'}</Text>
          <Text style={styles.itemText}>{this.state.loanInfo.projectName || ''}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'厂家名称：'}</Text>
          <Text style={styles.itemText}>{this.state.supplierName || ''}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'产品：'}</Text>
          <Text onPress={this.showProductModal} style={[styles.itemText, { color: '#0092d5' }]}>
            {this.state.loanInfo.productName || ''}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'应付剩余货款：'}</Text>
          <Text style={styles.itemText}>{toAmountStr(this.state.principalRemain, 2, true)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'计费方式：'}</Text>
          <Text style={styles.itemText}>{'按月付费，到期还款'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.itemText1}>{'起止时间：'}</Text>
          <Text style={styles.itemText}>
            {this.state.refundSummaryVO.loanInfoStartDate
              ? `${this.state.refundSummaryVO.loanInfoStartDate} 至 ${this.state.refundSummaryVO.loanInfoEndDate}`
              : ''}
          </Text>
        </View>
      </View>
    )
  }

  renderLoanNanjing() {
    if (this.state.loanInfoByNanJing.status === 1) {
      return (
        <View>
          <View style={styles.njContainer}>
            <Text style={styles.njTitle}>本期应还</Text>
            <Text style={styles.njAmount}>
              {`￥${this.state.loanInfoByNanJing.currentIssueAmountInt || '0'}`}.
              <Text style={styles.njFen}>{this.state.loanInfoByNanJing.currentIssueAmountDec || '00'}</Text>
            </Text>
            <View style={styles.njRow}>
              <View style={styles.njItem}>
                <Text style={styles.njText}>当前期数</Text>
                <Text
                  style={styles.njText}
                >{`第${this.state.loanInfoByNanJing.currentIssue}期/共${this.state.loanInfoByNanJing.totalIssue}期`}</Text>
              </View>
              <View style={styles.separate} />
              <View style={styles.njItem}>
                <Text style={styles.njText}>本期到期日</Text>
                <Text style={styles.njText}>{this.state.loanInfoByNanJing.expiringDate}</Text>
              </View>
            </View>
            <SolidBtn
              style={styles.solidbtn}
              text={'本期还款'}
              onPress={() => {
                this.tapToRepayment(1)
              }}
            />
            <Text
              style={styles.njAdvance}
              onPress={() => {
                this.tapToRepayment(3)
              }}
            >
              提前结清
            </Text>
          </View>
          {this.renderBalance()}
        </View>
      )
    } else if (this.state.loanInfoByNanJing.status === 2 || this.state.loanInfoByNanJing.status === 3) {
      return (
        <View>
          <View style={[styles.njContainer, { backgroundColor: '#fbefef' }]}>
            <Text style={[styles.njTitle, { color: '#F16051' }]}>逾期应还</Text>
            <Text style={[styles.njAmount, { color: '#F16051' }]}>
              {`￥${this.state.loanInfoByNanJing.currentIssueAmountInt || '0'}`}.
              <Text style={[styles.njFen, { color: '#F16051' }]}>
                {this.state.loanInfoByNanJing.currentIssueAmountDec || '00'}
              </Text>
            </Text>
            <View style={styles.njRow}>
              <View style={styles.njItem}>
                <Text style={styles.njText}>逾期期数</Text>
                <Text
                  style={styles.njText}
                >{`第${this.state.loanInfoByNanJing.overdueIssue}期/共${this.state.loanInfoByNanJing.totalIssue}期`}</Text>
              </View>
              <View style={styles.separate} />
              <View style={styles.njItem}>
                <Text style={styles.njText}>已逾期</Text>
                <Text style={styles.njText}>{`${this.state.loanInfoByNanJing.overdueDays}天`}</Text>
              </View>
            </View>
            <SolidBtn
              style={styles.solidRedbtn}
              text={'逾期还款'}
              onPress={() => {
                this.tapToRepayment(2)
              }}
            />
          </View>
          {this.renderBalance()}
        </View>
      )
    } else if (this.state.loanInfoByNanJing.status === 4) {
      return (
        <View>
          <View style={styles.njContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignitems: 'center',
                marginTop: dp(40),
                marginBottom: dp(25),
              }}
            >
              <Text style={styles.njTitle1}>本期已还清</Text>
              <Iconfont name={'icon-signed'} size={20} />
            </View>
            <Text style={[styles.njAmount, { textDecorationLine: 'line-through' }]}>
              {`￥${this.state.loanInfoByNanJing.currentIssueAmountInt || '0'}.`}
              <Text style={styles.njFen}>{this.state.loanInfoByNanJing.currentIssueAmountDec || '00'}</Text>
            </Text>
            <View style={styles.njRow}>
              <View style={styles.njItem}>
                <Text style={styles.njText}>当前期数</Text>
                <Text
                  style={styles.njText}
                >{`第${this.state.loanInfoByNanJing.currentIssue}期/共${this.state.loanInfoByNanJing.totalIssue}期`}</Text>
              </View>
              <View style={styles.separate} />
              <View style={styles.njItem}>
                <Text style={styles.njText}>本期到期日</Text>
                <Text style={styles.njText}>{this.state.loanInfoByNanJing.expiringDate}</Text>
              </View>
            </View>
            <Text
              style={styles.njAdvance}
              onPress={() => {
                this.tapToRepayment(3)
              }}
            >
              提前结清
            </Text>
          </View>
          {this.renderBalance()}
        </View>
      )
    } else if (this.state.loanInfoByNanJing.status === 5) {
      return (
        <View>
          <View style={styles.njContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignitems: 'center',
                marginTop: dp(40),
                marginBottom: dp(25),
              }}
            >
              <Text style={styles.njTitle1}>货款已结清</Text>
              <Iconfont name={'icon-signed'} size={20} />
            </View>
            <Text style={[styles.njAmount, { textDecorationLine: 'line-through' }]}>
              {`￥${this.state.loanInfoByNanJing.totalAmountInt || '0'}.`}
              <Text style={styles.njFen}>{this.state.loanInfoByNanJing.totalAmountDec || '00'}</Text>
            </Text>
            <View style={styles.njRow}>
              <View style={styles.njItem}>
                <Text style={styles.njText}>借款日期</Text>
                <Text style={styles.njText}>{this.state.loanInfoByNanJing.startDate}</Text>
              </View>
              <View style={styles.separate} />
              <View style={styles.njItem}>
                <Text style={styles.njText}>结清日期</Text>
                <Text style={styles.njText}>{this.state.loanInfoByNanJing.endDate}</Text>
              </View>
            </View>
          </View>
          {this.renderBalance()}
        </View>
      )
    }
  }

  renderBalance() {
    return (
      <View style={styles.njContainer}>
        <Text style={styles.njTitle}>账户余额</Text>
        <Text style={styles.njFen}>{`${this.state.BalanceStr || '0.00'}`}</Text>
        <View style={styles.njRow}>
          <StrokeBtn
            style={styles.strokebtn}
            text={'账户充值'}
            onPress={() => {
              this.tapToRecharge()
            }}
          />
          <StrokeBtn
            style={styles.strokebtn}
            text={'提现'}
            onPress={() => {
              this.tapToExtract()
            }}
          />
        </View>
      </View>
    )
  }

  renderYBModal() {
    return (
      <Modal
        onTouchOutside={() => {
          this.setState({ ybModal: false })
        }}
        width={0.8}
        visible={this.state.ybModal}
        onSwipeOut={() => this.setState({ ybModal: false })}
        modalAnimation={
          new ScaleAnimation({
            initialValue: 0.4, // optional
            useNativeDriver: true, // optional
          })
        }
        onHardwareBackPress={() => {
          this.setState({ ybModal: false })
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text="取消"
              onPress={() => {
                this.setState({ ybModal: false })
              }}
              key="button-1"
              textStyle={{ color: Color.TEXT_MAIN, fontWeight: 'bold' }}
            />
            <ModalButton
              text="前往还款"
              onPress={() => {
                this.setState({ ybModal: false })
                this.submitReapyment()
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={styles.dialogTitle}>是否提前结清</Text>
          <Text style={styles.dialogContent}>
            {`截止${this.state.dialog.dateStr}，您的应还总金额为：`}
            <Text style={{ color: '#ff6666' }}>{`￥${this.state.dialog.totalAmount}`}</Text>
            {`，确保您宜宾银行${this.state.dialog.repayAcct}（开户行：${this.state.dialog.repayAcctBank}）账户的余额充足！`}
          </Text>
          <Text style={[styles.dialogContent, { marginTop: dp(30) }]}>还款明细：</Text>
          <Text style={styles.dialogContent}>{`赊销货款：${this.state.dialog.principal}元`}</Text>
          <Text style={styles.dialogContent}>{`利息：${this.state.dialog.interest}元`}</Text>
          <Text style={styles.dialogContent}>{`服务费：${this.state.dialog.fee}元`}</Text>
        </ModalContent>
      </Modal>
    )
  }

  renderRechargeModal() {
    return (
      <Modal
        onTouchOutside={() => {
          this.setState({ rechargeModal: false })
        }}
        width={0.8}
        visible={this.state.rechargeModal}
        onSwipeOut={() => this.setState({ rechargeModal: false })}
        modalAnimation={
          new ScaleAnimation({
            initialValue: 0.4, // optional
            useNativeDriver: true, // optional
          })
        }
        onHardwareBackPress={() => {
          this.setState({ ybModal: false })
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text="关闭"
              onPress={() => {
                this.setState({ rechargeModal: false })
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={styles.dialogTitle}>账户充值</Text>
          <Text style={styles.hint}>请使用您的一类卡网银或通过银行柜面方式，向您的二类电子账户转账</Text>
          <Text style={styles.text}>{`一类绑定卡：${this.state.firstClassCard}`}</Text>
          <View style={styles.modalRow}>
            <Text style={styles.text}>{`二类电子账户：${this.state.secondClassCard}`}</Text>
            <Text style={styles.copy} onPress={() => this.copyToClipBoard(this.state.secondClassCard)}>
              复制
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.text}>{`二类户开户行：${this.state.secondClassCardBankName}`}</Text>
            <Text style={styles.copy} onPress={() => this.copyToClipBoard(this.state.secondClassCardBankName)}>
              复制
            </Text>
          </View>
        </ModalContent>
      </Modal>
    )
  }

  render() {
    const { navigation } = this.props
    const { receitAccount } = this.state
    return (
      <View style={styles.container}>
        <NavBar
          title={'货款详情'}
          navigation={navigation}
          rightIcon={'navibar_kefu'}
          rightIconSize={dp(60)}
          onRightPress={this.goServer}
          stateBarStyle={{ backgroundColor: '#F7F7F9' }}
          navBarStyle={{ backgroundColor: '#F7F7F9' }}
        />
        <View style={styles.tab}>
          {this.state.fundSource === '4' ? (
            <Text
              style={this.state.tabType === 3 ? styles.tabSelectText : styles.tabText}
              onPress={() => this.switchTab(3)}
            >
              借款信息
            </Text>
          ) : null}
          <Text
            style={this.state.tabType === 1 ? styles.tabSelectText : styles.tabText}
            onPress={() => this.switchTab(1)}
          >
            还款计划表
          </Text>
          <Text
            style={this.state.tabType === 2 ? styles.tabSelectText : styles.tabText}
            onPress={() => this.switchTab(2)}
          >
            货款信息
          </Text>
          <Text
            style={this.state.tabType === 4 ? styles.tabSelectText : styles.tabText}
            onPress={() => this.switchTab(4)}
          >
            还款记录
          </Text>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl colors={[Color.THEME]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
          }
        >
          {/* 借款信息 */}
          {this.state.tabType === 3 ? this.renderLoanNanjing() : null}
          {/* 还款计划表 */}
          {this.state.tabType === 1 ? this.renderRepaymentPlan() : null}
          {/* 货款信息 */}
          {this.state.tabType === 2 ? this.renderLoanInfo(receitAccount) : null}
          {/* 还款记录 */}
          {this.state.tabType === 4 ? this.renderLoanHistory() : null}
        </ScrollView>
        {this.renderProductModal()}
        {this.renderConfirmModal()}
        {this.renderAlertModal()}
        {this.renderYBModal()}
        {this.renderRechargeModal()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    ofsCompanyId: state.user.userInfo.ofsCompanyId,
  }
}

export default connect(mapStateToProps)(LoanDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: dp(20),
  },
  tabText: {
    fontSize: dp(28),
    textAlign: 'center',
    color: '#91969A',
    paddingVertical: dp(20),
    paddingHorizontal: dp(30),
  },
  tabSelectText: {
    fontSize: dp(28),
    textAlign: 'center',
    color: '#353535',
    fontWeight: 'bold',
    paddingVertical: dp(20),
    paddingHorizontal: dp(32),
    backgroundColor: 'white',
    borderRadius: dp(36),
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: dp(30),
    marginBottom: dp(20),
  },
  itemRow1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  amountRow: {
    flexDirection: 'row',
    marginLeft: dp(50),
    alignItems: 'flex-end',
    marginTop: dp(20),
  },
  index: {
    width: dp(90),
    textAlign: 'right',
    fontSize: dp(28),
    color: '#5f5f87',
    marginRight: dp(20),
  },
  index1: {
    width: dp(90),
    textAlign: 'right',
    fontSize: dp(28),
    color: '#f16051',
    marginRight: dp(20),
  },
  index2: {
    width: dp(90),
    textAlign: 'right',
    fontSize: dp(28),
    color: '#cccccc',
    marginRight: dp(20),
  },
  date: {
    fontSize: dp(27),
    color: '#333333',
    marginHorizontal: dp(30),
  },
  date1: {
    fontSize: dp(27),
    color: '#f16051',
    marginHorizontal: dp(30),
  },
  date2: {
    fontSize: dp(27),
    color: '#cccccc',
    marginHorizontal: dp(30),
  },
  state: {
    fontSize: dp(25),
    color: 'white',
    backgroundColor: '#5f5f87',
    paddingHorizontal: dp(4),
    paddingVertical: dp(2),
    borderRadius: dp(4),
  },
  state1: {
    fontSize: dp(24),
    color: 'white',
    backgroundColor: '#f16051',
    paddingHorizontal: dp(4),
    paddingVertical: dp(2),
    borderRadius: dp(4),
  },
  state2: {
    fontSize: dp(24),
    color: 'white',
    backgroundColor: '#cccccc',
    paddingHorizontal: dp(4),
    paddingVertical: dp(2),
    borderRadius: dp(4),
  },
  dashed: {
    marginLeft: dp(127),
    borderColor: '#cccccc',
    borderRadius: 0.1,
    width: 0,
    height: dp(90),
    borderWidth: 0.5,
    borderStyle: 'dashed',
  },
  dashed1: {
    marginLeft: dp(127),
    borderColor: '#cccccc',
    borderRadius: 0.1,
    width: 0,
    height: dp(130),
    borderWidth: 0.5,
    borderStyle: 'dashed',
  },
  dashed2: {
    marginLeft: dp(127),
    borderColor: '#cccccc',
    borderRadius: 0.1,
    width: 0,
    height: dp(180),
    borderWidth: 0.5,
    borderStyle: 'dashed',
  },
  dashed3: {
    marginLeft: dp(127),
    borderColor: '#cccccc',
    borderRadius: 0.1,
    width: 0,
    height: dp(260),
    borderWidth: 0.5,
    borderStyle: 'dashed',
  },
  money: {
    fontSize: dp(32),
    fontWeight: 'bold',
    color: '#333333',
  },
  money1: {
    fontSize: dp(32),
    fontWeight: 'bold',
    color: '#f16051',
  },
  money2: {
    fontSize: dp(50),
    fontWeight: 'bold',
    color: '#333333',
    padding: 0,
  },
  money3: {
    fontSize: dp(32),
    fontWeight: 'bold',
    color: '#cccccc',
  },
  cent: {
    fontSize: dp(24),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: dp(1),
  },
  cent1: {
    fontSize: dp(24),
    fontWeight: 'bold',
    color: '#f16051',
    marginBottom: dp(1),
  },
  cent2: {
    fontSize: dp(32),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: dp(4),
  },
  cent3: {
    fontSize: dp(24),
    fontWeight: 'bold',
    color: '#cccccc',
    marginBottom: dp(1),
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(239, 239, 244, 0.50)',
    borderRadius: dp(8),
    left: dp(160),
    right: dp(30),
    top: dp(10),
    bottom: dp(20),
  },
  itemContent: {
    padding: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    elevation: 1,
    marginVertical: dp(10),
  },
  title: {
    fontSize: dp(33),
    fontWeight: 'bold',
    marginBottom: dp(20),
  },
  infoRow: {
    flexDirection: 'row',
  },
  itemText: {
    fontSize: dp(27),
    color: '#888888',
    flex: 1,
    marginTop: dp(15),
  },
  itemText1: {
    fontSize: dp(27),
    color: '#888888',
    marginTop: dp(15),
    width: dp(200),
  },
  itemText2: {
    fontSize: dp(28),
    color: '#91969A',
    marginLeft: dp(20),
    marginBottom: dp(8),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EAEAF1',
    borderRadius: dp(8),
    paddingHorizontal: dp(20),
    paddingVertical: dp(20),
    marginTop: dp(36),
    marginBottom: dp(28),
  },
  njContainer: {
    margin: dp(30),
    marginBottom: 0,
    backgroundColor: 'rgba(239,239,244,0.50)',
    borderRadius: dp(10),
    alignItems: 'center',
  },
  njTitle: {
    fontSize: dp(32),
    color: '#333333',
    marginTop: dp(40),
    marginBottom: dp(25),
  },
  njTitle1: {
    fontSize: dp(32),
    color: '#333333',
    marginLeft: dp(40),
    marginRight: dp(15),
  },
  njAmount: {
    fontSize: dp(55),
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: dp(30),
  },
  njFen: {
    fontSize: dp(40),
    color: '#333333',
    fontWeight: 'bold',
  },
  njRow: {
    flexDirection: 'row',
  },
  njItem: {
    alignItems: 'center',
    flex: 1,
    padding: dp(20),
  },
  njText: {
    fontSize: dp(30),
    color: '#333333',
    marginBottom: dp(15),
  },
  separate: {
    width: dp(1),
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginVertical: dp(50),
  },
  solidbtn: {
    width: dp(630),
    marginTop: dp(20),
  },
  solidRedbtn: {
    width: dp(630),
    marginTop: dp(20),
    backgroundColor: '#c95d5a',
    marginBottom: dp(30),
  },
  njAdvance: {
    color: '#2EA2DB',
    padding: dp(30),
    marginBottom: dp(30),
  },
  strokebtn: {
    flex: 1,
    marginHorizontal: dp(20),
    marginBottom: dp(40),
    marginTop: dp(50),
    paddingVertical: dp(20),
  },
  desc: {
    fontSize: dp(23),
    color: '#333333',
    marginTop: dp(13),
  },
  desc1: {
    fontSize: dp(23),
    color: '#999999',
    marginTop: dp(13),
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: dp(35),
    marginBottom: dp(20),
  },
  dialogContent: {
    fontSize: dp(28),
    color: '#999999',
    marginTop: dp(10),
  },
  text: {
    fontSize: dp(30),
    marginRight: dp(10),
  },
  copy: {
    fontSize: dp(30),
    color: '#2EA2DB',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dp(18),
    flexWrap: 'wrap',
  },
  hint: {
    marginBottom: dp(18),
    color: '#888888',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    elevation: 1,
    marginVertical: dp(10),
  },
  empty: {
    flex: 1,
    textAlign: 'center',
    marginVertical: dp(400),
    color: '#777777',
  },
})
