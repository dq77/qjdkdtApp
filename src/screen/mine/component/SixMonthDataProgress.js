
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, LayoutAnimation, Easing } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import {
  ProgressChart
} from 'react-native-chart-kit'
import { toInteger } from 'lodash'
import ProgressChartTwo from '../../../component/ProgressChartTwo'
import Color from '../../../utils/Color'

class SixMonthDataProgress extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { textTop, title, num1 = 0, num2, textTopFont, colorsStart = ['', ''], colorsEnd = ['', ''], num1Name, num2Name, num1V = 0, num2V = 0, type, dataType, baseData } = this.props

    // 诚信/违约还款次数百分比
    const paymentNum = (Math.floor(num2V * 100.0 / 100.0) / (Math.floor(num1V * 100.0 / 100.0) + Math.floor(num2V * 100.0 / 100.0))) * 100.0 || 0

    const baseDataV = num1V > baseData ? num1V : baseData
    return (
      <View style={{ backgroundColor: 'white', marginTop: dp(40), marginLeft: dp(30), width: (DEVICE_WIDTH - dp(90)) / 2, borderRadius: dp(16), paddingBottom: dp(45), overflow: 'hidden' }}>

        <View style={{ paddingHorizontal: dp(30), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(30) }}>
          <Text style={{ color: '#2D2926', fontSize: dp(28) }}>{title}</Text>
        </View>
        {this.renderSeparator()}
        <View style={{ alignItems: 'center', marginTop: type === 4 ? dp(-4) : (dataType === 4 ? dp(5) : 0) }}>
          {type === 2 && <ProgressChartTwo colorsStart={colorsStart} colorsEnd={colorsEnd} paymentNum={paymentNum } textTop={textTop} textBottom={`${paymentNum.toFixed(2)}%`} textTopFont={textTopFont} textBottomFont={dp(32)} strokeWidths={[dp(20), dp(20), dp(20), dp(40)]}/>}
          {type === 3 && <ProgressChart
            data={{
              labels: ['Swim'], // optional
              data: [dataType === 5 ? num1V / Math.floor(baseDataV) : num1V / 100.0],
              strokeLinecap: 'round',
              dataInit: [0.999, 0.00001],
              colors: [colorsStart, colorsEnd]
            }}
            width={dp(300)}
            height={dp(300)}
            strokeWidth={dp(10)}
            selectStrokeWidth={dp(20)}
            radius={dp(99)}
            chartConfig={ {
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
            }}
            hideLegend={true}
            withCustomBarColorFromData={true}
            hideCircle={true}
            hidePointer={true}
          />}
          {type === 4 && <ProgressChart
            data={{
              labels: ['Swim'], // optional
              data: [paymentNum / 100.0],
              strokeLinecap: 'butt',
              dataInit: [0.999, 0.00001],
              colors: [colorsStart, colorsEnd]
            }}
            width={dp(300)}
            height={dp(300)}
            strokeWidth={parseInt(dp(50))}
            selectStrokeWidth={parseInt(dp(50))}
            radius={parseInt(dp(86))}
            chartConfig={ {
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
            }}
            hideLegend={true}
            withCustomBarColorFromData={true}
          />}
        </View>
        {dataType !== 5 ? <View style={{ marginTop: dp(10), backgroundColor: '#F1F5FB', borderRadius: dp(10), marginHorizontal: dp(30), paddingVertical: dp(23) }}>
          <View style={{ paddingLeft: dp(30), flexDirection: 'row', alignItems: 'center', marginBottom: dp(20) }}>
            <View style={{ height: dp(17), width: dp(17), borderRadius: dp(17) / 2, backgroundColor: '#C3D5F5' }}/>
            <Text style={{ marginLeft: dp(10), color: '#91969A', fontSize: dp(24) }}>{num1Name}<Text style={{ color: '#91969A', fontSize: dp(28) }}>{num1}</Text></Text>
          </View>
          {num2 ? <View style={{ paddingLeft: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ height: dp(17), width: dp(17), borderRadius: dp(17) / 2, backgroundColor: colorsEnd[1] }}/>
            <Text style={{ marginLeft: dp(10), color: '#91969A', fontSize: dp(24) }}>{num2Name}<Text style={{ color: colorsEnd[1], fontSize: dp(28) }}>{num2}</Text></Text>
          </View> : null}
        </View> : <View style={{ paddingLeft: dp(30), marginTop: dp(10), backgroundColor: '#F1F5FB', borderRadius: dp(10), marginHorizontal: dp(30), paddingVertical: dp(26) }}>
          <Text style={{ color: '#91969A', fontSize: dp(26) }}>{num1Name}</Text>
          <Text style={{ marginTop: dp(20), color: colorsEnd[1], fontSize: dp(28) }}> {num1}</Text>
        </View>}
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
export default SixMonthDataProgress
