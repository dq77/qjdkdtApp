import React, { PureComponent } from 'react'
import {
  View, StyleSheet, ScrollView, Text
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { contractType } from '../../utils/enums'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { StrokeBtn } from '../../component/CommonButton'
import { callPhone } from '../../utils/PhoneUtils'
import ajaxStore from '../../utils/ajaxStore'

/**
 * 签署详情
 */
class OtherContractDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      done: false,
      type: '0', // 0电子合同 1纸质合同
      contractCode: '',
      contractVO: '',
      fileVO: '',
      requireText: '',
      cifCompanyId: ''
    }
    this.changeType = this.changeType.bind(this)
    this.checkContract = this.checkContract.bind(this)
    this.toSign = this.toSign.bind(this)
  }

  changeType (type) {
    this.setState({
      type
    })
  }

  async componentDidMount () {
    const { contractCode, cifCompanyId } = this.props.navigation.state.params
    await this.setState({
      contractCode,
      cifCompanyId
    })
    this.getContractDetail()
  }

  async getContractDetail () {
    const res = await ajaxStore.contract.getContractInfoAndFile({ contractCode: this.state.contractCode })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      if (data.contractVO.paperWhetherMustSigned === '1') {
        this.setState({ requireText: '（必签）' })
      }
      data.fileVO.electronicFileKey = data.fileVO.electronicFileKey || data.fileVO.fileKey
      this.setState({
        done: true,
        contractVO: data.contractVO,
        fileVO: data.fileVO
      })
    }
  }

  toSign () {
    this.props.navigation.navigate('OtherContractSign', {
      contractCode: this.state.contractCode,
      cifCompanyId: this.state.cifCompanyId
    })
  }

  checkContract (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey })
  }

  render () {
    const { navigation, guarantorPaperList } = this.props
    const { type, contractVO, fileVO, done, requireText } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'合同详情'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.contractMain}>
            {contractType !== '13' &&
              <View style={styles.statusBtnMain}>
                <Touchable onPress={() => this.changeType('0')}>
                  {type === '0' ? (
                    <Text style={{ ...styles.btnText, ...styles.activedBtn }}>电子合同</Text>
                  ) : (
                    <Text style={styles.btnText}>电子合同</Text>
                  )}
                </Touchable>
                <Touchable onPress={() => this.changeType('1')}>
                  {type === '0' ? (
                    <Text style={styles.btnText}>{`纸质合同${requireText}`}</Text>
                  ) : (
                    <Text style={{ ...styles.btnText, ...styles.activedBtn }}>纸质合同</Text>
                  )}
                </Touchable>
              </View>
            }
            {type === '0' ? (
              <View style={styles.electronMain}>
                <Text style={styles.electronTitle}>已签署的电子合同</Text>
                {contractVO && contractVO.electronSchedule === 'SIGN_SUCCESS' ? (
                  <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(fileVO.electronicFileKey) }}>
                    <View style={styles.paperItem}>
                      <View style={styles.label}>
                        <Iconfont name='icon-pdf1' size={dp(50)} />
                        <Text style={styles.contractName}>{contractVO.name}</Text>
                      </View>
                      <Iconfont name='arrow-right1' size={dp(30)} />
                    </View>
                  </Touchable>
                ) : done ? (
                  <View style={styles.infoWarp}>
                    <Text style={styles.infoText}>您尚未签署电子合同，可点击下方按钮签署</Text>
                    <StrokeBtn text='签署电子合同' onPress={() => { this.toSign() }} />
                  </View>
                ) : (null)}
                {done &&
                  <View style={styles.signDetail}>
                    <Text style={styles.detailTitle}>签署详情</Text>
                    <View>
                      <View style={styles.detailContent}>
                        {contractVO.type === '3' &&
                          <Text style={styles.signRoleText}>经销商</Text>
                        }
                        <Text style={styles.detailText}>{`签署人：${contractVO.signName}`}</Text>
                        <Text style={styles.detailText}>{`签署地点：${contractVO.signAddress}`}</Text>
                        {contractVO.lng !== 'undefined' && contractVO.lat !== 'undefined' ? (
                          <Text style={styles.detailText}>{`GPS：${contractVO.lng}, ${contractVO.lat}`}</Text>
                        ) : (
                          <Text style={styles.detailText}>{'GPS：'}</Text>
                        )}
                        <Text style={styles.detailText}>{`签署时间：${contractVO.signTime}`}</Text>
                      </View>
                      {contractVO.type === '3' && contractVO.supplierSignName &&
                        <View style={styles.detailContent}>
                          <Text style={styles.signRoleText}>厂家</Text>
                          <Text style={styles.detailText}>{`签署人：${contractVO.supplierSignName}`}</Text>
                          <Text style={styles.detailText}>{`签署地点：${contractVO.supplierSignAddress}`}</Text>
                          {contractVO.supplierLng !== 'undefined' && contractVO.supplierLat !== 'undefined' ? (
                            <Text style={styles.detailText}>{`GPS：${contractVO.supplierLng}, ${contractVO.supplierLat}`}</Text>
                          ) : (
                            <Text style={styles.detailText}>{'GPS：'}</Text>
                          )}
                          <Text style={styles.detailText}>{`签署时间：${contractVO.supplierSignTime}`}</Text>
                        </View>
                      }
                    </View>
                  </View>
                }
              </View>
            ) : (
              <View style={styles.paperMain}>
                {contractVO && contractVO.paperSchedule === 'SIGN_SUCCESS' &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(fileVO.paperFileKey) }}>
                        <View style={styles.paperItem}>
                          <View style={styles.label}>
                            <Iconfont name='icon-pdf1' size={dp(50)} />
                            <Text style={styles.contractName}>{contractVO.name}</Text>
                          </View>
                          <Iconfont name='arrow-right1' size={dp(30)} />
                        </View>
                      </Touchable>
                    </View>
                  </View>
                }
                <View style={styles.infoWarp}>
                  <Text style={styles.infoText}>如果您已签署的合同未展示，可能是暂未归档成功，详情可咨询客服。</Text>
                  <StrokeBtn text='拨打客服热线' onPress={() => { callPhone(4006121666) }} />
                  <Text style={styles.infoTime}>工作时间：全年 9:00-21:00</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.WHITE
  },
  electronTitle: {
    fontSize: dp(34),
    fontWeight: 'bold',
    padding: dp(30),
    backgroundColor: Color.WHITE,
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  statusBtnMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dp(3),
    borderBottomWidth: dp(2),
    borderBottomColor: Color.DEFAULT_BG
  },
  btnText: {
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.5,
    lineHeight: dp(120),
    fontWeight: 'bold',
    fontSize: dp(32),
    backgroundColor: Color.DEFAULT_BG
  },
  activedBtn: {
    backgroundColor: Color.WHITE
  },
  paperTitle: {
    backgroundColor: Color.WHITE,
    padding: dp(30),
    fontSize: dp(34),
    fontWeight: 'bold',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  contractName: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.8
  },
  paperItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Color.WHITE,
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    paddingHorizontal: dp(30),
    paddingVertical: dp(30)
  },
  infoWarp: {
    backgroundColor: Color.WHITE,
    paddingHorizontal: dp(20),
    paddingVertical: dp(50)
  },
  infoText: {
    color: '#888',
    fontSize: dp(28),
    textAlign: 'center',
    marginBottom: dp(40),
    lineHeight: dp(44)
  },
  infoTime: {
    color: '#888',
    fontSize: dp(24),
    textAlign: 'center',
    marginTop: dp(20)
  },
  signDetail: {
    padding: dp(30)
  },
  detailTitle: {
    fontSize: dp(34),
    fontWeight: 'bold',
    marginBottom: dp(30)
  },
  signRoleText: {
    fontSize: dp(32),
    marginBottom: dp(10)
  },
  detailText: {
    color: '#888',
    lineHeight: dp(50)
  },
  detailContent: {
    marginBottom: dp(30)
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    secondContractList: state.contract.secondContractList,
    guarantorList: state.contract.guarantorList,
    guarantorPaperList: state.contract.guarantorPaperList
  }
}

export default connect(mapStateToProps)(OtherContractDetail)
