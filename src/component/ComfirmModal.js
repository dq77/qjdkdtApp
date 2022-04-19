
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../utils/screenUtil'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'
import PropTypes from 'prop-types'
import Color from '../utils/Color'

class ComfirmModal extends PureComponent {
  static defaultProps = {
    infoModal: false,
    title: '提示',
    content: '',
    cancelText: '',
    comfirmText: '确定',
    textAlign: 'center',
    numberOfLines: 10,
    cancel: function () {},
    comfirm: function () {}
  }

  static propTypes = {
    infoModal: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    cancelText: PropTypes.string,
    comfirmText: PropTypes.string,
    textAlign: PropTypes.string,
    numberOfLines: PropTypes.number,
    cancel: PropTypes.func,
    comfirm: PropTypes.func
  }

  static getDerivedStateFromProps (nextProps) {
    return {
      infoModal: nextProps.infoModal
    }
  }

  constructor (props) {
    super(props)
    this.state = {

    }
  }

  _Close () {
    this.props.cancel()
  }

  _Comfirm () {
    this.props.confirm()
  }

  componentDidMount () {

  }

  render () {
    return (
      <Modal
        onTouchOutside={() => {
          this._Close()
        }}
        width={0.8}
        visible={this.state.infoModal}
        onSwipeOut={() => this._Close()}
        modalAnimation={new ScaleAnimation({
          initialValue: 0.1, // optional
          useNativeDriver: true // optional
        })}
        onHardwareBackPress={() => {
          this._Close()
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text={this.props.cancelText}
              onPress={() => {
                this._Close()
              }}
              key="button-1"
              textStyle={{ color: Color.TEXT_MAIN }}
            />
            <ModalButton
              text={this.props.comfirmText}
              onPress={() => {
                // this._Close()
                this._Comfirm()
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={{
            fontSize: dp(40),
            textAlign: 'center',
            marginBottom: dp(30)
          }}>{this.props.title}</Text>
          <Text numberOfLines={this.props.numberOfLines} style={{ ...styles.dialogText, textAlign: this.props.textAlign, lineHeight: dp(40) }}>{this.props.content}</Text>
        </ModalContent>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  }
})

export default ComfirmModal
