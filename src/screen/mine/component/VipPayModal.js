
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import {
  getCSContractList
} from '../../../actions'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import { processStatus } from '../../../utils/enums'
import { webUrl } from '../../../utils/config'
import { getTimeDifference } from '../../../utils/DateUtils'

class VipPayModal extends PureComponent {
  static defaultProps = {
    companyId: '',
    infoModal: false,
    cancel: function () { },
    comfirm: function () { },
    type: 'success',
    memberInfo: {},
    supplierId: '',
    navigation: {},
    show: function () {}
  }

  static propTypes = {
    companyId: PropTypes.string.isRequired,
    infoModal: PropTypes.bool.isRequired,
    cancel: PropTypes.func,
    comfirm: PropTypes.func,
    type: PropTypes.string,
    memberInfo: PropTypes.object,
    supplierId: PropTypes.string,
    navigation: PropTypes.object,
    show: PropTypes.func
  }

  static getDerivedStateFromProps (nextProps, prevPros) {
    return {
      infoModal: nextProps.infoModal
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      comfirmText: '取消',
      title: '成为会员',
      content: '',
      memberFeeContractList: [],
      processStatus: -1,
      processId: ''
    }
    // this.payFee = this.payFee.bind(this)
  }

  _Close () {
    this.setState({
      processStatus: -1
    })
    this.props.cancel()
  }

  _Comfirm () {
    this.props.confirm && this.props.confirm()
  }

  async componentDidMount () {
    await this.getCSContractList({
      name: '',
      page: 1,
      pageSize: 100,
      ownerList: [this.props.companyId, this.props.supplierId]
    })
    this.checkProcessStatus()
  }

  async getCSContractList (data) {
    let contractList
    const res = await ajaxStore.contract.getCSContractList(data)
    console.log(res, 'CSres')
    if (res.data && res.data.code === '0') {
      contractList = res.data.data ? res.data.data.records : []
      const memberFeeContractList = contractList.filter((item) => {
        return item.type === '37'
      })
      this.setState({
        memberFeeContractList
      })
    }
  }

  statusAlert () {
    // 流程状态:0-流程发起,1-冻结成功，2-合同签署成功，3-合同签署失败，4-订单结束，5-人工终止，6-冻结失败，7-订单失败
    const processStatus = this.state.processStatus
    if (this.props.memberInfo.blackType === 1) {
      this._Close()
      global.alert.show({
        title: '提示',
        content: '您当前的会员等级被冻结，如有疑问请联系客服',
        callback: () => {
        }
      })
    } else if (processStatus === 1) {
      this._Close()
      global.alert.show({
        title: '签署会员服务费协议',
        content: '点击按钮立即签署会员服务费协议',
        callback: () => {
          this.processVariables()
        }
      })
    } else if (processStatus === 6) {
      this._Close()
      global.alert.show({
        title: '账户可用余额不足',
        content: '请向账户充值足够金额后重试',
        callback: () => {
          global.alert.hide()
        }
      })
    } else {
      this._Close()
      global.alert.show({
        content: processStatus[processStatus]
      })
    }
  }

  async processVariables () {
    const { memberFeeContractList } = this.state
    const res = await ajaxStore.company.processVariables({ processInstanceId: this.state.processId })
    console.log('processVariables' + res.data.data)
    if (res.data && res.data.data && res.data.code === '0') {
      global.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${res.data.data.contractSignProcessId}&contractCode=${memberFeeContractList[0].code}`, title: '合同签约' })
    }
  }

  async checkProcessStatus (showMsg) {
    const res = await ajaxStore.company.checkProcessStatus({ companyId: this.props.companyId })
    console.log(res.data.data, 'processStatus')
    if (res.data && res.data.data && res.data.code === '0') {
      const data = { processStatus: -1, ...res.data.data }
      this.setState({
        processStatus: data.processStatus,
        processId: data.processId
      })
      if (this.state.infoModal) {
        console.log('checkProcessStatus过来的')
        this.statusAlert()
      }
    }
  }

  // async payFee (orderType) {
  //   this._Close()
  //   console.log(this.props, 'this.props')
  //   const res = await ajaxStore.company.payMemberFee({ companyId: this.props.companyId, orderType })
  //   console.log(res, 'payMemberFee')
  //   if (res.data && res.data.code === '0') {
  //     onEvent('发起会员费缴纳', '/ofs/front/memberVip/pushMemberLevelUpgrade', {
  //       currentMemberLevel: this.props.memberInfo.vipLevelCode,
  //       memberProcessNo: ''
  //     })
  //     await this.getCSContractList({
  //       name: '',
  //       page: 1,
  //       pageSize: 100,
  //       ownerList: [this.props.companyId, this.props.supplierId]
  //     })
  //     this.checkProcessStatus(true)
  //   }
  // }

  render () {
    let memberInfo = this.props.memberInfo
    memberInfo = {
      ...memberInfo,
      memberFreeString: toAmountStr(memberInfo.memberFree, 0, true),
      memberFreePayString: toAmountStr(memberInfo.memberFreePay, 0, true),
      memberFreeRenewString: toAmountStr(memberInfo.memberFreeRenew, 0, true)
    }
    // const processStatus = this.state.processStatus
    // if (this.state.infoModal) {
    //   console.log('render过来的')
    //   this.checkProcessStatus()
    //   // this.statusAlert()
    // }
    return (
      <View></View>
      // <Modal
      //   onTouchOutside={() => {
      //     this._Close()
      //   }}
      //   width={0.8}
      //   visible={this.state.infoModal}
      //   onSwipeOut={() => this._Close()}
      //   modalAnimation={new ScaleAnimation({
      //     initialValue: 0.1, // optional
      //     useNativeDriver: true // optional
      //   })}
      //   onHardwareBackPress={() => {
      //     this._Close()
      //     return true
      //   }}
      //   footer={
      //     <ModalFooter style={styles.bottomMain}>
      //       <ModalButton
      //         text={this.state.comfirmText}
      //         onPress={() => {
      //           this._Close()
      //           this._Comfirm()
      //         }}
      //         key="button-2"
      //         textStyle={{ color: '#000' }}
      //       />
      //     </ModalFooter>
      //   }
      // >
      //   <ModalContent style={{ alignItems: 'stretch' }}>
      //     {parseInt(memberInfo.upgradeableLevels) && parseInt(memberInfo.upgradeableLevels) > parseInt(memberInfo.vipLevelCode) ? (
      //       <Text style={styles.dialogTitle}>{`您已达到V${memberInfo.upgradeableLevels}升级条件`}</Text>
      //     ) : (
      //       <Text style={styles.dialogTitle}>{'立即续费'}</Text>
      //     )}
      //     {parseInt(memberInfo.upgradeableLevels) && parseInt(memberInfo.upgradeableLevels) > parseInt(memberInfo.vipLevelCode) ? (
      //       <Text style={styles.dialogText}>
      //         {`升级V${memberInfo.upgradeableLevels}，需缴纳`}
      //         {parseFloat(memberInfo.memberFreePay) !== parseFloat(memberInfo.memberFree) ? (
      //           <Text style={styles.dialogText}>
      //             <Text style={{ ...styles.dialogText, ...styles.lineThrough }}>{`${memberInfo.memberFreeString}元`}</Text>
      //             <Text style={styles.dialogText}>{`${memberInfo.memberFreePayString}元`}</Text>
      //           </Text>
      //         ) : (
      //           <Text style={styles.dialogText}>{`${memberInfo.memberFreeString}元`}</Text>
      //         )}
      //       </Text>
      //     ) : (null)}
      //     {memberInfo.upgradeableLevels && memberInfo.upgradeableLevels.toString() === '1' ? null : ((getTimeDifference(memberInfo.validLastThreeMonthTime) <= 0 && parseInt(memberInfo.vipLevelCode) !== 0) ? (
      //       <Text style={styles.dialogText}>{`续费V${memberInfo.vipLevelCode}，需缴纳${memberInfo.memberFreeRenewString}元`}</Text>
      //     ) : (getTimeDifference(memberInfo.validLastThreeMonthTime) <= 0 && parseInt(memberInfo.vipLevelCode) === 0) && <Text style={styles.dialogText}>{'升级V1，需缴纳1000元'}</Text>)}
      //     <View style={styles.operateMain}>
      //       {parseInt(memberInfo.upgradeableLevels) && parseInt(memberInfo.upgradeableLevels) > parseInt(memberInfo.vipLevelCode) ? (
      //         <Touchable onPress={() => { this.payFee(1) }}>
      //           <Text style={styles.bottomBtn}>{`升级至V${memberInfo.upgradeableLevels}`}</Text>
      //         </Touchable>
      //       ) : (null)}
      //       {memberInfo.upgradeableLevels && memberInfo.upgradeableLevels.toString() === '1' ? null : ((getTimeDifference(memberInfo.validLastThreeMonthTime) <= 0 && parseInt(memberInfo.vipLevelCode) !== 0) ? (
      //         <Touchable onPress={() => { this.payFee(2) }}>
      //           <Text style={styles.bottomBtn}>{`续费V${memberInfo.vipLevelCode}`}</Text>
      //         </Touchable>
      //       )
      //         : (getTimeDifference(memberInfo.validLastThreeMonthTime) <= 0 && parseInt(memberInfo.vipLevelCode) === 0) && <Touchable onPress={() => { this.payFee(1) }}>
      //           <Text style={styles.bottomBtn}>{'升级至V1'}</Text>
      //         </Touchable>)}
      //     </View>
      //   </ModalContent>
      // </Modal>
    )
  }
}

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: dp(40),
    textAlign: 'center',
    marginBottom: dp(30)
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  },
  operateMain: {
    marginTop: dp(50)
  },
  bottomBtn: {
    color: '#576B95',
    textAlign: 'center',
    fontSize: dp(36),
    borderTopWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    paddingVertical: dp(30)
  },
  bottomMain: {
    marginTop: dp(-50)
  },
  lineThrough: {
    textDecorationLine: 'line-through'
  }
})

export default VipPayModal
