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
  getCompanyInfo
} from '../../actions'
import { connect } from 'react-redux'
import { lng, lat } from '../../utils/config'

class LegalRealName extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isSuccess: false,
      isLoading: false,
      errorMsg: '',
      infoModal: false
    }
  }

  async postRealName () {
    const { faceData } = this.props.navigation.state.params
    const faceExtraData = this.props.faceExtraData
    const isSign = faceExtraData.isSign === '0' ? '0' : '1'
    this.setState({
      isLoading: true
    })
    const postData = {
      legalArea: '0', // 区域：大陆
      isSign, // 是否自动签署
      videoPhoto: faceData.faceImgPath,
      lng,
      lat,
      ...faceData
    }
    const res = await ajaxStore.company.legalRealName(postData)
    if (res.data && res.data.code === '0') {
      this.setState({
        isSuccess: true,
        isLoading: false
      })
      getCompanyInfo()
      if (isSign === '0') {
        this.props.navigation.navigate('LegalRealNameSuccess')
      } else {
        this.props.navigation.navigate('AutoSignProcess', { idcardName: faceData.idcardName, idcardNumber: faceData.idcardNumber })
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
    this.postRealName()
  }

  render () {
    const { navigation, userInfo } = this.props
    const { isSuccess, isLoading } = this.state
    return (
      <View >
        <NavBar title={'法人实名认证'} navigation={navigation} />
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
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.navigation.goBack()
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
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(LegalRealName)
