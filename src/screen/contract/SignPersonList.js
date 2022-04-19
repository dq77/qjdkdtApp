import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Button, ScrollView, Text, RefreshControl, Linking,
  Clipboard
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { enc, blurIdCard } from '../../utils/Utility'
import { endText, startText, pwd } from '../../utils/config'
import { signerIdentityMap, signerTypeObj, signerTypeSort } from '../../utils/enums'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  getGrarantorList
} from '../../actions'
import ComfirmModal from '../../component/ComfirmModal'
import { StrokeBtn } from '../../component/CommonButton'
import { callPhone } from '../../utils/PhoneUtils'
import ajaxStore from '../../utils/ajaxStore'
import StorageUtil from '../../utils/storageUtil'

/**
 * 签署人
 */
class SignPersonList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
      type: '0', // 0电子合同 1纸质合同
      contractType: '',
      congractStatus: {
        0: {
          statusText: '待签署',
          icon: 'icon-unsigned'
        },
        1: {
          statusText: '已签署',
          icon: 'icon-signed'
        }
      },
      infoModal: false,
      noPersonModal: false,
      shareText: '',
      signers: [],
      contractItem: '',
      guarantor: ''
    }
    this.changeType = this.changeType.bind(this)
    this.signConfirm = this.signConfirm.bind(this)
    this.notShare = this.notShare.bind(this)
    this.goSign = this.goSign.bind(this)
    this.toWechat = this.toWechat.bind(this)
    this.checkContract = this.checkContract.bind(this)
    this.checkDetail = this.checkDetail.bind(this)
  }

  changeType (type) {
    this.setState({
      type
    })
  }

  async componentDidMount () {
    await this.setState({
      title: this.props.navigation.state.params.title || '签署人',
      contractType: this.props.navigation.state.params.contractType,
      processInstanceId: this.props.navigation.state.params.processInstanceId || '',
      contractCode: this.props.navigation.state.params.contractCode || '',
      contractItem: this.props.navigation.state.params.contractItem || '',
      guarantor: this.props.navigation.state.params.guarantor || ''
    })
    this.getSignerDetail()
  }

  async getSignerDetail () {
    switch (this.state.contractType) {
      case '13':
        await getGrarantorList(this.props.companyInfo.legalPersonCertId)
        if (!this.props.guarantorList.length) {
          global.alert.show({
            content: '最高额担保人不存在，请联系管理员添加',
            callback: () => {
              this.props.navigation.goBack()
            }
          })
          // this.setState({
          //   noPersonModal: true
          // })
        }
        break
      case '34':
      case '35':
        this.getContractDetail()
        break
      default:
        break
    }
  }

  async getCSSignerDetail () {
    const res = await ajaxStore.process.getProcessDetail({
      processInstanceId: this.state.processInstanceId
    })
    if (res.data && res.data.code === '0') {
      let signers = []
      const data = res.data.data
      if (data && data.taskList) {
        signers = data.taskList.filter((item) => {
          return item.taskDefKey !== 'paperSign'
        }).map((item) => {
          const signatory = item.variables ? item.variables.signatory : {}
          return {
            identityCardBlured: blurIdCard(signatory.idNumber),
            name: signatory.name,
            idNumber: signatory.idNumber,
            organizationId: signatory.organizationId, // 厂家supplierId或公司cifCompanyId
            typeName: signerTypeObj[signatory.type],
            taskId: item.taskId,
            signStatus: item.isEnd ? '1' : '0',
            deleteReason: item.deleteReason
          }
        })
        signers.sort(this.sortSigner)
      }
      await this.setState({
        signers,
        contractObj: data.appForm
      })
      // this.getAgents()  // 只在客户经理版需要
    }
  }

  async getAgents () {
    const signers = this.state.signers
    const supplierAgent = signers
    let companyAgent = []
    let newSigners
    signers.forEach(async item => {
      if (item.organizationId && item.typeName === '厂家') {
        // 查询厂家代理人
        const data = { supplierId: item.organizationId }
        const res = await ajaxStore.company.getSupplierInfoById(data)
        if (res.data && res.data.code === '0') {
          const { agencyName, agencyIdNo } = res.data.data
          if (agencyName && agencyIdNo) {
            supplierAgent.push({
              name: agencyName,
              idNumber: agencyIdNo,
              typeName: '厂家代理人',
              taskId: item.taskId,
              signStatus: item.signStatus,
              deleteReason: item.deleteReason
            })
            newSigners = this.mixSigners(supplierAgent, companyAgent)
          }
        }
      } else if (item.organizationId && item.typeName === '经销商') {
        // 查询经销商委托人
        const data = { cifCompanyId: item.organizationId }
        const res = await ajaxStore.company.getCompanyInfoById(data)
        if (res.data && res.data.code === '0') {
          if (res.data.data && res.data.data.length > 0) {
            companyAgent = res.data.data.map(item2 => {
              return {
                name: item2.agentName,
                idNumber: item2.agentNumber,
                typeName: '经销商委托人',
                taskId: item.taskId,
                signStatus: item.signStatus,
                deleteReason: item.deleteReason
              }
            })
            newSigners = this.mixSigners(supplierAgent, companyAgent)
          }
        }
      }
    })
  }

  mixSigners (supplierAgent, companyAgent) {
    const newSigners = supplierAgent.concat(companyAgent)
    newSigners.sort(this.sortSigner)
    this.setState({
      signers: newSigners
    })
    return newSigners
  }

  goSign (item) {
    switch (this.state.contractType) {
      case '13':
        this.props.navigation.navigate('ContractSign', this.getParams(item))
        break
      case '34':
        this.props.navigation.navigate('ContractSign', this.getNewParams(item))
        break
      case '35':
        this.props.navigation.navigate('ContractSign', this.getNewParams(item))
        break
      default:
        break
    }
  }

  getParams (item) {
    // 保证和小程序兼容，使用参数名与小程序一致
    return {
      cifCompanyId: this.props.companyInfo.companyId,
      uid: item.id,
      uname: item.name,
      idCard: item.identityCard,
      goNewEsign: item.goNewEsign || '0',
      contractType: this.state.contractType,
      contractCode: item.contractCode || (item.contractVO ? item.contractVO.code || '' : '')
    }
  }

  getNewParams (item) {
    // 保证和小程序兼容，使用参数名与小程序一致
    const contractItem = this.state.contractItem

    return {
      contractType: this.state.contractType || '',
      categoryCode: contractItem.categoryCode || '',
      brandCode: contractItem.brandCode || '',
      brandProductCode: contractItem.brandProductCode || '',
      guarantorId: this.state.guarantor.id || '',
      cifCompanyId: this.props.companyInfo.companyId || '',
      supplierId: contractItem.supplierId || '',
      productCode: contractItem.productCode || '',
      contractCode: contractItem.code || this.state.contractCode,
      processInstanceId: contractItem.processInstanceId || this.state.processInstanceId,
      name: item.name || '',
      idNumber: item.idNumber || '',
      taskId: item.taskId || ''
    }
  }

  checkDetail (item) {
    let code = ''
    console.log(this.state.contractType, 'this.state.contractType')
    switch (this.state.contractType) {
      case '13':
        item.contractVOS.forEach(e => {
          if (e.type === '13') {
            code = e.code
          }
        })
        this.props.navigation.navigate('ContractDetail', {
          contractCode: code || item.contractVO.code,
          title: this.state.title,
          contractType: this.state.contractType
        })
        break
      case '34':
      case '35':
        this.props.navigation.navigate('CSContractDetail', {
          contractCode: this.state.contractCode,
          processInstanceId: this.state.processInstanceId,
          contractType: this.state.contractType
        })
        break
      default:
        this.props.navigation.navigate('ContractDetail', {
          contractCode: code || item.contractVO.code,
          title: this.state.title,
          contractType: this.state.contractType
        })
        break
    }
  }

  notShare () {
    global.alert.show({
      content: '请先签署担保人，再签约对应的配偶'
    })
  }

  async checkContract (item) {
    if (item.contractVO) {
      const res = await ajaxStore.contract.getContract({ contractCode: item.contractVO.code })
      if (res.data && res.data.code === '0') {
        this.props.navigation.navigate('PreviewPDF', { buzKey: res.data.data.fileKey })
      }
    }
  }

  async signConfirm (item) {
    let params
    switch (this.state.contractType) {
      case '13':
        params = this.getParams(item)
        break
      case '34':
      case '35':
        params = this.getNewParams(item)
        break
      default:
        break
    }
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
    this.copyToClipBoard()
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

  sortSigner (a, b) {
    const aIndex = signerTypeSort.indexOf(a.typeName)
    const bIndex = signerTypeSort.indexOf(b.typeName)
    return aIndex - bIndex
  }

  pureData (data) {
    const res = {}
    if (data) {
      for (const key in data) {
        if (data[key] || data[key] === 0) {
          res[key] = data[key]
        }
      }
    }
    return res
  }

  async getContractDetail () {
    const params = this.props.navigation.state.params
    const data = this.state.contractCode
      ? { code: this.state.contractCode }
      : {
        contractType: params.contractType,
        cifCompanyId: this.props.companyInfo.companyId,
        categoryCode: params.categoryCode,
        brandCode: params.brandCode,
        brandProductCode: params.brandProductCode,
        guarantorId: params.guarantor ? params.guarantor.id : '',
        supplierId: params.contractItem ? params.contractItem.supplierId : params.supplierId,
        productCode: params.contractItem ? params.contractItem.productCode : params.productCode
      }
    console.log(this.pureData(data), 'this.pureData(data)')
    const res = await ajaxStore.contract.getContractCode(this.pureData(data))
    if (res.data && res.data.code === '0') {
      let paperList = []
      let contractCode = ''
      let processInstanceId = this.state.processInstanceId
      const data = res.data.data
      if (data && data.code) contractCode = data.code
      if (data && data.processInstanceId) processInstanceId = data.processInstanceId
      if (data && data.fileRels && data.fileRels.length > 0) {
        paperList = data.fileRels.filter(item => item.buzType === 'contractSignPaper')
      }
      paperList.forEach((item) => {
        item.contractName = data.name
      })
      this.setState({
        contractCode,
        processInstanceId,
        paperList,
        contractObj: data
      })
      // 有合同编号则获取签署人列表，没有则生成合同
      if (contractCode) {
        switch (params.contractType) {
          case '34':
          case '35':
            this.getCSSignerDetail()
            break
          default:
            this.getSigners()
            break
        }
      } else this.getContractTemplate()
    }
  }

  // 获取合同模板
  async getContractTemplate () {
    const params = this.props.navigation.state.params
    const data = {
      contractType: params.contractType,
      cifCompanyId: this.props.companyInfo.companyId,
      // categoryCode: params.categoryCode,
      brandCode: params.brandCode,
      brandProductCode: params.brandProductCode,
      guarantorId: params.guarantor ? params.guarantor.id : '',
      supplierId: params.contractItem ? params.contractItem.supplierId : params.supplierId,
      productCode: params.contractItem ? params.contractItem.productCode : params.productCode
    }
    const res = await ajaxStore.contract.getContractTemplate(this.pureData(data))
    if (res.data && res.data.code === '0') {
      this.createContract(res.data.data)
    }
  }

  // 生成合同
  async createContract (templateRes) {
    const res = await ajaxStore.contract.createContract(templateRes)
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.setState({
        contractCode: data.contract.code,
        processInstanceId: data.contract.processInstanceId
      })
      this.getSigners()
    } else {
      this.props.navigation.goBack()
    }
  }

  async getSigners () {
    const res = await ajaxStore.process.getProcessDetail({ processInstanceId: this.state.processInstanceId })
    if (res.data && res.data.code === '0') {
      let signers = []
      const data = res.data.data
      if (data && data.taskList) {
        signers = data.taskList.map((item) => {
          console.log(item.variables.signatory.idNumber, 'item.variables.signatory.idNumber')
          return {
            name: item.variables.signatory.name,
            idNumber: item.variables.signatory.idNumber,
            identityCardBlured: blurIdCard(item.variables.signatory.idNumber),
            typeName: signerTypeObj[item.variables.signatory.type],
            taskId: item.taskId,
            signStatus: item.isEnd ? '1' : '0',
            deleteReason: item.deleteReason
          }
        })
        signers.sort(this.sortSigner)
        this.setState({
          signers
        })
      }
    }
  }

  render () {
    const { navigation, guarantorList, guarantorPaperList, companyInfo } = this.props
    const { title, type, congractStatus, signers, contractType, paperList } = this.state
    const { legalPersonCertId } = companyInfo
    return (
      <View style={styles.container}>
        <NavBar title={title} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.contractMain}>
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
            {type === '0' ? (
              <View style={styles.signerMain}>
                <Text style={styles.pageTitle}>签署人</Text>
                {contractType === '13' && guarantorList.map((item, key) => {
                  return (
                    <View style={styles.contractItem} key={key}>
                      <View style={styles.singerHeader}>
                        <Text>{signerIdentityMap[item.guarantorType]}</Text>
                        <View style={styles.headerRight}>
                          <Text style={styles.statusText}>{congractStatus[parseInt(item.signStatus)].statusText}</Text>
                          <Iconfont style={styles.arrow} name={congractStatus[parseInt(item.signStatus)].icon} size={dp(30)} />
                        </View>
                      </View>
                      <View style={styles.singerContent}>
                        <View>
                          <Text style={styles.statusText}>{`姓名：${item.name}`}</Text>
                          <Text style={styles.statusText}>{`身份证：${item.identityCardBlured}`}</Text>
                        </View>
                        {item.signStatus === '0' ? (
                          item.guarantorType === 'LEGAL' ? (
                            <Touchable onPress={() => { this.goSign(item) }}>
                              <Text style={styles.signBtn}>立即签署</Text>
                            </Touchable>
                          ) : item.isShare ? (
                            <Touchable onPress={() => { this.signConfirm(item) }}>
                              <Text style={styles.signBtn}>委托他/她签署</Text>
                            </Touchable>
                          ) : (
                            <Touchable onPress={() => { this.notShare(item) }}>
                              <Text style={styles.signBtn}>委托他/她签署</Text>
                            </Touchable>
                          )
                        ) : (
                          <Touchable onPress={() => { this.checkDetail(item) }}>
                            <Text style={styles.checkBtn}>查看合同</Text>
                          </Touchable>
                        )}
                      </View>
                    </View>
                  )
                })}
                {contractType === '34' && signers.map((item, key) => {
                  return (
                    <View style={styles.contractItem} key={key}>
                      <View style={styles.singerHeader}>
                        <Text>{item.typeName}</Text>
                        <View style={styles.headerRight}>
                          <Text style={styles.statusText}>{congractStatus[parseInt(item.signStatus)].statusText}</Text>
                          <Iconfont style={styles.arrow} name={congractStatus[parseInt(item.signStatus)].icon} size={dp(30)} />
                        </View>
                      </View>
                      <View style={styles.singerContent}>
                        <View>
                          <Text style={styles.statusText}>{`姓名：${item.name}`}</Text>
                          <Text style={styles.statusText}>{`身份证：${item.identityCardBlured}`}</Text>
                        </View>
                        {item.signStatus === '0' ? (
                          item.idNumber === this.props.companyInfo.legalPersonCertId && item.typeName === '经销商' ? (
                            <Touchable onPress={() => { this.goSign(item) }}>
                              <Text style={styles.signBtn}>立即签署</Text>
                            </Touchable>
                          ) : signers[0].signStatus === '0' && signers.length > 1 && item.typeName !== '经销商委托人' ? (
                            <Touchable>
                              <Text style={{ ...styles.signBtn, ...styles.disabled }}>委托他/她签署</Text>
                            </Touchable>
                          ) : (
                            <Touchable onPress={() => { this.signConfirm(item) }}>
                              <Text style={styles.signBtn}>委托他/她签署</Text>
                            </Touchable>
                          )
                        ) : (
                          <Touchable onPress={() => { this.checkDetail(item) }}>
                            <Text style={styles.checkBtn}>查看合同</Text>
                          </Touchable>
                        )}
                      </View>
                    </View>
                  )
                })}
                {contractType === '35' && signers.map((item, key) => {
                  return (
                    <View style={styles.contractItem} key={key}>
                      <View style={styles.singerHeader}>
                        <Text>{item.typeName}</Text>
                        <View style={styles.headerRight}>
                          <Text style={styles.statusText}>{congractStatus[parseInt(item.signStatus)].statusText}</Text>
                          <Iconfont style={styles.arrow} name={congractStatus[parseInt(item.signStatus)].icon} size={dp(30)} />
                        </View>
                      </View>
                      <View style={styles.singerContent}>
                        {item.name && item.idNumber ? (
                          <View>
                            <Text style={styles.statusText}>{`姓名：${item.name}`}</Text>
                            <Text style={styles.statusText}>{`身份证：${blurIdCard(item.idNumber)}`}</Text>
                          </View>
                        ) : (
                          <View style={styles.warningWarp}>
                            <Iconfont style={styles.warningIcon} name={'icon-warn'} size={dp(40)} />
                            <Text style={styles.tips}>请补充签署人信息</Text>
                          </View>
                        )}

                        {item.signStatus === '0' ? (
                          item.idNumber === legalPersonCertId && item.typeName === '经销商' ? (
                            <Touchable onPress={() => { this.goSign(item) }}>
                              <Text style={item.name && item.idNumber ? styles.signBtn : styles.disabled}>立即签署</Text>
                            </Touchable>
                          ) : signers[0].signStatus === '0' && signers.length > 1 && item.typeName !== '经销商委托人' ? (
                            <Text style={{ ...styles.signBtn, ...styles.disabled }}>委托他/她签署</Text>
                          ) : (
                            <Touchable onPress={() => { this.signConfirm(item) }}>
                              <Text style={styles.signBtn}>委托他/她签署</Text>
                            </Touchable>
                          )
                        ) : (
                          <Touchable onPress={() => { this.checkDetail(item) }}>
                            <Text style={styles.checkBtn}>查看合同</Text>
                          </Touchable>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            ) : (
              <View style={styles.paperMain}>
                {contractType === '13' && guarantorPaperList.length > 0 &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      {guarantorPaperList.map((item, key) => {
                        return (
                          <Touchable onPress={() => { this.checkContract(item) }} key={key}>
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
                {contractType === '34' && paperList.length > 0 &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      {paperList.map((item, key) => {
                        return (
                          <Touchable onPress={() => { this.checkContract(item) }} key={key}>
                            <View style={styles.paperItem}>
                              <View style={styles.label}>
                                <Iconfont name='icon-pdf1' size={dp(50)} />
                                <Text style={styles.contractName}>{item.contractName}</Text>
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
        <ComfirmModal
          title={'提示'}
          content={'最高额担保人不存在，请联系管理员添加'}
          cancelText={'取消'}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({
              noPersonModal: false
            })
          }}
          confirm={() => {
            this.setState({
              noPersonModal: false
            })
            this.props.navigation.goBack()
          }}
          textAlign={'center'}
          infoModal={this.state.noPersonModal} />
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
    fontWeight: 'bold',
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
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead'
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

export default connect(mapStateToProps)(SignPersonList)
