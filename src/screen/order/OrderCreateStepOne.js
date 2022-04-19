import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, Keyboard, TouchableWithoutFeedback, TextInput
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { formatTime, toAmountStr, formValid, showToast, injectUnmount, getProductDetail } from '../../utils/Utility'
import { connect } from 'react-redux'
import { RadioGroup, RadioButton } from '../../component/Radio'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import AlertPage from '../../component/AlertPage'
import OrderSelectSupplier from '../order/component/OrderSelectSupplier'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import ComfirmModal from '../../component/ComfirmModal'
import { supportProducts } from '../../utils/enums'

@injectUnmount
class OrderCreateStepOne extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      bussinessTypeBtn: [],
      redioButtonItems: supportProducts,
      selectValue: '4',
      showShadow: false,
      form: {
        factoryName: ['请选择厂家'],
        brandName: ['请选择品类品牌'],
        productName: ['请选择产品类型'],
        projectName: ['请选择已有项目'],
        orderName: '',
        productCode: ''
      },
      factoryModal: false,
      productIndex: 0,
      productList: [],
      categoryBrandsIndex: 0,
      categoryCode: '',
      brandCode: '',
      categoryBrands: [],
      supplier: null,
      supplierId: '',
      projectId: '',
      productDetailContent: '',
      showContractModal: false,
      showUploadModal: false,
      showTmpOrderModal: false,
      tmpOrderInfo: '',
      supplierList: [],
      rule: [
        { id: 'orderName', required: false, name: '订单名称' },
        { id: 'productCode', required: true, name: '产品' }
      ],
      rule1: [
        { id: 'projectName', required: false, name: '项目' }
      ]
    }
    this.showBrandPicker = this.showBrandPicker.bind(this)
    this.showProductPicker = this.showProductPicker.bind(this)
    this.clearData = this.clearData.bind(this)
    this.next = this.next.bind(this)
  }

  async componentDidMount () {
    const bussinessTypeBtn = this.state.redioButtonItems.filter((item, index) => {
      return (
        this.props.companyInfo.companyTag[item.tag] === '1'
      )
    })
    await this.setState({
      bussinessTypeBtn,
      selectValue: bussinessTypeBtn[0].value
    })
    this.setState({
      initData: this.state
    })

    const tmpOrderInfo = await AuthUtil.getTempOrderInfo()
    if (tmpOrderInfo) {
      this.setState({
        showTmpOrderModal: true,
        tmpOrderInfo
      })
    } else {
      this.selectSupplier.loadData(this.state.selectValue)
    }
  }

  goNext () {
    let selectType = this.state.redioButtonItems.filter((item) => {
      return item.value === this.state.selectValue
    })
    selectType = selectType ? selectType[0] : {}
    this.props.navigation.navigate('OrderCreateStepTwo', {
      supplierId: this.state.supplierId,
      productCode: this.state.form.productCode,
      businessType: selectType.value,
      businessTypeName: selectType.label,
      brandName: this.state.form.brandName,
      supplierName: this.state.form.factoryName,
      productName: this.state.form.productName,
      orderName: this.state.form.orderName,
      fundSource: this.state.productList[this.state.productIndex].fundSource,
      stepOne: this.state,
      tmpOrderInfo: this.state.tmpOrderInfo
    })
  }

  goProjectNext () {
    let selectType = this.state.redioButtonItems.filter((item) => {
      return item.value === this.state.selectValue
    })
    selectType = selectType ? selectType[0] : {}
    this.props.navigation.navigate('ProjectOrderCreateStepTwo', {
      supplierId: this.state.supplierId,
      projectId: this.state.projectId,
      stepOne: this.state,
      tmpOrderInfo: this.state.tmpOrderInfo,
      businessType: selectType.value,
      businessTypeName: selectType.label

    })
  }

  next () {
    if (this.state.selectValue === '5') {
      const valid = formValid(this.state.rule1, this.state.form)
      if (valid.result) {
        this.goProjectNext()
      } else {
        global.alert.show({
          content: valid.msg
        })
      }
    } else {
      const valid = formValid(this.state.rule, this.state.form)
      if (valid.result) {
        const selectValue = this.state.selectValue
        if (selectValue === '4') {
          this.validateProduct(() => {
            this.validateYibinSupportInfo(() => {
              this.goNext()
            })
          })
        } else {
          this.validateYibinSupportInfo(() => {
            this.goNext()
          })
        }
      } else {
        global.alert.show({
          content: valid.msg
        })
        return false
      }
    }
  }

  clearData () {
    this.initData()
    global.alert.show({
      content: '已清空，请重新选择'
    })
  }

  initData (value) {
    // this.setState({
    //   selectValue: value || this.state.selectValue,
    //   form: {
    //     orderName: '',
    //     factoryName: ['请选择厂家'],
    //     brandName: ['请选择产品类型'],
    //     productName: ['请选择产品类型'],
    //     productCode: ''
    //   },
    //   supplierId: '',
    //   brandCode: '',
    //   productDetailContent: ''
    // })
    this.setState({
      ...this.state.initData,
      selectValue: value || this.state.selectValue
    })
  }

  showBrandPicker = () => {
    this.loadBrand()
  }

  showProductPicker = () => {
    this.loadProduct()
  }

  showFactoryModal = () => {
    if (this.state.selectValue === '5') {
      if (this.state.supplierList.length) {
        this.setState({ factoryModal: true })
      } else {
        global.alert.show({
          content: '没有可选择的项目'
        })
      }
    } else {
      if (this.state.supplierList.length) {
        this.setState({ factoryModal: true })
      } else {
        global.alert.show({
          content: '没有可选择的厂家'
        })
      }
    }
  }

  hideFactoryModal = () => {
    this.setState({ factoryModal: false })
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  loadProduct = () => {
    if (this.state.brandCode && this.state.productList.length) {
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
              form: {
                ...this.state.form,
                productName: this.state.productList[pickedIndex].name,
                productCode: this.state.productList[pickedIndex].code
              },
              productIndex: pickedIndex
            })
            this.getProductInfo()
            const selectValue = this.state.selectValue
            if (selectValue === '4') {
              this.validateProduct(() => {
                this.validateYibinSupportInfo()
              })
            } else {
              this.validateYibinSupportInfo()
            }
          }
        },
        onPickerCancel: (data, pickedIndex) => {
          this.hideShadow()
        }
      })
      this.showShadow()
      Picker.show()
    } else {
      if (!this.state.brandCode) {
        global.alert.show({
          content: '请先选择品类品牌'
        })
      } else if (this.state.productList) {
        let selectType = this.state.redioButtonItems.filter((item) => {
          return item.value === this.state.selectValue
        })
        selectType = selectType ? selectType[0] : {}
        global.alert.show({
          content: `您所选择的合作厂家暂无${selectType.label}产品，请重新选择，或联系您的客户经理`
        })
      }
    }
  }

  loadBrand () {
    if (this.state.supplierId) {
      const array = this.state.categoryBrands.map((item, index) => {
        return item.completeName
      })
      Picker.init({
        pickerData: array,
        isLoop: false,
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
        onPickerConfirm: (pickedValue, pickedIndex) => {
          const { categoryBrands, categoryBrandsIndex } = this.state
          if (pickedIndex !== categoryBrandsIndex) {
            this.setState({
              form: {
                ...this.state.form,
                brandName: pickedValue.join('-'),
                productCode: ''
              },
              categoryBrandsIndex: pickedIndex,
              categoryCode: categoryBrands[pickedIndex].categoryCode,
              brandCode: categoryBrands[pickedIndex].brandCode,
              productList: []
            })
          }
          this.getProductList()
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
    } else {
      global.alert.show({
        content: '请先选择厂家'
      })
    }
  }

  async getCategoryBrands () {
    const { supplierId, selectValue } = this.state
    let data
    switch (selectValue) {
      case '4':
        data = {
          isRelSupplier: true,
          plantType: 'DEALERS',
          relSupplier: true,
          supplierName: '',
          businessType: 1
        }
        break
      case '1':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 5
        }
        break
      case '3':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 4
        }
        break
      case '2':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 3
        }
        break
      default:
        break
    }
    const res = await ajaxStore.order.getAll(data)
    if (res.data && res.data.code === '0') {
      const categoryBrandsIndex = 0
      let categoryBrands = []
      res.data.data.forEach(item => {
        if (item.supplierId === supplierId) {
          categoryBrands = item.relSupplierCategoryBrandVOS.map((item2, index2) => {
            item2.completeName = `${item2.categoryName}-${item2.brandName}`
            return item2
          })
        }
      })
      this.setState({
        form: {
          ...this.state.form,
          brandName: categoryBrands[categoryBrandsIndex]
            ? categoryBrands[categoryBrandsIndex].completeName
            : ''
        },
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
    let selectType = this.state.redioButtonItems.filter((item) => {
      return item.value === this.state.selectValue
    })
    console.log(selectType, 'selectType')
    selectType = selectType ? selectType[0] : {}
    const data = {
      supplierId,
      categoryCode,
      brandCode,
      isSupportDistribution: selectType.name === 'isSupportDistribution' ? '1' : '0',
      isSupportRetailDirect: selectType.name === 'isSupportRetailDirect' ? '1' : '0',
      isSupportRetailFreeStore: selectType.name === 'isSupportRetailFreeStore' ? '1' : '0',
      isSupportRetailControlStore: selectType.name === 'isSupportRetailControlStore' ? '1' : '0'
    }
    const res = await ajaxStore.order.getBySupplier(data)
    if (res.data && res.data.code === '0') {
      if (!res.data.data || res.data.data.length === 0) {
        this.setState({ showModal: true, errorContent: res.data.message })
        return
      }
      let productIndex = 0
      let productCode = res.data.data[0].code
      if (this.state.form.productCode) {
        res.data.data.forEach((item, index) => {
          if (item.code === this.state.form.productCode) {
            productIndex = index
            productCode = this.state.form.productCode
          }
        })
      }

      let productList = res.data.data

      // 分销采只能选择第一个产品
      if (productList.length && this.state.selectValue === '4') {
        productList = [productList[0]]
      }
      this.setState({
        form: {
          ...this.state.form,
          orderName: (this.state.form.factoryName + formatTime(new Date())).split(' ')[0].replace(/-/g, ''),
          productName: res.data.data[productIndex]
            ? res.data.data[productIndex].name
            : '',
          productCode
        },
        productList,
        productIndex
      })
      this.getProductInfo()
      const selectValue = this.state.selectValue
      if (selectValue === '4') {
        this.validateProduct(() => {
          this.validateYibinSupportInfo()
        })
      } else {
        this.validateYibinSupportInfo()
      }
    } else if (!res.data.data || res.data.data.length === 0) {
      this.setState({
        form: {
          ...this.state.form,
          orderName: '',
          productName: ['请选择产品类型'],
          productCode: ''
        },
        productDetailContent: ''
      })
    }
  }

  async validateProduct (cb) {
    const data = {
      companyId: this.props.companyInfo.companyId,
      supplierId: this.state.supplierId,
      productCode: this.state.form.productCode
    }
    global.loading.show()
    const res = await ajaxStore.order.checkContract(data)
    if (!res.data.data) {
      cb && cb()
    } else {
      global.loading.hide()
      this.setState({ modalText: res.data.data, showContractModal: true })
      // // 测试用，记得删
      // cb && cb()
    }
  }

  async validateYibinSupportInfo (cb) {
    const fundSource = this.state.productList[this.state.productIndex].fundSource
    if (fundSource === '1') {
      const res = await ajaxStore.order.memberAuthFileRequired()
      global.loading.hide()
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
      global.loading.hide()
      cb && cb()
    }
  }

  disabled = () => {
    if (this.state.selectValue === '5') {
      const { supplier } = this.state
      console.log('supplier', supplier)
      return !supplier
    } else {
      const { productCode, orderName } = this.state.form
      const isSupportDistribution = this.state.selectValue === '4'
      return isSupportDistribution ? !(productCode && orderName) : !productCode
    }
  }

  creatProject = () => {
    this.props.navigation.navigate('ProjectCreate')
  }

  async getProductInfo () {
    // const res = await ajaxStore.order.getProductInfo({ productCode: this.state.form.productCode })
    // if (res.data && res.data.code === '0') {
    //   res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
    //   const productInfo = res.data.data
    //   const interestRate = productInfo.interestRate
    //   let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

    //   let rateVoList = null
    //   const vipRate = await ajaxStore.order.companyStageRateContrast({ productCode: this.state.form.productCode, companyId: this.props.ofsCompanyId })
    //   if (vipRate.data && vipRate.data.code === '0' && vipRate.data.data.useSource !== '0') { // 会员比价费率
    //     rateVoList = JSON.parse(vipRate.data.data.useRate).rateVoList
    //     if (rateVoList && rateVoList.length > 0) {
    //       content += '信息系统服务费率：\n'
    //       for (var j = 0; j < rateVoList.length; j++) {
    //         if (vipRate.data.data.useSource === '1' || vipRate.data.data.useSource === '2') {
    //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${vipRate.data.data.comprehensiveServiceFreeRate}%`
    //         } else { // 信用认证会员费率
    //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${vipRate.data.data.comprehensiveServiceFreeRate}%`
    //         }
    //       }
    //     }
    //   } else { // 产品
    //     rateVoList = interestRate.rateVoList
    //     if (rateVoList && rateVoList.length > 0) {
    //       content += '信息系统服务费率：\n'
    //       for (var i = 0; i < rateVoList.length; i++) {
    //         content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%`
    //         if (rateVoList.length - 1 !== i) {
    //           content += '\n'
    //         }
    //       }
    //     }
    //   }
    //   await this.setState({ productDetailContent: content })
    // }

    const content = await getProductDetail(this.state.form.productCode, this.props.ofsCompanyId)
    await this.setState({
      productDetailContent: content
    })
  }

  renderTmpOrder () {
    return <ComfirmModal
      title={'您有未完成订单'}
      content={'您可以继续编辑未完成订单，若选择创建订单，未完成订单将被删除且不可恢复'}
      comfirmText={'继续编辑'}
      cancelText={'创建订单'}
      cancel={async () => {
        await AuthUtil.removeTempOrderInfo()
        this.setState({
          showTmpOrderModal: false,
          tmpOrderInfo: ''
        })
        this.selectSupplier.loadData(this.state.selectValue)
      }}
      confirm={async () => {
        await this.setState({
          ...JSON.parse(this.state.tmpOrderInfo).stepOne,
          tmpOrderInfo: this.state.tmpOrderInfo
        })
        this.setState({ showTmpOrderModal: false })
        console.log(this.state, 'this.state')
        this.next()
      }}
      infoModal={this.state.showTmpOrderModal} />
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

  render () {
    const { navigation, companyInfo } = this.props
    let selectedIndex = 0
    this.state.bussinessTypeBtn.map((item, key) => {
      if (item.value === this.state.selectValue) {
        selectedIndex = key
      }
    })
    return (
      <View style={styles.container}>
        <NavBar title={'第一步：选择产品类型'} navigation={navigation} />
        <ScrollView>
          <View style={styles.blockMain}>
            <Text style={styles.blockTitle}>{'请选择业务类型'}</Text>
            <View style={styles.radioSelect}>
              <RadioGroup
                style={styles.reaioGroup}
                size={dp(32)}
                thickness={1}
                color={'#DDDDE8'}
                highlightColor={Color.THEME}
                selectedIndex={selectedIndex}
                onSelect={(index, value) => {
                  this.initData(value)
                  this.selectSupplier.loadData(value)
                }}
              >
                {this.state.bussinessTypeBtn.map((item, index) => {
                  return (
                    <RadioButton style={styles.radioButton} value={item.value} key={item.value}>
                      <View style={styles.radioMain}>
                        <Text style={this.state.selectValue === item.value ? styles.currentText : styles.reaioText}>{item.label}</Text>
                        <Text style={this.state.selectValue === item.value ? styles.currentRadioSummary : styles.radioSummary}>{item.summary}</Text>
                      </View>
                    </RadioButton>
                  )
                })}
              </RadioGroup>
            </View>
          </View>

          {this.state.selectValue === '5'
            ? <View style={styles.blockMain}>
              <Text style={styles.blockTitle}>{'请选择项目'}</Text>
              <View style={styles.formItem}>
                <Text style={styles.name}>在已有项目下创建订单</Text>
                <Touchable style={styles.select} onPress={() => { this.showFactoryModal() }} >
                  <Text style={[styles.input, this.state.form.projectName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{this.state.form.projectName}</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                </Touchable>
                <Text style={styles.creatProject} onPress={this.creatProject}>创建新项目</Text>
              </View>
            </View>
            : <View style={styles.blockMain}>
              <Text style={styles.blockTitle}>{'请选择产品类型'}</Text>
              <View style={styles.formItem}>
                <Text style={styles.name}>请选择厂家</Text>
                <Touchable style={styles.select} onPress={() => { this.showFactoryModal() }} >
                  <Text style={[styles.input, this.state.form.factoryName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{this.state.form.factoryName}</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                </Touchable>
              </View>
              <View style={styles.formItem}>
                <Text style={styles.name}>请选择品类品牌</Text>
                <Touchable style={styles.select} onPress={() => { this.showBrandPicker() }} >
                  <Text style={[styles.input, this.state.form.brandName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{this.state.form.brandName}</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                </Touchable>
              </View>
              <View style={styles.formItem}>
                <Text style={styles.name}>请选择产品类型</Text>
                <Touchable style={styles.select} onPress={() => { this.showProductPicker() }} >
                  <Text style={[styles.input, this.state.form.productName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{this.state.form.productName}</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                </Touchable>
              </View>
              {this.state.productDetailContent ? (
                <View style={styles.productDetail}>
                  <Text style={styles.productDetailTitle}>已选方案产品要素</Text>
                  <Text style={styles.productDetailItem}>{this.state.productDetailContent}</Text>
                </View>
              ) : (null)}
              {this.state.form.productCode && this.state.selectValue === '4' ? (
                <View style={styles.formItem}>
                  <Text style={styles.name}>请输入订单名称</Text>
                  <TextInput
                    placeholder={'请输入订单名称'}
                    placeholderTextColor={'#D8DDE2'}
                    style={[styles.select, styles.input]}
                    value={this.state.form.orderName}
                    onChangeText={text => {
                      console.log(text, 'text')
                      this.setState({ form: { ...this.state.form, orderName: text } })
                    }}
                  />
                </View>
              ) : (null)}
            </View>

          }
          <View style={styles.footer}>
            <SolidBtn disabled={this.disabled()} onPress={this.next} style={styles.next} text={'下一步，创建订单'} />
            {/* <Text onPress={this.clearData} style={styles.cancelText}>{'取消填写'}</Text> */}
          </View>
        </ScrollView>
        {this.renderTmpOrder()}
        {this.renderUploadModal()}
        {this.renderContractModal()}
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}><View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
        <OrderSelectSupplier
          ref={child => { this.selectSupplier = child }}
          loaded={(supplierList) => {
            this.setState({
              supplierList
            })
          }}
          cancel={() => {
            this.hideFactoryModal()
          }}
          confirm={async (supplier, selectValue) => {
            if (selectValue === '5') {
              await this.setState({
                supplier,
                projectId: supplier.projectId,
                supplierId: supplier.supplierId,
                form: {
                  ...this.state.form,
                  projectName: supplier.projectName
                }
              })
            } else {
              await this.setState({
                supplier,
                supplierId: supplier.supplierId,
                form: {
                  ...this.state.form,
                  factoryName: supplier.supplierName
                }
              })
              this.getCategoryBrands()
            }
          }}
          infoModal={this.state.factoryModal} />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(OrderCreateStepOne)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  blockMain: {
    backgroundColor: '#fff',
    paddingHorizontal: dp(30),
    paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(72),
    borderRadius: dp(16)
  },
  blockTitle: {
    fontSize: dp(32),
    marginBottom: dp(40),
    fontWeight: 'bold'
  },
  radioSelect: {
    backgroundColor: '#F8F8FA'
  },
  reaioGroup: {
    borderRadius: dp(16)
  },
  radioMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reaioText: {
    color: '#2D2926',
    fontSize: dp(30),
    fontWeight: 'bold',
    marginLeft: dp(10)
  },
  radioSummary: {
    color: '#A7ADB0',
    fontSize: dp(24),
    marginLeft: dp(28)
  },
  currentRadioSummary: {
    fontSize: dp(24),
    color: '#fff',
    marginLeft: dp(28)
  },
  currentText: {
    fontSize: dp(30),
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: dp(10)
  },
  radioButton: {
    alignItems: 'center',
    paddingVertical: dp(34),
    borderRadius: dp(16)
  },
  name: {
    marginBottom: dp(24)
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    padding: dp(30)
  },
  input: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }]
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  placeholder: {
    color: '#D8DDE2'
  },
  formItem: {
    marginBottom: dp(40)
  },
  productDetail: {
    backgroundColor: '#F8F8FA',
    paddingVertical: dp(30),
    paddingHorizontal: dp(28),
    marginBottom: dp(48)
  },
  productDetailTitle: {
    marginBottom: dp(15)
  },
  productDetailItem: {
    lineHeight: dp(50),
    color: '#999'
  },
  itemInput: {
    fontSize: dp(28)
  },
  footer: {
    marginTop: dp(96),
    paddingBottom: dp(100)
  },
  next: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    width: dp(690)
  },
  cancelText: {
    color: '#464678',
    fontSize: dp(30),
    textAlign: 'center',
    marginVertical: dp(120)
  },
  creatProject: {
    color: '#1A97F6',
    fontSize: dp(28),
    paddingTop: dp(40)
  }
})
