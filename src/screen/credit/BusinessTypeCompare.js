import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import { DashLine, DashVerticalLine } from '../../component/DashLine'
import Color from '../../utils/Color'
import CardView from 'react-native-cardview'

/**
 * BusinessTypeCompare
 */
export default class BusinessTypeCompare extends PureComponent {
  constructor (props) {
    super(props)

    this.list = [
      { name: '分销采', textList: ['全品类小额经销商', '最高50万', '30万以内线上极速审核', '≤90天', '标准流程：\n签约-订单-支付'] },
      { name: '直营采', textList: ['仟金顶品牌评分4分以上直营经销商', '常规100万\n美的300万', '资料收集3天内', '≤90天', '标准流程：\n签约-订单-支付'] },
      { name: '电商采', textList: ['各大电商平台的商户', '最高200万', '资料收集3天内', '≤90天', '标准流程：\n签约-订单-支付'] },
      { name: '诚信销', textList: ['对采购方有赊销账期的销售方', '最高3000万', '资料收集3天内', '≤180天', '标准流程：\n签约-订单-支付'] },
      { name: '诚信采', textList: ['对上游有支付需求的采购方', '最高500万', '资料收集3天内', '≤180天', '标准流程：\n签约-订单-支付'] },
      { name: '工程采', textList: ['承接工程项目的经销商', '最高500万', '资料收集3天内', '≤180天', '需工程项目调研准入\n项目准入-签约-订单-支付'] },
      { name: '货押采', textList: ['囤货于第三方仓库/工厂仓库的囤货商', '最高500万', '资料收集3天内', '≤90天', '需制定仓库确认\n仓库确认-签约-订单-支付'] },
      { name: '托盘', textList: ['主板上市企业', '最高5000万', '资料收集3天内', '≤120天', '标准流程：\n签约-订单-支付'] }
    ]
    this.tableTitles = [
      '适用场景',
      '额度',
      '授信额度审核时长',
      '供应链赊销周期',
      '操作流程'
    ]
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'业务类型对比'} navigation={navigation} />
        <View style={styles.content}>
          <CardView
            style={styles.cardview}
            cardElevation={30}
            cornerRadius={0}>
            <View style={styles.left}>
              {this.renderLeftItems()}
            </View>
          </CardView>
          <ScrollView style={styles.right} showsHorizontalScrollIndicator={false} horizontal={true}>
            <View>
              {this.renderRightRow()}
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  renderLeftItems () {
    const views = []
    views.push(<View key={0} style={styles.leftItem} />)
    for (let i = 0; i < this.list.length; i++) {
      views.push(<View style={styles.leftItem} key={i + 1}>
        <Text style={styles.leftTextItem} key={i + 1} >{this.list[i].name}</Text>
      </View>)
    }
    return views
  }

  renderRightRow () {
    const views = []
    views.push(this.renderRightItems(this.tableTitles, 0, true))
    for (let i = 0; i < this.list.length; i++) {
      views.push(<View style={styles.dash} key={'a' + i} />)
      //   views.push(<DashLine len={100} backgroundColor={'#dddddd'} />)
      views.push(this.renderRightItems(this.list[i].textList, i + 1))
    }
    return views
  }

  renderRightItems (textList, key, isTitle) {
    return (
      <View style={styles.rightRow} key={key}>
        <Text style={[isTitle ? styles.rightTitles : styles.rightItems, { width: dp(400) }]}>{textList[0]}</Text>
        <Text style={[isTitle ? styles.rightTitles : styles.rightItems, { width: dp(300) }]}>{textList[1]}</Text>
        <Text style={[isTitle ? styles.rightTitles : styles.rightItems, { width: dp(350) }]}>{textList[2]}</Text>
        <Text style={[isTitle ? styles.rightTitles : styles.rightItems, { width: dp(330) }]}>{textList[3]}</Text>
        <Text style={[isTitle ? styles.rightTitles : styles.rightItems, { width: dp(450) }]}>{textList[4]}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flexDirection: 'row',
    flex: 1
  },
  left: {
    flex: 1,
    marginBottom: dp(50)
  },
  cardview: {
    flex: 0.27
  },
  right: {
    flex: 1,
    marginBottom: dp(50)
  },
  leftItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftTextItem: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: dp(29)
  },
  rightRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rightItems: {
    textAlign: 'left',
    textAlignVertical: 'center',
    fontSize: dp(27),
    paddingHorizontal: dp(50)
  },
  rightTitles: {
    textAlign: 'left',
    textAlignVertical: 'center',
    fontSize: dp(29),
    fontWeight: 'bold',
    paddingHorizontal: dp(50)
  },
  dash: {
    borderColor: '#e5e5e5',
    borderRadius: 0.1,
    height: 0,
    borderWidth: 0.5,
    borderStyle: 'dashed'
  }
})
