// 例子

// import ProgressChartTwoAngle from '../../component/ProgressChartTwoAngle'

// <ProgressChartTwoAngle colorsEndTop={['#2A6EE7', '#2A6EE7']} colorsEndBottom={['#EAEAF1', '#EAEAF1']} paymentNum={0.3 } showOneTextFont={dp(24)} showOneTextColor={''} text={'aaaa'} strokeWidths={[dp(20), dp(20), dp(20), dp(20)]} openAngle ={120} rotate={-30} openAngleData = {0.6} radius={dp(100)} widthBG = {dp(300)} heightBG = {dp(300)}/>

import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, LayoutAnimation, Easing } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../utils/screenUtil'
import {
  ProgressChart
} from 'react-native-chart-kit'

class ProgressChartTwoAngle extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    // colorsEndTop 可变进度条颜色背景
    // colorsEndBottom 不可变进度条颜色背景
    // rotate 进度条角度旋转
    // openAngle 开口角度
    // openAngleData 值
    // widthBG 圆的背景宽
    // heightBG 圆的背景高
    // radius 圆的半斤

    const { colorsEndTop = ['transparent', 'transparent'], colorsEndBottom = ['transparent', 'transparent'], strokeWidths = [0, 0, 0, 0], indexKey, rotate = -30, openAngle = 120, openAngleData = 0, widthBG = dp(300), heightBG = dp(300), radius = dp(100), showOneTextColor = '#2A6EE7', showOneTextFont = dp(100), text = '—— ——' } = this.props

    const openAngleV = openAngle === -1 ? 180 / 360 : (360 - openAngle) / 360
    const colorsStartTop = ['transparent', 'transparent']
    const colorsStartBottom = ['transparent', 'transparent']

    return (<View key={indexKey}>
      <ProgressChart
        data={{
          labels: ['Swim'], // optional
          data: [openAngleV], // 不满圆开合角度
          strokeLinecap: 'round', // 'butt' | 'square' | 'round'
          dataInit: [0.999, 0.00001],
          colors: [colorsStartBottom, colorsEndBottom], // 渐变色就传不一样的色值，非渐变色就一样的色值
          isRotate: rotate - 90// 不满圆旋转角度
        }}
        style={{ position: 'absolute' }}
        width={widthBG}
        height={heightBG}
        strokeWidth={strokeWidths[0]}
        selectStrokeWidth={strokeWidths[1]}
        radius={radius - dp(1)}// 圆的半径
        chartConfig={ {
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
        }}
        hideLegend={true}
        withCustomBarColorFromData={true}
        isRotate={true}
      />
      <ProgressChart
        data={{
          labels: ['Swim'], // optional
          data: [openAngleData * openAngleV],
          strokeLinecap: 'round', // 'butt' | 'square' | 'round'
          dataInit: [0.999, 0.00001],
          colors: [colorsStartTop, openAngleData.toString() === '0' ? ['transparent', 'transparent'] : colorsEndTop], // 渐变色就传不一样的色值，非渐变色就一样的色值
          isRotate: rotate - 90,
          showOneTextColor: showOneTextColor,
          showOneTextFont: showOneTextFont,
          showOneText: text
        }}
        width={widthBG}
        height={heightBG}
        radius={radius - dp(1)}// 圆的半径
        strokeWidth={strokeWidths[2]}
        selectStrokeWidth={strokeWidths[3]}
        chartConfig={ {
          backgroundGradientFrom: 'white',
          backgroundGradientTo: 'white',
          color: (opacity = 1) => `rgba(227, 236, 251, ${1})`
        }}
        hideLegend={true}
        withCustomBarColorFromData={true}
        isRotate={true}
        isShowOneText={true}
      />
    </View>

    )
  }
}

export default ProgressChartTwoAngle
