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
import CheckBox from 'react-native-check-box'

@injectUnmount
class ProjectOrderCreateStepTwo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      stepOne: {},
      supplierId: '',
      projectId: '',
      imageData: [],
      orderProductFiles: [],
      form: {
        receiptPerson: '', // 收货人
        receiptPhone: '', // 收货人电话号码
        address: '', // 收货人地址
        provinceCode: '',
        cityCode: '',
        areaCode: ''
      },
      showAddress: '',
      receiveModal: false,
      loadReceiveInfo: false,
      payChecked: true,
      payChecked2: true,
      isBack: false
    }
  }

  componentDidMount () {
    const { supplierId, projectId, tmpOrderInfo } = this.props.navigation.state.params

    if (tmpOrderInfo) {
      this.setState({
        ...JSON.parse(tmpOrderInfo),
        ...this.props.navigation.state.params
      })
    } else {
      this.setState({
        // supplierId,
        // projectId
        ...this.props.navigation.state.params
      })
    }

    this.loadData(projectId)
  }

  loadData = async (projectId) => {
    const res = await ajaxStore.order.defaultReceiverInfo({ projectId })
    if (res.data && res.data.code === '0') {
      const info = res.data.data
      this.setState({
        form: {
          receiptPerson: info.receiptPerson, // 收货人
          receiptPhone: info.receiptPhone, // 收货人电话号码
          address: info.address, // 收货人地址
          provinceCode: info.provinceCode,
          cityCode: info.cityCode,
          areaCode: info.areaCode
        },
        showAddress: info.provinceCode && info.cityCode ? getRegionTextArr(info.provinceCode, info.cityCode, info.areaCode) : '',
        loadReceiveInfo: true
      })
    }
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
    const res = await ajaxStore.order.batchUpload(data)
    // const res = await ajaxStore.credit.uploadAuthFile(data)
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const file = res.data.data
      const pathArr = file[0].fileKey.split('/')
      this.setState({
        imageData: this.state.imageData.concat([pathArr[0]]),
        orderProductFiles: this.state.orderProductFiles.concat([pathArr[1]])
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  save = async () => {
    if (this.state.orderProductFiles.length === 0) {
      global.alert.show({
        content: '您还未上传订单附件'
      })
    } else {
      await AuthUtil.saveTempOrderInfo(JSON.stringify(this.state))
      showToast('保存成功')
    }
  }

  commit = async () => {
    if (!this.state.form.receiptPerson) {
      global.alert.show({
        content: '您还未添加收货人'
      })
      return false
    }
    if (!this.state.form.receiptPhone) {
      global.alert.show({
        content: '您还未添加收货人手机号码'
      })
      return false
    }

    // 判断开票信息是否完整
    // 目前直营采三方资金（宜宾）不校验开票信息 其他都要判断
    global.showError = false
    const res2 = await ajaxStore.order.checkInvoiceInfo({ companyId: this.props.ofsCompanyId })
    global.showError = true
    if (!(res2.data && res2.data.code === '0' && res2.data.data)) {
      global.alert.show({
        title: '完善开票信息',
        content: '开票信息还未补充完整，点击确定前往补充',
        callback: () => { this.props.navigation.navigate('InvoiceInfo') }
      })
      return
    }

    const orderProductFiles = []
    this.state.imageData.forEach((item, index) => {
      orderProductFiles.push(item + '/' + this.state.orderProductFiles[index])
    })

    const data = {
      projectId: this.state.projectId,
      supplierId: this.state.supplierId,
      orderType: 0,
      receiptPerson: this.state.form.receiptPerson,
      receiptPhone: this.state.form.receiptPhone,
      // provinceCode: this.state.form.provinceCode,
      // cityCode: this.state.form.cityCode,
      // areaCode: this.state.form.areaCode,
      // address: this.state.form.address,
      orderProductFiles: orderProductFiles.join(','),
      typeStatus: 0,
      orderWay: 1,
      ofsCompanyId: this.props.ofsCompanyId
    }
    const res = await ajaxStore.order.createProjectOrder(data)

    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'ProjectOrderCreateStepTwo', '/ofs/front/order/create', { orderNo: res.data.data.orderCode })
      await AuthUtil.removeTempOrderInfo()
      global.alert.show({
        content: '提交订单成功',
        callback: () => {
          DeviceEventEmitter.emit('orderListRefresh', {
            businessType: '0'
          })
          if (this.state.isBack) {
            this.props.navigation.goBack()
          } else {
            this.props.navigation.navigate('Order', { businessType: '0' })
          }
        }
      })
    }
  }

  disabled () {
    return this.state.orderProductFiles.length === 0 || !this.state.payChecked || !this.state.payChecked2
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

  showReceiveModal = () => {
    this.setState({ receiveModal: true })
  }

  hideReceiveModal = () => {
    this.setState({ receiveModal: false })
  }

  showPhoto (isShow, key) {
    this.setState({
      modalVisible: !!isShow,
      currentImage: key || key === 0 ? key : ''
    })
  }

  render () {
    const { navigation, companyInfo } = this.props
    const { form, showAddress, imageData, orderProducts, currentGoodsIndex } = this.state
    const { receiptPerson, receiptPhone, address, provinceCode, cityCode, areaCode } = form
    return (
      <View style={styles.container}>
        <NavBar title={'第二部：创建订单'} navigation={navigation} />
        <ScrollView>
          <Touchable onPress={this.showReceiveModal}>
            <View style={styles.blockMain} >
              <Text style={styles.blockTitle}>{'收货信息'}</Text>
              <Iconfont style={styles.editIcon} name={'btn_edit'} size={dp(40)} />
              {/* {receiptPerson && receiptPhone && address ? ( */}
              <View style={styles.blockItem}>
                <View style={styles.contractPerson}>
                  <Text style={styles.blockText}>{receiptPerson}</Text>
                  <Text style={[styles.blockText, styles.phoneItem]}>{receiptPhone}</Text>
                </View>
                <Text style={styles.blockText}>{showAddress}</Text>
                <Text style={styles.blockText}>{address}</Text>
              </View>
              {/* // ) : (null)} */}
            </View>
          </Touchable>
          <View style={styles.blockMain}>
            <Text style={styles.blockTitle}>{'货物信息'}</Text>
            <View style={styles.blockItem}>
              <View style={styles.formItem}>
                <View style={styles.blockItem}>
                  <Text style={styles.name}>上传订单附件</Text>
                </View>
                <View style={styles.uploadMain}>
                  {imageData.map((item, key) => {
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
                  {this.state.orderProductFiles.length < 9 &&
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
          </View>
          <CheckBox
            style={styles.checkbox}
            checkBoxColor={Color.TEXT_LIGHT}
            uncheckedCheckBoxColor={Color.TEXT_LIGHT}
            checkedCheckBoxColor={'#00b2a9'}
            onClick={() => {
              this.setState({
                payChecked2: !this.state.payChecked2
              })
            }}
            isChecked={this.state.payChecked2}
            checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
            unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
            rightText={'授权仟金顶代为自动签收盖章'}
            rightTextStyle={{ color: Color.TEXT_MAIN }}
          />
          <CheckBox
            style={styles.checkbox}
            checkBoxColor={Color.TEXT_LIGHT}
            uncheckedCheckBoxColor={Color.TEXT_LIGHT}
            checkedCheckBoxColor={'#00b2a9'}
            onClick={() => {
              this.setState({
                payChecked: !this.state.payChecked
              })
            }}
            isChecked={this.state.payChecked}
            checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
            unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
            rightText={'本订单申请使用货款赊销服务'}
            rightTextStyle={{ color: Color.TEXT_MAIN }}
          />
          <View style={styles.footer}>
            <View style={styles.footerBtn}>
              <StrokeBtn onPress={this.save} style={styles.save} text={'保存'} />
              <SolidBtn disabled={this.disabled()} onPress={this.commit} style={styles.save} text={'提交订单'} />
            </View>
          </View>

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
        {this.state.imageData.length && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={this.state.imageData}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}
        {this.state.loadReceiveInfo ? (
          <ReceiveInfoEdit
            // ref={child => this.receiveInfo = child}
            name={receiptPerson}
            phone={receiptPhone}
            provinceCode={provinceCode}
            cityCode={cityCode}
            areaCode={areaCode}
            address={address}
            cancel={() => {
              this.hideReceiveModal()
            }}
            confirm={async (data) => {
              this.setState({
                form: {
                  receiptPerson: data.name,
                  receiptPhone: data.phone,
                  provinceCode: data.provinceCode,
                  cityCode: data.cityCode,
                  areaCode: data.areaCode,
                  address: data.address
                },
                showAddress: data.showAddress
              })
            }}
            infoModal={this.state.receiveModal} />
        ) : (
          null
        )}
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

export default connect(mapStateToProps)(ProjectOrderCreateStepTwo)

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
  },
  checkbox: {
    marginHorizontal: dp(35),
    marginTop: dp(50)
  }
})
