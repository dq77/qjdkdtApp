import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import { PropTypes } from 'prop-types'
import { toAmountStr, formValid } from '../../../utils/Utility'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'
import AlertPage from '../../../component/AlertPage'
import MyTextInput from '../../../component/MyTextInput'
import { vAmount, vNumber, vPrice } from '../../../utils/reg'

export default class GoodsInfoEdit extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    spec: PropTypes.string,
    amount: PropTypes.string,
    price: PropTypes.string,
    totalCost: PropTypes.number,
    cancel: PropTypes.func,
    confirm: PropTypes.func
  }

  static defaultProps = {
    name: '',
    spec: '',
    amount: '',
    price: '',
    totalCost: '',
    cancel: function () {},
    confirm: function () {}
  }

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      spec: '',
      amount: '',
      price: '',
      totalCost: '',
      rule: [
        {
          id: 'name',
          required: true,
          name: '货物名称'
        },
        {
          id: 'spec',
          required: true,
          name: '货物型号'
        },
        {
          id: 'price',
          required: true,
          reg: vPrice,
          regErrorMsg: '请输入正确货物单价，最多两位小数',
          name: '货物单价'
        },
        {
          id: 'amount',
          required: true,
          reg: vPrice,
          regErrorMsg: '请输入正确货物数量，最多两位小数',
          name: '货物数量'
        }
      ]
    }
    this.changeData = this.changeData.bind(this)
    this.count = this.count.bind(this)
  }

  componentDidMount () {
    const { name, spec, amount, price, totalCost } = this.props
    this.setState({
      name,
      spec,
      amount,
      price,
      totalCost
    })
  }

  count () {
    if (vAmount.test(this.state.amount) && vAmount.test(this.state.price)) {
      this.setState({
        totalCost: this.state.amount * this.state.price
      })
    }
  }

  async changeData (data) {
    await this.setState(data)
  }

  renderFrom (name, spec, price, amount, totalCost) {
    return (
      <View>
        <View style={styles.formItem}>
          <Text style={styles.name}>货物名称</Text>
          <TextInput
            placeholder={'请输入货物名称'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={name}
            maxLength={20}
            onChangeText={text => {
              this.changeData({ name: text })
            }}
          //   onEndEditing={(evt) => {
          //     this.changeData({ name: evt.nativeEvent.text })
          // }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>货物型号</Text>
          <TextInput
            placeholder={'请输入货物型号'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={spec}
            maxLength={50}
            onChangeText={text => {
              this.changeData({ spec: text })
            }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>单价（元）</Text>
          <TextInput
            keyboardType={'numeric'}
            placeholder={'请输入货物单价'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            maxLength={10}
            defaultValue={price}
            onChangeText={async (text) => {
              await this.changeData({ price: text })
              this.count()
            }}
            onBlur={() => {
              this.count()
            }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>数量</Text>
          <TextInput
            keyboardType={'numeric'}
            placeholder={'请输入货物数量'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            defaultValue={amount}
            maxLength={10}
            onChangeText={async (text) => {
              await this.changeData({ amount: text })
              this.count()
            }}
            onBlur={() => {
              this.count()
            }}
          />
        </View>
        <View style={styles.formItem}>
          <Text style={styles.name}>小计</Text>
          <TextInput
            placeholder={'待计算'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            value={toAmountStr(totalCost, 2, true) + ''}
            editable={false}
          />
        </View>
      </View>
    )
  }

  render () {
    const { name, spec, price, amount, totalCost } = this.state
    return (
      <AlertPage
        title={'编辑货物信息'}
        render={ () => {
          return this.renderFrom(name, spec, price, amount, totalCost)
        }}
        comfirmText={'下一步'}
        cancel={() => {
          this.props.cancel()
        }}
        confirm={async () => {
          const valid = formValid(this.state.rule, this.state)
          if (valid.result) {
            await this.count()
            this.props.confirm(this.state)
            this.props.cancel()
          } else {
            global.alert.show({
              content: valid.msg
            })
          }
        }}
        infoModal={this.props.infoModal} />
    )
  }
}

const styles = StyleSheet.create({
  name: {
    marginBottom: dp(24)
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
  formItem: {
    marginBottom: dp(48)
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0
  }
})
