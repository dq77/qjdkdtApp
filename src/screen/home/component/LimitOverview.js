
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, LayoutAnimation, Easing } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import {
  ProgressChart
} from 'react-native-chart-kit'
import { toInteger } from 'lodash'
import ProgressChartTwo from '../../../component/ProgressChartTwo'
import Color from '../../../utils/Color'
// 额度总览  仟金顶额度  厂家额度
class LimitOverview extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  unitV (maxY) {
    const V = maxY >= 100000000000 ? 100000000000 : maxY >= 10000000000 ? 10000000000 : maxY >= 1000000000 ? 1000000000 : maxY >= 100000000 ? 100000000 : maxY >= 10000000 ? 10000000 : maxY >= 1000000 ? 1000000 : maxY >= 100000 ? 100000 : maxY >= 10000 ? 10000 : maxY >= 1000 ? 1000 : maxY >= 100 ? 100 : maxY >= 10 ? 10 : 1

    return `${(maxY / V).toFixed(2)}`
  }

  unit (maxY) {
    const unit = maxY >= 100000000000 ? '千亿' : maxY >= 10000000000 ? '百亿' : maxY >= 1000000000 ? '十亿' : maxY >= 100000000 ? '亿' : maxY >= 10000000 ? '千万' : maxY >= 1000000 ? '百万' : maxY >= 100000 ? '十万' : maxY >= 10000 ? '万' : maxY >= 1000 ? '千' : maxY >= 100 ? '百' : maxY >= 10 ? '十' : ''

    return `${unit}`
  }

  render () {
    const { textTop, title, num1 = 0, num2 = 0, textTopFont, colorsStart = ['', ''], colorsEnd = ['', ''], num1Name, num2Name, paymentNum = 0, type, dataType, indexKey, titleStatus = '', titleStatusColor = '#2D2926' } = this.props
    const num1V = this.unitV(num1)
    const num2V = this.unitV(num2)
    const unit1V = this.unit(num1)
    const unit2V = this.unit(num2)
    return (
      <View key={indexKey} style={{ backgroundColor: 'white', marginTop: dp(40), marginLeft: dp(30), marginHorizontal: dp(30), borderRadius: dp(16), paddingBottom: dp(30) }}>

        <View style={{ marginHorizontal: dp(30), flexDirection: 'row', justifyContent: 'space-between', marginTop: dp(30) }}>
          <Text style={{ color: '#2D2926', fontSize: dp(28), fontWeight: 'bold', width: dp(460) }}>{title}</Text>
          <Text style={{ color: titleStatusColor, fontSize: dp(28) }}>{titleStatus}</Text>
        </View>
        {/* <View style={{ paddingHorizontal: dp(30), flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: dp(30) }}>
          <Text style={{ color: titleStatusColor, fontSize: dp(28) }}>{titleStatus}</Text>
        </View> */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginLeft: dp(20) }}>
            {type === 2 && <ProgressChartTwo key={indexKey} colorsStart={colorsStart} colorsEnd={colorsEnd} paymentNum={paymentNum } textTop={'使用率'} textBottom={`${paymentNum.toFixed(2)}%`} textTopFont={dp(26)} textBottomFont={dp(44)} strokeWidths={[dp(20), dp(20), dp(20), dp(20)]}/>}
          </View>
          <View style={{ marginLeft: dp(50) }}>
            <Text style={{ color: '#91969A', fontSize: dp(26), lineHeight: dp(40) }}>已使用额度（{unit1V}元）</Text>
            <Text style={{ color: colorsEnd[1], fontSize: dp(44), lineHeight: dp(60) }}>{`${num1V}`}</Text>
            <Text style={{ color: '#91969A', fontSize: dp(26), lineHeight: dp(40), marginTop: dp(20) }}>未使用额度（{unit2V}元）</Text>
            <Text style={{ color: colorsStart[1], fontSize: dp(44), lineHeight: dp(60) }}>{`${num2V}`}</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: dp(40),
    textAlign: 'center',
    marginBottom: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5'
  },
  separator: {
    height: dp(1),
    backgroundColor: Color.SPLIT_LINE,
    marginTop: dp(20),
    marginBottom: dp(10)
  },
  itemLeftBg: {
    height: dp(83),
    marginHorizontal: dp(30),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  progress: {
    marginHorizontal: (DEVICE_WIDTH - dp(60) - dp(300)) / 2,
    marginVertical: dp(55)
  },
  progressText: {
    textAlign: 'center',
    fontSize: dp(24)
    // transform: [{ scaleX: -1 }]
  }
})
export default LimitOverview
