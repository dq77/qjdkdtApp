import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, DeviceEventEmitter, TouchableWithoutFeedback, TextInput, Image
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import Picker from 'react-native-picker'
import RegionPicker from '../../component/RegionPicker'
import AuthUtil from '../../utils/AuthUtil'
import { formatTime, toAmountStr, formValid, showToast, injectUnmount, convertCurrency, getProductDetail } from '../../utils/Utility'
import { defaultUrl, baseUrl } from '../../utils/config'
import { vPrice } from '../../utils/reg'
import { connect } from 'react-redux'
import { RadioGroup, RadioButton } from '../../component/Radio'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import AlertPage from '../../component/AlertPage'
import ReceiveInfoEdit from './component/ReceiveInfoEdit'
import GoodsInfoEdit from './component/GoodsInfoEdit'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import { Municipalities, getRegionTextArr, parseAddress } from '../../utils/Region'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from '../../component/actionsheet'
import { getFileName } from '../../utils/FileUtils'
import PhotoModal from '../../component/PhotoModal'
import Swipeout from 'react-native-swipeout'
import { DashLine } from '../../component/DashLine'
import { onEvent } from '../../utils/AnalyticsUtil'
import CheckBox from 'react-native-check-box'
import { open } from '../../utils/FileReaderUtils'

@injectUnmount
class ProjectCreate extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      projectName: '',
      projectSide: '',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      address: '',
      showAddress: '',
      contractAmount: '',
      loanAmount: '',
      relProjectSupplier: '',
      supplierList: [],
      supplierIndex: 0,
      supplierName: '请选择合作厂家',
      categoryCode: '',
      categoryIndex: 0,
      categoryName: '请选择品类品牌',
      categoryList: [],
      brandCode: '',
      productCode: '',
      productIndex: 0,
      productName: '请选择产品类型',
      productList: [],
      productInfo: {},
      projectContractPath: '',
      fileKey: '',
      showShadow: false
    }

    this.rule = [
      {
        id: 'projectName',
        required: true,
        name: '项目名称'
      },
      {
        id: 'projectSide',
        required: true,
        name: '项目方'
      },
      {
        id: 'provinceCode',
        required: true,
        name: '项目所在地'
      },
      {
        id: 'address',
        required: true,
        name: '项目详细地址'
      },
      {
        id: 'fileKey',
        required: true,
        requiredErrorMsg: '请上传项目合同图片',
        name: '项目合同'
      },
      {
        id: 'contractAmount',
        required: true,
        name: '合同金额',
        reg: vPrice,
        regErrorMsg: '请输入正确合同金额，最多两位小数'
      },
      {
        id: 'loanAmount',
        required: true,
        name: '申请金额',
        reg: vPrice,
        regErrorMsg: '请输入正确申请金额，最多两位小数'
      },
      {
        id: 'relProjectSupplier',
        required: true,
        name: '厂家'
      },
      {
        id: 'categoryCode',
        required: true,
        name: '品类品牌'
      },
      {
        id: 'productCode',
        required: true,
        name: '产品类型'
      }

    ]
  }

  async componentDidMount () {
    const params = this.props.navigation.state.params

    if (params && params.projectId) {
      await this.getProjectInfo(params.projectId)
    } else {
      this.initCompanyManage()
    }
  }

  // const data = {
  //   projectName,
  //   projectSide,
  //   provinceCode,
  //   cityCode,
  //   areaCode,
  //   address,
  //   contractAmount,
  //   loanAmount,
  //   relProjectSupplier: JSON.stringify(relProjectSupplier),
  //   productCode,
  //   categoryCode,
  //   brandCode,
  //   projectContractPath: fileKey,
  //   isNeedFinancialSrv: 1
  // }

  getProjectInfo = async (projectId) => {
    const res = await ajaxStore.order.getProjectInfo({ projectId })
    if (res.data && res.data.code === '0') {
      const {
        projectName, projectSide, provinceCode, cityCode, areaCode,
        address, projectContractPath, contractAmount, loanAmount,
        supplierCode, supplierNames, productCode, productName
      } = res.data.data

      await this.setState({
        projectName,
        projectSide,
        provinceCode,
        cityCode,
        areaCode,
        address,
        showAddress: provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode) : '',
        projectContractPath,
        fileKey: projectContractPath,
        contractAmount: contractAmount.toString(),
        loanAmount: loanAmount.toString(),
        relProjectSupplier: [{ supplierId: supplierCode }],
        supplierName: supplierNames ? supplierNames[0] : '请选择合作厂家',
        isNeedFinancialSrv: 1,
        productCode,
        productName
      })
      // 产品要素
      this.getProductInfo(productCode)

      // 厂家
      await this.initCompanyManage()
      await this.state.supplierList.forEach((item, index) => {
        if (item.supplierId === supplierCode) {
          this.setState({
            supplierIndex: index
          })
        }
      })
      // 品类品牌
      await this.getCategoryBrand()
      await this.setState({
        categoryName: this.state.productInfo.categoryName + ' - ' + this.state.productInfo.brandName,
        categoryCode: this.state.productInfo.categoryCode,
        brandCode: this.state.productInfo.brandCode
      })
      await this.state.categoryList.forEach((item, index) => {
        if (item.categoryCode === this.state.productInfo.categoryCode) {
          this.setState({
            categoryIndex: index
          })
        }
      })
      // 产品
      await this.getProducts(supplierCode)
      await this.state.productList.forEach((item, index) => {
        if (item.code === productCode) {
          this.setState({
            productIndex: index,
            productName: item.name
          })
        }
      })
    }
  }

  initCompanyManage = async () => {
    const res = await ajaxStore.order.initCompanyManage()
    if (res.data && res.data.code === '0') {
      const info = res.data.data
      const supplierList = this.purifySupplier(info.supplierVos).map(item => {
        item.supplierId = item.id
        item.supplierName = item.name
        return item
      })
      this.setState({
        supplierList
      })
    }
  }

  // 提纯合作厂家列表，去除亚士创能和亚士漆
  purifySupplier (supplierList) {
    let newSupplier = []
    if (supplierList && supplierList.length > 0) {
      newSupplier = supplierList.filter((item, index, self) => {
        return !this.isYashi(item.supplierId, 2)
      })
    }
    return newSupplier
  }

  // 判断是否是亚士合作厂家
  isYashi (supplier, type) {
    var AsiaSupplier = {
      'ASIA-PAINT': '2016052701000100043NEB0000000065',
      'ASIA-CUANON': '201605270100010004W6130000000066',
      'ASIA-ENERGY': '20170623010001000494X70000000002',
      '2016052701000100043NEB0000000065': 'ASIA-PAINT',
      '201605270100010004W6130000000066': 'ASIA-CUANON',
      '20170623010001000494X70000000002': 'ASIA-ENERGY'
    }
    var PAINTorCUANONsupplier = {
      'ASIA-PAINT': '2016052701000100043NEB0000000065',
      'ASIA-CUANON': '201605270100010004W6130000000066',
      '2016052701000100043NEB0000000065': 'ASIA-PAINT',
      '201605270100010004W6130000000066': 'ASIA-CUANON'
    }
    if (type) {
      return PAINTorCUANONsupplier[supplier] || ''
    } else {
      return AsiaSupplier[supplier] || ''
    }
  }

  showSupplierPicker = () => {
    if (this.state.supplierList.length === 0) {
      global.alert.show({
        content: '没有可选择厂家'
      })
      return
    }
    const array = this.state.supplierList.map((item, index) => {
      return item.supplierName
    })
    Picker.init({
      pickerData: array,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择厂家',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.supplierName],
      onPickerConfirm: async (pickedValue, pickedIndex) => {
        const { supplierIndex, supplierList } = this.state
        if (pickedIndex !== supplierIndex) {
          await this.setState({
            supplierIndex: pickedIndex,
            supplierName: supplierList[pickedIndex].supplierName,
            relProjectSupplier: [{ supplierId: supplierList[pickedIndex].supplierId }],
            categoryCode: '',
            categoryIndex: 0,
            categoryName: '请选择品类品牌',
            categoryList: [],
            brandCode: '',
            productList: [],
            productCode: '',
            productIndex: 0,
            productName: '请选择产品类型',
            productDetailContent: ''
          })
        }
        this.getCategoryBrand()
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

  async getCategoryBrand () {
    this.setState({
      categoryList: this.state.supplierList[this.state.supplierIndex].relSupplierCategoryBrandVOS
    })
  }

  showCategoryPicker = () => {
    if (this.state.relProjectSupplier.length === 0) {
      global.alert.show({
        content: '请选择合作厂家'
      })
      return
    }
    if (this.state.categoryList.length === 0) {
      global.alert.show({
        content: '没有可选择品类品牌'
      })
      return
    }
    const array = this.state.categoryList.map((item, index) => {
      return item.categoryName + ' - ' + item.brandName
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
      pickerFontSize: 16,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.categoryName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        console.log(pickedValue)
        const { categoryIndex, categoryList } = this.state
        if (pickedIndex !== categoryIndex) {
          this.setState({
            categoryIndex: pickedIndex,
            categoryName: categoryList[pickedIndex].categoryName + ' - ' + categoryList[pickedIndex].brandName,
            categoryCode: categoryList[pickedIndex].categoryCode,
            brandCode: categoryList[pickedIndex].brandCode,
            productCode: '',
            productIndex: 0,
            productName: '请选择产品类型',
            productList: [],
            productDetailContent: ''
          })
          this.getProducts(this.state.supplierList[this.state.supplierIndex].supplierId)
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

  async getProducts (supplierId) {
    const { categoryCode, brandCode } = this.state
    const data = {
      supplierId,
      categoryCode,
      brandCode,
      isSupportProject: 1
    }
    const res = await ajaxStore.order.getBySupplier(data)
    if (res.data && res.data.code === '0') {
      const array = res.data.data.map((item, index) => {
        if (item.levelFlag === '0') {
          item.name = item.name + '（会员价）'
        }
        return item
      })

      this.setState({
        productList: array
      })
    } else {
      this.setState({
        productList: []
      })
    }
  }

  showProductPicker = () => {
    if (this.state.relProjectSupplier.length === 0) {
      global.alert.show({
        content: '请选择合作厂家'
      })
      return
    }
    if (!this.state.categoryCode) {
      global.alert.show({
        content: '请选择品类品牌'
      })
      return
    }
    if (this.state.productList.length === 0) {
      global.alert.show({
        content: '没有可选择产品类型'
      })
      return
    }
    const array = this.state.productList.map((item, index) => {
      return item.name
    })
    Picker.init({
      pickerData: array,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择产品类型',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 16,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.productName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        const { productIndex, productList } = this.state
        if (pickedIndex !== productIndex) {
          this.setState({
            productIndex: pickedIndex,
            productName: productList[pickedIndex].name,
            productCode: productList[pickedIndex].code
          })
          this.getProductInfo(productList[pickedIndex].code)
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

  async uploadOrderFile (path) {
    const data = {
      fileName: {
        uri: path,
        type: 'multipart/form-data',
        name: getFileName(path)
      }
    }
    global.loading.show('上传中')
    const res = await ajaxStore.credit.uploadAuthFile2(data)

    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const file = res.data.data
      // const pathArr = file.fileKey.split('/')
      this.setState({
        fileKey: file.fileKey
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  getProductInfo = async (productCode) => {
    // const res = await ajaxStore.order.getProductInfo({ productCode })
    // if (res.data && res.data.code === '0') {
    //   this.setState({
    //     productInfo: res.data.data
    //   })
    //   res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
    //   const productInfo = res.data.data
    //   const interestRate = productInfo.interestRate
    //   let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

    //   let rateVoList = null
    //   const vipRate = await ajaxStore.order.companyStageRateContrast({ productCode, companyId: this.props.ofsCompanyId })
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

    const content = await getProductDetail(productCode, this.props.ofsCompanyId)
    await this.setState({
      productDetailContent: content
    })
  }

  commit = async () => {
    const {
      projectName, projectSide, provinceCode, cityCode, areaCode, address,
      contractAmount, loanAmount, relProjectSupplier, productCode, categoryCode,
      brandCode, fileKey
    } = this.state

    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      const data = {
        projectName,
        projectSide,
        provinceCode,
        cityCode,
        areaCode,
        address,
        contractAmount,
        loanAmount,
        relProjectSupplier: JSON.stringify(relProjectSupplier),
        productCode,
        categoryCode,
        brandCode,
        projectContractPath: fileKey,
        isNeedFinancialSrv: 1
      }
      const params = this.props.navigation.state.params

      if (params && params.projectId) {
        data.projectId = params.projectId
        const res = await ajaxStore.order.updateProject(data)
        if (res.data && res.data.code === '0') {
          global.alert.show({
            content: '项目修改完成',
            callback: () => {
              this.props.navigation.goBack()
            }
          })
        }
      } else {
        const res = await ajaxStore.order.createProject(data)
        if (res.data && res.data.code === '0') {
          global.alert.show({
            content: '项目创建完成',
            callback: () => {
              this.props.navigation.goBack()
            }
          })
        }
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  disabled () {
    return false
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  pickSingleWithCamera (cropping, mediaType = 'photo') {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType
    }).then(async image => {
      console.log('received image', image)
      this.uploadOrderFile(image.path)
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  pickSingle (cropit, circular = false, mediaType = 'photo') {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      compressImageQuality: 0.5,
      multiple: true,
      maxFiles: 1,
      mediaType,
      includeExif: true
    }).then(async image => {
      console.log('received image', image)
      image.map((item, key) => {
        this.uploadOrderFile(item.path)
      })
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  deletePhoto (index) {
    this.setState({
      fileKey: ''
    })
  }

  async showPhoto (isShow) {
    // this.setState({
    //   modalVisible: !!isShow,
    //   currentImage: 0
    // })

    global.loading.show()
    await open(`${baseUrl}/ofs/front/file/preview?fileKey=${this.state.fileKey.split('/')[0]}`)
    global.loading.hide()
  }

  render () {
    const { navigation } = this.props
    const {
      projectName, projectSide, showAddress, address,
      contractAmount, loanAmount, supplierName,
      categoryName, productName
    } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={'创建项目'} navigation={navigation} />
        <ScrollView >

          <View style={styles.content}>
            <Text style={styles.hint}>完善以下信息，即可提交项目审核</Text>

            <View style={styles.blockMain}>
              <Text style={styles.blockTitle}>{'项目信息'}</Text>

              {/* 项目名称 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目名称</Text>
              </View>
              <TextInput
                placeholder={'请输入项目名称'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={projectName}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ projectName: text })
                }}
              />
              {/* 项目方 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目方</Text>
              </View>
              <TextInput
                placeholder={'请输入项目方'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={projectSide}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ projectSide: text })
                }}
              />
              {/* 项目所在地区 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目所在地区</Text>
              </View>
              <View style={[styles.input, styles.picker]}>
                <RegionPicker
                  ref={o => { this.RegionPicker = o }}
                  fontSize={28}
                  hint={'请选择所在地区'}
                  monitorChange={true}
                  selectedValue={showAddress}
                  onPickerConfirm={(data) => {
                    this.setState({
                      provinceCode: data.provinceCode,
                      cityCode: data.cityCode,
                      areaCode: data.areaCode,
                      showAddress: data.label.split(' ')
                    })
                  }}
                  onOpen={() => { this.showShadow() }}
                  onClose={() => { this.hideShadow() }}
                />
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </View>
              {/* 项目详细地址 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目详细地址</Text>
              </View>
              <TextInput
                placeholder={'无需填写省市区'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={address}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ address: text })
                }}
              />
              {/* 上传项目合同 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>上传项目合同</Text>
              </View>

              {this.state.fileKey
                ? <View style={styles.imageWapper} >
                  <Touchable onPress={() => { this.showPhoto(true) }}>
                    {/* <View> */}
                    <View style={styles.fileItem} >
                      <Iconfont name={'shangchuanwenjian'} size={dp(50)} />
                      <Text style={{ fontSize: dp(26), color: '#8997AE', flex: 1, marginLeft: dp(20) }}>{this.state.fileKey.split('/')[1]}</Text>
                    </View>
                    {/* <Image
                        style={styles.fileImage}
                        source={{ uri: `${baseUrl}/ofs/weixin/project/loadFile?buzKey=${this.state.fileKey.split('/')[0]}` }}
                        resizeMode={'cover'}
                      /> */}
                    {/* </View> */}

                  </Touchable>
                  <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto()}>
                    <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                  </Touchable>
                </View>
                : <Touchable onPress={() => {
                  this.ActionSheet.show()
                }}>
                  <View style={styles.uploadBtn}>
                    <Text style={styles.uploadIcon}>+</Text>
                  </View>
                </Touchable>

              }

            </View>

            <View style={[styles.blockMain, { marginTop: dp(60) }]}>

              <Text style={styles.blockTitle}>{'赊销信息'}</Text>

              {/* 合同金额 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>合同金额（元）</Text>
              </View>
              <TextInput
                placeholder={'请输入合同金额'}
                placeholderTextColor={'#D8DDE2'}
                keyboardType="number-pad"
                maxLength={100}
                style={styles.input}
                value={contractAmount}
                onChangeText={text => {
                  this.setState({ contractAmount: text })
                }}
              />
              {/* 申请金额 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>申请金额</Text>
              </View>
              <TextInput
                placeholder={'请输入申请金额'}
                placeholderTextColor={'#D8DDE2'}
                keyboardType="number-pad"
                maxLength={100}
                style={styles.input}
                value={loanAmount}
                onChangeText={text => {
                  this.setState({ loanAmount: text })
                }}
              />

              {/* 请选择厂家 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>请选择厂家</Text>
              </View>
              <Touchable style={styles.select} onPress={() => { this.showSupplierPicker() }} >
                <Text style={[styles.selectText, supplierName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{supplierName}</Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 请选择品类品牌 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>请选择品类品牌</Text>
              </View>
              <Touchable style={styles.select} onPress={() => { this.showCategoryPicker() }} >
                <Text style={[styles.selectText, categoryName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{categoryName}</Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 请选择产品类型 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>请选择产品类型</Text>
              </View>
              <Touchable style={styles.select} onPress={() => { this.showProductPicker() }} >
                <Text style={[styles.selectText, productName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{productName}</Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 产品要素 */}
              {this.state.productDetailContent ? (
                <View style={styles.productDetail}>
                  <Text style={styles.productDetailTitle}>已选方案产品要素</Text>
                  <Text style={styles.productDetailItem}>{this.state.productDetailContent}</Text>
                </View>
              ) : (null)}

            </View>

            <View style={styles.footerBtn}>
              <SolidBtn onPress={this.commit} style={styles.save} text={'提交项目审核'} />
              <Text style={styles.cancelText} onPress={() => { this.props.navigation.goBack() }}>取消填写</Text>
            </View>

          </View>
        </ScrollView>

        {this.state.showShadow
          ? <TouchableWithoutFeedback
            onPress={() => {
              this.RegionPicker.hide()
              this.hideShadow()
            }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
          : null}
        <ActionSheet
          ref={o => { this.ActionSheet = o }}
          options={['拍照', '从相册中选择', '取消']}
          cancelButtonIndex={2} // 表示取消按钮是第index个
          destructiveButtonIndex={2} // 第几个按钮显示为红色
          onPress={(index) => {
            switch (index) {
              case 0:
                this.pickSingleWithCamera(false)
                break
              case 1:
                this.pickSingle(false)
                break
            }
          }}
        />
        {this.state.fileKey && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={[this.state.fileKey.split('/')[0]]}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}

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

export default connect(mapStateToProps)(ProjectCreate)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  content: {
    alignItems: 'stretch'

  },
  hint: {
    color: '#91969A',
    fontSize: dp(28),
    marginVertical: dp(30),
    textAlign: 'center'
  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16)
  },
  blockTitle: {
    fontSize: dp(32),
    fontWeight: 'bold'
  },
  name: {

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
  selectText: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    paddingVertical: dp(15),
    fontSize: dp(28)

  },
  placeholder: {
    color: '#D8DDE2'
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }]
  },
  save: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    marginTop: dp(96)
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(24),
    marginTop: dp(48)
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  imageWapper: {
    position: 'relative'
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: -dp(25),
    top: -dp(25)
  },
  fileImage: {
    flex: 1,
    width: dp(630),
    height: dp(300),
    marginBottom: dp(30),
    borderRadius: dp(16)
  },
  uploadBtn: {
    backgroundColor: '#DDDDE8',
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(68)
  },
  uploadIcon: {
    color: '#fff',
    fontSize: dp(120)
  },
  cancelText: {
    fontSize: dp(30),
    color: '#464678',
    paddingVertical: dp(30),
    marginVertical: dp(60)
  },
  productDetail: {
    backgroundColor: '#F8F8FA',
    paddingVertical: dp(30),
    paddingHorizontal: dp(28),
    marginTop: dp(30)
  },
  productDetailTitle: {
    marginBottom: dp(15)
  },
  productDetailItem: {
    lineHeight: dp(50),
    color: '#999'
  },
  fileItem: {
    flex: 1,
    width: dp(630),
    height: dp(110),
    marginBottom: dp(30),
    borderRadius: dp(16),
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: dp(30)
  }

})
