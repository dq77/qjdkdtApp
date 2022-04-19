import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import ComfirmModal from '../../component/ComfirmModal'
import {
  getOtherContractList
} from '../../actions'
import { connect } from 'react-redux'

class OtherSigning extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isSuccess: false,
      isLoading: false,
      errorMsg: '',
      infoModal: false
    }
  }

  async contractSign () {
    const { contractVO, contractElementValueVOlist, cifCompanyId, templateCode, fileKey, contractCode, lng, lat, contractType, source } = this.props.faceExtraData
    const { faceImgPath, idcardName, idcardNumber } = this.props.navigation.state.params.faceData
    const postData = {
      contractVO,
      contractElementValueVOlist,
      cifCompanyId,
      templateCode,
      fileKey,
      contractCode,
      videoPhoto: faceImgPath,
      idcardName: idcardName,
      idcardNumber: idcardNumber,
      lng,
      lat
    }
    this.setState({
      isLoading: true
    })
    global.showError = false
    let res
    switch (contractType) {
      case '6':
        res = await ajaxStore.contract.eSignGuarantorValid(postData)
        break
      case '29':
        res = await ajaxStore.contract.agentAllSign(postData)
        break
      default:
        res = await ajaxStore.contract.allSign(postData)
    }
    global.showError = true
    if (res.data && res.data.code === '0') {
      this.setState({
        isSuccess: true,
        isLoading: false
      })
      if (source !== 'share') {
        await getOtherContractList({
          cifCompanyId,
          contractName: ''
        })
        this.props.navigation.navigate('OtherSignSuccess')
      } else {
        this.props.navigation.navigate('OtherSignSuccess')
      }
    } else {
      this.setState({
        isSuccess: false,
        isLoading: false,
        errorMsg: res.data.message,
        infoModal: true
      })
    }
  }

  componentDidMount () {
    this.contractSign()
  }

  render () {
    const { navigation, userInfo, sessionId } = this.props
    const { isSuccess, isLoading } = this.state
    const { source } = this.props.faceExtraData
    return (
      <View >
        <NavBar title={'合同签约'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.contentWarp}>
            {isSuccess || isLoading ? (
              <Text style={styles.contentTitle}>认证中，请稍后</Text>
            ) : (
              <Text style={styles.contentTitle}>认证失败，请重试</Text>
            )}
            <Iconfont name={'legal-real-name'} size={dp(300)} />
          </View>
        </ScrollView>
        <ComfirmModal
          title={'认证失败'}
          content={this.state.errorMsg}
          cancelText={'取消'}
          comfirmText={'重试'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
            if (source === 'share') {
              this.props.navigation.navigate('Login')
            } else {
              this.props.navigation.navigate('ContractList')
            }
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.props.navigation.state.params.retry()
            this.props.navigation.goBack()
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  contentWarp: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  contentTitle: {
    textAlign: 'center',
    width: DEVICE_WIDTH,
    fontSize: dp(36),
    marginBottom: dp(50),
    marginTop: '45%'
  }
})

const mapStateToProps = state => {
  return {
    faceExtraData: state.cache.faceExtraData,
    sessionId: state.user.sessionId
  }
}

export default connect(mapStateToProps)(OtherSigning)
