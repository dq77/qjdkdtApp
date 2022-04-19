/* eslint-disable prettier/prettier */
import React, { PureComponent } from 'react'
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import BottomFullModal from '../../component/BottomFullModal'
import ComfirmModal from '../../component/ComfirmModal'
import { SolidBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { vChineseName, vPhone } from '../../utils/reg'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { injectUnmount, toAmountStr } from '../../utils/Utility'
// import SupplierEdit from './SAASSupplierEdit'
// address: "详细地址"
// areaCode: "110101"
// cityCode: "1101"
// compantName: {id: 1, createdTime: "20210304134125", updatedTime: "20210304134129", createdBy: null, orgId: "1", …}
// contactName: "联系人"
// contactPhone: "15936982589"
// projectName: "测试项目"
// provinceCode: "11"
// showAddress: (3) ["北京市", "市辖区", "东城区"]
// tip: "备注"
@injectUnmount
class SAASOrderCreat extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      productList: [{}, {}],
      conutAll: 0,
      payTypeList: [],
      payTypeName: '',
      people: this.props.navigation.state.params.people || {},
      orderList: [],
      payCompute: {},
      payComputeSelect: {},
    }
    this.rule = [
      {
        id: 'receiptPerson',
        reg: vChineseName,
        required: true,
        name: '收货人',
      },
      {
        id: 'receiptPhone',
        reg: vPhone,
        required: true,
        name: '联系电话',
      },
      {
        id: 'areaCode',
        required: true,
        name: '收货地址',
      },
      {
        id: 'address',
        required: true,
        name: '收货详细地址',
      },
      {
        id: 'payTypeName',
        required: true,
        requiredErrorMsg: '请选择付款条件',
        name: '付款条件',
      },
    ]
    console.log(this.props, 'this.props')
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.state.orderList.length > 0 && this.tipsProduct(this.state.orderList)
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  // 只做提示用户使用
  async tipsProduct(orderList) {
    const data = this.batchPayComputeData(orderList)
    const res = await ajaxStore.saas.batchPayCompute(data)
    if (res && res.data && res.data.code === '0') {
      const payComputeVOS = res.data.data || []
      this.tipLogic(orderList, payComputeVOS)
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  tipLogic(orderList, data) {
    for (let index = 0; index < data.payComputeVOS.length; index++) {
      const element = data.payComputeVOS[index]
      const element1 = orderList[index]
      if (!element.isCheck) {
        global.alert.show({
          content: data.payComputeVOS.message,
        })
        break
      }
      if (!element.isUse) {
        global.alert.show({
          content: `${element1.skuVODec.name}产品${element1.skuVOSelectName}已失效`,
        })
        break
      }
    }
  }

  async submitOrder() {
    const { orderList } = this.state
    const {
      address,
      areaCode,
      cityCode,
      area,
      city,
      province,
      provinceCode,
      tip,
      contactPhone,
      contactName,
      showAddress,
      invoiceData,
      byParentList = [],
    } = this.state.people
    if (orderList.length < 1) {
      global.alert.show({
        content: '请先选择产品',
      })
      return
    }
    const payComputeVOS = this.state.payCompute.payComputeVOS || []
    const projectId = this.state.people.compantName.id
    const orderItemDTOS = []
    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index]
      const extendData = []
      element.skuVOList.forEach(element => {
        extendData.push({
          nameId: element.selectItem.spuAttributeId,
          valueId: element.selectItem.id,
        })
      })

      const element1 = payComputeVOS[index]
      orderItemDTOS.push({
        projectId,
        price: element1.price,
        quantity: element.goodNum,
        extendData,
        goodsId: element.skuVODec.id,
        itemAddedCostDTOS: element1.addedCostVOS,
      })
    }

    const orderOptionsDTOS = []
    for (let index = 0; index < byParentList.length; index++) {
      const element = byParentList[index]
      orderOptionsDTOS.push({ keyId: element.id, valueId: element.selectItem.id })
    }
    const data = {
      address,
      area: showAddress[2],
      areaCode,
      city: showAddress[1],
      cityCode,
      description: tip,
      freight: 0,
      orderItemDTOS,
      orderOptionsDTOS,
      projectId: this.state.people.compantName.id,
      province: showAddress[0],
      provinceCode,
      receiptPerson: contactName,
      receiptPhone: contactPhone,
      sourceType: '1',
      orderInvoiceDTO: {
        invoiceCompany: this.state.people.invoiceData.Name,
      },
    }
    const res = await ajaxStore.saas.orderCreate(data)
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('SAASOrderList')
    } else {
      global.alert.show({
        content: res.data.message,
        callback: () => {
          this.state.orderList.length > 0 && this.checkProduct(this.state.orderList, '1')
        },
      })
    }
  }

  batchPayComputeData(orderList) {
    const projectId = this.state.people.compantName.id
    const data = []
    for (let index = 0; index < orderList.length; index++) {
      const element = orderList[index]
      const extendData = []
      element.skuVOList.forEach(element => {
        extendData.push({
          nameId: element.selectItem.spuAttributeId,
          valueId: element.selectItem.id,
        })
      })
      data.push({
        projectId,
        quantity: element.goodNum,
        extendData,
        goodsId: element.skuVODec.id,
      })
    }
    return data
  }

  async checkProduct(orderList, type = '2') {
    const data = this.batchPayComputeData(orderList)
    const res = await ajaxStore.saas.batchPayCompute(data)
    if (res && res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        payCompute: data || {},
        orderList,
      })
      type === '1' && this.tipLogic(orderList, data)
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => {
          this.modal = ref
        }}
        title={'修改基本信息'}
        confirm={'确定'}
        coverScreen={true}
        submit={() => {
          this.props.navigation.navigate('SAASOrderCreat')
        }}
      >
        {/* <SupplierEdit
          type={'1'}
          defaultData={this.state.people}
          onPressData={async data => {
            await this.setState({
              people: {
                ...this.state.people,
                ...data,
              },
            })
            console.log(this.state)
          }}
        /> */}
      </BottomFullModal>
    )
  }

  pricesTrial = () => {
    const payAmount =
      this.state.payCompute && this.state.payCompute.payComputeVOS ? this.state.payComputeSelect.payAmount : 0
    const addedCostVOS =
      this.state.payCompute && this.state.payCompute.payComputeVOS ? this.state.payComputeSelect.addedCostVOS : []
    console.log(this.state.payCompute, 'payCompute')
    const price = this.state.payCompute ? this.state.payComputeSelect.goodsPayTotalAmount : 0

    return (
      <BottomFullModal
        ref={ref => {
          this.pricesTrialModal = ref
        }}
        title={'价格试算'}
        confirm={''}
        coverScreen={true}
        submit={() => {}}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pricesTrialBGView}>
            <View style={styles.pricesTrialItem}>
              <Text style={styles.pricesTrialTitle}>{'产品价格'}</Text>
              <Text style={styles.pricesTrialTitle}>{`¥${toAmountStr(price, 2, true)}`}</Text>
            </View>
            {addedCostVOS
              ? addedCostVOS.map((item, key) => {
                  return (
                    <View style={styles.pricesTrialItem} key={key}>
                      <Text style={styles.pricesTrialTitle}>{item.name}</Text>
                      <Text style={styles.pricesTrialTitle}>
                        {item.fee ? `¥${toAmountStr(item.fee, 2, true)}` : '待定'}
                      </Text>
                    </View>
                  )
                })
              : null}
            <View style={styles.line}></View>
            <View style={styles.pricesTrialBottomItem}>
              <Text style={styles.pricesTrialBottomTitle}>¥{toAmountStr(payAmount, 2, true)}</Text>
            </View>
          </View>
        </ScrollView>
      </BottomFullModal>
    )
  }

  renderData = item => {
    const skuVODec = item.item.skuVODec ? item.item.skuVODec : {}
    const { goodNum = '0', skuVOSelectName = '' } = item.item
    console.log(goodNum, item.index, this.state.orderList, '2222')
    const payAmount =
      this.state.payCompute && this.state.payCompute.payComputeVOS
        ? this.state.payCompute.payComputeVOS[item.index].payAmount
        : 0

    return (
      <View key={item.index} style={{ flex: 1 }}>
        <View style={styles.item}>
          <View style={{ paddingVertical: dp(30), flexDirection: 'row', flex: 1 }}>
            <Image
              style={styles.itemIMG}
              defaultSource={require('../../images/default_banner.png')}
              source={{ uri: skuVODec ? skuVODec.mainPicPath : '' }}
            ></Image>
            <View style={{ flex: 1 }}>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsDetailTitle}>{skuVODec ? skuVODec.name : ''}</Text>
                <Text
                  style={{ fontSize: dp(28), color: '#F55849' }}
                  onPress={() => {
                    const orderList = this.state.orderList
                    orderList.splice(item.index, 1)
                    this.setState({ orderList: JSON.parse(JSON.stringify(orderList)) })
                  }}
                >
                  删除
                </Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryText}>物料编码：</Text>
                <Text style={styles.goodsSummaryText}>{skuVODec ? skuVODec.productSn : ''}</Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryText}>销售规格：</Text>
                <Text style={styles.goodsSummaryText}>{skuVODec ? skuVODec.specification : ''}</Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryText}>规格：</Text>
                <Text style={styles.goodsSummaryText}>{skuVOSelectName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.goodsBottom}>
            <View style={styles.priceMain}>
              <Text style={styles.marketPrice}>￥{toAmountStr(payAmount, 2, true)}</Text>
              <Touchable
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={async () => {
                  await this.setState({
                    payComputeSelect: this.state.payCompute.payComputeVOS[item.index],
                  })
                  this.pricesTrialModal.show()
                }}
              >
                <Text style={styles.pricesText}>价格试算</Text>
                <Iconfont style={styles.arrowUp} name={'xiangshangjiantou'} size={dp(24)} />
              </Touchable>
            </View>
            <View style={styles.inputNumBGView}>
              <Touchable
                style={styles.textDelBGView}
                onPress={() => {
                  const orderList = this.state.orderList
                  let goodNum = parseFloat(orderList[item.index].goodNum) - 1
                  if (parseFloat(goodNum) <= 0) {
                    goodNum = '1.00'
                  }
                  orderList[item.index].goodNum = parseFloat(goodNum).toFixed(2)
                  this.checkProduct(JSON.parse(JSON.stringify(orderList)), '1')
                }}
              >
                <Text>-</Text>
              </Touchable>
              <TextInput
                style={styles.input}
                defaultValue={goodNum}
                value={goodNum}
                keyboardType={'numeric'}
                maxLength={10}
                onChangeText={async text => {
                  console.log(text, 'text')
                  const orderList = this.state.orderList

                  orderList[item.index].goodNum = text
                  this.setState({ orderList: JSON.parse(JSON.stringify(orderList)) })
                }}
                onBlur={() => {
                  const orderList = this.state.orderList
                  const goodNum = orderList[item.index].goodNum
                  if (!goodNum || parseFloat(goodNum) <= 0) {
                    orderList[item.index].goodNum = '1.00'
                  } else {
                    orderList[item.index].goodNum = parseFloat(goodNum).toFixed(2)
                  }
                  this.checkProduct(JSON.parse(JSON.stringify(orderList)), '1')
                }}
              />
              <Touchable
                style={styles.textAddBGView}
                onPress={() => {
                  const orderList = this.state.orderList
                  const goodNum = parseFloat(orderList[item.index].goodNum) + 1
                  orderList[item.index].goodNum = parseFloat(goodNum).toFixed(2)
                  this.checkProduct(JSON.parse(JSON.stringify(orderList)), '1')
                }}
              >
                <Text>+</Text>
              </Touchable>
            </View>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    const saasdata = this.props.saasInfo.saasList[this.props.saasInfo.currentIndex]
    return (
      <View style={styles.container}>
        <NavBar
          title={'新建订单'}
          navigation={navigation}
          onLeftPress={() => {
            this.setState({
              infoModal: true,
            })
          }}
        />
        <View style={styles.pageMain}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={this.state.orderList}
            renderItem={data => this.renderData(data)}
            ListHeaderComponent={() => {
              return (
                <Touchable
                  style={styles.item}
                  onPress={() => {
                    this.props.navigation.push('SAASSupplierEdit', {
                      type: '2',
                      defaultData: this.state.people,
                      clickModifyData: data => {
                        if (data.compantName.id !== this.state.people.compantName.id) {
                          this.setState({
                            orderList: [],
                            payCompute: {},
                          })
                        }
                        this.setState({
                          people: {
                            ...this.state.people,
                            ...data,
                          },
                        })
                      },
                    })

                    // this.modal.setModalVisible(true)
                  }}
                >
                  <View style={styles.headerMain}>
                    <Text style={styles.goodsDetailTitle}>基本信息</Text>
                    <Iconfont style={styles.title2Style} name={'arrow-right1'} size={dp(24)} />
                  </View>
                  <View style={styles.reciveInfo}>
                    <Text style={styles.reciveItem}>客户：{saasdata.tenantName}</Text>
                    <Text style={styles.reciveItem}>项目：{this.state.people.projectName}</Text>
                    {this.state.people.byParentList
                      ? this.state.people.byParentList.map((item, key) => {
                          return (
                            <Text key={key} style={styles.reciveItem}>
                              {item.title}：{item.selectItem.title}
                            </Text>
                          )
                        })
                      : null}
                    <Text style={styles.reciveItem}>
                      地址：{this.state.people.showAddress && this.state.people.showAddress.join('')}
                      {this.state.people.address}
                    </Text>
                    <Text style={styles.reciveItem}>联系人：{this.state.people.contactName}</Text>
                    <Text style={styles.reciveItem}>联系电话：{this.state.people.contactPhone}</Text>
                    <Text style={styles.reciveItem}>开票单位：{this.state.people.invoiceData.Name}</Text>
                    <Text style={styles.reciveItem}>备注：{this.state.people.tip}</Text>
                  </View>
                </Touchable>
              )
            }}
            ListFooterComponent={() => {
              return (
                <Touchable
                  onPress={() => {
                    this.props.navigation.navigate('SAASSelectProductList', {
                      orderList: this.state.orderList,
                      projectId: this.state.people.compantName.id,
                      callbackData: data => {
                        this.checkProduct(data)
                      },
                    })
                  }}
                >
                  <View style={styles.emptyContainer}>
                    <Iconfont name={'tianjia'} size={dp(40)} style={styles.emptyIcon} color={'white'} />
                    <Text style={styles.emptyText}>添加产品</Text>
                  </View>
                </Touchable>
              )
            }}
          />
        </View>
        <View style={styles.bottomSummary}>
          <Text style={styles.labelText}>
            总计：
            <Text style={styles.countAllText}>￥{toAmountStr(this.state.payCompute.payAmount || 0, 2, true)}</Text>
          </Text>
          <SolidBtn
            fontSize={dp(28)}
            onPress={() => this.submitOrder()}
            fontStyle={styles.fontStyle}
            style={styles.addBtn}
            text={'保存'}
            disabled={!this.state.orderList.length}
          />
        </View>
        {this.renderModal()}
        {this.pricesTrial()}
        <ComfirmModal
          title={'取消新建订单'}
          content={'取消新建订单，已填写内容将清空'}
          cancelText={'取消'}
          comfirmText={'确认'}
          cancel={() => {
            this.setState({
              infoModal: false,
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false,
            })
            this.props.navigation.navigate('SAASOrderList')
          }}
          infoModal={this.state.infoModal}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: dp(30),
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: dp(150),
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: dp(31),
    borderTopRightRadius: dp(16),
    borderBottomRightRadius: dp(16),
  },
  backTextWhite: {
    color: '#FFF',
  },
  pricesTrialBGView: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    marginTop: dp(30),
    marginHorizontal: dp(30),
    borderRadius: dp(16),
    padding: dp(30),
  },
  pageMain: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    paddingTop: dp(20),
    minHeight: DEVICE_HEIGHT,
    paddingBottom: dp(400),
  },
  item: {
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(20),
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    flex: 1,
  },
  goodsName: {
    color: '#2D2926',
    fontSize: dp(28),
    marginBottom: dp(20),
    width: DEVICE_WIDTH * 0.75,
    lineHeight: dp(34),
  },
  goodsSummaryText: {
    color: '#91969A',
  },
  goodsSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(10),
    // marginRight: dp(30),
  },
  goodsBottom: {
    borderTopWidth: dp(1),
    borderColor: '#E7EBF2',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: dp(20),
  },
  priceMain: {
    flex: 1,
  },
  originalPrice: {
    color: '#2D2926',
    fontSize: dp(24),
    textDecorationLine: 'line-through',
  },
  marketPrice: {
    color: '#F55849',
    fontSize: dp(28),
    marginRight: dp(10),
  },
  arrowUp: {
    marginLeft: dp(8),
  },
  goodsDetailTitle: {
    color: '#2D2926',
    fontSize: dp(32),
    marginBottom: dp(30),
    flex: 1,
  },
  input: {
    color: '#2D2926',
    textAlign: 'center',
    borderWidth: dp(2),
    width: dp(120),
    height: dp(64),
    borderColor: '#D8DDE2',
    padding: 0,
    // backgroundColor: 'red',
  },
  itemIMG: {
    width: dp(180),
    height: dp(180),
    marginRight: dp(20),
  },
  bottomSummary: {
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    position: 'absolute',
    // top: DEVICE_HEIGHT - dp(186),
    bottom: 0,
    width: DEVICE_WIDTH,
    height: dp(186),
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: dp(50),
    paddingHorizontal: dp(30),
  },
  addBtn: {
    width: dp(200),
    height: dp(70),
    borderRadius: dp(50),
    paddingVertical: 0,
  },
  fontStyle: {
    fontSize: dp(28),
    lineHeight: dp(70),
  },
  labelText: {
    color: '#000',
    fontSize: dp(28),
  },
  countAllText: {
    color: '#F55849',
    fontSize: dp(34),
  },
  deleteBtn: {
    color: '#F55849',
    lineHeight: dp(34),
  },
  goodsHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A6EE7',
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    height: dp(90),
  },
  emptyText: {
    fontSize: dp(32),
    color: '#FFFFFF',
  },
  emptyIcon: {
    marginRight: dp(14),
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reciveItem: {
    color: '#91969A',
    fontSize: dp(28),
    marginBottom: dp(15),
    width: DEVICE_WIDTH * 0.85,
  },
  modalTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24),
  },
  modalContainer: {
    padding: dp(60),
    paddingTop: 0,
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    fontSize: dp(28),
    height: dp(88),
  },
  addressInput: {
    marginTop: dp(30),
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  textAlignRight: {
    textAlign: 'right',
    width: '100%',
  },
  pricesText: {
    fontSize: dp(24),
    color: '#91969A',
    marginVertical: dp(5),
  },
  inputNumBGView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    borderRadius: dp(32),
    height: dp(64),
    // marginVertical: dp(10),
  },
  textDelBGView: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: dp(28),
    color: '#2D2926',
    width: dp(59),
    height: dp(64),
  },
  textAddBGView: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: dp(28),
    color: '#2D2926',
    width: dp(59),
    height: dp(64),
  },
  pricesTrialTitle: {
    fontSize: dp(28),
    color: '#2D2926',
  },
  pricesTrialItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: dp(10) },
  line: {
    height: dp(1),
    backgroundColor: '#D8DDE2',
    marginTop: dp(20),
  },
  pricesTrialBottomItem: {
    marginTop: dp(20),
    alignItems: 'flex-end',
  },
  pricesTrialBottomTitle: {
    fontSize: dp(28),
    color: '#F55849',
  },
})

const mapStateToProps = state => {
  return {
    saasInfo: state.user.saas,
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(SAASOrderCreat)
