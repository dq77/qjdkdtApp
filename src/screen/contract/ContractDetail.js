import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Button, ScrollView, Text, RefreshControl, Linking,
  Clipboard
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, enc, dec } from '../../utils/Utility'
import { endText, startText, pwd } from '../../utils/config'
import { signerIdentityMap, contractType } from '../../utils/enums'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  getGrarantorList
} from '../../actions'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import { callPhone } from '../../utils/PhoneUtils'
import ajaxStore from '../../utils/ajaxStore'
import StorageUtil from '../../utils/storageUtil'

/**
 * 签署详情
 */
class ContractDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      type: '0', // 0电子合同 1纸质合同
      contractType: '',
      contractCode: '',
      contractDetail: {},
      contractTypeName: ''
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
    const { title, contractType, contractCode, contractTypeName } = this.props.navigation.state.params
    await this.setState({
      title: title || '合同详情',
      contractType,
      contractCode,
      contractTypeName
    })
    this.getContractDetail()
  }

  async getContractDetail () {
    const res = await ajaxStore.contract.getContract({ contractCode: this.state.contractCode })
    if (res.data && res.data.code === '0') {
      this.setState({
        contractDetail: res.data.data
      })
    }
  }

  async checkContract (item) {
    const code = item.contractVO ? item.contractVO.code : (item.code || '')
    if (code) {
      const res = await ajaxStore.contract.getContract({ contractCode: code })
      if (res.data && res.data.code === '0') {
        this.props.navigation.navigate('PreviewPDF', { buzKey: res.data.data.fileKey })
      }
    }
  }

  toSign () {
    this.props.navigation.navigate('ContractSign', { contractType: '10' })
  }

  render () {
    const { navigation, guarantorList, guarantorPaperList, memberFeeContractList } = this.props
    const { title, type, contractCode, contractDetail, contractType, contractTypeName } = this.state
    const paperList = memberFeeContractList.filter((item) => {
      return item.status === 'SIGN_SUCCESS' && item.signWay !== 'SEC_ONLINE'
    })
    const elecList = memberFeeContractList.filter((item) => {
      return item.status === 'SIGN_SUCCESS' && item.signWay === 'SEC_ONLINE'
    })
    return (
      <View style={styles.container}>
        <NavBar title={title} navigation={navigation} />
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
                    <Text style={styles.btnText}>纸质合同</Text>
                  ) : (
                    <Text style={{ ...styles.btnText, ...styles.activedBtn }}>纸质合同</Text>
                  )}
                </Touchable>
              </View>
            }
            {type === '0' ? (
              contractType === '10' ? (
                elecList.length ? (
                  <View style={styles.electronMain}>
                    <Text style={styles.electronTitle}>已签署的电子合同</Text>
                    <Touchable isNativeFeedback={true} onPress={() => { this.checkContract({ contractVO: { code: contractCode } }) }}>
                      <View style={styles.paperItem}>
                        <View style={styles.label}>
                          <Iconfont name='icon-pdf1' size={dp(50)} />
                          <Text style={styles.contractName}>{title}</Text>
                        </View>
                        <Iconfont name='arrow-right1' size={dp(30)} />
                      </View>
                    </Touchable>
                    {JSON.stringify(contractDetail) !== '{}' &&
                      <View style={styles.signDetail}>
                        <Text style={styles.detailTitle}>签署详情</Text>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailText}>{`签署人：${contractDetail.signName}`}</Text>
                          <Text style={styles.detailText}>{`签署地点：${contractDetail.signAddress}`}</Text>
                          {contractDetail.lng !== 'undefined' && contractDetail.lat !== 'undefined' ? (
                            <Text style={styles.detailText}>{`GPS：${contractDetail.lng}, ${contractDetail.lat}`}</Text>
                          ) : (
                            <Text style={styles.detailText}>{'GPS：'}</Text>
                          )}
                          <Text style={styles.detailText}>{`签署时间：${contractDetail.signTime}`}</Text>
                        </View>
                      </View>
                    }
                  </View>
                ) : (
                  <View style={styles.infoWarp}>
                    <Text style={styles.infoText}>您尚未签署电子合同，可点击下方按钮签署</Text>
                    <StrokeBtn text='签署电子合同' onPress={() => { this.toSign() }} />
                  </View>
                )
              ) : (
                <View style={styles.electronMain}>
                  <Text style={styles.electronTitle}>已签署的电子合同</Text>
                  <Touchable isNativeFeedback={true} onPress={() => { this.checkContract({ contractVO: { code: contractCode } }) }}>
                    <View style={styles.paperItem}>
                      <View style={styles.label}>
                        <Iconfont name='icon-pdf1' size={dp(50)} />
                        <Text style={styles.contractName}>{contractTypeName || title}</Text>
                      </View>
                      <Iconfont name='arrow-right1' size={dp(30)} />
                    </View>
                  </Touchable>
                  {JSON.stringify(contractDetail) !== '{}' &&
                    <View style={styles.signDetail}>
                      <Text style={styles.detailTitle}>签署详情</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailText}>{`签署人：${contractDetail.signName}`}</Text>
                        <Text style={styles.detailText}>{`签署地点：${contractDetail.signAddress}`}</Text>
                        {contractDetail.lng !== 'undefined' && contractDetail.lat !== 'undefined' ? (
                          <Text style={styles.detailText}>{`GPS：${contractDetail.lng}, ${contractDetail.lat}`}</Text>
                        ) : (
                          <Text style={styles.detailText}>{'GPS：'}</Text>
                        )}
                        <Text style={styles.detailText}>{`签署时间：${contractDetail.signTime}`}</Text>
                      </View>
                    </View>
                  }
                </View>
              )

            ) : (
              <View style={styles.paperMain}>
                {contractType === '13' && guarantorPaperList.length > 0 &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      {guarantorPaperList.map((item, key) => {
                        return (
                          <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(item) }} key={key}>
                            <View style={styles.paperItem}>
                              <View style={styles.label}>
                                <Iconfont name='icon-pdf1' size={dp(50)} />
                                <Text style={styles.contractName}>{item.contractVO.name}</Text>
                              </View>
                              <Iconfont name='arrow-right1' size={dp(30)} />
                            </View>
                          </Touchable>
                        )
                      })}
                    </View>
                  </View>
                }
                {contractType === '10' && paperList.length > 0 &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      {paperList.map((item, key) => {
                        return (
                          <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(item) }} key={key}>
                            <View style={styles.paperItem}>
                              <View style={styles.label}>
                                <Iconfont name='icon-pdf1' size={dp(50)} />
                                <Text style={styles.contractName}>{item.name}</Text>
                              </View>
                              <Iconfont name='arrow-right1' size={dp(30)} />
                            </View>
                          </Touchable>
                        )
                      })}
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
    marginLeft: dp(30)
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
  detailText: {
    color: '#888',
    lineHeight: dp(50)
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    secondContractList: state.contract.secondContractList,
    guarantorList: state.contract.guarantorList,
    guarantorPaperList: state.contract.guarantorPaperList,
    memberFeeContractList: state.contract.memberFeeContractList
  }
}

export default connect(mapStateToProps)(ContractDetail)
