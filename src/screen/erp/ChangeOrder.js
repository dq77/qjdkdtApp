import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Text, TextInput, Platform, Keyboard, ScrollView } from 'react-native'
import ajaxStore from '../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { TouchableOpacity } from 'react-native-gesture-handler'
import store from '../../store/index'
import LoadingView from '../../component/LoadingView'
import Touchable from '../../component/Touchable'
import ListPageComponent from '../../component/ListPageComponent'
import { setLoanNum } from '../../actions'
import NavBar from '../../component/NavBar'
import { callPhone } from '../../utils/PhoneUtils'
import BottomFullModal from '../../component/BottomFullModal'
import FormItem2Component from '../../component/FormItem2Component'
import Picker from 'react-native-picker'
import { formatDate, createDateData } from '../../utils/DateUtils'
import { toAmountStr, showToast, formValid } from '../../utils/Utility'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { imgUrl, goodsImgUrl } from '../../utils/config'

import { payType } from '../../utils/enums'
import RegionPickerByAjax from '../../component/RegionPickerByAjax'
import {
  vPhone,
  vNumber,
  vChineseName
} from '../../utils/reg'
import { onEvent } from '../../utils/AnalyticsUtil'
class ChangeOrder extends PureComponent {
  constructor (props) {
    super(props)
    this.type = {
      0: '自主创建',
      1: '分享创建'
    }
    this.status = {
      0: '待发货',
      1: '部分发货',
      2: '已完成',
      3: '已取消',
      4: '已关闭'
    }
    this.payType = {
      0: '微信',
      1: '支付宝',
      2: '现金',
      3: '银行转账'
    }

    this.rule = [
      {
        id: 'receiptPerson',
        reg: vChineseName,
        required: true,
        name: '收货人'
      },
      {
        id: 'receiptPhone',
        reg: vPhone,
        required: true,
        name: '联系电话'
      },
      {
        id: 'areaCode',
        required: true,
        name: '收货地址'
      },
      {
        id: 'address',
        required: true,
        name: '收货详细地址'
      }
      // {
      //   id: 'payType',
      //   required: true,
      //   requiredErrorMsg: '请选择支付方式',
      //   name: '支付方式'
      // }
    ]

    this.state = {
      orderCode: '',
      orderData: {},
      sum: 0,
      orderItemDTOS: [],
      showShadow: false,
      // 表单
      receiptPerson: '',
      receiptPhone: '',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      address: '',
      payType: ''
    }
  }

  async componentDidMount () {
    const { params } = this.props.navigation.state
    await this.setState({
      orderCode: params ? params.orderCode : ''
    })

    this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getOrderGoods({
      pageNo,
      pageSize,
      orderCode: params.orderCode
    })

    if (res && res.data && res.data.code === '0') {
      let list = res.data.data.pagedRecords

      // 请求库存
      const ids = list.map((item, index) => {
        return item.goodsCode
      })
      const res1 = await ajaxStore.erp.listByCodes(ids)
      if (res1.data && res1.data.code === '0') {
        list = list.map((item, index) => {
          item.stock = res1.data.data[index].stock || 0
          return item
        })
      }

      return list
    } else {
      return null
    }
  }

  loadHeader = async () => {
    global.loading.show()
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getByCode({
      orderCode: params.orderCode
    })
    if (res && res.data && res.data.code === '0') {
      const orderData = res.data.data
      this.setState({
        orderData,
        sum: orderData.totalSum,
        ...orderData
      })
    }
    global.loading.hide()
  }

  changeCount = async (text, index) => {
    if (text !== '0' && text && !vNumber.test(text)) {
      showToast('请输入数字')
      return
    }

    const item = this.listView.getData()[index]
    if (text && parseInt(text) > item.stock) {
      showToast('不能超过库存数')
      return
    }

    item.count = text
    await this.listView.changeItemData(index, item)
    this.addSum()
  }

  addSum = async () => {
    let sum = 0
    const orderItemDTOS = []
    this.listView.getData().forEach((item, index) => {
      if (item.count && parseInt(item.count) > 0) {
        const count = parseInt(item.count)
        sum += count * item.marketPrice

        orderItemDTOS.push({
          count,
          goodsCode: item.goodsCode,
          orderItemCode: item.orderItemCode
        })
      }
    })
    await this.setState({ sum, orderItemDTOS })
  }

  delete = async (item) => {
    const list = this.listView.getData()
    if (list.length === 1) {
      global.alert.show({ content: '至少要有一个商品' })
      return
    }
    list.splice(item.index, 1)
    await this.listView.changeListData([...list])
    this.addSum()
  }

  submit = async () => {
    if (this.state.sum <= 0) {
      global.alert.show({ content: '商品数量不能为0' })
      return
    }
    if (this.state.orderItemDTOS.length <= 0) {
      await this.addSum()
    }

    const res = await ajaxStore.erp.updateOrder({
      orderCode: this.state.orderCode,
      orderItemDTOS: this.state.orderItemDTOS,
      receiptPerson: this.state.orderData.receiptPerson,
      receiptPhone: this.state.orderData.receiptPhone,
      provinceCode: this.state.orderData.provinceCode,
      cityCode: this.state.orderData.cityCode,
      areaCode: this.state.orderData.areaCode,
      address: this.state.orderData.address,
      payType: this.state.orderData.payType
    })
    if (res && res.data && res.data.code === '0') {
      onEvent('商品管理-订单列表页-修改订单', 'erp/ChangeOrder', '/erp/order/update', {
        orderCode: this.state.orderCode,
        orderItemDTOS: this.state.orderItemDTOS,
        receiptPerson: this.state.orderData.receiptPerson,
        receiptPhone: this.state.orderData.receiptPhone,
        provinceCode: this.state.orderData.provinceCode,
        cityCode: this.state.orderData.cityCode,
        areaCode: this.state.orderData.areaCode,
        address: this.state.orderData.address,
        payType: this.state.orderData.payType
      })
      global.alert.show({
        content: '修改成功',
        callback: () => {
          this.props.navigation.goBack()
        }
      })
    }
  }

  renderItem = (item) => {
    const {
      goodsImage, goodsName, goodsNum, specification,
      marketPrice, originalPrice, count, stock
    } = item.item
    return (
      <View style={
        item.index === 0 ? [styles.item, {}]
          : styles.item
      } >
        {item.index === 0 &&
          <Text style={{
            color: '#2D2926',
            fontSize: dp(32),
            marginBottom: dp(30)
          }}>商品详情</Text>}

        <View style={styles.itemRow}>
          {/* <Image
            resizeMode={'cover'}
            style={styles.img}
            defaultSource={require('../../images/default_error.png')}
            source={{ uri: goodsImgUrl + goodsImage }}
          /> */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.itemTitle}>{goodsName}</Text>
              <Text onPress={() => this.delete(item)} style={styles.delete}>删除</Text>
            </View>
            <View style={styles.itemRow1}>
              <Text style={styles.itemText}>{'商品编码：'}</Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>{goodsNum}</Text>
            </View>
            <View style={styles.itemRow1}>
              <Text style={styles.itemText}>{'规格：'}</Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>{specification}</Text>
            </View>
            <View style={styles.itemRow1}>
              <Text style={styles.itemText}>{'库存：'}</Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>{stock}</Text>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: '#EAEAF1', height: dp(1), marginVertical: dp(30) }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: dp(28),
              color: '#F55849'
            }}>{`￥${toAmountStr(marketPrice, 2, true)}`}</Text>
          <Text
            style={{
              textDecorationLine: 'line-through',
              flex: 1,
              fontSize: dp(24),
              color: '#2D2926',
              marginLeft: dp(10)
            }}>{toAmountStr(originalPrice, 2, true)}</Text>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            maxLength={10}
            // placeholder={'0'}
            defaultValue={count + ''}
            value={count + ''}
            onChangeText={text => {
              this.changeCount(text, item.index)
            }}
          />

        </View>
      </View >
    )
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  close () {
    this.setState({
      ...this.state.orderData
    })

    this.RegionPickerByAjax.hide()
    this.hideShadow()
  }

  showPayTypePicker = () => {
    Picker.init({
      pickerData: Object.values(payType),
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择支付方式',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 16,
      pickerTextEllipsisLen: 20,
      selectedValue: [payType[this.state.payType]],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          payType: parseInt(pickedIndex)
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

  async saveReceiveInfo () {
    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      await this.setState({
        orderData: {
          ...this.state.orderCode,
          receiptPerson: this.state.receiptPerson,
          receiptPhone: this.state.receiptPhone,
          provinceCode: this.state.provinceCode,
          cityCode: this.state.cityCode,
          areaCode: this.state.areaCode,
          address: this.state.address,
          payType: this.state.payType
        }
      })
      this.listView.forceUpdate()
      this.modal.setModalVisible(false)
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'编辑收货信息'}
        isAutoClose={false}
        submit={() => this.saveReceiveInfo()}
        close={() => this.close()}
      >
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalContainer}>
          <Text style={styles.modalTitle}>收货人</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请输入收货人'}
            value={this.state.receiptPerson}
            onChangeText={text => {
              this.setState({ receiptPerson: text })
            }}
          />
          <Text style={styles.modalTitle}>联系电话</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请输入联系电话'}
            value={this.state.receiptPhone}
            onChangeText={text => {
              this.setState({ receiptPhone: text })
            }}
          />
          <Text style={styles.modalTitle}>收货地址</Text>
          <View style={styles.picker}>
            <RegionPickerByAjax
              ref={o => { this.RegionPickerByAjax = o }}
              fontSize={28}
              monitorChange={true}
              selectedValue={this.state.areaCode ? getRegionTextArr(this.state.provinceCode, this.state.cityCode, this.state.areaCode) : []}
              onPickerConfirm={(data) => {
                this.setState({
                  provinceCode: data.provinceCode,
                  cityCode: data.cityCode,
                  areaCode: data.areaCode
                })
              }}
              onOpen={() => { this.showShadow() }}
              onClose={() => { this.hideShadow() }}
            />
            <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
          </View>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            style={styles.addressInput}
            placeholder={'请填写详细地址'}
            value={this.state.address}
            onChangeText={text => {
              this.setState({ address: text })
            }}
          />
          <Text style={styles.modalTitle}>支付方式</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请选择支付方式'}
            showArrow={true}
            editable={false}
            value={payType[this.state.payType]}
            onPress={() => { this.showPayTypePicker() }}
          />
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback
            onPress={() => {
              this.RegionPickerByAjax.hide()
              this.hideShadow()
            }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
          : null}
      </BottomFullModal>
    )
  }

  renderHeader = () => {
    const {
      status, receiptPerson, receiptPhone, provinceCode,
      cityCode, areaCode, address, orderCode, createType,
      gmtCreated, gmtModified, payType, totalSum
    } = this.state.orderData

    return (
      <View style={{ paddingTop: dp(30) }}>
        <Touchable onPress={() => {
          this.modal.setModalVisible(true)
        }}>
          <View style={styles.block}>
            <View style={[styles.headRow, { marginBottom: dp(30) }]}>
              <Text style={styles.headTitle}>收货信息</Text>
            </View>
            <View style={[styles.headRow, { marginTop: dp(20) }]}>
              <Text style={styles.headText}>收货人：</Text>
              <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPerson}</Text>
            </View>
            <View style={[styles.headRow, { marginTop: dp(20) }]}>
              <Text style={styles.headText}>联系电话：</Text>
              <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPhone}</Text>
            </View>
            <View style={[styles.headRow, { marginTop: dp(20) }]}>
              <Text style={styles.headText}>地址：</Text>
              <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') + ' ' + (address || '')}</Text>
            </View>
            <View style={[styles.headRow, { marginTop: dp(20) }]}>
              <Text style={styles.headText}>支付方式：</Text>
              <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.payType[payType]}</Text>
            </View>
          </View>

        </Touchable>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  renderFooter = () => {
    const { sum } = this.state
    return (
      <View style={styles.bottom}>
        <Text style={{
          fontSize: dp(26),
          color: '#2D2926'
        }}>总计：</Text>
        <Text style={{
          fontSize: dp(29),
          color: '#F55849',
          fontWeight: 'bold',
          flex: 1
        }}>{`￥${toAmountStr(sum, 2, true)}`}</Text>
        <Touchable onPress={this.submit}>
          <Text style={styles.btn}>修改订单</Text>
        </Touchable>

      </View>
    )
  }

  render () {
    return (
      <View style={styles.container}>

        <NavBar
          title={'修改订单'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={null}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={false}
          canChangePageSize={false}
          canPullRefresh={false}
          pageSize={999999}
          navigation={this.props.navigation}
          loadData={this.loadData}
          loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          renderSeparator={null}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
        />
        {this.renderFooter()}

        {this.renderModal()}

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(ChangeOrder)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.2
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  },
  item: {
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    marginBottom: dp(20),
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30)
  },
  block: {
    alignItems: 'flex-end',
    padding: dp(30),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16)
    // elevation: 3,
    // shadowOffset: {
    //   width: 0,
    //   height: 0
    // },
    // shadowRadius: 4,
    // shadowOpacity: 0.1
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headTitle: {
    color: '#2D2926',
    fontSize: dp(32),
    flex: 1

  },
  headText: {
    fontSize: dp(28),
    color: '#91969A'
  },
  itemRow: {
    flexDirection: 'row'
  },
  img: {
    width: dp(200),
    height: dp(200)
  },
  itemRow1: {
    flexDirection: 'row',
    marginTop: dp(13)
  },
  itemText: {
    fontSize: dp(24),
    color: '#91969A'
  },
  itemTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    flex: 1,
    paddingBottom: dp(10)
  },
  btn: {
    backgroundColor: Color.THEME,
    color: 'white',
    textAlignVertical: 'center',
    textAlign: 'center',
    width: dp(192),
    borderRadius: dp(34),
    overflow: 'hidden',
    fontSize: dp(28),
    ...Platform.select({
      ios: { paddingVertical: dp(20) },
      android: { height: dp(72) }
    })
  },
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingTop: dp(28),
    paddingBottom: dp(80),
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  input: {
    width: dp(96),
    height: dp(53),
    borderWidth: dp(2),
    borderColor: '#C7C7D6',
    borderRadius: dp(4),
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 0
  },
  delete: {
    color: '#F55849',
    fontSize: dp(28),
    paddingLeft: dp(12),
    paddingBottom: dp(10)
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  modalTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24)
  },

  modalContainer: {
    padding: dp(60),
    paddingTop: 0
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    fontSize: dp(28),
    height: dp(88)
  },
  addressInput: {
    marginTop: dp(30)
  }

})
