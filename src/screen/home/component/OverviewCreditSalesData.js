import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount, showToast, toAmountStr } from '../../../utils/Utility'
import { connect } from 'react-redux'

@injectUnmount
class OverviewCreditSalesData extends PureComponent {
  static defaultProps = {
    navigation: {}
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    const { navigation, companyInfo, userInfo, themeColor, title, money, YoY, MoM } = this.props
    return (<View style={{
      backgroundColor: 'white',
      // height: dp(372),
      marginHorizontal: dp(30),
      marginTop: dp(30),
      borderRadius: dp(16)
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: dp(30), marginTop: dp(40) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {YoY ? <Text style={{ color: YoY < 0 ? Color.GREEN_BTN : '#F55849', fontSize: dp(24) }}>{YoY < 0 ? -YoY : YoY}%<Text style={{ color: '#A7ADB0', fontSize: dp(24) }}>同比</Text></Text> : <Text style={{ color: '#F55849', fontSize: dp(24) }}>0%<Text style={{ color: '#A7ADB0', fontSize: dp(24) }}>同比</Text></Text>}
          {MoM ? <Text style={{ color: MoM < 0 ? Color.GREEN_BTN : '#F55849', fontSize: dp(24) }}>     {MoM < 0 ? -MoM : MoM}%<Text style={{ color: '#A7ADB0', fontSize: dp(24) }}>环比</Text></Text> : <Text style={{ color: '#F55849', fontSize: dp(24) }}>     0%<Text style={{ color: '#A7ADB0', fontSize: dp(24) }}>环比</Text></Text>}
        </View>
        <Text style={{ color: '#2D2926', fontSize: dp(28), fontWeight: 'bold' }}>{title}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{
          color: '#2D2926',
          fontSize: dp(28),
          fontWeight: 'bold',
          marginVertical: dp(15),
          marginRight: dp(30)
        }}>{money}</Text>
      </View>
      {/* <LineChart
        data={{
          labels: ['1', '2', '3', '4', '5', '6'],
          datasets: [
            {
              data: [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100
              ]
            }
          ]
        }}
        width={DEVICE_WIDTH - dp(90)} // from react-native
        height={dp(240)}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1} // optional, defaults to 1
        xLabelsOffset={-dp(20)}
        chartConfig={{
          backgroundColor: '',
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          fillShadowGradient: 'white', // 数据下区域的颜色
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(70, 70, 120, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(1, 1, 1, ${opacity})`,
          style: {
            borderRadius: 0
          },
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: '#464678'
          }
        }}
        bezier
        style={{
          marginTop: dp(40),
          borderRadius: 0,
          marginBottom: dp(20)
          // marginLeft: dp(-40)
        }}
      /> */}
    </View>
    )
  }
}

const styles = StyleSheet.create({
  loanInfoMain: {
  },
  title1Style: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    marginTop: dp(120),
    marginLeft: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5',
    marginTop: dp(120),
    marginRight: dp(30)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(OverviewCreditSalesData)
