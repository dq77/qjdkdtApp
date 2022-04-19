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
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn } from '../../component/CommonButton'
import CustomerService from '../../component/CustomerService'
import RegionPicker from '../../component/RegionPicker'
import Picker from 'react-native-picker'
import ajaxStore from '../../utils/ajaxStore'
import { showToast, formValid } from '../../utils/Utility'
import { getRegionTextArr } from '../../utils/Region'
import {
  vChineseName,
  vPassword,
  vSmsVerifyCode,
  vCompanyName,
  vPhone
} from '../../utils/reg'

/**
 * CreditOther
 */
class CreditOther extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      {
        id: 'holderPhone',
        required: true,
        reg: vPhone,
        name: '手机号'
      },
      {
        id: 'holderSpousePhone',
        required: false,
        reg: vPhone,
        name: '配偶手机号'
      },
      {
        id: 'liveArea',
        required: true,
        name: '实际居住地'
      },
      {
        id: 'livePlace',
        required: true,
        name: '详细地址'
      },
      {
        id: 'operatingTime',
        required: true,
        name: '行业从业年限'
      },
      {
        id: 'officeOwnership',
        required: true,
        name: '经营地所有权'
      },
      {
        id: 'officeArea',
        required: true,
        name: '经营地地址'
      },
      {
        id: 'officeAddress',
        required: true,
        name: '详细地址'
      },
      {
        id: 'contactsPerson',
        required: true,
        reg: vChineseName,
        name: '紧急联系人姓名'
      },
      {
        id: 'contactsPhone',
        required: true,
        reg: vPhone,
        name: '紧急联系人手机号'
      }
    ]
    this.ownership = [
      '自购',
      '租赁'
    ]
    this.state = {
      showShadow: false,
      selectedValue1: this.spliteAddressCode(this.props.otherInfo.liveArea),
      selectedValue2: this.spliteAddressCode(this.props.otherInfo.officeArea),
      form: {
        holderPhone: '',
        holderSpousePhone: '',
        liveArea: '',
        livePlace: '',
        operatingTime: '',
        officeOwnership: 0,
        officeArea: '',
        officeAddress: '',
        contactsPerson: '',
        contactsPhone: ''
      }
    }
  }

  componentDidMount () {
    const {
      holderPhone, holderSpousePhone, liveArea, livePlace,
      operatingTime, officeOwnership, officeArea, officeAddress,
      contactsPerson, contactsPhone
    } = this.props.otherInfo

    this.setState({
      form: {
        holderPhone,
        holderSpousePhone,
        liveArea,
        livePlace,
        operatingTime: operatingTime ? operatingTime.toString() : '',
        officeOwnership,
        officeArea,
        officeAddress,
        contactsPerson,
        contactsPhone
      }
    })
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'其他'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View >
            {/* 身份信息 */}
            <Text style={styles.title}>身份信息</Text>
            <View style={styles.line}>
              <Text style={styles.name}>手机号</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, holderPhone: text } })
                }}
                value={this.state.form.holderPhone}
                maxLength={11}
                keyboardType='numeric'
                placeholder={'请输入实控人手机号'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>配偶手机号</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, holderSpousePhone: text } })
                }}
                value={this.state.form.holderSpousePhone}
                maxLength={11}
                keyboardType='numeric'
                placeholder={'请输入实控人配偶手机号（选填）'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>实际居住地</Text>
              <RegionPicker
                style={styles.input}
                selectedValue={this.state.selectedValue1}
                ref={view => { this.picker1 = view }}
                onPickerConfirm={(data) => {
                  this.setState({ form: { ...this.state.form, liveArea: data.areaCode } })
                }}
                onOpen={this.showShadow}
                onClose={this.hideShadow}
              />

            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>详细地址</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, livePlace: text } })
                }}
                value={this.state.form.livePlace}
                maxLength={100}
                placeholder={'请输入详细地址'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            {/* 经营信息 */}
            <Text style={styles.title}>经营信息</Text>
            <View style={styles.line}>
              <Text style={styles.name}>行业从业年限</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, operatingTime: text } })
                }}
                value={this.state.form.operatingTime}
                keyboardType='numeric'
                placeholder={'请输入数字'}
                maxLength={2}
                placeholderTextColor={Color.TEXT_LIGHT} />
              <Text style={{ fontSize: dp(28) }}>年</Text>
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>经营地所有权</Text>
              <TextInput
                style={styles.input}
                placeholder={'请选择'}
                editable={false}
                value={ this.state.form.officeOwnership === 1 ? '自购'
                  : this.state.form.officeOwnership === 2 ? '租赁'
                    : ''}
                placeholderTextColor={Color.TEXT_LIGHT} />
              <TouchableOpacity style={styles.touchItem} activeOpacity={1} onPress={() => { this.showOwnerShipDialog() }}></TouchableOpacity>
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>经营地地址</Text>
              <RegionPicker
                style={styles.input}
                ref={view => { this.picker2 = view }}
                selectedValue={this.state.selectedValue2}
                onPickerConfirm={(data) => {
                  console.log(data)
                  this.setState({ form: { ...this.state.form, officeArea: data.areaCode } })
                }}
                onOpen={this.showShadow}
                onClose={this.hideShadow}
              />
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>详细地址</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, officeAddress: text } })
                }}
                value={this.state.form.officeAddress}
                maxLength={100}
                placeholder={'请输入详细地址'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            {/* 紧急联系人 */}
            <Text style={styles.title}>紧急联系人</Text>
            <View style={styles.line}>
              <Text style={styles.name}>姓名</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, contactsPerson: text } })
                }}
                value={this.state.form.contactsPerson}
                maxLength={10}
                placeholder={'请输入姓名'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.splitLine} />
            <View style={styles.line}>
              <Text style={styles.name}>联系人手机号</Text>
              <TextInput
                style={styles.input}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, contactsPhone: text } })
                }}
                value={this.state.form.contactsPhone}
                maxLength={11}
                keyboardType='numeric'
                placeholder={'请输入联系人手机号'}
                placeholderTextColor={Color.TEXT_LIGHT} />
            </View>
            <View style={styles.footer}>
              <SolidBtn text='保存'
                style={{ marginTop: dp(40) }}
                onPress={this.save} />
              <CustomerService style={{ marginBottom: dp(100) }} navigation={navigation} />
            </View>
          </View>
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            this.picker1.hide()
            this.picker2.hide()
            Picker.hide()
            this.hideShadow()
          }}><View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
      </View>
    )
  }

  showOwnerShipDialog = () => {
    Keyboard.dismiss()
    Picker.init({
      pickerData: this.ownership,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择经营地所有权',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: this.state.form.officeOwnership === 2 ? ['租赁'] : ['自购'],
      onPickerConfirm: (data, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form,
            officeOwnership: data[0] === '自购' ? 1 : 2
          }
        })
        this.hideShadow()
      },
      onPickerCancel: (data, pickedIndex) => { this.hideShadow() }
    })
    Picker.show()
    this.showShadow()
  }

  spliteAddressCode (code) {
    return code ? getRegionTextArr(
      code.substr(0, 2),
      code.substr(0, 4),
      code
    ) : []
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  save = async () => {
    const { navigation } = this.props
    const valid = formValid(this.rule, this.state.form)
    if (valid.result) {
      const res = await ajaxStore.credit.saveOtherInfo(this.state.form)
      if (res.data && res.data.code === '0') {
        // showToast('保存成功')
        navigation.goBack()
        navigation.state.params.refresh()
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }
}

const mapStateToProps = state => {
  console.log(state)
  return {
    otherInfo: state.credit.otherInfo
  }
}

export default connect(mapStateToProps)(CreditOther)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
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
    paddingBottom: dp(20),
    backgroundColor: '#f0f0f0'
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(120),
    paddingHorizontal: dp(30)
  },
  name: {
    width: DEVICE_WIDTH * 0.3,
    paddingRight: dp(30),
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }

})
