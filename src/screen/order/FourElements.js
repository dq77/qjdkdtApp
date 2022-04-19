import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text,
  TextInput, DeviceEventEmitter
} from 'react-native'
import NavBar from '../../component/NavBar'
import EventTypes from '../../utils/EventTypes'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { setGoodsItems, setOrderSubmitData, setDefaultBaseInfo } from '../../actions/index'
import { formatTime, toAmountStr, formValid, showToast } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import { getRegionTextArr } from '../../utils/Region'
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import CheckBox from 'react-native-check-box'
import GoodsListComponent from './component/GoodsListComponent'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import {
  vAmount, vPhone
} from '../../utils/reg'
import { onEvent } from '../../utils/AnalyticsUtil'

class FourElements extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      { id: 'orderName', required: true, name: '订单名称' },
      { id: 'productCode', required: true, name: '产品' },
      { id: 'receiptPerson', required: true, name: '收货人' },
      { id: 'receiptPhone', required: true, reg: vPhone, name: '联系电话' },
      { id: 'provinceCode', required: true, name: '省市区' },
      { id: 'receiptAddress', required: true, name: '详细地址' },
      { id: 'items', required: true, name: '货物' }
    ]

    this.state = {
      options: {},
      legalPersonName: '',
      legalPersonCertId: '',
      cardNo: '',
      bankReservedMobile: '',
      verifyCode: '',
      count: '',
      codeSending: false,
      protocolChecked: true,
      alertModal: false,
      alertContent: ''
    }
  }

  componentDidMount () {
    this.lodaData()
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        if (obj.state && obj.state.params.refresh) {
          this.lodaData(obj.state.params.refresh)
          this.setState({
            codeSending: false,
            verifyCode: ''
          })
          this.timer && clearTimeout(this.timer)
          obj.state.params.refresh = false
        }
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
    this.timer && clearTimeout(this.timer)
  }

  async lodaData (isRefresh) {
    const res = await ajaxStore.order.getFourElements()
    if (res.data && res.data.code === '0') {
      this.setState({
        legalPersonName: res.data.data.legalPersonName,
        legalPersonCertId: res.data.data.legalPersonCertId,
        cardNo: !isRefresh ? res.data.data.cardNo : this.state.cardNo,
        bankReservedMobile: !isRefresh ? res.data.data.bankReservedMobile : this.state.bankReservedMobile
      })
    }
  }

  tapToBanks = () => {
    this.props.navigation.navigate('WebView', { url: 'https://webtools.qjdchina.com/supportBanks.html', title: '支持的银行' })
  }

  tapProtocol = () => {
    this.props.navigation.navigate('FourElementsProtocol')
  }

  catchGetCode = async () => {
    showToast('已发送')
    const res = await ajaxStore.common.newSendSmsCode({ phone: this.state.bankReservedMobile })
    if (res.data && res.data.code === '0') {
      this.setState({ codeSending: true })
      this.countCode(60)
    }
  }

  countCode (count) {
    if (count <= 0) {
      this.setState({
        codeSending: false
      })
    } else {
      this.setState({ count })
      count--
      this.timer = setTimeout(() => {
        this.countCode(count)
      }, 1000)
    }
  }

  bindSubmit = async () => {
    const data = {
      legalPersonName: this.state.legalPersonName,
      legalPersonCertId: this.state.legalPersonCertId,
      cardNo: this.state.cardNo,
      bankReservedMobile: this.state.bankReservedMobile
    }
    const navigation = this.props.navigation
    const verifyCode = this.state.verifyCode
    const { businessType, from } = this.props.navigation.state.params
    global.showError = false
    const res = await ajaxStore.order.authFourElements(verifyCode, data)
    global.showError = true
    if (res.data && res.data.code === '0') {
      if (from === 'orderCreate') {
        if (businessType === '4') {
          const { requestData } = this.props.navigation.state.params
          const result = await ajaxStore.order.createWkaOrder(requestData)
          if (result.data && result.data.data) {
            onEvent('提交订单', 'FourElements', '/ofs/front/wkaOrder/createWkaOrder', { orderNo: result.data.data })
            await AuthUtil.removeTempOrderInfo()
            await setDefaultBaseInfo({})
            await setGoodsItems([])
            DeviceEventEmitter.emit('orderListRefresh', {
              businessType
            })
            navigation.navigate('FourElementsResult', { result: true, businessType })
          }
        } else if (businessType === '1') {
          this.createOrder()
        }
      }
    } else if (res.data && res.data.code === '1') {
      navigation.navigate('FourElementsResult', { result: false, reason: res.data.message, fundSource: '1', businessType })
    } else {
      this.setState({ alertModal: true, alertContent: res.data.message })
    }
  }

  async createOrder () {
    const { requestData } = this.props.navigation.state.params
    const res = await ajaxStore.order.createOrder(requestData)
    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'FourElements', '/ofs/front/order/createRetailOrder', { orderNo: res.data.data })
      await AuthUtil.removeTempOrderInfo()
      DeviceEventEmitter.emit('orderListRefresh', {
        businessType: requestData.typeStatus
      })
      this.props.navigation.navigate('FourElementsResult', { result: true, businessType: requestData.typeStatus })
      // global.alert.show({
      //   content: '提交订单成功',
      //   callback: () => {
      //     DeviceEventEmitter.emit('orderListRefresh', {
      //       businessType: requestData.typeStatus
      //     })
      //     this.props.navigation.navigate('Order')
      //   }
      // })
    }
  }

  disabled () {
    return !(this.state.legalPersonName && this.state.legalPersonCertId && this.state.cardNo && this.state.bankReservedMobile && this.state.verifyCode && this.state.protocolChecked && this.state.bankReservedMobile.length === 11)
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'四要素鉴权'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            {/* 身份信息 */}
            <Text style={styles.title}>信息已安全加密，仅用于银行验证</Text>
            {/* 开户人姓名 */}
            <FormItemComponent
              title={'开户人姓名'}
              placeholder={'请输入开户人姓名'}
              value={this.state.legalPersonName}
              editable={false}
            />
            <View style={styles.splitLine} />
            {/* 身份证号码 */}
            <FormItemComponent
              title={'身份证号码'}
              placeholder={'请输入身份证号码'}
              maxLength={30}
              value={this.state.legalPersonCertId}
              editable={false}
            />
            {/* 银行卡 */}
            <Text style={styles.title}>所支持银行的一类卡账号<Text onPress={this.tapToBanks} style={{ color: '#5C94D6' }}>  点击查看支持的银行</Text></Text>
            {/* 身份证号码 */}
            <FormItemComponent
              title={'银行卡号'}
              placeholder={'请输入银行卡号'}
              maxLength={50}
              keyboardType={'numeric'}
              value={this.state.cardNo}
              onChangeText={text => {
                this.setState({ cardNo: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 手机号码 */}
            <FormItemComponent
              title={'手机号码'}
              placeholder={'请输入银行预留手机号码'}
              maxLength={11}
              keyboardType={'numeric'}
              value={this.state.bankReservedMobile}
              onChangeText={text => {
                this.setState({ bankReservedMobile: text })
              }}
            />
            {/* 验证码 */}
            <Text style={styles.title}>请输入银行预留手机收到的短信验证码</Text>
            <View style={styles.line}>
              <Text style={styles.name}>{'验证码'}</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ verifyCode: text })
                }}
                value={this.state.verifyCode}
                maxLength={6}
                keyboardType={'numeric'}
                placeholder={'请输入短信验证码'}
                placeholderTextColor={Color.TEXT_LIGHT} />
              {this.state.bankReservedMobile && this.state.bankReservedMobile.length === 11 && !this.state.codeSending
                ? <Text onPress={this.catchGetCode} style={styles.code}>获取短信验证码</Text>
                : !this.state.codeSending
                  ? <Text style={[styles.code, { color: '#888888' }]}>获取短信验证码</Text>
                  : <Text style={[styles.code, { color: '#888888' }]}>{`${this.state.count}秒后再次发送`}</Text>}

            </View>
            <View style={styles.checkline}>
              <CheckBox
                style={styles.checkbox}
                checkBoxColor={'red'}
                uncheckedCheckBoxColor={'#999'}
                checkedCheckBoxColor={'#00b2a9'}
                onClick={() => {
                  this.setState({
                    protocolChecked: !this.state.protocolChecked
                  })
                }}
                isChecked={this.state.protocolChecked}
                rightText={'我已阅读并同意'}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <Text onPress={this.tapProtocol} style={{ color: '#5C94D6' }}>《服务协议》</Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: dp(60) }}>
              <SolidBtn onPress={this.bindSubmit} text={'提交'} disabled={this.disabled()} />
            </View>
          </View>
        </ScrollView>
        <AlertModal
          title={'提示'}
          content={this.state.alertContent}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({ alertModal: false })
          }}
          confirm={async () => {
            this.setState({ alertModal: false })
          }}
          infoModal={this.state.alertModal} />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    erjiOrderSubmitData: state.order.erjiOrderSubmitData
  }
}

export default connect(mapStateToProps)(FourElements)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: dp(30),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20)
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(120),
    paddingHorizontal: dp(30),
    backgroundColor: 'white'
  },
  name: {
    width: DEVICE_WIDTH * 0.28,
    paddingRight: dp(30),
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  },
  code: {
    fontSize: dp(28),
    color: '#3DC2B8',
    padding: dp(12)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.37
  },
  checkline: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingTop: dp(30),
    paddingHorizontal: dp(30)
  }
})
