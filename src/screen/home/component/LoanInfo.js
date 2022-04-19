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
class LoanInfo extends PureComponent {
  static defaultProps = {
    navigation: {}
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      fill: 0,
      supplierFill: 0,
      deadLineStr: ''
    }
    this.clearAccount = this.clearAccount.bind(this)
  }

  async clearAccount () {
    const res = await ajaxStore.company.clearAccount()
    if (res.data && res.data.code === '0') {
      // this.props.refresh()
      this.props.navigation.navigate('AddSupplier', { source: 'Home' })
    }
  }

  static getDerivedStateFromProps (nextProps) {
    const loanInfo = nextProps.companyInfo.loanInfo || ''
    let deadLineStr
    if (loanInfo.creditLine || loanInfo.supplierCreditLine) {
      // console.log(loanInfo)
      deadLineStr = loanInfo.replyDeadLine
        ? new Date(loanInfo.replyDeadLine) > new Date()
          ? `有效期至 ${loanInfo.replyDeadLine}`
          : '授信额度已到期'
        : '暂无授信额度到期日'
      let rate = loanInfo.creditLine !== 0 ? loanInfo.availableLine / loanInfo.creditLine * 100 : 0
      let supplierRate = loanInfo.supplierCreditLine !== 0 ? loanInfo.supplierAvailableLine / loanInfo.supplierCreditLine * 100 : 0
      rate = rate > 99 && rate < 100 ? 99 : Math.round(rate)
      supplierRate = supplierRate > 99 && supplierRate < 100 ? 99 : Math.round(supplierRate)
      return {
        fill: loanInfo.creditLine === 0 ? 0 : rate,
        supplierFill: loanInfo.supplierCreditLine === 0 ? 0 : supplierRate,
        deadLineStr
      }
    } else {
      return null
    }
  }

  componentDidMount () {
  }

  render () {
    const { navigation, companyInfo, userInfo, themeColor } = this.props
    const loanInfo = companyInfo.loanInfo || ''
    console.log(loanInfo, 'companyInfoaaaaaa')
    return (
      <View style={styles.loanMain}>
        {(loanInfo.availableLine || loanInfo.availableLine === 0) && (loanInfo.creditLine || loanInfo.creditLine === 0) &&
          <View style={styles.loanInfoMain}>
            <View style={styles.loanDetail}>
              <AnimatedCircularProgress
                rotation={0}
                style={styles.progress}
                size={dp(200)}
                width={dp(15)}
                fill={this.state.fill}
                tintColor={themeColor}
                lineCap={'round'}
                backgroundColor={Color.DEFAULT_BG}>
                {(fill) => (
                  <View>
                    <Text style={styles.progressText}>{`${parseFloat(fill).toFixed(0)}%`}</Text>
                    <Text style={{ color: Color.THEME, transform: [{ scaleX: -1 }] }}>{'授信额度'}</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              <View style={styles.loanQuota}>
                <Text style={{ ...styles.allCreditLine, ...styles.lineTitle }}>总授信额度</Text>
                {companyInfo.loanInfo.creditLine > 99999999.99 ? (
                  <Text style={{ ...styles.allCreditLine, ...styles.lineNumber, ...styles.marginBottom, ...styles.smallLineNumber }}>{toAmountStr(companyInfo.loanInfo.creditLine, 2, true)}</Text>
                ) : (
                  <Text style = {{ ...styles.allCreditLine, ...styles.lineNumber, ...styles.marginBottom }}>{toAmountStr(companyInfo.loanInfo.creditLine, 2, true)}</Text>
                )}
                <Text style={{ ...styles.usableCreditLine, ...styles.lineTitle }}>可用授信额度</Text>
                {companyInfo.loanInfo.availableLine > 99999999.99 ? (
                  <Text style={{ ...styles.usableCreditLine, ...styles.lineNumber, ...styles.smallLineNumber }}>{toAmountStr(companyInfo.loanInfo.availableLine, 2, true)}</Text>
                ) : (
                  <Text style={{ ...styles.usableCreditLine, ...styles.lineNumber }}>{toAmountStr(companyInfo.loanInfo.availableLine, 2, true)}</Text>
                )}

              </View>
            </View>
            <DashLine backgroundColor={Color.SPLIT_LINE} len={50} width={DEVICE_WIDTH * 0.95} />
            <View style={styles.loanFooter}>
              <Text style={styles.deadLine}>{this.state.deadLineStr}</Text>
              <Touchable onPress={() => {
                this.setState({
                  infoModal: true
                })
              }}>
                <View style={styles.applyBtn}>
                  <Text style={styles.deadLine}>{'再次申请授信额度'}</Text>
                  <Iconfont style={styles.iconsItem} name={'arrow-right1'} size={dp(30)} />
                </View>
              </Touchable>
            </View>
          </View>
        }
        {(loanInfo.supplierAvailableLine || loanInfo.supplierAvailableLine === 0) && (loanInfo.supplierCreditLine || loanInfo.supplierCreditLine === 0) &&
          <View style={styles.loanInfoMain}>
            <View style={styles.loanDetail}>
              <AnimatedCircularProgress
                rotation={0}
                style={styles.progress}
                size={dp(200)}
                width={dp(15)}
                fill={this.state.supplierFill}
                tintColor={'#CA699A'}
                lineCap={'round'}
                backgroundColor={Color.DEFAULT_BG}>
                {(fill) => (
                  <View>
                    <Text style={{ ...styles.progressText, ...styles.supplierColor }}>{`${parseFloat(fill).toFixed(0)}%`}</Text>
                    <Text style={{ ...styles.supplierColor, transform: [{ scaleX: -1 }] }}>{'担保额度'}</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              <View style={styles.loanQuota}>
                <Text style={{ ...styles.allCreditLine, ...styles.lineTitle }}>总授信额度</Text>
                {companyInfo.loanInfo.supplierCreditLine > 99999999.99 ? (
                  <Text style={{ ...styles.allCreditLine, ...styles.lineNumber, ...styles.marginBottom, ...styles.smallLineNumber }}>{toAmountStr(companyInfo.loanInfo.supplierCreditLine, 2, true)}</Text>
                ) : (
                  <Text style = {{ ...styles.allCreditLine, ...styles.lineNumber, ...styles.marginBottom }}>{toAmountStr(companyInfo.loanInfo.supplierCreditLine, 2, true)}</Text>
                )}
                <Text style={{ ...styles.usableSupplierCreditLine, ...styles.lineTitle }}>可用授信额度</Text>
                {companyInfo.loanInfo.supplierAvailableLine > 99999999.99 ? (
                  <Text style={{ ...styles.usableSupplierCreditLine, ...styles.lineNumber, ...styles.smallLineNumber }}>{toAmountStr(companyInfo.loanInfo.supplierAvailableLine, 2, true)}</Text>
                ) : (
                  <Text style={{ ...styles.usableSupplierCreditLine, ...styles.lineNumber }}>{toAmountStr(companyInfo.loanInfo.supplierAvailableLine, 2, true)}</Text>
                )}

              </View>
            </View>
          </View>
        }
        <ComfirmModal
          title={'注意'}
          content={'再次申请授信额度审核期间，将无法进行其他操作，直至审核流程结束。是否确认发起再次申请授信额度？'}
          cancelText={'取消'}
          comfirmText={'确定'}
          textAlign={'left'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.clearAccount()
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  loanInfoMain: {
    backgroundColor: Color.WHITE,
    borderRadius: dp(16),
    marginHorizontal: dp(20),
    paddingVertical: dp(30),
    marginBottom: dp(20)
  },
  loanDetail: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  progress: {
    marginLeft: dp(80),
    marginBottom: dp(80),
    marginTop: dp(30),
    transform: [{ scaleX: -1 }]
  },
  loanQuota: {
    marginLeft: dp(80),
    marginTop: dp(20)
  },
  progressText: {
    textAlign: 'center',
    fontSize: dp(36),
    transform: [{ scaleX: -1 }]
  },
  lineTitle: {
    fontSize: dp(30)
  },
  lineNumber: {
    fontSize: dp(40)
  },
  smallLineNumber: {
    fontSize: dp(40)
  },
  allCreditLine: {
    color: '#353535'
  },
  usableSupplierCreditLine: {
    color: '#CA699A'
  },
  supplierColor: {
    color: '#CA699A'
  },
  usableCreditLine: {
    color: Color.THEME
  },
  marginBottom: {
    marginBottom: dp(30)
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deadLine: {
    color: Color.THEME,
    marginLeft: dp(30),
    marginTop: dp(30),
    fontSize: dp(28)
  },
  applyBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  iconsItem: {
    marginRight: dp(30),
    marginTop: dp(35),
    marginLeft: dp(10)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(LoanInfo)
