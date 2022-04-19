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
  getCompanyInfo,
  getSecondContractInfo,
  getProductContractList,
  getAgentList
} from '../../actions'
import { connect } from 'react-redux'
import { contractType } from '../../utils/enums'

class Signing extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      isSuccess: false,
      isLoading: false,
      errorMsg: '',
      infoModal: false
    }
  }

  async realNameValid () {
    const { faceData } = this.props.navigation.state.params
    const faceExtraData = this.props.faceExtraData
    const { faceImgPath, lng, lat } = faceExtraData
    const isSign = faceExtraData.isSign === '0' ? '0' : '1'
    this.setState({
      isLoading: true
    })
    const postData = {
      legalArea: '0', // 区域：大陆
      isSign, // 是否自动签署
      videoPhoto: faceImgPath,
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
        this.props.navigation.navigate('SignSuccess', { contractType: '0' })
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

  async contractSign () {
    const { contractFormVO, contractVO, contractElementValueVOlist, contractType, cifCompanyId } = this.props.faceExtraData
    const { faceImgPath, idcardName, idcardNumber } = this.props.navigation.state.params.faceData
    const postData = {
      contractFormVO: JSON.stringify(contractFormVO),
      contractVO: JSON.stringify(contractVO),
      contractElementValueVOlist: JSON.stringify(contractElementValueVOlist),
      videoPhoto: faceImgPath,
      idcardName: idcardName,
      idcardNumber: idcardNumber
    }
    if (contractType === '17') {
      postData.type = '2'
    }
    this.setState({
      isLoading: true
    })
    const res = await ajaxStore.contract.contractSign(postData)
    if (res.data && res.data.code === '0') {
      this.setState({
        isSuccess: true,
        isLoading: false
      })
      await getSecondContractInfo()
      // await getProductContractList({
      //   cifCompanyId
      // })
      this.props.navigation.navigate('SignSuccess', { contractType: contractVO.type })
    } else {
      this.setState({
        isSuccess: false,
        isLoading: false,
        errorMsg: res.data.message,
        infoModal: true
      })
    }
  }

  async guarantorValid () {
    const { contractFormVO, contractVO, contractElementValueVOlist, personArea, cifCompanyId, goNewEsign, lng, lat } = this.props.faceExtraData
    const { faceImgPath, idcardName, idcardNumber } = this.props.navigation.state.params.faceData
    let res
    const postData = {
      contractFormVO: JSON.stringify(contractFormVO),
      contractVO: JSON.stringify(contractVO),
      contractElementValueVOlist: JSON.stringify(contractElementValueVOlist),
      personArea,
      companyId: cifCompanyId,
      videoPhoto: faceImgPath,
      idcardName,
      idcardNumber,
      cifCompanyId,
      templateCode: contractVO.templateCode,
      fileKey: contractVO.fileKey,
      contractCode: contractVO.code,
      lng,
      lat
    }
    this.setState({
      isLoading: true
    })
    if (goNewEsign === '1') {
      res = await ajaxStore.contract.eSignGuarantorValid(postData)
      if (res.data && res.data.code === '0') {
        this.setState({
          isSuccess: true,
          isLoading: false
        })
        this.props.navigation.navigate('SignSuccess', { contractType: contractVO.type })
      } else {
        this.setState({
          isSuccess: false,
          isLoading: false,
          errorMsg: res.data.message,
          infoModal: true
        })
      }
    } else {
      res = await ajaxStore.contract.guarantorValid(postData)
      if (res.data && res.data.code === '0') {
        this.setState({
          isSuccess: true,
          isLoading: false
        })
        this.props.navigation.navigate('SignSuccess', { contractType: contractVO.type })
      } else {
        this.setState({
          isSuccess: false,
          isLoading: false,
          errorMsg: res.data.message,
          infoModal: true
        })
      }
    }
  }

  async agentCreate () {
    const { contractVO, contractAgentVO, contractType } = this.props.faceExtraData
    const { faceImgPath, idcardName, idcardNumber } = this.props.navigation.state.params.faceData
    const postData = {
      contractVO,
      contractAgentVO,
      videoPhoto: faceImgPath,
      idcardName,
      idcardNumber
    }
    this.setState({
      isLoading: true
    })
    const res = await ajaxStore.contract.agentSign(postData)
    if (res.data && res.data.code === '0') {
      await getAgentList()
      this.setState({
        isSuccess: true,
        isLoading: false
      })
      this.props.navigation.navigate('SignSuccess', { contractType })
    } else {
      this.setState({
        isSuccess: false,
        isLoading: false,
        errorMsg: res.data.message,
        infoModal: true
      })
    }
  }

  async letterSign () {
    const { memberId, taskId, isPass, elements, lng, lat, contractType } = this.props.faceExtraData
    const { faceImgPath, idcardName, idcardNumber } = this.props.navigation.state.params.faceData
    const postData = {
      memberId,
      taskId,
      isPass,
      elements,
      videoPhoto: faceImgPath,
      name: idcardName,
      idNumber: idcardNumber,
      lng,
      lat,
      signWay: 2
    }
    this.setState({
      isLoading: true
    })
    console.log(postData)
    global.showError = false
    const res = await ajaxStore.process.taskSubmit(postData)
    global.showError = true
    if (res.data && res.data.code === '0') {
      this.setState({
        isSuccess: true,
        isLoading: false
      })
      this.props.navigation.navigate('SignSuccess', { contractType })
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
    const type = this.props.faceExtraData.contractType
    const version = this.props.faceExtraData.version
    switch (type) {
      case '0':
        this.realNameValid()
        break
      case '10':
      case '12':
      case '16':
      case '17':
      case '23':
        if (version) {
          this.letterSign()
        } else {
          this.contractSign()
        }
        break
      case '13':
        this.guarantorValid()
        break
      case '29':
        this.agentCreate()
        break
      case '34':
      case '35':
        this.letterSign()
        break
      default:
        break
    }
    this.setState({
      title: contractType[parseInt(type)]
    })
  }

  render () {
    const { navigation, userInfo } = this.props
    const { isSuccess, isLoading, title } = this.state
    return (
      <View >
        <NavBar title={title} navigation={navigation} />
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
            this.props.navigation.navigate('ContractList')
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
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(Signing)
