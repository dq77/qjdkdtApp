import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { SolidBtn } from '../../component/CommonButton'
import Touchable from '../../component/Touchable'
import Modal from 'react-native-modal'
import {
  instanceQuiet,
  instanceQuietForm
} from '../../utils/request'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import { toAmountStr, injectUnmount, getProductDetail } from '../../utils/Utility'
import { baseUrl } from '../../utils/config'
import { getRegionTextArr } from '../../utils/Region'
import FoldComponent from './component/FoldComponent'
import GoodsInfoComponent from './component/GoodsInfoComponent'
import AlertModal from '../../component/AlertModal'
import { open } from '../../utils/FileReaderUtils'

/**
 * 订单详情
 */
@injectUnmount
class OrderDetail extends PureComponent {
  constructor (props) {
    super(props)

    this.invoiceTypeMap = {
      1: '电子发票',
      2: '增值税普通发票',
      3: '增值税专用发票'
    }

    this.state = {
      tabType: 1, // 1基本信息 2货物详情 3相关合同
      type: '',
      orderId: '',
      orderCode: '',
      projectId: '',
      totalCost: 0, // 工程零售订单金额由上个页面传递过来
      orderFileKey: '',
      wkaOrder: {},
      productVo: {},
      goodsList: [],
      invoiceData: '',
      fileKeyArr: [],
      haierList: [],
      showModal: false,
      modalContent: '',
      useRate: null, // 会员费率
      useSource: '0',
      comprehensiveServiceFreeRate: '', // 综合服务费率
      fileList: []
    }
  }

  async componentDidMount () {
    const params = this.props.navigation.state.params
    await this.setState({
      orderId: params.orderId,
      orderCode: params.orderCode,
      projectId: params.projectId || '',
      totalCost: params.totalCost || 0,
      type: params.type
    })
    if (params.type === 'FXB') {
      await Promise.all([this.getOrderInfo(), this.getInvoiceInfo(), this.getHaierContracts()])
    } else {
      await this.getOrderInfoByPC()
    }
    this.getProductInfo()
  }

  async getOrderInfoByPC () {
    const res = await ajaxStore.order.getOrderInfoByPC({
      projectId: this.state.projectId,
      orderId: this.state.orderId
    })
    if (res.data && res.data.code === '0') {
      const wkaOrder = res.data.data.orderBasicVO
      let goodsList = []
      wkaOrder.totalAmountStr = toAmountStr(this.state.totalCost, 2, true)
      wkaOrder.receiptPlace = getRegionTextArr(wkaOrder.provinceCode, wkaOrder.cityCode, wkaOrder.areaCode).join(' ') + ' ' + wkaOrder.address
      goodsList = this.reformList(res.data.data.newOrderProductInfoVOs)

      // 会员费率
      let useRate = null
      let comprehensiveServiceFreeRate = ''
      const clmsProjectCompanyStageRateVO = res.data.data.clmsProjectInfoVO.clmsProjectCompanyStageRateVO
      if (clmsProjectCompanyStageRateVO && clmsProjectCompanyStageRateVO.useSource !== '0') {
        useRate = JSON.parse(clmsProjectCompanyStageRateVO.useRate)
        comprehensiveServiceFreeRate = clmsProjectCompanyStageRateVO.comprehensiveServiceFreeRate
      }
      this.setState({
        fileList: res.data.data.attachmentVOs,
        wkaOrder,
        goodsList,
        useRate,
        useSource: clmsProjectCompanyStageRateVO ? clmsProjectCompanyStageRateVO.useSource : '0',
        comprehensiveServiceFreeRate
      })
    }
  }

  async getOrderInfo () {
    const res = await ajaxStore.order.getOrderInfo({
      orderId: this.state.orderId
    })
    if (res.data && res.data.code === '0') {
      const wkaOrder = res.data.data.wkaOrder
      const productVo = res.data.data.productVo
      wkaOrder.totalAmountStr = toAmountStr(wkaOrder.totalAmount, 2, true)
      wkaOrder.receiptPlace = getRegionTextArr(wkaOrder.provinceCode, wkaOrder.cityCode, wkaOrder.areaCode).join(' ') + ' ' + wkaOrder.receiptAddress
      // 会员费率
      let useRate = null
      let comprehensiveServiceFreeRate = ''
      const clmsProjectCompanyStageRateVO = res.data.data.clmsProjectInfoVO.clmsProjectCompanyStageRateVO
      if (clmsProjectCompanyStageRateVO && clmsProjectCompanyStageRateVO.useSource !== '0') {
        useRate = JSON.parse(clmsProjectCompanyStageRateVO.useRate)
        comprehensiveServiceFreeRate = clmsProjectCompanyStageRateVO.comprehensiveServiceFreeRate
      }

      this.setState({
        wkaOrder,
        productVo,
        goodsList: res.data.data.productList,
        orderFileKey: wkaOrder.fileKey,
        useRate,
        useSource: clmsProjectCompanyStageRateVO ? clmsProjectCompanyStageRateVO.useSource : '0',
        comprehensiveServiceFreeRate
      })
    }
  }

  async getInvoiceInfo () {
    const res = await ajaxStore.order.getInvoiceInfo({
      orderCode: this.state.orderCode
    })
    if (res.data && res.data.data && res.data.code === '0') {
      const data = res.data.data
      data.receiptPlace = getRegionTextArr(data.receiveProvince || '11', data.receiveCity || '110101', data.receiveArea).join(' ') + ' ' + data.receiveAddress
      this.setState({
        invoiceData: data
      })
      if (data && data.invoiceOrderLshVos && data.invoiceOrderLshVos.length > 0) {
        const fileKeyArr = data.invoiceOrderLshVos.map(item => {
          return item.fileKey
        })
        this.setState({ fileKeyArr })
      }
    } else {
      this.setState({
        invoiceData: ''
      })
    }
  }

  async getHaierContracts () {
    const res = await ajaxStore.order.getHaierContracts({
      orderCode: this.state.orderCode
    })
    if (res.data && res.data.data && res.data.code === '0') {
      this.setState({ haierList: res.data.data })
    }
  }

  async getProductInfo () {
    // const res = await ajaxStore.order.getProductInfo({ productCode: this.state.wkaOrder.productCode })
    // if (res.data && res.data.code === '0') {
    //   res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
    //   const productInfo = res.data.data
    //   const interestRate = productInfo.interestRate
    //   let rateVoList = interestRate.rateVoList
    //   let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

    //   if (this.state.useRate) {
    //     rateVoList = this.state.useRate.rateVoList
    //     if (rateVoList && rateVoList.length > 0) {
    //       content += '信息系统服务费率：\n'
    //       for (var j = 0; j < rateVoList.length; j++) {
    //         if (this.state.useSource === '1' || this.state.useSource === '2') {
    //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
    //         } else { // 信用认证会员费率
    //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
    //         }
    //       }
    //     }
    //   } else {
    //     if (rateVoList && rateVoList.length > 0) {
    //       content += '信息系统服务费率：\n'
    //       for (var i = 0; i < rateVoList.length; i++) {
    //         content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%\n`
    //       }
    //     }
    //   }

    //   this.setState({ modalContent: content })
    // }
    const content = await getProductDetail(this.state.wkaOrder.productCode, this.props.ofsCompanyId)
    this.setState({ modalContent: content })
  }

  reformList (data) {
    const result = []
    data && data.forEach((item) => {
      item.orderProductInfoVOs.forEach((item2) => {
        let spec = ''
        try {
          spec = JSON.parse(item.data)['规格'] || ''
        } catch (e) { }
        result.push({
          name: item2.productName || '未命名货物',
          amount: item2.orderAmount,
          price: item2.price,
          totalCost: item2.totalCost,
          spec
        })
      })
    })
    return result
  }

  previewPDF (key) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: key })
  }

  previewInvoice (key) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: key })
  }

  async previewFile (item) {
    global.loading.show()
    await open(`${baseUrl}/ofs/front/file/preview?fileKey=${item.filePath.split('/')[0]}`)
    global.loading.hide()
  }

  switchTab = (tabType) => {
    this.setState({ tabType })
  }

  showModal = () => {
    this.setState({ showModal: true })
  }

  renderModal () {
    return <AlertModal
      title={'产品要素'}
      content={this.state.modalContent}
      comfirmText={'确定'}
      cancel={() => {
        this.setState({ showModal: false })
      }}
      confirm={() => {
        this.setState({ showModal: false })
      }}
      infoModal={this.state.showModal} />
  }

  renderContracts () {
    return (
      [
        <View key={0} style={styles.itemContent}>
          <Text style={styles.itemTitle}>相关合同</Text>
          {this.renderContrcatItems()}
        </View>,
        <Text key={1} style={styles.bottom}>—— 页面到底了 ——</Text>
      ]
    )
  }

  renderContrcatItems () {
    const views = []
    for (let i = 0; i < this.state.haierList.length; i++) {
      views.push(
        <Touchable key={i} onPress={() => { this.previewPDF(this.state.haierList[i].fileKey) }}>
          <View style={styles.contractItem} >
            <Text style={styles.contractName}>{this.state.haierList[i].name}</Text>
            <Iconfont name={'icon-pdf1'} size={dp(50)} />
          </View>
        </Touchable>
      )
    }
    if (this.state.orderFileKey) {
      views.push(
        <Touchable key={this.state.haierList.length} onPress={() => { this.previewPDF(this.state.orderFileKey) }}>
          <View style={styles.contractItem} >
            <Text style={styles.contractName}>已盖章订单合同</Text>
            <Iconfont name={'icon-pdf1'} size={dp(50)} />
          </View>
        </Touchable>
      )
    }
    return views
  }

  renderBaseInfo () {
    const { wkaOrder, productVo, type } = this.state
    return (
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>基本信息</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'合作销售方：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.supplierName || ''}</Text>
        </View>
        {type === 'FXB'
          ? <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'品类品牌：'}</Text>
            <Text style={styles.itemText}>{`${productVo.categoryName || ''}/${productVo.brandName || ''}`}</Text>
          </View>
          : null}
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'产品：'}</Text>
          <Text onPress={this.showModal} style={[styles.itemText, { color: '#0092d5' }]}>{wkaOrder.productName || ''}</Text>
        </View>
        {wkaOrder.projectName
          ? <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'项目名称：'}</Text>
            <Text style={styles.itemText}>{wkaOrder.projectName || ''}</Text>
          </View>
          : <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'订单名称：'}</Text>
            <Text style={styles.itemText}>{wkaOrder.orderName || ''}</Text>
          </View>}
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'订单编号：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.orderCode || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'订单金额：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.totalAmountStr || ''}</Text>
        </View>
        {type === 'FXB'
          ? <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'合同编号：'}</Text>
            <Text style={styles.itemText}>{wkaOrder.contractCode || ''}</Text>
          </View>
          : null}
      </View>

    )
  }

  renderReceiptInfo () {
    const { wkaOrder } = this.state
    return (
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>收货地址信息</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收货人：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.receiptPerson || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'联系电话：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.receiptPhone || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收货地址：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.receiptPlace || ''}</Text>
        </View>
      </View>
    )
  }

  renderGoodsList () {
    return (
      <GoodsInfoComponent goodsList={this.state.goodsList} totalPrice={this.state.wkaOrder.totalAmountStr} />
    )
  }

  renderFileList () {
    return (
      this.state.fileList.length
        ? (
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>已上传订单附件</Text>
            {this.state.fileList.map((item, key) => {
              return (
                <Touchable key={key} onPress={() => { this.previewFile(item) }}>
                  <View style={styles.fileRow}>
                    <Text style={styles.fileItem}>{item.filePath.split('/')[1]}</Text>
                    <Iconfont name={'arrow-right1'} size={dp(25)} />
                  </View>
                </Touchable>
              )
            })
            }
          </View>
        )
        : (null)
    )
  }

  renderInvoiceInfo () {
    const { invoiceData, wkaOrder } = this.state
    return (
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>发票信息</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'价格合计：'}</Text>
          <Text style={styles.itemText}>{'￥' + invoiceData.invoiceAmount || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'发票抬头：'}</Text>
          <Text style={styles.itemText}>{invoiceData.invoiceTitle || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'纳税人识别号：'}</Text>
          <Text style={styles.itemText}>{invoiceData.taxpayerId || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'发票类型：'}</Text>
          <Text style={styles.itemText}>{this.invoiceTypeMap[invoiceData.invoiceType] || '增值税专用发票'}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'地址、电话：'}</Text>
          <Text style={styles.itemText}>{invoiceData.invoiceAddress || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'开户行及账号：'}</Text>
          <Text style={styles.itemText}>{`${invoiceData.bankAccount}`}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'备注：'}</Text>
          <Text style={styles.itemText}>{invoiceData.invoiceRemark || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'发票状态：'}</Text>
          <Text style={styles.itemText}>{wkaOrder.invoiceApplicable === '2' ? '开票中' : '已开票' || ''}</Text>
        </View>
        {invoiceData.invoiceType === '1' && invoiceData.applyStatus === '1'
          ? this.renderInvoicePreview()
          : null}
      </View>
    )
  }

  renderInvoicePreview () {
    const views = []
    if (this.state.fileKeyArr.length === 1) {
      views.push(
        <Touchable key={0} onPress={() => { this.previewInvoice(this.state.fileKeyArr[0]) }}>
          <Text style={[styles.itemText, { color: '#0092d5' }]}>{'查看电子发票'}</Text>
        </Touchable>
      )
      return views
    }
    for (let i = 0; i < this.state.fileKeyArr.length; i++) {
      views.push(
        <Touchable key={i + 1} onPress={() => { this.previewInvoice(this.state.fileKeyArr[i]) }}>
          <Text style={[styles.itemText, { color: '#0092d5' }]}>{`查看电子发票${i + 1}`}</Text>
        </Touchable>
      )
    }
    return views
  }

  renderInvoiceContent () {
    const { invoiceData } = this.state
    return (
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>发票收件信息</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收件人姓名：'}</Text>
          <Text style={styles.itemText}>{invoiceData.receivePerson || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收件人电话：'}</Text>
          <Text style={styles.itemText}>{invoiceData.receiveContact || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收件人邮箱：'}</Text>
          <Text style={styles.itemText}>{invoiceData.receiveEmail || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'收件地址：'}</Text>
          <Text style={styles.itemText}>{invoiceData.receiptPlace || ''}</Text>
        </View>
      </View>

    )
  }

  base = () => {
    return (
      <View>
        {/* 基本信息 */}
        {this.renderBaseInfo()}
        {/* 收货地址信息 */}
        {this.renderReceiptInfo()}
        {/* 发票信息 */}
        {(this.state.invoiceData !== '') ? this.renderInvoiceInfo() : null}
        {/* 发票收件信息 */}
        {(this.state.invoiceData !== '') ? this.renderInvoiceContent() : null}
        <Text style={styles.bottom}>—— 页面到底了 ——</Text>
      </View>

    )
  }

  goods = () => {
    return (
      <View>
        {/* 附件列表 */}
        {this.renderFileList()}
        {/* 货物列表 */}
        {this.renderGoodsList()}
        <Text style={styles.bottom}>—— 页面到底了 ——</Text>
      </View>
    )
  }

  contracts = () => {
    return (
      <View>
        {/* 订单合同 */}
        {(this.state.orderFileKey || this.state.haierList.length > 0)
          ? this.renderContracts()
          : <Text style={styles.empty}>暂无数据</Text>}
      </View>
    )
  }

  render () {
    const { navigation, dataSource } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'查看订单详情'} navigation={navigation} />
        <View style={styles.tab}>
          <Text style={this.state.tabType === 1 ? styles.tabSelectText : styles.tabText} onPress={() => this.switchTab(1)}>基本信息</Text>
          <Text style={this.state.tabType === 2 ? styles.tabSelectText : styles.tabText} onPress={() => this.switchTab(2)}>货物详情</Text>
          <Text style={this.state.tabType === 3 ? styles.tabSelectText : styles.tabText} onPress={() => this.switchTab(3)}>相关合同</Text>
        </View>
        <ScrollView>
          {/* 基本信息 */}
          {this.state.tabType === 1 ? this.base() : null}
          {/* 货物详情 */}
          {this.state.tabType === 2 ? this.goods() : null}
          {/* 相关合同 */}
          {this.state.tabType === 3 ? this.contracts() : null}

          {/* <View> */}
          {/* 订单合同 */}
          {/* {(this.state.orderFileKey || this.state.haierList.length > 0) ? this.renderContracts() : null} */}
          {/* 基本信息 */}
          {/* {this.renderBaseInfo()} */}
          {/* 收货信息 */}
          {/* {this.renderReceiptInfo()} */}
          {/* 附件列表 */}
          {/* {this.renderFileList()} */}
          {/* 货物列表 */}
          {/* {this.renderGoodsList()} */}
          {/* 发票内容 */}
          {/* {(this.state.invoiceData !== '') ? this.renderInvoiceInfo() : null} */}
          {/* 收件内容 */}
          {/* {(this.state.invoiceData !== '') ? this.renderInvoiceContent() : null}
            <Text style={styles.bottom}>没有更多了</Text> */}
          {/* </View> */}
        </ScrollView>
        {this.renderModal()}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(OrderDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dp(30),
    paddingTop: dp(40)
  },
  title: {
    fontSize: dp(33),
    fontWeight: 'bold'
  },
  contractItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dp(20),
    height: dp(100),
    backgroundColor: '#F8F8FA',
    borderRadius: dp(16),
    borderWidth: dp(1),
    borderColor: '#e5e5e5',
    marginTop: dp(30)
  },
  contractName: {
    fontSize: dp(28),
    flex: 1,
    marginRight: dp(10)
  },
  separate: {
    height: dp(1.5),
    backgroundColor: '#e5e5e5'
  },
  itemTitle: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: 'bold',
    marginBottom: dp(13)
  },
  itemContent: {
    padding: dp(30),
    margin: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16),
    borderColor: '#e5e5e5',
    borderWidth: dp(1)
  },
  itemText: {
    fontSize: dp(28),
    color: '#91969A',
    flex: 1,
    marginTop: dp(15)
  },
  itemText1: {
    fontSize: dp(28),
    color: '#91969A',
    marginTop: dp(15),
    width: dp(220)
  },
  itemRow: {
    flexDirection: 'row'
  },
  bottom: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: dp(80),
    fontSize: dp(24),
    color: '#A7ADB0'
  },
  fileMain: {
    padding: dp(30),
    paddingTop: 0
  },
  fileItem: {
    color: '#2D2926',
    fontSize: dp(28),
    flex: 1,
    marginRight: dp(10)
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(100),
    paddingHorizontal: dp(30),
    borderRadius: dp(16),
    borderColor: '#e5e5e5',
    borderWidth: dp(1),
    backgroundColor: '#F8F8FA',
    marginTop: dp(15)
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: dp(20)
  },
  tabText: {
    fontSize: dp(28),
    textAlign: 'center',
    color: '#91969A',
    paddingVertical: dp(15),
    paddingHorizontal: dp(45)
  },
  tabSelectText: {
    fontSize: dp(28),
    textAlign: 'center',
    color: '#353535',
    fontWeight: 'bold',
    paddingVertical: dp(15),
    paddingHorizontal: dp(45),
    backgroundColor: 'white',
    borderRadius: dp(36),
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 1,
    shadowOpacity: 0.1,
    overflow: 'hidden'
  },
  empty: {
    flex: 1,
    marginVertical: dp(350),
    textAlign: 'center',
    color: '#999999',
    fontSize: dp(28)
  }
})
