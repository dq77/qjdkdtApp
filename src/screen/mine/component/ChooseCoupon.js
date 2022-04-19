
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import Modal from 'react-native-modal'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn } from '../../../component/CommonButton'

class ChooseCoupon extends PureComponent {
  static defaultProps = {
    cancel: function () { },
    comfirm: function () { },
    companyId: ''

  }

  static propTypes = {
    companyId: PropTypes.string.isRequired,
    infoModal: PropTypes.bool.isRequired,
    cancel: PropTypes.func,
    comfirm: PropTypes.func,
    scene: PropTypes.string.isRequired // 会员抵扣传 2   ，  还款抵扣传  1
  }

  static getDerivedStateFromProps (nextProps, prevPros) {
    return {
      infoModal: nextProps.infoModal
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      data: [
        { title: '', data: [] }],
      selectNum: 0,
      selectItemData: {}
    }
  }

  componentDidMount () {
    this.couponFind('1')
  }

  // 优惠券列表1: 正常 2. 已使用 3. 过期
  async couponFind (type) {
    const data = {
      state: type, // 状态， 1: 正常 2. 已使用 3. 过期
      pageNo: '1',
      pageSize: '100',
      scene: this.props.scene,
      timeBetween: true,
      order: 'ASC', // ASC 升序， DESC 降序， 请使用大写
      orderBy: 'endTime'
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      const data = res.data.data.pagedRecords
      this.setState({
        data: [
          { title: '', data: data }],
        selectItemData: data[0]
      })
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
        coverScreen={false}
        hasBackdrop={true}
        backdropTransitionInTiming={0}
        // onBackdropPress={() => this.setModalVisible(false)}
        onBackButtonPress={() => {
          this.setState({
            infoModal: false,
            selectNum: 0,
            selectItemData: {}
          })
          this.props.cancel()
        }
        }
        onHardwareBackPress={() => {
          this.props.cancel()
          return true
        }}
      >
        <View style={styles.modalContainer}>
          <View >
            <View style={{ marginTop: dp(42), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: dp(30) }}>
              <Touchable isNativeFeedback={true} onPress={() => {
                this.props.cancel()
              }} >
                <Text style={{ fontSize: dp(30), color: '#1A97F6' }}>取消</Text>
              </Touchable>
              <Text style={{ fontSize: dp(34), color: '#000000', fontWeight: 'bold' }}>可用优惠券</Text>
              <Touchable isNativeFeedback={true} onPress={() => {
                this.state.selectNum === -1 ? this.props.comfirm({}) : this.props.comfirm(this.state.selectItemData)
                this.props.cancel()
              }} >
                <Text style={{ fontSize: dp(30), color: '#1A97F6' }}>确定</Text>
              </Touchable>
            </View>
          </View>
          <Touchable isNativeFeedback={true} onPress={() => {
            this.setState({
              selectNum: -1
            })
          }}>
            <View style = {{ marginHorizontal: dp(30), borderStyle: 'dashed', borderWidth: dp(2), borderColor: this.state.selectNum === -1 ? '#5E608A' : '#C7C7D6', marginTop: dp(60), flexDirection: 'row', alignItems: 'center', borderRadius: dp(16), backgroundColor: this.state.selectNum === -1 ? '#5E608A' : 'white' }}>
              <Iconfont style={{ margin: dp(30) }} name={ this.state.selectNum === -1 ? 'xuanze' : 'select_weixuanzhong'} size={dp(32)} />
              <Text style = {{ fontSize: dp(30), paddingVertical: dp(30), color: this.state.selectNum === -1 ? 'white' : '#2D2926' }}>不使用优惠券</Text>
            </View>
          </Touchable>
          <SectionList
            //  stickySectionHeadersEnabled={false}// 关闭头部粘连
            renderItem={
              ({ item, index, section }) =>
                <Touchable key={index} isNativeFeedback={true} onPress={() => {
                  this.selectItemData(item, index)
                }} >
                  <View key={index} style={styles.itemCouponBG}>
                    <View style={{ position: 'absolute', width: dp(690), height: dp(174), marginTop: dp(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: this.state.selectNum === index ? '#F55849' : 'white', borderRadius: dp(16), borderStyle: 'dashed', borderWidth: dp(2), borderColor: this.state.selectNum === index ? '#F55849' : '#C7C7D6' }}>
                      <View >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Iconfont style={{ marginHorizontal: dp(30), color: '#F55849' }} name={this.state.selectNum === index ? 'xuanzhong' : 'select_weixuanzhong' } size={dp(32)}/>
                          <View style={{ width: dp(144), height: dp(32), backgroundColor: this.state.selectNum === index ? 'white' : '#F55849', alignItems: 'center', justifyContent: 'center', borderRadius: dp(8) }}>
                            <Text style = {[styles.textStatusStyle, { color: this.state.selectNum === index ? '#F55849' : 'white' }]}>现金抵扣券</Text>
                          </View>
                        </View>
                        <Text style = {[styles.textMoneyStyle, { color: this.state.selectNum === index ? 'white' : '#F55849', fontSize: item.price >= 1000 ? dp(50) : dp(72) }]}>¥{parseInt(item.price)}</Text>
                      </View>
                      <View style={{ width: dp(414), flexDirection: 'row', alignItems: 'center' }}>
                        <View >
                          <Text style = {[styles.textTipStyle, { color: this.state.selectNum === index ? 'white' : '#2D2926' }]}>到期日期：{item.endTime}</Text>
                          <Text style = {[styles.textTipStyle, { color: this.state.selectNum === index ? 'white' : '#2D2926', marginTop: dp(15) }]}>抵扣范围：{this.props.scene === '2' ? '抵扣会员费' : '还款时抵扣服务费'}</Text>
                          <Text style = {[styles.textTipStyle, { color: this.state.selectNum === index ? 'white' : '#2D2926', marginTop: dp(15) }]}>票券来源：{item.marketName} </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Touchable>
            }
            sections={this.state.data}
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
    alignItems: 'center',
    justifyContent: 'center',
    height: dp(204)
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
    color: 'white',
    fontSize: dp(24)
  },
  textMoneyStyle: {
    marginLeft: dp(30),
    color: 'white',
    fontSize: dp(72),
    fontWeight: 'bold',
    marginTop: dp(10)
  },
  textStatusStyle: {
    color: 'white',
    fontSize: dp(24)
  }

})

export default ChooseCoupon
