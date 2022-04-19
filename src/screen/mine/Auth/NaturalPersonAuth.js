import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput, Linking } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import { SolidBtn, StrokeBtn } from '../../../component/CommonButton'
import { blurIdCard, bankIdCard, iphoneNo } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import {
  vPhone
} from '../../../utils/reg'
import { webUrl } from '../../../utils/config'
import { share } from '../../../utils/ShareUtil'

export default class NaturalPersonAuth extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      count: 0,
      bankCard: '',
      phoneNum: '',
      authcode: '',
      eFlowId: global.bankCard4Factors ? global.bankCard4Factors : '',
      personData: {}
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
    if (!vPhone.test(this.state.phoneNum)) {
      global.alert.show({
        content: '请填写正确的银行卡预留手机号'
      })
      return
    }
    const { navigation } = this.props
    const { item } = navigation.state.params
    const res = await ajaxStore.credit.bankCard4Factors({
      idcardName: item.personName,
      idcardNumber: item.personIdcard,
      bankCardNo: this.state.bankCard.replace(/\s+/g, ''), // 银行账号
      // idcardName: '李国庆',
      // idcardNumber: '411524199104050595',
      mobileNo: this.state.phoneNum
    })
    global.loading.hide()
    if (res.data && res.data.code === 0) {
      this.countCode(60)
      this.setState({
        eFlowId: res.data.data.flowId
      })
      global.bankCard4Factors = res.data.data.flowId
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 点击立即认证
  async taskSubmit (taskStackData) {
    const { navigation } = this.props
    const { item } = navigation.state.params
    const data = {
      memberId: item.personIdcard,
      taskId: taskStackData.taskId,
      isPass: 'Y',
      bankAccount: this.state.bankCard.replace(/\s+/g, ''), // 银行账号
      phoneNum: this.state.phoneNum, // 手机号码
      verifyCode: this.state.authcode,
      eFlowId: this.state.eFlowId
    }
    const res = await ajaxStore.credit.taskSubmit(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data.resultCode.toString() === '0') {
        navigation.navigate('EnterpriseRealAuthSuccess', { type: '1' })
      } else {
        navigation.navigate('EnterpriseRealAuthFail', { buzKey: { type: '1', resultMessage: res.data.data.resultMessage } })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 先调用列表接口查当前认证状态，然后如果已经开始，那么直接根据taskStack接口判断进入到哪个流程。如果没有开始流程，那么申请开始流程，然后再判断应该进入哪个流程
  async customerList (data) {
    if (this.state.bankCard.replace(/\s+/g, '').length < 1) {
      global.alert.show({
        content: '请填写正确的银行卡号'
      })
      return
    }
    if (!vPhone.test(this.state.phoneNum)) {
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
    const { navigation } = this.props
    const { item, transactorListData, type } = navigation.state.params
    global.loading.show()
    const res = await ajaxStore.credit.customerList({ cifCompanyId: transactorListData.customerCorpInfo.cifCompanyId })
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const personData = []
      personData.push(...data.agentPersonList)
      personData.push(...data.guarantorPersonList)
      personData.push(data.legalPeronInfo)
      console.log(personData)
      for (let i = 0; i < personData.length; i++) {
        if ((personData[i].personIdcard === item.personIdcard) && (personData[i].personType === item.personType)) {
          this.setState({
            personData: personData[i]
          })
        }
      }
      if (this.state.personData.personAuthStatus === '1') {
        if (this.state.personData.processId) {
          // 当前处于认证中,有processId
          this.taskStack(this.state.personData.processId)
        } else {
          // 当前处于认证中，没有processId
          this.startPersonAuth()
        }
      } else if (this.state.personData.personAuthStatus === '2') {
        // 当前处于认证成功
        if (type === '1') { // 为1的时候是必须要重新认证的，所以要重新开始流程
          this.startPersonAuth()
        } else {
          navigation.navigate('EnterpriseRealAuthSuccess', { type: '1' })
        }
      } else {
        // 当前处于其他状态
        this.startPersonAuth()
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 先开始流程在提交认证信息
  async startPersonAuth () {
    const { navigation } = this.props
    const { item, transactorListData } = navigation.state.params
    const data = {
      companyId: transactorListData.customerCorpInfo.cifCompanyId,
      supplierId: transactorListData.customerCorpInfo.cifSupplierId,
      corpName: transactorListData.legalPeronInfo.corpName,
      regNo: transactorListData.legalPeronInfo.personIdcard,
      personName: item.personName,
      personIdcard: item.personIdcard,
      startUser: item.personIdcard,
      personType: item.personType,
      businessKey: item.businessKey,
      status: 1
    }
    const res = await ajaxStore.credit.startPersonAuth(data)
    if (res.data && res.data.code === '0') {
      this.taskStack(res.data.data.processId)
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskStack (processId) {
    const data = {
      processInstanceId: processId,
      taskId: ''
    }
    const resa = await ajaxStore.credit.taskStack(data)
    if (resa.data && resa.data.code === '0') {
      this.taskSubmit(resa.data.data.currentTask)
    } else {
      global.alert.show({
        content: resa.data.message
      })
    }
  }

  // 转发认证
  forwardCertification () {
    // const { navigation } = this.props
    // navigation.navigate('WebView', { url: `${webUrl}/mine/NaturalPersonAuth?fileKey=aaaaaa`, title: '实名认证' })
    this.toWechat()
  }

  async toWechat () {
    const { navigation } = this.props
    const { item, transactorListData } = navigation.state.params
    // const supported = await Linking.canOpenURL('weixin://')
    // if (supported) {
    const { title, desc, url } = {
      title: '实名认证',
      desc: '实名认证',
      url: `${webUrl}/mine/NaturalPersonAuth?idcardNumber=${item.personIdcard}&companyId=${transactorListData.customerCorpInfo.cifCompanyId}&personType=${encodeURIComponent(item.personType)}&aaa=111`
    }
    // global.alert.show({
    //   content: url
    // })
    console.log('转发认证' + url)
    share(desc, url, title, (index, message) => {
      console.log(index + '--' + message)
    })
    // } else {
    //   console.log('请先安装微信')
    // }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  disabled () {
    return !(this.state.bankCard &&
      this.state.phoneNum &&
      this.state.authcode
    )
  }

  render () {
    const { navigation } = this.props
    const { item } = navigation.state.params
    return (
      <View style={styles.container}>
        <NavBar title={'实名认证'} navigation={navigation}
          onLeftPress = {() => {
            this.props.navigation.navigate('RealNameAuth')
          }}/>
        <View style={styles.centerStepBg}>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>姓名</Text>
            <Text style={{ fontSize: dp(28), marginLeft: dp(180), position: 'absolute', opacity: 0.5 }}>{item.personName}</Text>
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>身份证号</Text>
            <Text style={{ fontSize: dp(28), marginLeft: dp(180), position: 'absolute', opacity: 0.5 }}>{blurIdCard(item.personIdcard)}</Text>
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
              value={this.state.phoneNum}
              onChangeText={text => {
                this.setState({
                  phoneNum: text
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
            this.customerList()
          }} style={{ marginTop: dp(60), backgroundColor: !this.disabled() ? Color.THEME : Color.BTN_DISABLE }} text={'立即认证'} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <StrokeBtn text='转发认证' style={{ marginTop: dp(30) }} onPress={() => {
            this.forwardCertification()
          }} />
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
  smsClickBtn: {
    width: DEVICE_WIDTH * 0.3,
    height: dp(90),
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    alignItems: 'center',
    justifyContent: 'center'
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
    marginTop: dp(60),
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
