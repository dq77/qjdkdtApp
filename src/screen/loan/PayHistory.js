import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback
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
import { handleBackPress, toAmountStr, showToast } from '../../utils/Utility'
import { formatDate, createDateData } from '../../utils/DateUtils'
import Picker from 'react-native-picker'
import { DateData } from '../../utils/Date'

/**
 * 历史支付记录
 */
export default class PayHistory extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {

    }
    this.loanStatus = {
      0: { text: '未放款', color: '#F7CF00' },
      1: { text: '审批中', color: '#F7CF00' },
      2: { text: '审批未通过', color: '#F55849' },
      3: { text: '已放款', color: '#4FBF9F' },
      4: { text: '已完成', color: '#4FBF9F' },
      DEL: { text: '已删除', color: '#F55849' }
    }
    this.loanType = {}
  }

  async componentDidMount () {
    await this.getLoanTypes()
    this.listView.refreshData()
  }

  getLoanTypes = async () => {
    const res = await ajaxStore.order.getLoanTypes()
    const loanType = {}
    if (res.data && res.data.code === '0') {
      res.data.data.forEach(function (item, index) {
        loanType[item.value] = item.name
      })
      this.loanType = loanType
    }
  }

  loadData = async (pageNo, pageSize) => {
    const { orderCode } = this.props.navigation.state.params
    const res = await ajaxStore.loan.getHistoryLoanInfo({ orderCode })

    if (res && res.data && res.data.code === '0') {
      return res.data.data
    } else {
      return null
    }
  }

  renderItem = (item) => {
    const {
      makeLoanDate, status, type, amount, amountRate
    } = item.item

    return (
      <View style={styles.item} >
        <View style={styles.itemHeader}>
          <Text style={styles.date}>{makeLoanDate}</Text>
          <Text style={styles.amount}>{this.loanStatus[status].text}</Text>
          <View style={{ marginRight: dp(30), width: dp(16), height: dp(16), borderRadius: dp(45), backgroundColor: this.loanStatus[status].color }}/>
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>支付类型</Text>
            <Text style={styles.itemText}>{this.loanType[type]}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>支付金额</Text>
            <Text style={styles.itemText}>{toAmountStr(amount, 2, true)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>支付比例</Text>
            <Text style={styles.itemText}>{toAmountStr(amountRate, 2, false) + '%'}</Text>
          </View>
        </View>
      </View>

    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'历史支付记录'}
          navigation={navigation}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          navigation={navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderSeparator={null}
          pageSize={9999}
          isAutoRefresh={false}
        />

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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(30)
  },
  date: {
    color: Color.TEXT_MAIN,
    fontSize: dp(32),
    marginLeft: dp(30),
    fontWeight: 'bold'
  },
  amount: {
    color: Color.TEXT_MAIN,
    fontSize: dp(28),
    flex: 1,
    marginRight: dp(12),
    textAlign: 'right'
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
  }

})
