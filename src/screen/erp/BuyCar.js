import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Platform
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { SolidBtn } from '../../component/CommonButton'
import { connect } from 'react-redux'
import { injectUnmount, toAmountStr, showToast, formValid } from '../../utils/Utility'
import {
  vPhone,
  vNumber,
  vChineseName
} from '../../utils/reg'
import AuthUtil from '../../utils/AuthUtil'
import { payType } from '../../utils/enums'
import Touchable from '../../component/Touchable'
import Picker from 'react-native-picker'
import BottomFullModal from '../../component/BottomFullModal'
import FormItem2Component from '../../component/FormItem2Component'
import RegionPickerByAjax from '../../component/RegionPickerByAjax'
import ajaxStore from '../../utils/ajaxStore'

@injectUnmount
class BuyCar extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      productList: [],
      conutAll: 0,
      reciveAddress: {
        receiptPerson: '',
        receiptPhone: '',
        provinceName: '',
        cityName: '',
        areaName: '',
        provinceCode: '',
        cityCode: '',
        areaCode: '',
        address: '',
        payType: '',
        showAddress: []
      },
      form: {
        receiptPerson: '',
        receiptPhone: '',
        provinceName: '',
        cityName: '',
        areaName: '',
        provinceCode: '',
        cityCode: '',
        areaCode: '',
        address: '',
        payType: '',
        showAddress: []
      },
      payTypeList: [],
      payTypeName: '',
      showShadow: false
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
      },
      {
        id: 'payTypeName',
        required: true,
        requiredErrorMsg: '请选择支付方式',
        name: '支付方式'
      }
    ]
  }

  componentDidMount () {
    this.init()
    console.log(this.props.companyInfo)
  }

  async init () {
    await this.setState({
      productList: await AuthUtil.getBuyCarProductInfo() || [],
      reciveAddress: await AuthUtil.getReceiveAddressInfo() || {}
    })
    await this.updateProductList()
    this.conutAllPrice()
    this.initPayType()
    this.initForm()
  }

  async saveReceiveInfo () {
    const valid = formValid(this.rule, { payTypeName: payType[this.state.form.payType], ...this.state.form })
    if (valid.result) {
      const form = this.state.form
      await this.setState({
        reciveAddress: {
          ...form,
          showAddress: [form.provinceName, form.cityName, form.areaName]
        },
        payTypeName: payType[form.payType]
      })
      this.modal.setModalVisible(false)
      AuthUtil.saveReceiveAddressInfo(this.state.reciveAddress)
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  async updateProductList () {
    const productList = this.state.productList
    if (productList.length) {
      const ids = productList.map((item, index) => {
        return item.id
      })
      const res = await ajaxStore.erp.updateProductList(ids)
      if (res.data && res.data.code === '0') {
        productList.map((item, index) => {
          if (item.id) {
            productList[index] = {
              ...res.data.data[index],
              count: productList[index].count
            }
          } else {
            productList[index] = {
              ...productList[index],
              status: -1
            }
          }
        })
      }
    }
  }

  async submitOrder () {
    const res = await ajaxStore.erp.createOrder({
      createType: 0,
      clientSource: Platform.OS === 'android' ? 2 : 3,
      ...this.state.reciveAddress,
      orderItemDTOS: this.state.productList.map((item) => {
        if (item.status !== -1) {
          return {
            goodsCode: item.goodsCode,
            count: item.count
          }
        }
      })
    })
    if (res.data && res.data.code === '0') {
      AuthUtil.removeBuyCarProductInfo()
      this.props.navigation.replace('OrderCreateSuccess')
    }
  }

  close () {
    this.initForm()
    this.RegionPickerByAjax.hide()
    this.hideShadow()
  }

  initForm () {
    const reciveAddress = this.state.reciveAddress
    this.setState({
      form: {
        ...reciveAddress,
        showAddress: reciveAddress.areaName ? [reciveAddress.provinceName, reciveAddress.cityName, reciveAddress.areaName] : []
      },
      payTypeName: payType[reciveAddress.payType]
    })
  }

  initPayType () {
    const payTypeList = []
    Object.entries(payType).map((item, key) => {
      payTypeList.push({
        name: item[1],
        code: item[0]
      })
    })
    this.setState({
      payTypeList
    })
  }

  conutAllPrice () {
    let conutAll = 0
    this.state.productList.map((item, key) => {
      if (item.status !== -1) {
        conutAll += item.marketPrice * item.count
      }
    })
    this.setState({
      conutAll
    })
  }

  deleteItem (index) {
    global.confirm.show({
      title: '删除',
      content: '是否删除当前商品？',
      confirmText: '确认',
      confirm: async () => {
        const productList = this.state.productList
        productList.splice(index, 1)
        console.log(productList, 'productList')
        this.setState({
          productList: JSON.parse(JSON.stringify(productList))
        })
        AuthUtil.saveBuyCarProductInfo(productList)
        this.conutAllPrice()
      }
    })
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
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
      selectedValue: [this.state.payTypeName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        const { payTypeIndex, payTypeList } = this.state
        if (pickedIndex !== payTypeIndex) {
          this.setState({
            payTypeIndex: pickedIndex,
            payTypeName: payTypeList[pickedIndex].name,
            form: {
              ...this.state.form,
              payType: parseInt(payTypeList[pickedIndex].code)
            }
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
    this.showShadow()
    Picker.show()
  }

  render () {
    const { navigation } = this.props
    const { receiptPerson, receiptPhone, provinceName, cityName, areaName, address } = this.state.reciveAddress
    const payTypeValue = this.state.reciveAddress.payType
    return (
      <View style={styles.container}>
        <NavBar title={'购物车'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.pageMain}>
            <Touchable style={styles.item} onPress={() => {
              this.modal.setModalVisible(true)
            }}>
              <View style={styles.headerMain}>
                <Text style={styles.goodsDetailTitle}>收货信息</Text>
                <Iconfont style={styles.title2Style} name={'arrow-right1'} size={dp(24)} />
              </View>
              {receiptPerson ? (
                <View style={styles.reciveInfo}>
                  <Text style={styles.reciveItem}>
                    收货人：{receiptPerson}
                  </Text>
                  <Text style={styles.reciveItem}>
                    联系电话：{receiptPhone}
                  </Text>
                  <Text style={styles.reciveItem}>
                    地址：{provinceName + cityName + areaName + address}
                  </Text>
                  <Text style={styles.reciveItem}>
                    支付方式：{payType[payTypeValue]}
                  </Text>
                </View>
              ) : (
                <View style={{ ...styles.emptyContainer, ...styles.reciveAddress }}>
                  <Iconfont name={'shouhuodizhi2x'} size={dp(100)} style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>添加收货地址后才可下单</Text>
                </View>
              )}
            </Touchable>
            {this.state.productList.length ? (
              this.state.productList.map((item, key) => {
                return (
                  <View key={key}>
                    <View style={styles.item}>
                      { !key &&
                        <Text style={styles.goodsDetailTitle}>商品详情</Text>
                      }
                      <View style={styles.goodsHeader}>
                        <Text style={styles.goodsName}>{item.goodsName}</Text>
                        <Touchable onPress={() => this.deleteItem(key)}><Text style={styles.deleteBtn}>删除</Text></Touchable>
                      </View>
                      <View style={styles.goodsSummaryItem}>
                        <Text style={styles.goodsSummaryText}>商品编码：</Text>
                        <Text style={styles.goodsSummaryText}>{item.goodsNum}</Text>
                      </View>
                      <View style={styles.goodsSummaryItem}>
                        <Text style={styles.goodsSummaryText}>规格：</Text>
                        <Text style={styles.goodsSummaryText}>{item.specification}</Text>
                      </View>
                      <View style={styles.goodsSummaryItem}>
                        <Text style={styles.goodsSummaryText}>库存：</Text>
                        <Text style={styles.goodsSummaryText}>{item.stock}</Text>
                      </View>
                      {item.status !== -1 ? (
                        <View style={styles.goodsBottom}>
                          <View style={styles.priceMain}>
                            <Text style={styles.marketPrice}>￥{toAmountStr(item.marketPrice, 2)}</Text>
                            <Text style={styles.originalPrice}>￥{toAmountStr(item.originalPrice, 2)}</Text>
                          </View>
                          <TextInput
                            style={styles.input}
                            defaultValue={item.count}
                            value={item.count}
                            keyboardType={'number-pad'}
                            maxLength={10}
                            onBlur={() => {
                              const productList = this.state.productList
                              if (!productList[key].count) {
                                productList[key].count = '1'
                                this.setState({ productList: JSON.parse(JSON.stringify(productList)) })
                              }
                            }}
                            onChangeText={async (text) => {
                              console.log(text, 'text')
                              if (!vNumber.test(text)) {
                                if (text) {
                                  text = '1'
                                }
                              }
                              if (item.stock < parseInt(text)) {
                                global.alert.show({
                                  content: '库存不足'
                                })
                                text = item.stock.toString()
                              }
                              const productList = this.state.productList
                              productList[key].count = text
                              await this.setState({ productList: JSON.parse(JSON.stringify(productList)) })
                              AuthUtil.saveBuyCarProductInfo(productList)
                              this.conutAllPrice()
                            }}
                          />
                        </View>
                      ) : (
                        <View style={styles.goodsBottom}>
                          <Text style={[styles.marketPrice, styles.textAlignRight]}>已失效</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Iconfont name={'dangqianwuxiangmu'} size={dp(140)} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>购物车为空</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.bottomSummary}>
          <Text style={styles.labelText}>总计：<Text style={styles.countAllText}>￥{toAmountStr(this.state.conutAll, 2)}</Text></Text>
          <SolidBtn fontSize={dp(28)} onPress={() => this.submitOrder()} fontStyle={styles.fontStyle} style={styles.addBtn} text={'提交订单'} disabled={!this.state.productList.length || !this.state.reciveAddress.receiptPhone} />
        </View>
        {this.renderModal()}

      </View>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'编辑收货信息'}
        isAutoClose={false}
        submit={() => this.saveReceiveInfo()}
        close={() => this.close()}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalContainer}>
          <Text style={styles.modalTitle}>收货人</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请输入收货人'}
            value={this.state.form.receiptPerson}
            onChangeText={text => {
              this.setState({ form: { ...this.state.form, receiptPerson: text } })
            }}
          />
          <Text style={styles.modalTitle}>联系电话</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请输入联系电话'}
            value={this.state.form.receiptPhone}
            onChangeText={text => {
              this.setState({ form: { ...this.state.form, receiptPhone: text } })
            }}
          />
          <Text style={styles.modalTitle}>收货地址</Text>
          <View style={styles.picker}>
            <RegionPickerByAjax
              ref={o => { this.RegionPickerByAjax = o }}
              fontSize={28}
              monitorChange={true}
              selectedValue={this.state.form.showAddress}
              onPickerConfirm={(data) => {
                const names = data.label.split(' ')
                this.setState({
                  form: {
                    ...this.state.form,
                    provinceCode: data.provinceCode,
                    provinceName: names[0],
                    cityCode: data.cityCode,
                    cityName: names[1],
                    areaCode: data.areaCode,
                    areaName: names[2],
                    showAddress: data.label.split(' ')
                  }
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
            value={this.state.form.address}
            onChangeText={text => {
              this.setState({ form: { ...this.state.form, address: text } })
            }}
          />
          <Text style={styles.modalTitle}>支付方式</Text>
          <FormItem2Component
            placeholderTextColor={'#D8DDE2'}
            placeholder={'请选择支付方式'}
            showArrow={true}
            editable={false}
            value={this.state.payTypeName}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  pageMain: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    paddingTop: dp(20),
    minHeight: DEVICE_HEIGHT,
    paddingBottom: dp(400)
  },
  item: {
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(20),
    marginHorizontal: dp(30),
    marginBottom: dp(30)
  },
  goodsName: {
    color: '#2D2926',
    fontSize: dp(28),
    marginBottom: dp(20),
    width: DEVICE_WIDTH * 0.75,
    lineHeight: dp(34)
  },
  goodsSummaryText: {
    color: '#91969A'
  },
  goodsSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(10)
  },
  goodsBottom: {
    borderTopWidth: dp(1),
    borderColor: '#E7EBF2',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: dp(20)
  },
  priceMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  originalPrice: {
    color: '#2D2926',
    fontSize: dp(24),
    textDecorationLine: 'line-through'
  },
  marketPrice: {
    color: '#F55849',
    fontSize: dp(28),
    marginRight: dp(10)
  },
  goodsDetailTitle: {
    color: '#2D2926',
    fontSize: dp(32),
    marginBottom: dp(30)
  },
  input: {
    color: '#2D2926',
    textAlign: 'center',
    borderWidth: dp(1),
    width: dp(120),
    height: dp(50),
    borderColor: '#C7C7D6',
    paddingHorizontal: dp(10),
    paddingVertical: dp(5)
  },
  bottomSummary: {
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    position: 'absolute',
    // top: DEVICE_HEIGHT - dp(186),
    bottom: 0,
    width: DEVICE_WIDTH,
    height: dp(186),
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: dp(50),
    paddingHorizontal: dp(30)
  },
  addBtn: {
    width: dp(200),
    height: dp(70),
    borderRadius: dp(50),
    paddingVertical: 0
  },
  fontStyle: {
    fontSize: dp(28),
    lineHeight: dp(70)
  },
  labelText: {
    color: '#000',
    fontSize: dp(28)
  },
  countAllText: {
    color: '#F55849',
    fontSize: dp(34)
  },
  deleteBtn: {
    color: '#F55849',
    lineHeight: dp(34)
  },
  goodsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.13
  },
  emptyText: {
    fontSize: dp(30),
    color: '#A7ADB0'
  },
  emptyIcon: {
    marginBottom: dp(50)
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reciveAddress: {
    marginTop: dp(50),
    paddingBottom: dp(50)
  },
  reciveItem: {
    color: '#91969A',
    fontSize: dp(28),
    marginBottom: dp(15),
    width: DEVICE_WIDTH * 0.85
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
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  textAlignRight: {
    textAlign: 'right',
    width: '100%'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(BuyCar)
