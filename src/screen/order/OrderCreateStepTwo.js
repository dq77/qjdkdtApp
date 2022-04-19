import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, DeviceEventEmitter, Image
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { formatTime, toAmountStr, formValid, showToast, injectUnmount, convertCurrency } from '../../utils/Utility'
import { defaultUrl, baseUrl } from '../../utils/config'
import { vAmount } from '../../utils/reg'
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

@injectUnmount
class OrderCreateStepTwo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      stepOne: {},
      fundSource: '',
      productCode: '',
      supplierId: '',
      businessType: '',
      businessTypeName: '',
      brandName: '',
      supplierName: '',
      productName: '',
      orderName: '',
      address: '',
      areaCode: '',
      cityCode: '',
      name: '',
      phone: '',
      provinceCode: '',
      showAddress: '',
      allSum: 0,
      allSumStr: '0.00',
      chineseAmount: '零圆整',
      receiveModal: false,
      loadReceiveInfo: false,
      imageData: [],
      orderProductFiles: [],
      currentImage: '',
      modalVisible: false,
      orderProducts: [],
      goodsModal: false,
      loadGoodsInfo: false,
      currentGoodsIndex: ''
    }
    this.disabled = this.disabled.bind(this)
    this.getDefaultReceiveInfo = this.getDefaultReceiveInfo.bind(this)
    this.showReceiveModal = this.showReceiveModal.bind(this)
    this.pickSingleWithCamera = this.pickSingleWithCamera.bind(this)
    this.pickSingle = this.pickSingle.bind(this)
    this.showPhoto = this.showPhoto.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.createOrder = this.createOrder.bind(this)
    this.addGoods = this.addGoods.bind(this)
    this.deleteGoods = this.deleteGoods.bind(this)
    this.count = this.count.bind(this)
    this.commit = this.commit.bind(this)
    this.save = this.save.bind(this)
    this.clearData = this.clearData.bind(this)
    this.showProductDetail = this.showProductDetail.bind(this)
  }

  componentDidMount () {
    this.init()
  }

  init () {
    const tmpOrderInfo = this.props.navigation.state.params.tmpOrderInfo
    if (tmpOrderInfo) {
      this.setState({
        ...JSON.parse(tmpOrderInfo),
        ...this.props.navigation.state.params
      })
    } else {
      this.setState({
        ...this.state,
        ...this.props.navigation.state.params
      })
      this.getDefaultReceiveInfo()
    }
    this.setState({
      initData: this.state
    })
  }

  showProductDetail () {
    global.alert.show({
      title: '产品要素',
      content: this.state.stepOne.productDetailContent
    })
  }

  clearData () {
    this.init()
    this.forceUpdate()
    global.alert.show({
      content: '已清空，请重新填写'
    })
  }

  async getDefaultReceiveInfo (supplierId, supplierName, receiptWay) {
    const res = await ajaxStore.order.getDefaultReceiveInfo()
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        ...data,
        showAddress: data.provinceCode && data.cityCode ? getRegionTextArr(data.provinceCode, data.cityCode, data.areaCode) : '',
        loadReceiveInfo: true
      })
    }
  }

  showReceiveModal = () => {
    this.setState({ receiveModal: true })
  }

  hideReceiveModal = () => {
    this.setState({ receiveModal: false })
  }

  hideGoodsModal = async () => {
    await this.setState({
      goodsModal: false
    })
    this.setState({
      loadGoodsInfo: false
    })
  }

  async save () {
    const vRes = this.validateComplete()
    if (vRes) {
      await AuthUtil.saveTempOrderInfo(JSON.stringify(this.state))
      showToast('保存成功')
    }
  }

  validateComplete () {
    if (this.state.orderProducts.length === 0 && this.state.orderProductFiles.lenght === 0) {
      global.alert.show({
        content: '您还未添加货物'
      })
      return false
    }
    // if (!this.state.name) {
    //   global.alert.show({
    //     content: '您还未添加收货人'
    //   })
    //   return false
    // }
    // if (!this.state.phone) {
    //   global.alert.show({
    //     content: '您还未添加收货人手机号码'
    //   })
    //   return false
    // }
    // if (!this.state.provinceCode) {
    //   global.alert.show({
    //     content: '您还未添加收货地址'
    //   })
    //   return false
    // }
    // if (!this.state.address) {
    //   global.alert.show({
    //     content: '您还未添加收货详细地址'
    //   })
    //   return false
    // }
    return true
  }

  disabled () {
    let result = true
    switch (this.state.businessType) {
      case '1':
      case '3':
      case '2':
        result = this.state.orderProductFiles.length === 0 || false
        break
      default:
        result = this.state.orderProducts.length === 0 || false
        break
    }
    return result
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
      maxFiles: 9,
      mediaType,
      includeExif: true
    }).then(async image => {
      console.log('received image', image)
      const max = 9 - this.state.orderProductFiles.length
      if (max < image.length) {
        image.splice(max, image.length - max)
        global.alert.show({
          content: '最多支持上传9张订单附件'
        })
      }
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

  async uploadOrderFile (path) {
    const data = {
      fileName: {
        uri: path,
        type: 'multipart/form-data',
        name: getFileName(path)
      }
    }
    global.loading.show('上传中')
    // const res = await ajaxStore.order.batchUpload(data)
    const res = await ajaxStore.credit.uploadAuthFile(data)
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      this.setState({
        imageData: this.state.imageData.concat([res.data.data.key]),
        orderProductFiles: this.state.orderProductFiles.concat([res.data.data.fileKey])
      })
    } else {
      // this.getLipNumber()
      global.alert.show({
        content: res.data.message
      })
    }
  }

  showPhoto (isShow, key) {
    this.setState({
      modalVisible: !!isShow,
      currentImage: key || key === 0 ? key : ''
    })
  }

  deletePhoto (index) {
    let localFiles = []
    let allPathFiles = []
    let imageData = this.state.imageData
    let orderProductFiles = this.state.orderProductFiles
    localFiles = localFiles.concat(imageData)
    allPathFiles = allPathFiles.concat(orderProductFiles)
    localFiles.splice(index, 1)
    allPathFiles.splice(index, 1)
    imageData = localFiles
    orderProductFiles = allPathFiles
    this.setState({
      imageData,
      orderProductFiles
    })
  }

  async commit () {
    const { fundSource, businessType } = this.state
    const vRes = this.validateComplete()
    if (vRes) {
      // 判断开票信息是否完整
      // 目前直营采三方资金（宜宾）不校验开票信息 其他都要判断
      // if (businessType === '4' || (businessType === '1' && fundSource === '0')) {
      if (!(businessType === '1' && fundSource !== '0')) {
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
      }

      if (fundSource === '1' || fundSource === '2' || fundSource === '4') {
        this.save()
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
        let requestData
        switch (businessType) {
          case '4':
            requestData = this.getWkaRequestData()
            break
          case '1':
            requestData = this.getRequestData()
            break
          default:
            break
        }
        this.props.navigation.navigate('FourElements', {
          from: 'orderCreate',
          businessType,
          requestData
        })
      } else {
        switch (businessType) {
          case '4':
            this.createWkaOrder()
            break
          case '1':
          case '3':
          case '2':
            this.createOrder()
            break
          default:
            break
        }
      }
    }
  }

  getRequestData () {
    return {
      supplierId: this.state.supplierId,
      orderType: 0,
      receiptPerson: this.state.name,
      receiptPhone: this.state.phone,
      provinceCode: this.state.provinceCode,
      cityCode: this.state.cityCode,
      areaCode: this.state.areaCode,
      address: this.state.address,
      productCode: this.state.productCode,
      orderProducts: this.state.orderProducts,
      orderProductFiles: this.state.orderProductFiles.join(','),
      typeStatus: this.state.businessType,
      orderWay: 1,
      ofsCompanyId: this.props.ofsCompanyId
    }
  }

  getWkaRequestData () {
    const { productCode, orderName, name, phone, address, provinceCode, cityCode, areaCode, supplierId, orderProducts } = this.state
    return {
      productCode,
      orderName,
      receiptPerson: name,
      receiptPhone: phone,
      receiptAddress: address,
      provinceCode,
      cityCode,
      areaCode,
      dealerCode: supplierId,
      remark: '',
      items: orderProducts
    }
  }

  async createWkaOrder () {
    const res = await ajaxStore.order.createWkaOrder(this.getWkaRequestData())
    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'OrderCreateStepTwo', '/ofs/front/wkaOrder/createWkaOrder', { orderNo: res.data.data })
      await AuthUtil.removeTempOrderInfo()

      global.alert.show({
        content: '提交订单成功',
        callback: () => {
          DeviceEventEmitter.emit('orderListRefresh', {
            businessType: this.state.businessType
          })
          this.props.navigation.navigate('Order', { businessType: this.state.businessType })
        }
      })
    }
  }

  async createOrder () {
    const res = await ajaxStore.order.createOrder(this.getRequestData())
    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'OrderCreateStepTwo', '/ofs/front/order/createRetailOrder', { orderNo: res.data.data })
      await AuthUtil.removeTempOrderInfo()
      global.alert.show({
        content: '提交订单成功',
        callback: () => {
          DeviceEventEmitter.emit('orderListRefresh', {
            businessType: this.state.businessType
          })
          this.props.navigation.navigate('Order', { businessType: this.state.businessType })
        }
      })
    }
  }

  async addGoods (index) {
    await this.setState({
      currentGoodsIndex: (index || index === 0) ? index : '',
      loadGoodsInfo: true
    })
    this.setState({
      goodsModal: true
    })
  }

  async deleteGoods (index) {
    console.log(index, 'index')
    let orderProducts = []
    const goodsInfo = this.state.orderProducts
    orderProducts = orderProducts.concat(goodsInfo)
    orderProducts.splice(index, 1)
    await this.setState({
      orderProducts
    })
    this.count()
  }

  count () {
    let allSum = 0
    this.state.orderProducts.map((product, index) => {
      allSum += product.totalCost
    })
    this.setState({
      allSum
    })
  }

  render () {
    const { navigation, companyInfo } = this.props
    const { businessType, businessTypeName, brandName, supplierName, productName, orderName, name, phone, address, showAddress, chineseAmount, imageData, orderProducts, currentGoodsIndex, allSum } = this.state
    const currentGoods = (currentGoodsIndex || currentGoodsIndex === 0) ? orderProducts[currentGoodsIndex] : {
      name: '',
      spec: '',
      amount: '',
      price: '',
      totalCost: 0
    }
    return (
      <View style={styles.container}>
        <NavBar title={'第二部：创建订单'} navigation={navigation} />
        <ScrollView>
          <View style={styles.blockMain}>
            <Text style={styles.blockTitle}>{'已选产品信息'}</Text>
            <Iconfont onPress={() => { navigation.goBack() }} style={styles.editIcon} name={'btn_edit'} size={dp(40)} />
            <View style={styles.blockItem}>
              <Text style={styles.blockText}>{`业务类型：${businessTypeName}`}</Text>
              <Text style={styles.blockText}>{`品类品牌：${brandName}`}</Text>
              <Text style={styles.blockText}>{`销售方：${supplierName}`}</Text>
              <Text style={styles.blockText}>{'产品名称：'}<Text onPress={this.showProductDetail} style={styles.highLightText}>{productName}</Text></Text>
            </View>
          </View>
          <View style={styles.blockMain}>
            <Text style={styles.blockTitle}>{'收货信息'}</Text>
            <Iconfont onPress={this.showReceiveModal} style={styles.editIcon} name={'btn_edit'} size={dp(40)} />
            { name && phone && address ? (
              <View style={styles.blockItem}>
                <View style={styles.contractPerson}>
                  <Text style={styles.blockText}>{name}</Text>
                  <Text style={[styles.blockText, styles.phoneItem]}>{phone}</Text>
                </View>
                <Text style={styles.blockText}>{showAddress}</Text>
                <Text style={styles.blockText}>{address}</Text>
              </View>
            ) : (null)}
          </View>
          <View style={styles.blockMain}>
            <Text style={styles.blockTitle}>{'货物信息'}</Text>
            { this.state.businessType === '4' ? (
              <View style={styles.goodsMain}>
                <View style={styles.tableTitle}>
                  <Text style={styles.tableTitleText}>数量</Text>
                  <Text style={styles.tableTitleText}>单价</Text>
                  <Text style={styles.tableTitleText}>小计</Text>
                </View>
                { orderProducts.map((item, key) => {
                  return (
                    <View style={styles.tableContent} key={key}>
                      <Swipeout
                        autoClose={true}
                        right={[
                          {
                            text: '编辑',
                            backgroundColor: '#1A97F6',
                            onPress: () => {
                              this.addGoods(key)
                            }
                          },
                          {
                            text: '删除',
                            backgroundColor: '#F55849',
                            onPress: () => {
                              this.deleteGoods(key)
                            }
                          }
                        ]}>
                        <View style={styles.goodsDetail}>
                          {/* <Iconfont style={styles.editGoodsIcon} name={'btn_edit'} size={dp(40)} /> */}
                          <Text style={styles.goodsTitle}>{item.name}</Text>
                          <Text style={styles.model}>{`型号：${item.spec}`}</Text>
                        </View>
                        <View style={styles.tableItem}>
                          <Text style={styles.tableItemText}>{item.amount}</Text>
                          <Text style={styles.tableItemText}>{toAmountStr(item.price, 2, true)}</Text>
                          <Text style={styles.tableItemText}>{toAmountStr(item.totalCost, 2, true)}</Text>
                        </View>
                      </Swipeout>
                      <DashLine backgroundColor={Color.SPLIT_LINE} len={50} />
                    </View>
                  )
                })}
                <View style={styles.goodsBottom}>
                  <View style={styles.addGoodsBtn}>
                    <Text onPress={() => { this.addGoods() }} style={styles.addGoodsBtnText}>添加货物</Text>
                  </View>
                  <Text>{`合计：${toAmountStr(allSum, 2, true)}`}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.blockItem}>
                {/* <View style={styles.formItem}>
                  <View style={styles.formItemAmount}>
                    <Text style={styles.name}>订单总金额（元）</Text>
                    <Text style={styles.amount}>{chineseAmount}</Text>
                  </View>
                  <TextInput
                    placeholder={'请输入订单名称'}
                    placeholderTextColor={'#D8DDE2'}
                    keyboardType={'numeric'}
                    style={styles.input}
                    value={this.state.allSumStr}
                    onChangeText={text => {
                      this.setState({
                        allSum: parseFloat(text.replace(/,/g, '')),
                        allSumStr: text,
                        chineseAmount: convertCurrency(text.replace(/,/g, ''))
                      })
                    }}
                    onFocus={() => {
                      this.setState({
                        allSumStr: this.state.allSumStr.replace(/,/g, '')
                      })
                    }}
                    onBlur={() => {
                      if (vAmount.test(this.state.allSumStr)) {
                        this.setState({
                          allSumStr: toAmountStr(this.state.allSumStr, 2, true)
                        })
                      }
                    }}
                  />
                </View> */}
                <View style={styles.formItem}>
                  <View style={styles.blockItem}>
                    <Text style={styles.name}>上传订单附件</Text>
                    {/* <Text style={styles.highLightText}>{'点击预览示范'}</Text> */}
                  </View>
                  <View style={styles.uploadMain}>
                    { imageData.map((item, key) => {
                      return (
                        <View style={styles.imageWapper} key={key}>
                          <Touchable onPress={() => { this.showPhoto(true, key) }}>
                            <Image style={styles.fileImage} source={{ uri: `${baseUrl}/ofs/weixin/project/loadFile?buzKey=${item}` }} />
                          </Touchable>
                          <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(key)}>
                            <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                          </Touchable>
                        </View>
                      )
                    })
                    }
                    { this.state.orderProductFiles.length < 9 &&
                      <Touchable onPress={() => {
                        this.ActionSheet.show()
                      }}>
                        <View style={styles.uploadBtn}>
                          <Text style={styles.uploadIcon}>+</Text>
                        </View>
                      </Touchable>
                    }
                  </View>
                </View>
              </View>
            )}
          </View>
          {/* {businessType === '4' ? ( */}
          <View style={styles.footer}>
            <View style={styles.footerBtn}>
              <StrokeBtn onPress={this.save} style={styles.save} text={'保存'} />
              <SolidBtn disabled={this.disabled()} onPress={this.commit} style={styles.save} text={'提交订单'} />
            </View>
          </View>
          {/* ) : (
            <View style={styles.footer}>
              <SolidBtn disabled={this.disabled()} onPress={this.commit} style={styles.next} text={'创建订单'} />
            </View>
          )} */}
        </ScrollView>
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
        { this.state.imageData.length && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={this.state.imageData}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}
        { this.state.loadReceiveInfo ? (
          <ReceiveInfoEdit
            ref={child => this.receiveInfo = child}
            name={this.state.name}
            phone={this.state.phone}
            provinceCode={this.state.provinceCode}
            cityCode={this.state.cityCode}
            areaCode={this.state.areaCode}
            address={this.state.address}
            cancel = {() => {
              this.hideReceiveModal()
            }}
            confirm = {async (data) => {
              this.setState({
                name: data.name,
                phone: data.phone,
                provinceCode: data.provinceCode,
                cityCode: data.cityCode,
                areaCode: data.areaCode,
                address: data.address,
                showAddress: data.showAddress
              })
            }}
            infoModal={this.state.receiveModal} />
        ) : (
          null
        )}
        { this.state.loadGoodsInfo &&
          <GoodsInfoEdit
            ref={child => this.goodsInfo = child}
            name={currentGoods.name}
            spec={currentGoods.spec}
            amount={currentGoods.amount}
            price={currentGoods.price}
            totalCost={currentGoods.totalCost}
            cancel = {() => {
              this.hideGoodsModal()
            }}
            confirm = {async (data) => {
              const orderProducts = this.state.orderProducts
              const index = (currentGoodsIndex || currentGoodsIndex === 0) ? currentGoodsIndex : orderProducts.length
              orderProducts[index] = {
                name: data.name,
                spec: data.spec,
                amount: data.amount,
                price: data.price,
                totalCost: data.totalCost
              }
              await this.setState({
                orderProducts
              })
              this.count()
            }}
            infoModal={this.state.goodsModal} />
        }
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

export default connect(mapStateToProps)(OrderCreateStepTwo)

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
    position: 'relative'
  },
  blockTitle: {
    fontSize: dp(32),
    marginBottom: dp(28)
  },
  blockText: {
    color: '#91969A',
    fontSize: dp(28),
    lineHeight: dp(50)
  },
  highLightText: {
    color: '#1A97F6'
  },
  footer: {
    marginTop: dp(96),
    paddingBottom: dp(100)
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  uploadMain: {
    marginTop: dp(40)
  },
  next: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    width: dp(690)
  },
  save: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    width: dp(330)
  },
  cancelText: {
    color: '#464678',
    fontSize: dp(30),
    textAlign: 'center',
    marginVertical: dp(120)
  },
  editIcon: {
    position: 'absolute',
    right: dp(32),
    top: dp(32)
  },
  editGoodsIcon: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  contractPerson: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  phoneItem: {
    marginLeft: dp(10)
  },
  name: {

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
  formItemAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(24)
  },
  amount: {
    color: '#91969A',
    fontSize: dp(28)
  },
  formItem: {
    marginBottom: dp(48)
  },
  uploadBtn: {
    backgroundColor: '#DDDDE8',
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(68)
  },
  fileImage: {
    flex: 1,
    width: dp(630),
    height: dp(300),
    marginBottom: dp(30),
    borderRadius: dp(16)
  },
  uploadIcon: {
    color: '#fff',
    fontSize: dp(120)
  },
  imageWapper: {
    position: 'relative'
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: -dp(25),
    top: -dp(25)
  },
  tableTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FA',
    padding: dp(10),
    marginBottom: dp(30)
  },
  tableTitleText: {
    color: '#91969A',
    fontSize: dp(28)
  },
  tableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: dp(10)
  },
  tableItemText: {
    lineHeight: dp(100)
  },
  tableContent: {
    paddingBottom: dp(35)
  },
  goodsDetail: {
    backgroundColor: '#fff',
    paddingHorizontal: dp(10),
    position: 'relative'
  },
  goodsTitle: {
    lineHeight: dp(50)
  },
  model: {
    color: '#91969A',
    lineHeight: dp(50)
  },
  goodsBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: dp(25)
  },
  addGoodsBtn: {
    width: dp(156),
    height: dp(64),
    backgroundColor: '#464678',
    borderRadius: dp(32)
  },
  addGoodsBtnText: {
    fontSize: dp(24),
    color: '#fff',
    textAlign: 'center',
    lineHeight: dp(64)
  }
})
