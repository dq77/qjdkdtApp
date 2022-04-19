
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import Modal, {
  ModalContent,
  ModalFooter
} from 'react-native-modal'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn } from '../../../component/CommonButton'

class OperationWarn extends PureComponent {
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
      infoModal: false,
      selectNum: 4,
      selectItemData: {},
      customerManageWarnDataVo: {},
      customerManageWarnPersonDataVo: {}
    }
  }

  // componentDidMount () {
  // }

  async customerGetCustomerManageWarnVo () {
    const data = {
      cifCompanyId: this.props.companyId
    }
    const res = await ajaxStore.company.customerGetCustomerManageWarnVo(data)
    if (res.data && res.data.code === '0') {
      const customerManageWarnDataVo = res.data.data.customerManageWarnDataVo
      const customerManageWarnPersonDataVo = res.data.data.customerManageWarnPersonDataVo
      if (customerManageWarnPersonDataVo.isMonthWarnShipmentAmountOne === 1) {
        this.setState({
          selectNum: 0,
          customerManageWarnDataVo: customerManageWarnDataVo,
          customerManageWarnPersonDataVo: customerManageWarnPersonDataVo
        })
      } else if (customerManageWarnPersonDataVo.isMonthWarnShipmentAmountTwo === 1) {
        this.setState({
          selectNum: 1,
          customerManageWarnDataVo: customerManageWarnDataVo,
          customerManageWarnPersonDataVo: customerManageWarnPersonDataVo
        })
      } else if (customerManageWarnPersonDataVo.isYearWarnShipmentAmountOne === 1) {
        this.setState({
          selectNum: 2,
          customerManageWarnDataVo: customerManageWarnDataVo,
          customerManageWarnPersonDataVo: customerManageWarnPersonDataVo
        })
      } else if (customerManageWarnPersonDataVo.isYearWarnShipmentAmountTwo === 1) {
        this.setState({
          selectNum: 3,
          customerManageWarnDataVo: customerManageWarnDataVo,
          customerManageWarnPersonDataVo: customerManageWarnPersonDataVo
        })
      } else {
        this.setState({
          selectNum: 4,
          customerManageWarnDataVo: customerManageWarnDataVo,
          customerManageWarnPersonDataVo: customerManageWarnPersonDataVo
        })
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async customerSaveCustomerManageWarn () {
    const data = {
      cifCompanyId: this.props.companyId,
      monthWarnShipmentAmountOne: this.state.selectNum === 0 ? 1 : 0,
      monthWarnShipmentAmountTwo: this.state.selectNum === 1 ? 1 : 0,
      yearWarnShipmentAmountOne: this.state.selectNum === 2 ? 1 : 0,
      yearWarnShipmentAmountTwo: this.state.selectNum === 3 ? 1 : 0
    }
    const res = await ajaxStore.company.customerSaveCustomerManageWarn(data)
    if (res.data && res.data.code === '0') {
      this.props.comfirm(this.state.selectItemData)
      setTimeout(() => {
        this.props.cancel()
      }, 500)
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  selectItemData (item, index) {
    this.setState({
      selectNum: index,
      selectItemData: item
    })
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
            infoModal: false,
            selectNum: 4,
            selectItemData: {}
          })
          this.props.cancel()
        }
        }
        onModalShow={() => {
          this.customerGetCustomerManageWarnVo()
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
            }} >
              <Text style={{ fontSize: dp(30), marginTop: dp(42), marginLeft: dp(30), color: '#1A97F6' }}>取消</Text>
            </Touchable>
            <Text style={{ fontSize: dp(34), marginTop: dp(42), marginLeft: dp(34), color: '#353535', fontWeight: 'bold' }}>经营预警</Text>
            <Touchable onPress={() => {
              this.customerSaveCustomerManageWarn()
            }} >
              <Text style={{ fontSize: dp(30), marginTop: dp(42), marginRight: dp(30), color: '#1A97F6' }}>完成</Text>
            </Touchable>
          </View>
          <SectionList
            //  stickySectionHeadersEnabled={false}// 关闭头部粘连
            style={{
              marginTop: dp(60),
              borderRadius: dp(16),
              marginHorizontal: dp(30)
            }}
            renderItem={
              ({ item, index, section }) =>
                <Touchable key={index} onPress={() => {
                  if (this.state.selectNum === index) {
                    this.setState({
                      selectNum: 4
                    })
                  } else {
                    this.selectItemData(item, index)
                  }
                }} >
                  <View key={index} style={[styles.itemCouponBG, { backgroundColor: this.state.selectNum === index ? '#5E608A' : '#F8F8FA', borderBottomRightRadius: index === 3 ? dp(16) : 0, borderBottomLeftRadius: index === 3 ? dp(16) : 0 }]}>
                    <Iconfont style={{ marginHorizontal: dp(30) }} name={this.state.selectNum === index ? 'xuanze' : 'select_weixuanzhong' } size={dp(32)}/>
                    <Text style = {[styles.textTipStyle, { color: this.state.selectNum === index ? 'white' : '#A7ADB0' }]}>{item.title}</Text>
                  </View>
                </Touchable>
            }
            sections={
              [
                {
                  title: '',
                  data: [
                    {
                      title: `本月出货金额低于上月${this.state.customerManageWarnDataVo.monthWarnShipmentAmountOneVal}%以上，启动预警`
                    },
                    {
                      title: `本月出货金额低于上月${this.state.customerManageWarnDataVo.monthWarnShipmentAmountTwoVal}%以上，启动预警`
                    },
                    {
                      title: `本月出货金额低于上年同期${this.state.customerManageWarnDataVo.yearWarnShipmentAmountOneVal}%以上，启动预警`
                    },
                    {
                      title: `本月出货金额低于上年同期${this.state.customerManageWarnDataVo.yearWarnShipmentAmountTwoVal}%以上，启动预警`
                    }
                  ]
                }]}
            keyExtractor={(item, index) => item + index}
          />
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
  }

})

export default OperationWarn
