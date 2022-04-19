import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, Keyboard, FlatList, TextInput,
  ActivityIndicator, ToastAndroid, ScrollView
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Banner from '../../component/Banner'
import ListFooter from '../../component/ListFooter'
import CommonFlatList from '../../component/CommonFlatList'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import AlertModal from '../../component/AlertModal'
import ComfirmModal from '../../component/ComfirmModal'
import { setGoodsItems } from '../../actions/index'
import { toAmountStr, isNumber, showToast } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'

export default class ExtractByNanJing extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      query: {},
      money: ''
    }
  }

  async componentDidMount () {
    const params = this.props.navigation.state.params
    if (params) {
      this.setState({
        query: params
      })
    }
  }

  clickExtract = async () => {
    Keyboard.dismiss()
    const params = this.props.navigation.state.params
    if (parseFloat(this.state.money) <= parseFloat(params.balance)) {
      const data = {
        userName: params.userName,
        idNo: params.idNo,
        mobilePhone: params.mobilePhone,
        amount: this.state.money,
        trsPwd: 'NoPwd'
      }
      const res = await ajaxStore.loan.accountWithdraw(data)
      if (res.data && res.data.code === '0') {
        global.alert.show({
          content: '提现成功',
          callback: () => {
            this.props.navigation.goBack()
          }
        })
      }
    } else {
      global.alert.show({
        content: '提现金额不可超出余额'
      })
    }
  }

  clickExtractAll = () => {
    this.setState({
      money: this.props.navigation.state.params.balance
    })
  }

  onChangeText = (text) => {
    const dec = text.split('.')[1]
    this.setState({ money: (isNumber(text) && dec && dec.length > 2) ? parseFloat(text).toFixed(2) : text })
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'提现'} navigation={navigation} />
        <View style={styles.content}>
          <Text style={styles.title}>提现金额</Text>
          <Text style={styles.text}>请输入提现金额</Text>
          <View style={styles.amountInput}>
            <TextInput
              style={styles.input}
              onChangeText={text => {
                this.onChangeText(text)
              }}
              value={this.state.money}
              keyboardType='numeric'
              placeholder={'0.00'}
              maxLength={16}
              placeholderTextColor={Color.TEXT_LIGHT} />
            <Text style={styles.yuan}>元</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontSize: dp(28), color: '#888888' }}>{`金额不可超过余额${navigation.state.params.balance}`}</Text>
            <Text style={{ fontSize: dp(28), color: '#4A90E2' }} onPress={this.clickExtractAll}>全部提现</Text>
          </View>
          <SolidBtn text={'提现'} onPress={this.clickExtract} disabled={!(isNumber(this.state.money) && parseFloat(this.state.money) > 0)} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5'
  },
  amountInput: {
    flexDirection: 'row',
    borderRadius: dp(10),
    borderWidth: dp(1.5),
    borderColor: '#D0D0D4',
    alignItems: 'center',
    marginTop: dp(30),
    marginBottom: dp(40)
  },
  input: {
    flex: 1,
    fontSize: dp(36),
    textAlign: 'right',
    paddingVertical: dp(13),
    color: '#333333'
  },
  yuan: {
    fontSize: dp(30),
    color: '#333333',
    marginHorizontal: dp(20)
  },
  content: {
    alignItems: 'stretch',
    paddingHorizontal: dp(40),
    paddingVertical: dp(50)
  },
  title: {
    fontSize: dp(33),
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: dp(20)
  },
  text: {
    fontSize: dp(29),
    color: '#999999'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(70)
  }
})
