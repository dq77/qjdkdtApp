import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, StatusBar
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import { getRealDP as dp } from '../../utils/screenUtil'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import { toAmountStr } from '../../utils/Utility'

/**
 * 支付货款
 */
class CreditSaleDecInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      creditLine: '',
      usedLine: '',
      freezeLine: '',
      replyDeadline: '',
      orderAllList: {},
      isJumpOrderDetail: false,
      isJumpLoanDetail: false
    }
  }

  componentDidMount () {
    StatusBar.setBarStyle('default', true)
    const { navigation } = this.props
    const { selectNum } = navigation.state.params
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        selectNum === '2' && this.detailProjectDetail()
        this.orderDetail()
        this.loanDetail()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  async detailProjectDetail () {
    const { navigation } = this.props
    const { id } = navigation.state.params
    const data = {
      id: id
    }
    const res = await ajaxStore.credit.detailProjectDetail(data)
    if (res && res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        creditLine: data.creditLine,
        usedLine: data.usedLine,
        freezeLine: data.freezeLine,
        replyDeadline: data.deadTime
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async orderDetail () {
    const { navigation } = this.props
    const { orderNumber } = navigation.state.params
    const data = {
      orderCode: orderNumber || null
    }
    const res = await ajaxStore.loan.findOrderByCode(data)
    if (res && res.data && res.data.code === '0') {
      const list = res.data.data
      if (list) {
        this.setState({
          orderAllList: list,
          isJumpOrderDetail: true
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async loanDetail () {
    const { navigation } = this.props
    const { orderNumber, name } = navigation.state.params
    const data = {
      pageNo: 1,
      pageSize: 100,
      keyword: orderNumber || ''
    }
    const res = await ajaxStore.loan.loadLoanList(data)
    if (res && res.data && res.data.code === '0') {
      const { pagedRecords } = res.data.data
      const list = pagedRecords.filter((item) => {
        return item.status === '3' && item.repaymentShow === 1 && item.typeStatus !== '5' && name === item.makeLoanCode
      })
      if (list.length > 0) {
        this.setState({
          isJumpLoanDetail: true
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  clickOrderDetail () {
    const pagedRecords = this.state.orderAllList
    const pram = {}
    if (pagedRecords.typeStatus === '4') {
      pram.orderId = pagedRecords.orderId
      pram.orderCode = pagedRecords.orderCode
      pram.type = 'FXB'
    } else {
      pram.orderId = pagedRecords.orderId
      pram.orderCode = pagedRecords.orderCode
      pram.projectId = pagedRecords.projectId
      pram.totalCost = pagedRecords.totalAmount
    }
    this.props.navigation.navigate('OrderDetail', pram)
  }

  clickLoanDetail () {
    const { navigation } = this.props
    const { name } = navigation.state.params
    this.props.navigation.navigate('LoanDetail', { loanCode: name })
  }

  render () {
    const { navigation } = this.props
    const { titleType, selectNum, dev1Value, dev2Value, dev3Value, dev4Value, orderNumber, name } = navigation.state.params
    const title1 = selectNum === '1' ? '交易日期' : selectNum === '2' ? '临时金额' : '交易日期'
    const title2 = selectNum === '1' ? '交易类型' : selectNum === '2' ? '已使用' : '交易类型'
    const title3 = selectNum === '1' ? '交易额度' : selectNum === '2' ? '已冻结' : '交易额度'
    const title4 = selectNum === '1' ? '可用额度' : selectNum === '2' ? '到期日期' : '额度使用类目'
    const title1Value = selectNum === '2' ? toAmountStr(this.state.creditLine, 2, true) : dev1Value
    const title2Value = selectNum === '2' ? toAmountStr(this.state.usedLine, 2, true) : dev2Value
    const title3Value = selectNum === '2' ? toAmountStr(this.state.freezeLine, 2, true) : toAmountStr(dev3Value, 2, true)
    const title4Value = selectNum === '2' ? this.state.replyDeadline : selectNum === '3' ? dev4Value : toAmountStr(dev4Value, 2, true)
    const relatedDetail = selectNum === '2' ? '项目名称' : '关联订单编号'

    return (
      <View style={styles.container}>
        <NavBar title={titleType}
          navigation={navigation}
          elevation={0.5}
          stateBarStyle={styles.navBarBG}
          navBarStyle={styles.navBarBG}
        />
        <Text style={styles.userText}>使用详情</Text>
        <View style={styles.userBG}>
          <View style={styles.userBox1BG}>
            <Text style={styles.userDecText}>{title1}</Text>
            <Text style={styles.userDecText}>{title1Value}</Text>
          </View>
          <View style={styles.userBox2BG}>
            <Text style={styles.userDecText}>{title2}</Text>
            <Text style={styles.userDecText}>{title2Value}</Text>
          </View>
          <View style={styles.userBox2BG}>
            <Text style={styles.userDecText}>{title3}</Text>
            <Text style={styles.userDecText}>{title3Value}</Text>
          </View>
          <View style={styles.userBox2BG}>
            <Text style={styles.userDecText}>{title4}</Text>
            <Text style={styles.userDecVText}>{title4Value}</Text>
          </View>
        </View>
        <Text style={styles.userText}>关联详情</Text>
        <View style={styles.userBG}>
          <Text style={styles.userDecText}>{relatedDetail}</Text>
          {selectNum === '2' || (selectNum !== '2' && !this.state.isJumpOrderDetail) ? <Text style={styles.noSelectText}>{orderNumber}</Text> : <Touchable onPress={() => {
            this.clickOrderDetail()
          }} >
            <Text style={styles.orderNumText}>{orderNumber}</Text>
          </Touchable> }
          {selectNum !== '2' && <Text style={styles.orderNumTitleText}>关联货款编号</Text>}
          {selectNum !== '2' && (!this.state.isJumpLoanDetail ? <Text style={styles.noSelectText}>{name}</Text> : <Touchable onPress={() => {
            this.clickLoanDetail()
          }} >
            <Text style={styles.orderNumText}>{name}</Text>
          </Touchable>) }
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.indicatorText}>—— 页面到底了 ——</Text>
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  orderNumTitleText: {
    color: '#2D2926',
    fontSize: dp(28),
    marginTop: dp(30)
  },
  orderNumText: {
    color: '#1A97F6',
    fontSize: dp(28),
    marginTop: dp(20)
  },
  noSelectText: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(28),
    marginTop: dp(20)
  },
  userDecVText: {
    color: '#2D2926',
    fontSize: dp(28),
    maxWidth: dp(400)
  },
  userDecText: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  userBox2BG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: dp(20)
  },
  userBox1BG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userBG: {
    marginHorizontal: dp(30),
    padding: dp(30),
    backgroundColor: 'white',
    marginTop: dp(30),
    borderRadius: dp(16)
  },
  userText: {
    color: '#2D2926',
    fontSize: dp(32),
    fontWeight: 'bold',
    marginLeft: dp(36),
    marginTop: dp(60)
  },
  navBarBG: {
    backgroundColor: '#F7F7F9'
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  indicatorText: {
    fontSize: dp(24),
    paddingVertical: dp(88),
    color: '#A7ADB0'
  }

})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    njTime: state.cache.njTime
  }
}

export default connect(mapStateToProps)(CreditSaleDecInfo)
