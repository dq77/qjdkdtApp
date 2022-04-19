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
class CSContractDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      done: false,
      title: '',
      type: '0', // 0电子合同 1纸质合同
      contractCode: '',
      processInstanceId: '',
      elecList: [],
      paperList: [],
      contractObj: '',
      signerList: []
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
    const { contractCode, processInstanceId, contractType } = this.props.navigation.state.params
    await this.setState({
      contractType,
      contractCode,
      processInstanceId
    })
    if (contractCode) {
      switch (contractType) {
        case '23':
        case '34':
        case '35':
          this.getNewContractDetail()
          break
        default:
          this.getContractDetail()
          break
      }
    } else {
      this.getProcessInfo()
    }
  }

  async getProcessInfo () {
    const res = await ajaxStore.process.getProcessDetail({ processInstanceId: this.state.processInstanceId })
    if (res.data && res.data.code === '0') {
      const contractCode = res.data.data.appForm.businessKey
      this.setState({ contractCode })
      this.getContractDetail()
    }
  }

  async getNewContractDetail () {
    const res = await ajaxStore.contract.getContractCode({ code: this.state.contractCode })
    if (res.data && res.data.code === '0') {
      let elecList = []
      let paperList = []
      const data = res.data.data
      if (data.fileRels && data.fileRels.length > 0) {
        elecList = data.fileRels.filter(item => item.buzType === 'contractSign')
        paperList = data.fileRels.filter(item => item.buzType === 'contractSignPaper')
      }
      elecList.forEach((item) => { item.contractName = data.name })
      paperList.forEach((item) => { item.contractName = data.name })
      this.setState({
        done: true,
        elecList,
        paperList,
        contractObj: data
      })
      this.getTaskList()
    }
  }

  async getContractDetail () {
    const res = await ajaxStore.contract.getContractDetail({ contractCode: this.state.contractCode })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      let elecList = []
      let paperList = []
      const title = contractType[parseInt(data.type)]
      if (data.attachmentSet && data.attachmentSet.elements && data.attachmentSet.elements.length > 0) {
        elecList = data.attachmentSet.elements.filter(item => item.fileBizType === 'contractSignElectronic')
        paperList = data.attachmentSet.elements.filter(item => item.fileBizType === 'contractSignPaper')
      }
      elecList.forEach((item) => { item.contractName = item.fileName })
      paperList.forEach((item) => { item.contractName = item.fileName })

      this.setState({
        done: true,
        title,
        elecList,
        paperList,
        contractObj: data
      })
      this.getTaskList()
    }
  }

  async getTaskList () {
    const data = {
      processInstanceId: this.state.processInstanceId,
      taskId: ''
    }
    const res = await ajaxStore.process.getTaskList(data)
    if (res.data && res.data.code === '0') {
      const signerList = []
      const data = res.data.data
      if (data && data.historicTasks && data.historicTasks.length > 0) {
        data.historicTasks.forEach((item) => {
          item.formParse = item.form && JSON.parse(item.form)
          if (item.taskDefKey !== 'paperSign' && item.formParse && item.formParse.name) signerList.push(item)
        })
      }
      this.setState({ signerList })
    }
  }

  toSign () {
    this.props.navigation.navigate('CSSignPersonList', {
      contractCode: this.state.contractCode,
      processInstanceId: this.state.processInstanceId
    })
  }

  checkContract (fileKey) {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey, version: '2' })
  }

  render () {
    const { navigation, guarantorPaperList } = this.props
    const { title, type, elecList, signerList, paperList, done } = this.state
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
              <View style={styles.electronMain}>
                <Text style={styles.electronTitle}>已签署的电子合同</Text>
                {elecList.length ? (
                  elecList.map((item, key) => {
                    return (
                      <Touchable isNativeFeedback={true} key={key} onPress={() => { this.checkContract(item.fileKey) }}>
                        <View style={styles.paperItem}>
                          <View style={styles.label}>
                            <Iconfont name='icon-pdf1' size={dp(50)} />
                            <Text style={styles.contractName}>{item.contractName}</Text>
                          </View>
                          <Iconfont name='arrow-right1' size={dp(30)} />
                        </View>
                      </Touchable>
                    )
                  })
                ) : done ? (
                  <View style={styles.infoWarp}>
                    <Text style={styles.infoText}>您尚未签署电子合同，可点击下方按钮签署</Text>
                    <StrokeBtn text='签署电子合同' onPress={() => { this.toSign() }} />
                  </View>
                ) : (null)}
                <View style={styles.signDetail}>
                  {signerList.length > 0 ? (
                    <View>
                      <Text style={styles.detailTitle}>签署详情</Text>
                      <View>
                        {signerList.map((item, key) => {
                          return (
                            <View style={styles.detailContent} key={key}>
                              <Text style={styles.detailText}>{`签署人：${item.formParse.name}`}</Text>
                              <Text style={styles.detailText}>{`签署地点：${item.formParse.attribution}`}</Text>
                              {item.formParse.lng !== 'undefined' && item.formParse.lat !== 'undefined' ? (
                                <Text style={styles.detailText}>{`GPS：${item.formParse.lng}, ${item.formParse.lat}`}</Text>
                              ) : (
                                <Text style={styles.detailText}>{'GPS：'}</Text>
                              )}
                              <Text style={styles.detailText}>{`签署时间：${item.endTime}`}</Text>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  ) : (
                    null
                  )
                  }
                </View>

              </View>
            ) : (
              <View style={styles.paperMain}>
                {paperList.length > 0 &&
                  <View>
                    <Text style={styles.paperTitle}>已签署的纸质合同</Text>
                    <View style={styles.paperItemMain}>
                      {paperList.map((item, key) => {
                        return (
                          <Touchable isNativeFeedback={true} onPress={() => { this.checkContract(item.fileKey) }} key={key}>
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

export default connect(mapStateToProps)(CSContractDetail)
