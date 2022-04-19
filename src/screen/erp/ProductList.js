import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import NavBar from '../../component/NavBar'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import BottomFullModal from '../../component/BottomFullModal'
import ajaxStore from '../../utils/ajaxStore'
import FormItem2Component from '../../component/FormItem2Component'
import Picker from 'react-native-picker'
import { SolidBtn } from '../../component/CommonButton'
import { toAmountStr, showToast } from '../../utils/Utility'
import AuthUtil from '../../utils/AuthUtil'
import { share } from '../../utils/ShareUtil'
import { webUrl } from '../../utils/config'
import { connect } from 'react-redux'

/**
 * 产品列表
 * todo:
 */
class ProductList extends PureComponent {
  constructor (props) {
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
        supplierName: ''
      }
    }

    this.statusColor = {
      1: '#4FBF9F',
      2: '#C7C7D6',
      3: '#2A6EE7'
    }
  }

  componentDidMount () {
    this.getSuppliserList()
    // this.listView.refreshData()
  }

  search (text) {
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

  async getSuppliserList () {
    const res = await ajaxStore.order.getSupplierLists({
      pageNo: 1,
      pageSize: 100
    })
    if (res && res.data && res.data.code === '0') {
      this.setState({
        suppliserList: res.data.data.pagedRecords
      })
    }
  }

  showSupplier = () => {
    Keyboard.dismiss()
    const pickerData = ['全部']
    this.state.suppliserList.map((item, key) => {
      pickerData.push(item.supplierName)
    })
    console.log(pickerData)
    Picker.init({
      pickerData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择供方',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.form.supplierName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        console.log(pickedIndex)
        pickedIndex = pickedIndex[0]
        this.setState({
          form: {
            ...this.state.form,
            supplierId: pickedIndex ? this.state.suppliserList[pickedIndex - 1].id : '',
            supplierName: pickerData[pickedIndex]
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

  showModal = async () => {
    await this.setState({
      checked: this.state.lockChecked
    })
    this.modal.setModalVisible(true)
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  selectState = (index) => {
    this.setState({
      checked: index
    })
  }

  submit = async () => {
    await this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.erp.getProductList({
      judgeStock: true,
      isDisabled: 0,
      goodsName: this.state.inputVal || null,
      supplierId: this.state.form.supplierId,
      pageNo,
      pageSize
    })
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  getChartColor (resultScore) {
    let color
    if (resultScore < 60) {
      color = '#F55849'
    } else {
      color = '#2A6EE7'
    }
    return color
  }

  addBuyCar = async (item) => {
    const productInfo = await AuthUtil.getBuyCarProductInfo() || []
    console.log(productInfo)
    let result = false
    productInfo.map((pItem, key) => {
      if (pItem.id === item.id) {
        result = true
      }
    })
    if (!result) {
      item.count = '1'
      productInfo.push(item)
      AuthUtil.saveBuyCarProductInfo(productInfo)
    }
    showToast('已成功加入购物车')
  }

  renderItem = (item) => {
    const {
      goodsName, goodsNum, specification, stock, originalPrice, marketPrice
    } = item.item
    return (
      <Touchable isWithoutFeedback={true}>
        <View style={styles.item} >
          <Text style={styles.goodsName}>{goodsName}</Text>
          <View style={styles.goodsSummaryItem}>
            <Text style={styles.goodsSummaryText}>商品编码：</Text>
            <Text style={styles.goodsSummaryText}>{goodsNum}</Text>
          </View>
          <View style={styles.goodsSummaryItem}>
            <Text style={styles.goodsSummaryText}>规格：</Text>
            <Text style={styles.goodsSummaryText}>{specification}</Text>
          </View>
          <View style={styles.goodsSummaryItem}>
            <Text style={styles.goodsSummaryText}>库存：</Text>
            <Text style={styles.goodsSummaryText}>{stock}</Text>
          </View>
          <View style={styles.goodsBottom}>
            <View style={styles.priceMain}>
              <Text style={styles.marketPrice}>￥{toAmountStr(marketPrice, 2)}</Text>
              { originalPrice &&
                <Text style={styles.originalPrice}>￥{toAmountStr(originalPrice, 2)}</Text>
              }
            </View>
            <SolidBtn fontSize={dp(28)} onPress={() => this.addBuyCar(item.item)} fontStyle={styles.fontStyle} style={styles.addBtn} text={'加入购物车'} disabled={!stock} />
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
                ref={view => { this.input = view }}
                placeholder={'搜索产品名称'}
                placeholderTextColor={'#A7ADB0'}
                style={[styles.input, { flex: this.state.isShowClear ? 1 : 0 }]}
                onChangeText={text => { this.search(text) }}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
              />
              {this.state.isShowClear
                ? <Iconfont name={'qingchu'}
                  size={dp(40)} onPress={this.clearSearch}
                  style={styles.clearIcon} />
                : null}
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.filter} onPress={this.showModal}>筛选</Text>
        </View>
        {
          this.state.form.supplierId ? (
            <Text style={styles.stateText}>{`供方：${this.state.form.supplierName}`}</Text>
          ) : (null)
        }

      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'dangqianwuxiangmu'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>您还没有添加过产品</Text>
      </View>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        pageHeight={DEVICE_HEIGHT * 0.83}
        ref={ref => { this.modal = ref }}
        title={'筛选'}
        submit={this.submit} >
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.modalContainer}>
          <Text style={styles.modalTitle}>供方</Text>
          <FormItem2Component
            placeholder={'请选择供方'}
            showArrow={true}
            editable={false}
            value={this.state.form.supplierName}
            onPress={() => { this.showSupplier() }}
          />
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
          : null}
      </BottomFullModal>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>

        <NavBar
          title={'产品列表'}
          navigation={navigation}
          rightIconList={[
            {
              icon: 'fenxiang2x',
              onPress: () => {
                share('点击链接，查看产品详情！', `${webUrl}/product/productList?customerId=${this.props.companyInfo.customerId}&corpName=${this.props.companyInfo.corpName}`, this.props.companyInfo.corpName, (index, message) => {
                  showToast('分享成功')
                })
              }
            },
            {
              icon: 'gouwuche2x',
              onPress: () => {
                navigation.navigate('BuyCar')
              }
            }
          ]}
          rightIconSize={25}
          isReturnRoot='1'
          onRightPress={() => {
            navigation.navigate('ProjectEvaluationForm')
          }}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
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
        {this.renderModal()}

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  headerContainer: {
    // alignItems: 'flex-end'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(30)
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
    justifyContent: 'center'
  },
  searchIcon: {
    marginLeft: dp(10)
  },
  clearIcon: {
    marginRight: dp(15)
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginLeft: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1
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
  filter: {
    color: '#2D2926',
    fontSize: dp(28),
    paddingRight: dp(30)
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
  progress: {
    marginTop: dp(30)
  },
  itemStatus: {
    paddingVertical: dp(5),
    paddingHorizontal: dp(10),
    width: dp(100),
    color: '#fff'
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
    marginTop: dp(35)
  },
  modalBorder: {
    backgroundColor: '#5E608A',
    color: 'white'
  },
  modalContent: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  btn: {
    backgroundColor: Color.THEME,
    color: 'white',
    fontSize: dp(27),
    paddingVertical: dp(14),
    paddingHorizontal: dp(35),
    borderRadius: dp(28),
    overflow: 'hidden'
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  goodsName: {
    color: '#2D2926',
    fontSize: dp(28),
    marginBottom: dp(20),
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
  stateText: {
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    fontSize: dp(28),
    color: '#2D2926'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(ProductList)
