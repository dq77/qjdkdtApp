
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT, getStatusBarHeight } from '../utils/screenUtil'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation,
  SlideAnimation
} from 'react-native-modals'
import PropTypes from 'prop-types'
import Color from '../utils/Color'

class AlertPage extends PureComponent {
  static defaultProps = {
    infoModal: false,
    title: '提示',
    content: '',
    comfirmText: '确定',
    cancel: function () { },
    comfirm: function () { },
    render: function () { },
    type: 'success'
  }

  static propTypes = {
    infoModal: PropTypes.bool.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    comfirmText: PropTypes.string,
    cancel: PropTypes.func,
    comfirm: PropTypes.func,
    render: PropTypes.func,
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

  _render () {
    return (this.props.render())
  }

  componentDidMount () {

  }

  render () {
    return (
      <Modal
        modalStyle={{ marginBottom: -DEVICE_HEIGHT * 0.1 }}
        onTouchOutside={() => {
          this._Close()
        }}
        modalTitle={
          <View style={styles.headerMain}>
            <Text onPress={() => { this._Close() }} style={styles.headerText}>{'取消'}</Text>
            <Text style={styles.headerTitle}>{this.props.title}</Text>
            <Text onPress={() => { this._Comfirm() }} style={styles.headerText}>{'完成'}</Text>
          </View>
        }
        width={1}
        visible={this.state.infoModal}
        onSwipeOut={() => this._Close()}
        modalAnimation={new SlideAnimation({
          slideFrom: 'bottom', // optional
          useNativeDriver: true // optional
        })}
        onHardwareBackPress={() => {
          this._Close()
          return true
        }}
      >
        <ModalContent style={styles.pageMain}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {this._render()}
          </ScrollView>
        </ModalContent>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  pageMain: {
    height: (DEVICE_HEIGHT - getStatusBarHeight()) * 0.95,
    paddingBottom: dp(100)
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: dp(34),
    fontWeight: 'bold',
    textAlign: 'center'
  },
  headerText: {
    fontSize: dp(30),
    color: '#1A97F6',
    marginHorizontal: dp(30),
    marginVertical: dp(60)
  }
})

export default AlertPage
