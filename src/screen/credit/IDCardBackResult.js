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
import { showToast, formValid } from '../../utils/Utility'
import { createDateData } from '../../utils/DateUtils'
import { DateData } from '../../utils/Date'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Iconfont from '../../iconfont/Icon'
import Switch from '../../component/Switch'
import {
  vChineseName,
  vPassword,
  vSmsVerifyCode,
  vCompanyName,
  vPhone
} from '../../utils/reg'

export default class IDCardBackResult extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      showShadow: false,
      form: {
        isforever: false,
        idcardStartData: '',
        idcardEffectiveData: '',
        fileKeyBack: '',
        code: ''
      }
    }
    this.rule = [
      {
        id: 'idcardStartData',
        required: true,
        name: '身份证起始日'
      },
      {
        id: 'idcardEffectiveData',
        required: true,
        name: '身份证截止日'
      }
    ]
  }

  componentDidMount () {
    // this.setState({
    //   form: {
    //     isforever: true,
    //     idcardStartData: '1990-04-07',
    //     idcardEffectiveData: '2040-03-02',
    //     fileKeyBack: 'fdfdfdf',
    //     code: 'dfdf'
    //   }
    // })

    if (this.props.navigation.state.params) {
      const { isforever, idcardStartData, idcardEffectiveData, fileKeyBack, code, fileKey } = this.props.navigation.state.params
      if (fileKey) {
        this.setState({
          form: {
            isforever,
            idcardStartData,
            idcardEffectiveData,
            fileKeyBack,
            code,
            fileKey
          }
        })
      } else {
        this.setState({
          form: {
            isforever,
            idcardStartData,
            idcardEffectiveData,
            fileKeyBack,
            code
          }
        })
      }

      this.rule[1].required = !isforever
    }
  }

  format = (dataStrArr) => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'身份证背面'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>请核对以下内容</Text>
            {/* 长期有效 */}
            <View style={styles.line}>
              <Text style={styles.name}>长期有效</Text>
              <Switch
                style={styles.switch}
                width={50}
                height={28}
                value={this.state.form.isforever}
                onSyncPress={value => {
                  this.setState({
                    form: {
                      ...this.state.form,
                      isforever: value
                    }
                  })
                  this.rule[1].required = !value
                }}
              />
            </View>
            <View style={styles.splitLine} />

            {/* 身份证起始日 */}
            <View style={styles.line}>
              <Text style={styles.name}>身份证起始日</Text>
              <Text style={styles.input} onPress={this.showStartDatePicker} >{this.state.form.idcardStartData}</Text>
              <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
            </View>
            <View style={styles.splitLine} />
            {/* 身份证截止日 */}
            {this.state.form.isforever
              ? null
              : <View style={styles.line}>
                <Text style={styles.name}>身份证截止日</Text>
                <Text style={styles.input} onPress={this.showEndDatePicker} >{this.state.form.idcardEffectiveData}</Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
              </View>
            }
            {/* 按钮 */}
            <View style={styles.footer}>
              <SolidBtn text='重传照片'
                style={{ flex: 1 }}
                onPress={this.reUpload} />
              <StrokeBtn text='提交'
                style={{ flex: 1, marginLeft: dp(40) }}
                onPress={this.save} />
            </View>
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

  showStartDatePicker = () => {
    Keyboard.dismiss()

    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择出生日期',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: this.state.form.idcardStartData ? this.format(this.state.form.idcardStartData).split('-') : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form,
            idcardStartData: pickedValue.join('-')
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
    this.showShadow()
    Picker.show()
  }

  showEndDatePicker = () => {
    Keyboard.dismiss()

    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择出生日期',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: this.state.form.idcardEffectiveData ? this.format(this.state.form.idcardEffectiveData).split('-') : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form,
            idcardEffectiveData: pickedValue.join('-')
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
    this.showShadow()
    Picker.show()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  save = async () => {
    Keyboard.dismiss()
    // console.log(this.state.form)
    // console.log(this.rule)
    const { navigation } = this.props
    const valid = formValid(this.rule, this.state.form)
    if (valid.result) {
      const res = await ajaxStore.credit.saveIdcard(this.state.form)
      if (res.data && res.data.code === '0') {
        showToast('保存成功')
        navigation.state.params.submit(this.state.form)
        navigation.goBack()
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  reUpload = async () => {
    Keyboard.dismiss()
    this.props.navigation.goBack()
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
    width: DEVICE_WIDTH * 0.4,
    paddingRight: dp(30),
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingVertical: dp(20)
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
  switch: {
    position: 'absolute',
    right: dp(30)
  }

})
