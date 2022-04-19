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
import {
  vChineseName,
  vPassword,
  vSmsVerifyCode,
  vCompanyName,
  vPhone,
  vIdcardNumber
} from '../../utils/reg'

/**
 * IdCardFontResult
 */
export default class IDCardFrontResult extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      {
        id: 'name',
        required: true,
        reg: vChineseName,
        name: '姓名'
      },
      {
        id: 'gender',
        required: true,
        name: '性别'
      },
      {
        id: 'birthday',
        required: true,
        name: '出生日期'
      },
      {
        id: 'idcardNo',
        required: true,
        reg: vIdcardNumber,
        name: '身份证号码'
      },
      {
        id: 'address',
        required: true,
        name: '住址'
      }
    ]

    this.state = {
      showShadow: false,
      form: {
        name: '',
        gender: '男',
        birthday: '',
        idcardNo: '',
        address: '',
        fileKey: '',
        code: ''
      }
    }
  }

  async componentDidMount () {
    // await this.setState({
    //   form: {
    //     name: '辅导辅导',
    //     gender: '女',
    //     birthday: '1995-04-02',
    //     idcardNo: '1212',
    //     address: '222',
    //     fileKey: 'fd',
    //     code: 'dd'
    //   }
    // })

    // console.log(this.props.navigation.state.params)
    if (this.props.navigation.state.params) {
      const { name, gender, birthday, idcardNo, address, fileKey, code, fileKeyBack } = this.props.navigation.state.params
      if (fileKeyBack) {
        await this.setState({
          form: {
            name,
            gender: gender || '男',
            birthday,
            idcardNo,
            address,
            fileKey,
            code,
            fileKeyBack
          }
        })
      } else {
        await this.setState({
          form: {
            name,
            gender: gender || '男',
            birthday,
            idcardNo,
            address,
            fileKey,
            code
          }
        })
      }
    }

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
      selectedValue: this.state.form.birthday ? this.format(this.state.form.birthday).split('-') : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form, birthday: pickedValue.join('-')
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

  format=(dataStrArr) => {
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
        <NavBar title={'身份证正面'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>请核对以下内容</Text>
            {/* 姓名 */}
            <View style={styles.line}>
              <Text style={styles.name}>姓名</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, name: text } })
                }}
                value={this.state.form.name}
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
                selectedIndex={this.state.form.gender === '女' ? 1 : 0}
                onSelect={(index, value) => {
                  this.setState({ form: { ...this.state.form, gender: value } })
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
            {/* 出生日期 */}
            <View style={styles.line}>
              <Text style={styles.name}>出生日期</Text>
              <Text style={[styles.input, { paddingVertical: dp(20) }]} onPress={this.showDatePicker} >{this.state.form.birthday}</Text>
              <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
            </View>
            <View style={styles.splitLine} />
            {/* 身份证号码 */}
            <View style={styles.line}>
              <Text style={styles.name}>身份证号码</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, idcardNo: text } })
                }}
                value={this.state.form.idcardNo}
                maxLength={18}
                placeholder={'请输入身份证号码'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            {/* 住址 */}
            <View style={styles.line}>
              <Text style={styles.name}>住址</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, address: text } })
                }}
                value={this.state.form.address}
                maxLength={100}
                keyboardType='default'
                placeholder={'请输入住址'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
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
  }

  save = async () => {
    Keyboard.dismiss()
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
  }

})
