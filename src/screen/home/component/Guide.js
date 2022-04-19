import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount, showToast, toAmountStr } from '../../../utils/Utility'
import Iconfont from '../../../iconfont/Icon'
import { connect } from 'react-redux'
import ComfirmModal from '../../../component/ComfirmModal'
import ajaxStore from '../../../utils/ajaxStore'
import CheckBox from 'react-native-check-box'
import {
  getSecondContractInfo,
  getCompanyInfo,
  setFaceExtraData,
  getMemberVipInfo
} from '../../../actions'
import { vIdcardNumber } from '../../../utils/reg'
import { getLocation } from '../../../utils/LocationUtils'
import VipModal from '../../../screen/mine/component/VipPayModal'
import { webUrl } from '../../../utils/config'

@injectUnmount
class Guide extends PureComponent {
  static defaultProps = {
    navigation: {}
  }

  static propTypes = {
    navigation: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      contractInfo: {},
      checkbox: true,
      vipModal: false,
      memberFee: {},
      processId: '',
      memberFeeContractList: []
    }
    this.toRealName = this.toRealName.bind(this)
    this.clickPreviewMember = this.clickPreviewMember.bind(this)
    this.clickPreviewTwoContract = this.clickPreviewTwoContract.bind(this)
    this.clickPreviewInfoServiceContract = this.clickPreviewInfoServiceContract.bind(this)
  }

  // 实名认证
  async toRealName () {
    if (this.state.checkbox) {
      this.props.navigation.navigate('RealNameAuth')
    } else {
      global.alert.show({
        content: '请先阅读并同意相关协议及合同'
      })
    }
  }

  // 成为会员
  async clickSignContract () {
    const { companyInfo } = this.props
    const { companyTag } = companyInfo
    if (companyInfo.memberInfo.blackType === 1) {
      global.alert.show({
        title: '提示',
        content: '您当前的会员等级被冻结，如有疑问请联系客服',
        callback: () => {
        }
      })
    } else if (companyTag.isSupportwoDistribution === 1) {
      // 当前处于未认证成功
    // 实名认证
      global.alert.show({
        title: '请先进行法人实名认证',
        content: '点击确定进行法人实名认证',
        callback: () => {
          this.props.navigation.navigate('RealNameAuth')
        }
      })
    } else {
      const res = await ajaxStore.company.checkProcessStatus({ companyId: companyInfo.companyId })
      console.log(res.data.data, 'processStatus')
      if (res.data && res.data.code === '0') {
        if (res.data.data && res.data.data.processStatus === 1) {
          this.setState({
            processId: res.data.data.processId
          })
          global.alert.show({
            title: '签署会员服务费协议',
            content: '点击按钮立即签署会员服务费协议',
            callback: () => {
              this.getCSContractList({
                name: '',
                page: 1,
                pageSize: 100,
                ownerList: [companyInfo.companyId, this.props.supplierInfo.id]
              })
            }
          })
        } else {
        // 交费弹窗 （sequence === 2 或者 会员过期）
          this.setState({ vipModal: true })
        }
      } else {
        global.alert.show({
          content: res.data.message
        })
      }
    }
  }

  // 合同在线签约
  clickPayMemberFee () {
    // if (this.props.companyInfo.sealStatus) {
    this.props.navigation.navigate('ContractList')
    // } else {
    //   this.props.navigation.navigate('EtcSign', { nextPage: 'ContractList' })
    // }
  }

  async getCSContractList (data) {
    let contractList
    const res = await ajaxStore.contract.getCSContractList(data)
    console.log(res, 'CSres')
    if (res.data && res.data.code === '0') {
      contractList = res.data.data ? res.data.data.records : []
      const memberFeeContractList = contractList.filter((item) => {
        return item.type === '37'
      })
      this.setState({
        memberFeeContractList
      })
      this.processVariables()
    }
  }

  async processVariables () {
    const { memberFeeContractList } = this.state
    const res = await ajaxStore.company.processVariables({ processInstanceId: this.state.processId })
    console.log('processVariables' + res.data.data)
    if (res.data && res.data.data && res.data.code === '0') {
      global.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${res.data.data.contractSignProcessId}&contractCode=${memberFeeContractList[0].code}`, title: '合同签约' })
    }
  }

  // 预览两方合同
  async clickPreviewTwoContract (info) {
    const data = {
      supplierId: info.supplierId,
      categoryCode: info.productVo.categoryCode,
      brandCode: info.productVo.brandCode,
      productCode: info.productCode
    }
    const res = await ajaxStore.contract.getTwoTemplate(data)
    if (res.data && res.data.code === '0') {
      this.previewContractWithFactors(res.data.data)
    }
  }

  // 预览信息系统服务协议
  async clickPreviewInfoServiceContract (info) {
    const data = {
      supplierId: info.supplierId,
      categoryCode: info.productVo.categoryCode,
      brandCode: info.productVo.brandCode,
      productCode: info.productCode
    }
    const res = await ajaxStore.contract.getInfoServiceTemplate(data)

    if (res.data && res.data.code === '0') {
      this.previewContractWithFactors(res.data.data)
    }
  }

  // 预览会员费协议
  async clickPreviewMember () {
    const res = await ajaxStore.contract.getMemberTemplate()
    if (res.data && res.data.code === '0') {
      this.previewContractWithFactors(res.data.data)
    }
  }

  // 展示合同
  async previewContractWithFactors (options) {
    const contractVO = {}
    contractVO.code = options.contractCode
    contractVO.name = options.contractName
    contractVO.templateCode = options.templateCode
    contractVO.fileKey = options.fileKey
    const res = await ajaxStore.contract.previewContract({
      contractVO: JSON.stringify(contractVO),
      elementVoList: JSON.stringify(options.list_element || [])
    })
    if (res.data && res.data.code === '0') {
      console.log(res.data.data)
      this.props.navigation.navigate('PreviewPDF', { buzKey: res.data.data })
    }
  }

  componentDidMount () {
    // const sequence = this.props.companyInfo.sequence
    // if (sequence === 1 || sequence === 3) {
    //   getSecondContractInfo()
    // }
    getCompanyInfo()
    getMemberVipInfo(this.props.companyInfo.companyId)
  }

  render () {
    const { navigation, companyInfo, contractInfo } = this.props
    const { companyTag } = companyInfo
    const sequence = (companyInfo.sequence === 2 && parseInt(companyInfo.vipLevelCode) > 0) ? 3 : companyInfo.sequence
    const { checkbox } = this.state
    return (
      <View style={styles.guideMain}>
        {sequence && sequence < 4 && companyTag.isSupportwoDistribution === '1' ? (
          <View>
            <Text style={styles.guideTitle}>完成以下三步，即可下单</Text>
            <View style={styles.stepMain}>
              <View style={styles.stepLine}></View>
              <View style={styles.stepOperate}>
                {sequence === 1 ? (
                  <View style={styles.stepItem}>
                    <View style={{ ...styles.stepNumber, ...styles.activeStepNumber, ...styles.activeBorder }}>
                      <Text style={{ ...styles.numberText, ...styles.activeNumberText }}>1</Text>
                    </View>
                    <Touchable style={{ ...styles.stepBtn, ...styles.activeStepNumber }} onPress={() => this.toRealName()}>
                      <Text style={{ ...styles.stepName, ...styles.activeNumberText }}>{'法定代表人实名认证'}</Text>
                      { checkbox &&
                        <Iconfont style={styles.iconsItem} color={Color.WHITE} name={'arrow-right1'} size={dp(25)} />
                      }
                    </Touchable>
                    {/* <View style={styles.checkboxWrapper}>
                      <CheckBox
                        style={styles.checkbox}
                        checkBoxColor={Color.TEXT_LIGHT}
                        uncheckedCheckBoxColor={Color.TEXT_LIGHT}
                        checkedCheckBoxColor={'#00b2a9'}
                        onClick={() => {
                          this.setState({
                            checkbox: !this.state.checkbox
                          })
                        }}
                        isChecked={this.state.checkbox}
                        checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                        unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />}
                        rightText={'我已阅读并同意签署'}
                        rightTextStyle={{ color: Color.TEXT_MAIN }}
                      />
                      <Touchable
                        style={styles.linkTextMain}
                        onPress={() => this.clickPreviewMember()}>
                        <Text style={styles.linkText}>{'《会员费协议》'}</Text>
                      </Touchable>
                      {contractInfo.twoPartyContractList && contractInfo.twoPartyContractList.map((item, key) => {
                        return (
                          <Touchable
                            key={key}
                            style={styles.linkTextMain}
                            onPress={() => {
                              this.clickPreviewTwoContract(item)
                            }}>
                            <Text style={styles.linkText}>{`《${item.productName}·两方合同》`}</Text>
                          </Touchable>
                        )
                      })}
                      {contractInfo.infoContractList && contractInfo.infoContractList.map((item, key) => {
                        return (
                          <Touchable
                            key={key}
                            style={styles.linkTextMain}
                            onPress={() => {
                              this.clickPreviewInfoServiceContract(item)
                            }}>
                            <Text style={styles.linkText}>{`《${item.productName}·信息系统服务协议》`}</Text>
                          </Touchable>
                        )
                      })}
                    </View> */}
                  </View>
                ) : (
                  <View style={styles.stepItem}>
                    <View style={{ ...styles.stepNumber, ...styles.successStepNumber }}>
                      <Iconfont name={'icon-complete1'} size={dp(50)} />
                    </View>
                    <Touchable style={styles.stepBtn}>
                      <Text style={{ ...styles.stepName, ...styles.successNumberText }}>{'法定代表人实名认证'}</Text>
                    </Touchable>
                  </View>
                )}
                {sequence === 2 ? (
                  <View style={styles.stepItem}>
                    <View style={{ ...styles.stepNumber, ...styles.activeStepNumber, ...styles.activeBorder }}>
                      <Text style={{ ...styles.numberText, ...styles.activeNumberText }}>2</Text>
                    </View>
                    <Touchable style={{ ...styles.stepBtn, ...styles.activeStepNumber }} onPress={() => this.clickSignContract()}>
                      <Text style={{ ...styles.stepName, ...styles.activeNumberText }}>{'成为会员'}</Text>
                      <Iconfont style={styles.iconsItem} color={Color.WHITE} name={'arrow-right1'} size={dp(25)} />
                    </Touchable>
                  </View>
                ) : sequence < 2 ? (
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.numberText}>2</Text>
                    </View>
                    <Touchable style={styles.stepBtn}>
                      <Text style={styles.stepName}>{'成为会员'}</Text>
                      {sequence === 2 &&
                        <Iconfont style={styles.iconsItem} color={Color.WHITE} name={'arrow-right1'} size={dp(25)} />
                      }
                    </Touchable>
                  </View>
                ) : (
                  <View style={styles.stepItem}>
                    <View style={{ ...styles.stepNumber, ...styles.successStepNumber }}>
                      <Iconfont name={'icon-complete1'} size={dp(50)} />
                    </View>
                    <Touchable style={styles.stepBtn}>
                      <Text style={{ ...styles.stepName, ...styles.successNumberText }}>{'成为会员'}</Text>
                    </Touchable>
                  </View>
                )}
                {sequence === 3 ? (
                  <View style={styles.stepItem}>
                    <View style={{ ...styles.stepNumber, ...styles.activeStepNumber, ...styles.activeBorder }}>
                      <Text style={{ ...styles.numberText, ...styles.activeNumberText }}>3</Text>
                    </View>
                    <Touchable style={{ ...styles.stepBtn, ...styles.activeStepNumber }} onPress={() => this.clickPayMemberFee()}>
                      <Text style={{ ...styles.stepName, ...styles.activeNumberText }}>{'合同在线签约'}</Text>
                      <Iconfont style={styles.iconsItem} color={Color.WHITE} name={'arrow-right1'} size={dp(25)} />
                    </Touchable>
                  </View>
                ) : (
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.numberText}>3</Text>
                    </View>
                    <Touchable style={styles.stepBtn}>
                      <Text style={styles.stepName}>{'合同在线签约'}</Text>
                      {sequence === 3 &&
                        <Iconfont style={styles.iconsItem} color={Color.WHITE} name={'arrow-right1'} size={dp(25)} />
                      }
                    </Touchable>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (null)}
        <ComfirmModal
          title={'知道了'}
          content={'请您先完成法人实名认证'}
          cancelText={'取消'}
          comfirmText={'确定'}
          textAlign={'left'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.clearAccount()
          }}
          infoModal={this.state.infoModal} />
        <VipModal
          navigation={this.props.navigation}
          companyId={this.props.companyInfo.companyId}
          supplierId={this.props.supplierInfo.id}
          companyId={this.props.companyInfo.companyId}
          memberInfo={this.props.companyInfo.memberInfo}
          cancel={() => {
            this.setState({
              vipModal: false
            })
          }}
          show={() => {
            this.setState({
              vipModal: true
            })
          }}
          infoModal={this.state.vipModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  guideMain: {
    marginHorizontal: dp(20),
    paddingVertical: dp(20),
    marginBottom: dp(20)
  },
  guideTitle: {
    textAlign: 'center',
    fontSize: dp(30),
    marginBottom: dp(40),
    fontWeight: 'bold'
  },
  stepMain: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  stepItem: {
    marginBottom: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap'
  },
  stepLine: {
    borderLeftWidth: dp(10),
    width: 0,
    height: '83%',
    borderColor: Color.WHITE,
    marginLeft: dp(60),
    marginTop: dp(20)
  },
  stepOperate: {

  },
  stepNumber: {
    width: dp(50),
    height: dp(50),
    backgroundColor: Color.WHITE,
    borderRadius: dp(100),
    marginLeft: dp(-30),
    marginRight: dp(30),
    marginTop: dp(20)
  },
  activeStepNumber: {
    backgroundColor: Color.THEME
  },
  successStepNumber: {
    borderWidth: 0,
    backgroundColor: null,
    marginTop: dp(18)
  },
  activeBorder: {
    borderWidth: dp(5),
    borderColor: '#d7d7e2',
    width: dp(55),
    height: dp(55)
  },
  numberText: {
    color: Color.THEME,
    textAlign: 'center',
    lineHeight: dp(50),
    fontSize: dp(20)
  },
  activeNumberText: {
    color: Color.WHITE,
    lineHeight: dp(40)
  },
  successNumberText: {
    color: Color.THEME
  },
  stepBtn: {
    width: DEVICE_WIDTH * 0.75,
    backgroundColor: Color.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: dp(20),
    borderRadius: dp(10)
  },
  stepName: {
    color: Color.TEXT_MAIN
  },
  iconsItem: {
    marginTop: dp(8)
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingTop: dp(30),
    paddingHorizontal: dp(50)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.42
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10)
  },
  linkText: {
    color: '#2ea2db'
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    contractInfo: state.contract,
    supplierInfo: state.company.supplier
  }
}

export default connect(mapStateToProps)(Guide)
