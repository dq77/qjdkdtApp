import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, RefreshControl, FlatList, Keyboard } from 'react-native'
import { PropTypes } from 'prop-types'
import Color from '../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../utils/screenUtil'
import Iconfont from '../iconfont/Icon'
import Modal from 'react-native-modal'

export default class BottomFullModal extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    cancel: PropTypes.string,
    confirm: PropTypes.string,
    isAutoClose: PropTypes.bool,
    coverScreen: PropTypes.bool,
    submit: PropTypes.func,
    close: PropTypes.func,
    pageHeight: PropTypes.number

  }

  static defaultProps = {
    title: '选择',
    cancel: '取消',
    confirm: '完成',
    isAutoClose: true,
    coverScreen: false,
    pageHeight: DEVICE_HEIGHT * 0.95,
    submit: () => { },
    close: () => { }
  }

  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false
    }
  }

  setModalVisible (visible) {
    this.setState({ modalVisible: visible })
  }

  show = () => {
    this.setModalVisible(true)
  }

  cancel = () => {
    this.props.close()
    this.setModalVisible(false)
  }

  render () {
    const { modalVisible } = this.state
    const { children, title, submit, cancel, confirm, isAutoClose, coverScreen } = this.props
    return (
      <Modal
        style={styles.modal}
        isVisible={modalVisible}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        coverScreen={coverScreen}
        hasBackdrop={true}
        statusBarTranslucent={true}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        propagateSwipe={true}
        onBackdropPress={() => {
          this.setModalVisible(false)
        }}
        onBackButtonPress={() => {
          this.setModalVisible(false)
        }}
      >
        <View style={this.props.pageHeight ? { ...styles.modalContainer, height: this.props.pageHeight } : styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalBtn} onPress={this.cancel}>{cancel}</Text>
            <Text style={styles.modalBtn} onPress={() => {
              Keyboard.dismiss()
              if (isAutoClose) {
                this.setModalVisible(false)
              }
              submit()
            }}>{confirm}</Text>
          </View>
          {children}
        </View>
      </Modal>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  modal: {
    margin: 0
  },
  modalContainer: {
    width: DEVICE_WIDTH,
    backgroundColor: 'white',
    height: DEVICE_HEIGHT * 0.95,
    position: 'absolute',
    borderTopLeftRadius: dp(30),
    borderTopRightRadius: dp(30),
    bottom: 0
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: dp(60)
  },
  modalBtn: {
    textAlign: 'center',
    padding: dp(30),
    fontSize: dp(30),
    color: '#1A97F6',
    fontWeight: 'bold'
  },
  modalTitle: {
    fontSize: dp(36),
    color: '#000000',
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center'
  }
})
