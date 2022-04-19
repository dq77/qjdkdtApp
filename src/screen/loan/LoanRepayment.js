import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, RefreshControl, FlatList, TextInput,
  ActivityIndicator, ToastAndroid, ScrollView
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Banner from '../../component/Banner'
import ListFooter from '../../component/ListFooter'
import CommonFlatList from '../../component/CommonFlatList'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import AlertModal from '../../component/AlertModal'
import ComfirmModal from '../../component/ComfirmModal'
import { setGoodsItems } from '../../actions/index'
import { injectUnmount } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'

@injectUnmount
export default class LoanRepayment extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loanCode: '',
      repayType: '',
      repayTypeMap: {
        1: '本期',
        2: '逾期',
        3: '剩余'
      },
      repayInfo: {}
    }
  }

  async componentDidMount () {
    if (this.props.navigation.state.params) {
      const loanCode = this.props.navigation.state.params.loanCode
      const repayType = this.props.navigation.state.params.repayType
      await this.setState({
        loanCode,
        repayType
      })
    }
    console.log(this.state)
    this.getRepayInfo()
  }

  async getRepayInfo () {
    const data = {
      cpTxNo: this.state.loanCode,
      isHead: this.state.repayType === 3
    }
    console.log(data)
    const res = await ajaxStore.loan.repayCheck(data)
    if (res.data.data && res.data.code === '0') {
      this.setState({ repayInfo: res.data.data })
    }
  }

  async clickApply () {
    const repayInfo = this.state.repayInfo
    const data = {
      cpTxNo: this.state.loanCode,
      isHead: this.state.repayType === 3,
      totalAmount: repayInfo.totalAmount,
      principal: repayInfo.principal,
      interest: repayInfo.interest,
      penalty: repayInfo.penalty,
      compoundInterest: repayInfo.compoundInterest,
      serviceCharge: repayInfo.serviceCharge
    }
    const res = await ajaxStore.loan.promptlyRepay(data)
    if (res.data && res.data.code === '0') {
      await global.loading.showSuccess('还款成功', () => { this.props.navigation.goBack() })
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'金额确认'} navigation={navigation} />
        <ScrollView >
          <View style={styles.range}>
            <Text style={styles.rangeTitle}>{`${this.state.repayTypeMap[this.state.repayType]}应还  ${this.state.repayInfo.totalAmount || ''}`}</Text>
            <View style={styles.rangeBg}>
              <View style={styles.rangeItem}>
                <Text style={styles.rangeText}>赊销货款</Text>
                <Text style={styles.rangeText}>{`￥${this.state.repayInfo.principal || ''}`}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.rangeItem}>
                <Text style={styles.rangeText}>利息</Text>
                <Text style={styles.rangeText}>{`￥${this.state.repayInfo.interest || ''}`}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.rangeItem}>
                <Text style={styles.rangeText}>罚息</Text>
                <Text style={styles.rangeText}>{`￥${this.state.repayInfo.penalty || ''}`}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.rangeItem}>
                <Text style={styles.rangeText}>复利</Text>
                <Text style={styles.rangeText}>{`￥${this.state.repayInfo.compoundInterest || ''}`}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.rangeItem}>
                <Text style={styles.rangeText}>服务费</Text>
                <Text style={styles.rangeText}>{`￥${this.state.repayInfo.serviceCharge || ''}`}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <Text style={styles.hint}>释义：</Text>
              <Text style={styles.hint}>罚息：逾期后将按日计息产生罚息，罚息利率为在约定的借款利率水平上加收50%</Text>
              <Text style={styles.hint}>复利：逾期后将按日计息产生复利，复利利率为借款日利率（年利率/360）</Text>
            </View>
            <SolidBtn text={'立即还款'} onPress={() => { this.clickApply() }} />
          </View>
        </ScrollView>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5'
  },
  range: {
    padding: dp(30)
  },
  rangeTitle: {
    fontSize: dp(34),
    fontWeight: 'bold',
    color: '#333333'
  },
  amountText: {
    fontSize: dp(28),
    color: '#999999'
  },
  rangeBg: {
    backgroundColor: 'rgba(239,239,244,0.50)',
    borderRadius: dp(10),
    marginTop: dp(30)
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: dp(30)
  },
  rangeText: {
    fontSize: dp(28),
    color: '#333333'
  },
  column: {
    marginVertical: dp(30)
  },
  hint: {
    fontSize: dp(28),
    color: '#999999',
    marginBottom: dp(15)
  }

})
