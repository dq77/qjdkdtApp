/**
 * Created by hjs on 2019-09-17
 */
import React, { PureComponent } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  Text
} from 'react-native'
import ComfirmModal from './ComfirmModal'

class Confirm extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isShow: false,
      title: '',
      content: '',
      cancelText: '',
      confirmText: '',
      cancel: function () {},
      confirm: function () {}
    }
  }

  show ({ title, content, confirmText, confirm, cancelText, cancel }) {
    this.setState({
      isShow: true,
      title: title || '确认',
      content: content,
      confirmText: confirmText || '确定',
      cancelText: cancelText || '取消',
      confirm: confirm || function () { },
      cancel: cancel || function () { }
    })
  }

  hide () {
    this.setState({
      isShow: false,
      title: '',
      content: ''
    })
  }

  render () {
    const view = <ComfirmModal
      title={this.state.title}
      content={this.state.content}
      comfirmText={this.state.confirmText}
      cancelText={this.state.cancelText}
      cancel={() => {
        global.confirm.hide()
        this.state.cancel && this.state.cancel()
      }}
      confirm={() => {
        global.confirm.hide()
        this.state.confirm && this.state.confirm()
      }}
      infoModal={this.state.isShow} />
    return view
  }
}

export default Confirm
