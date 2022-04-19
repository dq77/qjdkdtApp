import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import { SolidBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { setGoodsItems } from '../../actions/index'
import { showToast, toAmountStr, formValid } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import { getRegionTextArr } from '../../utils/Region'
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import GoodsListComponent from './component/GoodsListComponent'
import {
  vAmount
} from '../../utils/reg'

class OrderAddGoods extends PureComponent {
  constructor (props) {
    super(props)
    this.rule = [
      {
        id: 'name',
        required: true,
        name: '货物名称'
      },
      {
        id: 'spec',
        required: true,
        name: '型号'
      },
      {
        id: 'amount',
        required: true,
        reg: vAmount,
        name: '数量'
      },
      {
        id: 'price',
        required: true,
        reg: vAmount,
        name: '单价'
      }
    ]
    this.state = {
      isEdit: false,
      editIndex: -1,
      name: '',
      spec: '',
      amount: '',
      price: '',
      sum: '',
      sumStr: ''
    }
  }

  componentDidMount () {
    if (this.props.navigation.state.params) {
      const { isEdit, index } = this.props.navigation.state.params
      if (isEdit === 1) {
        const editItem = this.props.erjiAddGoodsItems[index]
        this.setState({
          isEdit: true,
          editIndex: index,
          name: editItem.name,
          spec: editItem.spec,
          amount: editItem.amount,
          price: editItem.price,
          sum: editItem.sum,
          sumStr: toAmountStr((editItem.price * editItem.amount), 2, true)
        })
      }
    }
  }

  confirm = () => {
    this.addGoodsItem()
  }

  addGoodsItem () {
    const { name, amount, spec, price, sum, sumStr } = this.state
    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      if (!this.vDecimal(this.state.amount)) {
        global.alert.show({
          content: '数量最多两位小数'
        })
      }
      if (!this.vDecimal(this.state.price)) {
        global.alert.show({
          content: '单价最多两位小数'
        })
      }
      const erjiAddGoodsItems = [].concat(this.props.erjiAddGoodsItems)
      if (this.state.isEdit) {
        erjiAddGoodsItems[this.state.editIndex] = {
          name,
          spec,
          amount,
          amountStr: toAmountStr(amount, 2, true),
          price,
          priceStr: toAmountStr(price, 2, true),
          sumStr,
          sum
        }
      } else {
        erjiAddGoodsItems.push({
          name,
          spec,
          amount,
          amountStr: toAmountStr(amount, 2, true),
          price,
          priceStr: toAmountStr(price, 2, true),
          sumStr,
          sum
        })
      }
      setGoodsItems(erjiAddGoodsItems)
      const { navigation } = this.props
      const { params } = navigation.state
      if (params && params.refreshGoodsList) { params.refreshGoodsList(erjiAddGoodsItems) }
      navigation.goBack()
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  vDecimal (v) {
    v = v.toString()
    const arr = v.split('.')
    return arr.length <= 1 || arr[1].length <= 2
  }

  vNumber (v) {
    return /^\d+(\.\d+)?$/.test(v)
  }

  async calSum () {
    const amount = this.state.amount
    const price = this.state.price
    if (this.vNumber(amount) && this.vNumber(price)) {
      const sum = price * amount || ''
      const sumStr = toAmountStr(sum, 2, true)
      await this.setState({ sum, sumStr })
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'编辑货物信息'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>请完成以下内容</Text>
            {/* 货物名称 */}
            <FormItemComponent
              style={styles.item}
              title={'货物名称'}
              placeholder={'请输入货物名称'}
              maxLength={100}
              value={this.state.name}
              onChangeText={text => {
                this.setState({ name: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 型号 */}
            <FormItemComponent
              style={styles.item}
              title={'型号'}
              placeholder={'请输入型号'}
              maxLength={40}
              value={this.state.spec}
              onChangeText={text => {
                this.setState({ spec: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 数量 */}
            <FormItemComponent
              style={styles.item}
              title={'数量'}
              placeholder={'请输入数量，最多两位小数'}
              maxLength={20}
              keyboardType={'numeric'}
              value={this.state.amount}
              onChangeText={async text => {
                await this.setState({ amount: text })
                this.calSum()
              }}
            />
            <View style={styles.splitLine} />
            {/* 单价 */}
            <FormItemComponent
              style={styles.item}
              title={'单价'}
              placeholder={'请输入单价，最多两位小数'}
              maxLength={20}
              keyboardType={'numeric'}
              value={this.state.price}
              onChangeText={async text => {
                await this.setState({ price: text })
                this.calSum()
              }}
            />
            <View style={styles.splitLine} />
            {/* 小计 */}
            <FormItemComponent
              style={styles.item}
              title={'小计'}
              value={this.state.sumStr}
              editable={false}
            />
            <View style={styles.btn}>
              <SolidBtn text={'确定'} onPress={this.confirm} />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    erjiAddGoodsItems: state.order.erjiAddGoodsItems
  }
}

export default connect(mapStateToProps)(OrderAddGoods)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  splitLine: {
    height: 1,
    marginLeft: dp(30),
    backgroundColor: '#EFEFF4'
  },
  item: {
    backgroundColor: 'white'
  },
  title: {
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20)
  },
  btn: {
    alignItems: 'center',
    marginTop: dp(70)
  }
})
