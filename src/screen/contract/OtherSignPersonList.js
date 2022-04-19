import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Button, ScrollView, Text, RefreshControl, Linking,
  Clipboard
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, enc, dec, blurIdCard } from '../../utils/Utility'
import { endText, startText, pwd } from '../../utils/config'
import { guarantorType, signerTypeSort } from '../../utils/enums'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import ajaxStore from '../../utils/ajaxStore'
import StorageUtil from '../../utils/storageUtil'

/**
 * 签署人
 */
class OtherSignPersonList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '合同',
      congractStatus: {
        0: {
          statusText: '待签署',
          icon: 'icon-unsigned'
        },
        1: {
          statusText: '已签署',
          icon: 'icon-signed'
        },
        2: {
          statusText: '签署中',
          icon: 'icon-unsigned'
        }
      },
      infoModal: false,
      shareText: '',
      contractVO: '',
      signers: [],
      contractCode: '',
      isMaxiMum: false,
      maxiMumSigner: [],
      fileKey: ''
    }
    this.guarantorSignConfirm = this.guarantorSignConfirm.bind(this)
    this.signConfirm = this.signConfirm.bind(this)
    this.goSign = this.goSign.bind(this)
    this.toWechat = this.toWechat.bind(this)
    this.checkContract = this.checkContract.bind(this)
    this.checkDetail = this.checkDetail.bind(this)
  }

  async componentDidMount () {
    await this.setState({
      contractCode: this.props.navigation.state.params.contractCode
    })
    this.getSignerDetail()
  }

  sortSigner (a, b) {
    const aIndex = signerTypeSort.indexOf(a.typeName)
    const bIndex = signerTypeSort.indexOf(b.typeName)
    return aIndex - bIndex
  }

  async getGuarantorsByContractCode (contractCode) {
    const res = await ajaxStore.contract.getGuarantorsByContractCode({ contractCode })
    if (res.data && res.data.code === '0') {
      const maxiMumSigner = res.data.data
      const contractVO = this.state.contractVO
      maxiMumSigner.map(item => {
        item.signStatus = item.sign ? '1'
          : contractVO.transpondPersonName && contractVO.transpondPersonName === item.identityCard
            ? '2' : '0'
      })
      this.setState({ maxiMumSigner })
    }
  }

  async getSignerDetail () {
    const contractCode = this.state.contractCode
    const res = await ajaxStore.contract.getOtherContractDetail({
      cifCompanyId: this.props.companyInfo.companyId,
      contractCode
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const isMaxiMum = (data.contractVO.type === '6')
      const contractVO = data.contractVO
      this.setState({ isMaxiMum, contractVO })
      if (data.contractVO.type === '6') {
        this.getGuarantorsByContractCode(contractCode)
        return
      }
      let signers = []
      const signerList = data.contractSignedPersonVOS
      if (signerList && signerList.length > 0) {
        signers = signerList.map((item, index) => {
          if (item.signatureType === '0') {
            item.signStatus = contractVO.electronSchedule === 'SIGN_SUCCESS' || contractVO.currentSignSchedule > 1 ? '1' : '0'
            item.signatureRole = `经销商 - ${item.signatureRole}`
          } else {
            item.signStatus = contractVO.electronSchedule === 'SIGN_SUCCESS'
              ? '1'
              : contractVO.transpondPersonName && contractVO.transpondPersonName === item.signatureIDCard
                ? '2'
                : '0'
            item.disabled = contractVO.transpondPersonName || contractVO.currentSignSchedule !== '2' ? '1' : '0'
            item.signatureRole = `厂家 - ${item.signatureRole}`
          }
          return item
        })
      }
      this.setState({
        signers
      })
    }
  }

  goSign (item) {
    if (item.signatureName && item.signatureIDCard) {
      this.props.navigation.navigate('OtherContractSign', this.getParams(item))
    }
  }

  getParams (item) {
    // 保证和小程序兼容，使用参数名与小程序一致
    return {
      contractCode: this.state.contractCode || '',
      name: item.signatureName || item.name || '',
      idNumber: item.signatureIDCard || item.identityCard || '',
      signatureType: item.signatureType || item.type || '',
      cifCompanyId: this.props.companyInfo.companyId,
      contractType: this.state.contractVO.type
    }
  }

  async getContractInfoSigned () {
    const res = await ajaxStore.contract.getContractInfoAndFile({ contractCode: this.state.contractCode })
    if (res.data && res.data.code === '0') {
      await this.setState({
        fileKey: res.data.data.fileVO.electronicFileKey
      })
      this.checkContract(res.data.data.fileVO.electronicFileKey)
    }
  }

  checkDetail (item) {
    if (this.state.fileKey) {
      this.checkContract(this.state.fileKey)
    } else {
      this.getContractInfoSigned()
    }
  }

  checkContract (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey, version: '2' })
  }

  guarantorSignConfirm (item, cancel) {
    this.updateContract(item, cancel)
  }

  async updateContract (item, cancel) {
    let idCard = ''
    if (this.state.isMaxiMum) {
      const maxiMumSigner = item
      idCard = maxiMumSigner.identityCard
    } else {
      const signer = item
      idCard = signer.signatureIDCard
    }
    const contractVO = this.state.contractVO
    contractVO.transpondPersonName = cancel ? '' : idCard
    const data = {
      contractVO: JSON.stringify(contractVO)
    }
    const res = await ajaxStore.contract.updateContract(data)
    if (res.data && res.data.code === '0') {
      this.getSignerDetail()
      if (!cancel) {
        await this.setShareContent(item)
        this.copyToClipBoard()
      }
    }
  }

  async setShareContent (item) {
    const params = this.getParams(item)
    let paramsString = ''
    for (const key in params) {
      paramsString += `${key}=${params[key]}&`
    }
    let shareText = `/signPage?${paramsString}`
    await StorageUtil.save('contractUrl', shareText)
    shareText = startText(this.state.title) + enc(encodeURIComponent(shareText), pwd) + endText
    await this.setState({
      infoModal: true,
      shareText
    })
  }

  async signConfirm (item, cancel) {
    if ((item.signStatus === '0' && item.signatureName && item.signatureIDCard && item.disabled !== '1') || item.signStatus === '2') {
      this.updateContract(item, cancel)
    }
  }

  async copyToClipBoard () {
    Clipboard.setString(this.state.shareText)
  }

  async toWechat () {
    const supported = await Linking.canOpenURL('weixin://')
    if (supported) {
      Linking.openURL('weixin://')
    } else {
      console.log('请先安装微信')
    }
  }

  render () {
    const { navigation, companyInfo } = this.props
    const { legalPersonCertId, corpName } = companyInfo
    const { congractStatus, signers, contractCode, contractVO, maxiMumSigner } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'合同签约'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.header}>
            <Text style={styles.corpName}>{corpName}</Text>
            <Text style={styles.deadLineText}>{`合同编号：${contractCode}`}</Text>
          </View>
          <View style={styles.contractMain}>
            <View style={styles.signerMain}>
              <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(contractVO.fileKey) }}>
                <View style={styles.paperItem}>
                  <View style={styles.label}>
                    <Iconfont name='icon-pdf1' size={dp(50)} />
                    <Text style={styles.contractName}>{contractVO.name}</Text>
                  </View>
                  <Iconfont name='arrow-right1' size={dp(30)} />
                </View>
              </Touchable>
              <Text style={styles.pageTitle}>签署人</Text>
              {maxiMumSigner.map((item, key) => {
                return (
                  <View style={styles.contractItem} key={key}>
                    <View style={styles.singerHeader}>
                      {item.guarantorType ? (
                        <Text>{guarantorType[item.guarantorType]}</Text>
                      ) : (
                        <Text>{'企业'}</Text>
                      )}
                      <View style={styles.headerRight}>
                        <Text style={styles.statusText}>{congractStatus[parseInt(item.signStatus)].statusText}</Text>
                        <Iconfont style={styles.arrow} name={congractStatus[parseInt(item.signStatus)].icon} size={dp(30)} />
                      </View>
                    </View>
                    <View style={styles.singerContent}>
                      {item.name && item.identityCard ? (
                        <View>
                          <Text style={styles.statusText}>{`姓名：${item.name}`}</Text>
                          <Text style={styles.statusText}>{`身份证：${blurIdCard(item.identityCard)}`}</Text>
                        </View>
                      ) : (
                        <View style={styles.warningWarp}>
                          <Iconfont style={styles.warningIcon} name={'icon-warn'} size={dp(40)} />
                          <Text style={styles.tips}>请补充签署人信息</Text>
                        </View>
                      )}
                      {item.signStatus === '1' ? (
                        <Touchable onPress={() => { this.checkDetail(item) }}>
                          <Text style={styles.checkBtn}>查看合同</Text>
                        </Touchable>
                      ) : (
                        item.signStatus === '2' ? (
                          <Touchable onPress={() => { this.guarantorSignConfirm(item, true) }}>
                            <Text style={styles.signBtn}>取消转发</Text>
                          </Touchable>
                        ) : item.signStatus === '0' && (
                          <Touchable onPress={() => { this.guarantorSignConfirm(item, false) }}>
                            <Text style={item.name && item.identityCard ? styles.signBtn : styles.disabled}>转发签署</Text>
                          </Touchable>
                        )
                      )}
                    </View>
                  </View>
                )
              })}
              {signers.map((item, key) => {
                return (
                  <View style={styles.contractItem} key={key}>
                    <View style={styles.singerHeader}>
                      <Text>{item.signatureRole}</Text>
                      <View style={styles.headerRight}>
                        <Text style={styles.statusText}>{congractStatus[parseInt(item.signStatus)].statusText}</Text>
                        <Iconfont style={styles.arrow} name={congractStatus[parseInt(item.signStatus)].icon} size={dp(30)} />
                      </View>
                    </View>
                    <View style={styles.singerContent}>
                      {item.signatureName && item.signatureIDCard ? (
                        <View>
                          <Text style={styles.statusText}>{`姓名：${item.signatureName}`}</Text>
                          <Text style={styles.statusText}>{`身份证：${blurIdCard(item.signatureIDCard)}`}</Text>
                        </View>
                      ) : (
                        <View style={styles.warningWarp}>
                          <Iconfont style={styles.warningIcon} name={'icon-warn'} size={dp(40)} />
                          <Text style={styles.tips}>请补充签署人信息</Text>
                        </View>
                      )}

                      {item.signStatus === '1' ? (
                        <Touchable onPress={() => { this.checkDetail(item) }}>
                          <Text style={styles.checkBtn}>查看合同</Text>
                        </Touchable>
                      ) : (
                        item.signatureIDCard === legalPersonCertId && item.signatureType === '0' ? (
                          <Touchable onPress={() => { this.goSign(item) }}>
                            <Text style={item.signatureName && item.signatureIDCard ? styles.signBtn : styles.disabled}>立即签署</Text>
                          </Touchable>
                        ) : item.signStatus === '2' ? (
                          <Touchable onPress={() => { this.signConfirm(item, true) }}>
                            <Text style={styles.signBtn}>取消转发</Text>
                          </Touchable>
                        ) : (
                          <Touchable onPress={() => { this.signConfirm(item, false) }}>
                            <Text style={item.signatureName && item.signatureIDCard && item.disabled !== '1' ? styles.signBtn : styles.disabled}>转发签署</Text>
                          </Touchable>
                        )
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </ScrollView>
        <ComfirmModal
          title={'合同签署口令复制成功！'}
          content={this.state.shareText}
          cancelText={'取消'}
          comfirmText={'去粘贴'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.toWechat()
          }}
          textAlign={'left'}
          numberOfLines={2}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  statusBtnMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dp(3),
    borderBottomWidth: dp(1),
    borderBottomColor: '#ddd'
  },
  btnText: {
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.5,
    lineHeight: dp(120),
    fontWeight: 'bold',
    fontSize: dp(32)
  },
  activedBtn: {
    backgroundColor: Color.WHITE
  },
  pageTitle: {
    fontSize: dp(34),
    padding: dp(30)
  },
  contractItem: {
    backgroundColor: Color.WHITE,
    marginBottom: dp(20)
  },
  singerHeader: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(20),
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  statusText: {
    color: '#888',
    fontSize: dp(28),
    lineHeight: dp(44)
  },
  arrow: {
    marginLeft: dp(10)
  },
  singerContent: {
    padding: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  signBtn: {
    fontSize: dp(28),
    backgroundColor: Color.THEME,
    color: Color.WHITE,
    paddingHorizontal: dp(20),
    paddingVertical: dp(15),
    borderRadius: dp(10)
  },
  disabled: {
    fontSize: dp(28),
    backgroundColor: Color.DEFAULT_BG,
    color: Color.TEXT_LIGHT,
    borderWidth: dp(2),
    borderColor: Color.SPLIT_LINE,
    paddingHorizontal: dp(20),
    paddingVertical: dp(15),
    borderRadius: dp(10)
  },
  checkBtn: {
    fontSize: dp(28),
    borderWidth: dp(2),
    borderColor: Color.THEME,
    color: Color.THEME,
    paddingHorizontal: dp(20),
    paddingVertical: dp(15),
    borderRadius: dp(10)
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
  header: {
    paddingTop: dp(50),
    paddingHorizontal: dp(30)
  },
  corpName: {
    fontSize: dp(34),
    marginBottom: dp(20)
  },
  deadLineText: {
    color: '#888',
    fontSize: dp(28),
    marginBottom: dp(20)
  },
  warningWarp: {
    flexDirection: 'row'
  },
  tips: {
    color: '#888',
    fontSize: dp(28),
    marginLeft: dp(10)
  },
  warningIcon: {
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    secondContractList: state.contract.secondContractList
  }
}

export default connect(mapStateToProps)(OtherSignPersonList)
