import React, { PureComponent } from 'react'
import { View, StyleSheet, RefreshControl, BackHandler, ScrollView, StatusBar, Text, Image } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp } from '../../utils/screenUtil'
import { handleBackPress } from '../../utils/Utility'
import Color from '../../utils/Color'
import { onClickEvent } from '../../utils/AnalyticsUtil'
import BaseInfo from './component/BaseInfo'
import LoanInfo from './component/LoanInfo'
import Pending from './component/Pending'
import Guide from './component/Guide'
import ContractPending from './component/ContractPending'
import TopBar from './component/TopBar'
import AccountInfo from './component/AccountInfo'
import SupplyService from './component/SupplyService'
import OverviewCredit from './component/OverviewCredit'
import OverviewCreditSalesData from './component/OverviewCreditSalesData'
import OverviewMonthData from './component/OverviewMonthData'
import Notice from './component/Notice'
import store from '../../store'
import ajaxStore from '../../utils/ajaxStore'

import {
  getCompanyInfo,
  getIsAudit,
  getCompanyTag,
  getLoanInfo,
  getAccountInfo,
  getSecondContractInfo,
  getCSContractList,
  getMemberVipInfo,
} from '../../actions'
import Touchable from '../../component/Touchable'
import { supportProducts } from '../../utils/enums'

/**
 * 采购
 */
class Purchase extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,

      newInformation: {},
      messageListNum: 0,
    }
    this.init = this.init.bind(this)
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      StatusBar.setBarStyle('light-content')
      this.init()
    })
    this.didBlurListener = this.props.navigation.addListener('didBlur', (obj) => {
      StatusBar.setBarStyle('dark-content')
    })
    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.didBlurListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async init() {
    const { companyInfo } = this.props
    const { sequence, companyTag } = companyInfo
    this.setState({
      refreshing: true,
    })
    const res = await Promise.all([
      getCompanyInfo(),
      getIsAudit(),
      getCompanyTag(),
      getLoanInfo(),
      getAccountInfo(),
    ]).catch(() => {
      this.setState({
        refreshing: false,
      })
    })

    this.setState({
      refreshing: false,
    })

    this.newInformation()
    this.messageListData()
  }

  async messageListData() {
    const data = {
      messageStatus: 'SUCCESS',
      companyName: this.props.companyInfo.corpName,
      pageNo: 1,
      pageSize: 100,
    }
    const res = await ajaxStore.company.messageList(data)
    if (res.data && res.data.code === '0') {
      const messageList = res.data.data.pagedRecords
      this.setState({
        messageListNum: messageList.length || 0,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async newInformation(type) {
    const res = await ajaxStore.company.newInformation()
    if (res.data && res.data.code === '0') {
      this.setState({
        newInformation: res.data.data || {},
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  onRefresh = () => {
    this.init()
  }

  createOrder = async () => {
    onClickEvent('采购管理--创建订单', 'home/Purchase')
    await getCompanyTag()
    let count = 0
    const companyInfo = store.getState('companyInfo').company
    const redioButtonItems = supportProducts
    redioButtonItems.map((item, key) => {
      if (companyInfo.companyTag[item.tag] === '1') {
        count++
      }
    })
    if (store.getState('companyInfo').company.vipLevelCode !== '0') {
      if (count) {
        // 校验授信状态
        const res = await ajaxStore.order.confirmContract()
        if (res.data && res.data.code === '0') {
          this.props.navigation.navigate('OrderCreateStepOne')
        }
      } else {
        global.alert.show({
          content: '目前没有产品支持创建订单',
        })
      }
    } else {
      global.alert.show({
        content: '请成为会员后再创建订单',
      })
    }
  }

  render() {
    const { navigation, companyInfo } = this.props
    const { sequence, companyTag, accountInfo } = companyInfo
    return (
      <View style={styles.container}>
        <Image
          style={{ height: dp(441), width: dp(750), position: 'absolute' }}
          resizeMode={'cover'}
          source={require('../../images/purchase_bg.png')}
        />
        <TopBar
          title={'采购'}
          msgColor={'white'}
          titleColor={{ color: 'white' }}
          navigation={navigation}
          messageListNum={this.state.messageListNum}
        />
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl colors={[Color.THEME]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
          }
        >
          <View style={styles.pageMain}>
            <SupplyService navigation={navigation} />
            <OverviewMonthData newInformation={this.state.newInformation} />
          </View>
        </ScrollView>

        <Touchable style={styles.creatOrder} onPress={this.createOrder}>
          <View>
            <Text style={{ color: 'white', fontSize: dp(26) }}>创建</Text>
            <Text style={{ color: 'white', fontSize: dp(26) }}>订单</Text>
          </View>
        </Touchable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
  },
  creatOrder: {
    position: 'absolute',
    bottom: dp(30),
    right: dp(30),
    backgroundColor: '#2A6EE7',
    width: dp(110),
    height: dp(110),
    borderRadius: dp(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const mapStateToProps = (state) => {
  return {
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    isLogin: state.user.isLogin,
  }
}

export default connect(mapStateToProps)(Purchase)
