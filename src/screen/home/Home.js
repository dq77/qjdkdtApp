import React, { PureComponent } from 'react'
import { BackHandler, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import Swiper from 'react-native-swiper'
import { connect } from 'react-redux'
import { getAccountInfo, getCompanyInfo, getCompanyTag, getIsAudit, getLoanInfo, setSaasInfo } from '../../actions'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import { onClickEvent } from '../../utils/AnalyticsUtil'
import Color from '../../utils/Color'
import { creditMobileUrl, goodsImgUrl } from '../../utils/config'
import { DEVICE_WIDTH, getBottomSpace, getRealDP as dp } from '../../utils/screenUtil'
import { checkCertification, checkCreadit, checkLogin, updatePendingNum } from '../../utils/UserUtils'
import { handleBackPress, toAmountStr } from '../../utils/Utility'
import SixMonthData from '../mine/component/SixMonthData'
import LimitOverview from './component/LimitOverview'
import Notice from './component/Notice'
import TopBar from './component/TopBar'

/**
 * 主页
 */
class Home extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      messageListNum: 0,
      autoplay: true,
      bannerList: [],
      bulletinList: [],
      aiManageWarnData: {},
    }
    this.init = this.init.bind(this)
  }

  componentDidMount() {
    global.navigation = this.props.navigation
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      StatusBar.setBarStyle('dark-content')
      this.setState({ autoplay: true })
      this.init()
    })
    this.didBlurListener = this.props.navigation.addListener('didBlur', obj => {
      this.setState({ autoplay: false })
    })
    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.didBlurListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  loadBanner = async () => {
    const res = await ajaxStore.home.getBanner({
      noticeType: '1',
    })
    if (res.data && res.data.code === '0') {
      this.setState({
        bannerList: res.data.data,
      })
    }
  }

  async init() {
    this.setState({ refreshing: true })
    this.loadBanner()
    this.bulletinList()
    console.log(this.props.isLogin, 'this.props.isLogin')
    if (this.props.isLogin) {
      // 已登录
      this.getSaasInfo()
      await getCompanyInfo()
      // 消息数
      this.messageListData()
      const { userInfo, companyInfo } = this.props
      if (userInfo.memberApplyVO && userInfo.memberApplyVO.step === 1) {
        // 真实性验证通过
        await Promise.all([getIsAudit(), getCompanyTag(), getLoanInfo(), getAccountInfo()]).catch(() => {
          this.setState({ refreshing: false })
        })
        // 待办消息数
        updatePendingNum(companyInfo.companyId, companyInfo.legalPersonCertId)
        // 图表
        this.customerGetCustomerManageWarnVo()
        this.creditAll()
        this.creditSupplier()
      }
    }
    this.setState({ refreshing: false })
  }

  async creditSupplier() {
    const data = {
      pageNo: 1,
      pageSize: 100,
      companyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.credit.creditSupplier(data)
    if (res.data && res.data.code === '0') {
      const creditSupplierInfoList = res.data.data.pagedRecords || []
      const creditSupplierInfo = []
      creditSupplierInfoList.forEach((item, index) => {
        const dicData = {
          title: '1',
          key1: '3',
          data: [
            {
              money: item.availableLine || 0,
              rate: item.availableRate || 0,
              name: item.supplierInfo ? item.supplierInfo.name : '',
              status: item.status,
            },
            {
              money: item.usedLine || 0,
              rate: item.usedRate || 0,
              status: item.status,
            },
          ],
        }
        creditSupplierInfo.push(dicData)
      })
      this.setState({ creditSupplierInfo: creditSupplierInfo })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
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
              money: creditQjdInfo.availableLine || 0,
              rate: creditQjdInfo.availableRate || 0,
              status: creditQjdInfo.status,
            },
            {
              money: creditQjdInfo.usedLine || 0,
              rate: creditQjdInfo.usedRate || 0,
              status: creditQjdInfo.status,
            },
          ],
        },
      ]

      this.setState({ creditQjdInfo: creditQjdInfoData })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async customerGetCustomerManageWarnVo() {
    const data = {
      cifCompanyId: this.props.companyInfo.companyId,
    }
    const res = await ajaxStore.company.customerGetCustomerManageWarnVo(data)
    if (res.data && res.data.code === '0') {
      const aiManageWarn = res.data.data.aiManageWarn.data
      this.setState({
        aiManageWarnData: aiManageWarn || {},
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
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

  async bulletinList() {
    const data = {
      noticeType: 2,
    }
    const res = await ajaxStore.company.bulletinCarousel(data)
    if (res.data && res.data.code === '0') {
      const bulletinList = res.data.data
      this.setState({
        bulletinList,
      })
    }
  }

  onRefresh = async () => {
    await this.init()
  }

  renderImg = () => {
    var imageViews = []
    for (var i = 0; i < this.state.bannerList.length; i++) {
      const item = this.state.bannerList[i]
      imageViews.push(
        <Touchable
          key={i}
          style={{ borderRadius: dp(16), flex: 1, marginHorizontal: dp(30) }}
          onPress={() => {
            if (item.noticeLinkUrl) {
              onClickEvent('主页-banner', 'home/home', { noticeLinkUrl: item.noticeLinkUrl })
              this.props.navigation.navigate('WebView', { url: item.noticeLinkUrl, title: item.noticeName })
            }
          }}
        >
          <Image
            resizeMode={'cover'}
            style={{
              borderRadius: dp(16),
              width: DEVICE_WIDTH - dp(60),
              height: dp(390),
              flex: 1,
            }}
            // loadingIndicatorSource={require('../../images/default_error.png')}
            defaultSource={require('../../images/default_banner.png')}
            source={{
              uri: goodsImgUrl + item.noticePictureUrl.split('|')[0] + '&style=image/resize,m_fixed,w_690,h_390',
            }}
          />
        </Touchable>,
      )
    }
    return imageViews
  }

  async getSaasInfo() {
    const res = await ajaxStore.common.getSaasInfo()
    if (res.data && res.data.code === '0') {
      setSaasInfo(res.data.data)
    }
  }

  @checkLogin
  @checkCertification
  toPage(type) {
    switch (type) {
      case 'GuestTool': // 销售工具
        onClickEvent('主页-销售工具', 'home/home')
        this.props.navigation.navigate('GuestTool')
        break
      case 'crm': // CRM
        onClickEvent('主页-CRM', 'home/home')
        this.props.navigation.navigate('CrmList')
        break
      case 'qjy': // 千金眼
        onClickEvent('主页-仟金眼', 'home/home')
        this.props.navigation.navigate('WebView', { url: `${creditMobileUrl}/m/index`, title: '仟金眼' })
        break
      case 'data': // 数据服务
        onClickEvent('主页-数据看板', 'home/home')
        this.props.navigation.navigate('DataPage')
        break
      case 'projectManage': // 项目管理
        onClickEvent('主页-项目管理', 'home/home')
        this.props.navigation.navigate('ProjectManage')
        break
      case 'project':
        this.props.navigation.navigate('ProjectEvaluationList')
        break
      case 'erp':
        onClickEvent('主页-ERP服务', 'home/home')
        this.props.navigation.navigate('ERPTabs')
        break
      case 'saas':
        onClickEvent('主页-SAAS服务', 'home/home')
        this.props.navigation.navigate('SAASTabs')
        break
    }
  }

  @checkLogin
  @checkCertification
  @checkCreadit
  toCreditPage(type) {
    switch (type) {
      case 'Purchase': // 采购
        onClickEvent('主页-采购服务', 'home/home')
        this.props.navigation.navigate('Purchase')
        break
      case 'ContractList': // 电子签约
        onClickEvent('主页-电子签约', 'home/home')
        this.props.navigation.navigate('ContractList')
        break
    }
  }

  renderSupplier = () => {
    const supplierViews = []
    for (let index = 0; index < this.state.creditSupplierInfo.length; index++) {
      const element = this.state.creditSupplierInfo[index]
      const status = element.data[1].status
      const titleStatus =
        status === 'TODO'
          ? '未审批'
          : status === 'PROCESS'
          ? '审批中'
          : status === 'REJECT'
          ? '审批不通过'
          : status === 'DONE'
          ? '已生效'
          : status === 'INVALID'
          ? '失效'
          : ''
      const titleStatusColor =
        status === 'TODO'
          ? '#91969a'
          : status === 'PROCESS'
          ? '#fecd00'
          : status === 'REJECT'
          ? '#f55849'
          : status === 'DONE'
          ? '#2a6ee7'
          : status === 'INVALID'
          ? '#f55849'
          : ''
      supplierViews.push(
        <LimitOverview
          key={`${index}`}
          indexKey={`${index}`}
          titleStatus={titleStatus}
          titleStatusColor={titleStatusColor}
          paymentNum={element.data[1].rate}
          colorsStart={['#B4C4E3', '#7D92C2']}
          colorsEnd={['#ABA0FF', '#766DDB']}
          textTopFont={dp(24)}
          textTop={'违约占比'}
          title={element.data[0].name}
          num1={element.data[1].money}
          num2={element.data[0].money}
          type={2}
          dataType={3}
        />,
      )
    }
    return supplierViews
  }

  render() {
    const { navigation, companyInfo, saasInfo, isLogin } = this.props
    const { sequence, companyTag, accountInfo } = companyInfo

    const status = this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].status : ''
    const titleStatus =
      status === 'TODO'
        ? '未审批'
        : status === 'PROCESS'
        ? '审批中'
        : status === 'REJECT'
        ? '审批不通过'
        : status === 'DONE'
        ? '已生效'
        : status === 'INVALID'
        ? '失效'
        : ''
    const titleStatusColor =
      status === 'TODO'
        ? '#91969a'
        : status === 'PROCESS'
        ? '#fecd00'
        : status === 'REJECT'
        ? '#f55849'
        : status === 'DONE'
        ? '#2a6ee7'
        : status === 'INVALID'
        ? '#f55849'
        : 'transparent'
    return (
      <View style={styles.container}>
        <TopBar
          title={this.props.isLogin ? null : '欢迎使用仟金顶'}
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
            {/* banner */}
            {this.state.bannerList.length > 0 ? (
              <Swiper
                height={dp(390)}
                loop={true}
                index={0}
                autoplay={this.state.autoplay}
                horizontal={true}
                autoplayTimeout={6}
                showsPagination={true}
                removeClippedSubviews={false}
                paginationStyle={{ marginBottom: dp(-30) }}
                dotColor={'#a0a0a0'}
                // onIndexChanged={index => { console.log('index', index) }}
              >
                {this.renderImg()}
              </Swiper>
            ) : null}

            {this.state.bulletinList.length > 0 && (
              <Notice navigation={this.props.navigation} bulletinList={this.state.bulletinList} />
            )}
            <Text style={styles.title}>常用应用</Text>
            <View style={styles.appBg}>
              {saasInfo.saasList.length || !isLogin ? (
                <Touchable onPress={() => this.toPage('saas')}>
                  <View style={styles.appItem}>
                    <Image style={styles.img} source={require('../../images/home_saas.png')} />
                    <Text style={styles.appText}>厂家采购</Text>
                  </View>
                </Touchable>
              ) : null}
              <Touchable onPress={() => this.toCreditPage('Purchase')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_caigou.png')} />
                  <Text style={styles.appText}>采购服务</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('GuestTool')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_huoke.png')} />
                  <Text style={styles.appText}>销售工具</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('data')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_shuju.png')} />
                  <Text style={styles.appText}>数据看板</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toCreditPage('ContractList')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_qianyue.png')} />
                  <Text style={styles.appText}>电子签约</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('erp')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_erp.png')} />
                  <Text style={styles.appText}>ERP服务</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('crm')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_crm.png')} />
                  <Text style={styles.appText}>CRM</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('projectManage')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_project.png')} />
                  <Text style={styles.appText}>项目管理</Text>
                </View>
              </Touchable>
              <Touchable onPress={() => this.toPage('qjy')}>
                <View style={styles.appItem}>
                  <Image style={styles.img} source={require('../../images/home_qjy.png')} />
                  <Text style={styles.appText}>仟金眼</Text>
                </View>
              </Touchable>
            </View>
            <Text style={[styles.title, { marginBottom: this.props.isLogin ? 0 : dp(40) }]}>额度展示</Text>
            {this.props.isLogin ? (
              <SixMonthData
                key={'1'}
                title={'近6个月出货金额'}
                num1Name={'累计出货金额'}
                num1={`${
                  this.state.aiManageWarnData && this.state.aiManageWarnData.shipmentTotalAmount
                    ? toAmountStr(this.state.aiManageWarnData.shipmentTotalAmount / 10000, 2, true)
                    : 0
                }`}
                creditSaleInfo={this.state.aiManageWarnData ? this.state.aiManageWarnData.creditSaleInfo : []}
                type={1}
                dataType={5}
              />
            ) : (
              <Touchable onPress={() => global.navigation.navigate('Login')}>
                <Image style={styles.noLoginImg} source={require('../../images/chuhuoedu.jpg')} />
              </Touchable>
            )}
            <Text style={[styles.title, { marginBottom: this.props.isLogin ? 0 : dp(40) }]}>额度总览</Text>
            {this.props.isLogin ? (
              <LimitOverview
                key={'7'}
                titleStatus={titleStatus}
                titleStatusColor={titleStatusColor}
                paymentNum={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].rate : 0}
                colorsStart={['#B4C4E3', '#7D92C2']}
                colorsEnd={['#79A5F2', '#2A6EE7']}
                textTopFont={dp(24)}
                textTop={'违约占比'}
                title={'仟金顶额度'}
                num1={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[1].money : 0}
                num2={this.state.creditQjdInfo ? this.state.creditQjdInfo[0].data[0].money : 0}
                type={2}
                dataType={3}
              />
            ) : (
              <Touchable onPress={() => global.navigation.navigate('Login')}>
                <Image
                  style={[styles.noLoginImg, { height: dp(360) }]}
                  source={require('../../images/qianjindingedu.jpg')}
                />
              </Touchable>
            )}

            {this.props.isLogin ? (
              this.state.creditSupplierInfo && this.renderSupplier()
            ) : (
              <Touchable onPress={() => global.navigation.navigate('Login')}>
                <Image
                  style={[styles.noLoginImg, { height: dp(368), marginTop: dp(40) }]}
                  source={require('../../images/changjiiaedu.jpg')}
                />
              </Touchable>
            )}

            <View style={styles.end}>
              <Text style={styles.endText}>—— 页面到底了 ——</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noLoginImg: {
    width: dp(690),
    height: dp(540),
    marginHorizontal: (DEVICE_WIDTH - dp(690)) / 2,
    borderRadius: dp(16),
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
  },
  pageMain: {
    paddingTop: dp(20),
    // paddingHorizontal: dp(30)
  },
  title: {
    color: '#2D2926',
    fontSize: dp(32),
    marginTop: dp(74),
    fontWeight: 'bold',
    marginBottom: dp(40),
    marginHorizontal: dp(30),
  },
  appBg: {
    width: dp(690),
    backgroundColor: 'white',
    borderRadius: dp(16),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: dp(10),
    marginHorizontal: dp(30),
  },
  appItem: {
    width: dp(172),
    alignItems: 'center',
    height: dp(190),
    // flex: 1,
    justifyContent: 'center',
  },
  appText: {
    color: '#2D2926',
    fontSize: dp(24),
    marginTop: dp(20),
  },
  img: {
    width: dp(88),
    height: dp(88),
  },
  end: {
    alignItems: 'center',
    marginBottom: dp(58) + getBottomSpace(),
    marginTop: dp(55) + getBottomSpace(),
  },
  endText: {
    fontSize: dp(24),
    color: '#A7ADB0',
  },
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    isLogin: state.user.isLogin,
    userInfo: state.user.allUserInfo,
    saasInfo: state.user.saas,
  }
}

export default connect(mapStateToProps)(Home)
