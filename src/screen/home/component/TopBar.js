import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { getRealDP as dp, getStatusBarHeight, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Iconfont from '../../../iconfont/Icon'
import CustomerService from '../../../component/CustomerService'
import { connect } from 'react-redux'
import Dimen from '../../../utils/Dimen'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import Touchable from '../../../component/Touchable'
import { checkLogin, checkCertification, checkCreadit } from '../../../utils/UserUtils'
export class TopBar extends PureComponent {
  @checkLogin
  @checkCertification
  @checkCreadit
  goMessage () {
    onClickEvent('主页-消息中心', 'home/TopBar')
    this.props.navigation.navigate('MessageCenter')
  }

  render () {
    const { messageListNum } = this.props
    // console.log(messageListNum, 'messageListNum')
    const num = messageListNum.toString()
    const shownNum = parseInt(messageListNum) > 99 ? '99' : messageListNum.toString()

    return (
      <View style={styles.container}>
        <Touchable isNativeFeedback={false} >
          <View style={{ flexDirection: 'row', alignItems: 'center', width: DEVICE_WIDTH - dp(250) }}>
            <Text style={[styles.name, this.props.titleColor]} numberOfLines={1}>{this.props.title || this.props.userInfo.corpName || this.props.companyInfo.corpName}</Text>
          </View>
        </Touchable>
        <View style={styles.rightBtn}>
          <Touchable isNativeFeedback={true} onPress={() => this.goMessage()}>
            <View style={styles.inform}>
              <Iconfont color={this.props.msgColor} style={styles.my} size={dp(60)} name={'navibar_xiaoxi'} />
              {num && parseInt(num) > 0 && <View style={[styles.red, { width: num.length === 1 ? dp(32) : dp(46), right: num.length === 1 ? dp(-10) : dp(-22), top: num.length === 1 ? dp(-6) : dp(-8) }]}>
                <Text style={styles.redText}>{shownNum}</Text>
              </View>}
            </View>
          </Touchable>
          <CustomerService style={styles.service} color={this.props.msgColor} navigation={this.props.navigation} showText={false} />
        </View>
      </View >
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(TopBar)

const styles = StyleSheet.create({
  container: {
    height: Dimen.BAR_HEIGHT + getStatusBarHeight(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: getStatusBarHeight(),
    paddingLeft: dp(30),
    paddingRight: dp(20)
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  my: {
    paddingHorizontal: dp(20)
  },
  name: {
    fontSize: dp(36),
    marginLeft: dp(8),
    fontWeight: 'bold',
    flex: 1
  },
  inform: {
    width: dp(64),
    height: dp(64),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: dp(10),
    marginLeft: dp(30)
  },
  red: {
    backgroundColor: 'red',
    borderRadius: dp(16),
    height: dp(32),
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redText: {
    fontSize: dp(24),
    color: '#FFFFFF',
    textAlign: 'center'
  },
  service: {
    // paddingHorizontal: dp(10)
  }
})
