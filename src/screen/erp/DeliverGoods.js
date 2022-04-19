import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Image, Text, TextInput, Platform, Keyboard } from 'react-native'
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
import { toAmountStr, showToast } from '../../utils/Utility'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { imgUrl, goodsImgUrl } from '../../utils/config'
import { vNumber } from '../../utils/reg'
import { onEvent } from '../../utils/AnalyticsUtil'

class DeliverGoods extends PureComponent {
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
      sum: 0,
      deliverItems: []
    }
  }

  async componentDidMount () {
    const { params } = this.props.navigation.state
    await this.setState({
      orderCode: params ? params.orderCode : ''
    })

    this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getOrderGoods({
      pageNo,
      pageSize,
      orderCode: params.orderCode
    })

    if (res && res.data && res.data.code === '0') {
      res.data.data.pagedRecords.map((item, index) => {
        item.selectCount = ''
        return item
      })
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  loadHeader = async () => {
    global.loading.show()
    const { params } = this.props.navigation.state
    const res = await ajaxStore.erp.getByCode({
      orderCode: params.orderCode
    })
    if (res && res.data && res.data.code === '0') {
      this.setState({
        orderData: res.data.data
      })
    }
    global.loading.hide()
  }

  changeCount = async (text, index) => {
    if (text && !vNumber.test(text)) {
      showToast('请输入数字')
      return
    }

    const item = this.listView.getData()[index]
    const count = item.count - item.deliverCount
    if (text && parseInt(text) > count) {
      showToast('不能超过最大数量')
      return
    }

    item.selectCount = text
    await this.listView.changeItemData(index, item)
    this.addSum()
  }

  addSum = () => {
    let sum = 0
    const deliverItems = []
    this.listView.getData().forEach((item, index) => {
      if (item.selectCount && parseInt(item.selectCount) > 0) {
        const count = parseInt(item.selectCount)
        sum += count * item.marketPrice

        deliverItems.push({
          deliverCount: count,
          orderItemCode: item.orderItemCode
        })
      }
    })
    this.setState({ sum, deliverItems })
  }

  submit = async () => {
    if (this.state.sum <= 0) {
      global.alert.show({ content: '发货数量不能为0' })
      return
    }

    const res = await ajaxStore.erp.createDeliver({
      orderCode: this.state.orderCode,
      deliverItems: this.state.deliverItems
    })
    if (res && res.data && res.data.code === '0') {
      onEvent('商品管理-订单列表页-准备发货', 'erp/DeliverGoods', '/erp/deliver/create', {
        orderCode: this.state.orderCode,
        deliverItems: this.state.deliverItems
      })
      global.alert.show({
        content: '发货成功',
        callback: () => {
          this.props.navigation.goBack()
        }
      })
    }
  }

  renderItem = (item) => {
    const {
      goodsImage, goodsName, goodsNum, specification,
      marketPrice, originalPrice, count, deliverCount, selectCount
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
              color: '#F55849'
            }}>{`￥${toAmountStr(marketPrice, 2, true)}`}</Text>
          <Text
            style={{
              textDecorationLine: 'line-through',
              flex: 1,
              fontSize: dp(24),
              color: '#2D2926',
              marginLeft: dp(10)
            }}>{toAmountStr(originalPrice, 2, true)}</Text>
          <TextInput
            style={styles.input}
            keyboardType='numeric'
            maxLength={10}
            placeholder={'0'}
            value={selectCount}
            onChangeText={text => {
              this.changeCount(text, item.index)
            }}
          />
          <Text
            style={{
              fontSize: dp(28),
              color: '#2D2926'
            }}>{`${count - deliverCount}/${count}`}</Text>
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

    return (
      <View style={{ paddingTop: dp(30) }}>
        <View style={styles.block}>
          <View style={[styles.headRow, { marginBottom: dp(30) }]}>
            <Text style={styles.headTitle}>收货信息</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>收货人：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPerson}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>联系电话：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{receiptPhone}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>地址：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') + ' ' + (address || '')}</Text>
          </View>
          <View style={[styles.headRow, { marginTop: dp(20) }]}>
            <Text style={styles.headText}>支付方式：</Text>
            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>{this.payType[payType]}</Text>
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

  renderFooter = () => {
    const { sum } = this.state
    return (
      <View style={styles.bottom}>
        <Text style={{
          fontSize: dp(26),
          color: '#2D2926'
        }}>总计：</Text>
        <Text style={{
          fontSize: dp(29),
          color: '#F55849',
          fontWeight: 'bold',
          flex: 1
        }}>{`￥${toAmountStr(sum, 2, true)}`}</Text>
        <Touchable onPress={this.submit}>
          <Text style={styles.btn}>确认发货</Text>
        </Touchable>

      </View>
    )
  }

  render () {
    return (
      <View style={styles.container}>

        <NavBar
          title={'订单发货'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={null}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={false}
          canChangePageSize={false}
          canPullRefresh={false}
          navigation={this.props.navigation}
          loadData={this.loadData}
          loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          renderSeparator={null}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
        />
        {this.renderFooter()}
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

export default connect(mapStateToProps)(DeliverGoods)

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
  },
  btn: {
    backgroundColor: Color.THEME,
    color: 'white',
    textAlignVertical: 'center',
    textAlign: 'center',
    width: dp(192),
    borderRadius: dp(34),
    overflow: 'hidden',
    fontSize: dp(28),
    ...Platform.select({
      ios: { paddingVertical: dp(20) },
      android: { height: dp(72) }
    })
  },
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingTop: dp(28),
    paddingBottom: dp(80),
    elevation: 20,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  input: {
    width: dp(96),
    height: dp(53),
    borderWidth: dp(2),
    borderColor: '#C7C7D6',
    borderRadius: dp(4),
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: dp(20),
    padding: 0

  }

})
