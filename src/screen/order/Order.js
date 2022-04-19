import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import { connect } from 'react-redux'
import { setGoodsItems } from '../../actions/index'
import AlertModal from '../../component/AlertModal'
import ComfirmModal from '../../component/ComfirmModal'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import AuthUtil from '../../utils/AuthUtil'
import Color from '../../utils/Color'
import { customerServiceUrl } from '../../utils/config'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'

/**
 * 订单
 */
class Order extends PureComponent {
  constructor(props) {
    super(props)

    // 订单状态
    this.orderStatusV2 = {
      0: '待确认', // 确认订单   orderWay:1下游下单 2上游下单   确认订单(与当前身份相反时)
      1: '待审核', // 无操作按钮
      2: '待付款', // 申请放款（loanAllowAmount>0 && loanStatus"===2"）、修改订单、申请垫资（loanStatus === “0” || loanStatus === “3”）
      3: '已关闭', // 修改订单（重新编辑）
      4: '已付款', // 确认修改
      5: '修改订单中',
    }

    this.FXBOrderStatus = {
      LAUNCHED: '已制单',
      COMFIRMED: '分销工厂已确认',
      DEALER_MODIFIED: '已制单',
      REJECTED: '已关闭',
      LOANED: '已下单',
      STORAGED: '已入库',
      RECEIPTED: '已签收',
    }

    this.orderStatusChinese = {
      已制单: '0',
      已下单: '2',
      已申请: '2',
      工厂已确认: '0',
      分销工厂已确认: '2',
      已发货: '2',
      修改订单中: '5',
      已确认修改: '5',
      已签收: '2',
      到货签收: '2',
      已复核: '1',
      已排产: '2',
      已审批: '2',
      已提取: '1',
      已完工: '2',
      已施工: '2',
      仅零售订单修改: '5',
      已入库: '2',
      已生产: '2',
      已关闭: '3',
      重新编辑: '3',
    }

    this.checkedMap = {
      0: '工程采',
      1: '直营采',
      2: '货押采',
      3: '电商采',
      4: '分销采',
      5: '诚信销',
      6: '托盘',
      7: '诚信采',
      9: '背靠背',
    }

    this.state = {
      isSearch: false,
      isShowClear: false,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      modalVisible: false,
      orderModal: false,
      errorModal: false,
      companyTags: {},
      checked: '4',
      lockChecked: '4',
      itemType: '4',
      orderList: [],
      inputVal: '',
      pageNo: 1,
      pageSize: 10,
      totalPages: 1,
      keyboardShow: false,
    }
    this.canLoadMore = true
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state
    if (params) {
      // console.log('order componentDidMount')
      await this.setState({ lockChecked: params.businessType, checked: params.businessType })
      this.refreshItemData(false)
    }

    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      // if (this.state.orderList.length > 0) {
      //   this.scrollview.scrollToOffset({ offset: 0, animated: false })
      // }
      // console.log('order didFocus')
      this.refreshItemData(true)
    })

    this.refreshListener = DeviceEventEmitter.addListener('orderListRefresh', async data => {
      if (data && data.businessType) {
        // console.log('businessType', data.businessType)
        await this.selectType(data.businessType)
        this.setType()
      }
    })

    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    // BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.keyboardDidHideListener.remove()
    this.refreshListener.remove()
    // BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(this.props.navigation))
  }

  keyboardDidHide = () => {
    this.input.blur()
    this.setState({ keyboardShow: false })
  }

  handleOrderStatusFXB(list, lockChecked) {
    const orderList = list || this.state.orderList
    orderList.forEach((item, index) => {
      // v1版本订单直接取流程中中文订单状态，并映射成v2版本状态
      if (item.extWkaOrder.orderVersion === '1') {
        item.statusStr = this.orderStatusV2[this.orderStatusChinese[this.FXBOrderStatus[item.extWkaOrder.orderStatus]]]
      } else if (item.extWkaOrder.orderVersion === '2') {
        item.statusStr = this.orderStatusV2[item.extWkaOrder.orderNodeStatus]
      }
    })
    this.setState({ itemType: lockChecked, orderList })
  }

  handleOrderStatusCXX(list, lockChecked) {
    const orderList = list || this.state.orderList
    orderList.forEach((item, index) => {
      // v1版本订单直接取流程中中文订单状态，并映射成v2版本状态
      if (item.orderBasicVO.orderVersion === '1') {
        item.statusStr = this.orderStatusV2[
          this.orderStatusChinese[item.processInstanceVO.processProperties.orderStatusStr]
        ]
      } else if (item.orderBasicVO.orderVersion === '2') {
        item.statusStr = this.orderStatusV2[item.orderBasicVO.orderNodeStatus]
      }
    })
    this.setState({ itemType: lockChecked, orderList })
  }

  handleOrderStatus(list, lockChecked) {
    const orderList = list || this.state.orderList
    orderList.forEach((item, index) => {
      // v1版本订单直接取流程中中文订单状态，并映射成v2版本状态
      if (item.currentNodeCode === 'LAUNCH_ORDER') {
        item.statusStr = this.orderStatusV2['3']
      } else if (
        item.exchangeStatus === 'TO_CONFIRM_MODIFY' ||
        item.exchangeStatus === 'TO_SUPPLIER_CONFIRM' ||
        item.exchangeStatus === 'TO_CUSTOMER_MANAGER' ||
        item.currentNodeCode === 'TO_CUSTOMER_MANAGER' ||
        item.currentNodeCode === 'TO_CASHIER_CONFIRM'
      ) {
        item.statusStr = this.orderStatusV2['5']
      } else if (item.orderVersion === '1') {
        if (item.processInstanceVO) {
          item.statusStr = this.orderStatusV2[
            this.orderStatusChinese[item.processInstanceVO.processProperties.orderStatusStr]
          ]
        } else {
          item.statusStr = '获取失败'
        }
      } else if (item.orderVersion === '2') {
        item.statusStr = this.orderStatusV2[item.orderNodeStatus]
      }
    })
    this.setState({ itemType: lockChecked, orderList })
  }

  async loadData(refresh = false) {
    const { lockChecked, pageNo, pageSize, inputVal } = this.state

    const data = {
      pageNo,
      pageSize,
      orderCode: inputVal || null,
      typeStatus: lockChecked,
    }
    const res = await ajaxStore.order.orderAllList(data).catch(() => {
      this.setLoadMore(false)
      this.setRefreshing(false)
    })
    if (res && res.data && res.data.code === '0') {
      const { pagedRecords, totalPages } = res.data.data

      let orderList
      if (refresh) {
        orderList = pagedRecords
        this.setState({ loadEnd: pagedRecords && totalPages === 1 })
      } else {
        orderList = this.state.orderList.concat(pagedRecords)
      }

      if (lockChecked === '4') {
        this.handleOrderStatusFXB(orderList, lockChecked)
      } else if (lockChecked === '5') {
        this.handleOrderStatusCXX(orderList, lockChecked)
      } else {
        this.handleOrderStatus(orderList, lockChecked)
      }
      this.setState({ totalPages })
    }
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    if (this.state.loadingMore === true || this.state.refreshing === true) return
    this.setLoadMore(true)
    if (this.state.pageNo < this.state.totalPages) {
      await this.setState({ pageNo: this.state.orderList.length / 10 + 1, pageSize: 10 })
      this.loadData()
    } else {
      this.setState({ loadEnd: true })
    }
  }

  refreshData = async (isShowLoading = true) => {
    if (this.state.refreshing) return
    if (isShowLoading) this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    this.loadData(true)
  }

  refreshItemData = async (isShowLoading = true) => {
    if (this.state.refreshing) return
    if (isShowLoading) this.setRefreshing(true)
    await this.setState({
      pageNo: 1,
      pageSize: this.state.orderList.length === 0 ? 10 : this.state.orderList.length,
    })
    this.loadData(true)
  }

  search(text) {
    if (text) {
      this.setState({ isShowClear: true })

      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.refreshData(false)
      }, 500)
    } else {
      this.setState({ isShowClear: false })
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.refreshData(false)
  }

  startSearch = () => {
    this.setState({ isSearch: true })
    this.input.focus()
  }

  cancelSearch = () => {
    this.input.blur()
    this.input.clear()
    this.setState({ isSearch: false, isShowClear: false, inputVal: '' })
    this.refreshData(false)
  }

  onFocus = () => {
    this.setState({ isSearch: true, keyboardShow: true })
  }

  onBlur = () => {
    this.setState({ keyboardShow: false })
  }

  setLoadMore(visible) {
    this.setState({ loadingMore: visible })
  }

  setRefreshing(visible) {
    this.setState({ refreshing: visible })
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible })
  }

  selectType = checked => {
    this.setState({ checked })
  }

  setType = async () => {
    await this.setState({ lockChecked: this.state.checked })
    this.setModalVisible(false)
    this.refreshData()
  }

  resetType = () => {
    // this.selectType('4')
    this.setModalVisible(false)
  }

  checkCreate = async () => {
    // this.props.navigation.navigate('FourElements')
    const res = await ajaxStore.order.confirmContract()
    if (res.data && res.data.code === '0') {
      const tempOrderInfo = await AuthUtil.getTempOrderInfo()
      if (tempOrderInfo && (tempOrderInfo.orderName || (tempOrderInfo.items && tempOrderInfo.items.length > 0))) {
        this.setState({ orderModal: true })
      } else {
        this.createOrder()
      }
    }
  }

  createOrder = () => {
    this.props.navigation.navigate('OrderCreateStepOne')
  }

  goOrderDetail = item => {
    const data = {}
    if (this.state.lockChecked === '4') {
      data.orderId = item.extWkaOrder.id
      data.orderCode = item.extWkaOrder.orderCode
      data.type = 'FXB'
    } else {
      data.orderId = item.orderBasicVO.orderId
      data.orderCode = item.orderBasicVO.orderCode
      data.projectId = item.orderBasicVO.projectId
      data.totalCost = item.orderBasicVO.totalCost
    }
    this.props.navigation.navigate('OrderDetail', data)
  }

  applyLoan(item) {
    this.props.navigation.navigate('ApplyLoan', {
      orderId: item.orderBasicVO.orderId,
      supplierId: item.supplierCode,
      orderCode: item.orderBasicVO.orderCode,
      projectId: item.orderBasicVO.projectId,
    })
  }

  clickItemBtn = (item, action) => {
    switch (this.state.lockChecked) {
      case '0': // 工程采
      case '1':
      case '2':
      case '3':
        switch (action) {
          case 'applyLoan':
            this.applyLoan(item)
            break
          default:
            break
        }
        break
      case '4':
      default:
        if (item.extWkaOrder.foundsFrom === '2' && item.extWkaOrder.haierContractStatus === '0') {
          // 签署合同
          // 签署海尔合同 TODO
        } else if (item.extWkaOrder.orderStatus === 'DEALER_MODIFIED') {
          // 去确认  去掉了
        } else if (item.extWkaOrder.orderStatus === 'REJECTED') {
          // 重新制单  去掉了
        } else if (item.extWkaOrder.invoiceApplicable === '1') {
          // 申请开票
          this.applyInvoice(item.extWkaOrder.id, item.extWkaOrder.orderCode)
        }
        break
    }
  }

  applyInvoice = async (orderId, orderCode) => {
    global.showError = false
    const res = await ajaxStore.order.checkInvoiceApplicable({ orderCode })
    global.showError = true
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('ApplyInvoice', { orderId })
    } else {
      this.setState({ errorModal: true })
    }
  }

  goServer = () => {
    this.props.navigation.navigate('WebView', {
      title: '在线客服',
      url: `${customerServiceUrl}${'客户'}`,
    })
  }

  getItem1(name, code, supplierName, money, status, btnText, action, item) {
    return (
      <Touchable isNativeFeedback={true} onPress={() => this.goOrderDetail(item)}>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitile} numberOfLines={1} ellipsizeMode="tail">
            {name || ''}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`订单编号：${code || ''}`}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`合作销售方：${supplierName || ''}`}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`订单金额：${money ? toAmountStr(money, 2, true) : '0.00'}`}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`订单状态：${status || ''}`}
          </Text>
          {btnText ? (
            <Touchable
              style={styles.itemBtn1}
              onPress={() => {
                this.clickItemBtn(item, action)
              }}
              isPreventDouble={true}
            >
              <View style={styles.itemBtn}>
                <Text style={styles.itemBtnText}>{btnText || ''}</Text>
              </View>
            </Touchable>
          ) : null}
        </View>
      </Touchable>
    )
  }

  getItem2(name, code, supplierName, money, stateName, styleOut, styleIn, invoiceApplicable, btnText, item) {
    return (
      <Touchable isNativeFeedback={true} onPress={() => this.goOrderDetail(item)}>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitile} numberOfLines={1} ellipsizeMode="tail">
            {name || ''}
          </Text>
          <View style={styleOut}>
            <View style={styleIn} />
          </View>
          <View style={styles.itemLine}>
            <Text style={styles.itemText1} numberOfLines={1}>{`节点状态：${stateName || ''}`}</Text>
          </View>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`订单编号：${code || ''}`}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`合作销售方：${supplierName || ''}`}
          </Text>
          <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
            {`订单金额：${money ? toAmountStr(money, 2, true) : '0.00'}`}
          </Text>

          {invoiceApplicable ? (
            <Text style={styles.itemText} numberOfLines={1} ellipsizeMode="tail">
              {`发票状态：${invoiceApplicable || ''}`}
            </Text>
          ) : null}

          {btnText ? (
            <Touchable
              style={styles.itemBtn1}
              onPress={() => {
                this.clickItemBtn(item)
              }}
              isPreventDouble={true}
            >
              <Text style={styles.itemBtn}>{btnText || ''}</Text>
            </Touchable>
          ) : null}
        </View>
      </Touchable>
    )
  }

  renderItem(data) {
    const { item, index } = data
    if (this.state.itemType === '4') {
      let styleOut, styleIn
      if (item.extWkaOrder.orderStatus === 'LAUNCHED') {
        styleOut = styles.progressAll
        styleIn = styles.progress1
      } else if (item.extWkaOrder.orderStatus === 'DEALER_MODIFIED') {
        styleOut = styles.progressRed
        styleIn = styles.progress2
      } else if (item.extWkaOrder.orderStatus === 'COMFIRMED') {
        styleOut = styles.progressAll
        styleIn = styles.progress3
      } else if (item.extWkaOrder.orderStatus === 'LOANED') {
        styleOut = styles.progressAll
        styleIn = styles.progress4
      } else {
        styleOut = styles.progressAll
        styleIn = styles.progress5
      }
      const invoiceApplicable =
        item.extWkaOrder.invoiceApplicable === '2' || item.extWkaOrder.invoiceApplicable === '3'
          ? item.extWkaOrder.invoiceApplicable === '2'
            ? '开票中'
            : '已开票'
          : null

      let btnText
      if (item.extWkaOrder.foundsFrom === '2' && item.extWkaOrder.haierContractStatus === '0') {
        btnText = '签署合同'
      } else if (item.extWkaOrder.orderStatus === 'DEALER_MODIFIED') {
        btnText = '去确认'
      } else if (item.extWkaOrder.orderStatus === 'REJECTED') {
        btnText = '重新制单'
      } else if (item.extWkaOrder.invoiceApplicable === '1') {
        btnText = '申请开票'
      } else {
        btnText = null
      }

      return this.getItem2(
        item.extWkaOrder.orderName,
        item.extWkaOrder.orderCode,
        item.extWkaOrder.supplierName,
        item.extWkaOrder.totalAmount,
        item.statusStr,
        styleOut,
        styleIn,
        invoiceApplicable,
        btnText,
        item,
      )
    } else {
      let btnText = ''
      let action = ''
      if (
        this.state.itemType === '0' ||
        this.state.itemType === '1' ||
        this.state.itemType === '2' ||
        this.state.itemType === '3'
      ) {
        if (item.statusStr.indexOf('待付款') > -1) {
          if (item.orderBasicVO && item.orderBasicVO.orderVersion === '1') {
            if (item.orderBasicVO.loanStatus === '2' && item.loanAllowAmount > 0) {
              btnText = '申请支付货款'
              action = 'applyLoan'
            }
          } else {
            if (item.loanAllowAmount > 0) {
              btnText = '申请支付货款'
              action = 'applyLoan'
            }
          }
        }
      }

      return this.getItem1(
        item.projectName,
        item.orderBasicVO ? item.orderBasicVO.orderCode : '',
        item.supplierName || (item.supplierVO && item.supplierVO.supplierName),
        item.orderAmount,
        item.statusStr,
        btnText,
        action,
        item,
      )
    }
  }

  renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TouchableWithoutFeedback onPress={this.startSearch}>
            <View style={styles.searchView}>
              <TextInput
                ref={view => {
                  this.input = view
                }}
                placeholder={'搜索订单编号'}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={'#A7ADB0'}
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
          {this.state.isSearch ? (
            <Text style={styles.cancel} onPress={this.cancelSearch}>
              取消
            </Text>
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                if (!this.state.refreshing) {
                  this.setModalVisible(true)
                }
              }}
            >
              <Text style={styles.selectType}>筛选</Text>
            </TouchableWithoutFeedback>
          )}
        </View>
        <Text style={styles.title}>{`业务类型：${this.checkedMap[this.state.lockChecked]}`}</Text>
      </View>
    )
  }

  renderMore() {
    if (!this.state.loadEnd) {
      return this.state.loadingMore ? (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator style={styles.indicator} color={Color.THEME} />
          <Text style={styles.indicatorText}>正在加载更多</Text>
        </View>
      ) : null
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          {/* <View style={styles.separator} /> */}
          <Text style={[styles.indicatorText, { paddingVertical: dp(30), color: '#999999' }]}>—— 页面到底了 ——</Text>
        </View>
      )
    }
  }

  renderEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-order'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂时没有订单</Text>
        {this.state.lockChecked === '4' && this.props.companyTag.isSupportwoDistribution === '1' ? (
          <Text style={styles.emptyText}>点击下方按钮，创建订单</Text>
        ) : null}
      </View>
    )
  }

  renderSeparator() {
    return <View style={styles.separator} />
  }

  renderModal() {
    const { checked } = this.state
    return (
      <Modal
        style={styles.modal}
        isVisible={this.state.modalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
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
            <Text style={styles.modalBtn} onPress={this.resetType}>
              取消
            </Text>
            <Text style={styles.modalTitle}>筛选</Text>
            <Text style={styles.modalBtn} onPress={this.setType}>
              完成
            </Text>
          </View>
          <Text style={styles.modalTitle1}>选择业务类型</Text>
          {this.props.companyTag && (
            <View style={styles.modalContent}>
              <Text
                style={checked === '4' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                onPress={() => this.selectType('4')}
              >
                分销采
              </Text>
              {this.props.companyTag.isSupportRetaildirect === '1' ? (
                <Text
                  style={checked === '1' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('1')}
                >
                  直营采
                </Text>
              ) : null}
              {this.props.companyTag.isSupportRetailfreestore === '1' ? (
                <Text
                  style={checked === '3' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('3')}
                >
                  电商采
                </Text>
              ) : null}
              {this.props.companyTag.isSupportPurchaser === '1' ? (
                <Text
                  style={checked === '5' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('5')}
                >
                  诚信销
                </Text>
              ) : null}
              {this.props.companyTag.sincerityPick === '1' ? (
                <Text
                  style={checked === '7' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('7')}
                >
                  诚信采
                </Text>
              ) : null}
              {this.props.companyTag.isSupportProject === '1' ? (
                <Text
                  style={checked === '0' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('0')}
                >
                  工程采
                </Text>
              ) : null}
              {this.props.companyTag.isSupportRetailcontrolstore === '1' ? (
                <Text
                  style={checked === '2' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('2')}
                >
                  货押采
                </Text>
              ) : null}
              {this.props.companyTag.isSupportTray === '1' ? (
                <Text
                  style={checked === '6' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('6')}
                >
                  托盘
                </Text>
              ) : null}
              {this.props.companyTag.isDirectMining === '1' ? (
                <Text
                  style={checked === '9' ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                  onPress={() => this.selectType('9')}
                >
                  背靠背
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </Modal>
    )
  }

  renderOrderModal() {
    return (
      <ComfirmModal
        title={'您有未完成订单'}
        content={'您可以继续编辑未完成订单，若选择创建订单，未完成订单将被删除且不可恢复。'}
        cancelText={'创建订单'}
        comfirmText={'继续编辑'}
        cancel={async () => {
          this.setState({ orderModal: false })
          await AuthUtil.removeTempOrderInfo()
          setGoodsItems([])

          this.createOrder()
        }}
        confirm={async () => {
          const tempOrderInfo = await AuthUtil.getTempOrderInfo()
          this.props.navigation.navigate('OrderCreate', {
            type: 'continue',
            supplierId: tempOrderInfo.supplierId,
            supplierName: tempOrderInfo.supplierName,
          })
          this.setState({ orderModal: false })
        }}
        infoModal={this.state.orderModal}
      />
    )
  }

  renderErrorModal() {
    return (
      <AlertModal
        title={'提示'}
        content={'不符合开票条件，请先完成该笔订单的还款。'}
        comfirmText={'知道了'}
        cancel={async () => {
          this.setState({ errorModal: false })
        }}
        confirm={async () => {
          this.setState({ errorModal: false })
        }}
        infoModal={this.state.errorModal}
      />
    )
  }

  render() {
    const { navigation, dataSource } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'订单中心'}
          navigation={navigation}
          onLeftPress={() => {
            navigation.popToTop()
          }}
          rightIcon={'navibar_kefu'}
          rightIconSize={dp(60)}
          onRightPress={this.goServer}
          elevation={0.5}
          stateBarStyle={{ backgroundColor: this.state.modalVisible ? '#000000' : '#F7F7F9' }}
          navBarStyle={{ backgroundColor: '#F7F7F9' }}
        />
        <FlatList
          ref={r => {
            this.scrollview = r
          }}
          data={this.state.orderList}
          keyExtractor={item => (item.extWkaOrder ? item.extWkaOrder.id + '' : item.orderBasicVO.orderId + '')}
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
            console.log('onEndReached', this.canLoadMore)
            if (this.canLoadMore) {
              // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
              this.loadMoreData()
              this.canLoadMore = false
            }
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
          }}
        />
        {/* {this.state.lockChecked === '4' && this.props.companyTag && this.props.companyTag.isSupportwoDistribution === '1' && !this.state.keyboardShow
          ? <View style={styles.btn}>
            <SolidBtn text='创建二级新订单' style={{ backgroundColor: '#ffb038' }} onPress={this.checkCreate} />
          </View>
          : null} */}
        {this.renderModal()}
        {this.renderOrderModal()}
        {this.renderErrorModal()}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyTag: state.company.companyTag,
  }
}

export default connect(mapStateToProps)(Order)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  headerContainer: {},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginLeft: dp(10),
  },
  title: {
    marginLeft: dp(35),
    marginBottom: dp(30),
    marginTop: dp(50),
    fontSize: dp(28),
    color: '#91969A',
  },
  clearIcon: {
    marginRight: dp(15),
  },
  cancel: {
    paddingHorizontal: dp(30),
    fontSize: dp(29),
    color: Color.GREEN_BTN,
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1,
  },
  btn: {
    alignItems: 'center',
    paddingVertical: dp(20),
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.24,
  },
  emptyText: {
    fontSize: dp(28),
    marginBottom: dp(20),
    color: Color.TEXT_LIGHT,
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5',
    marginLeft: dp(30),
  },
  itemRow: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    alignItems: 'flex-start',
    padding: dp(30),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  itemLeft: {
    flex: 1,
  },

  itemTitile: {
    fontSize: dp(32),
    color: Color.TEXT_MAIN,
    fontWeight: 'bold',
    marginBottom: dp(6),
  },
  itemText: {
    fontSize: dp(27),
    color: Color.TEXT_LIGHT,
    marginTop: dp(11),
  },
  itemText1: {
    fontSize: dp(27),
    color: Color.TEXT_LIGHT,
  },
  itemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dp(11),
  },
  progressAll: {
    backgroundColor: 'rgba(79,191,159,0.1)',
    height: dp(4),
    width: dp(630),
    borderRadius: dp(50),
    marginVertical: dp(15),
  },
  progressRed: {
    backgroundColor: 'rgba(241,96,81,0.1)',
    height: dp(4),
    width: dp(630),
    borderRadius: dp(50),
    marginVertical: dp(15),
  },
  progress1: {
    backgroundColor: 'rgba(79,191,159,1)',
    height: dp(4),
    width: dp(126),
    borderRadius: dp(50),
  },
  progress2: {
    backgroundColor: 'rgba(241,96,81,1)',
    height: dp(4),
    width: dp(252),
    borderRadius: dp(50),
  },
  progress3: {
    backgroundColor: 'rgba(79,191,159,1)',
    height: dp(4),
    width: dp(378),
    borderRadius: dp(50),
  },
  progress4: {
    backgroundColor: 'rgba(79,191,159,1)',
    height: dp(4),
    width: dp(504),
    borderRadius: dp(50),
  },
  progress5: {
    backgroundColor: 'rgba(79,191,159,1)',
    height: dp(4),
    width: dp(630),
    borderRadius: dp(50),
  },
  itemBtn: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    backgroundColor: '#464678',
    color: 'white',
    fontSize: dp(24),
    borderRadius: dp(35),
    overflow: 'hidden',
  },
  itemBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(24),
  },
  itemBtn1: {
    marginTop: dp(25),
  },
  modal: {
    margin: 0,
    // justifyContent: 'flex-start'
  },
  modalTitle: {
    fontSize: dp(36),
    color: '#000000',
    fontWeight: 'bold',
  },
  modalTitle1: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    marginLeft: dp(40),
    marginTop: dp(40),
    marginBottom: dp(40),
  },
  modalContainer: {
    width: DEVICE_WIDTH,
    backgroundColor: 'white',
    height: DEVICE_HEIGHT * 0.95,
    position: 'absolute',
    borderTopLeftRadius: dp(30),
    borderTopRightRadius: dp(30),
    bottom: 0,
  },
  modalContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: dp(60),
  },
  modalBtn: {
    textAlign: 'center',
    padding: dp(30),
    fontSize: dp(30),
    color: '#1A97F6',
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(30),
  },
  indicator: {
    marginRight: dp(20),
  },
  indicatorText: {
    fontSize: dp(28),
    color: '#666666',
  },
  selectType: {
    fontSize: dp(29),
    color: '#2D2926',
    paddingHorizontal: dp(30),
  },
})
