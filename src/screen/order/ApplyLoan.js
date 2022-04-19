import React, { PureComponent } from 'react'
import { Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Picker from 'react-native-picker'
import { SolidBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent } from '../../utils/AnalyticsUtil'
import { vAmount, vPrice } from '../../utils/reg'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { addNum, delNum, formValid, toAmountStr } from '../../utils/Utility'

export default class ApplyLoan extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      orderId: '',
      supplierId: '',
      orderCode: '',
      projectId: '',
      orderAmount: '',
      loanAllowAmount: '',
      loanTypeName: ['请选择支付货款类型'],
      loanType: '1',
      loanTypeList: [],
      loanTypeIndex: 0,
      showShadow: false,
      loanRatio: '',
      loanAmount: '',
      loanAmountStr: '',
      skuItemData: [],
      showDetail: [],
      tableData: [],
      applyMoney: 0,
      fundSource: '',
      rule: [
        {
          id: 'loanAmount',
          required: true,
          reg: vAmount,
          name: '支付货款金额',
        },
      ],
    }
    this.showPayTypePicker = this.showPayTypePicker.bind(this)
    this.showDetail = this.showDetail.bind(this)
    this.countGoodsItems = this.countGoodsItems.bind(this)
    this.disabled = this.disabled.bind(this)
    this.applyLoan = this.applyLoan.bind(this)
    this.clearData = this.clearData.bind(this)
    this.countRatio = this.countRatio.bind(this)
    this.reCountRatio = this.reCountRatio.bind(this)
  }

  async componentDidMount() {
    const { orderId, supplierId, orderCode, projectId } = this.props.navigation.state.params
    await this.setState({
      orderId,
      supplierId,
      orderCode,
      projectId,
    })
    this.getSkuItem()
    this.getLoanTypes()
  }

  // 实时计算货款金额
  limitAmount(data) {
    let amount = 0
    data.map((tpl, key) => {
      if (data[key].orderProductInfoVOs && data[key].orderProductInfoVOs.length) {
        data[key].orderProductInfoVOs.forEach(function (item, index) {
          amount = addNum(amount, item.leftLoanAmount)
        })
      }
    })
    this.setState({
      loanAllowAmount: amount,
    })
    this.basicValidate(true)
  }

  basicValidate(isInit) {
    const valid = formValid(this.state.rule, this.state)
    let result = valid.result
    if (!isInit) {
      if (!valid.result) {
        global.alert.show({
          content: valid.msg,
        })
        result = false
      } else if (parseFloat(this.state.loanAmount) > parseFloat(this.state.loanAllowAmount)) {
        global.alert.show({
          content: '支付货款金额超出可申请金额',
        })
        result = false
      }
    }
    return result
  }

  async countRatio(noMsg) {
    if (vAmount.test(this.state.loanAmount)) {
      if (noMsg) {
        await this.setState({
          loanRatio: ((this.state.loanAmount / this.state.orderAmount) * 100).toFixed(2),
        })
      } else {
        await this.setState({
          loanAmountStr: toAmountStr(this.state.loanAmount, 2, true),
          loanRatio: ((this.state.loanAmount / this.state.orderAmount) * 100).toFixed(2),
        })
        const result = this.basicValidate()
        if (result) {
          this.countGoodsItems()
        }
      }
    }
  }

  // 添加新数据
  resetNewOrderData(skuData, orderData) {
    const skuItemData = skuData
    const orderItemData = orderData
    const newItemArr = [
      {
        skuName: 'rated',
        title: '已支付比例',
      },
      {
        skuName: 'leftLoanAmount',
        title: '剩余货款',
      },
      {
        skuName: 'currentLoanAmount',
        title: '本次支付金额',
      },
      {
        skuName: 'curentLoanRated',
        title: '本次支付比例',
      },
    ]

    // 添加新sku
    skuItemData.forEach(function (item, index) {
      const skuItem = item
      newItemArr.forEach(function (item, index) {
        skuItem.skuItemList.push(item)
      })
    })

    // 新order数据添加
    orderItemData.forEach(function (item, index) {
      item.orderProductInfoVOs.forEach(function (item, index) {
        item.currentLoanAmount = ''
        item.curentLoanRated = ''
      })
    })
    return {
      skuItemData: skuItemData,
      orderItemData: orderItemData,
    }
  }

  async getOrderInfo() {
    const { projectId, orderId, showDetail } = this.state
    const res = await ajaxStore.order.getOrderInfoByPC({
      projectId,
      orderId,
    })
    if (res.data && res.data.data) {
      const data = res.data.data
      // 新增实时计算贷款限额
      this.limitAmount(data.newOrderProductInfoVOs)
      // 重置数据
      const resetData = this.resetNewOrderData(this.state.skuItemData, data.newOrderProductInfoVOs)
      // 渲染订单
      const tableData = this.getNewListData(resetData.skuItemData, resetData.orderItemData)

      console.log(tableData, 'tableData')

      tableData.map((item, key) => {
        showDetail[key] = true
      })

      const fundSource = data.orderBasicVO.fundSource
      let { loanAmount, loanAmountStr, loanAllowAmount } = this.state
      if (fundSource === '1') {
        loanAmount = loanAllowAmount
        loanAmountStr = toAmountStr(loanAmount, 2, true)
      }

      await this.setState({
        tableData,
        showDetail,
        fundSource,
        loanAmount,
        loanAmountStr,
      })

      this.renderSummation(data.newOrderProductInfoVOs)

      if (fundSource === '1') {
        this.countRatio()
      }
    }
  }

  // 渲染 合计
  renderSummation(orderGroups) {
    let orderGroup
    var summation = 0
    for (var i = 0; i < orderGroups.length; i++) {
      orderGroup = orderGroups[i].orderProductInfoVOs
      for (var j = 0; j < orderGroup.length; j++) {
        summation = addNum(summation, orderGroup[j].totalCost)
      }
    }

    this.setState({
      orderAmount: summation,
    })
  }

  // 整合新数据
  getNewListData(skuData, orderData) {
    const skuItemData = skuData
    const orderInforData = orderData
    const tableArr = []
    // 表头个数
    skuItemData.forEach(function (skuItem, skuIndex) {
      const skuProductClassId = skuItem.productClassId
      const skuItemList = skuItem.skuItemList
      const tableObj = {
        skuItem: [],
        orderItem: [],
        productClassName: skuItem.productClassName,
      }

      // 重整表头
      skuItemList.forEach(function (item, index) {
        const skuItemObj = {
          skuName: item.skuName,
          text: item.title,
        }
        tableObj.skuItem.push(skuItemObj)
      })

      // 重整orderList
      orderInforData.forEach(function (item, index) {
        const orderProductClassId = item.productClassId
        const orderProductInfoVOs = item.orderProductInfoVOs
        if (skuProductClassId === orderProductClassId) {
          const orderItemArr = []
          orderProductInfoVOs.forEach(function (item, index) {
            const orderProdctItem = item
            const orderDataArr = []
            skuItemList.forEach(function (item, index) {
              if (orderProdctItem[item.skuName] !== undefined) {
                const orderDataObj = {
                  skuName: item.skuName,
                  text: orderProdctItem[item.skuName],
                  productId: orderProdctItem.id,
                }
                orderDataArr.push(orderDataObj)
              } else {
                const otherData = JSON.parse(orderProdctItem.data)
                const orderDataObj = {
                  skuName: item.skuName,
                  text: otherData[item.skuName],
                  productId: orderProdctItem.id,
                }
                orderDataArr.push(orderDataObj)
              }
            })
            orderItemArr.push(orderDataArr)
          })
          tableObj.orderItem = orderItemArr
        }
      })
      tableArr.push(tableObj)
    })
    tableArr.map((tableItem, tableKey) => {
      console.log(tableItem.orderItem, 'tableItem.orderItem')
      tableItem.orderItem.map((orderItem, orderKey) => {
        orderItem.map((orderDetailItem, orderDetailKey) => {
          tableArr[tableKey].orderItem[orderKey][orderDetailKey].skuChineseName = this.getSkuValue(
            tableItem.skuItem,
            orderDetailItem.skuName,
          )
        })
      })
    })
    return tableArr
  }

  getSkuValue(skuItems, skuName) {
    console.log(skuItems, skuName)
    let chineseName = ''
    skuItems.map((item, key) => {
      if (skuName === item.skuName) {
        chineseName = item.text
      }
    })
    return chineseName
  }

  async getSkuItem() {
    const { supplierId, orderId } = this.state
    const res = await ajaxStore.order.getSkuItem({
      supplierId,
      orderId,
    })
    if (res.data && res.data.data) {
      await this.setState({
        skuItemData: res.data.data,
      })
      this.getOrderInfo()
    }
  }

  async getLoanTypes() {
    const res = await ajaxStore.order.getLoanTypes()
    if (res.data && res.data.code === '0') {
      this.setState({
        loanTypeList: res.data.data,
        loanType: res.data.data[this.state.loanTypeIndex].value,
        loanTypeName: res.data.data[this.state.loanTypeIndex].name,
      })
    }
  }

  showPayTypePicker() {
    this.loadPayType()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  loadPayType = () => {
    if (this.state.loanTypeList.length) {
      const array = this.state.loanTypeList.map((item, index) => {
        return item.name
      })
      Keyboard.dismiss()
      Picker.init({
        pickerData: array,
        pickerConfirmBtnText: '确定',
        pickerCancelBtnText: '取消',
        pickerTitleText: '请选择支付货款类型',
        pickerBg: [255, 255, 255, 1],
        pickerConfirmBtnColor: [89, 192, 56, 1],
        pickerCancelBtnColor: [102, 102, 102, 1],
        pickerTitleColor: [153, 153, 153, 1],
        pickerFontSize: 18,
        pickerTextEllipsisLen: 20,
        selectedValue: [this.state.loanTypeList[this.state.loanTypeIndex].name],
        onPickerConfirm: (data, pickedIndex) => {
          this.hideShadow()
          if (pickedIndex !== this.state.loanTypeIndex) {
            this.setState({
              loanType: this.state.loanTypeList[pickedIndex].value,
              loanTypeName: this.state.loanTypeList[pickedIndex].name,
              loanTypeIndex: pickedIndex,
            })
          }
        },
        onPickerCancel: (data, pickedIndex) => {
          this.hideShadow()
        },
      })
      this.showShadow()
      Picker.show()
    }
  }

  async showDetail(key, isShow) {
    console.log(key, isShow)
    const showDetail = this.state.showDetail
    showDetail[key] = isShow
    await this.setState({
      showDetail,
    })
    this.forceUpdate()
  }

  async reCountRatio(a, b, c) {
    const { tableData, loanAmount } = this.state
    let currentLoanAmount = tableData[a].orderItem[b][c].textStr
    const oldLoanAmount = tableData[a].orderItem[b][c].text
    if (vPrice.test(currentLoanAmount)) {
      currentLoanAmount = parseFloat(currentLoanAmount)
    }
    let loanAllowAmount
    let totalCost
    let result
    let msg
    tableData[a].orderItem[b].map((item, key) => {
      if (item.skuName === 'leftLoanAmount') {
        loanAllowAmount = parseFloat(item.text)
      }
      if (item.skuName === 'totalCost') {
        totalCost = parseFloat(item.text)
      }
    })
    if (vPrice.test(currentLoanAmount)) {
      if (currentLoanAmount <= loanAllowAmount) {
        result = true
      } else {
        msg = '本次支付金额不得大于剩余货款'
      }
    } else {
      msg = '请输入正确金额'
    }

    if (result) {
      tableData[a].orderItem[b].map((item, key) => {
        if (item.skuName === 'curentLoanRated') {
          tableData[a].orderItem[b][key].text =
            loanAllowAmount === 0 ? '0%' : ((currentLoanAmount / totalCost) * 100).toFixed(2) + '%'
        } else if (item.skuName === 'currentLoanAmount') {
          tableData[a].orderItem[b][key].text = currentLoanAmount.toString()
          tableData[a].orderItem[b][key].textStr = toAmountStr(currentLoanAmount, 2, true)
        }
      })
      console.log(tableData, 'newTableData')
      const newLoanAmount = loanAmount + (currentLoanAmount - oldLoanAmount)
      await this.setState({
        tableData,
        loanAmount: newLoanAmount,
        loanAmountStr: toAmountStr(newLoanAmount, 2, true),
        loanRatio: ((newLoanAmount / this.state.orderAmount) * 100).toFixed(2),
      })
      this.forceUpdate()
    } else {
      global.alert.show({
        content: msg,
      })
    }
    return result
  }

  async countGoodsItems() {
    let { tableData, loanAmount } = this.state
    let leftLoanAmount
    let totalCost
    let currentLoanAmount
    tableData.map((tableItem, tableKey) => {
      tableItem.orderItem.map((orderItem, orderKey) => {
        orderItem.map((goodsItem, goodsKey) => {
          if (goodsItem.skuName === 'leftLoanAmount') {
            leftLoanAmount = goodsItem.text
          }
          if (goodsItem.skuName === 'totalCost') {
            totalCost = goodsItem.text
          }
          if (goodsItem.skuName === 'currentLoanAmount') {
            currentLoanAmount =
              delNum(loanAmount, leftLoanAmount) > 0
                ? leftLoanAmount
                : delNum(loanAmount, leftLoanAmount) > 0
                ? delNum(loanAmount, leftLoanAmount)
                : loanAmount
            loanAmount = delNum(loanAmount, currentLoanAmount)
            tableData[tableKey].orderItem[orderKey][goodsKey].text = currentLoanAmount.toString()
            tableData[tableKey].orderItem[orderKey][goodsKey].textStr = toAmountStr(
              currentLoanAmount.toString(),
              2,
              true,
            )
          }
          if (goodsItem.skuName === 'curentLoanRated') {
            tableData[tableKey].orderItem[orderKey][goodsKey].text =
              leftLoanAmount === 0 ? '0.00%' : parseFloat((currentLoanAmount / totalCost) * 100).toFixed(2) + '%'
          }
        })
      })
    })
    await this.setState({
      tableData,
    })
    console.log(tableData, 'currentTable')
    this.forceUpdate()
  }

  disabled() {
    return !this.state.loanAmount
  }

  goHistory = () => {
    this.props.navigation.navigate('PayHistory', { orderCode: this.state.orderCode })
  }

  async applyLoan() {
    const { orderId, orderCode, loanRatio, loanAmount, loanType, tableData } = this.state
    const loanProductList = []
    tableData.map((item, key) => {
      item.orderItem.map((orderItem, orderKey) => {
        orderItem.map((goodsItem, goodsKey) => {
          if (goodsItem.skuName === 'currentLoanAmount') {
            loanProductList.push({
              orderProductInfoId: goodsItem.productId,
              loanAmount: goodsItem.text,
            })
          }
        })
      })
    })
    const res = await ajaxStore.order.loanApply({
      orderId,
      orderCode,
      amountRate: loanRatio,
      amount: loanAmount,
      type: loanType,
      loanProductListString: JSON.stringify(loanProductList),
    })
    if (res.data && res.data.code === '0') {
      onEvent('申请支付货款', 'ApplyLoan', '/ofs/front/loan/loanApply', {
        orderCode,
        orderId,
        loanAmount,
      })
      global.alert.show({
        content: '系统审核中，点击确定前往货款列表查看。',
        callback: () => {
          this.props.navigation.navigate('Loan')
        },
      })
    }
  }

  clearData() {}

  render() {
    const { navigation } = this.props
    const { loanRatio, loanAllowAmount, orderAmount, showDetail, tableData, fundSource, loanAmount } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'申请支付货款'} navigation={navigation} />
        <ScrollView>
          <View style={styles.blockMain}>
            <View style={styles.blockHeader}>
              <Text
                style={{
                  fontSize: dp(32),
                  fontWeight: 'bold',
                }}
              >
                申请金额
              </Text>
              <Text onPress={this.goHistory} style={styles.history}>
                查看历史支付记录
              </Text>
            </View>
            <View style={styles.blockItem}>
              <Text style={styles.blockText}>{`订单金额：${toAmountStr(orderAmount, 2, true)}`}</Text>
              <Text style={styles.blockText}>{`可申请金额：${toAmountStr(loanAllowAmount, 2, true)}`}</Text>
            </View>
            <View style={styles.formItem}>
              <View style={styles.label}>
                <Text>支付货款类型</Text>
              </View>
              <Touchable
                style={styles.input}
                onPress={() => {
                  this.showPayTypePicker()
                }}
              >
                <Text
                  style={[
                    styles.inputText,
                    this.state.loanTypeName.toString().indexOf('请选择') > -1 ? styles.placeholder : '',
                  ]}
                >
                  {this.state.loanTypeName}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
            </View>
            <View style={styles.formItem}>
              <View style={styles.label}>
                <Text>支付货款金额</Text>
                {loanRatio && !(loanRatio > 100) ? (
                  <Text style={styles.tipsText}>{`支付货款比例：${loanRatio}%`}</Text>
                ) : (
                  <Text style={styles.tipsText}>{'支付货款比例'}</Text>
                )}
              </View>
              <TextInput
                placeholder={'请输入本次支付货款金额'}
                placeholderTextColor={'#A7ADB0'}
                keyboardType={'numeric'}
                style={styles.input}
                value={this.state.loanAmountStr}
                maxLength={10}
                editable={fundSource === '0'}
                onChangeText={async text => {
                  await this.setState({
                    loanAmount: parseFloat(text.replace(/,/g, '')),
                    loanAmountStr: text,
                  })
                  this.countRatio(true)
                }}
                onFocus={() => {
                  this.setState({
                    loanAmountStr: this.state.loanAmountStr.replace(/,/g, ''),
                  })
                }}
                onBlur={() => {
                  this.countRatio()
                }}
              />
            </View>
          </View>
          <Text style={styles.goodsBlockTitle}>支付货款金额明细</Text>
          {tableData.map((item, key) => {
            return (
              <View style={[styles.blockMain, styles.goodsBlockMain]} key={key}>
                <View style={styles.blockHeader}>
                  <Text
                    style={styles.blockTitle}
                  >{`${item.productClassName}货物明细（${item.orderItem.length}）`}</Text>
                  {showDetail[key] ? (
                    <Touchable
                      onPress={() => {
                        this.showDetail(key, false)
                      }}
                    >
                      <View style={styles.blockHeaderRight}>
                        <Text style={styles.tipsText}>{'收起明细'}</Text>
                        <Iconfont style={[styles.arrowUp, styles.showDetailIcon]} name={'arrow-right'} size={dp(24)} />
                      </View>
                    </Touchable>
                  ) : (
                    <Touchable
                      onPress={() => {
                        this.showDetail(key, true)
                      }}
                    >
                      <View
                        style={styles.blockHeaderRight}
                        onPress={() => {
                          this.showDetail(key, true)
                        }}
                      >
                        <Text style={styles.tipsText}>{'展开明细'}</Text>
                        <Iconfont style={[styles.arrow, styles.showDetailIcon]} name={'arrow-right'} size={dp(24)} />
                      </View>
                    </Touchable>
                  )}
                </View>
                {showDetail[key] &&
                  item.orderItem.map((orderItems, orderKeys) => {
                    return (
                      <View style={styles.goodsItem} key={orderKeys}>
                        {orderItems.map((orderItem, orderKey) => {
                          return (
                            <View key={orderKey}>
                              {orderItem.skuName === 'productName' && (
                                <Text style={styles.goodsTitle}>
                                  {`${orderKeys + 1}.`}
                                  {orderItem.text}
                                </Text>
                              )}
                            </View>
                          )
                        })}
                        <View style={styles.blockItem}>
                          {orderItems.map((orderItem, orderKey) => {
                            return (
                              <View key={orderKey}>
                                {/* 详细sku不显示货物名称、本次支付金额、本次支付比例 */}
                                {orderItem.skuName !== 'productName' &&
                                  orderItem.skuName !== 'currentLoanAmount' &&
                                  orderItem.skuName !== 'curentLoanRated' && (
                                    <View style={styles.goodsSkuItem}>
                                      <Text style={styles.goodsSkuItemText}>{orderItem.skuChineseName}</Text>
                                      {/* { (orderItem.skuName === 'price' || orderItem.skuName === 'totalCost' || orderItem.skuName === 'leftLoanAmount') && vAmount.test(orderItem.text) ? (
                                    <Text style={styles.goodsSkuItemText}>{toAmountStr(orderItem.text, 2, true)}</Text>
                                  ) : ( */}
                                      {orderItem.skuName === 'rated' ? (
                                        <Text style={styles.goodsSkuItemText}>{`${orderItem.text}%`}</Text>
                                      ) : orderItem.skuName === 'leftLoanAmount' ||
                                        orderItem.skuName === 'price' ||
                                        orderItem.skuName === 'totalCost' ? (
                                        <Text style={styles.goodsSkuItemText}>
                                          {toAmountStr(orderItem.text, 2, true)}
                                        </Text>
                                      ) : (
                                        <Text style={styles.goodsSkuItemText}>{orderItem.text}</Text>
                                      )}

                                      {/* )} */}
                                    </View>
                                  )}
                              </View>
                            )
                          })}
                        </View>
                        <View style={[styles.blockItemLoanAmount, styles.detailInputItem]}>
                          {orderItems.map((orderItem, orderKey) => {
                            return orderItem.skuName === 'currentLoanAmount' ? (
                              fundSource === '0' && loanAmount ? (
                                <TextInput
                                  key={orderKey}
                                  placeholder={orderItem.skuChineseName}
                                  placeholderTextColor={'#A7ADB0'}
                                  keyboardType={'numeric'}
                                  style={styles.input}
                                  value={tableData[key].orderItem[orderKeys][orderKey].textStr ? orderItem.textStr : ''}
                                  editable={true}
                                  onChangeText={async text => {
                                    tableData[key].orderItem[orderKeys][orderKey].textStr = text
                                    await this.setState({
                                      tableData,
                                    })
                                    this.forceUpdate()
                                  }}
                                  onFocus={async () => {
                                    tableData[key].orderItem[orderKeys][orderKey].textStr = orderItem.text
                                    await this.setState({
                                      tableData,
                                    })
                                    this.forceUpdate()
                                  }}
                                  onBlur={async () => {
                                    const result = await this.reCountRatio(key, orderKeys, orderKey)
                                    if (!result) {
                                      tableData[key].orderItem[orderKeys][orderKey].textStr = toAmountStr(
                                        orderItem.text,
                                        2,
                                        true,
                                      )
                                      await this.setState({
                                        tableData,
                                      })
                                      this.forceUpdate()
                                    }
                                  }}
                                />
                              ) : (
                                <TextInput
                                  key={orderKey}
                                  placeholder={orderItem.skuChineseName}
                                  placeholderTextColor={'#A7ADB0'}
                                  keyboardType={'numeric'}
                                  style={styles.input}
                                  value={orderItem.text ? toAmountStr(orderItem.text, 2, true) : ''}
                                  editable={false}
                                />
                              )
                            ) : null
                          })}
                          {orderItems.map((orderItem, orderKey) => {
                            return orderItem.skuName === 'curentLoanRated' ? (
                              orderItem.text ? (
                                <Text key={orderKey} style={styles.ratio}>{`${orderItem.text}`}</Text>
                              ) : (
                                <Text key={orderKey} style={styles.ratio}>{`${orderItem.skuChineseName}`}</Text>
                              )
                            ) : null
                          })}
                        </View>
                      </View>
                    )
                  })}
              </View>
            )
          })}
          <View style={styles.footer}>
            <SolidBtn disabled={this.disabled()} onPress={this.applyLoan} style={styles.next} text={'申请支付货款'} />
            {/* <Text onPress={this.clearData} style={styles.cancelText}>{'取消填写'}</Text> */}
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
    backgroundColor: '#F7F7F9',
  },
  blockMain: {
    backgroundColor: '#fff',
    paddingHorizontal: dp(30),
    paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(72),
    position: 'relative',
  },
  goodsBlockMain: {
    marginBottom: dp(36),
    marginTop: dp(36),
  },
  blockTitle: {
    fontSize: dp(32),
    fontWeight: 'bold',
    width: DEVICE_WIDTH * 0.65,
  },
  blockItem: {
    backgroundColor: '#F8F8FA',
    paddingHorizontal: dp(20),
    paddingVertical: dp(28),
    marginBottom: dp(48),
  },
  blockText: {
    fontSize: dp(28),
    lineHeight: dp(50),
  },
  formItem: {
    marginBottom: dp(48),
  },
  inputText: {
    color: '#2D2926',
    paddingVertical: dp(15),
    fontSize: dp(28),
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(28),
  },
  blockHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: dp(28),
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(24),
  },
  placeholder: {
    color: '#A7ADB0',
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }],
  },
  arrowUp: {
    transform: [{ rotateZ: '270deg' }],
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  tipsText: {
    color: '#91969A',
  },
  showDetailIcon: {
    marginLeft: dp(15),
  },
  goodsBlockTitle: {
    marginLeft: dp(60),
    marginTop: dp(60),
    fontSize: dp(32),
    fontWeight: 'bold',
  },
  goodsTitle: {
    fontSize: dp(28),
    marginBottom: dp(40),
    fontWeight: 'bold',
  },
  goodsSkuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goodsSkuItemText: {
    lineHeight: dp(60),
  },
  detailInputItem: {
    marginBottom: dp(50),
    position: 'relative',
  },
  ratio: {
    position: 'absolute',
    right: dp(20),
    top: dp(25),
    color: '#A7ADB0',
    borderLeftWidth: dp(2),
    borderLeftColor: '#DDDDE8',
    paddingLeft: dp(10),
  },
  footer: {
    marginTop: dp(96),
    paddingBottom: dp(100),
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  next: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    width: dp(690),
  },
  cancelText: {
    color: '#464678',
    fontSize: dp(30),
    textAlign: 'center',
    marginVertical: dp(120),
  },
  history: {
    color: '#1A97F6',
    fontSize: dp(28),
  },
})
