import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, Platform, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Banner from '../../component/Banner'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import BottomFullModal from '../../component/BottomFullModal'
import { customerServiceUrl } from '../../utils/config'
import ajaxStore from '../../utils/ajaxStore'
import { addNum, toAmountStr, showToast } from '../../utils/Utility'
import { formatDate, createDateData } from '../../utils/DateUtils'
import ComfirmModal from '../../component/ComfirmModal'
import CheckBox from 'react-native-check-box'
import { onEvent } from '../../utils/AnalyticsUtil'

/**
 * 批量还款
 */
export default class BatchPay extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      excessAvailableBalance: 0, // 超出可用余额
      todayClearSum: 0, // 已选今日结清应还合计
      balanceAvailable: 0, // 可用账户余额
      payChecked: false
    }
  }

  componentDidMount () {
    this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.loan.getXyRepayLoans({ pageNo })
    if (res && res.data && res.data.code === '0') {
      res.data.data.resultPage.pagedRecords.forEach(e => {
        e.checked = false
      })
      this.setState({ balanceAvailable: res.data.data.balanceAvailable })
      return res.data.data.resultPage.pagedRecords
    } else {
      return null
    }
  }

  onPress = async (item) => {
    const { checked, repayFlow, autoFreeze } = item.item

    const isInvalid = repayFlow || autoFreeze
    const msg = autoFreeze ? '该放款在亚士还款预冻结中，若需提前还款请通知客服经理' : '该放款正处于流程中，无需重复操作'

    if (!isInvalid) {
      const data = item.item
      data.checked = !checked
      await this.listView.changeItemData(item.index, data)
      this.calcSum()
    } else {
      global.alert.show({
        content: msg
      })
    }
  }

  calcSum = () => {
    let sum = 0
    this.listView.getData().forEach(e => {
      if (e.checked) {
        sum = addNum(e.totalSettleReceivable, sum)
      }
    })

    const excess = addNum(sum, -this.state.balanceAvailable)
    this.setState({
      todayClearSum: sum,
      excessAvailableBalance: excess > 0 ? excess : 0
    })
  }

  confirm = () => {
    const { payChecked } = this.state
    if (!payChecked) {
      showToast('请勾选"使用银存支付"')
      return
    }
    global.confirm.show({
      title: '是否确认还款',
      content: '批量结清暂不支持使用优惠卷，是否确认还款？',
      confirmText: '确认',
      confirm: () => { this.pay() }
    })
  }

  pay = async () => {
    const params = {
      loanInfoIdList: [],
      balanceAvailable: this.state.balanceAvailable
    }
    this.listView.getData().forEach(e => {
      if (e.checked) {
        params.loanInfoIdList.push(e.loanInfoId)
      }
    })
    const res = await ajaxStore.loan.batchRepay(params)
    if (res && res.data && res.data.code === '0') {
      const data = res.data.data
      if (res.data.message === '可用账户余额不足') {
        global.alert.show({
          title: '可用账户余额不足',
          content: '您的可用账户余额不足，点击「确定」重新选择'
        })
      } else if (data.processLoanInfos.length > 0 || data.freezeLoanInfos.length > 0 || data.amountLoanInfos.length > 0) {
        let msg = '支付编号为\n'

        if (data.processLoanInfos.length > 0) {
          msg = msg + data.processLoanInfos.join(',') + '尚处于财务还款流程中，'
        }
        if (data.freezeLoanInfos.length > 0) {
          msg = msg + data.freezeLoanInfos.join(',') + '处于亚士还款预冻结，您无需重复提交；'
        }
        if (data.amountLoanInfos.length > 0) {
          msg = msg + data.amountLoanInfos.join(',') + '因账户可用余额不足，需入账后再次提交；'
        }
        global.alert.show({
          title: '提示',
          content: msg
        })
      } else if (data.processLoanInfos.length === 0 && data.freezeLoanInfos.length === 0 && data.amountLoanInfos.length === 0) {
        onEvent('批量还款', 'BatchPay', '/ofs/front/repayment/batchRepay', params)
        global.alert.show({
          title: '还款成功',
          content: '批量结清已操作成功'
        })
        this.reset()
      }
    }
  }

  reset = () => {
    this.setState({
      excessAvailableBalance: 0, // 超出可用余额
      todayClearSum: 0, // 已选今日结清应还合计
      balanceAvailable: 0, // 可用账户余额
      payChecked: false
    })
    this.listView.refreshToTop()
  }

  renderItem = (item) => {
    const {
      checked, finalRepaymentDay, totalSettleReceivable, remainPrincipal,
      compositeFeeReceivable, interestSubReceivable, penaltyReceivable, repaymentDate,
      repayFlow, autoFreeze
    } = item.item

    const isInvalid = repayFlow || autoFreeze

    return (
      <Touchable isPreventDouble={false} onPress={() => this.onPress(item)} >
        <View style={item.index ? styles.item : styles.itemRadiu} >
          <View style={styles.itemHeader}>
            <Iconfont name={isInvalid ? 'jinggao' : checked ? 'liuchengyindao-yiwancheng' : 'select_weixuanzhong'} size={dp(35)} />
            <Text style={styles.date}>{finalRepaymentDay}</Text>
            <Text style={styles.amount}>{toAmountStr(totalSettleReceivable, 2, true)}</Text>
          </View>
          <View style={styles.itemContent}>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>剩余货款</Text>
              <Text style={styles.itemText}>{toAmountStr(remainPrincipal, 2, true)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>综合服务费</Text>
              <Text style={styles.itemText}>{toAmountStr(compositeFeeReceivable, 2, true)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>信息系统服务费</Text>
              <Text style={styles.itemText}>{toAmountStr(interestSubReceivable, 2, true)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>违约金</Text>
              <Text style={penaltyReceivable ? [styles.itemText, { color: '#F55849' }] : styles.itemText}>{toAmountStr(penaltyReceivable, 2, true)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>付款日</Text>
              <Text style={styles.itemText}>{repaymentDate}</Text>
            </View>
          </View>
        </View>
      </Touchable>
    )
  }

renderFooter=() => {
  const { excessAvailableBalance, todayClearSum, balanceAvailable } = this.state
  return (
    <View style={styles.bottom}>
      {this.state.excessAvailableBalance > 0
        ? <View style={styles.itemRow}>
          <Text style={[styles.itemText, { color: '#F55849' }]}>超出账户可用余额</Text>
          <Text style={[styles.itemText, { color: '#F55849' }]}>{toAmountStr(excessAvailableBalance, 2, true)}</Text>
        </View>
        : null
      }

      <View style={styles.itemRow}>
        <Text style={styles.itemText}>已选结清合计</Text>
        <Text style={styles.itemText}>{toAmountStr(todayClearSum, 2, true)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>账户可用余额</Text>
        <Text style={styles.itemText}>{toAmountStr(balanceAvailable, 2, true)}</Text>
      </View>

      {excessAvailableBalance <= 0 && todayClearSum > 0
        ? <View>
          <View style={styles.separate} />
          <View style={styles.bottomFooter}>
            <CheckBox
              style={{ flexDirection: 'row', flex: 1 }}
              onClick={() => {
                this.setState({
                  payChecked: !this.state.payChecked
                })
              }}
              isChecked={this.state.payChecked}
              checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
              unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
              rightText={'使用银存支付'}
              rightTextStyle={{ color: Color.TEXT_MAIN }}
            />
            <Touchable onPress={this.confirm}>
              <Text style={styles.btn}>批量结清</Text>
            </Touchable>
          </View>
        </View>
        : null
      }
    </View>
  )
}

render () {
  const { navigation } = this.props

  return (
    <View style={styles.container}>
      <NavBar
        title={'批量结清'}
        navigation={navigation}
        elevation={0.5}
      />
      <ListPageComponent
        ref={ref => { this.listView = ref }}
        navigation={this.props.navigation}
        loadData={this.loadData}
        renderItem={this.renderItem}
        isAutoRefresh={false}
        renderSeparator={null}
      />
      {this.renderFooter()}
    </View>
  )
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(3),
    padding: dp(30)
  },
  itemRadiu: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(3),
    padding: dp(30),
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16)
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(30)
  },
  date: {
    color: Color.TEXT_MAIN,
    fontSize: dp(28),
    marginLeft: dp(30)
  },
  amount: {
    color: Color.TEXT_MAIN,
    fontSize: dp(36),
    marginRight: dp(30),
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  itemContent: {
    backgroundColor: '#F8F8FA',
    borderRadius: dp(16),
    paddingHorizontal: dp(30),
    paddingTop: dp(18)
  },
  itemText: {
    color: Color.TEXT_MAIN,
    fontSize: dp(28)
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(18)
  },
  bottom: {
    backgroundColor: 'white',
    paddingHorizontal: dp(90),
    paddingTop: dp(28),
    paddingBottom: dp(80),
    elevation: 20,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  separate: {
    backgroundColor: '#E7EBF2',
    height: dp(1),
    marginTop: dp(10)
  },
  bottomFooter: {
    alignItems: 'center',
    marginTop: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  btn: {
    backgroundColor: Color.THEME,
    color: 'white',
    textAlignVertical: 'center',
    textAlign: 'center',
    width: dp(192),
    borderRadius: dp(38),
    overflow: 'hidden',
    fontSize: dp(28),
    ...Platform.select({
      ios: { paddingVertical: dp(22) },
      android: { height: dp(72) }
    })
  }

})
