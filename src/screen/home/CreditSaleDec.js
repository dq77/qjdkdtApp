import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, RefreshControl, FlatList, TextInput,
  ActivityIndicator, TouchableWithoutFeedback, BackHandler, StatusBar
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import { handleBackPress, toAmountStr } from '../../utils/Utility'
import Modal from 'react-native-modal'
import Picker from 'react-native-picker'
import { DateData } from '../../utils/Date'
import { getThisFullDate, CompareDate } from '../../utils/DateUtils'
import { stringify } from 'querystring'

/**
 * 支付货款
 */
class CreditSaleDec extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      loanList: [],
      inputVal: '',
      inputShowed: false,
      pageNo: 1,
      pageSize: 10,
      totalPage: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isSearch: false,
      isShowClear: false,
      orderStartTime: getThisFullDate(), // 上月第一天
      orderEndTime: getThisFullDate(), // 上月最后一天
      startTime: '',
      endTime: ''
    }
    this.canLoadMore = true
  }

  componentDidMount () {
    StatusBar.setBarStyle('default', true)
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        // if (this.state.loanList.length > 0) {
        //   this.scrollview.scrollToOffset({ offset: 0, animated: false })
        // }
        this.refreshItemData()
      }
    )

    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  async loadData (refresh = false) {
    const { selectNum, type, supplierId = '' } = this.props.navigation.state.params
    switch (type) {
      case 'list':// 清单
        this.list(refresh)
        break
      default:// 明细
        this.noList(refresh)
        break
    }
  }

  async noList (refresh) {
    const { pageNo, pageSize, inputVal } = this.state
    const { selectNum, supplierId = '' } = this.props.navigation.state.params
    const data = {
      companyId: this.props.companyInfo.companyId,
      supplierId: supplierId,
      startTime: this.state.startTime.length > 0 ? this.state.startTime + ' 00:00:00' : '',
      endTime: this.state.endTime.length > 0 ? this.state.endTime + ' 23:59:59' : '',
      projectCode: supplierId, // 项目编号 不用填
      pageNo,
      pageSize
    }
    let dataV = {}
    switch (selectNum) {
      case '2':dataV = {
        ...data,
        projectName: inputVal // 订单编号
      }
        break
      default:
        dataV = {
          ...data,
          orderCode: inputVal // 订单编号
        }
        break
    }
    const res = selectNum === '1' ? await ajaxStore.credit.detailqjd(dataV).catch(() => {
      this.catchRefresh()
    }) : selectNum === '2' ? await ajaxStore.credit.detailProject(dataV).catch(() => {
      this.catchRefresh()
    }) : await ajaxStore.credit.detailSupplier(dataV).catch(() => {
      this.catchRefresh()
    })
    if (res && res.data && res.data.code === '0') {
      const { pagedRecords, totalPage } = res.data.data
      let loanList
      if (refresh) {
        loanList = pagedRecords
        this.setState({ loadEnd: pagedRecords && totalPage === 1 })
      } else {
        loanList = this.state.loanList.concat(pagedRecords)
      }
      this.setState({ loanList, totalPage })
    }
    this.catchRefresh()
  }

  async list (refresh) {
    const { pageNo, pageSize, inputVal } = this.state
    // typeNum 2使用中授信额度     3冻结中授信额度
    const { selectNum, typeNum, supplierId = '' } = this.props.navigation.state.params
    const data = {
      companyId: this.props.companyInfo.companyId,
      supplierId: supplierId,
      startTime: this.state.startTime.length > 0 ? this.state.startTime + ' 00:00:00' : '',
      endTime: this.state.endTime.length > 0 ? this.state.endTime + ' 23:59:59' : '',
      orderCode: inputVal, // 订单编号
      pageNo,
      pageSize
    }
    let res = {}
    switch (selectNum) {
      case '1':
        res = typeNum === 2 ? await ajaxStore.credit.detailQjdUsing(data).catch(() => {
          this.catchRefresh()
        }) : await ajaxStore.credit.detailQjdFreezing(data).catch(() => {
          this.catchRefresh()
        })
        break
      case '2':
        res = await ajaxStore.credit.creditProject(data).catch(() => {
          this.catchRefresh()
        })
        break
      case '3':
        res = typeNum === 2 ? await ajaxStore.credit.detailSupplierUsing(data).catch(() => {
          this.catchRefresh()
        }) : await ajaxStore.credit.detailSupplierFreezing(data).catch(() => {
          this.catchRefresh()
        })
        break
      default:
        break
    }
    if (res && res.data && res.data.code === '0') {
      const { pagedRecords, totalPage } = res.data.data
      let loanList
      if (refresh) {
        loanList = pagedRecords
        this.setState({ loadEnd: pagedRecords && totalPage === 1 })
      } else {
        loanList = this.state.loanList.concat(pagedRecords)
      }
      this.setState({ loanList, totalPage })
    }
    this.catchRefresh()
  }

  catchRefresh () {
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    if (this.state.loadingMore === true || this.state.refreshing === true) return
    this.setLoadMore(true)
    if (this.state.pageNo < this.state.totalPage) {
      await this.setState({ pageNo: (this.state.loanList.length / 10) + 1, pageSize: 10 })
      this.loadData()
    } else {
      this.setState({ loadEnd: true })
    }
  }

  refreshData = async () => {
    if (this.state.refreshing) return
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    this.loadData(true)
  }

  refreshItemData = async () => {
    if (this.state.refreshing) return
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: this.state.loanList.length === 0 ? 10 : this.state.loanList.length })
    this.loadData(true)
  }

  setLoadMore (visible) {
    this.setState({ loadingMore: visible })
  }

  setRefreshing (visible) {
    this.setState({ refreshing: visible })
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  renderEmpty () {
    const { selectNum } = this.props.navigation.state.params
    const emptyText = selectNum === '1' ? '暂时没有授信额度使用明细' : selectNum === '2' ? '暂时没有临时额度使用明细' : '暂时没有上游额度使用明细'
    return <View style={styles.emptyContainer}>
      <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  }

  renderMore () {
    if (!this.state.loadEnd) {
      return this.state.loadingMore
        ? <View style={styles.indicatorContainer}>
          <ActivityIndicator style={styles.indicator} color={Color.THEME}/>
          <Text style={styles.indicatorText}>正在加载更多</Text>
        </View>
        : null
    } else {
      return <View style={{ alignItems: 'center' }}>
        {/* <View style={styles.separator} /> */}
        <Text style={[styles.indicatorText, styles.indicatorDecText]}>——页面到底了——</Text>
      </View>
    }
  }

  search (text) {
    if (text) {
      this.setState({ isShowClear: true })

      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.refreshData()
      }, 500)
    } else {
      this.setState({ isShowClear: false, inputVal: '' })
      this.refreshData()
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.refreshData()
  }

  startSearch = () => {
    this.setState({ isSearch: true })
    this.input.focus()
  }

  cancelSearch = () => {
    this.input.blur()
    this.input.clear()
    this.setState({ isSearch: false, isShowClear: false, inputVal: '' })
    this.refreshData()
  }

  onFocus = () => {
    this.setState({ isSearch: true })
  }

  onBlur = () => {
  }

  setModalVisible (visible) {
    this.setState({ modalVisible: visible })
  }

  toCreditSaleDecInfo (item) {
    const { selectNum, supplierId } = this.props.navigation.state.params
    const dataType = item.dataType === 'FREEZE' ? '冻结' : item.dataType === 'UNFREEZE' ? '解冻' : item.dataType === 'USED' ? '使用' : item.dataType === 'REFUND' ? '归还' : '订正'

    this.props.navigation.navigate('CreditSaleDecInfo', {
      selectNum: selectNum,
      supplierId: supplierId,
      titleType: selectNum === '1' ? '授信额度使用详情' : selectNum === '2' ? '临时额度使用详情' : '上游额度使用详情',
      dev1Value: selectNum === '1' ? item.gmtCreated : selectNum === '2' ? item.amount : item.gmtCreated,
      dev2Value: selectNum === '1' ? dataType : selectNum === '2' ? 'item.amount' : dataType,
      dev3Value: selectNum === '1' ? item.amount : selectNum === '2' ? 'item.amount' : item.amount,
      dev4Value: selectNum === '1' ? item.availableLine : selectNum === '2' ? item.amount : item.supplierName,
      orderNumber: selectNum === '1' ? item.orderCode : selectNum === '2' ? item.projectName : item.orderCode,
      name: selectNum === '1' ? item.loanCode : selectNum === '2' ? item.projectCode : item.loanCode,
      id: item.id
    })
  }

  setType = async () => {
    if (CompareDate(this.state.orderStartTime, this.state.orderEndTime)) {
      this.setModalVisible(false)
      global.alert.show({
        content: '结束时间不能早于开始时间'
      })
    } else {
      await this.setState({
        startTime: this.state.orderStartTime,
        endTime: this.state.orderEndTime
      })
      this.setModalVisible(false)
      this.refreshData()
    }
  }

  resetType = async () => {
    await this.setState({
      startTime: '',
      endTime: ''
    })
    // this.selectType('4')
    this.setModalVisible(false)
  }

  pickerConfirm (pickedValue, type) {
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
        startTime: pickedValue.join('-'),
        orderStartTime: pickedValue.join('-')
      })
    } else {
      this.setState({
        orderEndTime: pickedValue.join('-'),
        endTime: pickedValue.join('-')
      })
    }
    this.hideShadow()
  }

  format = (dataStrArr) => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  hideShadow = () => {
    Picker.hide()
  }

  renderHeader () {
    const { selectNum } = this.props.navigation.state.params
    const searchPlace = selectNum === '2' ? '搜索项目名称' : '搜索订单编号'
    return (
      <View style={styles.searchContainer} >
        <TouchableWithoutFeedback onPress={this.startSearch}>
          <View style={styles.searchView}>
            <TextInput
              ref={view => { this.input = view }}
              placeholder={searchPlace}
              // keyboardType='numeric'
              style={styles.input}
              placeholderTextColor={'#A7ADB0'}
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
        {/* {this.state.isSearch
          ? <Text style={styles.cancel} onPress={this.cancelSearch}>取消</Text>
          :  */}
        <TouchableWithoutFeedback onPress={() => {
          if (!this.state.refreshing) { this.setModalVisible(true) }
        }}>
          <View>
            <Text style={styles.selectType}>筛选</Text>
          </View>
        </TouchableWithoutFeedback>
        {/* } */}
      </View>
    )
  }

  renderItem (data) {
    const { item } = data
    const { selectNum, supplierId } = this.props.navigation.state.params
    // dataType  操作类型（冻结、解冻、使用、归还、订正）
    // FREEZE("FREEZE","冻结"),UNFREEZE("UNFREEZE","解冻")
    //         ,USED("USED","使用"),DONE("REFUND","归还");
    const dataType = item.dataType === 'FREEZE' ? '冻结' : item.dataType === 'UNFREEZE' ? '解冻' : item.dataType === 'USED' ? '使用' : item.dataType === 'REFUND' ? '归还' : '订正'
    const decNum = selectNum === '2' ? `项目名称:${item.projectName}` : `订单编号:${item.orderCode}`
    const amount = toAmountStr(item.amount, 2, true)
    return (
      <Touchable onPress={() => {
        this.toCreditSaleDecInfo(item)
      }} key={item.id + item.dataType}>
        <View style={styles.itemRow} >
          <View style={{}}>
            <Text style={styles.itemTimeText}>{item.gmtCreated}</Text>
            <Text style={styles.itemNumText}>{decNum}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: item.amount < 0 ? '#F55849' : '#2D2926', fontSize: dp(32) }}>{amount}</Text>
            <Text style={styles.dataTypeText}>{dataType}</Text>
          </View>
        </View>
      </Touchable>)
  }

  renderModal () {
    return (
      <Modal
        style={styles.modal}
        isVisible={this.state.modalVisible}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        coverScreen={true}
        hasBackdrop={true}
        statusBarTranslucent={true}
        backdropTransitionInTiming={200}
        backdropTransitionOutTiming={100}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        onBackdropPress={() => this.setModalVisible(false)}
        onBackButtonPress={() => this.setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalBtn} onPress={this.resetType}>取消</Text>
            <Text style={styles.modalTitle}>筛选</Text>
            <Text style={styles.modalBtn} onPress={this.setType}>完成</Text>
          </View>
          <Text style={styles.modalTitle1}>交易日期</Text>
          <View style={styles.timeBG}>
            <View style={styles.startTimeBG}>
              <TextInput
                placeholder={'起始日期'}
                placeholderTextColor={Color.TEXT_LIGHT}
                style={styles.timeInput}
                editable={false}
                value={this.state.orderStartTime}
              />
              <Touchable style={styles.touchItem} onPress={() => {
                this.showStartDatePicker(1)
              }}></Touchable>
            </View>
            <View style={styles.lineBG}></View>
            <View style={styles.startTimeBG}>
              <TextInput
                placeholder={'截止日期'}
                placeholderTextColor={Color.TEXT_LIGHT}
                style={styles.timeInput}
                editable={false}
                value={this.state.orderEndTime}
              />
              <Touchable style={styles.touchItem} onPress={() => {
                this.showStartDatePicker(2)
              }}></Touchable>
            </View>
          </View>

        </View>
      </Modal>
    )
  }

  showStartDatePicker = (type) => {
    const pickerTitleText = type === 1 ? '请选择交易日期起始日期' : '请选择交易日期截止日期'
    const orderStartTime = this.state.orderStartTime
    const orderEndTime = this.state.orderEndTime
    const selectedValue = type === 1 ? (orderStartTime ? this.format(orderStartTime).split('-') : []) : (orderEndTime ? this.format(orderEndTime).split('-') : [])
    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: pickerTitleText,
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: selectedValue,
      onPickerConfirm: (pickedValue, pickedIndex) => {
        this.pickerConfirm(pickedValue, type)
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
    const { navigation } = this.props
    const { selectNum } = navigation.state.params
    const navBarTitle = selectNum === '1' ? '授信额度使用明细' : selectNum === '2' ? '临时额度使用明细' : '上游额度使用明细'
    return (
      <View style={styles.container}>
        <NavBar title={navBarTitle}
          navigation={navigation}
          elevation={0.5}
          stateBarStyle={styles.navBarBG}
          navBarStyle={styles.navBarBG}
        />
        <FlatList
          ref={(r) => { this.scrollview = r }}
          data={this.state.loanList}
          keyExtractor={item => item.id.toString()}
          // ItemSeparatorComponent={() => this.renderSeparator()}
          renderItem={data => this.renderItem(data)}
          ListHeaderComponent={this.renderHeader()}
          ListEmptyComponent={this.renderEmpty()}
          refreshControl={
            <RefreshControl
              title={'加载中'}
              titleColor={Color.TEXT_MAIN}
              colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.refreshData}
              tintColor={Color.THEME}
            />
          }
          ListFooterComponent={this.renderMore()}
          onEndReached={() => {
            if (this.canLoadMore) { // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
              this.loadMoreData()
              this.canLoadMore = false
            }
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
          }}
        />
        {this.renderModal()}
      </View>
    )
  }
}
const styles = StyleSheet.create({
  navBarBG: {
    backgroundColor: '#F7F7F9'
  },
  lineBG: {
    backgroundColor: Color.SPLIT_LINE,
    height: dp(1),
    width: dp(30)
  },
  timeInput: {
    marginLeft: dp(30),
    color: '#2D2926',
    fontSize: dp(28)
  },
  startTimeBG: {
    marginLeft: dp(30),
    width: dp(320),
    height: dp(88),
    borderRadius: dp(16),
    borderColor: Color.SPLIT_LINE,
    borderWidth: dp(2),
    justifyContent: 'center'
  },
  timeBG: {
    marginTop: dp(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dataTypeText: {
    color: '#2D2926',
    fontSize: dp(28),
    marginTop: dp(30)
  },
  itemNumText: {
    color: '#91969A',
    fontSize: dp(28),
    marginTop: dp(30),
    maxWidth: dp(450)
  },
  itemTimeText: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  indicatorDecText: {
    paddingVertical: dp(30),
    color: '#666666'
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5',
    marginLeft: dp(30)
  },
  itemRow: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    paddingVertical: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    paddingHorizontal: dp(30)
  },
  itemTitile: {
    fontSize: dp(31),
    color: Color.TEXT_MAIN,
    marginBottom: dp(6),
    marginRight: dp(15)
  },
  itemHeadText: {
    fontSize: dp(30),
    color: '#464678',
    fontWeight: 'bold',
    marginLeft: dp(30)
  },
  itemHeadText1: {
    fontSize: dp(24),
    color: '#464678',
    marginRight: dp(30)
  },
  itemText: {
    fontSize: dp(26),
    color: '#91969A',
    marginTop: dp(11)
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.24
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(30)
  },
  indicator: {
    marginRight: dp(20)
  },
  indicatorText: {
    fontSize: dp(28),
    color: '#666666'
  },
  itemBtn: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: '#464678',
    textAlign: 'center',
    borderRadius: dp(30),
    fontSize: dp(24),
    marginRight: dp(30),
    overflow: 'hidden'
  },
  itemBtn2: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: 'rgba(70,70,120,0.5)',
    textAlign: 'center',
    borderRadius: dp(35),
    fontSize: dp(24),
    marginRight: dp(10),
    overflow: 'hidden'
  },
  btnLine: {
    marginTop: dp(30),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  headerContainer: {
    alignItems: 'flex-end'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(50)
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: dp(30),
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
  cancel: {
    paddingRight: dp(30),
    fontSize: dp(29),
    color: Color.GREEN_BTN
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1
  },
  validTime: {
    fontSize: dp(26),
    color: '#999999'
  },
  batchPay: {
    fontSize: dp(24),
    color: 'white',
    backgroundColor: '#464678',
    borderRadius: dp(30),
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    marginRight: dp(30),
    // marginTop: dp(20),
    marginBottom: dp(30),
    overflow: 'hidden'
  },
  itemHeader: {
    flexDirection: 'row',
    backgroundColor: '#DDDDE8',
    height: dp(90),
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16),
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectType: {
    fontSize: dp(29),
    color: '#2D2926',
    paddingHorizontal: dp(30)
  },
  modalContainer: {
    width: DEVICE_WIDTH,
    backgroundColor: 'white',
    height: DEVICE_HEIGHT * 0.95,
    position: 'absolute',
    borderTopLeftRadius: dp(30),
    borderTopRightRadius: dp(30),
    bottom: 0
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: dp(60)
  },
  modalBtn: {
    textAlign: 'center',
    padding: dp(30),
    fontSize: dp(30),
    color: '#1A97F6',
    fontWeight: 'bold'
  },
  modalTitle: {
    fontSize: dp(36),
    color: '#000000',
    fontWeight: 'bold'
  },
  modalTitle1: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    marginLeft: dp(40),
    marginTop: dp(40),
    marginBottom: dp(40)
  },
  modal: {
    margin: 0
    // justifyContent: 'flex-start'
  },
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    njTime: state.cache.njTime
  }
}

export default connect(mapStateToProps)(CreditSaleDec)
