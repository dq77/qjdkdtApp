import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import { PropTypes } from 'prop-types'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'
import AlertPage from '../../../component/AlertPage'
import RegionPicker from '../../../component/RegionPicker'
import { getRegionTextArr } from '../../../utils/Region'
import { formValid } from '../../../utils/Utility'
import { vPhone, vChineseName } from '../../../utils/reg'

export default class ReceiveInfoEdit extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    phone: PropTypes.string,
    provinceCode: PropTypes.string,
    cityCode: PropTypes.string,
    areaCode: PropTypes.string,
    address: PropTypes.string,
    cancel: PropTypes.func,
    confirm: PropTypes.func
  }

  static defaultProps = {
    name: '',
    phone: '',
    provinceCode: '',
    cityCode: '',
    areaCode: '',
    address: '',
    cancel: function () { },
    confirm: function () { }
  }

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      phone: '',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      address: '',
      showAddress: '',
      rule: [
        {
          id: 'name',
          required: true,
          reg: vChineseName,
          name: '收货人姓名'
        },
        {
          id: 'phone',
          required: true,
          reg: vPhone,
          name: '收货人手机号码'
        },
        {
          id: 'provinceCode',
          required: true,
          name: '收货地区'
        },
        {
          id: 'address',
          required: true,
          name: '收货人详细地址'
        }
      ]
    }
    this.changeData = this.changeData.bind(this)
  }

  componentDidMount () {
    const { name, phone, provinceCode, cityCode, areaCode, address } = this.props
    const showAddress = provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode) : ''
    this.setState({
      name,
      phone,
      showAddress,
      provinceCode,
      cityCode,
      areaCode,
      address
    })
  }

  changeData (data) {
    this.setState(data)
  }

  renderFrom (name, showAddress, phone, address) {
    return (
      <View>
        <View style={styles.formItem}>
          <Text style={styles.name}>收货人姓名</Text>
          <TextInput
            placeholder={'请输入收货人姓名'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={name}
            onChangeText={text => {
              this.changeData({ name: text })
            }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>收货人手机号码</Text>
          <TextInput
            placeholder={'请输入收货人手机号码'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={phone}
            maxLength={11}
            onChangeText={text => {
              console.log(this)
              this.changeData({ phone: text })
            }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>收货地区</Text>
          <View style={[styles.input, styles.picker]}>
            <RegionPicker
              ref={o => { this.RegionPicker = o }}
              fontSize={28}
              onPress={this.showShadow}
              monitorChange={true}
              selectedValue={showAddress}
              onPickerConfirm={(data) => {
                this.changeData({
                  provinceCode: data.provinceCode,
                  cityCode: data.cityCode,
                  areaCode: data.areaCode,
                  showAddress: data.label.split(' ')
                })
              }} />
          </View>
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>收货人详细地址</Text>
          <TextInput
            placeholder={'请输入收货人姓名'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={address}
            maxLength={100}
            onChangeText={text => {
              this.changeData({ address: text })
            }}
          />
        </View>
      </View>
    )
  }

  render () {
    const { name, showAddress, phone, address } = this.state
    return (
      <AlertPage
        title={'编辑收货地址'}
        render={() => {
          return this.renderFrom(name, showAddress, phone, address)
        }}
        comfirmText={'下一步'}
        cancel={() => {
          this.props.cancel()
          this.RegionPicker.hide()
        }}
        confirm={async () => {
          this.RegionPicker.hide()
          const valid = formValid(this.state.rule, this.state)
          if (valid.result) {
            this.props.confirm(this.state)
            this.props.cancel()
          } else {
            global.alert.show({
              content: valid.msg
            })
          }
        }}
        infoModal={this.props.infoModal} />
    )
  }
}

const styles = StyleSheet.create({
  name: {
    marginBottom: dp(24)
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    paddingVertical: dp(15),
    fontSize: dp(28)
  },
  formItem: {
    marginBottom: dp(48)
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0
  }
})
