import React, { PureComponent } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, TouchableNativeFeedback, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import Iconfont from '../iconfont/Icon'
import { DEVICE_WIDTH, getRealDP as dp, isAndroid, getBottomSpace } from '../utils/screenUtil'
import Color from '../utils/Color'
import ajaxStore from '../utils/ajaxStore'
import store from '../store'
import { getCompanyTag } from '../actions'
import { checkLogin, checkCertification, checkCreadit } from '../utils/UserUtils'
import { supportProducts } from '../utils/enums'

class TabBarComponent extends PureComponent {
  // constructor (props) {
  //   super(props)
  //   this.state = {
  //     isVisible: true
  //   }
  // }

  // componentDidMount () {
  //   this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow)
  //   this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide)
  // }

  // componentWillUnmount () {
  //   this.keyboardWillShowSub.remove()
  //   this.keyboardWillHideSub.remove()
  // }

  // keyboardWillShow = event => {
  //   this.setState({
  //     isVisible: false
  //   })
  // }

  // keyboardWillHide = event => {
  //   this.setState({
  //     isVisible: true
  //   })
  // }

  render() {
    const { routes, index } = this.props.navigation.state
    const { navigation } = this.props
    return (
      <View style={styles.tab}>
        {routes.map((value, no) => (
          <BottomTabBar
            key={no}
            navigation={navigation}
            routeName={value.routeName}
            focused={index === no}
            contractNum={this.props.contractNum}
            loanNum={this.props.loanNum}
          />
        ))}
      </View>
    )
  }
}

class BottomTabBar extends PureComponent {
  checkCreate = async () => {
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

  @checkLogin
  @checkCertification
  @checkCreadit
  toPurchase(routeName) {
    this.props.navigation.navigate(routeName)
  }

  @checkLogin
  @checkCertification
  toOther(routeName) {
    this.props.navigation.navigate(routeName)
  }

  goPage(routeName) {
    if (routeName === 'Home') {
      this.props.navigation.navigate(routeName)
    } else if (routeName === 'Purchase') {
      this.toPurchase(routeName)
    } else {
      this.toOther(routeName)
    }
  }

  render() {
    const { routeName, focused } = this.props

    let tabBarLabel, tabBarFocusIconName, tabBarIconName, tabBarIconSize
    switch (routeName) {
      case 'Home':
        tabBarLabel = '首页'
        tabBarFocusIconName = 'shouye-dianliang'
        tabBarIconName = 'shouye-weidianliang'
        tabBarIconSize = dp(50)
        break
      case 'Pending':
        tabBarLabel = '待办'
        tabBarFocusIconName = 'daiban-dianliang'
        tabBarIconName = 'daiban-weidianliang'
        tabBarIconSize = dp(50)
        break
      // case 'CreatOrder':
      //   tabBarLabel = '创建订单'
      //   tabBarFocusIconName = 'tabbar_chuangjiandingdan'
      //   tabBarIconName = 'tabbar_chuangjiandingdan'
      //   tabBarIconSize = dp(96)
      //   break
      case 'Purchase':
        tabBarLabel = '采购'
        tabBarFocusIconName = 'caigou-dianliang'
        tabBarIconName = 'caigou-weidianliang'
        tabBarIconSize = dp(50)
        break
      case 'AccountSetting':
        tabBarLabel = '我的'
        tabBarFocusIconName = 'wode-dianliang1'
        tabBarIconName = 'wode-weidianliang1'
        tabBarIconSize = dp(50)
        break
      default:
        break
    }

    // if (routeName === 'CreatOrder') {
    //   return (
    //     <TouchableOpacity
    //       onPress={() => { this.checkCreate() }}
    //       activeOpacity={0.8}
    //       {...this.props}>
    //       <View style={styles.tabBarWrapper1}>
    //         <View style={styles.iconWrapper}>
    //           <Iconfont name={focused ? tabBarFocusIconName : tabBarIconName} size={tabBarIconSize} />
    //         </View>
    //         <Text style={[styles.tabBarLabel, { color: Color.TEXT_LIGHT, marginBottom: dp(10) }]}>
    //           {tabBarLabel}
    //         </Text>
    //       </View>
    //     </TouchableOpacity>
    //   )
    // }

    const tabBarColor = focused ? '#2A6EE7' : Color.TEXT_LIGHT
    let content = (
      <View style={styles.tabBarWrapper}>
        <View style={styles.iconWrapper}>
          <Iconfont name={focused ? tabBarFocusIconName : tabBarIconName} size={tabBarIconSize} />
        </View>
        <Text style={[styles.tabBarLabel, { color: tabBarColor }]}>{tabBarLabel}</Text>
      </View>
    )

    if (routeName === 'Pending') {
      content = (
        <View style={styles.tabBarWrapper}>
          <View style={styles.iconWrapper}>
            <Iconfont name={focused ? tabBarFocusIconName : tabBarIconName} size={tabBarIconSize} />
          </View>
          <Text style={[styles.tabBarLabel, { color: tabBarColor }]}>{tabBarLabel}</Text>
          {this.props.contractNum > 0 || this.props.loanNum > 0 ? <View style={styles.dot} /> : null}
        </View>
      )
    }

    if (isAndroid) {
      return (
        <TouchableNativeFeedback
          onPress={() => {
            this.goPage(routeName)
          }}
          background={TouchableNativeFeedback.Ripple('rgba(50,50,50,0.1)', true)}
          {...this.props}
        >
          {content}
        </TouchableNativeFeedback>
      )
    }
    return (
      <TouchableOpacity
        onPress={() => {
          this.goPage(routeName)
        }}
        activeOpacity={0.8}
        {...this.props}
      >
        {content}
      </TouchableOpacity>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    contractNum: state.user.contractNum,
    loanNum: state.user.loanNum,
    userInfo: state.user,
  }
}

export default connect(mapStateToProps)(TabBarComponent)

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    // backgroundColor: 'yellow',
    alignItems: 'flex-end',
    height: dp(130) + getBottomSpace(),
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
    paddingBottom: getBottomSpace(),
  },
  tabBarWrapper: {
    width: DEVICE_WIDTH / 4,
    height: dp(130),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  tabBarWrapper1: {
    width: DEVICE_WIDTH / 5,
    height: dp(163),
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: 'green'
  },
  tabBarLabel: {
    fontSize: dp(20),
    marginTop: dp(5),
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: dp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'red',
    borderRadius: dp(20),
    width: dp(13),
    height: dp(13),
    position: 'absolute',
    right: dp(60),
    top: dp(20),
  },
})
