import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import Color from '../../../utils/Color'
import { getRealDP as dp } from '../../../utils/screenUtil'
import { injectUnmount, toAmountStr } from '../../../utils/Utility'

@injectUnmount
class OverviewMonthData extends PureComponent {
  static defaultProps = {
    navigation: {},
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      selectNum: '1',
    }
  }

  selectNum(type) {
    this.setState({
      selectNum: type,
    })
  }

  decView(key, statusColor, statusText, typeText, data, dataColor, endTime) {
    const topBG =
      key === 0
        ? endTime === '暂无到期日'
          ? '#D8DDE2'
          : '#F6DBB0'
        : statusText === '正常'
        ? statusColor
        : statusText === '逾期'
        ? '#F55849'
        : 'white'
    const numBG = key === 0 ? '#B7916C' : statusText === '逾期' ? '#F55849' : '#2D2926'
    const bottomFontSize = data.length > 13 ? dp(32) : dp(36)
    const money = key === 0 ? (endTime !== '暂无到期日' ? data : '0.00') : data
    return (
      <View key={key} style={styles.decView}>
        <View style={styles.decViewTopBG}>
          <View style={[styles.decViewTopTextBG, { backgroundColor: topBG }]}>
            <Text style={styles.decViewTopText}>{statusText}</Text>
          </View>
          <Text style={styles.decViewTopTypeText}>{typeText}</Text>
        </View>
        <View style={styles.lineBG}></View>
        <View style={styles.decViewBottomBG}>
          <Text style={{ color: numBG, fontSize: bottomFontSize }}>{money}</Text>
        </View>
        <View style={styles.decViewBottomTimeText}>
          <Text style={styles.decViewBottomText}>{endTime}</Text>
        </View>
      </View>
    )
  }

  render() {
    const { companyInfo, newInformation } = this.props
    const tradePayable = newInformation.tradePayable || 0
    const servicePayable = newInformation.servicePayable || 0
    const compositeFeePayable = newInformation.compositeFeePayable || 0
    const finalRepaymentDate = newInformation.finalRepaymentDate || null
    const repaymentDate = newInformation.repaymentDate || null
    const tradePayableStatus =
      newInformation.tradePayableStatus === 'normal'
        ? '正常'
        : newInformation.tradePayableStatus === 'overdue'
        ? '逾期'
        : ''
    const servicePayableStatus =
      newInformation.servicePayableStatus === 'normal'
        ? '正常'
        : newInformation.servicePayableStatus === 'overdue'
        ? '逾期'
        : ''
    const compositeFeePayableStatus =
      newInformation.compositeFeePayableStatus === 'normal'
        ? '正常'
        : newInformation.compositeFeePayableStatus === 'overdue'
        ? '逾期'
        : ''
    const replyDeadlineStatus = companyInfo.loanInfo && companyInfo.loanInfo.replyDeadline ? '有效' : '失效'
    const availableLine = companyInfo.loanInfo ? companyInfo.loanInfo.availableLine : 0
    const replyDeadline =
      companyInfo.loanInfo && companyInfo.loanInfo.replyDeadline
        ? `有效期${companyInfo.loanInfo.replyDeadline.split(' ')[0]}`
        : '暂无到期日'
    const repaymentDateText = repaymentDate ? `到期日${repaymentDate}` : '暂无到期日'
    const finalRepaymentDateText = finalRepaymentDate ? `到期日${finalRepaymentDate}` : '暂无到期日'

    return (
      <View style={styles.loanMain}>
        <Text style={styles.title2Style}>本月数据总览</Text>
        <View style={styles.boxBG}>
          {this.decView(
            0,
            '#F6DBB0',
            replyDeadlineStatus,
            '可赊销额度',
            toAmountStr(availableLine, 2, true),
            '#B7916C',
            replyDeadline,
          )}
          {this.decView(
            1,
            '#B0DBF6',
            tradePayableStatus,
            '最近应还货款',
            toAmountStr(tradePayable, 2, true),
            '#2D2926',
            finalRepaymentDateText,
          )}
        </View>
        <View style={styles.boxBG}>
          {this.decView(
            2,
            '#B0DBF6',
            servicePayableStatus,
            '应还信息系统服务费',
            toAmountStr(servicePayable, 2, true),
            '#2D2926',
            repaymentDateText,
          )}
          {this.decView(
            3,
            '#B0DBF6',
            compositeFeePayableStatus,
            '应还综合服务费',
            toAmountStr(compositeFeePayable, 2, true),
            '#2D2926',
            repaymentDateText,
          )}
        </View>
        <View style={styles.bottomBG}>
          <Text style={styles.bottomText}>—— 页面到底了 ——</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  decViewBottomTimeText: {
    marginHorizontal: dp(20),
    alignItems: 'flex-end',
  },
  decViewBottomText: {
    color: '#A7ADB0',
    fontSize: dp(24),
  },
  decViewBottomBG: {
    marginHorizontal: dp(20),
    alignItems: 'flex-end',
    marginVertical: dp(30),
  },
  lineBG: {
    marginTop: dp(30),
    height: dp(1),
    backgroundColor: Color.SPLIT_LINE,
  },
  decViewTopTypeText: {
    color: '#2D2926',
    fontSize: dp(26),
  },
  decViewTopText: {
    color: 'white',
    fontSize: dp(24),
  },
  decViewTopTextBG: {
    borderRadius: dp(4),
    justifyContent: 'center',
    alignItems: 'center',
    padding: dp(5),
  },
  decViewTopBG: {
    marginHorizontal: dp(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomText: {
    color: '#A7ADB0',
    fontSize: dp(24),
  },
  bottomBG: {
    marginVertical: dp(90),
    alignItems: 'center',
  },
  boxBG: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  loanMain: {
    marginTop: dp(80),
  },
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold',
  },
  title2Style: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: 'bold',
    marginLeft: dp(30),
  },
  bgView: {
    borderRadius: dp(36),
    width: dp(230),
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dp(40),
  },
  decView: {
    marginTop: dp(30),
    width: dp(330),
    paddingVertical: dp(30),
    borderRadius: dp(16),
    backgroundColor: 'white',
  },
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(OverviewMonthData)
