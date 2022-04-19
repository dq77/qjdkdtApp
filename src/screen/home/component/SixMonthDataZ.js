
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import {
  getCSContractList
} from '../../../actions'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import { processStatus } from '../../../utils/enums'
import { webUrl } from '../../../utils/config'
import { getTimeDifference } from '../../../utils/DateUtils'
import { onEvent } from '../../../utils/AnalyticsUtil'
import Iconfont from '../../../iconfont/Icon'
import {
  LineChart
} from 'react-native-chart-kit'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { toInteger } from 'lodash'

class SixMonthDataZ extends PureComponent {
  static defaultProps = {
    repaymentPercentage: 0
  }

  static propTypes = {
    repaymentPercentage: PropTypes.number.isRequired
  }

  static getDerivedStateFromProps (nextProps, prevPros) {
    return {
      repaymentPercentage: nextProps.repaymentPercentage
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      comfirmText: '取消'

    }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    // type 1. 曲线图  2.圆圈图
    // dataType 1. 赊销/免服务费笔数  2.赊销/出货额度  3.诚信/违约还款次数 5.平均赊销账期
    // num3   免服务费期内还款 \已完结的赊销笔数
    // num4   超出免服务器还款  \未完结的赊销笔数
    const { navigation, title1, type, creditSaleInfo = [], dataType, num3, num4 } = this.props
    let x = []
    const y = []
    const y1 = []
    const y2 = []
    const maxY = '' // 当前最大的y
    const maxY1 = '' // 当前最大的y
    const maxY2 = '' // 当前最大的y
    let unit = ''// 当前y轴单位

    if (title1 === '本月') {
      x = ['01', '', '', '', '', '05', '', '', '', '', '10', '', '', '', '', '15', '', '', '', '', '20', '', '', '', '', '25', '', '', '', '']

      y.push({
        data: ['2.7', '3.5', '3.8', '4.3', '2.2', '1.1', '2.3', '2.6', '3.1', '1.2', '1.7', '2.1', '3.0', '2.2', '1.6', '1.2', '1.9', '2.3', '2.1', '1.9', '1.4', '3.2', '2.2', '3.6', '3.7', '1.2', '2.2', '3.3', '1.2'],
        color: (opacity = 1) => 'rgba(172, 136, 100, 1)'
      })
      unit = '千'
    } else if (title1 === '本季度') {
      x = ['10', '11', '12']

      y.push({
        data: ['2.37', '2.11', '1.87'],
        color: (opacity = 1) => 'rgba(172, 136, 100, 1)'
      })
      unit = '十万'
    } else {
      x = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

      y.push({
        data: ['3.1', '1.3', '1.5', '3.6', '2.3', '2.8', '6.1', '1.5', '4.1', '2.3', '7.4', '2.3'],
        color: (opacity = 1) => 'rgba(172, 136, 100, 1)'
      })
      unit = '千万'
    }

    // if (title1 === '本月') {
    // x = ['01', '', '', '', '', '05', '', '', '', '', '10', '', '', '', '', '15', '', '', '', '', '20', '', '', '', '', '25', '', '', '', '']
    // y = [11, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
    // } else if (title1 === '本季度') {

    // } else {

    // }
    // creditSaleInfo.forEach((item, index) => {
    // if (index % 2 !== 0) {
    //   x.push(item.calcMonth)
    // } else {
    //   x.push('')
    // }
    // if (title1 === '本月') {
    //   x = ['01', '', '', '', '', '05', '', '', '', '', '10', '', '', '', '', '15', '', '', '', '', '20', '', '', '', '', '25', '', '', '', '']
    //   y = ['01', '', '', '', '', '05', '', '', '', '', '10', '', '', '', '', '15', '', '', '', '', '20', '', '', '', '', '25', '', '', '', '']
    // } else if (title1 === '本季度') {

    // } else {

    // }

    //   switch (dataType) {
    //     case 1:
    //       y1.push(item.creditSaleCount)// item.creditSaleCount
    //       y2.push(item.freeServiceCount)
    //       maxY1 = maxY1 > item.creditSaleCount ? maxY1 : item.creditSaleCount
    //       maxY2 = maxY2 > item.freeServiceCount ? maxY2 : item.freeServiceCount
    //       break
    //     case 2:
    //       y1.push(item.creditSaleAmount)
    //       y2.push(item.shipmentAmount)
    //       maxY1 = maxY1 > item.creditSaleAmount ? maxY1 : item.creditSaleAmount
    //       maxY2 = maxY2 > item.shipmentAmount ? maxY2 : item.shipmentAmount
    //       break
    //     case 3:
    //       y1.push(item.normalRepaymentCount)
    //       y2.push(item.unnormalRepaymentCount)
    //       maxY1 = maxY1 > item.normalRepaymentCount ? maxY1 : item.normalRepaymentCount
    //       maxY2 = maxY2 > item.unnormalRepaymentCount ? maxY2 : item.unnormalRepaymentCount
    //       break
    //     case 5:
    //       y1.push(toInteger(item.averageAccountPeriod))
    //       break
    //     default:
    //       break
    //   }
    // })
    // maxY = maxY1 > maxY2 ? maxY1 : maxY2
    // unit = maxY >= 100000000000 ? '千亿' : maxY >= 10000000000 ? '百亿' : maxY >= 1000000000 ? '十亿' : maxY >= 100000000 ? '亿' : maxY >= 10000000 ? '千万' : maxY >= 1000000 ? '百万' : maxY >= 100000 ? '十万' : maxY >= 10000 ? '万' : maxY >= 1000 ? '千' : ''
    // const unitV = maxY >= 100000000000 ? 100000000000 : maxY >= 10000000000 ? 10000000000 : maxY >= 1000000000 ? 1000000000 : maxY >= 100000000 ? 100000000 : maxY >= 10000000 ? 10000000 : maxY >= 1000000 ? 1000000 : maxY >= 100000 ? 100000 : maxY >= 10000 ? 10000 : maxY >= 1000 ? 1000 : 1

    // const y11 = []
    // y1.forEach(element => {
    //   y11.push(element / unitV)
    // })

    // const y12 = []
    // y2.forEach(element => {
    //   y12.push(element / unitV)
    // })
    // console.log(y1, y2, y11, y12, 'y12y12')
    // y.push({
    //   data: y11,
    //   color: (opacity = 1) => `rgba(70, 70, 120, ${opacity})`
    // })
    // if (dataType === 1 || dataType === 2 || dataType === 3) {
    //   y.push({
    //     data: y11,
    //     color: (opacity = 1) => `rgba(70, 70, 120, ${opacity})`
    //   })
    //   y.push({
    //     data: y12,
    //     color: (opacity = 1) => `rgba(211, 182, 133, ${opacity})`
    //   })
    // } else if (dataType === 5) {
    //   y.push({
    //     data: y11,
    //     color: (opacity = 1) => `rgba(70, 70, 120, ${opacity})`
    //   })
    // }
    return (
      <View style={{
        borderRadius: dp(16),
        paddingBottom: dp(30),
        overflow: 'hidden',
        backgroundColor: type === 1 ? 'white' : 'clear'
      }}>
        {type === 1 ? ((x.length > 0 && y.length > 0) ? <LineChart
          data={{
            labels: x,
            datasets: y
          }}
          width={DEVICE_WIDTH - dp(90)} // from react-native
          height={dp(300)}
          yAxisLabel=""
          yAxisSuffix={unit}
          yAxisInterval={1} // optional, defaults to 1
          xLabelsOffset={-dp(20)}
          // fromZero={true}
          chartConfig={{
            strokeWidth: dp(4),
            backgroundColor: 'white',
            backgroundGradientFrom: 'white',
            backgroundGradientTo: 'white',
            fillShadowGradient: '#AC8864', // 数据下区域的颜色
            fillShadowGradientOpacity: 0.7,
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1, index) => `rgba(70, 70, 120, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(1, 1, 1, ${opacity})`,
            style: {
              borderRadius: 0
            },
            propsForDots: {
              r: '3',
              strokeWidth: '0'
              // stroke: '#464678'
            }
          }}
          bezier
          style={{
            marginTop: dp(30),
            borderRadius: 0,
            marginLeft: dp(0)
          }}
        /> : null)
          : <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'clear'
          }}>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'clear'
            }}>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: dp(16),
                backgroundColor: 'white',
                width: dp(330),
                height: dp(520)
              }}>
                <View style={{
                  width: dp(330)
                }}>
                  <View style={{
                    borderRadius: dp(9),
                    backgroundColor: '#CDAA74',
                    width: dp(18),
                    height: dp(18),
                    marginLeft: dp(20)
                  }}></View>
                </View>
                <AnimatedCircularProgress
                  rotation={0}
                  style={styles.progress}
                  size={dp(250)}
                  width={dp(20)}
                  fill={96.4}
                  tintColor={'#D3B685'}
                  lineCap={'round'}
                  backgroundColor={'#DDDDE8'}>
                  {(fill) => (
                    <Text style={styles.progressText}>{'96.4%'}</Text>
                  )}
                </AnimatedCircularProgress>
                <Text style={{ color: '#A7ADB0', fontSize: dp(28) }}>宜宾业务</Text>
                <Text style={{ color: '#2D2926', fontSize: dp(28), marginTop: dp(10) }}>3,864,529.23</Text>
                <Text style={{ color: '#A7ADB0', fontSize: dp(28), marginTop: dp(10) }}>宜宾目标</Text>
                <Text style={{ color: '#2D2926', fontSize: dp(28), marginTop: dp(10) }}>4,000,000.00</Text>
              </View>
            </View>

            <View style={{
              borderRadius: dp(16)
            }}>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: dp(16),
                backgroundColor: 'white',
                width: dp(330),
                height: dp(520)
              }}>
                <View style={{
                  width: dp(330)
                }}>
                  <View style={{
                    borderRadius: dp(9),
                    backgroundColor: '#464678',
                    width: dp(18),
                    height: dp(18),
                    marginLeft: dp(20)
                  }}></View>
                </View>
                <AnimatedCircularProgress
                  rotation={0}
                  style={styles.progress}
                  size={dp(250)}
                  width={dp(20)}
                  fill={83.4}
                  tintColor={'#464678'}
                  lineCap={'round'}
                  backgroundColor={'#DDDDE8'}>
                  {(fill) => (
                    <Text style={styles.progressText}>{'83.4%'}</Text>
                  )}
                </AnimatedCircularProgress>
                <Text style={{ color: '#A7ADB0', fontSize: dp(28) }}>工程采业务</Text>
                <Text style={{ color: '#2D2926', fontSize: dp(28), marginTop: dp(10) }}>8346,935.76</Text>
                <Text style={{ color: '#A7ADB0', fontSize: dp(28), marginTop: dp(10) }}>工程采目标</Text>
                <Text style={{ color: '#2D2926', fontSize: dp(28), marginTop: dp(10) }}>10,000,000.00</Text>
              </View>
            </View>
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
    marginHorizontal: dp(30),
    marginTop: dp(10),
    marginBottom: dp(36)
  },
  progressText: {
    textAlign: 'center',
    fontSize: dp(24)
    // transform: [{ scaleX: -1 }]
  }
})

export default SixMonthDataZ
