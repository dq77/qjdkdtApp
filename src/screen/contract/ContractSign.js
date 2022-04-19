import React, { PureComponent } from 'react'
import { View, StyleSheet, Button, ScrollView, Text, RefreshControl, TextInput } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  getSecondContractInfo,
  getOtherContractList,
  getCSContractList,
  setFaceExtraData
} from '../../actions'
import ajaxStore from '../../utils/ajaxStore'
import CheckBox from 'react-native-check-box'
import { SolidBtn } from '../../component/CommonButton'
import { showToast } from '../../utils/Utility'
import { getLocation } from '../../utils/LocationUtils'
import { contractType, fundSource } from '../../utils/enums'

/**
 * 合同签署
 */
class ContractSign extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      contractType: '',
      uid: '',
      uname: '',
      idCard: '',
      goNewEsign: '',
      contractCode: '',
      cifCompanyId: '',
      contractName: '',
      elementList: [],
      elements: { result: [] },
      templateCode: '',
      fileKey: '',
      detailShow: false,
      electronShow: false,
      checkbox: true,
      source: '',
      fundSource: '',
      contractObj: {}
    }
    this.checkContractTemplate = this.checkContractTemplate.bind(this)
    this.changeDetailShow = this.changeDetailShow.bind(this)
    this.previewContract = this.previewContract.bind(this)
    this.toIdentity = this.toIdentity.bind(this)
  }

  async componentDidMount () {
    const params = this.props.navigation.state.params
    const companyInfo = this.props.companyInfo
    let title
    await this.setState({
      contractType: params.contractType,
      contractCode: params.contractCode,
      cifCompanyId: params.cifCompanyId,
      uname: companyInfo.legalPerson,
      idCard: companyInfo.legalPersonCertId
    })
    console.log(this.state.contractType, 'this.state.contractType')
    switch (this.state.contractType) {
      case '10': // 会员费协议
        this.getMemberTemplate()
        break
      case '12': // 两方合同
        await this.setState({
          fundSource: params.fundSource,
          supplierId: params.supplierId,
          productCode: params.productCode
        })
        this.getTwoTemplate()
        break
      case '13': // 最高额保证合同
        await this.setState({
          uid: params.uid,
          uname: params.uname,
          idCard: params.idCard,
          goNewEsign: params.goNewEsign,
          source: params.source
        })
        if (params.source === 'share') {
          this.getGuarantorTemplateFromShare()
        } else {
          this.getGuarantorTemplate()
        }
        break
      case '17': // 居间服务协议
      case '25': // 南京居间服务协议
        await this.setState({
          fundSource: params.fundSource,
          supplierId: params.supplierId,
          productCode: params.productCode
        })
        this.getServiceFeeTemplate(this.state.contractType)
        break
      case '23': // 信息系统服务协议
        if (params.version) {
          this.getContractDetail()
        } else {
          await this.setState({
            fundSource: params.fundSource,
            supplierId: params.supplierId,
            productCode: params.productCode
          })
          this.getInfoServiceTemplate()
        }
        break
      case '34': // 担保函
      case '35': // 无票两方合同
        await this.setState({
          source: params.source,
          taskId: params.taskId,
          contractCode: params.contractCode,
          processInstanceId: params.processInstanceId
        })
        this.getProcessDetail()
        break
      default:
        break
    }
    this.setState({
      title: contractType[parseInt(this.state.contractType)]
    })
  }

  async getContractDetail () {
    const params = this.props.navigation.state.params
    const companyInfo = this.props.companyInfo
    const res = await ajaxStore.contract.getContractCode({
      contractType: params.contractType,
      cifCompanyId: companyInfo.companyId,
      categoryCode: params.categoryCode,
      brandCode: params.brandCode,
      brandProductCode: params.brandProductCode,
      supplierId: params.supplierId,
      productCode: params.productCode
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      let contractCode = ''
      let processInstanceId = ''
      if (data && data.code) contractCode = data.code
      if (data && data.processInstanceId) processInstanceId = data.processInstanceId
      this.setState({
        contractCode,
        processInstanceId
      })
      // 有合同编号则获取签署人详情，没有则生成合同
      if (contractCode && processInstanceId) this.getProcessDetail()
      else this.getContractTemplate()
    }
  }

  async getContractTemplate () {
    const companyInfo = this.props.companyInfo
    const params = this.props.navigation.state.params
    const res = await ajaxStore.contract.getContractTemplate({
      contractType: params.contractType,
      cifCompanyId: companyInfo.companyId,
      brandCode: params.brandCode,
      brandProductCode: params.brandProductCode,
      guarantorId: params.guarantorId,
      supplierId: params.supplierId,
      productCode: params.productCode
    })
    if (res.data && res.data.code === '0') {
      const templateRes = res.data.data
      this.setState({ templateRes })
      this.createContract()
    } else {
      this.props.navigation.goBack()
    }
  }

  async createContract () {
    const templateRes = this.state.templateRes
    const res = await ajaxStore.contract.createContract({
      templateRes
    })
    if (res.data && res.data.code === '0') {
      this.setState({
        contractCode: res.data.datacontract.code,
        processInstanceId: res.data.data.contract.processInstanceId
      })
      this.getProcessDetail()
    }
  }

  async getProcessDetail () {
    const params = this.props.navigation.state.params
    const res = await ajaxStore.process.getTaskDetail({ processInstanceId: this.state.processInstanceId, taskId: this.state.taskId })
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      if (data.flowStatus === 1) {
        this.props.navigation.replace('ContractDetail', { contractCode: this.state.contractCode, processInstanceId: this.state.processInstanceId, contractType: this.state.contractType })
        return
      }
      const elements = data.elements ? JSON.parse(data.elements) : { result: [] }
      const contractObj = {
        contractTemplateName: data.contractTemplateName,
        contractTemplateFileKey: data.contractTemplateFileKey,
        contractFileKey: data.contractFileKey
      }
      const name = params.version ? data.signatoryList[0].name : (params.name || data.signatoryList[0].name)
      const idNumber = params.idNumber || data.signatoryList[0].idNumber
      const signerInfo = {
        memberId: data.signatoryList[0].idNumber,
        name,
        idNumber,
        taskId: params.taskId
      }
      this.setState({
        elements,
        contractObj,
        fileKey: contractObj.contractTemplateFileKey,
        signerInfo,
        detailShow: true
      })
      if (!params.taskId) this.getTaskId()
    }
  }

  async getTaskId () {
    const data = {
      processInstanceId: this.state.processInstanceId,
      taskId: this.state.taskId || ''
    }
    const res = await ajaxStore.process.getTaskList(data)
    if (res.data && res.data.code === '0') {
      const signerInfo = this.state.signerInfo
      const data = res.data.data
      if (data && data.currentTask) {
        signerInfo.taskId = data.currentTask.taskId
        this.setState({ signerInfo })
      }
    }
  }

  async getGuarantorTemplate () {
    const res = await ajaxStore.contract.getGuarantorTemplate({ guarantorId: this.state.uid })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: this.state.goNewEsign === '1' ? this.state.contractCode || data.contractCode : data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true,
        electronShow: true
      })
    }
  }

  async getGuarantorTemplateFromShare () {
    const res = await ajaxStore.contract.getGuarantorTemplateFromShare({ guarantorId: this.state.uid, cifCompanyId: this.state.cifCompanyId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: this.state.goNewEsign === '1' ? this.state.contractCode || data.contractCode : data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true,
        electronShow: true
      })
    }
  }

  async getMemberTemplate () {
    const res = await ajaxStore.contract.getMemberTemplate()
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true
      })
    } else {
      this.props.navigation.goBack()
    }
  }

  async getInfoServiceTemplate () {
    const { supplierId, productCode, categoryCode, brandCode } = this.props.navigation.state.params
    const res = await ajaxStore.contract.getInfoServiceTemplate({
      supplierId, productCode, categoryCode, brandCode
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true
      })
    } else {
      this.props.navigation.goBack()
    }
  }

  async getServiceFeeTemplate (type) {
    const { supplierId, productCode, categoryCode, brandCode } = this.props.navigation.state.params
    let res
    if (type === '25') {
      res = await ajaxStore.contract.getNJServiceFeeTemplate({
        supplierId, productCode, categoryCode, brandCode
      })
    } else {
      res = await ajaxStore.contract.getServiceFeeTemplate({
        supplierId, productCode, categoryCode, brandCode
      })
    }
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true
      })
    } else {
      this.props.navigation.goBack()
    }
  }

  async getTwoTemplate () {
    const { supplierId, productCode, categoryCode, brandCode } = this.props.navigation.state.params
    const res = await ajaxStore.contract.getTwoTemplate({
      supplierId, productCode, categoryCode, brandCode
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        cifCompanyId: data.cifCompanyId,
        contractName: data.contractName,
        contractCode: data.contractCode,
        templateCode: data.templateCode,
        fileKey: data.fileKey,
        elementList: data.list_element,
        detailShow: true
      })
    } else {
      this.props.navigation.goBack()
    }
  }

  async previewContract () {
    if (this.state.contractType === '34' || this.state.contractType === '35') {
      this.checkContractTemplate(this.state.contractObj.contractFileKey)
    } else {
      const data = this.state
      const contractVO = {
        code: data.contractCode,
        name: data.contractName,
        templateCode: data.templateCode,
        fileKey: data.fileKey
      }
      const elementVoList = data.elementList
      const res = await ajaxStore.contract.previewContract({
        contractVO: JSON.stringify(contractVO),
        elementVoList: JSON.stringify(elementVoList)
      })
      if (res.data && res.data.code === '0') {
        this.props.navigation.navigate('PreviewPDF', { buzKey: res.data.data })
      }
    }
  }

  checkContractTemplate (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey || this.state.fileKey })
  }

  changeDetailShow () {
    this.setState({
      detailShow: !this.state.detailShow
    })
  }

  goFaceIdentity () {
    const { idCard, uname } = this.state
    this.props.navigation.navigate('FaceIdentity', {
      idcardName: uname,
      idcardNumber: idCard
    })
  }

  async getParamsData () {
    const map = await getLocation()
    console.log(map)
    if (!map) {
      this.props.navigation.goBack()
      return
    }
    const { uname, contractCode, cifCompanyId, contractName, templateCode, fileKey, elementList, contractType } = this.state
    const contractElementValueVOlist = []

    elementList.forEach((item, index) => {
      contractElementValueVOlist.push({
        contractCode: contractCode,
        elementKey: item.keyName,
        elementValue: item.keyValue
      })
    }
    )

    return {
      contractFormVO: {
        code: cifCompanyId,
        type: 'company'
      },
      contractVO: {
        code: contractCode,
        name: contractName,
        type: contractType,
        templateCode,
        signName: uname,
        lng: map.longitude,
        lat: map.latitude,
        fileKey
      },
      contractElementValueVOlist,
      contractType,
      contractCode,
      cifCompanyId,
      lng: map.longitude,
      lat: map.latitude
    }
  }

  async signGuarantor () {
    global.loading.show()
    const paramsData = await this.getParamsData()
    if (paramsData) {
      const { uid, cifCompanyId, goNewEsign, source } = this.state
      await setFaceExtraData({
        ...paramsData,
        contractFormVO: {
          code: uid,
          type: 'guarantor'
        },
        personArea: '0',
        cifCompanyId,
        goNewEsign: goNewEsign || '0',
        source: source
      })
      this.goFaceIdentity()
    }
    global.loading.hide()
  }

  async signMemeber () {
    global.loading.show()
    const paramsData = await this.getParamsData()
    if (paramsData) {
      await setFaceExtraData({
        ...paramsData
      })
      this.goFaceIdentity()
    }
    global.loading.hide()
  }

  async signTwo () {
    global.loading.show()
    const paramsData = await this.getParamsData()
    if (paramsData) {
      let { contractVO } = paramsData
      const type = fundSource[parseInt(this.state.fundSource)] ? fundSource[parseInt(this.state.fundSource)] : '12'
      contractVO = {
        ...contractVO,
        type,
        supplierId: this.state.supplierId,
        productCode: this.state.productCode
      }

      await setFaceExtraData({
        ...paramsData,
        contractType: type,
        contractVO
      })
      this.goFaceIdentity()
    }
    global.loading.hide()
  }

  async signInfo () {
    global.loading.show()
    const paramsData = await this.getParamsData()
    if (paramsData) {
      let { contractVO } = paramsData
      contractVO = {
        ...contractVO,
        supplierId: this.state.supplierId,
        productCode: this.state.productCode
      }
      await setFaceExtraData({
        ...paramsData,
        contractType: this.state.contractType,
        contractVO
      })
      this.goFaceIdentity()
    }
    global.loading.hide()
  }

  async signService () {
    global.loading.show()
    const paramsData = await this.getParamsData()
    if (paramsData) {
      let { contractVO } = paramsData
      const { contractType } = this.state
      contractVO = {
        ...contractVO,
        type: contractType,
        supplierId: this.state.supplierId,
        productCode: this.state.productCode
      }
      await setFaceExtraData({
        ...paramsData,
        contractType,
        contractVO
      })
      this.goFaceIdentity()
    }
    global.loading.hide()
  }

  async signNoTicket () {
    global.loading.show()
    const map = await getLocation()
    console.log(map)
    if (!map) {
      this.props.navigation.goBack()
      return
    }
    const signerInfo = this.state.signerInfo
    const elements = this.state.elements && JSON.stringify(this.state.elements)

    await setFaceExtraData({
      source: this.state.source,
      contractType: this.state.contractType,
      contractCode: this.state.contractCode,
      processInstanceId: this.state.processInstanceId,
      lng: map.longitude,
      lat: map.latitude,
      isPass: 'Y',
      elements,
      memberId: signerInfo.idNumber,
      taskId: signerInfo.taskId || '',
      name: signerInfo.name,
      idNumber: signerInfo.idNumber,
      version: '2'
    })
    this.setState({
      uname: signerInfo.name,
      idCard: signerInfo.idNumber
    })
    this.goFaceIdentity()
    global.loading.hide()
  }

  toIdentity () {
    if (this.state.checkbox) {
      if (this.state.contractType === '13' || this.validateSign()) {
        switch (this.state.contractType) {
          case '10':
            this.signMemeber()
            break
          case '12':
            this.signTwo()
            break
          case '17':
          case '25':
            this.signService()
            break
          case '13':
            this.signGuarantor()
            break
          case '23':
            if (this.props.navigation.state.params.version) {
              this.signNoTicket()
            } else {
              this.signInfo()
            }
            break
          case '34':
          case '35':
            this.signNoTicket()
            break
          default:
            break
        }
      }
    } else {
      global.alert.show({
        content: '请先阅读并同意相关协议及合同'
      })
    }
  }

  // 验证合同要素是否填写
  validateSign () {
    let isOk = true
    const elementList = this.state.elementList
    for (let i = 0; i < elementList.length; i++) {
      if (elementList[i].keyValue === '' || elementList[i].keyValue === null) {
        global.alert.show({
          content: `请填写${elementList[i].keyName}`
        })
        isOk = false
        break
      }
    }
    if (!isOk) { return false }
    return true
  }

  render () {
    const { navigation } = this.props
    const { title, contractName, detailShow, elementList, electronShow, contractType, contractObj, elements } = this.state
    const { uname, idCard, version } = this.props.navigation.state.params
    return (
      <View style={styles.container}>
        <NavBar title={title} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.signMain}>
            <Text style={styles.pageTitle}>合同模板</Text>
            <View style={styles.paperItemMain}>
              <Touchable isNativeFeedback={true} onPress={() => { this.checkContractTemplate() }}>
                <View style={styles.paperItem}>
                  <View style={styles.label}>
                    <Iconfont name='icon-pdf1' size={dp(50)} />
                    {contractType === '10' || contractType === '13' ? (
                      <Text style={styles.contractName}>{title}</Text>
                    ) : ((contractType === '23' && version) || contractType === '34' || contractType === '35') && contractObj.contractTemplateName ? (
                      <Text style={styles.contractName}>{`${contractObj.contractTemplateName}`}</Text>
                    ) : (
                      <Text style={styles.contractName}>{`${contractName}·${title}`}</Text>
                    )}
                  </View>
                  <Iconfont name='arrow-right1' size={dp(30)} />
                </View>
              </Touchable>
            </View>
            <View style={styles.elementTitle}>
              <Text style={styles.elementTitleText}>合同要素</Text>
              {!detailShow ? (
                <Text onPress={() => { this.changeDetailShow() }} style={styles.showDetailText}>展开清单</Text>
              ) : (
                <Text onPress={() => { this.changeDetailShow() }} style={styles.showDetailText}>收起清单</Text>
              )}
            </View>
            {detailShow &&
              <View style={styles.elementWarp}>
                {(contractType === '23' && version) || contractType === '34' || contractType === '35' ? elements.results && elements.results.map((item, key) => {
                  return (
                    <View style={styles.detailItem} key={key}>
                      <Text style={styles.detailLabel}>{item.value.key}</Text>
                      <TextInput
                        placeholder={`请填写${item.value.key}`}
                        placeholderTextColor={'#ddd'}
                        autoCapitalize={'none'}
                        style={styles.textInput}
                        editable={item.element.editable}
                        defaultValue={item.value.value}
                        maxLength={100}
                        onChangeText={text => {
                          elementList.result[key].value.value = text
                          this.setState({ elementList })
                        }}
                        multiline={true}
                      />
                    </View>
                  )
                }) : elementList.map((item, key) => {
                  return (
                    <View style={styles.detailItem} key={key}>
                      <Text style={styles.detailLabel}>{item.keyName}</Text>
                      <TextInput
                        placeholder={`请填写${item.keyName}`}
                        placeholderTextColor={'#ddd'}
                        autoCapitalize={'none'}
                        style={styles.textInput}
                        editable={item.edit}
                        defaultValue={item.keyValue}
                        maxLength={100}
                        onChangeText={text => {
                          elementList[key].keyValue = text
                          this.setState({ elementList })
                        }}
                        multiline={true}
                      />
                    </View>
                  )
                })}
                {electronShow &&
                  <View>
                    <Text style={styles.elementOtherTitleText}>个人电子签章信息补充</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>姓名</Text>
                      <Text style={styles.detailContent}>{uname}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>姓名</Text>
                      <Text style={styles.detailContent}>{idCard}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>身份证归属地</Text>
                      <Text style={styles.detailContent}>大陆</Text>
                    </View>
                  </View>
                }
              </View>
            }
            <View style={styles.checkboxWrapper}>
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
                rightText={''}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <View style={styles.linkTextMain}>
                <Text style={styles.normalText}>我已阅读并同意</Text>
                <Touchable
                  onPress={() => {
                    navigation.navigate('AuthAgent')
                  }}>
                  <Text style={styles.linkText}>{'《用户授权协议》'}</Text>
                </Touchable>
                <Text style={styles.normalText}>、</Text>
                <Touchable
                  onPress={() => {
                    this.previewContract()
                  }}>
                  {contractType === '10' || contractType === '13' ? (
                    <Text style={styles.linkText}>{`《${title}》`}</Text>
                  ) : ((contractType === '23' && version) || contractType === '34' || contractType === '35') && contractObj.contractTemplateName ? (
                    <Text style={styles.linkText}>{`《${contractObj.contractTemplateName}》`}</Text>
                  ) : (
                    <Text style={styles.linkText}>{`《${contractName}·${title}》`}</Text>
                  )}
                </Touchable>
                <Text style={styles.normalText}>（完整版协议PDF文档）</Text>
              </View>
            </View>
            <View style={styles.btnWarp}>
              <SolidBtn text='立即签署' onPress={() => { this.toIdentity() }} />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  signMain: {
    paddingBottom: dp(100)
  },
  pageTitle: {
    fontSize: dp(34),
    fontWeight: 'bold',
    paddingHorizontal: dp(30),
    paddingVertical: dp(50)
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
  label: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  contractName: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.8
  },
  elementWarp: {
    marginBottom: dp(50)
  },
  elementTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: dp(30)
  },
  elementTitleText: {
    fontSize: dp(34),
    fontWeight: 'bold',
    paddingVertical: dp(50)
  },
  showDetailText: {
    color: '#2ea2db',
    fontSize: dp(28)
  },
  detailItem: {
    backgroundColor: Color.WHITE,
    padding: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: dp(30),
    width: DEVICE_WIDTH * 0.3,
    marginRight: dp(30)
  },
  detailContent: {
    color: '#888',
    width: DEVICE_WIDTH * 0.6
  },
  elementOtherTitleText: {
    color: '#888',
    fontSize: dp(30),
    padding: dp(30)
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    color: Color.TEXT_LIGHT,
    paddingHorizontal: dp(30),
    marginBottom: dp(50)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.07
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
  },
  linkTextMain: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    width: DEVICE_WIDTH * 0.8
  },
  linkText: {
    color: '#2ea2db'
  },
  btnWarp: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  textInput: {
    width: DEVICE_WIDTH * 0.6,
    color: '#888'
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(ContractSign)
