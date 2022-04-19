import React, { PureComponent } from 'react'
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import CheckBox from 'react-native-check-box'
import { ScrollView } from 'react-native-gesture-handler'
import Picker from 'react-native-picker'
import { SolidBtn } from '../../component/CommonButton'
import FormItemComponent from '../../component/FormItemComponent'
import NavBar from '../../component/NavBar'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent } from '../../utils/AnalyticsUtil'
import Color from '../../utils/Color'
import { vChineseName, vEmail, vPhone } from '../../utils/reg'
import { getRealDP as dp } from '../../utils/screenUtil'
import { isEmpty } from '../../utils/StringUtils'
import { formValid, toAmountStr } from '../../utils/Utility'
import GoodsListComponent from './component/GoodsListComponent'

export default class ApplyInvoice extends PureComponent {
  constructor(props) {
    super(props)
    this.rule = [
      { id: 'invoiceAddress', required: true, name: '地址及电话号码' },
      { id: 'receiveContact', required: true, reg: vPhone, name: '收件人电话' },
      { id: 'bankAccount', required: true, name: '开户行及账号' },
      { id: 'receivePerson', required: true, reg: vChineseName, name: '收件人姓名' },
      { id: 'receiveEmail', required: false, reg: vEmail, name: '收件人邮箱' },
      { id: 'receiveAddress', required: true, name: '收件人地址' },
    ]
    this.state = {
      goodsList: [],
      rangeTaxNum: [],
      invoiceAmount: '', // 价格合计
      invoiceAmountStr: '', // 价格合计Str
      invoiceTitle: '', // 发票抬头
      taxpayerId: '', // 纳税人识别号
      typeLisit: [
        // { name: '增值税普通发票', invoiceType: '2' },
        { name: '增值税专用发票', invoiceType: '3' },
        { name: '电子发票', invoiceType: '1' },
      ],
      // provinceCode: '11', // 默认值
      // cityCode: '110101', // 默认值
      // areaCode: '',
      invoiceAddress: '', // 地址及电话号码
      // invoiceContact: '', // 电话号码
      // bankName: '', // 开户行
      // bankBranch: '', // 支行
      bankAccount: '', // 开户行及账号
      invoiceRemark: '', // 发票备注
      isConfirmReceive: true, // check选项
      typeIndex: 0, // 发票类型下标
      orderId: '',
      receiveAddress: '', // 收件人地址
      receiveContact: '', // 收件人号码
      receivePerson: '', // 收件人
      receiveEmail: '', // 收件人邮箱
      showShadow: false,
      edit_invoiceTitle: true,
      edit_taxpayerId: true,
      edit_invoiceAddress: true,
      edit_bankAccount: true,
    }
  }

  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    const { orderId } = this.props.navigation.state.params
    const res = await ajaxStore.order.defaultApplyInfo({ orderId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      await this.setState({
        orderId,
        companyId: data.companyId,
        companyName: data.companyName,
        orderCode: data.orderCode,
        orderName: data.orderName,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        taxpayerId: data.taxpayerId,
        invoiceAmount: data.invoiceAmount,
        invoiceTitle: data.invoiceTitle,
        invoiceAmountStr: '￥' + toAmountStr(data.invoiceAmount, 2, true),
        bankAccount: data.bankAccount,
        invoiceAddress: data.invoiceAddress,
        receiveAddress: data.receiveAddress,
        receiveContact: data.receiveContact,
        receivePerson: data.receivePerson,
        receiveEmail: data.receiveEmail,
        edit_invoiceTitle: isEmpty(data.invoiceTitle) || data.invoiceTitle === '.',
        edit_taxpayerId: isEmpty(data.invoiceTitle) || data.taxpayerId === '.',
        edit_invoiceAddress: isEmpty(data.invoiceTitle) || data.invoiceAddress === '.',
        edit_bankAccount: isEmpty(data.invoiceTitle) || data.bankAccount === '.',
      })
      this.getTaxNum()
    }
  }

  async getTaxNum() {
    const data = {
      supplierId: this.state.supplierId,
      type: '2',
    }
    const res = await ajaxStore.order.querySupplierCode(data)
    if (res.data && res.data.code === '0' && res.data.data.length > 0) {
      this.setState({ rangeTaxNum: res.data.data })
      this.getGoodsInfo()
    }

    // const res = JSON.parse('{"code":"0","data":[{"detailAmount":"","detailNo":"","gmtCreated":"2020-02-19","gmtModified":"2020-02-19","goodsName":"光学检测仪器及设备","goodsNum":"","hsdj":22,"hsje":0,"id":557,"invoiceCode":"","isDeleted":"0","num":"","operator":"鲁文俊","origin":"1","spbm":"109061601","specificationModel":"222","status":"1","supplierId":"201909120100010004LKZF0000000001","supplierName":"","taxAmount":"","taxCodeName":"光电测量仪器","taxRate":"13","type":"2","unit":"","unitPrice":"19.00"},{"detailAmount":"","detailNo":"","gmtCreated":"2020-02-19","gmtModified":"2020-02-19","goodsName":"纺织专用测试仪器","goodsNum":"","hsdj":11,"hsje":0,"id":556,"invoiceCode":"","isDeleted":"0","num":"","operator":"鲁文俊","origin":"1","spbm":"109061701","specificationModel":"111","status":"1","supplierId":"201909120100010004LKZF0000000001","supplierName":"","taxAmount":"","taxCodeName":"纺织仪器","taxRate":"13","type":"2","unit":"","unitPrice":"10.00"}],"message":"成功"}')
    // this.setState({ rangeTaxNum: res.data })
    // this.getGoodsInfo()
  }

  async getGoodsInfo() {
    const data = {
      orderCode: this.state.orderCode,
      supplierId: this.state.supplierId,
    }
    const res = await ajaxStore.order.itemInfo(data)
    if (res.data && res.data.code === '0' && res.data.data.length > 0) {
      this.setState({ goodsList: res.data.data })
    }

    // const res = JSON.parse('{"code":"0","data":[{"amount":1.00000000,"goodsTaxNo":"109061701","id":1159,"name":"1","price":111.00000000,"spec":"11","totalCost":111.0000},{"amount":2.00000000,"goodsTaxNo":"","id":1160,"name":"美的线控器","price":222.00000000,"spec":"we44","totalCost":444.0000},{"amount":3.00000000,"goodsTaxNo":"","id":1161,"name":"室外机（VRV)","price":333.00000000,"spec":"16平方","totalCost":999.0000}],"message":"成功"}    ')
    // this.setState({ goodsList: res.data })
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  showPicker = () => {
    const array = this.state.typeLisit.map((item, index) => {
      return item.name
    })
    Keyboard.dismiss()
    Picker.init({
      pickerData: array,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择发票类型',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.typeLisit[this.state.typeIndex].name],
      onPickerConfirm: (data, pickedIndex) => {
        this.hideShadow()
        this.setState({ typeIndex: pickedIndex })
        this.rule = this.rule.map((item, index) => {
          if (item.id === 'receiveEmail') {
            item.required = data[0] === '电子发票'
          }
          return item
        })
      },
      onPickerCancel: (data, pickedIndex) => {
        this.hideShadow()
      },
    })
    Picker.show()
    this.showShadow()
  }

  showTaxPicker = (goodsList, rangeTaxNum, index) => {
    const array = rangeTaxNum.map((item, index) => {
      return item.nameAndSpbm
    })
    const selectedValue = goodsList[index].valueTaxNum ? [rangeTaxNum[goodsList[index].valueTaxNum].nameAndSpbm] : []
    Keyboard.dismiss()
    Picker.init({
      pickerData: array,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择税收编码',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 16,
      pickerTextEllipsisLen: 20,
      selectedValue: selectedValue,
      onPickerConfirm: (data, pickedIndex) => {
        this.hideShadow()
        const goodslist = this.state.goodsList
        goodslist[index].goodsTaxNo = rangeTaxNum[pickedIndex].spbm
        goodslist[index].sl = rangeTaxNum[pickedIndex].taxRate
        this.setState({ goodsList })
        this.forceUpdate()
      },
      onPickerCancel: (data, pickedIndex) => {
        this.hideShadow()
      },
    })
    Picker.show()
    this.showShadow()
  }

  // showRegionDialog = () => {
  //   RegionPickerUtil
  //     .init()
  //     .setOnOpen(this.showShadow)
  //     .setOnClose(this.hideShadow)
  //     .setConfirm((data) => {
  //       this.setState({
  //         provinceCode: data.provinceCode,
  //         cityCode: data.cityCode,
  //         areaCode: data.areaCode || ''
  //       })
  //     })
  //     .show(getRegionTextArr(this.state.provinceCode, this.state.cityCode, this.state.areaCode))
  // }

  disable = () => {
    const { invoiceAmount, invoiceTitle, invoiceAddress, taxpayerId, bankAccount, isConfirmReceive } = this.state
    return !(invoiceAmount && invoiceTitle && invoiceAddress && taxpayerId && bankAccount && isConfirmReceive)
  }

  commit = async () => {
    const {
      goodsList,
      invoiceAddress,
      bankAccount,
      invoiceAmount,
      invoiceTitle,
      invoiceRemark,
      isConfirmReceive,
      typeLisit,
      typeIndex,
      orderId,
      companyId,
      companyName,
      orderCode,
      orderName,
      supplierId,
      supplierName,
      taxpayerId,
      receivePerson,
      receiveAddress,
      receiveEmail,
      receiveContact,
    } = this.state
    const valid = formValid(this.rule, this.state)

    if (valid.result) {
      if (goodsList.length === 0) {
        global.alert.show({ content: '货物明细为空，无法开票' })
        return
      }
      if (goodsList.filter((item) => !item.goodsTaxNo).length !== 0) {
        global.alert.show({ content: '请选择每条货物的税收编码' })
        return
      }
      const data = {
        bankAccount, // 开户行、账号
        // bankBranch,
        // bankName,
        taxpayerId,
        invoiceAddress, // 地址和电话
        // invoiceContact,
        invoiceAmount,
        invoiceRemark,
        invoiceTitle,
        invoiceType: typeLisit[typeIndex].invoiceType,
        isConfirmReceive: isConfirmReceive ? '1' : '0',
        companyId,
        companyName,
        orderCode,
        orderId,
        orderName,
        supplierId,
        supplierName,
        receiveEmail,
        receiveAddress, // 收件人地址
        // receiveArea: areaCode,
        // receiveCity: cityCode,
        // receiveProvince: provinceCode,
        receivePerson,
        receiveContact,
        itemInfo: goodsList,
      }
      // console.log(data)
      const res = await ajaxStore.order.invoiceApply(data)
      if (res.data && res.data.code === '0') {
        onEvent('提交开票', 'ApplyInvoice', '/ofs/front/invoiceApply/apply', {
          applyId: res.data.data,
        })
        // showToast('提交成功')
        // setTimeout(() => {
        //   this.props.navigation.goBack()
        // }, 1000)
        await global.loading.showSuccess('提交成功', () => {
          this.props.navigation.goBack()
        })
      }
    } else {
      global.alert.show({
        content: valid.msg,
      })
    }
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'申请开票'} navigation={navigation} />
        <ScrollView>
          <View>
            {/* 发票信息 */}
            <Text style={styles.title}>发票信息</Text>
            {/* 价格合计 */}
            <FormItemComponent title={'价格合计'} value={this.state.invoiceAmountStr} editable={false} />
            <View style={styles.splitLine} />
            {/* 发票抬头 */}
            <FormItemComponent
              title={'发票抬头'}
              value={this.state.invoiceTitle}
              editable={this.state.edit_invoiceTitle}
            />
            <View style={styles.splitLine} />
            {/* 纳税人识别号 */}
            <FormItemComponent
              title={'纳税人识别号'}
              value={this.state.taxpayerId}
              editable={this.state.edit_taxpayerId}
            />
            <View style={styles.splitLine} />
            {/* 发票类型 */}
            <FormItemComponent
              title={'发票类型'}
              placeholder={''}
              editable={false}
              showArrow={true}
              value={this.state.typeLisit[this.state.typeIndex] ? this.state.typeLisit[this.state.typeIndex].name : ''}
              onPress={() => {
                this.showPicker()
              }}
            />
            <View style={styles.splitLine} />
            {/* 地址及电话号码 */}
            <FormItemComponent
              title={'地址、电话'}
              placeholder={'请输入地址及电话'}
              value={this.state.invoiceAddress}
              onChangeText={(text) => {
                this.setState({ invoiceAddress: text })
              }}
              editable={this.state.edit_invoiceAddress}
            />
            <View style={styles.splitLine} />
            {/* 开户行及账号 */}
            <FormItemComponent
              title={'开户行及账号'}
              placeholder={'请输入开户行及账号'}
              value={this.state.bankAccount}
              onChangeText={(text) => {
                this.setState({ bankAccount: text })
              }}
              editable={this.state.edit_bankAccount}
            />
            <View style={styles.splitLine} />
            {/* 发票备注 */}
            <FormItemComponent
              title={'发票备注'}
              placeholder={'请输入备注信息'}
              value={this.state.invoiceRemark}
              onChangeText={(text) => {
                this.setState({ invoiceRemark: text })
              }}
            />
            {/* 收件人信息 */}
            <Text style={styles.title}>收件人信息</Text>
            {/* 收件人姓名 */}
            <FormItemComponent
              title={'收件人姓名'}
              placeholder={'请输入收件人姓名'}
              value={this.state.receivePerson}
              onChangeText={(text) => {
                this.setState({ receivePerson: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件人电话 */}
            <FormItemComponent
              title={'收件人电话'}
              placeholder={'请输入收件人电话'}
              maxLength={11}
              keyboardType={'numeric'}
              value={this.state.receiveContact}
              onChangeText={(text) => {
                this.setState({ receiveContact: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件人邮箱 */}
            <FormItemComponent
              title={'收件人邮箱'}
              placeholder={'请输入收件人邮箱'}
              value={this.state.receiveEmail}
              onChangeText={(text) => {
                this.setState({ receiveEmail: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件地址 */}
            <FormItemComponent
              title={'收件地址'}
              placeholder={'请输入收件地址'}
              value={this.state.receiveAddress}
              onChangeText={(text) => {
                this.setState({ receiveAddress: text })
              }}
            />
            {/* 货物列表 */}
            <Text style={styles.title}>货物列表</Text>
            <GoodsListComponent
              style={{ marginTop: dp(30) }}
              goodsList={this.state.goodsList}
              fromInvoiceApply={true}
              rangeTaxNum={this.state.rangeTaxNum}
              selectTax={this.showTaxPicker}
            />

            <View style={styles.checkbox}>
              <CheckBox
                checkBoxColor={'Color.TEXT_LIGHT'}
                uncheckedCheckBoxColor={Color.TEXT_LIGHT}
                checkedCheckBoxColor={'#00b2a9'}
                onClick={() => {
                  this.setState({
                    isConfirmReceive: !this.state.isConfirmReceive,
                  })
                }}
                isChecked={this.state.isConfirmReceive}
                checkedImage={
                  <Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
                }
                unCheckedImage={
                  <Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
                }
                rightText={'我确认已收到该订单下所有货物'}
                rightTextStyle={{ color: Color.TEXT_MAIN, fontSize: dp(27) }}
              />
              <Text style={styles.hint}>注意：25日前申请的发票，当月开具；26日起申请的发票，次月开具。</Text>
              <SolidBtn onPress={this.commit} disabled={this.disable()} text={'提交申请'} />
            </View>
          </View>
        </ScrollView>
        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20),
    backgroundColor: '#EFEFF4',
  },
  splitLine: {
    height: 1,
    marginLeft: dp(30),
    backgroundColor: '#f0f0f0',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  checkbox: {
    padding: dp(30),
    backgroundColor: '#EFEFF4',
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5),
  },
  hint: {
    fontSize: dp(23),
    color: '#a0a0a0',
    marginTop: dp(35),
    marginBottom: dp(50),
  },
})
