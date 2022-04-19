
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

class AlertModal extends PureComponent {
  static defaultProps = {
    infoModal: false,
    title: '提示',
    content: '',
    comfirmText: '确定',
    cancel: function () {},
    comfirm: function () {},
    type: 'success'
  }

  static propTypes = {
    infoModal: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    comfirmText: PropTypes.string,
    cancel: PropTypes.func,
    comfirm: PropTypes.func,
    type: PropTypes.string
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
              text={this.props.comfirmText}
              onPress={() => {
                this._Close()
                this._Comfirm()
              }}
              key="button-2"
              textStyle={{ color: this.props.type === 'fail' ? Color.RED : Color.GREEN_BTN }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: dp(40),
            textAlign: 'center',
            marginBottom: dp(30)
          }}>{this.props.title}</Text>
          <Text style={styles.dialogText}>{this.props.content}</Text>
        </ModalContent>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  dialogText: {
    color: Color.TEXT_LIGHT
    // textAlign: 'left'
  }
})

export default AlertModal
