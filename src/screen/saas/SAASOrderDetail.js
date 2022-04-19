import React, { PureComponent } from 'react'
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import Picker from 'react-native-picker'
import { connect } from 'react-redux'
import BottomFullModal from '../../component/BottomFullModal'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { DEVICE_HEIGHT, DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { injectUnmount, toAmountStr } from '../../utils/Utility'

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
      orderList: [],
      orderListSelect: {},
      people: {},
    }
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    this.props.navigation.state.params.orderId && this.orderGetById()
    this.props.navigation.state.params.orderId && this.getByOrderId()
  }

  async orderGetById() {
    const res = await ajaxStore.saas.orderGetById({ id: this.props.navigation.state.params.orderId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        people: {
          address: data.address,
          areaCode: data.areaCode,
          cityCode: data.cityCode,
          orderOptionsVOS: data.orderOptionsVOS || [],
          contactName: data.receiptPerson,
          contactPhone: data.receiptPhone,
          projectName: data.projectName,
          provinceCode: data.provinceCode,
          showAddress: [data.province, data.city, data.area],
          tip: data.description,
          customerName: data.customerName,
          payAmount: data.payAmount,
          invoiceCompany: data.orderInvoiceVO.invoiceCompany,
          deliveryDate: data.deliveryDate,
          status: data.status,
        },
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async getByOrderId() {
    const res = await ajaxStore.saas.getByOrderId({ orderId: this.props.navigation.state.params.orderId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data

      data.forEach(element => {
        let name = ''
        for (const key in element.extendData) {
          if (Object.hasOwnProperty.call(element.extendData, key)) {
            const element1 = element.extendData[key]
            name.length > 0 ? (name = name + '/' + element1.value) : (name = element1.value)
          }
        }
        element.spDataV = name
      })
      this.setState({
        orderList: data,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  pricesTrial = () => {
    const itemAddedCostVOS = this.state.orderListSelect ? this.state.orderListSelect.itemAddedCostVOS : []
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
              <Text style={styles.pricesTrialTitle}>{`¥${toAmountStr(
                this.state.orderListSelect.goodsPayTotalAmount,
                2,
                true,
              )}`}</Text>
            </View>
            {itemAddedCostVOS
              ? itemAddedCostVOS.map((item, key) => {
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
              <Text style={styles.pricesTrialBottomTitle}>
                ¥{toAmountStr(this.state.orderListSelect.payAmount, 2, true)}
              </Text>
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
      </BottomFullModal>
    )
  }

  renderData = (item, index) => {
    return (
      <View key={index} style={{ flex: 1 }}>
        <View style={styles.item}>
          <View style={{ paddingVertical: dp(30), flexDirection: 'row', flex: 1 }}>
            <Image
              style={styles.itemIMG}
              defaultSource={require('../../images/tupianjieshi.png')}
              source={{ uri: item.mainPicPath || '' }}
            ></Image>
            <View style={{ flex: 1 }}>
              <Text style={styles.goodsDetailTitle}>{item.goodsName}</Text>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryTitleText}>物料编码：</Text>
                <Text style={styles.goodsSummaryText}>{item.productSn}</Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryTitleText}>销售规格：</Text>
                <Text style={styles.goodsSummaryText} numberOfLines={10}>
                  {item.specification}
                </Text>
              </View>
              <View style={styles.goodsSummaryItem}>
                <Text style={styles.goodsSummaryTitleText}>规格：</Text>
                <Text style={styles.goodsSummaryText} numberOfLines={10}>
                  {item.spDataV}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.goodsBottom}>
            <View style={styles.priceMain}>
              <Text style={styles.marketPrice}>￥{toAmountStr(item.payAmount, 2, true)}</Text>
              <Touchable
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => {
                  this.setState({
                    orderListSelect: item,
                  })

                  this.pricesTrialModal.show()
                }}
              >
                <Text style={styles.pricesText}>价格试算</Text>
                <Iconfont style={styles.arrowUp} name={'xiangshangjiantou'} size={dp(24)} />
              </Touchable>
            </View>
            <Text>
              {item.quantity}
              {item.unitName}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { navigation } = this.props

    const orderOptionsVOS = this.state.people.orderOptionsVOS || []

    return (
      <View style={styles.container}>
        <NavBar
          title={'订单详情'}
          navigation={navigation}
          onLeftPress={() => {
            this.props.navigation.goBack()
          }}
        />
        <View style={styles.pageMain}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={this.state.orderList}
            renderItem={data => this.renderData(data.item, data.index)}
            ListHeaderComponent={() => {
              return (
                <Touchable style={styles.item}>
                  <View style={styles.headerMain}>
                    <Text style={styles.goodsDetailTitle}>基本信息</Text>
                  </View>
                  <View style={styles.reciveInfo}>
                    <Text style={styles.reciveItem}>订单编号：{this.props.navigation.state.params.orderId}</Text>
                    <Text style={styles.reciveItem}>客户：{this.state.people.customerName}</Text>
                    <Text style={styles.reciveItem}>项目：{this.state.people.projectName}</Text>
                    <Text style={styles.reciveItem}>
                      状态：
                      {this.state.people.status === 0
                        ? '待审核'
                        : this.state.people.status === 1
                        ? '已审核'
                        : this.state.people.status === 2
                        ? '进行中'
                        : this.state.people.status === 3
                        ? '已关闭'
                        : this.state.people.status === 4
                        ? '已取消'
                        : this.state.people.status === 5
                        ? '已完成'
                        : '待审核'}
                    </Text>
                    {orderOptionsVOS
                      ? orderOptionsVOS.map((item, key) => {
                          return (
                            <Text key={key} style={styles.reciveItem}>
                              {item.keyTitle}：{item.valueTitle}
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
                    <Text style={styles.reciveItem}>开票单位：{this.state.people.invoiceCompany}</Text>
                    <Text style={styles.reciveItem}>订单交付日期：{this.state.people.deliveryDate}</Text>
                    <Text style={styles.reciveItem}>备注：{this.state.people.tip}</Text>
                  </View>
                </Touchable>
              )
            }}
          />
        </View>
        <View style={[styles.bottomSummary, { justifyContent: 'flex-end' }]}>
          <Text style={styles.labelText}>
            总计：<Text style={styles.countAllText}>￥{toAmountStr(this.state.people.payAmount || 0, 2)}</Text>
          </Text>
        </View>
        {this.pricesTrial()}
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
  goodsSummaryTitleText: {
    color: '#91969A',
    fontSize: dp(28),
  },
  goodsSummaryText: {
    flex: 1,
    color: '#91969A',
    fontSize: dp(28),
    textAlign: 'right',
  },
  goodsSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(10),
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
  },
  input: {
    color: '#2D2926',
    textAlign: 'center',
    borderWidth: dp(2),
    width: dp(120),
    height: dp(64),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(10),
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
  reciveAddress: {
    marginTop: dp(50),
    paddingBottom: dp(50),
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
    marginVertical: dp(10),
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
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(SAASOrderCreat)
