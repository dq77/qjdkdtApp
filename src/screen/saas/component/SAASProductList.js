import React, { PureComponent } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import Picker from 'react-native-picker'
import { connect } from 'react-redux'
import BottomFullModal from '../../../component/BottomFullModal'
import { SolidBtn } from '../../../component/CommonButton'
import FormItem2Component from '../../../component/FormItem2Component'
import ListPageComponent from '../../../component/ListPageComponent'
import NavBarCustomer from '../../../component/NavBarCustomer'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import ajaxStore from '../../../utils/ajaxStore'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import Color from '../../../utils/Color'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import { clearNoNum, toAmountStr } from '../../../utils/Utility'

/**
 * 产品列表
 * todo:
 */
class ProductList extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      inputVal: '',
      pageNo: 1,
      pageSize: 10,
      totalPages: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isShowClear: false,
      checked: 0,
      lockChecked: 0,
      projectId: '',
      suppliserList: [],
      form: {
        supplierId: '',
        supplierName: '',
      },
      skuVOSelectName: '',
      skuVOListSelectName: '',
      categoryId: '',
      categoryName: '',
      orderList: [],
    }

    this.statusColor = {
      1: '#4FBF9F',
      2: '#C7C7D6',
      3: '#2A6EE7',
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params
    const orderList = params && params.orderList
    if (orderList) {
      this.setState({
        orderList,
      })
    }
    this.allCategory()
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.listView.refreshData()
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  search(text) {
    if (text) {
      this.setState({ isShowClear: true })
      this.listView.updateUI()
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.listView.refreshData()
      }, 500)
    } else {
      this.setState({ isShowClear: false })
      this.listView.updateUI()
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.listView.refreshData()
      }, 500)
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.listView.refreshData()
  }

  startSearch = () => {
    this.input.focus()
  }

  onFocus = () => {
    // console.log('onFocus')
  }

  onBlur = () => {
    // console.log('onBlur')
  }

  async allCategory() {
    const res = await ajaxStore.saas.allCategory()
    if (res && res.data && res.data.code === '0') {
      this.setState({
        suppliserList: res.data.data,
      })
    }
  }

  async getAttributeValueBySpell(v) {
    const res = await ajaxStore.saas.getAttributeValueBySpell({ attributeSpell: v.substring(2) })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      await this.setState({
        skuVOExtendList: data || [],
      })
      this.showSupplier('1')
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  showSupplier = type => {
    Keyboard.dismiss()
    let pickerData = []
    switch (type) {
      case '1':
        this.state.skuVOExtendList.forEach(element => {
          pickerData.push(element.name.toString())
        })
        break

      default:
        pickerData = ['全部']
        this.state.suppliserList.map((item, key) => {
          pickerData.push(item.name)
        })
        break
    }
    Picker.init({
      pickerData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: type === '1' ? '请选择' : '请选择供方',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [type === '1' ? this.state.skuVOListSelectName : this.state.categoryName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        if (type === '1') {
          const skuVOList = this.state.skuVOList
          skuVOList[this.state.skuVOSelectIndex].selectItem = this.state.skuVOExtendList[pickedIndex]
          this.setState({
            skuVOList: JSON.parse(JSON.stringify(skuVOList)),
          })
        } else {
          pickedIndex = pickedIndex[0]
          this.setState({
            categoryId: pickedIndex ? this.state.suppliserList[pickedIndex - 1].id : '',
            categoryName: pickerData[pickedIndex],
          })
        }
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.clearData()
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {},
    })
    this.showShadow()
    Picker.show()
  }

  showModal = async () => {
    await this.setState({
      checked: this.state.lockChecked,
    })
    this.modal.show()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  selectState = index => {
    this.setState({
      checked: index,
    })
  }

  async checkProduct() {
    const skuVOList = this.state.skuVOList || []
    let isUse = '1'
    for (let index = 0; index < skuVOList.length; index++) {
      const element = skuVOList[index]
      if (!element.selectItem.name) {
        global.alert.show({
          content: `请选择${element.name}`,
        })
        isUse = '2'
        break
      }
    }
    if (isUse === '2') {
      return
    }
    if (!this.state.goodNum) {
      global.alert.show({
        content: '请输入数量',
      })
      return
    }
    this.modalAddOrder.cancel()
    const extendData = []
    skuVOList.forEach(element => {
      extendData.push({
        nameId: element.selectItem.spuAttributeId,
        valueId: element.selectItem.id,
      })
    })

    const data = [
      {
        projectId: this.props.navigation.state.params.projectId,
        quantity: this.state.goodNum,
        goodsId: this.state.orderId,
        extendData,
      },
    ]
    const res = await ajaxStore.saas.batchPayCompute(data)
    if (res && res.data && res.data.code === '0') {
      const data = res.data.data

      if (data.payComputeVOS.length > 0 && !data.payComputeVOS[0].isCheck) {
        global.alert.show({
          content: data.message,
        })
        this.clearData()
        return
      }
      if (data.payComputeVOS.length > 0 && !data.payComputeVOS[0].isUse) {
        global.alert.show({
          content: '产品已失效',
        })
        this.clearData()
        return
      }
      this.submit()
    } else {
      this.clearData()
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  clearData() {
    this.setState({
      skuVOListSelectName: null,
      skuVOList: null,
      goodNum: null,
    })
  }

  submit = async () => {
    const orderList = this.state.orderList
    let a = 1
    const skuVOList = this.state.skuVOList
    let name = ''
    for (const key in skuVOList) {
      if (Object.hasOwnProperty.call(skuVOList, key)) {
        const element = skuVOList[key]
        name.length > 0 ? (name = name + '/' + element.selectItem.name) : (name = element.selectItem.name)
      }
    }

    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index]
      console.log(element, name, this.state.orderId, 'sadasds')
      if (element.skuVOSelectName === name && this.state.orderId === element.skuVODec.id) {
        const goodNum = parseFloat(this.state.goodNum) + parseFloat(element.goodNum)
        const orderList = this.state.orderList
        orderList[index].goodNum = parseFloat(goodNum).toFixed(2)
        this.setState({ orderList: JSON.parse(JSON.stringify(orderList)) })
        a = 2
        break
      }
    }
    if (a === 1) {
      await this.setState({
        orderList: [
          ...this.state.orderList,
          {
            skuVOSelectName: name,
            skuVOList: this.state.skuVOList,
            goodNum: parseFloat(this.state.goodNum).toFixed(2),
            skuVODec: this.state.skuVODec,
          },
        ],
      })
    }
    this.clearData()
    this.props.navigation.state.params.callbackData &&
      this.props.navigation.state.params.callbackData(this.state.orderList)
    await this.listView.refreshItemData()
  }

  loadData = async (pageNo, pageSize) => {
    const { categoryId, productSn, minPrice, maxPrice } = this.state
    const data = {
      name: this.state.inputVal || null,
      pageNo,
      pageSize,
    }
    if (categoryId) {
      data.categoryId = categoryId
    }
    if (productSn) {
      data.productSn = productSn
    }
    if (minPrice) {
      data.minPrice = minPrice
    }
    if (maxPrice) {
      data.maxPrice = maxPrice
    }
    const res = await ajaxStore.saas.spuList(data)
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  getChartColor(resultScore) {
    let color
    if (resultScore < 60) {
      color = '#F55849'
    } else {
      color = '#2A6EE7'
    }
    return color
  }

  toProductDetail = item => {
    onClickEvent('SAAS-产品列表页-查看', 'saas/SAASProductList')
    this.props.navigation.navigate('SAASProductDetail', {
      id: item.id,
    })
  }

  renderItem = item => {
    const { name, mainPicPath, specification, productSn, basePrice, unitName } = item.item
    return (
      <Touchable
        isWithoutFeedback={true}
        onPress={() => {
          this.toProductDetail(item.item)
        }}
      >
        <View style={styles.item}>
          <View style={styles.itemTopBGView}>
            <Image
              style={styles.itemIMG}
              source={{ uri: mainPicPath || '' }}
              defaultSource={require('../../../images/tupianjieshi.png')}
            ></Image>
            <View style={{ flex: 1 }}>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsTitleText}>{name}</Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryText}>物料编码：</Text>
                <Text style={styles.goodsSummaryText}>{productSn}</Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryText}>规格：</Text>
                <Text style={styles.goodsSummaryText}>{specification}</Text>
              </View>
            </View>
          </View>
          <View style={styles.goodsBottom}>
            {this.props.type === '1' && (
              <SolidBtn
                fontSize={dp(28)}
                onPress={async () => {
                  const extendAttribute = item.item.extendAttribute || []
                  extendAttribute.forEach(element => {
                    return (element.selectItem = {})
                  })
                  await this.setState({
                    orderId: item.item.id,
                    skuVOList: extendAttribute,
                    skuVODec: item.item,
                  })
                  this.modalAddOrder.show()
                }}
                fontStyle={styles.fontStyle}
                style={styles.addBtn}
                text={'加入订单'}
              />
            )}
            <View style={styles.priceMain}>
              {/* <Text style={styles.marketPrice}>￥{toAmountStr(marketPrice, 2)}</Text>
               */}
              <Text style={styles.itemMoneyText}>
                <Text style={styles.itemUnitText}>{'¥'}</Text>
                <Text style={styles.itemNumText}>{toAmountStr(basePrice || 0, 2, true)}</Text>/{unitName}
              </Text>
            </View>
          </View>
        </View>
      </Touchable>
    )
  }

  renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TouchableWithoutFeedback onPress={this.startSearch}>
            <View style={styles.searchView}>
              <TextInput
                ref={view => {
                  this.input = view
                }}
                placeholder={'搜索商品名称'}
                placeholderTextColor={'#A7ADB0'}
                style={[styles.input, { flex: this.state.isShowClear ? 1 : 0 }]}
                onChangeText={text => {
                  this.search(text)
                }}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
              />
              {this.state.isShowClear ? (
                <Iconfont name={'qingchu'} size={dp(40)} onPress={this.clearSearch} style={styles.clearIcon} />
              ) : null}
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.filter} onPress={this.showModal}>
            筛选
          </Text>
        </View>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../../../images/chanpliebiaoweikong.png')} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>您还没有添加过产品</Text>
      </View>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        pageHeight={this.props.type === '1' ? DEVICE_HEIGHT * 0.9 : DEVICE_HEIGHT * 0.83}
        ref={ref => {
          this.modal = ref
        }}
        title={'筛选'}
        submit={() => {
          this.listView.refreshData()
        }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalContainer}>
          <Text style={styles.modalTitle}>分类</Text>
          <FormItem2Component
            placeholder={'请选择分类'}
            showArrow={true}
            editable={false}
            value={this.state.categoryName}
            onPress={() => {
              this.showSupplier()
            }}
          />
          <Text style={styles.modalTitle}>物料编码</Text>
          <View style={styles.inputTwoScreen}>
            <TextInput
              placeholder={'请输入物料编码'}
              style={styles.inputTwo}
              value={this.state.productSn}
              onChangeText={text => {
                this.setState({ productSn: text })
              }}
            />
          </View>
          <Text style={styles.modalTitle}>价格区间</Text>
          <View style={styles.inputTwoScreen}>
            <TextInput
              style={styles.inputTwo}
              placeholder={'请输入'}
              value={this.state.minPrice}
              keyboardType={'numeric'}
              onChangeText={text => {
                this.setState({ minPrice: text })
              }}
            />
            <Text>-</Text>
            <TextInput
              style={styles.inputTwo}
              placeholder={'请输入'}
              keyboardType={'numeric'}
              value={this.state.maxPrice}
              onChangeText={text => {
                this.setState({ maxPrice: text })
              }}
            />
          </View>
        </ScrollView>
        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
      </BottomFullModal>
    )
  }

  addOrder() {
    const { skuVOList = [] } = this.state
    return (
      <BottomFullModal
        ref={ref => {
          this.modalAddOrder = ref
        }}
        title={'加入订单'}
        isAutoClose={false}
        submit={() => {
          this.checkProduct()
        }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalContainer}>
          {skuVOList
            ? skuVOList.map((item, key) => {
                return (
                  <View key={key}>
                    <Text style={styles.modalTitle}>{item.name || ''}</Text>
                    <Touchable
                      style={styles.select}
                      onPress={() => {
                        this.setState({
                          skuVOListSelectName: item.selectItem.name,
                          skuVOSelectIndex: key,
                        })
                        item.value.toString().indexOf('@@') > -1 && this.getAttributeValueBySpell(item.value)
                      }}
                    >
                      {item.value.toString().indexOf('@@') > -1 ? (
                        <Text style={[styles.selectText, !item.selectItem.name ? styles.placeholder : '']}>
                          {item.selectItem.name || '请选择'}
                        </Text>
                      ) : (
                        <Text style={[styles.selectText]}>{item.selectItem.value}</Text>
                      )}
                      <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                    </Touchable>
                  </View>
                )
              })
            : null}
          <Text style={styles.modalTitle}>数量</Text>
          <TextInput
            placeholder={'请输入数量'}
            style={styles.inputScreen}
            keyboardType={'numeric'}
            maxLength={13}
            value={this.state.goodNum ? this.state.goodNum.toString() : ''}
            onChangeText={text => {
              this.setState({ goodNum: clearNoNum(text) })
            }}
          />
        </ScrollView>
        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
      </BottomFullModal>
    )
  }

  render() {
    const { navigation } = this.props
    const orderListNum = this.state.orderList.length || 0
    return (
      <View style={styles.container}>
        <NavBarCustomer
          title={this.props.type === '1' ? '添加产品' : '产品列表'}
          navigation={navigation}
          num={orderListNum.toString()}
          onLeftPress={() => {
            this.props.navigation.pop()
          }}
        />
        <View style={styles.container}>
          <ListPageComponent
            ref={ref => {
              this.listView = ref
            }}
            isAutoRefresh={true}
            navigation={navigation}
            canChangePageSize={false}
            loadData={this.loadData}
            loadHeader={this.loadHeader}
            renderItem={this.renderItem}
            renderHeader={this.renderHeader}
            renderEmpty={this.renderEmpty}
            renderSeparator={null}
          />
        </View>
        {this.renderModal()}
        {this.addOrder()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  placeholder: {
    color: '#A7ADB0',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    padding: dp(30),
  },
  selectText: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  inputTwo: {
    paddingHorizontal: dp(30),
    flex: 1,
  },
  inputTwoScreen: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    height: dp(90),
    fontSize: dp(28),
  },
  inputScreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    height: dp(90),
    fontSize: dp(28),
  },
  itemTopBGView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIMG: {
    width: dp(140),
    height: dp(140),
    marginRight: dp(20),
    marginBottom: dp(30),
  },
  headerContainer: {
    // alignItems: 'flex-end'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(30),
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: dp(30),
    marginRight: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    // justifyContent: 'center'
  },
  itemMoneyText: {
    color: '#93989C',
    fontSize: dp(26),
  },
  itemUnitText: {
    color: '#F55849',
    fontSize: dp(28),
  },
  itemNumText: {
    color: '#F55849',
    fontSize: dp(42),
  },
  searchIcon: {
    marginLeft: dp(10),
  },
  clearIcon: {
    marginRight: dp(15),
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginLeft: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1,
  },
  modalTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24),
  },
  modalContainer: {
    padding: dp(60),
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.13,
  },
  emptyText: {
    fontSize: dp(30),
    color: '#C7C7D6',
  },
  emptyIcon: {
    marginBottom: dp(50),
    width: dp(280),
    height: dp(280),
  },
  filter: {
    color: '#2D2926',
    fontSize: dp(28),
    paddingRight: dp(30),
  },
  item: {
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30),
    marginHorizontal: dp(30),
    marginBottom: dp(30),
  },
  progress: {
    marginTop: dp(30),
  },
  itemStatus: {
    paddingVertical: dp(5),
    paddingHorizontal: dp(10),
    width: dp(100),
    color: '#fff',
  },
  modalItem: {
    borderWidth: dp(2),
    borderColor: '#5E608A',
    borderRadius: dp(35),
    overflow: 'hidden',
    color: '#464678',
    width: DEVICE_WIDTH * 0.266,
    marginLeft: DEVICE_WIDTH * 0.05,
    paddingVertical: dp(16),
    textAlign: 'center',
    fontSize: dp(27),
    marginTop: dp(35),
  },
  modalBorder: {
    backgroundColor: '#5E608A',
    color: 'white',
  },
  modalContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  btn: {
    backgroundColor: Color.THEME,
    color: 'white',
    fontSize: dp(27),
    paddingVertical: dp(14),
    paddingHorizontal: dp(35),
    borderRadius: dp(28),
    overflow: 'hidden',
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  goodsName: {
    color: '#2D2926',
    fontSize: dp(28),
    marginBottom: dp(20),
    lineHeight: dp(34),
  },
  goodsSummaryText: {
    fontSize: dp(24),
    color: '#91969A',
  },
  goodsTitleText: {
    fontSize: dp(28),
    color: '#2D2926',
  },
  goodsSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(10),
  },
  goodsBottom: {
    borderTopWidth: dp(1),
    borderColor: '#E7EBF2',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: dp(20),
  },
  addBtn: {
    width: dp(200),
    // height: dp(70),
    borderRadius: dp(50),
    paddingVertical: dp(15),
  },
  fontStyle: {
    fontSize: dp(28),
    // lineHeight: dp(70),
  },
  priceMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  originalPrice: {
    color: '#2D2926',
    fontSize: dp(24),
    textDecorationLine: 'line-through',
  },
  marketPrice: {
    color: '#F55849',
    fontSize: dp(28),
    marginRight: dp(10),
  },
  stateText: {
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    fontSize: dp(28),
    color: '#2D2926',
  },
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(ProductList)
