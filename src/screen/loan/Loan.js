import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { baseUrl, customerServiceUrl, webUrl } from '../../utils/config'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'

/**
 * 支付货款
 */
class Loan extends PureComponent {
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
      checked: 'remainPrincipal',
      loanList: [],
      inputVal: '',
      inputShowed: false,
      pageNo: 1,
      pageSize: 10,
      totalPages: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isSearch: false,
      isShowClear: false,
      signObj: {},
    }
    this.canLoadMore = true
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      // if (this.state.loanList.length > 0) {
      //   this.scrollview.scrollToOffset({ offset: 0, animated: false })
      // }
      this.refreshItemData(true)
    })

    // BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    // BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async loadData(refresh = false) {
    const { pageNo, pageSize, inputVal } = this.state
    const data = {
      pageNo,
      pageSize,
      keyword: inputVal || '',
    }
    const res = await ajaxStore.loan.loadLoanList(data).catch(() => {
      this.setLoadMore(false)
      this.setRefreshing(false)
    })
    if (res && res.data && res.data.code === '0') {
      const { pagedRecords, totalPages } = res.data.data

      pagedRecords.forEach((item) => {
        let validTimeStr = ''
        if (item.validTime) {
          const validTime = item.validTime.replace(/-/gi, '/')
          validTimeStr = (new Date(validTime) - new Date()) / 1000 / 3600
          validTimeStr = validTimeStr > 1 ? `${parseInt(validTimeStr)}小时` : `${parseInt(validTimeStr * 60)}分钟`
        }
        item.validTimeStr = validTimeStr
      })

      // 订货单是否需要签署
      if (refresh) {
        await this.setState({ signObj: {} })
      }
      const loanIdList = []
      pagedRecords.forEach((item) => {
        loanIdList.push(item.makeLoanCode)
      })
      const response = await ajaxStore.loan.getProductOrderSignProcessId({ loanIds: loanIdList.join(',') })
      if (Object.keys(response.data.data).length !== 0) {
        this.setState({
          signObj: Object.assign({}, this.state.signObj, response.data.data),
        })
      }

      let loanList
      if (refresh) {
        loanList = pagedRecords
        this.setState({ loadEnd: pagedRecords && totalPages === 1 })
      } else {
        loanList = this.state.loanList.concat(pagedRecords)
      }
      this.setState({ loanList, totalPages })
    }
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    if (this.state.loadingMore === true || this.state.refreshing === true) return
    this.setLoadMore(true)
    if (this.state.pageNo < this.state.totalPages) {
      await this.setState({ pageNo: this.state.loanList.length / 10 + 1, pageSize: 10 })
      this.loadData()
    } else {
      this.setState({ loadEnd: true })
    }
  }

  refreshData = async (isShowLoading = true) => {
    if (this.state.refreshing) return
    if (isShowLoading) this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    this.loadData(true)
  }

  refreshItemData = async (isShowLoading = true) => {
    if (this.state.refreshing) return
    if (isShowLoading) this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: this.state.loanList.length === 0 ? 10 : this.state.loanList.length })
    this.loadData(true)
  }

  setLoadMore(visible) {
    this.setState({ loadingMore: visible })
  }

  setRefreshing(visible) {
    this.setState({ refreshing: visible })
  }

  renderSeparator() {
    return <View style={styles.separator} />
  }

  renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂时没有货款支付信息</Text>
      </View>
    )
  }

  renderMore() {
    if (!this.state.loadEnd) {
      return this.state.loadingMore ? (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator style={styles.indicator} color={Color.THEME} />
          <Text style={styles.indicatorText}>正在加载更多</Text>
        </View>
      ) : null
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          {/* <View style={styles.separator} /> */}
          <Text style={[styles.indicatorText, { paddingVertical: dp(30), color: '#999999' }]}>—— 页面到底了 ——</Text>
        </View>
      )
    }
  }

  search(text) {
    if (text) {
      this.setState({ isShowClear: true })

      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.refreshData(false)
      }, 500)
    } else {
      this.setState({ isShowClear: false })
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.refreshData(false)
  }

  startSearch = () => {
    this.setState({ isSearch: true })
    this.input.focus()
  }

  cancelSearch = () => {
    this.input.blur()
    this.input.clear()
    this.setState({ isSearch: false, isShowClear: false, inputVal: '' })
    this.refreshData(false)
  }

  onFocus = () => {
    this.setState({ isSearch: true })
  }

  onBlur = () => {}

  goServer = () => {
    this.props.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${'客户'}`,
    })
  }

  goLoanDetail = (item) => {
    const loanCode = item.makeLoanCode
    const supplierName = item.supplierName
    const amount = item.amount
    const status = item.status
    const loanType = item.loanType
    const fundSource = item.fundSource
    const statusText = this.loanStatus[status]

    if (status !== '3') {
      return
    }
    this.props.navigation.navigate('LoanDetail', { loanCode, statusText, supplierName, amount, loanType, fundSource })
  }

  goLoanPay = (item) => {
    this.props.navigation.navigate('LoanPay', { loanCode: item.makeLoanCode })
  }

  tapLoanSign = async (bankUrl, amount) => {
    if (baseUrl === 'https://pres.qjdchina.com') {
      const mock = await this.isMock()
      if (mock.open === 1) {
        this.props.navigation.navigate('WebView', {
          url: 'https://preswebtools.qjdchina.com/public/pages/yibin/loading.htm?amount=' + amount,
        })
      } else {
        this.props.navigation.navigate('WebView', {
          url:
            bankUrl +
            '&cpUrl=' +
            encodeURIComponent('https://wx.zhuozhuwang.com/ofs_weixin/html/wxRedirectTo.html?qjdkdt://Loan'),
        })
      }
    } else {
      this.props.navigation.navigate('WebView', {
        url:
          bankUrl +
          '&cpUrl=' +
          encodeURIComponent('https://wx.zhuozhuwang.com/ofs_weixin/html/wxRedirectTo.html?qjdkdt://Loan'),
      })
    }
  }

  isMock = async () => {
    const res = await ajaxStore.common.isMock()
    if (res.data && res.data.code === 0) {
      return res.data.data[0]
    }
  }

  tapContractsSign = (makeLoansId) => {
    // 签署合同
    if (this.props.njTime && (new Date().getTime() - this.props.njTime) / 1000 / 60 <= 30) {
      // 超过30分钟重新认证
      this.props.navigation.navigate('ContractsByNanJing', { makeLoansId })
    } else {
      this.props.navigation.navigate('FaceIdentity', {
        idcardName: this.props.companyInfo.legalPerson,
        idcardNumber: this.props.companyInfo.legalPersonCertId,
        // idcardName: '韩小乐',
        // idcardNumber: '370304199504020010',
        isNJBank: true,
        callback: (navigation) => {
          navigation.replace('ContractsByNanJing', { makeLoansId })
        },
      })
    }
  }

  signGoods = async (processId) => {
    const res = await ajaxStore.process.getProcessDetail({ processInstanceId: processId })
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('WebView', {
        url: `${webUrl}/agreement/signPersonList?processInstanceId=${processId}&contractCode=${res.data.data.businessKey}`,
        title: '合同签约',
      })
    }
  }

  renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TouchableWithoutFeedback onPress={this.startSearch}>
            <View style={styles.searchView}>
              <TextInput
                ref={(view) => {
                  this.input = view
                }}
                placeholder={'搜索项目/订单名称'}
                placeholderTextColor={'#A7ADB0'}
                style={[styles.input, { flex: this.state.isSearch ? 1 : 0 }]}
                onChangeText={(text) => {
                  this.search(text)
                }}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
              />
              {this.state.isShowClear ? (
                <Iconfont name={'qingchu'} size={dp(40)} onPress={this.clearSearch} style={styles.clearIcon} />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
          {this.state.isSearch ? (
            <Text style={styles.cancel} onPress={this.cancelSearch}>
              取消
            </Text>
          ) : null}
        </View>
        <Touchable
          onPress={() => {
            this.props.navigation.navigate('BatchPay')
          }}
        >
          <Text style={styles.batchPay}>批量结清</Text>
        </Touchable>
      </View>
    )
  }

  renderItem(data) {
    const { item } = data
    return (
      <View style={styles.itemRow}>
        <View
          style={
            item.status === '2' ? [styles.itemHeader, { backgroundColor: 'rgba(205,170,116,0.3)' }] : styles.itemHeader
          }
        >
          <Text
            style={item.status === '2' ? [styles.itemHeadText, { color: '#B7916C' }] : styles.itemHeadText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{`${toAmountStr(item.amount, 2, true) || ''}`}</Text>
          <Text
            style={item.status === '2' ? [styles.itemHeadText1, { color: '#B7916C' }] : styles.itemHeadText1}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{`${this.loanStatus[item.status] || ''}`}</Text>
        </View>
        <View style={styles.itemContent}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.itemText, { marginTop: dp(14) }]}>{'支付货款编号：'}</Text>
            <Text style={[styles.itemText, { flex: 1 }]}>{`${item.makeLoanCode}` || ''}</Text>
          </View>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{`订单编号：${
            item.orderCode || ''
          }`}</Text>
          {item.loanType === '0' ? (
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{`项目名称：${
              item.projectName || ''
            }`}</Text>
          ) : (
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{`订单名称：${
              item.orderName || ''
            }`}</Text>
          )}
          {item.loanType === '2' ? (
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{`一级经销商：${
              item.supplierName || ''
            }`}</Text>
          ) : (
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">{`合作厂家：${
              item.supplierName || ''
            }`}</Text>
          )}

          {/* 按钮 */}
          <View style={styles.btnLine}>
            {item.status === '3' && item.repaymentShow === 1 && item.typeStatus !== '5' ? (
              <Touchable onPress={() => this.goLoanDetail(item)} isPreventDouble={true}>
                <Text style={styles.itemBtn}>{'货款支付详情'}</Text>
              </Touchable>
            ) : null}
            {item.repayShow !== 'blank' ? (
              <Touchable
                onPress={() => {
                  if (item.repayShow !== 'disable') {
                    this.goLoanPay(item)
                  }
                }}
                isPreventDouble={true}
              >
                <Text style={item.repayShow === 'disable' ? styles.itemBtn2 : styles.itemBtn}>{'申请还款'}</Text>
              </Touchable>
            ) : null}
            {item.isShow ? (
              <Touchable onPress={() => this.tapLoanSign(item.bankUrl, item.amount)} isPreventDouble={true}>
                <Text style={styles.itemBtn}>{'支付货款签约'}</Text>
              </Touchable>
            ) : null}
            {item.isShow && item.validTimeStr ? (
              <Text style={styles.validTime}>{`${item.validTimeStr || ''}后失效`}</Text>
            ) : null}
            {item.fundSource === '4' && item.nanJingLoansStatus ? (
              <Touchable onPress={() => this.tapContractsSign(item.makeLoanCode)} isPreventDouble={true}>
                <Text style={styles.itemBtn}>{'签署合同'}</Text>
              </Touchable>
            ) : null}
            {this.state.signObj[item.makeLoanCode] ? (
              <Touchable onPress={() => this.signGoods(this.state.signObj[item.makeLoanCode])} isPreventDouble={true}>
                <Text style={styles.itemBtn}>{'签约'}</Text>
              </Touchable>
            ) : null}
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'货款中心'}
          navigation={navigation}
          rightIcon={'navibar_kefu'}
          rightIconSize={dp(60)}
          onRightPress={this.goServer}
          elevation={0.5}
          stateBarStyle={{ backgroundColor: '#F7F7F9' }}
          navBarStyle={{ backgroundColor: '#F7F7F9' }}
        />
        <FlatList
          ref={(r) => {
            this.scrollview = r
          }}
          data={this.state.loanList}
          keyExtractor={(item) => item.makeLoanCode}
          // ItemSeparatorComponent={() => this.renderSeparator()}
          renderItem={(data) => this.renderItem(data)}
          ListHeaderComponent={this.renderHeader()}
          ListEmptyComponent={this.renderEmpty()}
          refreshControl={
            <RefreshControl
              title={'加载中'}
              titleColor={Color.TEXT_MAIN}
              colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.refreshData}
              tintColor={Color.THEME}
            />
          }
          ListFooterComponent={this.renderMore()}
          onEndReached={() => {
            if (this.canLoadMore) {
              // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
              this.loadMoreData()
              this.canLoadMore = false
            }
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
          }}
        />
      </View>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    companyInfo: state.company,
    njTime: state.cache.njTime,
  }
}

export default connect(mapStateToProps)(Loan)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5',
    marginLeft: dp(30),
  },
  itemRow: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    alignItems: 'stretch',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  itemContent: {
    padding: dp(30),
  },
  itemTitile: {
    fontSize: dp(31),
    color: Color.TEXT_MAIN,
    marginBottom: dp(6),
    marginRight: dp(15),
  },
  itemHeadText: {
    fontSize: dp(30),
    color: '#464678',
    fontWeight: 'bold',
    marginLeft: dp(30),
  },
  itemHeadText1: {
    fontSize: dp(24),
    color: '#464678',
    marginRight: dp(30),
  },
  itemText: {
    fontSize: dp(26),
    color: '#91969A',
    marginTop: dp(11),
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.24,
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(30),
  },
  indicator: {
    marginRight: dp(20),
  },
  indicatorText: {
    fontSize: dp(28),
    color: '#666666',
  },
  itemBtn: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: '#464678',
    textAlign: 'center',
    borderRadius: dp(30),
    fontSize: dp(24),
    marginRight: dp(30),
    overflow: 'hidden',
  },
  itemBtn2: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: 'rgba(70,70,120,0.5)',
    textAlign: 'center',
    borderRadius: dp(35),
    fontSize: dp(24),
    marginRight: dp(10),
    overflow: 'hidden',
  },
  btnLine: {
    marginTop: dp(30),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(50),
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginLeft: dp(10),
  },
  clearIcon: {
    marginRight: dp(15),
  },
  cancel: {
    paddingRight: dp(30),
    fontSize: dp(29),
    color: Color.GREEN_BTN,
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1,
  },
  validTime: {
    fontSize: dp(26),
    color: '#999999',
  },
  batchPay: {
    fontSize: dp(24),
    color: 'white',
    backgroundColor: '#464678',
    borderRadius: dp(30),
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    marginRight: dp(30),
    // marginTop: dp(20),
    marginBottom: dp(30),
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    backgroundColor: '#DDDDE8',
    height: dp(90),
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
