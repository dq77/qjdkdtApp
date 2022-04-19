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
import { signerTypeObj, signerTypeSort } from '../../utils/enums'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import ajaxStore from '../../utils/ajaxStore'
import StorageUtil from '../../utils/storageUtil'

/**
 * 签署人
 */
class CSSignPersonList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '合同',
      contractType: '-1',
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
      contractObj: {
        companyName: '',
        businessKey: ''
      },
      signers: []
    }
    this.signConfirm = this.signConfirm.bind(this)
    this.goSign = this.goSign.bind(this)
    this.toWechat = this.toWechat.bind(this)
    this.checkContract = this.checkContract.bind(this)
    this.checkDetail = this.checkDetail.bind(this)
  }

  async componentDidMount () {
    const { processInstanceId, contractCode } = this.props.navigation.state.params
    await this.setState({
      processInstanceId,
      contractCode
    })
    this.getSignerDetail()
  }

  sortSigner (a, b) {
    const aIndex = signerTypeSort.indexOf(a.typeName)
    const bIndex = signerTypeSort.indexOf(b.typeName)
    return aIndex - bIndex
  }

  async getSignerDetail () {
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
          return {
            name: item.variables && item.variables.candidator.name,
            idNumber: item.variables && item.variables.candidator.idNumber,
            organizationId: item.variables && item.variables.candidator.organizationId, // 厂家supplierId或公司cifCompanyId
            typeName: signerTypeObj[item.variables && item.variables.candidator.role],
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
      this.getAgents()
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
    if (item.name && item.idNumber) {
      this.props.navigation.navigate('CSContractSign', this.getParams(item))
    }
  }

  getParams (item) {
    // 保证和小程序兼容，使用参数名与小程序一致
    return {
      contractCode: this.state.contractCode || '',
      processInstanceId: this.state.processInstanceId,
      name: item.name || '',
      idNumber: item.idNumber || '',
      taskId: item.taskId || '',
      contractType: '-1'
    }
  }

  checkDetail (item) {
    this.props.navigation.navigate('CSContractDetail', {
      contractCode: this.state.contractCode,
      processInstanceId: this.state.processInstanceId
    })
  }

  checkContract (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey, version: '2' })
  }

  // 转发的同时把委托人/代理人加入签署人列表
  tapForward (item) {
    if (item.typeName === '经销商委托人' || item.typeName === '厂家代理人') {
      ajaxStore.process.entrust({
        taskId: item.taskId,
        idNumber: item.idNumber,
        name: item.name,
        userType: '1'
      })
    }
  }

  async signConfirm (item) {
    if (item.name && item.idNumber) {
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
      this.tapForward(item)
      this.copyToClipBoard()
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
    const { legalPersonCertId } = companyInfo
    const { title, type, congractStatus, contractObj, signers } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'合同签约'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={styles.header}>
            <Text style={styles.corpName}>{contractObj.companyName}</Text>
            <Text style={styles.deadLineText}>{`合同编号：${contractObj.businessKey}`}</Text>
          </View>
          <View style={styles.contractMain}>
            <View style={styles.signerMain}>
              <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(contractObj.contractFileKey) }}>
                <View style={styles.paperItem}>
                  <View style={styles.label}>
                    <Iconfont name='icon-pdf1' size={dp(50)} />
                    <Text style={styles.contractName}>{contractObj.contractName}</Text>
                  </View>
                  <Iconfont name='arrow-right1' size={dp(30)} />
                </View>
              </Touchable>
              <Text style={styles.pageTitle}>签署人</Text>
              {signers.map((item, key) => {
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
                        item.idNumber === legalPersonCertId ? (
                          <Touchable onPress={() => { this.goSign(item) }}>
                            <Text style={item.name && item.idNumber ? styles.signBtn : styles.disabled}>立即签署</Text>
                          </Touchable>
                        ) : (
                          <Touchable onPress={() => { this.signConfirm(item) }}>
                            <Text style={item.name && item.idNumber ? styles.signBtn : styles.disabled}>转发签署</Text>
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

export default connect(mapStateToProps)(CSSignPersonList)
