import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native'
import ajaxStore from '../../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import store from '../../../store/index'
import LoadingView from '../../../component/LoadingView'
import Touchable from '../../../component/Touchable'

class OrderPending extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      isLoading: false,
      listSearchForm: {
        totalCount: 0,
        pageSize: 10,
        pageNo: 1,
        ofsCompanyId: '',
        confirmWay: 0
      }
    }
    this.props.load(this.fetchData)
  }

  componentDidMount () {
    // this.setState({ isLoading: true })
  }

  toOrderList = () => {
    this.props.navigation.navigate('Order')
  }

  fetchData = async () => {
    if (!this.props.companyInfo.companyId) {
      return
    }
    await this.setState({
      listSearchForm: {
        ...this.state.listSearchForm,
        ofsCompanyId: this.props.userInfo.ofsCompanyId
      }
    })

    let list = []
    const res = await ajaxStore.order.getOrderToDoList(this.state.listSearchForm)
    // console.log(11, res)
    if (res.data && res.data.code === '0' && res.data.data.pagedRecords) {
      list = res.data.data.pagedRecords
    }

    if (list.length > 3) {
      list = list.slice(0, 3)
    }
    // console.log(list)
    this.setState({
      list,
      isLoading: false
    })
  }

  ContractItem = () => {
    if (this.state.isLoading) {
      return (<ActivityIndicator style={styles.indicator} size="large" color={Color.THEME} />)
    }
    if (this.state.list.length === 0) {
      return (<Text style={styles.empty}>暂无待办</Text>)
    }
    const views = []
    for (let i = 0; i < this.state.list.length; i++) {
      views.push(
        <View style={styles.container} key={i} >
          <View style={styles.colum}>
            <Text style={styles.title}>订单待确认</Text>
            <Text style={styles.name}>{`订单编号/项目名称 ${this.state.list[i].orderCode}`}</Text>
          </View>
          <View style={styles.circle}>
            <Iconfont size={dp(25)} name={'arrow-right-fff'} />
          </View>
        </View>
      )
    }
    views.push(
      <Touchable key={this.state.list.length} isNativeFeedback={true} onPress={this.toOrderList}>
        <Text style={styles.more}>
          点击查看更多
        </Text>
      </Touchable>
    )
    return views
  }

  render () {
    return (
      <View style={{ alignItems: 'center' }}>
        {this.ContractItem()}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(OrderPending)

const styles = StyleSheet.create({
  container: {
    width: dp(690),
    flexDirection: 'row',
    paddingHorizontal: dp(32),
    paddingVertical: dp(40),
    backgroundColor: Color.THEME,
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    alignItems: 'center'
  },
  colum: {
    flex: 1,
    justifyContent: 'center'
  },
  circle: {
    backgroundColor: '#5E608A',
    width: dp(88),
    height: dp(88),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(45)
  },
  title: {
    fontSize: dp(28),
    color: 'white',
    fontWeight: 'bold'
  },
  name: {
    fontSize: dp(24),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: dp(20),
    lineHeight: dp(34)
  },
  empty: {
    marginVertical: dp(150),
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Color.TEXT_LIGHT
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
    marginTop: dp(30),
    overflow: 'hidden'
  }
})
