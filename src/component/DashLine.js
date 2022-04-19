import React, { PureComponent } from 'react'
import {
  Text,
  View,
  StyleSheet
} from 'react-native'

/* 水平方向的虚线
 * len 虚线个数
 * width 总长度
 * backgroundColor 背景颜色
 * */
export class DashLine extends PureComponent {
  render () {
    var len = this.props.len
    var arr = []
    for (let i = 0; i < len; i++) {
      arr.push(i)
    }
    return <View style={[styles.dashLine, { width: this.props.width }]}>
      {
        arr.map((item, index) => {
          return <Text style={[styles.dashItem, { backgroundColor: this.props.backgroundColor }]}
            key={'dash' + index}> </Text>
        })
      }
    </View>
  }
}
const styles = StyleSheet.create({
  dashLine: {
    flexDirection: 'row'
  },
  dashItem: {
    height: 1,
    width: 2,
    marginRight: 2,
    flex: 1
  }
})

/* 竖直方向的虚线
 * len 虚线个数
 * width 总长度
 * backgroundColor 背景颜色
 * */
export class DashVerticalLine extends PureComponent {
  render () {
    var len = this.props.len
    var arr = []
    for (let i = 0; i < len; i++) {
      arr.push(i)
    }
    return <View style={[styles2.dashLine, { height: this.props.width }]}>
      {
        arr.map((item, index) => {
          return <Text style={[styles2.dashItem, { backgroundColor: this.props.backgroundColor }]}
            key={'dash' + index}> </Text>
        })
      }
    </View>
  }
}
const styles2 = StyleSheet.create({
  dashLine: {
    flexDirection: 'column'
  },
  dashItem: {
    height: 2,
    width: 1,
    marginTop: 2,
    flex: 1
  }
})
