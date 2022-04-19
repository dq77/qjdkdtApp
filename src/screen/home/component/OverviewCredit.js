import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount, showToast, toAmountStr } from '../../../utils/Utility'
import Iconfont from '../../../iconfont/Icon'
import { connect } from 'react-redux'
import ComfirmModal from '../../../component/ComfirmModal'
import { DashLine } from '../../../component/DashLine'
import ajaxStore from '../../../utils/ajaxStore'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

@injectUnmount
class OverviewCredit extends PureComponent {
  static defaultProps = {
    comfirm: function () { },
    navigation: {}
  }

  static propTypes = {
    comfirm: PropTypes.func,
    navigation: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      selectNum: '1'
    }
  }

  componentDidMount () {
  }

  _Comfirm (type) {
    this.props.confirm && this.props.confirm(type)
  }

  selectNum (type) {
    this.setState({
      selectNum: type
    })
    this._Comfirm(type)
  }

  render () {
    const { navigation, companyInfo, userInfo, themeColor } = this.props
    return (
      <View style={styles.loanMain}>
        <Text style={styles.title2Style}>赊销数据总览</Text>
        <View style={{ marginHorizontal: dp(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
          <Touchable onPress={() => this.selectNum('1')}>
            <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '1' ? 'white' : '#F7F7F9' }]} >
              <Text style={[styles.title1Style, { color: this.state.selectNum === '1' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '1' ? 'bold' : 'normal' }]}>本月</Text>
            </View>
          </Touchable>
          <Touchable onPress={() => this.selectNum('2')}>
            <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '2' ? 'white' : '#F7F7F9' }]} >
              <Text style={[styles.title1Style, { color: this.state.selectNum === '2' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '2' ? 'bold' : 'normal' }]}>本季度</Text>
            </View>
          </Touchable>
          <Touchable onPress={() => this.selectNum('3')}>
            <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '3' ? 'white' : '#F7F7F9' }]} >
              <Text style={[styles.title1Style, { color: this.state.selectNum === '3' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '3' ? 'bold' : 'normal' }]}>本年</Text>
            </View>
          </Touchable>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  loanMain: {
  },
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold'
  },
  title2Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold',
    marginLeft: dp(30)
  },
  bgView: {
    borderRadius: dp(36),
    width: dp(230),
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dp(40)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(OverviewCredit)
