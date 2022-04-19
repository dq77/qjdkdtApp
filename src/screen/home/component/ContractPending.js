import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native'
import ajaxStore from '../../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import Iconfont from '../../../iconfont/Icon'
import { webUrl } from '../../../utils/config'
import { open } from '../../../utils/FileReaderUtils'
import Touchable from '../../../component/Touchable'
import {
  getAgentList, setContractNum
} from '../../../actions'

class ContractPending extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      isLoading: false
    }
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        if (!this.props.isLogin) { return }
        this.setState({ isLoading: true })
        this.fetchData()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  onRefresh=() => {
    this.setState({ isLoading: true })
    this.fetchData()
  }

  fetchData = async () => {
    let list = []
    const res = await ajaxStore.order.getContractList({
      memberId: this.props.companyInfo.companyId,
      signWay: 1,
      totalCount: 0,
      pageSize: 9999,
      pageNo: 1
    })

    if (res.data && res.data.code === '0' && res.data.data.pagedRecords) {
      list = list.concat(res.data.data.pagedRecords)
      list.map((item) => { item.isNomal = true })
    }

    const res2 = await ajaxStore.order.getContractListCxcNoPage({
      memberId: this.props.companyInfo.legalPersonCertId,
      organizationId: this.props.companyInfo.companyId,
      signWay: 1
    })

    if (res2.data && res2.data.code === '0' && res2.data.data) {
      list = list.concat(res2.data.data)
    }
    setContractNum(list.length)
    this.setState({
      list,
      isLoading: false
    })
  }

  signContract = (item) => {
    onClickEvent('待办列表-合同待办-查看', 'home/component/ContractPending')
    if (item.isNomal) {
      this.toSignerList(item.processId, item.businessKey)
    } else { // 诚信销采
      if (item.contractType === '29') {
        this.toAgentSignerList(item)
      } else {
        this.toXCSignerList(item.processId, item.businessKey)
      }
    }
  }

  toAgentSignerList = async (contractItem) => {
    const res = await ajaxStore.company.getAgentList({ cifCompanyId: this.props.companyInfo.companyId })
    if (res.data && res.data.code === '0') {
      const agentList = res.data.data
      const item = agentList.filter((agentItem, agentKey) => {
        return agentItem.contractProcessId === contractItem.processId
      })
      if (item.length) {
        const agentItem = item[0]
        const processInstanceId = agentItem.contractProcessId || ''
        const contractCode = agentItem.contractCode || ''
        this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/agentAuth?companyId=${this.props.companyInfo.companyId}&companyName=${this.props.companyInfo.corpName}&regCode=${this.props.companyInfo.regNo || ''}&legalPersonCertId=${this.props.companyInfo.legalPersonCertId || ''}&legalPersonName=${this.props.companyInfo.legalPerson || ''}&legalArea=${this.props.companyInfo.legalArea || '0'}&processInstanceId=${processInstanceId}&contractCode=${contractCode}&personIdcard=${agentItem.personIdcard}&personName=${agentItem.personName}&relCode=${agentItem.id}`, title: '签署授权委托协议' })
      }
    }
  }

  // http://fgj.hangzhou.gov.cn/module/download/downfile.jsp?classid=0&filename=227ac06d452441628fb7bf258df57c08.xlsx
  // http://www.hangzhou.gov.cn/module/download/downfile.jsp?classid=0&filename=e696f4fafa814791b31edd40d61619ed.doc
  toSignerList = (processInstanceId, contractCode) => {
    // this.props.navigation.navigate('WebView', { url: 'http://www.hangzhou.gov.cn/module/download/downfile.jsp?classid=0&filename=e696f4fafa814791b31edd40d61619ed.doc', title: '合同签约' })
    this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/secondSignPersonList?processInstanceId=${processInstanceId}&contractCode=${contractCode}`, title: '合同签约' })
  }

  toXCSignerList = (processInstanceId, contractCode) => {
    this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${processInstanceId}&contractCode=${contractCode}`, title: '合同签约' })
  }

  toContractList = async () => {
    this.props.navigation.navigate('ContractList')
  }

  ContractItem = () => {
    const views = []
    for (let i = 0; i < this.state.list.length; i++) {
      views.push(
        <Touchable key={i} isNativeFeedback={true} onPress={() => this.signContract(this.state.list[i])}>
          <View style={styles.container} >
            <View style={styles.colum}>
              <Text style={styles.title}>合同未签署</Text>
              <Text style={styles.name}>{`${this.state.list[i].contractName}`}</Text>
            </View>
            <View style={styles.circle}>
              <Iconfont size={dp(30)} name={'arrow-right-fff'} />
            </View>
          </View>
        </Touchable>
      )
    }
    if (this.state.list.length === 0) {
      views.push(
        <View key={this.state.list.length} style={styles.emptyContainer}>
          <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>暂无信息</Text>
        </View>
      )
    } else {
      views.push(
        <Text key={this.state.list.length} style={styles.bottom}>{'—— 页面到底了 ——'}</Text>
      )
    }
    return views
  }

  render () {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={[Color.THEME]}
            refreshing={this.state.isLoading}
            onRefresh={this.onRefresh}
          />
        }>
        <View style={{ alignItems: 'center', paddingTop: dp(20) }}>
          {this.ContractItem()}
        </View>
      </ScrollView>
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

export default connect(mapStateToProps)(ContractPending)

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
    overflow: 'hidden'
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
  bottom: {
    color: '#A7ADB0',
    fontSize: dp(24),
    textAlign: 'center',
    marginVertical: dp(90)
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
