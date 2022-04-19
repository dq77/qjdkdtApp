import React, { PureComponent } from 'react'
import { RefreshControl, SectionList, StatusBar, StyleSheet, Text, View } from 'react-native'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { connect } from 'react-redux'
import { getCompanyInfo, getMemberVipInfo } from '../../actions'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp, getStatusBarHeight } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'

class QuotaManage extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      infoModal: false,
      selectNum: '1',
      creditQjdInfo: [],
      creditProjectInfo: [],
      creditSupplierInfoList: [],
      pageNo: 1,
      pageSize: 10,
      totalPage: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isProject: false,
      isSupplier: false,
    }
    this.canLoadMore = true
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      StatusBar.setBarStyle('light-content')
      this.init()
    })
    this.didBlurListener = this.props.navigation.addListener('didBlur', obj => {
      StatusBar.setBarStyle('dark-content')
    })
  }

  async init() {
    await getCompanyInfo()
    await getMemberVipInfo(this.props.companyInfo.companyId)
    // await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    switch (this.state.selectNum) {
      case '1':
        this.creditAll(true)
        break
      case '2':
        this.creditProject(true)
        break
      case '3':
        this.creditSupplier(true)
        break
      default:
        break
    }
    // 判断有没有授信额度和上游额度

    await this.isTotolLine()
  }

  async isTotolLine() {
    const data = {
      pageNo: 1,
      pageSize: 10,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditProject(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        isProject: res.data.data.pagedRecords && res.data.data.pagedRecords.length > 0,
      })
      this.isTotolLineCreditSupplier()
    }
  }

  async isTotolLineCreditSupplier() {
    const data = {
      pageNo: 1,
      pageSize: 10,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditSupplier(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        isSupplier: res.data.data.pagedRecords && res.data.data.pagedRecords.length > 0,
      })
    }
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.didBlurListener.remove()
  }

  async creditAll(refresh) {
    const data = {
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditAll(data)
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      // 仟金顶授信
      const creditQjdInfo = data.creditQjdInfo || {}

      const creditQjdInfoData = [
        {
          title: '1',
          key1: '1',
          data: [
            {
              money: creditQjdInfo.creditLine || 0,
              time: creditQjdInfo.replyDeadline || '',
              status: creditQjdInfo.status,
            },
            {
              money: creditQjdInfo.availableLine || 0,
              rate: creditQjdInfo.availableRate || 0,
              status: creditQjdInfo.status,
            },
            {
              money: creditQjdInfo.usedLine || 0,
              rate: creditQjdInfo.usedRate || 0,
              status: creditQjdInfo.status,
            },
            {
              money: creditQjdInfo.freezeLine || 0,
              rate: creditQjdInfo.freezeRate || 0,
              status: creditQjdInfo.status,
            },
          ],
        },
      ]

      const { totalPage } = res.data.data
      let loanList
      if (refresh) {
        loanList = creditQjdInfoData
        this.setState({ loadEnd: creditQjdInfoData && totalPage === 1 })
      } else {
        loanList = this.state.creditQjdInfo.concat(creditQjdInfoData)
      }
      this.setState({ creditQjdInfo: loanList, totalPage })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async loadData(refresh = false, type) {
    switch (type) {
      case '1':
        this.creditAll(refresh)
        break
      case '2':
        this.creditProject(refresh)
        break
      case '3':
        this.creditSupplier(refresh)
        break
      default:
        break
    }
    this.catchRefresh()
  }

  catchRefresh() {
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    if (this.state.loadingMore === true || this.state.refreshing === true) return
    this.setLoadMore(true)
    if (this.state.pageNo < this.state.totalPage) {
      await this.setState({ pageNo: this.state.creditQjdInfo.length / 10 + 1, pageSize: 10 })
      this.loadData(false, this.state.selectNum)
    } else {
      this.setState({ loadEnd: true })
    }
  }

  refreshData = async () => {
    if (this.state.refreshing) return
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    this.loadData(true, this.state.selectNum)
  }

  refreshItemData = async () => {
    if (this.state.refreshing) return
    this.setRefreshing(true)
    await this.setState({
      pageNo: 1,
      pageSize: this.state.creditQjdInfo.length === 0 ? 10 : this.state.creditQjdInfo.length,
    })
    this.loadData(true, this.state.selectNum)
  }

  setLoadMore(visible) {
    this.setState({ loadingMore: visible })
  }

  setRefreshing(visible) {
    this.setState({ refreshing: visible })
  }

  async creditProject(refresh) {
    const { pageNo, pageSize } = this.state
    const data = {
      pageNo,
      pageSize,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditProject(data)
    if (res.data && res.data.code === '0') {
      const creditProjectInfoList = res.data.data.pagedRecords

      const creditProjectInfo = []
      creditProjectInfoList.forEach((item, index) => {
        const dicData = {
          title: '1',
          key1: '2',
          data: [
            {
              money: item.creditLine || 0,
              name: item.projectInfo.projectName,
              code: item.projectInfo.projectCode,
              status: item.status,
            },
            {
              money: item.availableLine || 0,
              rate: item.availableRate || 0,
              name: item.projectInfo.projectName,
              code: item.projectInfo.projectCode,
              status: item.status,
            },
            {
              money: item.usedLine || 0,
              rate: item.usedRate || 0,
              name: item.projectInfo.projectName,
              code: item.projectInfo.projectCode,
              status: item.status,
            },
            {
              money: item.freezeLine || 0,
              rate: item.freezeRate || 0,
              name: item.projectInfo.projectName,
              code: item.projectInfo.projectCode,
              status: item.status,
            },
          ],
        }
        creditProjectInfo.push(dicData)
      })

      const { totalPage } = res.data.data
      let loanList
      if (refresh) {
        loanList = creditProjectInfo
        this.setState({ loadEnd: creditProjectInfo && totalPage === 1 })
      } else {
        loanList = this.state.creditQjdInfo.concat(creditProjectInfo)
      }
      this.setState({ creditQjdInfo: loanList, totalPage })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async creditSupplier(refresh) {
    const { pageNo, pageSize } = this.state
    const data = {
      pageNo,
      pageSize,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditSupplier(data)
    if (res.data && res.data.code === '0') {
      const creditSupplierInfoList = res.data.data.pagedRecords
      const creditSupplierInfo = []
      creditSupplierInfoList.forEach((item, index) => {
        const dicData = {
          title: '1',
          key1: '3',
          data: [
            {
              money: item.creditLine || 0,
              name: item.supplierInfo.name,
              code: item.supplierInfo.id,
              status: item.status,
            },
            {
              money: item.availableLine || 0,
              rate: item.availableRate || 0,
              code: item.supplierInfo.id,
              status: item.status,
            },
            {
              money: item.usedLine || 0,
              rate: item.usedRate || 0,
              code: item.supplierInfo.id,
              status: item.status,
            },
            {
              money: item.freezeLine || 0,
              rate: item.freezeRate || 0,
              code: item.supplierInfo.id,
              status: item.status,
            },
          ],
        }
        creditSupplierInfo.push(dicData)
      })
      const { totalPage } = res.data.data
      let loanList
      if (refresh) {
        loanList = creditSupplierInfo
        this.setState({ loadEnd: creditSupplierInfo && totalPage === 1 })
      } else {
        loanList = this.state.creditQjdInfo.concat(creditSupplierInfo)
      }
      this.setState({ creditQjdInfo: loanList, totalPage })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async selectNum(type) {
    await this.setState({
      selectNum: type,
    })
    await this.setState({ pageNo: 1, pageSize: 10 })

    this.loadData(true, type)
  }

  // 上游厂家的第一个明细
  toNavigateCreditSaleDec(item, index) {
    this.props.navigation.navigate('CreditSaleDec', {
      selectNum: this.state.selectNum,
      supplierId: item.code,
      typeNum: index,
    })
  }

  // 清单
  clickDecList(item, index) {
    this.props.navigation.navigate('CreditSaleDec', {
      selectNum: this.state.selectNum,
      supplierId: this.state.selectNum === '3' ? item.code : '',
      type: 'list',
      typeNum: index,
    })
  }

  // qjd，临额明细
  clickDec(item, index) {
    this.props.navigation.navigate('CreditSaleDec', {
      selectNum: this.state.selectNum,
      supplierId: this.state.selectNum === '2' ? item.projectInfo.projectCode : '',
    })
  }

  selectView() {
    const selectNum = this.state.selectNum
    const bgView1BG = selectNum === '1' ? 'white' : selectNum === '2' ? '#586DA7' : '#D3B685'
    const bgView2BG = selectNum === '2' ? 'white' : selectNum === '1' ? '#464678' : '#D3B685'
    const bgView3BG = selectNum === '3' ? 'white' : selectNum === '2' ? '#586DA7' : '#464678'
    const num = this.state.isProject && this.state.isSupplier ? 3 : 2
    const width = (DEVICE_WIDTH - dp(60)) / num
    return (
      <View style={styles.topBoxBG}>
        <Touchable onPress={() => this.selectNum('1')}>
          <View style={[styles.bgView, { width: width, backgroundColor: bgView1BG }]}>
            <Text
              style={[
                styles.title1Style,
                { color: selectNum === '1' ? '#353535' : 'white', fontWeight: selectNum === '1' ? 'bold' : 'normal' },
              ]}
            >
              授信额度
            </Text>
          </View>
        </Touchable>
        {this.state.isProject && (
          <Touchable onPress={() => this.selectNum('2')}>
            <View style={[styles.bgView, { width: width, backgroundColor: bgView2BG }]}>
              <Text
                style={[
                  styles.title1Style,
                  { color: selectNum === '2' ? '#353535' : 'white', fontWeight: selectNum === '2' ? 'bold' : 'normal' },
                ]}
              >
                临时额度
              </Text>
            </View>
          </Touchable>
        )}
        {this.state.isSupplier && (
          <Touchable onPress={() => this.selectNum('3')}>
            <View style={[styles.bgView, { width: width, backgroundColor: bgView3BG }]}>
              <Text
                style={[
                  styles.title1Style,
                  { color: selectNum === '3' ? '#353535' : 'white', fontWeight: selectNum === '3' ? 'bold' : 'normal' },
                ]}
              >
                上游额度
              </Text>
            </View>
          </Touchable>
        )}
      </View>
    )
  }

  // 上游厂家的第一个栏目
  separateView(item, index, section) {
    const money = item.status === 'DONE' ? toAmountStr(item.money, 2, true) : '0.00'
    return (
      <View key={index} style={styles.separateBG}>
        <Text
          numberOfLines={1}
          style={[styles.separateTitle, { color: this.state.selectNum === '2' ? '#586DA7' : '#B7916C' }]}
        >
          {item.name}
        </Text>
        <View style={styles.separateDecBG}>
          <Text style={[styles.separateDecTitle, { color: item.status === 'DONE' ? '#2D2926' : '#A7ADB0' }]}>
            {money}
          </Text>
          <Touchable
            onPress={() => {
              item.status === 'DONE' && this.toNavigateCreditSaleDec(item, index)
            }}
          >
            <Text style={[styles.separateDec, { color: item.status === 'DONE' ? '#1A97F6' : '#A7ADB0' }]}>
              {item.status === 'DONE' ? '明细' : '已失效'}
            </Text>
          </Touchable>
        </View>
      </View>
    )
  }

  itemSeparatorComponent() {
    return <View style={styles.separatorComponent} />
  }

  animatedCircularProgress(item, index) {
    const rate = item.status !== 'DONE' ? 0 : item.rate ? item.rate : 0
    const colorBG = item.status !== 'DONE' ? '#A7ADB0' : index === 1 ? '#5E608A' : index === 2 ? '#F08787' : '#3E99DD'
    return (
      <View style={{ alignItems: 'center' }}>
        <AnimatedCircularProgress
          rotation={0}
          style={styles.progress}
          size={dp(120)}
          width={dp(10)}
          fill={rate}
          tintColor={colorBG}
          lineCap={'round'}
          backgroundColor={'#E7EBF2'}
        >
          {fill => <Text style={{ color: colorBG, fontSize: dp(28) }}>{rate}%</Text>}
        </AnimatedCircularProgress>
      </View>
    )
  }

  boxOneNoSupplierUI(item, index) {
    const selectNum = this.state.selectNum
    const time = item.time
      ? item.time.length >= 10
        ? `到期日 ${item.time.substring(0, 10)}`
        : '暂无到期时间'
      : '暂无到期时间'
    return (
      item.status === 'DONE' && (
        <View style={styles.boxNoSupplierBG}>
          <Touchable
            onPress={() => {
              this.clickDec(item, index)
            }}
          >
            <Text style={styles.boxDecNoSupplierListTitle}>明细</Text>
          </Touchable>
          <Text style={{ color: selectNum === '2' ? 'white' : '#2D2926', fontSize: dp(28), marginTop: dp(40) }}>
            {time}
          </Text>
        </View>
      )
    )
  }

  renderSectionHeader(key1) {
    return key1 === '3' || key1 === '2' ? <View style={styles.headerBG}></View> : <View></View>
  }

  listFooterComponent() {
    return (
      <View style={styles.footerBG}>
        <Text style={styles.footerTitle}>—— 页面到底了 ——</Text>
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    const selectNum = this.state.selectNum
    const navBarBackgroundColor = selectNum === '1' ? '#464678' : selectNum === '2' ? '#586DA7' : '#D3B685'
    const sectionData = this.state.creditQjdInfo
    const isShowSelectView = this.state.isProject || this.state.isSupplier
    return (
      <View style={styles.container}>
        <NavBar
          title={'额度管理'}
          titleStyle={{ color: 'white' }}
          navBarStyle={{ backgroundColor: navBarBackgroundColor }}
          stateBarStyle={{ backgroundColor: navBarBackgroundColor }}
          navigation={navigation}
          leftIconColor={'white'}
          rightIconColor={'white'}
        />
        <View
          style={{
            backgroundColor: navBarBackgroundColor,
            width: DEVICE_WIDTH,
            height: isShowSelectView ? dp(260) : dp(160),
          }}
        >
          {isShowSelectView && this.selectView()}
        </View>
        <SectionList
          style={[
            styles.sectionList,
            {
              marginTop: isShowSelectView ? dp(280) + getStatusBarHeight() : dp(180) + getStatusBarHeight(),
              height: isShowSelectView
                ? DEVICE_HEIGHT - dp(280 + getStatusBarHeight())
                : DEVICE_HEIGHT - dp(180) + getStatusBarHeight(),
            },
          ]}
          stickySectionHeadersEnabled={false} // 关闭头部粘连
          ItemSeparatorComponent={() => this.itemSeparatorComponent()}
          renderItem={({ item, index, section }) =>
            (selectNum === '3' && index === 0) || (selectNum === '2' && index === 0) ? (
              this.separateView(item, index, section)
            ) : (
              <View key={index} style={styles.boxBG}>
                <View style={{}}>
                  <Text style={[styles.boxTitle, { color: item.status === 'DONE' ? '#2D2926' : '#A7ADB0' }]}>
                    {item.status === 'DONE' ? toAmountStr(item.money, 2, true) : '0.00'}
                  </Text>
                  <View style={styles.boxDecBG}>
                    <Text style={[styles.boxDecTitle, { color: item.status === 'DONE' ? '#2D2926' : '#A7ADB0' }]}>
                      {index === 0
                        ? selectNum === '2'
                          ? '总临时额度'
                          : `总授信额度 | ${
                              item.status === 'DONE' ? '生效中' : item.status === 'INVALID' ? '已失效' : '尚未获取'
                            }`
                        : index === 1
                        ? '可用授信额度   '
                        : index === 2
                        ? '使用中授信额度   '
                        : '冻结中授信额度   '}
                    </Text>
                    {((index === 3 && selectNum !== '2') || (index === 2 && selectNum !== '2')) && (
                      <Touchable
                        onPress={() => {
                          item.status === 'DONE' && this.clickDecList(item, index)
                        }}
                      >
                        <Text
                          style={[styles.boxDecListTitle, { color: item.status === 'DONE' ? '#2D2926' : '#A7ADB0' }]}
                        >
                          清单
                        </Text>
                      </Touchable>
                    )}
                  </View>
                </View>
                {index === 0 ? this.boxOneNoSupplierUI(item, index) : this.animatedCircularProgress(item, index)}
              </View>
            )
          }
          renderSectionFooter={({ section: { title, key1 } }) => this.renderSectionHeader(key1)}
          ListFooterComponent={this.listFooterComponent()}
          sections={sectionData}
          keyExtractor={(item, index) => item + index}
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

const styles = StyleSheet.create({
  footerTitle: {
    color: '#A7ADB0',
    fontSize: dp(24),
  },
  footerBG: {
    marginTop: dp(88),
    marginBottom: dp(218),
    alignItems: 'center',
    width: DEVICE_WIDTH,
  },
  headerBG: {
    height: dp(30),
    marginHorizontal: dp(30),
  },
  boxDecNoSupplierListTitle: {
    color: '#1A97F6',
    fontSize: dp(28),
    marginTop: dp(20),
  },
  boxNoSupplierBG: {
    alignItems: 'flex-end',
    position: 'absolute',
    marginLeft: dp(300),
    width: dp(350),
  },
  boxDecListTitle: {
    color: '#2D2926',
    fontSize: dp(28),
    textDecorationLine: 'underline',
  },
  boxDecTitle: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  boxDecBG: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dp(30),
  },
  boxTitle: {
    color: '#2D2926',
    fontSize: dp(48),
    fontWeight: 'bold',
  },
  boxBG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: dp(30),
    paddingHorizontal: dp(30),
    height: dp(208),
    backgroundColor: 'white',
    borderRadius: dp(16),
  },
  separatorComponent: {
    width: DEVICE_WIDTH,
    height: dp(30),
    backgroundColor: 'transparent',
    marginLeft: dp(30),
  },
  sectionList: {
    position: 'absolute',
    marginTop: dp(320),
    height: DEVICE_HEIGHT - dp(320),
  },
  separateDec: {
    color: '#1A97F6',
    fontSize: dp(28),
  },
  separateDecTitle: {
    color: '#2D2926',
    fontSize: dp(48),
    fontWeight: 'bold',
  },
  separateDecBG: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: dp(30),
  },
  separateTitle: {
    color: '#B7916C',
    fontSize: dp(32),
    fontWeight: 'bold',
    // numberOfLines: 1
  },
  separateBG: {
    marginHorizontal: dp(30),
    paddingHorizontal: dp(30),
    height: dp(208),
    backgroundColor: 'white',
    borderRadius: dp(16),
    justifyContent: 'center',
  },
  topBoxBG: {
    marginHorizontal: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
  },
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold',
  },
  bgView: {
    borderRadius: dp(36),
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dp(40),
  },
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
  }
}

export default connect(mapStateToProps)(QuotaManage)
