import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { callPhone } from '../../utils/PhoneUtils'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn } from '../../component/CommonButton'
import ComfirmModal from '../../component/ComfirmModal'
import AlertModal from '../../component/AlertModal'
import {
  getCompanyInfo
} from '../../actions'

class PayMemberFee extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      confirmPay: false,
      successPay: false,
      reason: false,
      reasonContent: ''
    }
    this.clickPreviewMember = this.clickPreviewMember.bind(this)
  }

  extractMessage (message) {
    if (message) {
      let contentText = ''
      const list = []
      let i = 0
      try {
        message = JSON.parse(message)
      } catch (e) { }
      for (const code in message) {
        let text = message[code]
        switch (code) {
          case '4':
            text = '未找到对应的用户信息'
            break
          case '5':
            text = '系统中已有您的会员费缴纳申请'
            break
          case '6':
            text = '您的会员费还未到期'
            break
          case '8':
            text = '账户可用余额不足'
            break
          case '9':
            text = '在凌晨0：00 -- 2：00期间，不能缴纳会员费'
            break
          default:
            text = ''
            break
        }
        list.push(`\r\n${++i}.${text}`)
      }
      contentText = list.join('')
      this.setState({
        reason: true,
        reasonContent: contentText
      })
    }
  }

  async payFee () {
    const res = await ajaxStore.company.payMemberFee()
    if (res.data && res.data.code === '0') {
      getCompanyInfo()
      this.setState({
        confirmPay: false,
        successPay: true
      })
    } else if (res.data.code === '100000026') {
      this.setState({
        confirmPay: false
      })
      this.extractMessage(res.data.message)
    }
  }

  // 预览会员费协议
  async clickPreviewMember () {
    const memberFeeContractList = this.props.contractInfo.memberFeeContractList
    let contractCode
    memberFeeContractList && memberFeeContractList.length && memberFeeContractList.map((item, key) => {
      if (item.status === 'SIGN_SUCCESS') {
        contractCode = item.code
      }
    })
    const res = await ajaxStore.contract.getContract({ contractCode })
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('PreviewPDF', { buzKey: res.data.data.fileKey })
    }
  }

  componentDidMount () {

  }

  render () {
    const { navigation, contractInfo } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'缴纳会员费'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <View style={{ ...styles.pageItem, ...styles.borderBottom }}>
              <Text style={styles.title}>会员费</Text>
              <View style={styles.detail}>
                <Text style={styles.detailText}>会员费金额：1,000.00元</Text>
                <Text style={styles.detailText}>会员权益：详见<Text onPress={() => this.clickPreviewMember()} style={styles.contractText}>《会员费协议》</Text></Text>
                <Text style={styles.detailText}>如有疑问请拨打咨询热线 <Text style={styles.phoneNum} onPress={() => {
                  callPhone(4006121666)
                }}>400-612-1666</Text>（全年 9:00-21:00）。</Text>
              </View>
            </View>
            <View style={styles.pageItem}>
              <Text style={styles.title}>收款账户<Text style={styles.detailText}>（请以对公账户进行汇款）</Text></Text>
              <View style={styles.detail}>
                <Text style={styles.detailText}>账户名：仟金顶网络科技有限公司</Text>
                <Text style={styles.detailText}>收款银行：华夏银行杭州分行之江支行</Text>
                <Text style={styles.detailText}>账号：10456000000628478</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <SolidBtn text='缴纳会员费'
                onPress={() => {
                  this.setState({
                    confirmPay: true
                  })
                }} />
            </View>
          </View>
        </ScrollView>
        <ComfirmModal
          title={'是否支付会员费'}
          content={'确定后将直接从账户中扣除会员费\r\n1,000.00元'}
          cancelText={'取消'}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({
              confirmPay: false
            })
          }}
          confirm={() => {
            this.setState({
              confirmPay: false
            })
            this.payFee()
          }}
          infoModal={this.state.confirmPay} />
        <ComfirmModal
          title={'会员费缴纳成功'}
          content={'您现在就可以创建订单了'}
          cancelText={'返回首页'}
          comfirmText={'创建订单'}
          cancel={() => {
            this.setState({
              successPay: false
            })
            this.props.navigation.navigate('Home')
          }}
          confirm={() => {
            this.setState({
              successPay: false
            })
            this.props.navigation.navigate('OrderCreateStepOne')
          }}
          infoModal={this.state.successPay} />
        <AlertModal
          title={'会员费缴纳失败'}
          content={`失败原因描述${this.state.reasonContent}`}
          comfirmText={'确定'}
          type={'fail'}
          cancel={() => {
            this.setState({
              reason: false
            })
          }}
          confirm={() => {
            this.setState({
              reason: false
            })
          }}
          infoModal={this.state.reason} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  pageMain: {

  },
  pageItem: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(50)
  },
  borderBottom: {
    borderBottomWidth: dp(1),
    borderBottomColor: Color.TEXT_LIGHT
  },
  title: {
    fontWeight: 'bold',
    fontSize: dp(32),
    marginBottom: dp(50)
  },
  detailText: {
    fontSize: dp(28),
    color: '#888',
    lineHeight: dp(50),
    fontWeight: 'normal'
  },
  phoneNum: {
    color: '#4fbf9f'
  },
  contractText: {
    color: '#2ea2db'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: dp(100)
  }
})

const mapStateToProps = state => {
  return {
    contractInfo: state.contract
  }
}

export default connect(mapStateToProps)(PayMemberFee)
