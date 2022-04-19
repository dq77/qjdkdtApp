import React, { PureComponent } from 'react'
import { View, StyleSheet, SectionList, Text, Dimensions } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import ajaxStore from '../../utils/ajaxStore'
import {
  getCompanyInfo
} from '../../actions'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'

const renderTabBar = props => (
  <TabBar
    {...props}
    labelStyle={{}}
    contentContainerStyle={{}}
    indicatorContainerStyle={{}}
    tabStyle={{ width: DEVICE_WIDTH / 4 }}
    indicatorStyle={{
      backgroundColor: 'white',
      height: dp(64),
      width: dp(165),
      borderRadius: dp(82.5),
      marginLeft: dp(10),
      marginBottom: dp(20),
      shadowColor: '#E7EBF2',
      shadowOpacity: 0.5,
      elevation: 0,
      shadowOffset: { height: dp(10), width: dp(10) }
    }}
    style={{
      backgroundColor: '#F7F7F9',
      shadowColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      shadowOffset: { height: 0, width: 0 },
      height: dp(100)
    }}
    renderLabel={({ route, focused, color }) => (
      <View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: DEVICE_WIDTH / 4
        }}>
          <Text style={{
            fontSize: dp(28),
            color: focused ? '#353535' : '#a5a5a5',
            fontWeight: focused ? 'bold' : 'normal'
          }}>
            {`${route.title}`}
          </Text>
          {route.num !== 0 && <Text style={{
            fontSize: dp(20),
            color: focused ? '#353535' : '#a5a5a5'
          }}>
            {`${focused ? '' : route.num}`}
          </Text>}
        </View>
        {focused && route.num !== 0 && <View style={{
          backgroundColor: Color.RED,
          minWidth: dp(32),
          minHeight: dp(32),
          borderRadius: dp(16),
          marginTop: -dp(13),
          position: 'absolute',
          marginLeft: dp(135),
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: dp(24),
            color: 'white'
          }}>
            {route.num}
          </Text>
        </View>}
      </View>
    )}
  />
)
const initialLayout = { width: Dimensions.get('window').width }
class IntroducPackage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      dataNormal: [],
      dataUse: [],
      dataOver: [],
      dataReceive: [],
      data: [],
      index: 0
    }
  }

  componentDidMount () {
    this.configData()
  }

  configData () {
    this.couponFind('1')
    this.couponFind('2')
    this.couponFind('3')
    this.marketFind()
  }

  // 优惠券列表1: 正常 2. 已使用 3. 过期
  async couponFind (type) {
    let data = {}
    if (type === '1') {
      data = {
        timeBetween: true,
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        orderBy: 'endTime',
        pageNo: '1',
        pageSize: '100'
      }
    } else if (type === '2') {
      data = {
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        orderBy: 'endTime',
        pageNo: '1',
        pageSize: '100'
      }
    } else if (type === '3') {
      data = {
        state: type, // 状态， 1: 正常 2. 已使用 3. 过期
        order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
        pageNo: '1',
        orderBy: 'endTime',
        pageSize: '100'
      }
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      switch (type) {
        case '1':
          this.setState({
            dataNormal: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords : []
          })
          break
        case '2':
          this.setState({
            dataUse: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords : []
          })
          break
        case '3':
          this.setState({
            dataOver: res.data.data.pagedRecords.length > 0 ? res.data.data.pagedRecords : []
          })
          break
        default:
          break
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 查询可用优惠券列表
  async marketFind () {
    const { companyInfo } = this.props
    const data = {
      timeBetween: true,
      marketCate: '2', // 1 会员费直降 2 优惠券 不传则全部查出来
      // level: companyInfo.vipLevelCode, // 当前会员的等级
      pageNo: '1',
      pageSize: '100',
      orderBy: 'end_time',
      order: 'ASC'// asc 升序， desc 降序
    }
    console.log('可用优惠券列表1')
    const res = await ajaxStore.company.marketFind(data)
    console.log('可用优惠券列表2', res.data.data)
    if (res.data && res.data.code === '0') {
      this.setState({
        dataReceive: res.data.data.pagedRecords
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 点击领取可用优惠券
  async clickReceive (item) {
    const { companyInfo } = this.props
    const data = {
      marketId: item.id, // 活动id
      level: companyInfo.vipLevelCode, // 参与人等级
      // dealer: item., // 参与人唯一标识
      path: 'boss' // 参与来源
    }
    const res = await ajaxStore.company.marketJoin(data)
    if (res.data && res.data.code === '0') {
      this.configData()
      global.alert.show({
        title: '领取成功',
        content: '您可在“可使用”中查看优惠券信息'
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 1.开使用  2.已使用   3.已失效   4.可领取
  sectionList (useType) {
    return <SectionList
      //  stickySectionHeadersEnabled={false}// 关闭头部粘连
      renderItem={
        ({ item, index, section }) =>
          <View key={index}>
            <View style={{ backgroundColor: 'white', borderStyle: 'dashed', borderWidth: dp(1), borderColor: '#C7C7D6', borderRadius: dp(16), marginHorizontal: dp(30), marginTop: dp(30) }}>
              <View style={{ width: dp(690), flexDirection: 'row', alignItems: 'center' }}>
                <View style = {{ width: dp(290) }}>
                  <View style = {[styles.BGTitle, { opacity: useType === '3' ? 0.5 : 1, backgroundColor: useType === '2' ? '#91969A' : '#F55849' }]}>
                    <Text style = {[styles.textTitleStyle, {}]}>现金抵扣券</Text>
                  </View>
                  <Text style = {[styles.textMoneyStyle, { fontSize: item.price >= 1000 ? dp(50) : dp(80), color: useType === '2' ? '#91969A' : '#F55849', opacity: useType === '3' ? 0.5 : 1 }]}>￥{parseInt(item.price)}</Text>
                </View>
                <View style = {{ marginVertical: dp(40), width: dp(400) }}>
                  <Text style = {[styles.textTipStyle, { color: (useType === '2' || useType === '3') ? '#91969A' : '#2D2926' }]}>到期日期：{item.endTime}</Text>
                  <Text style = {[styles.textTipStyle, { marginTop: dp(15), color: (useType === '2' || useType === '3') ? '#91969A' : '#2D2926' }]}>抵扣范围：{item.scene === '2' ? '会员升级续费抵扣会员费' : '还款时抵扣服务费'}</Text>
                  <Text style = {[styles.textTipStyle, { marginTop: dp(15), color: (useType === '2' || useType === '3') ? '#91969A' : '#2D2926' }]}>票券来源：{useType === '4' ? item.name : item.marketName}</Text>
                </View>
              </View>
              {useType === '4' && <Touchable isNativeFeedback={true} onPress={() => {
                this.clickReceive(item)
              }} >
                <View style = {{ borderStyle: 'dashed', borderWidth: dp(1), borderColor: '#C7C7D6', width: dp(690), alignItems: 'center', borderBottomLeftRadius: dp(16), borderBottomRightRadius: dp(16) }}>
                  <Text style = {styles.textClickStyle}>点击领取</Text>
                </View>
              </Touchable>}
            </View>
            <Iconfont style={{ position: 'absolute', marginLeft: DEVICE_WIDTH - dp(208), marginTop: dp(30) }} name={useType === '2' ? 'yishiyong2x' : useType === '3' ? 'yishixiao2x' : '' } size={dp(158)} />
          </View>
      }
      // renderSectionHeader={
      //   ({ section: { title } }) => (
      //     this.couponTip()
      //   )}
      sections={[
        { title: 'Title1', data: useType === '1' ? this.state.dataNormal : useType === '2' ? this.state.dataUse : useType === '3' ? this.state.dataOver : this.state.dataReceive }
      ]}

      keyExtractor={(item, index) => item + index}
    />
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'      优惠卡包'} navigation={navigation} navBarStyle={{ marginRight: dp(50) }} rightIconSize={dp(150)} rightIconColor={'#1A97F6'} rightIcon={'youhuiquanguize2x1'} onRightPress={
          () => {
            this.props.navigation.navigate('CouponUsageRule')
          }
        }/>

        <TabView
          navigationState={{
            index: this.state.index,
            routes: [
              { key: 'dataNormal', title: '可使用', num: this.state.dataNormal.length > 0 ? this.state.dataNormal.length : 0 },
              { key: 'dataUse', title: '已使用', num: this.state.dataUse.length > 0 ? this.state.dataUse.length : 0 },
              { key: 'dataOver', title: '已失效', num: this.state.dataOver.length > 0 ? this.state.dataOver.length : 0 },
              { key: 'dataReceive', title: '可领取', num: this.state.dataReceive.length > 0 ? this.state.dataReceive.length : 0 }
            ]
          }}
          renderScene={({ route }) => {
            if (route.key === 'dataNormal') {
              return this.sectionList('1')
            } else if (route.key === 'dataUse') {
              return this.sectionList('2')
            } else if (route.key === 'dataOver') {
              return this.sectionList('3')
            } else if (route.key === 'dataReceive') {
              return this.sectionList('4')
            }
          }}
          onIndexChange={(index) => this.setState({ index })}
          initialLayout={initialLayout}
          renderTabBar={renderTabBar}
        // style={{ backgroundColor: 'red' }}
        />

      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  containerSB: {
    height: dp(100)
  },
  containerS: {
    flex: 1
    // backgroundColor: '#F5FCFF'
  },
  lineStyle: {
    marginLeft: (DEVICE_WIDTH / 4 - dp(90)) / 2,
    width: dp(90),
    height: dp(3),
    backgroundColor: '#3B3C5A'
  },
  tabBarText: {
    fontSize: dp(30),
    textAlign: 'center',
    paddingVertical: dp(35)
  },
  tipTextStyle: {
    color: '#9A9A9A',
    paddingLeft: dp(36),
    fontSize: dp(24)
  },
  tipBGStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: DEVICE_WIDTH,
    height: dp(44),
    backgroundColor: '#FEF8E3'
  },
  itemCouponBG: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  couponBG: {
    marginTop: dp(30),
    height: dp(320)
  },
  textTitleStyle: {
    color: 'white',
    fontSize: dp(24)
  },
  textTipStyle: {
    marginLeft: dp(0),
    color: '#2D2926',
    fontSize: dp(24),
    maxWidth: dp(380)
  },
  textMoneyStyle: {
    marginTop: dp(16),
    marginLeft: dp(30),
    color: '#F55849',
    fontWeight: 'bold'
  },
  textStatusStyle: {
    marginTop: dp(52),
    marginRight: dp(60),
    color: 'white',
    fontSize: dp(20),
    textAlign: 'right'
  },
  textClickStyle: {
    color: '#2D2926',
    fontSize: dp(32),
    marginVertical: dp(30)
  },
  clickBGStyle: {
    // marginHorizontal: dp(30),
    height: dp(92),
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(16),
    borderStyle: 'dashed',
    width: dp(300)

  },
  BGTitle: {
    // marginTop: dp(40),
    marginLeft: dp(46),
    backgroundColor: '#F55849',
    width: dp(144),
    height: dp(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(8)
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(IntroducPackage)
