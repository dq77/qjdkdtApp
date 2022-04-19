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

class ERPTabBarComponent extends PureComponent {
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
      // this.state.isVisible
      //   ?
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
  goPage(routeName) {
    this.props.navigation.navigate(routeName)
  }

  render() {
    const { routeName, focused } = this.props

    let tabBarLabel, tabBarFocusIconName, tabBarIconName, tabBarIconSize
    switch (routeName) {
      case 'SupplierList':
        tabBarLabel = '供应商'
        tabBarFocusIconName = 'daiban-dianliang'
        tabBarIconName = 'daiban-weidianliang'
        tabBarIconSize = dp(50)
        break
      case 'ProductList':
        tabBarLabel = '产品'
        tabBarFocusIconName = 'caigou-dianliang'
        tabBarIconName = 'caigou-weidianliang'
        tabBarIconSize = dp(50)
        break
      case 'ERPOrderList':
        tabBarLabel = '订单'
        tabBarFocusIconName = 'wode-dianliang1'
        tabBarIconName = 'wode-weidianliang1'
        tabBarIconSize = dp(50)
        break
      default:
        break
    }

    const tabBarColor = focused ? '#2A6EE7' : Color.TEXT_LIGHT
    const content = (
      <View style={styles.tabBarWrapper}>
        <View style={styles.iconWrapper}>
          <Iconfont name={focused ? tabBarFocusIconName : tabBarIconName} size={tabBarIconSize} />
        </View>
        <Text style={[styles.tabBarLabel, { color: tabBarColor }]}>{tabBarLabel}</Text>
      </View>
    )

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
    userInfo: state.user,
  }
}

export default connect(mapStateToProps)(ERPTabBarComponent)

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: dp(130) + getBottomSpace(),
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
    paddingBottom: getBottomSpace(),
  },
  tabBarWrapper: {
    width: DEVICE_WIDTH / 3,
    height: dp(130),
    justifyContent: 'center',
    alignItems: 'center',
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
})
