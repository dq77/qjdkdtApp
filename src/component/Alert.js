/**
 * Created by hjs on 2019-09-17
 */
import React, { PureComponent } from 'react'
import { StyleSheet, View, Animated, Dimensions, Text, ViewPropTypes as RNViewPropTypes } from 'react-native'
import AlertModal from './AlertModal'

import PropTypes from 'prop-types'
const ViewPropTypes = RNViewPropTypes || View.propTypes
export const DURATION = {
  LENGTH_SHORT: 1500,
  FOREVER: 0,
}

const { height, width } = Dimensions.get('window')

class Alert extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isShow: false,
      title: '',
      content: '',
      callback: function () {},
    }
  }

  show({ title, content, callback }) {
    this.setState({
      isShow: true,
      title: title || '提示',
      content: content,
      callback: callback || function () {},
    })
  }

  hide() {
    this.setState({
      isShow: false,
      title: '',
      content: '',
    })
  }

  componentWillUnmount() {}

  render() {
    const view = (
      <AlertModal
        ref="alert"
        title={this.state.title}
        content={this.state.content}
        comfirmText={'确定'}
        cancel={() => {
          // global.alert.hide()
        }}
        confirm={() => {
          global.alert.hide()
          this.state.callback && this.state.callback()
        }}
        infoModal={this.state.isShow}
      />
    )
    return view
  }
}

const styles = StyleSheet.create({})

export default Alert
