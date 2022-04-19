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
import ajaxStore from '../../../utils/ajaxStore'

@injectUnmount
class AccountInfo extends PureComponent {
  static defaultProps = {

  }

  static propTypes = {

  }

  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const { navigation, companyInfo, userInfo } = this.props

    console.log(companyInfo.accountInfo, 'companyInfo.accountInfo')
    return (
      <View style={styles.accountMain}>
        <Text style={styles.accountTitle}>账户信息</Text>
        {companyInfo.accountInfo.map((item, key) => {
          return (
            (item.fundsSource === '仟金顶' || item.totalPayable !== '0') &&
            <View style={styles.accountItem} key={key}>
              <Text style={styles.title}>{`货款来源方：${item.fundsSource}`}</Text>
              <View style={styles.detail}>
                <View style={styles.detailItem}>
                  <View style={styles.itemContent}>
                    <Text style={styles.contentTitle}>最近应还货款</Text>
                    <Text style={styles.contentAmount}>{toAmountStr(item.tradePayable, 2, true)}</Text>
                    {item.finalRepaymentDate ? (
                      <Text style={styles.contentDate}>{`到期日 ${item.finalRepaymentDate}`}</Text>
                    ) : (
                      <Text style={styles.contentDate}>暂无到期日</Text>
                    )}
                  </View>
                  <Iconfont style={styles.itemIcon} name={'zuijinyingfuhuokuan'} size={dp(100)} />
                </View>
                <View style={styles.detailItem}>
                  <View style={styles.itemContent}>
                    <Text style={styles.contentTitle}>信息系统服务费</Text>
                    <Text style={styles.contentAmount}>{toAmountStr(item.servicePayable || 0, 2, true)}</Text>
                    {item.repaymentDate ? (
                      <Text style={styles.contentDate}>{`到期日 ${item.repaymentDate}`}</Text>
                    ) : (
                      <Text style={styles.contentDate}>暂无到期日</Text>
                    )}
                  </View>
                  <Iconfont style={styles.itemIcon} name={'huowutiqiantiqufuwufei'} size={dp(100)} />
                </View>
                { item.fundsSource === '仟金顶' &&
                  <View style={styles.detailItem}>
                    <View style={styles.itemContent}>
                      <Text style={styles.contentTitle}>最近应还综合服务费</Text>
                      <Text style={styles.contentAmount}>{toAmountStr(item.compositeFeePayable || 0, 2, true)}</Text>
                      {item.repaymentDate ? (
                        <Text style={styles.contentDate}>{`到期日 ${item.repaymentDate}`}</Text>
                      ) : (
                        <Text style={styles.contentDate}>暂无到期日</Text>
                      )}
                    </View>
                    <Iconfont style={styles.itemIcon} name={'zuijinyingfuzonghefuwufei'} size={dp(100)} />
                  </View>
                }
                <View style={styles.detailItem}>
                  <View style={styles.itemContent}>
                    <Text style={styles.contentTitle}>总应还货款</Text>
                    <Text style={{ ...styles.contentAmount, color: Color.THEME }}>{toAmountStr(item.totalPayable, 2, true)}</Text>
                    <Text style={styles.contentDate}>不含服务费</Text>
                  </View>
                  <Iconfont style={styles.itemIcon} name={'zongyingfuhuokuan'} size={dp(100)} />
                </View>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  accountMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  accountTitle: {
    // fontWeight: 'bold',
    marginTop: dp(10),
    marginBottom: dp(30),
    textAlign: 'center',
    width: '100%'
  },
  accountItem: {
    backgroundColor: Color.WHITE,
    borderRadius: dp(16),
    width: '95%',
    marginBottom: dp(50)
  },
  title: {
    backgroundColor: Color.THEME,
    color: Color.WHITE,
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16),
    padding: dp(20)
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: dp(20),
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  contentTitle: {
    // fontWeight: 'bold'
  },
  contentDate: {
    color: '#888',
    fontSize: dp(24)
  },
  contentAmount: {
    marginVertical: dp(5),
    fontSize: dp(34),
    color: Color.RED
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AccountInfo)
