
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, TextInput } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import Modal from 'react-native-modal'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn } from '../../../component/CommonButton'
import { DateData } from '../../../utils/Date'
import { CompareDate } from '../../../utils/DateUtils'
import Picker from 'react-native-picker'

class TimePeriodSelection extends PureComponent {
  static defaultProps = {
    cancel: function () { },
    comfirm: function () { },
    companyId: ''

  }

  static propTypes = {
    companyId: PropTypes.string.isRequired,
    infoModal: PropTypes.bool.isRequired,
    cancel: PropTypes.func,
    comfirm: PropTypes.func
  }

  static getDerivedStateFromProps (nextProps, prevPros) {
    return {
      infoModal: nextProps.infoModal
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      orderStartTime: this.props.orderStartTime, // 上月第一天
      orderEndTime: this.props.orderEndTime// 上月最后一天
    }
  }

  hideShadow = () => {
    Picker.hide()
  }

  format = (dataStrArr) => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  showStartDatePicker = (type) => {
    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: type === 1 ? '请选择对账单起始日' : '请选择对账单截止日',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: type === 1 ? (this.state.orderStartTime ? this.format(this.state.orderStartTime).split('-') : []) : (this.state.orderEndTime ? this.format(this.state.orderEndTime).split('-') : []),
      onPickerConfirm: (pickedValue, pickedIndex) => {
        let m = '0'
        let d = '0'
        if (pickedValue[1].length < 2) {
          m = '0' + pickedValue[1]
        } else {
          m = pickedValue[1]
        }
        if (pickedValue[2].length < 2) {
          d = '0' + pickedValue[2]
        } else {
          d = pickedValue[2]
        }
        pickedValue = [pickedValue[0], m, d]
        if (type === 1) {
          this.setState({
            orderStartTime: pickedValue.join('-')
          })
        } else {
          this.setState({
            orderEndTime: pickedValue.join('-')
          })
        }
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {

      }
    })
    Picker.show()
  }

  render () {
    return (
      <Modal
        style={styles.modal}
        isVisible={this.state.infoModal}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        coverScreen={true}
        hasBackdrop={true}
        backdropTransitionInTiming={0}
        // onBackdropPress={() => this.setModalVisible(false)}
        onBackButtonPress={() => {
          this.setState({
            infoModal: false
          })
          this.props.cancel()
        }
        }
        onModalShow={() => {
          // this.customerGetCustomerManageWarnVo()
        }}
        onHardwareBackPress={() => {
          this.props.cancel()
          return true
        }}
      >
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Touchable onPress={() => {
              this.props.cancel()
              this.hideShadow()
            }} >
              <Text style={{ fontSize: dp(30), marginTop: dp(42), marginLeft: dp(30), color: '#1A97F6' }}>取消</Text>
            </Touchable>
            <Text style={{ fontSize: dp(34), marginTop: dp(42), marginLeft: dp(34), color: '#353535', fontWeight: 'bold' }}>自定义对账单</Text>
            <Touchable onPress={() => {
            }} >
              <Text style={{ fontSize: dp(30), marginTop: dp(42), marginRight: dp(30), color: 'white' }}>完成</Text>
            </Touchable>
          </View>
          <Text style={{ fontSize: dp(32), marginTop: dp(66), marginLeft: dp(34), color: '#353535', fontWeight: 'bold' }}>筛选时间段</Text>
          <View style={{ marginTop: dp(40), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ marginLeft: dp(30), width: dp(320), height: dp(88), borderRadius: dp(16), borderColor: Color.SPLIT_LINE, borderWidth: dp(2), justifyContent: 'center' }}>
              <TextInput
                placeholder={'起始日'}
                placeholderTextColor={Color.TEXT_LIGHT}
                style={{ marginLeft: dp(30), color: '#2D2926', fontSize: dp(28) }}
                editable={false}
                value={this.state.orderStartTime}
              />
              <Touchable style={styles.touchItem} onPress={() => {
                this.showStartDatePicker(1)
              }}></Touchable>
            </View>
            <View style={{ backgroundColor: Color.SPLIT_LINE, height: dp(1), width: dp(30) }}></View>
            <View style={{ marginRight: dp(30), width: dp(320), height: dp(88), borderRadius: dp(16), borderColor: Color.SPLIT_LINE, borderWidth: dp(2), justifyContent: 'center' }}>
              <TextInput
                placeholder={'截止日'}
                placeholderTextColor={Color.TEXT_LIGHT}
                style={{ marginLeft: dp(30), color: '#2D2926', fontSize: dp(28) }}
                editable={false}
                value={this.state.orderEndTime}
              />
              <Touchable style={styles.touchItem} onPress={() => {
                this.showStartDatePicker(2)
              }}></Touchable>
            </View>
          </View>
          <View>
            <SolidBtn
              style={{ marginLeft: dp(30), marginTop: dp(80), marginBottom: dp(80), backgroundColor: Color.THEME, borderRadius: dp(48) }}
              text={'生成对账单'}
              onPress={() => {
                console.log(this.state.orderStartTime, this.state.orderEndTime)
                if (CompareDate(this.state.orderStartTime, this.state.orderEndTime)) {
                  this.hideShadow()
                  this.props.cancel()
                  global.alert.show({
                    content: '结束时间不能早于开始时间'
                  })
                } else {
                  this.props.comfirm(this.state.orderStartTime, this.state.orderEndTime)
                  this.hideShadow()
                  this.props.cancel()
                }
              }}
            />
          </View>

        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: dp(40),
    textAlign: 'center',
    marginBottom: dp(30)
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: dp(8),
    borderTopRightRadius: dp(8),
    marginTop: dp(128),
    height: DEVICE_HEIGHT - dp(128),
    width: DEVICE_WIDTH
  },
  modal: {
    margin: 0,
    justifyContent: 'center'
  },
  itemCouponBG: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(96)
  },
  couponBG: {
    marginTop: dp(30),
    height: dp(320)
  },
  textTitleStyle: {
    marginTop: dp(72),
    marginLeft: dp(42),
    color: 'white',
    fontSize: dp(24)
  },
  textTipStyle: {
    marginTop: dp(15),
    color: 'white',
    fontSize: dp(24)
  },
  textMoneyStyle: {
    marginLeft: dp(30),
    color: 'white',
    fontSize: dp(60)
  },
  textStatusStyle: {
    marginTop: dp(20),
    marginLeft: dp(30),
    color: 'white',
    fontSize: dp(20)
  },
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }

})

export default TimePeriodSelection
