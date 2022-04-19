import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import CustomerService from '../../component/CustomerService'
import RegionPicker from '../../component/RegionPicker'
import Picker from 'react-native-picker'
import ajaxStore from '../../utils/ajaxStore'
import { showToast, formValid, assign } from '../../utils/Utility'
import { organType, userType, legalArea } from '../../utils/enums'
import { createDateData } from '../../utils/DateUtils'
import { DateData } from '../../utils/Date'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Iconfont from '../../iconfont/Icon'
import { connect } from 'react-redux'
import CheckBox from 'react-native-check-box'
import Touchable from '../../component/Touchable'
import {
  getCompanyInfo
} from '../../actions'
import {
  vIdcardNumber
} from '../../utils/reg'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'

/**
 * IdCardFontResult
 */
class EtcSign extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showShadow: false,
      form: {
        companyId: '',
        regNo: '',
        corpName: '',
        organType: '0', // 0普通企业 1社会团体 2事业单位 3民办非企业单位 4党政及国家机构
        userType: '2', // 1代理人注册 2法人注册
        legalArea: '0', // 0大陆 1香港 2澳门 3台湾 4外籍
        legalPersonName: '',
        legalPersonCertId: ''
      },
      rule: [
        {
          id: 'legalPersonCertId',
          required: true,
          reg: vIdcardNumber,
          name: '身份证号码'
        }
      ],
      organTypeStr: '',
      userTypeStr: '',
      legalAreaStr: '',
      checkbox: true,
      infoModal: false
    }
    this.save = this.save.bind(this)
    this.valid = this.valid.bind(this)
  }

  componentDidMount () {
    const { companyId, regNo, corpName, legalPerson, legalPersonCertId } = this.props.companyInfo
    const data = assign(this.state.form, {
      companyId,
      regNo,
      corpName,
      legalPersonCertId: vIdcardNumber.test(legalPersonCertId) ? legalPersonCertId : '',
      legalPersonName: legalPerson
    })
    this.setState({
      form: data,
      organTypeStr: organType[parseInt(this.state.form.organType)],
      userTypeStr: userType[parseInt(this.state.form.userType)],
      legalAreaStr: legalArea[parseInt(this.state.form.legalArea)]
    })
  }

  showShadow () {
    this.setState({ showShadow: true })
  }

  hideShadow () {
    this.setState({ showShadow: false })
  }

  valid () {
    Keyboard.dismiss()
    const { navigation } = this.props
    const valid = formValid(this.state.rule, this.state.form)
    if (valid.result && this.state.checkbox) {
      this.setState({
        infoModal: true
      })
    } else {
      global.alert.show({
        content: valid.msg || '请认真阅读并同意《用户授权协议》'
      })
    }
  }

  async save () {
    const { navigation } = this.props
    const res = await ajaxStore.contract.addOrganizeTemplateSeal(this.state.form)
    if (res.data && res.data.code === '0') {
      getCompanyInfo()
      const nextPage = navigation.state.params.nextPage || 'FaceIdentity'
      if (nextPage === 'FaceIdentity') {
        this.props.navigation.navigate('FaceIdentity', {
          idcardName: this.props.companyInfo.legalPerson,
          idcardNumber: this.state.form.legalPersonCertId
        })
      } else {
        this.props.navigation.navigate(nextPage)
      }
    }
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'生成电子签章'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.pageTitle}>需要您完善信息，以生成合同电子签章</Text>
            <Text style={styles.title}>企业电子签章信息补充</Text>
            {/* 企业名称 */}
            <View style={styles.line}>
              <Text style={styles.name}>企业名称</Text>
              <TextInput
                style={styles.input}
                value={this.state.form.corpName}
                editable={false}
                maxLength={100}
                keyboardType='default'
                placeholder={'请输入公司名称'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 单位类型 */}
            <View style={styles.line}>
              <Text style={styles.name}>单位类型</Text>
              <TextInput
                style={styles.input}
                value={this.state.organTypeStr}
                editable={false}
                keyboardType='default'
                placeholder={'请选择单位类型'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 注册类型 */}
            <View style={styles.line}>
              <Text style={styles.name}>注册类型</Text>
              <TextInput
                style={styles.input}
                value={this.state.userTypeStr}
                editable={false}
                keyboardType='default'
                placeholder={'请选择注册类型'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <Text style={styles.title}>法人电子签章信息补充</Text>
            {/* 姓名 */}
            <View style={styles.line}>
              <Text style={styles.name}>姓名</Text>
              <TextInput
                style={styles.input}
                value={this.state.form.legalPersonName}
                editable={false}
                maxLength={4}
                keyboardType='default'
                placeholder={'请输入姓名'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 身份证号码 */}
            <View style={styles.line}>
              <Text style={styles.name}>身份证号码</Text>
              <TextInput
                style={styles.input}
                value={this.state.form.legalPersonCertId}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    legalPersonCertId: text
                  })
                  this.setState({ form: data })
                }}
                maxLength={18}
                placeholder={'请输入身份证号码'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 身份证归属地 */}
            <View style={styles.line}>
              <Text style={styles.name}>身份证归属地</Text>
              <TextInput
                style={styles.input}
                value={this.state.legalAreaStr}
                editable={false}
                keyboardType='default'
                placeholder={'请选择身份证归属地'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            {/* 协议 */}
            <View style={styles.checkboxWrapper}>
              <CheckBox
                style={styles.checkbox}
                checkBoxColor={Color.TEXT_LIGHT}
                uncheckedCheckBoxColor={Color.TEXT_LIGHT}
                checkedCheckBoxColor={'#00b2a9'}
                onClick={() => {
                  this.setState({
                    checkbox: !this.state.checkbox
                  })
                }}
                isChecked={this.state.checkbox}
                checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                rightText={'我已阅读并同意'}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <Touchable
                style={styles.linkTextMain}
                onPress={() => {
                  navigation.navigate('AuthAgent')
                }}>
                <Text style={styles.linkText}>{'《用户授权协议》'}</Text>
              </Touchable>
            </View>
            {/* 按钮 */}
            <View style={styles.footer}>
              {formValid(this.state.rule, this.state.form).result && this.state.checkbox ? (
                <SolidBtn text='生成电子签章'
                  onPress={this.valid} />
              ) : (
                <SolidBtn style={styles.disabled} text='生成电子签章'
                  onPress={this.valid} />
              )}
            </View>
            <Modal
              onTouchOutside={() => {
                this.setState({ infoModal: false })
              }}
              width={0.9}
              visible={this.state.infoModal}
              onSwipeOut={() => this.setState({ infoModal: false })}
              modalAnimation={new ScaleAnimation({
                initialValue: 0.1, // optional
                useNativeDriver: true // optional
              })}
              onHardwareBackPress={() => {
                this.setState({ infoModal: false })
                return true
              }}
              footer={
                <ModalFooter>
                  <ModalButton
                    text="取消"
                    onPress={() => {
                      this.setState({
                        infoModal: false,
                        flag: 1
                      })
                    }}
                    key="button-1"
                    textStyle={{ color: Color.TEXT_MAIN, fontWeight: 'bold' }}
                  />
                  <ModalButton
                    text="确定"
                    onPress={() => {
                      this.setState({ infoModal: false })
                      this.save()
                    }}
                    key="button-2"
                    textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
                  />
                </ModalFooter>
              }
            >
              <ModalContent style={{ alignItems: 'stretch' }}>
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: dp(40),
                  textAlign: 'center',
                  marginBottom: dp(30)
                }}>请确认电子签章信息</Text>
                <Text style={styles.dialogText}>企业电子签章信息</Text>
                <Text style={styles.dialogText}>{`企业名称：${this.state.form.corpName}`}</Text>
                <Text style={styles.dialogText}>{`单位类型：${this.state.organTypeStr}`}</Text>
                <Text style={styles.dialogText}>{`注册类型：${this.state.userTypeStr}`}</Text>
                <Text style={styles.dialogText}>&nbsp;</Text>
                <Text style={styles.dialogText}>法人电子签章信息</Text>
                <Text style={styles.dialogText}>{`法人姓名：${this.state.form.legalPersonName}`}</Text>
                <Text style={styles.dialogText}>{`身份证号码：${this.state.form.legalPersonCertId}`}</Text>
                <Text style={styles.dialogText}>{`身份证归属地：${this.state.legalAreaStr}`}</Text>
              </ModalContent>
            </Modal>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebf2'
  },
  pageTitle: {
    fontSize: dp(34),
    color: '#000',
    paddingLeft: dp(30),
    paddingTop: dp(40),
    fontWeight: 'bold'
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#ebebf2'
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
    width: DEVICE_WIDTH * 0.3,
    paddingRight: dp(30),
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: '#000'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  reaioGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  radioButton: {
    width: dp(160),
    alignItems: 'center',
    paddingLeft: 0
  },
  footer: {
    flexDirection: 'row',
    padding: dp(40)
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingTop: dp(30),
    paddingHorizontal: dp(50)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.34
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10)
  },
  linkTextMain: {
  },
  linkText: {
    color: '#2ea2db'
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(7)
  },
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead'
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(EtcSign)
