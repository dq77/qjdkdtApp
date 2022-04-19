import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Image, Text, TextInput, ScrollView, Keyboard } from 'react-native'
import ajaxStore from '../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { TouchableOpacity } from 'react-native-gesture-handler'
import store from '../../store/index'
import LoadingView from '../../component/LoadingView'
import Touchable from '../../component/Touchable'
import ListPageComponent from '../../component/ListPageComponent'
import { setLoanNum } from '../../actions'
import NavBar from '../../component/NavBar'
import { callPhone } from '../../utils/PhoneUtils'
import BottomFullModal from '../../component/BottomFullModal'
import FormItem2Component from '../../component/FormItem2Component'
import Picker from 'react-native-picker'
import { formatDate, createDateData } from '../../utils/DateUtils'
import { toAmountStr } from '../../utils/Utility'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { imgUrl, goodsImgUrl } from '../../utils/config'
import { onClickEvent } from '../../utils/AnalyticsUtil'

class ERPOrderDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.type = {
      0: '自主创建',
      1: '分享创建'
    }
    this.status = {
      0: '待发货',
      1: '部分发货',
      2: '已完成',
      3: '已取消',
      4: '已关闭'
    }
    this.payType = {
      0: '微信',
      1: '支付宝',
      2: '现金',
      3: '银行转账'
    }

    this.state = {
      orderCode: '',
      orderData: {},
      deliverList: []
    }
  }

  async componentDidMount () {
    const { params } = this.props.navigation.state
    await this.setState({
      orderCode: params ? params.orderCode : ''
    })
  }

  loadData = async (pageNo, pageSize) => {
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getOrderGoods({
      pageNo,
      pageSize,
      orderCode: params.orderCode
    })

    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  loadHeader = async () => {
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getByCode({
      orderCode: params.orderCode
    })
    if (res && res.data && res.data.code === '0') {
      this.setState({
        orderData: res.data.data
      })
    }
    // 批次列表
    const res1 = await ajaxStore.erp.getDeliverList({
      orderCode: params.orderCode
    })
    if (res1 && res1.data && res1.data.code === '0') {
      this.setState({
        deliverList: res1.data.data
      })
    }
  }

  toDeliverList = () => {
    if (this.state.deliverList && this.state.deliverList.length > 0) {
      this.props.navigation.navigate('DeliverList', { orderCode: this.state.orderCode })
    }
  }

  toAddCRM=() => {
    onClickEvent('商品管理-订单详情页-添加至CRM', 'erp/ERPOrderDetail')
    this.props.navigation.navigate('CrmCreat', {
      data: {
        leadsAppContactDtoList: [
          {
            linkName: this.state.orderData.receiptPerson, // 联系人姓名
            phoneNumber: this.state.orderData.receiptPhone // 联系人手机号
          }
        ]
      }
    })
  }

  renderItem = (item) => {
    const {
      goodsImage, goodsName, goodsNum, specification,
      marketPrice, originalPrice, count
    } = item.item
    return (
      <View style={
        item.index === 0 ? [styles.item, { }]
          : styles.item
      } >
        {item.index === 0 &&
          <Text style={{
            color: '#2D2926',
            fontSize: dp(32),
            marginBottom: dp(30)
          }}>商品详情</Text>}

        <View style={styles.itemRow}>
          {/* <Image
            resizeMode={'cover'}
            style={styles.img}
            defaultSource={require('../../images/default_error.png')}
            source={{ uri: goodsImgUrl + goodsImage }}
          /> */}
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{goodsName}</Text>
            <View style={styles.itemRow1}>
              <Text style={styles.itemText}>{'商品编码：'}</Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>{goodsNum}</Text>
            </View>
            <View style={styles.itemRow1}>
              <Text style={styles.itemText}>{'规格：'}</Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>{specification}</Text>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: '#EAEAF1', height: dp(1), marginVertical: dp(30) }} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: dp(28),
              color: '#2D2926'
            }}>小计：</Text>
          <Text
            style={{
              fontSize: dp(28),
              color: '#F55849'
            }}>{`￥${toAmountStr(marketPrice, 2, true)}`}</Text>
          <Text
            style={{
              textDecorationLine: 'line-through',
              fontSize: dp(24),
              color: '#2D2926',
              marginLeft: dp(10)
            }}>{toAmountStr(originalPrice, 2, true)}</Text>
          <Text
            style={{
              flex: 1,
              textAlign: 'right',
              fontSize: dp(28),
              color: '#2D2926'
            }}>{`数量：${count}`}</Text>
        </View>
      </View >
    )
  }

  renderHeader = () => {
    const {
      status, receiptPerson, receiptPhone, provinceCode,
      cityCode, areaCode, address, orderCode, createType,
      gmtCreated, gmtModified, payType, totalSum
    } = this.state.orderData
    const { deliverList } = this.state

    return (
      <View style={{ paddingTop: dp(30) }}>
        <View style={styles.block}>
          <View style={[styles.headRow, { marginBottom: dp(30) }]}>
            <Text style={styles.headTitle}>基础信息</Text>
            <Text style={[styles.headText, { color: '#2D2926' }]}>{this.status[status]}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>销售方：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.props.userInfo.corpName}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>销售人：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.props.userInfo.userName}</Text>
          </View>
          <View style={{ backgroundColor: '#EAEAF1', height: dp(1), width: dp(630) }} />
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>收货人：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPerson}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>联系方式：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPhone}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>收货地址：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') + ' ' + (address || '')}</Text>
          </View>
          <Text
            onPress={this.toAddCRM}
            style={{
              backgroundColor: '#2A6EE7',
              color: 'white',
              borderRadius: dp(25),
              overflow: 'hidden',
              marginTop: dp(17),
              marginBottom: dp(30),
              paddingHorizontal: dp(21),
              paddingVertical: dp(8)
            }}>添加至CRM</Text>
          <View style={{ backgroundColor: '#EAEAF1', height: dp(1), width: dp(630) }} />

          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>下单人：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPerson}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>联系方式：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPhone}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <View style={[styles.headRow, { marginBottom: dp(30) }]}>
            <Text style={styles.headTitle}>订单信息</Text>
          </View>
          <View style={[styles.headRow]}>
            <Text style={styles.headText}>配送批次号：</Text>
            <Text
              onPress={this.toDeliverList}
              style={[styles.headText, {
                flex: 1,
                textAlign: 'right',
                color: Color.THEME
              }]}>{deliverList && deliverList.length > 0 && deliverList[deliverList.length - 1].deliverCode}</Text>
          </View>
          <View style={{ backgroundColor: '#EAEAF1', height: dp(1), width: dp(630), marginVertical: dp(30) }} />
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>订单编号：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{orderCode}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>订单类型：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.type[createType]}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>下单时间：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{gmtCreated}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>更新时间：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{gmtModified}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>支付方式：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.payType[payType]}</Text>
          </View>
          <View style={[styles.headRow, { marginBottom: dp(20) }]}>
            <Text style={styles.headText}>支付总金额：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{`￥${toAmountStr(totalSum, 2, true)}`}</Text>
          </View>
        </View>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  render () {
    return (
      <View style={styles.container}>

        <NavBar
          title={'订单详情'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={null}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          canChangePageSize={false}
          navigation={this.props.navigation}
          loadData={this.loadData}
          loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          renderSeparator={null}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
        />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(ERPOrderDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.2
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  },
  item: {
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    marginBottom: dp(20),
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30)
  },
  block: {
    alignItems: 'flex-end',
    padding: dp(30),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16)
    // elevation: 3,
    // shadowOffset: {
    //   width: 0,
    //   height: 0
    // },
    // shadowRadius: 4,
    // shadowOpacity: 0.1
  },
  headRow: {
    flexDirection: 'row',

    alignItems: 'center'
  },
  headTitle: {
    color: '#2D2926',
    fontSize: dp(32),
    flex: 1

  },
  headText: {
    fontSize: dp(28),
    color: '#91969A'
  },
  itemRow: {
    flexDirection: 'row'
  },
  img: {
    width: dp(200),
    height: dp(200)
  },
  itemRow1: {
    flexDirection: 'row',
    marginTop: dp(13)
  },
  itemText: {
    fontSize: dp(24),
    color: '#91969A'
  },
  itemTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginBottom: dp(10)
  }

})
