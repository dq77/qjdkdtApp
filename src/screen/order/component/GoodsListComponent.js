import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import { toAmountStr } from '../../../utils/Utility'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'

export default class GoodsListComponent extends PureComponent {
  static propTypes = {
    goodsList: PropTypes.array,
    rangeTaxNum: PropTypes.array,
    fromInvoiceApply: PropTypes.bool,
    editable: PropTypes.bool,
    edit: PropTypes.func,
    delete: PropTypes.func,
    selectTax: PropTypes.func
  }

  static defaultProps = {
    goodsList: [],
    rangeTaxNum: [], // 发票税号
    fromInvoiceApply: false,
    editable: false
  }

  constructor (props) {
    super(props)
    this.state = {
      goodsList: [],
      rangeTaxNum: [] // 发票税号
    }
  }

  static getDerivedStateFromProps (props, state) {
    // 申请开票
    if (props.fromInvoiceApply) {
      if (props.rangeTaxNum !== state.rangeTaxNum) {
        const rangeTaxNum = props.rangeTaxNum
        if (rangeTaxNum.length > 0) {
          rangeTaxNum.forEach(item => {
            item.nameAndSpbm = `${item.taxCodeName} - ${item.spbm} - ${item.taxRate}%`
          })
        }
        return { rangeTaxNum }
      }
    }

    if (props.goodsList !== state.goodsList) {
      const goodsList = props.goodsList
      if (goodsList.length > 0) {
        goodsList.forEach(item => {
          item.amountStr = toAmountStr(item.amount, 2, true)
          item.priceStr = toAmountStr(item.price, 2, true)
          item.sumStr = toAmountStr(item.totalCost, 2, true)
          console.log(item.totalCost)
          console.log(item.sumStr)
          // 税收编码自动匹配
          state.rangeTaxNum.forEach((item2, index2) => {
            if (item.goodsTaxNo === item2.spbm) item.valueTaxNum = index2
          })
        })
      }
      return { goodsList }
    }
    return null
  }

  selectTax = (index) => {
    if (this.props.selectTax) {
      this.props.selectTax(this.state.goodsList, this.state.rangeTaxNum, index)
    }
  }

  renderItem () {
    const views = []
    for (let i = 0; i < this.state.goodsList.length; i++) {
      views.push(
        <View key={i * 2} style={styles.itemContainer}>
          <Text style={styles.title}>{this.state.goodsList[i].name}</Text>
          <Text style={styles.title}>{`型号：${this.state.goodsList[i].spec}`}</Text>
          {this.props.fromInvoiceApply
            ? <Text style={styles.title}>
              {'税号：'}
              <Text onPress={() => this.selectTax(i)} style={this.state.goodsList[i].goodsTaxNo ? styles.title : styles.title2}>{this.state.goodsList[i].goodsTaxNo ? this.state.goodsList[i].goodsTaxNo + ' - ' + this.state.goodsList[i].sl + '%' : '选择税收编码'}</Text>
            </Text>
            : null}
          <View style={styles.contentContainer}>
            <Text style={[styles.content, { textAlign: 'left' }]}>{this.state.goodsList[i].amountStr}</Text>
            <Text style={styles.content}>{this.state.goodsList[i].priceStr}</Text>
            <Text style={[styles.content, { textAlign: 'right' }]}>{toAmountStr((this.state.goodsList[i].price * this.state.goodsList[i].amount), 2, true)}</Text>

          </View>
          {this.props.editable
            ? <View style={styles.editRow}>
              <Text onPress={() => this.props.edit(i)} style={[styles.editBtn, { backgroundColor: '#ff9b00' }]}>编辑</Text>
              <Text onPress={() => this.props.delete(i)} style={[styles.editBtn, { backgroundColor: '#ff3c4f', marginLeft: dp(50) }]}>删除</Text>
            </View>
            : null
          }

        </View>
      )
      if (i !== this.state.goodsList.length - 1) {
        views.push(<View key={i * 2 + 1} style={styles.separate} />)
      }
    }
    return views
  }

  render () {
    return (
      <View style={{ ...this.props.style }}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { textAlign: 'left' }]}>数量</Text>
          <Text style={styles.headerText}>单价</Text>
          <Text style={[styles.headerText, { textAlign: 'right' }]}>小计</Text>
        </View>
        {this.state.goodsList.length > 0
          ? this.renderItem()
          : <Text style={[styles.content, { textAlign: 'left', margin: dp(40) }]}>暂未添加货物</Text>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFF4',
    marginHorizontal: dp(30),
    paddingVertical: dp(13),
    borderRadius: dp(10),
    paddingHorizontal: dp(15)
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: dp(28),
    color: '#888888'
  },
  itemContainer: {
    padding: dp(30)
  },
  title: {
    fontSize: dp(28),
    color: '#888888',
    fontWeight: 'bold',
    paddingHorizontal: dp(15),
    marginBottom: dp(15)
  },
  title2: {
    fontSize: dp(28),
    color: '#5cb0f8',
    fontWeight: 'bold',
    paddingHorizontal: dp(15),
    marginBottom: dp(15)
  },
  content: {
    fontSize: dp(28),
    color: '#888888',
    flex: 1,
    textAlign: 'center'
  },
  contentContainer: {
    flexDirection: 'row',
    paddingHorizontal: dp(15)
  },
  separate: {
    height: dp(1.5),
    backgroundColor: '#e5e5e5',
    marginHorizontal: dp(30)
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: dp(30)
  },
  editBtn: {
    borderRadius: dp(30),
    color: 'white',
    paddingHorizontal: dp(25),
    paddingVertical: dp(5),
    fontSize: dp(27)
  }
})
