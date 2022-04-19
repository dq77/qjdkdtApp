import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import {
  assign,
  injectUnmount,
  showToast,
  toAmountStr
} from '../../../utils/Utility'
import Iconfont from '../../../iconfont/Icon'
import { connect } from 'react-redux'
import ComfirmModal from '../../../component/ComfirmModal'
import { DashLine } from '../../../component/DashLine'
import ajaxStore from '../../../utils/ajaxStore'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

@injectUnmount
class SupplyService extends PureComponent {
  static defaultProps = {
    navigation: {}
  };

  static propTypes = {
    navigation: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () { }

  render () {
    const { navigation, companyInfo, userInfo, themeColor } = this.props
    return (
      <View style={styles.loanMain}>

        <View
          style={{
            backgroundColor: 'white',
            paddingTop: dp(40),
            marginHorizontal: dp(30),
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: dp(16),
            flexWrap: 'wrap',
            elevation: 3,
            shadowOffset: {
              width: 0,
              height: 0
            },
            shadowRadius: 4,
            shadowOpacity: 0.1
          }}>

          <Touchable
            onPress={() => {
              onClickEvent('采购管理-合同管理', 'home/SupplyService')
              this.props.navigation.navigate('ContractList')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_hetong.png')} />
              <Text style={styles.text}>
                合同管理
              </Text>
            </View>
          </Touchable>

          <Touchable
            onPress={() => {
              onClickEvent('采购管理-额度管理', 'home/SupplyService')
              this.props.navigation.navigate('QuotaManage')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_edu.png')} />
              <Text style={styles.text}>
              额度管理
              </Text>
            </View>
          </Touchable>

          <Touchable
            onPress={() => {
              onClickEvent('采购管理-项目准入', 'home/SupplyService')
              this.props.navigation.navigate('ProjectList')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_xiangmu.png')} />
              <Text style={styles.text}>
                项目准入
              </Text>
            </View>
          </Touchable>

          <Touchable
            onPress={() => {
              onClickEvent('采购管理-订单中心', 'home/SupplyService')
              this.props.navigation.navigate('Order')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_dingdan.png')} />
              <Text style={styles.text}>
                订单中心
              </Text>
            </View>
          </Touchable>
          <Touchable
            onPress={() => {
              onClickEvent('采购管理-支付货款', 'home/SupplyService')
              this.props.navigation.navigate('Loan')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_zhifu.png')} />
              <Text
                style={styles.text}>
                支付货款
              </Text>
            </View>
          </Touchable>

          <Touchable
            onPress={() => {
              onClickEvent('采购管理-还款货款', 'home/SupplyService')
              this.props.navigation.navigate('LoanBill')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_huankuan.png')} />
              <Text
                style={styles.text}>
                还款货款
              </Text>
            </View>
          </Touchable>
          <Touchable
            onPress={() => {
              onClickEvent('采购管理-会员中心', 'home/SupplyService')
              this.props.navigation.navigate('MemberCenter')
            }}>
            <View style={styles.item}>
              <Image style={styles.img} source={require('../../../images/p_huiyuan.png')} />
              <Text
                style={styles.text}>
                会员中心
              </Text>
            </View>
          </Touchable>

        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  loanInfoMain: {},
  title1Style: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    marginTop: dp(40),
    marginLeft: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5',
    marginTop: dp(40),
    marginRight: dp(30)
  },
  item: {
    alignItems: 'center',
    width: dp(172),
    marginBottom: dp(40)
  },
  img: {
    width: dp(80),
    height: dp(80)
  },
  text: { fontSize: dp(24), marginTop: dp(24), color: '#2D2926' }
})

const mapStateToProps = (state) => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(SupplyService)
