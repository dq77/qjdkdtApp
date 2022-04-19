import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Text, TextInput, ScrollView, Keyboard } from 'react-native'
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
import { formatDate, createDateData, transformTime } from '../../utils/DateUtils'
import { toAmountStr, showToast } from '../../utils/Utility'
import { onClickEvent, onEvent } from '../../utils/AnalyticsUtil'

class ERPOrderList extends PureComponent {
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

    this.state = {
      isShowClear: false,
      inputVal: '',
      showShadow: false,
      form: {
        likeOrderCode: '',
        likeGoodsName: '',
        status: null, // 0-已制单 1-部分发货 2-全部发货 3-订单取消 4-订单关闭
        createType: null, // 创建类型,0-自主创建 1-分享创建
        startSum: null,
        endSum: null,
        startDate: null,
        endDate: null
      }
    }

    this.data = createDateData(2010, 2040)
  }

  componentDidMount () {

  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.erp.getOrderList({
      ...this.state.form,
      startDate: this.state.form.startDate && this.state.form.startDate + ' 00:00:00',
      endDate: this.state.form.endDate && this.state.form.endDate + ' 23:59:59',
      pageNo,
      pageSize
    })

    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  search (text) {
    if (text) {
      this.setState({ isShowClear: true })

      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ form: { ...this.state.form, likeOrderCode: text } })
        this.listView.refreshData()
      }, 500)
    } else {
      this.setState({ isShowClear: false })
    }
    this.listView.updateUI()
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, form: { ...this.state.form, likeOrderCode: '' } })
    this.listView.updateUI()
    this.listView.refreshData()
  }

  changeTab = async (status) => {
    await this.setState({ form: { ...this.state.form, status } })
    this.listView.updateUI()
    this.listView.refreshData()
  }

  format = (dataStrArr) => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  showType = () => {
    Keyboard.dismiss()
    Picker.init({
      pickerData: ['自主创建', '分享创建'],
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择订单类型',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.form.createType ? this.type[this.state.form.createType] : ''],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.setState({
          form: {
            ...this.state.form,
            createType: pickedValue[0] === '自主创建' ? 0 : 1
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

  showDatePicker = (index) => {
    let date, name, title, time

    switch (index) {
      case 1:
        date = this.state.form.startDate
        name = 'startDate'
        title = '起始日期'
        time = ' 00:00:00'
        break
      case 2:
        date = this.state.form.endDate
        name = 'endDate'
        title = '截止日期'
        time = ' 23:59:59'
        break
    }

    Keyboard.dismiss()
    Picker.init({
      pickerData: this.data,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: `请选择${title}`,
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: date ? this.format(date).split('-') : formatDate(new Date()).split('-'),
      onPickerConfirm: (pickedValue, pickedIndex) => {
        const form = {}
        form[name] = pickedValue.join('-')
        this.setState({
          form: {
            ...this.state.form,
            ...form
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

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  cancelOrder = async (item) => {
    global.confirm.show({
      title: '确认取消',
      content: '是否确认取消订单？',
      confirmText: '确认',
      confirm: async () => {
        const res = await ajaxStore.erp.cancelOrder({
          orderCode: item.orderCode
        })
        if (res && res.data && res.data.code === '0') {
          onEvent('商品管理-订单列表页-取消订单', 'erp/ERPOrderList', '/erp/order/cancel', {
            orderCode: item.orderCode
          })
          showToast('取消成功')
          this.listView.refreshData()
        }
      }
    })
  }

  changeOrder = (item) => {
    this.props.navigation.navigate('ChangeOrder', { orderCode: item.orderCode })
  }

  devilerOrder = (item) => {
    this.props.navigation.navigate('DeliverGoods', { orderCode: item.orderCode })
  }

  toOrderDetail = (item) => {
    onClickEvent('商品管理-订单列表页-查看', 'erp/ERPOrderList')
    this.props.navigation.navigate('ERPOrderDetail', { orderCode: item.orderCode })
  }

  renderItem = (item) => {
    const {
      orderCode, status, gmtCreated, gmtModified, totalCount, totalSum
    } = item.item

    return (
      <Touchable isNativeFeedback={true} onPress={() => {
        this.toOrderDetail(item.item)
      }}>
        <View style={styles.item} >
          <View style={styles.row}>
            <Text style={[styles.title1, { flex: 1 }]}>{orderCode}</Text>
            <Text style={styles.title1}>{this.status[status]}</Text>
          </View>
          <View style={{ backgroundColor: '#EAEAF1', height: dp(1) }} />
          <Text style={styles.itemtext}>{`下单时间：${gmtCreated}`}</Text>
          <Text style={styles.itemtext} >{`更新时间：${gmtModified}`}</Text>
          <Text style={[styles.itemtext, { color: '#2D2926' }]} >{`共${totalCount}件商品，订单金额 ￥${toAmountStr(totalSum, 2, true)}`}</Text>

          {/* 待发货 */}
          {status === 0 &&
            <View >
              <View style={{ backgroundColor: '#EAEAF1', height: dp(1), marginTop: dp(27), marginBottom: dp(19) }} />
              <View style={styles.itemRow}>
                <Text onPress={() => this.cancelOrder(item.item)} style={styles.itemBtn}>取消订单</Text>
                <Text onPress={() => this.changeOrder(item.item)} style={styles.itemBtn}>修改订单</Text>
                <Text onPress={() => this.devilerOrder(item.item)} style={styles.itemBtn}>准备发货</Text>
              </View>
            </View>
          }
          {/* 部分发货 */}
          {status === 1 &&
            <View >
              <View style={{ backgroundColor: '#EAEAF1', height: dp(1), marginTop: dp(27), marginBottom: dp(19) }} />
              <View style={styles.itemRow}>
                <Text onPress={() => this.devilerOrder(item.item)} style={styles.itemBtn}>准备发货</Text>
              </View>
            </View>
          }

        </View>
      </Touchable>
    )
  }

  renderHeader = () => {
    const { form } = this.state
    const { status } = form
    return (
      <View style={{}}>
        <View style={styles.searchContainer}>

          <View style={styles.searchView}>
            <TextInput

              ref={view => { this.input = view }}
              placeholder={'搜索订单编号'}
              keyboardType='numeric'
              style={styles.input}
              placeholderTextColor={'#A7ADB0'}
              onChangeText={text => { this.search(text) }}
              // onFocus={() => {
              // }}
              onBlur={() => {
                Keyboard.dismiss()
              }}
            />
            {this.state.isShowClear
              ? <Iconfont name={'qingchu'}
                size={dp(40)} onPress={this.clearSearch}
                style={styles.clearIcon} />
              : null}
          </View>

          <TouchableWithoutFeedback onPress={() => {
            this.modal.show()
            // if (!this.state.refreshing) { this.setModalVisible(true) }
          }}>
            <Text style={styles.selectType}>筛选</Text>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.tabline}>
          <Text onPress={() => this.changeTab(null)} style={status === null ? styles.tab : styles.tab1}>全部</Text>
          <Text onPress={() => this.changeTab(0)} style={status === 0 ? styles.tab : styles.tab1}>待发货</Text>
          <Text onPress={() => this.changeTab(1)} style={status === 1 ? styles.tab : styles.tab1}>部分发货</Text>
          <Text onPress={() => this.changeTab(2)} style={status === 2 ? styles.tab : styles.tab1}>已完成</Text>
          <Text onPress={() => this.changeTab(3)} style={status === 3 ? styles.tab : styles.tab1}>已取消</Text>
        </View>
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

  reset = () => {
    this.setState({
      form: {
        // likeOrderCode: '',
        likeGoodsName: '',
        // status: null, // 0-已制单 1-部分发货 2-全部发货 3-订单取消 4-订单关闭
        createType: null, // 创建类型,0-自主创建 1-分享创建
        startSum: null,
        endSum: null,
        startDate: null,
        endDate: null
      }
    })
  }

  renderModal = () => {
    const { form } = this.state
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'筛选'}
        confirm={'确定'}
        coverScreen={true}
        submit={() => {
          // console.log(this.state)
          this.listView.refreshData()
        }} >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>商品名称</Text>
            <FormItem2Component
              placeholder={'请输入商品名称'}
              value={form.likeGoodsName}
              onChangeText={text => {
                this.setState({ form: { ...this.state.form, likeGoodsName: text } })
              }}
            />
            <Text style={styles.modalTitle}>订单类型</Text>
            <FormItem2Component
              placeholder={'请选择订单类型'}
              showArrow={true}
              editable={false}
              value={this.type[form.createType]}
              onPress={() => { this.showType() }}
            />
            <Text style={styles.modalTitle}>订单总额</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FormItem2Component
                style={{ flex: 1 }}
                placeholder={'请输入最小金额'}
                keyboardType={'numeric'}
                value={form.startSum}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, startSum: text } })
                }}
              />
              <Text style={{ color: '#D8DDE2' }}>{'  -  '}</Text>
              <FormItem2Component
                style={{ flex: 1 }}
                placeholder={'请输入最大金额'}
                keyboardType={'numeric'}
                value={form.endSum}
                onChangeText={text => {
                  this.setState({ form: { ...this.state.form, endSum: text } })
                }}
              />
            </View>

            <Text style={styles.modalTitle}>下单时间</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FormItem2Component
                placeholder={'起始日期'}
                style={{ flex: 1 }}
                editable={false}
                leftIcon={'rili'}
                value={form.startDate}
                onPress={() => { this.showDatePicker(1) }}
              />
              <Text style={{ color: '#D8DDE2' }}>{'  -  '}</Text>
              <FormItem2Component
                placeholder={'截止日期'}
                style={{ flex: 1 }}
                editable={false}
                leftIcon={'rili'}
                value={form.endDate}
                onPress={() => { this.showDatePicker(2) }}
              />
            </View>

            <Touchable onPress={this.reset} style={{ marginTop: dp(100) }}>
              <Text style={styles.reset}>重置</Text>
            </Touchable>

          </View>
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
    return (
      <View style={styles.container}>

        <NavBar
          title={'订单列表'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={null}
          onLeftPress={() => {
            this.props.navigation.pop()
          }}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          canChangePageSize={false}
          navigation={this.props.navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderSeparator={null}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
        />
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

export default connect(mapStateToProps)(ERPOrderList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    width: dp(690),
    paddingHorizontal: dp(30),
    // paddingVertical: dp(30),
    paddingBottom: dp(26),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    // alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(10),
    fontWeight: 'bold'
  },
  text: {
    fontSize: dp(28),
    color: '#888888',
    marginTop: dp(30)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchIcon: {
    marginLeft: dp(10)
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1
  },
  clearIcon: {
    marginRight: dp(15)
  },
  selectType: {
    fontSize: dp(29),
    color: '#2D2926',
    paddingHorizontal: dp(30)
  },
  tabline: {
    flexDirection: 'row',
    marginHorizontal: dp(30),
    marginVertical: dp(30)
  },
  tab: {
    color: '#353535',
    fontSize: dp(28),
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'white',
    paddingVertical: dp(16),
    borderRadius: dp(36),
    overflow: 'hidden'
  },
  tab1: {
    color: '#91969A',
    fontSize: dp(28),
    width: dp(138),
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: dp(16),
    borderRadius: dp(36),
    overflow: 'hidden'
  },
  modalContainer: {
    padding: dp(60),
    paddingTop: 0
  },
  modalTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24)
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
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  reset: {
    borderRadius: dp(16),
    paddingVertical: dp(20),
    marginHorizontal: dp(120),
    color: '#666666',
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    paddingVertical: dp(20),
    alignItems: 'center'
  },
  title1: {
    color: '#2D2926',
    fontSize: dp(28)

  },
  itemtext: {
    color: '#91969A',
    fontSize: dp(24),
    marginTop: dp(20)
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'

  },
  itemBtn: {
    borderColor: '#979797',
    borderWidth: dp(1),
    borderRadius: dp(25),
    color: '#2D2926',
    overflow: 'hidden',
    paddingHorizontal: dp(26),
    paddingVertical: dp(12),
    fontSize: dp(24),
    marginLeft: dp(20)
  }

})
