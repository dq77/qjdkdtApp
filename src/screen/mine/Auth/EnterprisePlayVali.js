import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput, toFixed } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn, StrokeBtn } from '../../../component/CommonButton'
import ajaxStore from '../../../utils/ajaxStore'
import { toAmountStr } from '../../../utils/Utility'
import { webUrl } from '../../../utils/config'
import PermissionUtils from '../../../utils/PermissionUtils'
import ComfirmModal from '../../../component/ComfirmModal'

export default class EnterprisePlayVali extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      amount: '',
      appForm: {},
      playProgress: ''
    }
  }

  componentDidMount () {
    this.getProcessDetail()
  }

  async getProcessDetail () {
    const { navigation } = this.props
    const { currentTask } = navigation.state.params
    const res = await ajaxStore.process.getProcessDetail({ processInstanceId: currentTask.processInstanceId })
    if (res.data && res.data.code === '0') {
      this.setState({
        appForm: res.data.data.appForm
      })
    }
  }

  // 取消实名认证流程
  async processDelete () {
    const { navigation } = this.props
    const { currentTask } = navigation.state.params
    const res = await ajaxStore.process.processDelete(currentTask.processInstanceId, { memberName: this.state.appForm.companyId, deleteReason: '用户取消流程' })
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('RealNameAuthList', {
        cifCompanyId: this.state.appForm.companyId,
        type: ''// 再次认证，告诉后面要重新认证
      })
    }
  }

  // 获取企业打款进度
  async transferProcess () {
    const { navigation } = this.props
    const { currentTask } = navigation.state.params
    const res = await ajaxStore.process.transferProcess({ processId: currentTask.processInstanceId })
    if (res.data && res.data.code === '0') {
      const paymentObj = {
        INIT: '完成企业信息对比，但未发起打款',
        PAID: '打款申请完成',
        PAID_FAILED: '打款失败',
        PAID_SUCCESS: '打款成功',
        ORGANFINISHED: '打款回填成功，企业认证完成'
      }
      const paymentStatus = paymentObj[res.data.data.data.process]
      const paymentMessage = res.data.data.data.message
      // this.setState({
      //   playProgress: `${paymentStatus} ${paymentMessage}`
      // })
      global.alert.show({
        title: '打款进度',
        content: `${paymentStatus} ${paymentMessage}`
      })
    }
  }

  // 点击立即认证
  certificationImmediately () {
    const { navigation } = this.props
    const { currentTask } = navigation.state.params
    if (this.state.amount.length < 1) {
      global.alert.show({
        content: '请输入对公账户收到的随机金额'
      })
    }
    this.customerList()
  }

  // 先调用列表接口查当前认证状态，然后如果已经开始，那么直接根据taskStack接口判断进入到哪个流程。如果没有开始流程，那么申请开始流程，然后再判断应该进入哪个流程
  async customerList (data) {
    global.loading.show()
    const res = await ajaxStore.credit.customerList({ cifCompanyId: this.state.appForm.companyId })
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      if (res.data.data.customerCorpInfo.authStatus === '1') {
        // 当前处于认证中
        this.taskStack()
      } else if (res.data.data.customerCorpInfo.authStatus === '2') {
        // 当前处于认证成功
        this.props.navigation.navigate('EnterpriseInfo', {
          type: '2',
          itemData: res.data.data.customerCorpInfo,
          personName: res.data.data.handlerPersonList[0].personName
        })
      } else {
        // 当前处于其他要重新开启认证的状态,回到实名认证首页
        this.props.navigation.navigate('RealNameAuth')
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskSubmit (taskStackData) {
    const { navigation } = this.props
    const data = {
      memberId: this.state.appForm.handlerIdNumber,
      taskId: taskStackData.taskId,
      isPass: 'Y',
      amount: parseFloat(this.state.amount).toFixed(2)
    }
    const res = await ajaxStore.credit.taskSubmit(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data.resultCode.toString() === '0') {
        navigation.navigate('EnterpriseRealAuthSuccess', { type: '2' })
      } else {
        navigation.navigate('EnterpriseRealAuthFail', { buzKey: { type: '2', resultMessage: res.data.data.resultMessage } })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskStack () {
    const data = {
      processInstanceId: this.state.appForm.processInstanceId,
      taskId: ''
    }
    const res = await ajaxStore.credit.taskStack(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data.currentTask.taskDefKey === 'PERSON_FACTOR') {
        this.props.navigation.navigate('EnterpriseRealAuth', { currentTask: res.data.data.currentTask })
      } else if (res.data.data.currentTask.taskDefKey === 'BANK_INFO') {
        this.props.navigation.navigate('EnterpriseFillInfo', { currentTask: res.data.data.currentTask })
      } else if (res.data.data.currentTask.taskDefKey === 'AMOUNT_CHECK') {
        this.taskSubmit(res.data.data.currentTask)
      } else if (res.data.data.currentTask.taskDefKey === 'FACE_RECOGNIZATION') {
        // 权限申请
        const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
        if (!hasPermission) { return }
        this.faceFace(res.data.data.currentTask)
      } else {
        this.taskSubmit(res.data.data.currentTask)
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async faceFace (taskStackData) {
    const data = {
      idcardName: this.state.appForm.legalPersonName,
      idcardNumber: this.state.appForm.legalPersonIdNum,
      callBackUrl: `${webUrl}/mine/faceNuclearBody?memberId=${this.state.appForm.legalPersonIdNum}&taskId=${taskStackData.currentTask.taskId}`
    }
    const res = await ajaxStore.credit.faceFace(data)
    if (res.data && res.data.code === 0) {
      this.setVariablesLocal(res.data.data, taskStackData.currentTask.taskId)
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async setVariablesLocal (faceFaceData, taskId) {
    const { navigation } = this.props
    const data = {
      eFlowId: faceFaceData.flowId
    }
    const res = await ajaxStore.credit.setVariablesLocal(taskId, data)
    if (res.data && res.data.code === '0') {
      navigation.navigate('WebView', { url: faceFaceData.originalUrl, title: '人脸识别', faceFace: faceFaceData })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  disabled () {
    return !(this.state.amount
    )
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'企业对公打款认证'} navigation={navigation}
          onLeftPress={() => { navigation.navigate('RealNameAuth') }}/>
        {/* 顶部第几步显示 */}
        <View style={styles.topStepBg}>
          <View style={styles.topStepLineBg}/>
          <View style={styles.topStepNBg}>
            <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(40)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(40)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-daiban1'} size={dp(56)} />
          </View>
          <View style={styles.topStepTextBg}>
            <Text style={{ fontSize: dp(26) }}>经办人实名认证</Text>
            <Text style={{ fontSize: dp(26) }}>填写企业信息</Text>
            <Text style={{ fontSize: dp(26) }}>打款信息验证</Text>
          </View>
        </View>
        {/* 中间实名认证信息填写 */}
        <View style={styles.centerStepBg}>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>验证金额</Text>
            <TextInput placeholder={'请输入对公账户收到的随机金额'}
              placeholderTextColor={Color.TEXT_LIGHT}
              keyboardType='numbers-and-punctuation'
              style={styles.itemInput}
              maxLength={50}
              value={this.state.amount}
              onChangeText={text => {
                this.setState({
                  amount: text
                })
              }}
            />
          </View>
        </View>
        <Text style={{ fontSize: dp(28), marginHorizontal: dp(30), marginVertical: dp(60), lineHeight: dp(35), color: '#888888' }}>{'提示：\n贵司对公账户会在2小时内收到的一笔随机金额。\n请在72小时内填写金额数字，验证金额。\n信息填写错误或超时会导致验证失败。'}</Text>
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            this.certificationImmediately()
          }} style={{ backgroundColor: !this.disabled() ? Color.THEME : Color.BTN_DISABLE }} text={'立即验证'} />
        </View>
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            this.processDelete()
          }} style={{ backgroundColor: Color.THEME, marginTop: dp(30) }} text={'重新发起认证'} />
        </View>
        <View style={styles.footer}>
          <StrokeBtn text='查看打款进度' style={{ marginTop: dp(30) }} onPress={() => {
            this.transferProcess()
          }} />
        </View>
        {/* <ComfirmModal
          title={''}
          content={`打款进度${this.state.playProgress}`}
          cancelText={'取消'}
          comfirmText={'重新发起认证'}
          textAlign={'left'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={async () => {
            this.setState({
              infoModal: false
            })
            setTimeout(() => {
              this.props.navigation.navigate('AgentCreate', { typePage: '2' })
            }, 500)
          }}
          infoModal={this.state.infoModal} /> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  btn: {
    // marginTop: dp(50)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  topStepBg: {
    height: dp(240),
    width: DEVICE_WIDTH
  },
  topStepNumBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    height: dp(56)
  },
  topStepNBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centerStepBg: {
    width: DEVICE_WIDTH,
    backgroundColor: 'white'
  },
  topStepLineBg: {
    top: dp(57) + dp(31),
    height: dp(6),
    backgroundColor: 'white',
    marginHorizontal: dp(130)
  },
  topStepTextBg: {
    top: dp(56) + dp(28),
    marginHorizontal: dp(60),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemInput: {
    fontSize: dp(28),
    height: dp(90),
    width: DEVICE_WIDTH - dp(180) - dp(60),
    color: Color.TEXT_MAIN,
    marginLeft: dp(180),
    position: 'absolute'
  },
  smsBtn: {
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    color: '#00b2a9',
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    textAlign: 'center'
  },
  countBtn: {
    color: Color.TEXT_LIGHT,
    borderColor: Color.TEXT_LIGHT
  }
})
