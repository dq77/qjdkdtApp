
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, LayoutAnimation, UIManager } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import {
  LineChart,
  BarChart
} from 'react-native-chart-kit'
import {
  Svg, Rect, G, Defs, Text as TextSvg, LinearGradient, Stop
} from 'react-native-svg'
import { toInteger } from 'lodash'

let dataList1 = []
let dataList2 = []
class SixMonthData extends PureComponent {
  constructor (props) {
    super(props)
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
    this.state = {
      comfirmText: '取消',
      isShowNum: 0,
      moveTo: 0,
      customLinear: {
        duration: 200,
        create: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.opacity
        },
        update: {
          type: LayoutAnimation.Types.linear
        }
      },
      absV1: 0,
      absV2: 0
    }
    // LayoutAnimation.configureNext(this.state.customLinear)
    this._gestureHandlers = {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderMove: (evt) => {
        this.moveAddress(evt)
      },
      onResponderGrant: (evt) => {
        this.moveAddress(evt)
      }
    }
  }

  componentWillUpdate () { // 当视图 发生变化时候的回调
    // ToastAndroid.show('componentWillUpdate...',ToastAndroid.SHORT);
    LayoutAnimation.configureNext(this.state.customLinear)
  }

  async moveAddress (evt) {
    const nativeEventX = evt.nativeEvent.locationX
    let proportion = 0
    let absV1 = 0
    let absV2 = 0
    const { type } = this.props
    if (type === 1) {
      console.log(dataList1, 'y1-y2')
      if (nativeEventX < dp(80)) {
        proportion = 0
      } else if (nativeEventX > dp(80) * 5) {
        proportion = 5
      } else {
        proportion = parseInt(nativeEventX / dp(80))
      }
      await this.setState({
        moveTo: dataList1[proportion].x - dp(54),
        isShowNum: proportion + 1
      })
      if (dataList1.length > 6) {
        const y1 = dataList1[proportion].y - dp(25)
        const y2 = dataList1[proportion + 6].y - dp(25)
        console.log('444', dataList1[proportion].x)
        if (y1 >= y2) {
          const y1y2 = y1 - y2
          absV1 = y1
          absV2 = y1y2 < dp(35) ? (y2 - dp(35) + y1y2) : y2
          console.log('111', y1y2)
        } else {
          const y1y2 = y2 - y1
          absV1 = y1y2 < dp(35) ? (y1 - dp(35) + y1y2) : y1
          absV2 = y2
          console.log('222', y1y2)
        }
        if (absV1 <= dp(50) && absV2 <= dp(50)) {
          const y1y2 = y1 - y2
          absV1 = absV1 + dp(50) - y1y2
          absV2 = absV2 + dp(30) - y1y2
        }
        if ((absV1 + dp(35)) > (dp(347) - dp(35) / 2) || (absV2 + dp(35)) > (dp(347) - dp(35) / 2)) {
          absV1 = absV1 - (dp(35) / 2)
          absV2 = absV2 - (dp(35) / 2)
          console.log('2')
        }
      } else {
        const y1 = dataList1[proportion].y - dp(25)
        absV1 = y1
      }
    } else if (type === 3) {
      if (nativeEventX < dp(90)) {
        proportion = 0
      } else if (nativeEventX > dp(90) * 5) {
        proportion = 5
      } else {
        proportion = parseInt(nativeEventX / dp(90))
      }

      await this.setState({
        moveTo: dataList2[proportion].x - dp(54),
        isShowNum: proportion + 1
      })
      const y1 = dataList2[proportion].y - dp(110)
      const y2 = dataList2[proportion + 6].y - dp(110)
      console.log('444', dataList2[proportion].x)
      if (y1 >= y2) {
        const y1y2 = y1 - y2
        absV1 = y1 + (dp(35) / 2)
        absV2 = y1y2 < dp(35) ? (y2 - dp(35) + y1y2) + (dp(35) / 2) : y2 + (dp(35) / 2)
        console.log('111', y1y2)
      } else {
        const y1y2 = y2 - y1
        absV1 = y1y2 < dp(35) ? (y1 - dp(35) + y1y2) + (dp(35) / 2) : y1 + (dp(35) / 2)
        absV2 = y2 + (dp(35) / 2)
        console.log('222', y1y2)
      }
      if (absV1 <= dp(50) && absV2 <= dp(50)) {
        const y1y2 = y1 - y2
        absV1 = absV1 + dp(50)
        absV2 = absV2 + dp(30) - y1y2
      }
      if ((absV1 + dp(35)) > (dp(347) - dp(35) / 2) || (absV2 + dp(35)) > (dp(347) - dp(35) / 2)) {
        absV1 = absV1 - (dp(35) / 2)
        absV2 = absV2 - (dp(35) / 2)
        console.log('444a')
      }
    }
    console.log(this.state.moveTo, 'moveTo')
    // console.log(dataList)
    this.setState({
      absV1,
      absV2
    })
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    // type 1. 曲线图  2.圆圈图
    // dataType 1. 赊销/免服务费笔数  2.赊销/出货额度  3.诚信/违约还款次数 5.平均赊销账期
    // num3   免服务费期内还款 \已完结的赊销笔数
    // num4   超出免服务器还款  \未完结的赊销笔数
    const { navigation, title, num1, num2, type, creditSaleInfo = [], dataType, num1Name, num2Name, num1V = 0, num2V = 0 } = this.props

    const { isShowNum, absV1, absV2 } = this.state
    const x = []
    const y = []
    const y1 = []
    const y2 = []
    let maxY = 0 // 当前最大的y
    let maxY1 = 0 // 当前最大的y
    let maxY2 = 0 // 当前最大的y
    let unit = ''// 当前y轴单位

    creditSaleInfo.forEach((item, index) => {
      // if (index % 2 !== 0) {
      //   x.push(item.calcMonth)
      // } else {
      //   x.push('')
      // }
      const aa = item.calcMonth.toString()
      var disLength = aa.length
      var shortName = aa.substring(disLength - 2, disLength)

      x.push(`${shortName}月`)
      switch (dataType) {
        case 1:
          y1.push(item.creditSaleCount)// item.creditSaleCount
          y2.push(item.freeServiceCount)
          maxY1 = maxY1 > item.creditSaleCount ? maxY1 : item.creditSaleCount
          maxY2 = maxY2 > item.freeServiceCount ? maxY2 : item.freeServiceCount
          break
        case 2:
          y1.push(item.creditSaleAmount)
          y2.push(item.shipmentAmount)
          maxY1 = maxY1 > item.creditSaleAmount ? maxY1 : item.creditSaleAmount
          maxY2 = maxY2 > item.shipmentAmount ? maxY2 : item.shipmentAmount
          break
        case 3:
          y1.push(item.normalRepaymentCount)
          y2.push(item.unnormalRepaymentCount)
          maxY1 = maxY1 > item.normalRepaymentCount ? maxY1 : item.normalRepaymentCount
          maxY2 = maxY2 > item.unnormalRepaymentCount ? maxY2 : item.unnormalRepaymentCount
          break
        case 5:
          y1.push(toInteger(item.shipmentAmount))
          maxY1 = maxY1 > item.shipmentAmount ? maxY1 : item.shipmentAmount
          break
        default:
          break
      }
    })
    maxY = maxY1 > maxY2 ? maxY1 : maxY2
    unit = maxY >= 100000000000 ? '千亿' : maxY >= 10000000000 ? '百亿' : maxY >= 1000000000 ? '十亿' : maxY >= 100000000 ? '亿' : maxY >= 10000000 ? '千万' : maxY >= 1000000 ? '百万' : maxY >= 100000 ? '十万' : maxY >= 10000 ? '万' : maxY >= 1000 ? '千' : maxY >= 100 ? '百' : maxY >= 10 ? '十' : ''
    const unitV = maxY >= 100000000000 ? 100000000000 : maxY >= 10000000000 ? 10000000000 : maxY >= 1000000000 ? 1000000000 : maxY >= 100000000 ? 100000000 : maxY >= 10000000 ? 10000000 : maxY >= 1000000 ? 1000000 : maxY >= 100000 ? 100000 : maxY >= 10000 ? 10000 : maxY >= 1000 ? 1000 : maxY >= 100 ? 100 : maxY >= 10 ? 10 : 1

    const y11 = []
    y1.forEach(element => {
      y11.push((element / unitV).toFixed(2))
    })

    const y12 = []
    let isZero = ''
    y2.forEach(element => {
      y12.push((element / unitV).toFixed(2))
    })
    if (dataType === 1 || dataType === 2 || dataType === 3) {
      if (Math.min.apply(Math, y11) === Math.max.apply(Math, y11) && Math.min.apply(Math, y12) === Math.max.apply(Math, y12) && Math.max.apply(Math, y11) === 0 && Math.max.apply(Math, y12) === 0) {
        isZero = '1'
      }
      y.push({
        data: y11,
        color: (opacity = 1) => `rgba(42, 110, 231, ${opacity})`
      })
      y.push({
        data: y12,
        color: (opacity = 1) => `rgba(119, 109, 219, ${opacity})`
      })
    } else if (dataType === 5) {
      if (Math.min.apply(Math, y11) === Math.max.apply(Math, y11) && Math.max.apply(Math, y11) === 0) {
        isZero = '1'
      }
      y.push({
        data: y11,
        color: (opacity = 1) => `rgba(42, 110, 231, ${opacity})`
      })
    }

    // 单位
    const unitA = dataType === 1 ? `${unit}笔` : dataType === 2 ? `${unit}元` : dataType === 3 ? '次' : dataType === 4 ? '笔' : dataType === 5 ? `${unit}元` : '笔'

    const num1Unit = dataType === 1 ? '笔' : '万元'

    return (
      <View style={{ backgroundColor: 'white', marginTop: dp(40), marginHorizontal: dp(30), borderRadius: dp(16), paddingBottom: dp(30), overflow: 'hidden' }}>

        <View style={{ paddingHorizontal: dp(30), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: dp(40) }}>
          <Text style={{ color: dataType === 5 ? '#91969A' : '#2D2926', fontSize: dataType === 5 ? dp(26) : dp(28), fontWeight: dataType === 5 ? 'normal' : 'bold' }}>{title}</Text>
        </View>
        <View style={{ marginTop: dp(20) }}>
          {dataType === 5 ? <Text style={{ color: '#2D2926', fontSize: dp(48), marginLeft: dp(30), fontWeight: '500' }}>{num1}万元</Text> : <View style={{ paddingLeft: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ height: dp(12), width: dp(12), borderRadius: dp(6), backgroundColor: '#2A6EE7' }}/>
            <Text style={{ marginLeft: dp(8), color: '#91969A', fontSize: dp(26) }}>{num1Name}<Text style={{ color: '#2D2926', fontSize: dp(28) }}>{num1}{num1Unit}</Text></Text>
          </View>}
          {num2 ? <View style={{ paddingLeft: dp(30), marginTop: dp(20), flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ height: dp(12), width: dp(12), borderRadius: dp(6), backgroundColor: '#776DDB' }}/>
            <Text style={{ marginLeft: dp(8), color: '#91969A', fontSize: dp(26) }}>{num2Name}<Text style={{ color: '#2D2926', fontSize: dp(28) }}>{num2}{num1Unit}</Text></Text>
          </View> : null}
        </View>
        {type === 1 ? ((x.length > 0 && y.length > 0 && creditSaleInfo.length > 0) ? <View>
          <LineChart
            data={{
              labels: x,
              datasets: y
            }}
            width={DEVICE_WIDTH - dp(90)} // from react-native
            height={dp(332)}
            yAxisLabel=""
            // yAxisSuffix={unit}
            yAxisInterval={1} // optional, defaults to 1
            xLabelsOffset={-dp(5)}
            withVerticalLines={false}
            isShowLine={isZero !== '1'}
            chartConfig={{
              propsForBackgroundLines: {
                stroke: '#E7EDFF',
                strokeWidth: '0.5',
                strokeDasharray: '3, 2'
              },
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              fillShadowGradient: '#2A6EE7', // 数据下区域的颜色
              fillShadowGradientOpacity: 0.68,
              useShadowColorFromDataset: 'true',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1, index) => `rgba(70, 70, 120, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(167, 173, 176, ${opacity})`,
              style: {
                borderRadius: 0
              },
              propsForDots: {
                r: '0',
                strokeWidth: '0'
              // stroke: '#464678'
              }
            }}
            bezier
            style={{
              marginTop: dp(30),
              borderRadius: 0,
              marginLeft: dp(-10),
              paddingBottom: dp(15)
            }}
            moveTo={this.state.moveTo}
            decorator={() => {
              return isShowNum !== 0 && isZero !== '1' && <View style={{
                marginLeft: this.state.moveTo,
                backgroundColor: 'transparent',
                width: dp(180)
              }}>
                <Svg>
                  { /* 背景颜色 */ }
                  <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor="#EEEEEE" stopOpacity="0" />
                      <Stop offset="1" stopColor="#E0E8EC" stopOpacity="0.5" />
                    </LinearGradient>
                  </Defs>
                  <Rect rx={dp(28)} width={dp(108)} height={dp(347)} fill="url(#grad)"/>
                  {/* 底部月份 */}
                  <Rect rx={dp(22)} x={dp(9)} y={dp(295)} width={dp(90)} height={dp(44)} fill="white">
                  </Rect>
                  <TextSvg x={dp(29)} y={dp(325)} fill="#2D2926" fontSize={dp(24)}>{x[isShowNum - 1]}</TextSvg>
                  {/* 圆点 */}
                  <Rect rx={dp(10)} x={dp(44)} y={dataList1[isShowNum - 1].y - dp(10)} width={dp(20)} height={dp(20)} fill="white" strokeLinecap="round" strokeWidth={dp(4)} stroke='#2A6EE7'>
                  </Rect>
                  {dataList1.length > 6 && <Rect rx={dp(10)} x={dp(44)} y={dataList1[isShowNum - 1 + 6].y - dp(10)} width={dp(20)} height={dp(20)} fill="white" strokeLinecap="round" strokeWidth={dp(4)} stroke='#776DDB'>
                  </Rect>}
                  {/* 圆点提示框 */}
                  <Rect rx={dp(8)} x={dp(68)} y={absV1} width={dp(65)} height={dp(35)} fill="white" strokeLinecap="round" strokeWidth={dp(1)} stroke={Color.SPLIT_LINE}/>
                  <TextSvg x={dp(73)} y={absV1 + dp(25)} fill="#2D2926" fontSize={dp(20)}>{dataList1[isShowNum - 1].indexData}</TextSvg>

                  {dataList1.length > 6 && <Rect rx={dp(8)} x={dp(68)} y={absV2} width={dp(65)} height={dp(35)} fill="white" strokeLinecap="round" strokeWidth={dp(1)} stroke={Color.SPLIT_LINE}/>}
                  {dataList1.length > 6 && <TextSvg x={dp(73)} y={absV2 + dp(25)} fill="#2D2926" fontSize={dp(20)}>{dataList1[isShowNum - 1 + 6].indexData}</TextSvg>}

                </Svg>
              </View>
            }}
            renderDotContent={(data) => {
              dataList1 = data
            }}
          />
          <View style={{
            marginTop: 0,
            marginLeft: dp(120),
            width: dp(85) * 6,
            height: dp(372),
            position: 'absolute',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center'
          }} {...this._gestureHandlers}>
            {isZero === '1' && <Text style={{
              fontSize: dp(28),
              color: Color.TEXT_LIGHT
            }} >最近六个月暂无数据</Text>}
          </View>
          <Text style={{ color: '#91969A', fontSize: dp(14), marginTop: dp(340), marginLeft: dp(40), position: 'absolute' }}>单位：{unitA}</Text>
        </View> : null)
          : ((x.length > 0 && y.length > 0 && creditSaleInfo.length > 0) ? <View >
            <BarChart
              data={{
                labels: x,
                datasets: y
              }}
              fromZero={true}
              width={DEVICE_WIDTH - dp(60)} // from react-native
              height={dp(332)}
              showBarTops={false}
              withCustomBarColorFromData={true}
              chartConfig={{
                propsForBackgroundLines: {
                  stroke: '#E7EDFF',
                  strokeWidth: '0.5',
                  strokeDasharray: '3, 2'
                },
                backgroundGradientFrom: 'white',
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: 'white',
                backgroundGradientToOpacity: 1,
                color: (opacity = 1, index) => `rgba(70, 70, 120, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(167, 173, 176, ${opacity})`,
                strokeWidth: 2, // optional, default 3
                useShadowColorFromDataset: false // optional
              }}
              style={{
                marginTop: dp(30),
                borderRadius: 0,
                marginLeft: dp(-10),
                paddingBottom: dp(15)
              }}
              decorator={() => {
                return isShowNum !== 0 && isZero !== '1' && <View style= {{
                  marginLeft: this.state.moveTo,
                  backgroundColor: 'transparent',
                  width: dp(180)
                }}>
                  <Svg >
                    { /* 背景颜色 */ }
                    <Defs>
                      <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#EEEEEE" stopOpacity="0" />
                        <Stop offset="1" stopColor="#E0E8EC" stopOpacity="1" />
                      </LinearGradient>
                    </Defs>
                    <Rect rx={dp(28)} width={dp(108)} height={dp(347)} fill="url(#grad)"/>
                    {/* 底部月份 */}
                    <Rect rx={dp(22)} x={dp(9)} y={dp(295)} width={dp(90)} height={dp(44)} fill="white">
                    </Rect>
                    <TextSvg x={dp(29)} y={dp(325)} fill="#2D2926" fontSize={dp(24)}>{x[isShowNum - 1]}</TextSvg>

                    {/* 圆点提示框 */}
                    <Rect rx={dp(8)} x={dp(10)} y={absV1} width={dp(65)} height={dp(35)} fill="white" strokeLinecap="round" strokeWidth={dp(1)} stroke={Color.SPLIT_LINE}/>
                    <TextSvg x={dp(23)} y={absV1 + dp(25)} fill="#2D2926" fontSize={dp(20)}>{dataList2[isShowNum - 1].indexData}</TextSvg>

                    <Rect rx={dp(8)} x={dp(40)} y={absV2} width={dp(65)} height={dp(35)} fill="white" strokeLinecap="round" strokeWidth={dp(1)} stroke={Color.SPLIT_LINE}/>
                    <TextSvg x={dp(48)} y={absV2 + dp(25)} fill="#2D2926" fontSize={dp(20)}>{dataList2[isShowNum - 1 + 6].indexData}</TextSvg>

                  </Svg>
                </View>
              }}
              renderDotContent={(data) => {
                dataList2 = [data[0], data[2], data[4], data[6], data[8], data[10], data[1], data[3], data[5], data[7], data[9], data[11]]
                console.log(dataList2, 'datadata33333')
              }}
            />
            <View style={{
              marginTop: 0,
              marginLeft: dp(120),
              width: dp(90) * 6,
              height: dp(372),
              // backgroundColor: 'red',
              // opacity: 0.3,
              position: 'absolute',
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center'
            }} {...this._gestureHandlers}>
              {isZero === '1' && <Text style={{
                fontSize: dp(28),
                color: Color.TEXT_LIGHT
              }} >最近六个月暂无数据</Text>}
            </View>
            <Text style={{ color: '#91969A', fontSize: dp(14), marginTop: dp(340), marginLeft: dp(40), position: 'absolute' }}>单位：{unitA}</Text>
          </View> : null)

        }

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
    marginHorizontal: dp(30)
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

export default SixMonthData
