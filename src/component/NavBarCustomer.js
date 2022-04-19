import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import { StackActions } from 'react-navigation'
import { connect } from 'react-redux'
import Iconfont from '../iconfont/Icon'
import Color from '../utils/Color'
import { customerServiceUrl } from '../utils/config'
import Dimen from '../utils/Dimen'
import { getRealDP as dp, getStatusBarHeight, isAndroid } from '../utils/screenUtil'
import Touchable from './Touchable'

const propTypes = {
  title: PropTypes.string,
  titleView: PropTypes.func,
  titleStyle: PropTypes.object,
  rightIconStyle: PropTypes.object,
  leftIcon: PropTypes.string,
  leftIconSize: PropTypes.number,
  leftIconColor: PropTypes.string,
  onLeftPress: PropTypes.func,
  rightIcon: PropTypes.string,
  rightIconList: PropTypes.array,
  rightText: PropTypes.string,
  rightIconSize: PropTypes.number,
  rightIconColor: PropTypes.string,
  onRightPress: PropTypes.func,
  navigation: PropTypes.object.isRequired,
  stateBarStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
  navBarStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
}
const defaultProps = {
  title: '',
  titleStyle: {},
  rightIconStyle: {},
  isReturnRoot: '', // 需要直接返回到顶部的时候设置为1，默认返回上一个路由
  leftIcon: 'fanhui',
  leftIconSize: dp(50),
  leftIconColor: '#333333',
  rightIconSize: dp(60),
  rightIconColor: '#333333',
  noStatusBarHeight: false,
  stateBarStyle: {},
  navBarStyle: {},
  rightIcon: 'navibar_kefu',
  rightIconList: [],
  rightText: '',
  rightTextColor: '#1A97F6',
  rightTextSize: dp(30),
  onRightPress: () => {
    global.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${'客户'}`,
    })
  },
}

const feedBackBackground = TouchableNativeFeedback.Ripple('rgba(50,50,50,0.3)', true)

/**
 * NavBar 导航头组件
 */
class NavBarCustomer extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleLeftBtnClick = this.handleLeftBtnClick.bind(this)
  }

  handleLeftBtnClick() {
    const { onLeftPress, navigation, isReturnRoot } = this.props
    if (onLeftPress && typeof onLeftPress === 'function') {
      return onLeftPress()
    }
    if (isReturnRoot === '1') {
      return navigation.dispatch(StackActions.popToTop())
    } else {
      return navigation.goBack()
    }
  }

  render() {
    const {
      titleStyle,
      leftIcon,
      leftIconColor,
      rightIconColor,
      rightIconList,
      rightIcon,
      rightText,
      rightTextColor,
      rightTextSize,
      titleView,
      title,
      onRightPress,
      elevation,
      leftIconSize,
      rightIconSize,
      stateBarStyle,
      navBarStyle,
      rightIconStyle,
      num,
    } = this.props
    return (
      <View>
        <View style={[styles.statebar, stateBarStyle]} />
        <View style={[styles.container, elevation, navBarStyle]}>
          {/* 左侧按钮 */}
          <Touchable isNativeFeedback={isAndroid} background={feedBackBackground} onPress={this.handleLeftBtnClick}>
            <View style={styles.iconWrapper}>
              {leftIcon === 'none' ? <View /> : <Iconfont name={leftIcon} size={leftIconSize} color={leftIconColor} />}
              {num && num.toString() !== '0' && (
                <View style={styles.numBGView}>
                  <Text style={styles.numText}>{num}</Text>
                </View>
              )}
            </View>
          </Touchable>

          {/* 中间标题 */}
          {titleView ? (
            titleView()
          ) : (
            <View style={styles.titleWrapper}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, titleStyle]}>
                {title}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          {/* 右侧按钮 */}
          {rightIconList.length ? (
            rightIconList.map((item, key) => {
              return (
                <Touchable
                  key={key}
                  isNativeFeedback={isAndroid}
                  background={feedBackBackground}
                  onPress={item.onPress}
                >
                  <View style={[styles.iconWrapper, rightIconStyle]}>
                    <Iconfont name={item.icon} size={rightIconSize} color={rightIconColor} />
                  </View>
                </Touchable>
              )
            })
          ) : rightIcon ? (
            <Touchable isNativeFeedback={isAndroid} background={feedBackBackground} onPress={onRightPress}>
              <View style={[styles.iconWrapper, rightIconStyle]}>
                <Iconfont name={rightIcon} size={rightIconSize} color={rightIconColor} />
              </View>
            </Touchable>
          ) : rightText ? (
            <Touchable isNativeFeedback={isAndroid} background={feedBackBackground} onPress={onRightPress}>
              <View style={[styles.rightBGText]}>
                <Text style={{ color: rightTextColor, fontSize: rightTextSize }}>{rightText}</Text>
              </View>
            </Touchable>
          ) : (
            <View style={styles.iconWrapper} />
          )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F9',
    height: Dimen.BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dp(28),
  },
  numBGView: {
    backgroundColor: '#F55849',
    minWidth: dp(36),
    height: dp(36),
    borderRadius: dp(18),
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: dp(24),
    paddingHorizontal: dp(5),
  },
  numText: {
    color: 'white',
    fontSize: dp(24),
  },
  statebar: {
    backgroundColor: '#F7F7F9',
    height: getStatusBarHeight(),
  },
  titleWrapper: {
    // width: DEVICE_WIDTH - dp(260),
    // flex: 1,
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: dp(38),
    color: Color.TEXT_MAIN,
    maxWidth: dp(480),
  },
  rightBGText: {
    height: dp(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    height: dp(60),
    width: dp(60),
    borderRadius: dp(30),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  myPhoto: {
    height: dp(58),
    width: dp(58),
    borderRadius: dp(29),
    borderWidth: dp(2),
    borderColor: Color.WHITE,
  },
})

NavBarCustomer.propTypes = propTypes
NavBarCustomer.defaultProps = defaultProps

const mapStateToProps = (state) => {
  return {
    // isLogin: state.user.isLogin,
    themeColor: state.user.themeColor,
  }
}

export default connect(mapStateToProps)(NavBarCustomer)
