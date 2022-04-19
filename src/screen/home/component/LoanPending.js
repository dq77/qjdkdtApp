import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import ajaxStore from '../../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import Iconfont from '../../../iconfont/Icon'
import { TouchableOpacity } from 'react-native-gesture-handler'
import store from '../../../store/index'
import LoadingView from '../../../component/LoadingView'
import Touchable from '../../../component/Touchable'
import ListPageComponent from '../../../component/ListPageComponent'
import { setLoanNum } from '../../../actions'

class LoanPending extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      isLoading: false,
      listSearchForm: {
        totalCount: 0,
        pageSize: 9999,
        pageNo: 1,
        isFactory: 0
      }
    }
  }

  componentDidMount () {
    if (!this.props.isLogin) { return }
    this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.loan.getLoanTodoList({
      totalCount: 0,
      pageSize,
      pageNo,
      isFactory: 0
    })

    if (res && res.data && res.data.code === '0') {
      setLoanNum(res.data.data.totalCount)
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  // fetchData = async () => {
  //   let list = []
  //   const res = await ajaxStore.loan.getLoanTodoList(this.state.listSearchForm)
  //   // console.log(11, res)
  //   if (res.data && res.data.code === '0' && res.data.data.pagedRecords) {
  //     list = res.data.data.pagedRecords
  //   }

  //   this.setState({
  //     list,
  //     isLoading: false
  //   })
  // }

  toPlan=(item) => {
    // console.log(item)
    onClickEvent('待办列表-还款待办-查看', 'home/component/LoanPending')
    const loanCode = item.loanInfoId
    // const orderCode = item.orderCode
    // const supplierName = item.supplierName
    // const amount = item.amount
    // const status = item.status
    // const loanType = item.loanType
    // const fundSource = item.fundSource
    // const statusText = this.loanStatus[status]

    // if (status !== '3') {
    //   return
    // }

    this.props.navigation.navigate('LoanDetail', { loanCode })
  }

  toLoanList = () => {
    this.props.navigation.navigate('Loan')
  }

  renderItem = (item) => {
    const {
      orderCode
    } = item.item

    return (
      <Touchable isNativeFeedback={true} onPress={() => this.toPlan(item.item)}>
        <View style={styles.container} >
          <View style={styles.colum}>
            <Text style={styles.title}>待还款</Text>
            <Text style={styles.name}>{`订单编号 ${orderCode}`}</Text>
          </View>
          <View style={styles.circle}>
            <Iconfont size={dp(25)} name={'arrow-right-fff'} />
          </View>
        </View>
      </Touchable>
    )
  }

  ContractItem = () => {
    if (this.state.isLoading) {
      return (<ActivityIndicator style={styles.indicator} size="large" color={Color.THEME} />)
    }
    if (this.state.list.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Iconfont name={'daibanweikong'} size={dp(170)}/>
          <Text style={styles.empty}>勤劳的您完成了所有还款待办</Text>
        </View>
      )
    }
    const views = []
    for (let i = 0; i < this.state.list.length; i++) {
      views.push(
        <Touchable key={i} isNativeFeedback={true} onPress={() => this.toPlan(this.state.list[i])}>
          <View style={styles.container} >
            <View style={styles.colum}>
              <Text style={styles.title}>待还款</Text>
              <Text style={styles.name}>{`订单编号 ${this.state.list[i].orderCode}`}</Text>
            </View>
            <View style={styles.circle}>
              <Iconfont size={dp(30)} name={'arrow-right-fff'} />
            </View>
          </View>
        </Touchable>
      )
    }

    return views
  }

  renderEmpty=() => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  render () {
    return (
      <ListPageComponent
        ref={ref => { this.listView = ref }}
        isAutoRefresh={true}
        canChangePageSize={false}
        navigation={this.props.navigation}
        loadData={this.loadData}
        renderItem={this.renderItem}
        renderEmpty={this.renderEmpty}
        renderSeparator={null}
      />

    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    isLogin: state.user.isLogin
  }
}

export default connect(mapStateToProps)(LoanPending)

const styles = StyleSheet.create({
  container: {
    width: dp(690),
    flexDirection: 'row',
    paddingHorizontal: dp(32),
    paddingVertical: dp(40),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  colum: {
    flex: 1,
    justifyContent: 'center'
  },
  circle: {
    backgroundColor: '#D8DDE2',
    width: dp(44),
    height: dp(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(45)
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    fontWeight: 'bold'
  },
  name: {
    fontSize: dp(24),
    color: '#2D2926',
    marginTop: dp(20),
    lineHeight: dp(34),
    marginRight: dp(10)
  },
  // emptyContainer: {
  //   backgroundColor: 'white',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   width: dp(690),
  //   height: dp(400),
  //   borderRadius: dp(16)
  // },
  empty: {
    fontSize: dp(26),
    color: '#91969A',
    marginTop: dp(50)
  },
  indicator: {
    height: dp(300)
  },
  more: {
    fontSize: dp(26),
    color: '#2C2D65',
    paddingHorizontal: dp(30),
    paddingVertical: dp(18),
    backgroundColor: '#EAEAF1',
    borderRadius: dp(32),
    textAlign: 'center',
    overflow: 'hidden'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.30
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  }
})
