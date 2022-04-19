import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn } from '../../component/CommonButton'
import ajaxStore from '../../utils/ajaxStore'
import { showToast, formValid, deepCopy } from '../../utils/Utility'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Iconfont from '../../iconfont/Icon'
import {
  vChineseName,
  vIdcardNumber
} from '../../utils/reg'
import Touchable from '../../component/Touchable'
import CheckBox from 'react-native-check-box'
import { connect } from 'react-redux'
import { getLocation } from '../../utils/LocationUtils'
import {
  setFaceExtraData
} from '../../actions'

/**
 * AgentCreate
 */
class AgentCreate extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      {
        id: 'agentName',
        required: true,
        reg: vChineseName,
        name: '姓名'
      },
      {
        id: 'agentGender',
        required: true,
        name: '性别'
      },
      {
        id: 'agentNumber',
        required: true,
        reg: vIdcardNumber,
        name: '身份证号码'
      },
      {
        id: 'agentAddress',
        required: true,
        name: '委托人地址'
      }
    ]

    this.state = {
      showShadow: false,
      form: {
        agentName: '',
        agentGender: '男',
        agentNumber: '',
        agentAddress: ''
      },
      fileKey: '',
      checkbox: true
    }
    this.previdwContractAgent = this.previdwContractAgent.bind(this)
  }

  componentDidMount () {
    this.getAgentTemplate()
  }

  async getAgentTemplate () {
    const res = await ajaxStore.contract.getAgentTemplate()
    if (res.data && res.data.code === '0') {
      this.setState({
        fileKey: res.data.data.fileKey
      })
    }
  }

  previewContract (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey || this.state.fileKey })
  }

  save = async () => {
    Keyboard.dismiss()
    if (this.state.checkbox) {
      const { navigation } = this.props
      const valid = formValid(this.rule, this.state.form)
      if (valid.result) {
        const res = await ajaxStore.contract.checkAgent({ agentNumber: this.state.form.agentNumber })
        if (res.data && res.data.code === '0') {
          this.saveFaceExtraData()
        }
      } else {
        global.alert.show({
          content: valid.msg
        })
      }
    } else {
      global.alert.show({
        content: '请先阅读并同意相关协议及合同'
      })
    }
  }

  async saveFaceExtraData () {
    const { navigation } = this.props
    global.loading.show()
    const map = await getLocation()
    if (!map) {
      global.loading.hide()
      this.props.navigation.goBack()
      return
    }
    const contractVO = JSON.stringify({
      type: '29',
      signName: this.props.companyInfo.legalPerson,
      lng: map.longitude,
      lat: map.latitude
    })
    const contractAgentVO = JSON.stringify({
      agentName: this.state.form.agentName.trim(),
      agentGender: this.state.form.agentGender === '男' ? '1' : '2',
      agentNumber: this.state.form.agentNumber.trim(),
      agentAddress: this.state.form.agentAddress.trim()
    })
    await setFaceExtraData({
      contractVO,
      contractAgentVO,
      contractType: navigation.state.params.typePage === '1' ? '29' : '29.1'
    })
    console.log(contractAgentVO, 'contractAgentVO')
    this.goFaceIdentity()
    global.loading.hide()
  }

  async previdwContractAgent () {
    const contractAgentVO = deepCopy(this.state.form)
    console.log(JSON.stringify(contractAgentVO, 'contractAgentVO'))
    contractAgentVO.agentGender = contractAgentVO.agentGender === '男' ? '1' : '2'
    const res = await ajaxStore.contract.previewContractAgent({ contractAgentVO: JSON.stringify(contractAgentVO) })
    if (res.data && res.data.code === '0') {
      this.previewContract(res.data.data)
    }
  }

  goFaceIdentity () {
    const { legalPerson, legalPersonCertId } = this.props.companyInfo
    this.props.navigation.navigate('FaceIdentity', {
      idcardName: legalPerson,
      idcardNumber: legalPersonCertId
    })
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'添加授权委托人'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>补充被委托人信息</Text>
            {/* 姓名 */}
            <View style={styles.line}>
              <Text style={styles.name}>姓名</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, agentName: text } })
                }}
                value={this.state.form.agentName}
                maxLength={10}
                keyboardType='default'
                placeholder={'请输入姓名'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 性别 */}
            <View style={styles.line}>
              <Text style={styles.name}>性别</Text>
              <RadioGroup
                style={styles.reaioGroup}
                color={Color.WX_GREEN}
                selectedIndex={this.state.form.agentGender === '女' ? 1 : 0}
                onSelect={(index, value) => {
                  this.setState({ form: { ...this.state.form, agentGender: value } })
                }}
              >
                <RadioButton value={'男'} style={styles.radioButton} >
                  <Text>男</Text>
                </RadioButton>
                <RadioButton value={'女'} style={styles.radioButton}>
                  <Text>女</Text>
                </RadioButton>
              </RadioGroup>
            </View>
            <View style={styles.splitLine} />
            {/* 身份证号码 */}
            <View style={styles.line}>
              <Text style={styles.name}>身份证号码</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, agentNumber: text } })
                }}
                value={this.state.form.agentNumber}
                maxLength={18}
                placeholder={'请输入身份证号码'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 委托人地址 */}
            <View style={styles.line}>
              <Text style={styles.name}>委托人地址</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, agentAddress: text } })
                }}
                value={this.state.form.agentAddress}
                maxLength={100}
                keyboardType='default'
                placeholder={'请输入委托人住址'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <Text style={styles.title}>授权委托协议</Text>
            <Touchable isNativeFeedback={true} onPress={() => { this.previewContract() }}>
              <View style={styles.detailItem}>
                <View style={styles.label}>
                  <Iconfont name='icon-pdf1' size={dp(50)} />
                  <Text style={styles.contractName}>授权委托协议</Text>
                </View>
                <Iconfont name='arrow-right1' size={dp(30)} />
              </View>
            </Touchable>
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
                rightText={''}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <View style={styles.linkTextMain}>
                <Text style={styles.normalText}>我已阅读并同意签署</Text>
                <Touchable
                  onPress={() => {
                    this.previdwContractAgent()
                  }}>
                  <Text style={styles.linkText}>{'《授权委托协议》'}</Text>
                </Touchable>
              </View>
            </View>
            {/* 按钮 */}
            {formValid(this.rule, this.state.form).result && this.state.checkbox ? (
              <View style={styles.footer}>
                <SolidBtn text='立即签署'
                  style={{ flex: 1 }}
                  onPress={this.save} />
              </View>
            ) : (
              <View style={styles.footer}>
                <SolidBtn text='立即签署'
                  style={{ flex: 1, ...styles.disabled }}
                  onPress={this.save} />
              </View>
            )}

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
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#ebebf2'
  },
  title: {
    fontSize: dp(34),
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
    color: Color.TEXT_DARK
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
  detailItem: {
    backgroundColor: Color.WHITE,
    padding: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderBottomColor: Color.SPLIT_LINE
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  contractName: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.77
  },
  linkTextMain: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    width: DEVICE_WIDTH * 0.8
  },
  linkText: {
    color: '#2ea2db'
  },
  normalText: {
    fontSize: dp(28)
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    color: Color.TEXT_LIGHT,
    paddingHorizontal: dp(30),
    marginTop: dp(50)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.08
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
  },
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead'
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AgentCreate)
