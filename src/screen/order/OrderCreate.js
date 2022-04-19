import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, DeviceEventEmitter, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import EventTypes from '../../utils/EventTypes'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { setGoodsItems, setOrderSubmitData, setDefaultBaseInfo } from '../../actions/index'
import { formatTime, toAmountStr, formValid, showToast, injectUnmount } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import { getRegionTextArr } from '../../utils/Region'
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import CheckBox from 'react-native-check-box'
import GoodsListComponent from './component/GoodsListComponent'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import {
  vAmount, vPhone
} from '../../utils/reg'
import { onEvent } from '../../utils/AnalyticsUtil'

@injectUnmount
class OrderCreate extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      { id: 'orderName', required: true, name: '订单名称' },
      { id: 'productCode', required: true, name: '产品' },
      { id: 'receiptPerson', required: true, name: '收货人' },
      { id: 'receiptPhone', required: true, reg: vPhone, name: '联系电话' },
      { id: 'provinceCode', required: true, name: '省市区' },
      { id: 'receiptAddress', required: true, name: '详细地址' },
      { id: 'items', required: true, name: '货物' }
    ]

    this.state = {
      supplierId: '',
      supplierName: '',
      categoryBrands: [],
      productList: [],
      categoryBrandsIndex: 0, // 选择的品类品牌下标
      productIndex: 0, // 选择的产品下标
      productCode: '', // 该值跟随下标
      categoryCode: '', // 品类code
      brandCode: '', // 品牌code
      orderName: '',
      receiptPerson: '',
      receiptPhone: '',
      receiptAddress: '',
      provinceCode: '11', // 默认值
      cityCode: '110101', // 默认值
      areaCode: '',
      items: [], // 货物列表
      allSum: '',
      allSumStr: '0.00',
      isAuthorized: true,
      receiptWay: '',
      showModal: false,
      errorContent: '',
      showContractModal: false,
      modalText: '',
      showShadow: false,
      deleteModal: false,
      productModal: false,
      succeedModal: false,
      showUploadModal: false,
      modalContent: '',
      deleteIndex: 0
    }
  }

  componentDidMount () {
    this.getCompanyInfo()
  }

  async getCompanyInfo () {
    const res = await ajaxStore.order.getCompanyInfo()
    if (res.data && res.data.code === '0') {
      const receiptWay = res.data.data.receiptWay
      const { type, supplierId, supplierName, orderId } = this.props.navigation.state.params
      const storageTempOrderInfo = await AuthUtil.getTempOrderInfo()
      setGoodsItems(storageTempOrderInfo ? storageTempOrderInfo.items : [])
      this.setState({
        supplierId: supplierId || '',
        supplierName: supplierName || '',
        orderId: orderId || '',
        receiptWay: receiptWay || ''
      })

      if (type === 'create') { // 来自创建新订单
        setGoodsItems([])
        this.getDefaultReceiveInfo(supplierId, supplierName, receiptWay)
      } else if (type === 'continue') { // 来自继续编辑和重新制单
        const data = {
          supplierId,
          supplierName,
          receiptWay,
          categoryCode: storageTempOrderInfo.categoryCode,
          brandCode: storageTempOrderInfo.brandCode,
          productCode: storageTempOrderInfo.productCode,
          orderName: storageTempOrderInfo.orderName,
          receiptPerson: storageTempOrderInfo.receiptPerson,
          receiptPhone: storageTempOrderInfo.receiptPhone,
          receiptAddress: storageTempOrderInfo.receiptAddress,
          provinceCode: storageTempOrderInfo.provinceCode,
          cityCode: storageTempOrderInfo.cityCode,
          areaCode: storageTempOrderInfo.areaCode,
          items: storageTempOrderInfo.items
        }
        this.setState({ ...data })
        this.getCategoryBrands()
        this.calcAllSum(storageTempOrderInfo.items)
      } else if (type === 'recreate') {
        this.getOrderInfo(orderId, receiptWay)
      }
    }
  }

  async getDefaultReceiveInfo (supplierId, supplierName, receiptWay) {
    const res = await ajaxStore.order.getDefaultReceiveInfo()
    if (res.data && res.data.code === '0') {
      const d = formatTime(new Date()).split(' ')[0].replace(/-/g, '')
      const data = {
        supplierId,
        supplierName,
        receiptWay: receiptWay,
        productCode: '',
        orderName: this.state.supplierName + d,
        receiptPerson: res.data.data.name,
        receiptPhone: res.data.data.phone,
        receiptAddress: res.data.data.address,
        provinceCode: res.data.data.provinceCode,
        cityCode: res.data.data.cityCode,
        areaCode: res.data.data.areaCode,
        items: [],
        allSumStr: '0.00'
      }
      this.setState({ ...data })
      this.getCategoryBrands()
    }
  }

  async getCategoryBrands () {
    const { supplierId, categoryCode, brandCode } = this.state
    const res = await ajaxStore.order.getAll()
    if (res.data && res.data.code === '0') {
      let categoryBrandsIndex = 0
      let categoryBrands = []
      res.data.data.forEach(item => {
        if (item.supplierId === supplierId) {
          categoryBrands = item.relSupplierCategoryBrandVOS.map((item2, index2) => {
            if (categoryCode === item2.categoryCode && brandCode === item2.brandCode) {
              categoryBrandsIndex = index2
            }
            item2.completeName = `${item2.categoryName}/${item2.brandName}`
            return item2
          })
        }
      })
      this.setState({
        categoryBrands,
        categoryBrandsIndex,
        categoryCode: categoryBrands[categoryBrandsIndex].categoryCode,
        brandCode: categoryBrands[categoryBrandsIndex].brandCode
      })
      this.getProductList()
    }
  }

  async getProductList () {
    const { categoryBrands, categoryBrandsIndex, supplierId } = this.state
    const { categoryCode, brandCode } = categoryBrands[categoryBrandsIndex]
    const data = {
      supplierId,
      categoryCode,
      brandCode,
      isSupportDistribution: '1'
    }
    global.showError = false
    const res = await ajaxStore.order.getBySupplier(data)
    global.showError = true
    // console.log('aa', res.data)
    if (res.data && res.data.code === '0') {
      if (!res.data.data || res.data.data.length === 0) {
        this.setState({ showModal: true, errorContent: res.data.message })
        return
      }
      let productIndex = 0
      let productCode = res.data.data[0].code
      if (this.state.productCode) {
        res.data.data.forEach((item, index) => {
          if (item.code === this.state.productCode) {
            productIndex = index
            productCode = this.state.productCode
          }
        })
      }
      this.setState({
        productList: res.data.data,
        productIndex,
        productCode
      })
      this.validateProduct(() => {
        this.validateYibinSupportInfo()
      })
    } else if (!res.data.data || res.data.data.length === 0) {
      this.setState({ showModal: true, errorContent: res.data.message })
    }
  }

  async validateProduct (cb) {
    const data = {
      companyId: this.props.companyInfo.companyId,
      supplierId: this.state.supplierId,
      productCode: this.state.productCode
    }
    const res = await ajaxStore.order.checkContract(data)
    if (!res.data.data) {
      cb && cb()
    } else {
      this.setState({ modalText: res.data.data, showContractModal: true })
      // // 测试用，记得删
      // cb && cb()
    }
  }

  async validateYibinSupportInfo (cb) {
    const fundSource = this.state.productList[this.state.productIndex].fundSource
    if (fundSource === '1') {
      const res = await ajaxStore.order.memberAuthFileRequired()
      if (res.data && res.data.code === '0') {
        let supportInfoEmpty = []
        if (res.data.data && res.data.data.length > 0) {
          supportInfoEmpty = res.data.data.filter(item => item.count === 0)
        }
        if (supportInfoEmpty.length > 0) {
          this.setState({ showUploadModal: true })
        } else {
          cb && cb()
        }
      }
    } else {
      cb && cb()
    }
  }

  async getOrderInfo (orderId, receiptWay) {
    const res = await ajaxStore.order.getOrderInfo({ orderId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const tempOrderInfo = {}
      tempOrderInfo.supplierId = data.wkaOrder.dealerCode
      tempOrderInfo.supplierName = data.wkaOrder.supplierName
      tempOrderInfo.productCode = data.wkaOrder.productCode
      tempOrderInfo.orderName = data.wkaOrder.orderName
      tempOrderInfo.receiptPerson = data.wkaOrder.receiptPerson
      tempOrderInfo.receiptPhone = data.wkaOrder.receiptPhone
      tempOrderInfo.receiptAddress = data.wkaOrder.receiptAddress
      tempOrderInfo.provinceCode = data.wkaOrder.provinceCode
      tempOrderInfo.cityCode = data.wkaOrder.cityCode
      tempOrderInfo.areaCode = data.wkaOrder.areaCode
      tempOrderInfo.items = data.productList.map(item => {
        return {
          name: item.name,
          spec: item.spec,
          amount: item.amount,
          amountStr: toAmountStr(item.amount, 2, true),
          price: item.price,
          priceStr: toAmountStr(item.price, 2, true),
          sum: item.totalCost,
          sumStr: toAmountStr(item.totalCost, 2, true)
        }
      })
      tempOrderInfo.receiptWay = receiptWay

      setGoodsItems(tempOrderInfo.items)
      await AuthUtil.saveTempOrderInfo(tempOrderInfo)

      this.setState({ ...data })
      this.getCategoryBrands()
      this.calcAllSum(tempOrderInfo.items)
    }
  }

  async getProductInfo () {
    const res = await ajaxStore.order.getProductInfo({ productCode: this.state.productCode })
    if (res.data && res.data.code === '0') {
      res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
      const productInfo = res.data.data
      const interestRate = productInfo.interestRate
      let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

      let rateVoList = null
      const vipRate = await ajaxStore.order.companyStageRateContrast({ productCode: this.state.productCode, companyId: this.props.ofsCompanyId })
      if (vipRate.data && vipRate.data.code === '0' && vipRate.data.data.useSource !== '0') { // 会员比价费率
        rateVoList = JSON.parse(vipRate.data.data.useRate).rateVoList
        if (rateVoList && rateVoList.length > 0) {
          content += '信息系统服务费率：\n'
          for (var j = 0; j < rateVoList.length; j++) {
            if (vipRate.data.data.useSource === '1' || vipRate.data.data.useSource === '2') {
              content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${vipRate.data.data.comprehensiveServiceFreeRate}%`
            } else { // 信用认证会员费率
              content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${vipRate.data.data.comprehensiveServiceFreeRate}%`
            }
          }
        }
      } else { // 产品
        rateVoList = interestRate.rateVoList
        if (rateVoList && rateVoList.length > 0) {
          content += '信息系统服务费率：\n'
          for (var i = 0; i < rateVoList.length; i++) {
            content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%\n`
          }
        }
      }
      await this.setState({ modalContent: content })
    }
  }

  save = async () => {
    const { type, supplierId, supplierName, categoryCode, brandCode, productCode, orderName, receiptPerson, receiptPhone, receiptAddress, provinceCode, cityCode, areaCode, items } = this.state
    const vRes = this.validateComplete()
    if (vRes) {
      global.loading.show('保存中')
      const storageTempOrderInfo = { supplierId, supplierName, categoryCode, brandCode, productCode, orderName, receiptPerson, receiptPhone, receiptAddress, provinceCode, cityCode, areaCode, items }
      await AuthUtil.saveTempOrderInfo(storageTempOrderInfo)
      global.loading.hide()
      showToast('保存成功')
    }
  }

  commit = async () => {
    const { supplierId, productCode, orderName, receiptPerson, receiptPhone, receiptAddress, provinceCode, cityCode, areaCode, items, productList, productIndex } = this.state
    const data = { productCode, orderName, receiptPerson, receiptPhone, receiptAddress, provinceCode, cityCode, areaCode }
    const fundSource = productList[productIndex].fundSource
    console.log(fundSource)

    // data.formId = e.detail.formId
    // data.code = app.code
    data.dealerCode = supplierId
    data.remark = ''
    data.items = items.map(item => {
      return {
        name: item.name,
        spec: item.spec,
        amount: item.amount,
        price: item.price
      }
    })

    const vRes = this.validateComplete()
    if (vRes) {
      this.validateProduct(() => {
        this.validateYibinSupportInfo(async () => {
          // 判断开票信息是否完整
          global.showError = false
          const res = await ajaxStore.order.checkInvoiceInfo({ companyId: this.props.ofsCompanyId })
          global.showError = true
          if (!(res.data && res.data.code === '0' && res.data.data)) {
            global.alert.show({
              title: '完善开票信息',
              content: '开票信息还未补充完整，点击确定前往补充',
              callback: () => { this.props.navigation.navigate('InvoiceInfo') }
            })
            return
          }

          const urlMap = {
            1: '/customerPages/pages/erji_fourElements/erji_fourElements?from=orderCreate',
            2: '/customerPages/pages/erji_fourElementsByHaier/erji_fourElementsByHaier',
            4: '/customerPages/pages/erji_fourElementsByNanJing/erji_fourElementsByNanJing?from=orderCreate'
          }
          if (urlMap[fundSource]) {
            setOrderSubmitData(data)
            // 海尔 暂时不做
            if (fundSource === '2') {
            }
            // 南京银行
            if (fundSource === '4') {
              if (this.props.njTime && ((new Date().getTime() - this.props.njTime) / 1000 / 60) <= 30) { // 超过30分钟重新认证
                this.props.navigation.navigate('FourElementsByNanJing', { from: 'orderCreate' })
              } else {
                this.props.navigation.navigate('FaceIdentity', {
                  idcardName: this.props.companyInfo.legalPerson,
                  idcardNumber: this.props.companyInfo.legalPersonCertId,
                  // idcardName: '韩小乐',
                  // idcardNumber: '370304199504020010',
                  isNJBank: true,
                  callback: (navigation) => {
                    navigation.replace('FourElementsByNanJing', { from: 'orderCreate' })
                  }
                })
              }
              return
            }

            // 宜宾
            this.props.navigation.navigate('FourElements', { from: 'orderCreate' })
          } else {
            this.createOrder(data)
          }
        })
      })
    }
  }

  async createOrder (data) {
    const res = await ajaxStore.order.createWkaOrder(data)
    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'OrderCreate', '/ofs/front/wkaOrder/createWkaOrder', { orderNo: res.data.data })
      this.setState({ succeedModal: true })
    }
  }

  validateComplete () {
    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      if (this.state.items.length <= 0) {
        global.alert.show({
          content: '您还未添加货物'
        })
        return false
      }
      return true
    } else {
      global.alert.show({
        content: valid.msg
      })
      return false
    }
  }

  // 计算总价
  calcAllSum (items) {
    if (items) {
      let allSum = 0
      items.forEach(item => {
        allSum += item.sum
      })
      this.setState({
        allSum,
        allSumStr: toAmountStr(allSum, 2, true)
      })
    }
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  showProductModal = async () => {
    if (!this.state.modalContent) {
      await this.getProductInfo()
    }
    this.setState({ productModal: true })
  }

  showBrandsDialog = () => {
    const array = this.state.categoryBrands.map((item, index) => {
      return item.completeName
    })
    Keyboard.dismiss()
    Picker.init({
      pickerData: array,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择品类品牌',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.categoryBrands[this.state.categoryBrandsIndex].completeName],
      onPickerConfirm: (data, pickedIndex) => {
        this.hideShadow()

        const { categoryBrands, categoryBrandsIndex } = this.state
        if (pickedIndex !== categoryBrandsIndex) {
          this.setState({
            categoryBrandsIndex: pickedIndex,
            categoryCode: categoryBrands[pickedIndex].categoryCode,
            brandCode: categoryBrands[pickedIndex].brandCode,
            productCode: '',
            productList: []
          })
          this.getProductList()
        }
      },
      onPickerCancel: (data, pickedIndex) => {
        this.hideShadow()
      }
    })
    Picker.show()
    this.showShadow()
  }

  showProductDialog = () => {
    const array = this.state.productList.map((item, index) => {
      return item.name
    })
    Keyboard.dismiss()
    Picker.init({
      pickerData: array,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择产品',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.productList[this.state.productIndex].name],
      onPickerConfirm: (data, pickedIndex) => {
        this.hideShadow()

        if (pickedIndex !== this.state.productIndex) {
          this.setState({
            productIndex: pickedIndex,
            productCode: this.state.productList[pickedIndex].code
          })
          this.validateProduct(() => {
            this.validateYibinSupportInfo()
          })
        }
      },
      onPickerCancel: (data, pickedIndex) => {
        this.hideShadow()
      }
    })
    Picker.show()
    this.showShadow()
  }

  showRegionDialog = () => {
    RegionPickerUtil
      .init()
      .setOnOpen(this.showShadow)
      .setOnClose(this.hideShadow)
      .setConfirm((data) => {
        this.setState({
          provinceCode: data.provinceCode,
          cityCode: data.cityCode,
          areaCode: data.areaCode || ''
        })
      })
      .show(getRegionTextArr(this.state.provinceCode, this.state.cityCode, this.state.areaCode))
  }

  refreshGoodsList = (erjiAddGoodsItems) => {
    this.setState({
      items: erjiAddGoodsItems
    })
    this.calcAllSum(erjiAddGoodsItems)
  }

  addGoods = () => {
    this.props.navigation.navigate('OrderAddGoods', { refreshGoodsList: this.refreshGoodsList })
  }

  edit = (index) => {
    this.props.navigation.navigate('OrderAddGoods', { isEdit: 1, index, refreshGoodsList: this.refreshGoodsList })
  }

  delete = (index) => {
    this.setState({ deleteIndex: index, deleteModal: true })
  }

  disabled = () => {
    const { isAuthorized, supplierId, productCode, orderName, receiptPerson, receiptPhone, receiptAddress, provinceCode, items } = this.state
    return !(isAuthorized && supplierId && productCode && orderName && receiptPerson && receiptPhone && receiptAddress && provinceCode && items && items.length > 0)
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'填写基本信息'} navigation={navigation} />
        <ScrollView>
          <View>
            {/* 订单基本信息 */}
            <Text style={styles.title}>订单基本信息</Text>
            {/* 订单名称 */}
            <FormItemComponent
              title={'订单名称'}
              placeholder={'请输入订单名称'}
              value={this.state.orderName}
              onChangeText={text => {
                this.setState({ orderName: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 品类品牌 */}
            <FormItemComponent
              title={'品类品牌'}
              placeholder={''}
              editable={false}
              showArrow={true}
              value={this.state.categoryBrands[this.state.categoryBrandsIndex]
                ? this.state.categoryBrands[this.state.categoryBrandsIndex].completeName
                : ''}
              onPress={() => {
                if (this.state.categoryBrands && this.state.categoryBrands.length > 0) {
                  this.showBrandsDialog()
                }
              }}
            />
            <View style={styles.splitLine} />
            {/* 产品 */}
            <FormItemComponent
              title={'产品'}
              placeholder={''}
              editable={false}
              showArrow={false}
              value={this.state.productList[this.state.productIndex]
                ? this.state.productList[this.state.productIndex].name
                : ''}
            // onPress={() => {
            //   if (this.state.productList && this.state.productList.length > 0) {
            //     this.showProductDialog()
            //   }
            // }}
            />
            {this.state.productCode
              ? [<View key={0} style={styles.splitLine} />,
                <View key={1} style={styles.hintBg}>
                  <Text key={1} style={styles.hint} onPress={this.showProductModal}>查看产品要素</Text>
                </View>
              ]
              : null}
            {/* 收货人信息 */}
            <Text style={styles.title}>收货人信息</Text>
            {/* 收货人 */}
            <FormItemComponent
              title={'收货人'}
              placeholder={'请输入收货人姓名'}
              value={this.state.receiptPerson}
              onChangeText={text => {
                this.setState({ receiptPerson: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 联系电话 */}
            <FormItemComponent
              title={'联系电话'}
              placeholder={'请输入联系电话'}
              maxLength={11}
              keyboardType={'numeric'}
              value={this.state.receiptPhone}
              onChangeText={text => {
                this.setState({ receiptPhone: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收货地址 */}
            <FormItemComponent
              title={'收货地址'}
              placeholder={''}
              editable={false}
              showArrow={false}
              value={getRegionTextArr(this.state.provinceCode, this.state.cityCode, this.state.areaCode).join(' ')}
              onPress={() => {
                this.showRegionDialog()
              }}
            />
            <View style={styles.splitLine} />
            {/* 详细地址 */}
            <FormItemComponent
              title={'详细地址'}
              placeholder={'请输入详细地址'}
              value={this.state.receiptAddress}
              onChangeText={text => {
                this.setState({ receiptAddress: text })
              }}
            />
            {/* 货物信息 */}
            <Text style={styles.title}>货物信息</Text>
            <GoodsListComponent style={styles.goodsList}
              goodsList={this.state.items} editable={true}
              edit={(index) => this.edit(index)} delete={(index) => this.delete(index)} />
            <View style={[styles.splitLine, { marginRight: dp(30) }]} />
            <View style={styles.goodsRow}>
              <Touchable onPress={this.addGoods}>
                <Text style={styles.addGoods}>添加货物</Text>
              </Touchable>
              <Text style={styles.goodsSum}>{`合计 ${this.state.allSumStr}`}</Text>
            </View>
            {/* 授权 */}
            {this.state.receiptWay === 'AUTO'
              ? <View style={styles.checkbox}>
                <CheckBox
                  checkBoxColor={Color.TEXT_LIGHT}
                  uncheckedCheckBoxColor={Color.TEXT_LIGHT}
                  checkedCheckBoxColor={'#00b2a9'}
                  onClick={() => {
                    this.setState({
                      isAuthorized: !this.state.isAuthorized
                    })
                  }}
                  isChecked={this.state.isAuthorized}
                  checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                  unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                  rightText={'授权仟金顶代为自动签收盖章'}
                  rightTextStyle={{ color: Color.TEXT_MAIN }}
                /></View>
              : null}
            {/* 底部按钮 */}
            <View style={styles.footer}>
              <StrokeBtn onPress={this.commit} style={styles.commit} text={'提交订单'} disabled={this.disabled()} />
              <SolidBtn onPress={this.save} style={styles.save} text={'保存'} />
            </View>

          </View>
        </ScrollView>

        {this.renderSucceedModal()}
        {this.renderProductModal()}
        {this.renderErrorModal()}
        {this.renderContractModal()}
        {this.renderDeleteModal()}
        {this.renderUploadModal()}
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
      </View>
    )
  }

  renderSucceedModal () {
    return <AlertModal
      title={'提示'}
      content={'提交订单成功'}
      comfirmText={'确定'}
      cancel={() => {
        this.setState({ succeedModal: false })
      }}
      confirm={async () => {
        await AuthUtil.removeTempOrderInfo()
        setDefaultBaseInfo({})
        setGoodsItems([])
        this.props.navigation.navigate('Order')
        // DeviceEventEmitter.emit(EventTypes.REFRESH_ORDER)
        // app.erjiDefaultBaseInfo = {}
        // app.erjiAddGoodsItems = []
        // wx.navigateBack()
        this.setState({ succeedModal: false })
      }}
      infoModal={this.state.succeedModal} />
  }

  renderProductModal () {
    return <AlertModal
      title={'产品要素'}
      content={this.state.modalContent}
      comfirmText={'确定'}
      cancel={() => {
        this.setState({ productModal: false })
      }}
      confirm={() => {
        this.setState({ productModal: false })
      }}
      infoModal={this.state.productModal} />
  }

  renderErrorModal () {
    return <AlertModal
      title={'错误'}
      content={this.state.errorContent}
      comfirmText={'确定'}
      cancel={() => {
        this.setState({ showModal: false })
      }}
      confirm={() => {
        this.setState({ showModal: false })
      }}
      infoModal={this.state.showModal} />
  }

  renderContractModal () {
    return <ComfirmModal
      title={'合同暂未签署'}
      content={`选择的产品对应的${this.state.modalText}`}
      comfirmText={'前往签约'}
      cancelText={'取消'}
      cancel={() => {
        this.setState({ showContractModal: false })
      }}
      confirm={() => {
        this.setState({ showContractModal: false })
        // 合同
        this.props.navigation.navigate('ContractList')
      }}
      infoModal={this.state.showContractModal} />
  }

  renderUploadModal () {
    return <ComfirmModal
      title={'提示'}
      content={'应银行要求，您还有部分影像资料需要补充，请先进行上传！'}
      comfirmText={'前往上传'}
      cancelText={'取消'}
      cancel={() => {
        this.setState({ showUploadModal: false })
      }}
      confirm={async () => {
        await this.setState({ showUploadModal: false })
        // 前往上传
        this.props.navigation.navigate('CreditInformationByBank')
      }}
      infoModal={this.state.showUploadModal} />
  }

  renderDeleteModal () {
    return <ComfirmModal
      title={'提示'}
      content={'是否确定删除？'}
      comfirmText={'确定'}
      cancelText={'取消'}
      cancel={() => {
        this.setState({ deleteModal: false })
      }}
      confirm={() => {
        const index = this.state.deleteIndex
        const items = this.state.items
        items.splice(index, 1)
        this.setState({ items })
        setGoodsItems(items)
        this.calcAllSum(items)

        this.setState({ deleteModal: false })
      }}
      infoModal={this.state.deleteModal} />
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    njTime: state.cache.njTime,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(OrderCreate)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20),
    backgroundColor: '#EFEFF4'
  },
  splitLine: {
    height: 1,
    marginLeft: dp(30),
    backgroundColor: '#f0f0f0'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  goodsList: {
    marginTop: dp(30)
  },
  goodsRow: {
    flexDirection: 'row',
    padding: dp(30),
    alignItems: 'center'
  },
  addGoods: {
    fontSize: dp(28),
    color: 'white',
    backgroundColor: Color.WX_GREEN,
    paddingHorizontal: dp(18),
    paddingVertical: dp(13),
    borderRadius: dp(10)
  },
  goodsSum: {
    fontSize: dp(28),
    color: Color.TEXT_MAIN,
    textAlign: 'right',
    flex: 1,
    fontWeight: 'bold'
  },
  checkbox: {
    padding: dp(30),
    backgroundColor: '#EFEFF4'
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
  },
  hintBg: {
    backgroundColor: 'white',
    height: dp(120),
    justifyContent: 'center'
  },
  hint: {
    backgroundColor: 'white',
    color: '#0092d5',
    marginLeft: dp(30),
    textAlignVertical: 'center'
  },
  footer: {
    flexDirection: 'row',
    padding: dp(30),
    paddingBottom: dp(60),
    backgroundColor: '#EFEFF4'
  },
  commit: {
    flex: 1,
    paddingVertical: dp(20)
  },
  save: {
    flex: 1,
    marginLeft: dp(30),
    paddingVertical: dp(20)
  }
})
