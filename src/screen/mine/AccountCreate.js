import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import ajaxStore from '../../utils/ajaxStore'
import { showToast, formValid } from '../../utils/Utility'
import Iconfont from '../../iconfont/Icon'
import { connect } from 'react-redux'
import Touchable from '../../component/Touchable'
import CheckBox from 'react-native-check-box'
import {
  getPaymentAccount
} from '../../actions'

/**
 * AccountCreate
 */
class AccountCreate extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      showShadow: false,
      checkbox: false,
      substituteType: ['银行', '支付宝'],
      form: {
        name: '',
        substituteType: '',
        account: ''
      },
      rule: [
        {
          id: 'name',
          required: true,
          name: '姓名'
        },
        {
          id: 'substituteType',
          required: true,
          name: '账户类型',
          requiredErrorMsg: '请选择账户类型'
        },
        {
          id: 'account',
          required: true,
          name: '支付账号'
        }
      ],
      type: '创建'
    }
  }

  async componentDidMount () {
    this.initPicker('1')
  }

  initPicker = (type) => {
    // 第一次进入的时候判断是否是修改状态，如果是，给他一个修改状态的初始化，后面再次进入就不用了
    const params = this.props.navigation.state.params || {}
    if (params.id && type === '1') {
      this.setState({
        type: '修改',
        form: {
          id: params.id,
          name: params.name,
          substituteType: [this.state.substituteType[params.type - 1]],
          account: params.account
        }
      })
      console.log(this.state.form.substituteType)
    }

    Picker.init({
      pickerData: this.state.substituteType,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择账户类型',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: params.type ? [this.state.substituteType[params.type - 1]] : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form, substituteType: pickedValue
          }
        })
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {

      }
    })
  }

  showDatePicker = () => {
    Keyboard.dismiss()
    this.showShadow()
    Picker.show()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
    this.initPicker('2')
  }

  save = async () => {
    Keyboard.dismiss()
    const { navigation } = this.props
    if (this.state.checkbox) {
      const valid = formValid(this.state.rule, this.state.form)
      if (valid.result) {
        let res
        const type = this.state.substituteType.indexOf(this.state.form.substituteType[0]) + 1
        this.state.form.id
          ? res = await ajaxStore.company.editIndividualAccount({ ...this.state.form, type }) : res = await ajaxStore.company.addIndividualAccount({ ...this.state.form, type })
        if (res.data && res.data.code === '0') {
          await getPaymentAccount()
          if (navigation.state.params && navigation.state.params.from === 'Mine') {
            navigation.replace('AccountList')
          } else {
            navigation.goBack()
          }
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

  render () {
    const { navigation } = this.props
    const { type } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={`${type}个人代付账户`} navigation={navigation} />
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>个人账户信息</Text>
            {/* 姓名 */}
            <View style={styles.line}>
              <Text style={styles.name}>姓名</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, name: text } })
                }}
                value={this.state.form.name}
                maxLength={50}
                keyboardType='default'
                placeholder={'请输入姓名'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 账户类型 */}
            <View style={styles.line}>
              <Text style={styles.name}>账户类型</Text>
              <Text style={[styles.input, { paddingVertical: dp(20) }]} onPress={this.showDatePicker} >{this.state.form.substituteType || '请选择账户类型'}</Text>
              <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
            </View>
            <View style={styles.splitLine} />
            {/* 支付账号 */}
            <View style={styles.line}>
              <Text style={styles.name}>支付账号</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, account: text } })
                }}
                value={this.state.form.account}
                maxLength={50}
                keyboardType='default'
                placeholder={'请输入支付账号'}
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
                rightText={''}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <View style={styles.linkTextMain}>
                <Text style={styles.normalText}>我已阅读并同意</Text>
                <Touchable
                  onPress={() => {
                    navigation.navigate('AgentContact', { name: this.state.form.name, account: this.state.form.account })
                  }}>
                  <Text style={styles.linkText}>{'《个人代付授权协议》'}</Text>
                </Touchable>
                <Text style={styles.normalText}>，添加后该个人账户的入账将被系统视为该企业的入账</Text>
              </View>
            </View>
            {/* 按钮 */}
            {formValid(this.state.rule, this.state.form).result && this.state.checkbox ? (
              <View style={styles.footer}>
                <SolidBtn text='确认添加'
                  style={{ flex: 1 }}
                  onPress={this.save} />
              </View>
            ) : (
              <View style={styles.footer}>
                <SolidBtn text='确认添加'
                  style={{ ...styles.disabled, flex: 1 }}
                  onPress={this.save} />
              </View>
            )}
          </View>
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}><View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
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
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    color: Color.TEXT_LIGHT,
    paddingHorizontal: dp(30),
    marginVertical: dp(50)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.08
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: dp(40)
  },
  normalText: {
    fontSize: dp(28),
    color: Color.THEME
  },
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead'
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo
  }
}

export default connect(mapStateToProps)(AccountCreate)
