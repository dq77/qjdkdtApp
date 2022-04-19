import React, { Component } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  getRealDP as dp
} from '../utils/screenUtil'
import Iconfont from '../iconfont/Icon'
import Color from '../utils/Color'

class LoadingView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isShowLoading: false,
      loadingText: '',
      icon: 'icon-signed'
    }
  }

  async show (text) {
    await this.setState({
      isShowLoading: true,
      loadingText: text || '加载中',
      icon: ''
    })
  }

  async showSuccess (text, callback, icon = 'duihaocheckmark17') {
    await this.setState({
      isShowLoading: true,
      loadingText: text || '成功',
      icon: icon || 'duihaocheckmark17'
    })
    this.timer = setTimeout(() => {
      this.setState({
        isShowLoading: false
      })
      this.timer && clearTimeout(this.timer)
      if (callback) { callback() }
    }, 1500)
  }

  hide () {
    this.setState({
      isShowLoading: false
    })
  }

  render () {
    if (!this.state.isShowLoading) {
      return null
    }
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingWrapper}>
          <View style={styles.loadingContent}>
            {this.state.icon
              ? <Iconfont name={this.state.icon} size={dp(70)} />
              : <ActivityIndicator size="large" color={Color.WHITE} />
            }
            <Text style={styles.loadingText}>{this.state.loadingText}</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'transparent',
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingWrapper: {
    width: dp(200),
    height: dp(200),
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  loadingContent: {
    width: dp(200),
    height: dp(200),
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7
  },
  loadingText: {
    color: Color.WHITE,
    marginTop: dp(20),
    fontSize: dp(28)
  }
})

export default LoadingView
