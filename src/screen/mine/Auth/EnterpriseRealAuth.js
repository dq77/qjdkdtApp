import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import { SolidBtn } from '../../../component/CommonButton'
import { blurIdCard, bankIdCard, iphoneNo } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import {
  vPhone
} from '../../../utils/reg'
import { webUrl } from '../../../utils/config'
import PermissionUtils from '../../../utils/PermissionUtils'

export default class EnterpriseRealAuth extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      count: 0,
      bankCard: '',
      mobileNo: '',
      authcode: '',
      appForm: {}
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

  componentWillUnmount () {
    this.time && clearTimeout(this.time)
  }

  countCode (count) {
    if (count === 0) {
    } else {
      count--
      this.setState({ count: count })
      this.time = setTimeout(() => {
        this.countCode(count)
      }, 1000)
    }
  }

  async getSmsCode () {
    if (this.state.bankCard.replace(/\s+/g, '').length < 1) {
      global.alert.show({
        content: '请填写正确的银行卡号'
      })
      return
    }
    if (!vPhone.test(this.state.mobileNo)) {
      global.alert.show({
        content: '请填写正确的银行卡预留手机号'
      })
      return
    }
    const { navigation } = this.props
    const res = await ajaxStore.credit.bankCard4Factors({
      idcardName: this.state.appForm.handlerName,
      idcardNumber: this.state.appForm.handlerIdNumber,
      bankCardNo: this.state.bankCard.replace(/\s+/g, ''), // 银行账号
      // idcardName: '李国庆',
      // idcardNumber: '411524199104050595',
      mobileNo: this.state.mobileNo
    })
    global.loading.hide()
    if (res.data && res.data.code === 0) {
      this.countCode(60)
      this.setState({
        eFlowId: res.data.data.flowId
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 点击立即认证
  certificationImmediately () {
    if (this.state.bankCard.replace(/\s+/g, '').length < 1) {
      global.alert.show({
        content: '请填写正确的银行卡号'
      })
      return
    }
    if (!vPhone.test(this.state.mobileNo)) {
      global.alert.show({
        content: '请填写正确的银行卡预留手机号'
      })
      return
    }
    if (this.state.authcode.length < 4) {
      global.alert.show({
        content: '请填写正确的验证码'
      })
      return
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
    const { currentTask } = navigation.state.params
    const data = {
      memberId: this.state.appForm.handlerIdNumber,
      taskId: currentTask.taskId,
      isPass: 'Y',
      bankAccount: this.state.bankCard.replace(/\s+/g, ''), // 银行账号
      phoneNum: this.state.mobileNo, // 手机号码
      verifyCode: this.state.authcode,
      eFlowId: this.state.eFlowId
    }
    const res = await ajaxStore.credit.taskSubmit(data)
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('EnterpriseFillInfo', { currentTask: taskStackData })
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
        this.taskSubmit(res.data.data.currentTask)
      } else if (res.data.data.currentTask.taskDefKey === 'BANK_INFO') {
        this.props.navigation.navigate('EnterpriseFillInfo', { currentTask: res.data.data.currentTask })
      } else if (res.data.data.currentTask.taskDefKey === 'AMOUNT_CHECK') {
        this.props.navigation.navigate('EnterprisePlayVali', { currentTask: res.data.data.currentTask })
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

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'企业对公打款认证'} navigation={navigation}
          onLeftPress = {() => {
            this.props.navigation.navigate('RealNameAuth')
          }}/>
        {/* 顶部第几步显示 */}
        <View style={styles.topStepBg}>
          <View style={styles.topStepLineBg}/>
          <View style={styles.topStepNBg}>
            <Iconfont style={styles.arrow} name={'liuchengyindao-daiban2'} size={dp(56)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-weikaishi-'} size={dp(40)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-weikaishi-1'} size={dp(40)} />
          </View>
          <View style={styles.topStepTextBg}>
            <Text style={{ fontSize: dp(26) }}>经办人实名认证</Text>
            <Text style={{ fontSize: dp(26), opacity: 0.5 }}>填写企业信息</Text>
            <Text style={{ fontSize: dp(26), opacity: 0.5 }}>打款信息验证</Text>
          </View>
        </View>
        {/* 中间实名认证信息填写 */}
        <View style={styles.centerStepBg}>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>姓名</Text>
            <Text style={{ fontSize: dp(28), marginLeft: dp(180), position: 'absolute', opacity: 0.5 }}>{this.state.appForm.handlerName}</Text>
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>身份证号</Text>
            <Text style={{ fontSize: dp(28), marginLeft: dp(180), position: 'absolute', opacity: 0.5 }}>{blurIdCard(this.state.appForm.handlerIdNumber)}</Text>
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>银行卡号</Text>
            <TextInput placeholder={'请输入银行卡号'}
              placeholderTextColor={Color.TEXT_LIGHT}
              keyboardType='number-pad'
              style={styles.itemInput}
              maxLength={50}
              value={this.state.bankCard}
              onChangeText={text => {
                this.setState({
                  bankCard: text.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                })
              }}
            />
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>预留手机号</Text>
            <TextInput placeholder={'请填写银行卡预留手机号'}
              placeholderTextColor={Color.TEXT_LIGHT}
              keyboardType='number-pad'
              style={styles.itemInput}
              maxLength={11}
              value={this.state.mobileNo}
              onChangeText={text => {
                this.setState({
                  mobileNo: text
                })
              }}
            />
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>验证码</Text>
            <TextInput placeholder={'请输入验证码'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={[styles.itemInput, { width: DEVICE_WIDTH - dp(180) - dp(60) - DEVICE_WIDTH * 0.3 }]}
              value={this.state.authcode}
              maxLength={6}
              onChangeText={text => {
                this.setState({
                  authcode: text
                })
              }}
            />
            {this.state.count === 0 ? (
              <Touchable style={styles.smsClickBtn} onPress={() => { this.getSmsCode() }}>
                <Text style={styles.smsBtn}>{'获取短信验证码'}</Text>
              </Touchable>
            ) : (
              <Text style={styles.countBtn}>
                {this.state.count + '秒后重新发送'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            this.certificationImmediately()
          }} style={styles.btn} text={'立即认证'} />
        </View>
        <Text style={{ fontSize: dp(28), padding: dp(30), lineHeight: dp(40), color: '#888888' }}>{'选择认证银行卡号需要注意以下事项：\n1、邮政储蓄银行、交通银行、平安银行、上海银行、北京银行、浦发银行、兴业银行、华夏银行需要开通无卡支付，中信银行需要开通无卡支付和金融短信通，光大银行需要开通光大银行的电子支付功能；\n2、地方性城商行需要开通银联在线支付；\n3、不支持浦发银行621793开头的卡号、浙江省农村信用社的卡进行认证；'}</Text>
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
    marginTop: dp(50)
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
  smsClickBtn: {
    width: DEVICE_WIDTH * 0.3,
    height: dp(90),
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    alignItems: 'center',
    justifyContent: 'center'
  },
  smsBtn: {
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    color: '#00b2a9',
    textAlign: 'center'
  },
  countBtn: {
    color: Color.TEXT_LIGHT,
    borderColor: Color.TEXT_LIGHT,
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    textAlign: 'center'
  }
})
