import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Image, Text, RefreshControl, ScrollView, Keyboard } from 'react-native'
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

class DeliverList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      orderCode: '',
      deliverList: [],
      refreshing: false
    }
  }

  async componentDidMount () {
    const { params } = this.props.navigation.state
    await this.setState({
      orderCode: params ? params.orderCode : ''
    })
    this.setState({ refreshing: true })
    await this.loadData()
    this.setState({ refreshing: false })
  }

  loadData = async () => {
    const res = await ajaxStore.erp.getDeliverList({
      orderCode: this.state.orderCode
    })

    if (res && res.data && res.data.code === '0') {
      res.data.data.map((item) => {
        item.isfold = false
        return item
      })
      this.setState({ deliverList: res.data.data })
    }
  }

  fold = (i) => {
    const a = this.state.deliverList
    a[i].isfold = !a[i].isfold
    this.setState({
      deliverList: [...a]
    })
  }

  renderItem = (item) => {
    const views = []

    for (let i = 0; i < this.state.deliverList.length; i++) {
      const data = this.state.deliverList[i]
      views.push(
        <View style={styles.item} key={i}>
          <Touchable isPreventDouble={false} onPress={() => this.fold(i)}>
            <View style={{
              flexDirection: 'row',
              paddingVertical: dp(30),
              paddingHorizontal: dp(30),
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: dp(28), color: '#2D2926', flex: 1 }}>{`批次号：${data.deliverCode}`}</Text>
              {data.isfold
                ? <Iconfont name={'xiangshangjiantou'} />
                : <Iconfont name={'xiangxiajiantou-copy'} />}
            </View>
          </Touchable>
          {
            !data.isfold && data.items && data.items.map((item, index) => {
              const {
                goodsImage, goodsName, goodsNum, specification,
                marketPrice, originalPrice, deliverCount
              } = item
              return (
                <View style={{ padding: dp(30) }}>
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
                      }}>{`数量：${deliverCount}`}</Text>
                  </View>

                </View>
              )
            })
          }
        </View>
      )
    }
    return views
  }

  render () {
    return (
      <View style={styles.container}>

        <NavBar
          title={'批次详情'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={null}
        />
        <ScrollView
          refreshControl={
            <RefreshControl
              colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.loadData}
            />
          }>
          <View style={{ paddingTop: dp(30) }}>
            {this.renderItem()}

          </View>
        </ScrollView>

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

export default connect(mapStateToProps)(DeliverList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    backgroundColor: 'white',
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    marginBottom: dp(30)
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
  itemRow: {
    flexDirection: 'row'
  },
  itemTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginBottom: dp(10)
  }

})
