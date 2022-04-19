
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, TextInput } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import Modal from 'react-native-modal'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn } from '../../../component/CommonButton'

class AddCrm extends PureComponent {
  static defaultProps = {
    cancel: function () { },
    comfirm: function () { }
  }

  static propTypes = {
    infoModal: PropTypes.bool.isRequired,
    cancel: PropTypes.func,
    comfirm: PropTypes.func
  }

  static getDerivedStateFromProps (nextProps, prevPros) {
    return {
      infoModal: nextProps.infoModal
    }
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {

  }

  render () {
    return (
      <Modal
        style={styles.modal}
        isVisible={this.state.infoModal}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        coverScreen={false}
        hasBackdrop={true}
        backdropTransitionInTiming={0}
        // onBackdropPress={() => this.setModalVisible(false)}
        onBackButtonPress={() => {
          this.setState({
            infoModal: false
          })
          this.props.cancel()
        }
        }
        onHardwareBackPress={() => {
          this.props.cancel()
          return true
        }}
      >
        <View style={styles.modalContainer}>
          <View >
            <View style={{ marginTop: dp(42), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: dp(30) }}>
              <Touchable isNativeFeedback={true} onPress={() => {
                this.props.cancel()
              }} >
                <Text style={{ fontSize: dp(30), color: '#1A97F6' }}>取消</Text>
              </Touchable>
              <Text style={{ fontSize: dp(34), color: '#000000', fontWeight: 'bold' }}>添加至CRM</Text>
              <Touchable isNativeFeedback={true} onPress={() => {
                this.state.selectNum === -1 ? this.props.comfirm({}) : this.props.comfirm(this.state.selectItemData)
                this.props.cancel()
              }} >
                <Text style={{ fontSize: dp(30), color: '#1A97F6' }}>确定</Text>
              </Touchable>
            </View>
            <View style={styles.topBGView}>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>企业名称<Text style={styles.xText}>*</Text></Text>
                <TextInput
                  placeholder={'请输入企业名称'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
              <View style={styles.lineBGView}></View>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>联系地址</Text>
                <TextInput
                  placeholder={'请选择省市区'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
              <View style={styles.lineBGView}></View>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>联系地址</Text>
                <TextInput
                  placeholder={'请输入联系地址'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
            </View>
            <View style={styles.topBGView}>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>联系人<Text style={styles.xText}>*</Text></Text>
                <TextInput
                  placeholder={'请输入联系人'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
              <View style={styles.lineBGView}></View>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>联系方式<Text style={styles.xText}>*</Text></Text>
                <TextInput
                  placeholder={'请输入联系方式'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
            </View>
            <View style={styles.topBGView}>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>客户来源</Text>
                <TextInput
                  placeholder={'请输入客户来源'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
              <View style={styles.lineBGView}></View>
              <View style={styles.nameBGView}>
                <Text style={styles.nameText}>客户负责人</Text>
                <TextInput
                  placeholder={'请输入客户负责人'}
                  autoCapitalize={'none'}
                  style={styles.textInput}
                  onChangeText={(text) => {}}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  lineBGView: {
    marginHorizontal: dp(30),
    backgroundColor: '#E7EBF2',
    height: dp(1)
  },
  nameBGView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dp(30),
    height: dp(96)
  },
  xText: { fontSize: dp(28), color: '#F55849' },
  nameText: { fontSize: dp(28), color: '#2D2926' },
  topBGView: {
    borderRadius: dp(16),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    backgroundColor: '#F8F8FA'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: dp(8),
    borderTopRightRadius: dp(8),
    marginTop: dp(128),
    height: DEVICE_HEIGHT - dp(128),
    width: DEVICE_WIDTH
  },
  modal: {
    margin: 0,
    justifyContent: 'center'
  },
  textInput: {
    paddingVertical: dp(20),
    paddingHorizontal: dp(20),
    marginHorizontal: dp(30),
    color: '#2D2926',
    fontSize: dp(28),
    position: 'absolute',
    marginLeft: dp(170)
  }

})

export default AddCrm
