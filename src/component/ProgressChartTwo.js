
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, LayoutAnimation, Easing } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../utils/screenUtil'
import {
  ProgressChart
} from 'react-native-chart-kit'

class ProgressChartTwo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    // const paymentNum = (Math.floor(num1V * 100 / 100) / (Math.floor(num1V * 100 / 100) + Math.floor(num2V * 100 / 100))) * 100
    let { paymentNum = 0, textTop, textBottom, textTopFont = 0, textBottomFont = 0, colorsStart = ['', ''], colorsEnd = ['', ''], strokeWidths = [0, 0, 0, 0], indexKey } = this.props

    paymentNum = (paymentNum <= 0.1 && paymentNum > 0) ? 0.1 : (paymentNum >= 99.99 && paymentNum < 100) ? 99.999 : (paymentNum / 100)
    return (<View key={indexKey}>
      <ProgressChart
        key={indexKey}
        style={{ position: 'absolute' }}
        data={{
          labels: ['Swim'], // optional
          data: [paymentNum === 0 ? 0 : paymentNum + 0.01],
          strokeLinecap: 'butt',
          dataInit: [paymentNum === 0 ? 1 : 0.001, 0.00001],
          colors: [colorsStart, ['white', 'white']]
        }}
        width={dp(300)}
        height={dp(300)}
        strokeWidth={strokeWidths[0]}
        selectStrokeWidth={strokeWidths[1]}
        radius={dp(99)}
        chartConfig={ {
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
        }}
        hideLegend={true}
        withCustomBarColorFromData={true}
      />
      <ProgressChart
        key={indexKey + 100}
        data={{
          labels: ['Swim'], // optional
          data: [paymentNum],
          textTop,
          textBottom,
          strokeLinecap: 'butt',
          dataInit: [0.001, 0.00001],
          colors: [['white', 'white'], colorsEnd]
        }}
        width={dp(300)}
        height={dp(300)}
        strokeWidth={strokeWidths[2]}
        selectStrokeWidth={strokeWidths[3]}
        radius={dp(99)}
        chartConfig={ {
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
        }}
        hideLegend={true}
        withCustomBarColorFromData={false}
        isShowText={true}
        textTopFont={textTopFont}
        textBottomFont={textBottomFont}
      />
    </View>

    )
  }
}

export default ProgressChartTwo
