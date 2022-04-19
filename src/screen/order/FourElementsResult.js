import React, { Component } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Iconfont from '../../iconfont/Icon'
import { getRealDP as dp } from '../../utils/screenUtil'

export default class FourElementsResult extends Component {
  constructor(props) {
    super(props)

    this.state = {
      second: 5,
      result: false,
      reason: '未知错误',
      fundSource: '',
      businessType: '4',
    }
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state
    if (params) {
      await this.setState({
        result: params.result || false,
        reason: params.reason || '未知错误',
        fundSource: params.fundSource || '',
        businessType: params.businessType || '4',
      })
    }

    if (params.result) this.coutDown()
  }

  coutDown() {
    this.timer = setInterval(() => {
      const newSecond = --this.state.second
      if (newSecond <= 0) {
        clearInterval(this.timer)
        this.tapBackOrder()
      } else {
        this.setState({
          second: newSecond,
        })
      }
    }, 1000)
  }

  tapBackOrder = () => {
    clearInterval(this.timer)
    this.props.navigation.navigate('Order', { businessType: this.state.businessType })
  }

  tapBackOrderConfirm = () => {
    Alert.alert(
      '是否返回订单列表',
      '返回后，系统将不保存此次创建的订单内容。',
      [
        { text: '取消', onDismiss: () => {}, style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            this.props.navigation.navigate('Order', { businessType: this.state.businessType })
          },
        },
      ],
      { cancelable: false },
    )
  }

  tapAuthAgain = () => {
    // const urlMap = {
    //   1: '/customerPages/pages/erji_fourElements/erji_fourElements?from=orderCreate',
    //   4: '/customerPages/pages/erji_fourElementsByNanJing/erji_fourElementsByNanJing?from=orderCreate'
    // }
    const fundSource = this.state.fundSource
    if (fundSource === '1') {
      // fourElements
      this.props.navigation.navigate('FourElements', { from: 'orderCreate', refresh: true })
    } else if (fundSource === '4') {
      // fourElementsByNanJing
      this.props.navigation.navigate('FourElementsByNanJing', { from: 'orderCreate' })
    }
  }

  renderSuccess() {
    return (
      <View style={styles.content}>
        <Iconfont style={styles.icon} name={'icon-result-success1'} size={dp(200)} />
        <Text style={styles.title}> 四要素鉴权成功！</Text>
        <Text style={styles.text}>等待一级确认订单，</Text>
        <Text style={[styles.text, { marginTop: dp(10) }]}>{`${this.state.second}秒后自动跳转到订单列表`}</Text>
        <SolidBtn onPress={this.tapBackOrder} style={{ marginTop: dp(60) }} text={'返回订单列表'} />
      </View>
    )
  }

  renderFailed() {
    return (
      <View style={styles.content}>
        <Iconfont style={styles.icon} name={'icon-warn'} size={dp(200)} />
        <Text style={styles.title}>四要素鉴权失败</Text>
        <Text style={styles.text}>{`失败原因：${this.state.reason}`}</Text>
        <SolidBtn onPress={this.tapAuthAgain} style={{ marginTop: dp(60) }} text={'重新鉴权'} />
        <StrokeBtn onPress={this.tapBackOrderConfirm} style={{ marginTop: dp(30) }} text={'返回订单列表'} />
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'四要素鉴权'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          {this.state.result ? this.renderSuccess() : this.renderFailed()}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4',
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#f0f0f0',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginTop: dp(100),
  },
  title: {
    fontSize: dp(35),
    marginTop: dp(40),
  },
  text: {
    fontSize: dp(28),
    color: '#777777',
    marginTop: dp(30),
  },
})
