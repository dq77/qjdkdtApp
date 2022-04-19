import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput, FlatList } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, getStatusBarHeight, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import Modal from 'react-native-modal'
import { SolidBtn } from '../../../component/CommonButton'
import ComfirmModal from '../../../component/ComfirmModal'
import ajaxStore from '../../../utils/ajaxStore'
import { webUrl } from '../../../utils/config'
import PermissionUtils from '../../../utils/PermissionUtils'

export default class EnterpriseFillInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      inputSearchTextNum: 0,
      inputSearchText: '',
      selectItemRow: -1,
      selectItemData: {},
      infoModal: false,
      comfirmModal: false,
      bankNameData: [],
      bankCard: '',
      bankCardName: '',
      flowId: '',
      appForm: {}
    }
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.getProcessDetail()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  async getProcessDetail () {
    const { navigation } = this.props
    const { currentTask } = navigation.state.params
    const res = await ajaxStore.process.getProcessDetail({ processInstanceId: currentTask.processInstanceId })
    console.log(res)
    if (res.data && res.data.code === '0') {
      this.setState({
        appForm: res.data.data.appForm
      })
      this.threeFactors()
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async threeFactors () {
    const data = {
      idcardName: this.state.appForm.legalPersonName, // 法人
      companyName: this.state.appForm.companyName, // 公司名称
      orgCode: this.state.appForm.orgCode// 工商注册号
    }
    // 测试用
    // const data = {
    //   idcardName: '林顾强', // 法人
    //   companyName: '杭州仟金顶物流有限公司', // 公司名称
    //   orgCode: '91330108MA2AX1HK4E'// 工商注册号
    // }
    const res = await ajaxStore.credit.threeFactors(data)
    if (res.data && res.data.code === 0) {
      this.setState({
        flowId: res.data.data.flowId
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 先调用列表接口查当前认证状态，然后如果已经开始，那么直接根据taskStack接口判断进入到哪个流程。如果没有开始流程，那么申请开始流程，然后再判断应该进入哪个流程
  async customerList (data) {
    global.loading.show()
    const res = await ajaxStore.credit.customerList({ cifCompanyId: this.state.appForm.companyId })
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      if (res.data.data.customerCorpInfo.authStatus === '1') {
        // 当前处于认证中
        this.taskStack()
      } else if (res.data.data.customerCorpInfo.authStatus === '2') {
        // 当前处于认证成功
        this.props.navigation.navigate('EnterpriseInfo', {
          type: '2',
          itemData: res.data.data.customerCorpInfo,
          personName: res.data.data.handlerPersonList[0].personName
        })
      } else {
        // 当前处于其他要重新开启认证的状态,回到实名认证首页
        this.props.navigation.navigate('RealNameAuth')
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskSubmit (taskStackData) {
    const data = {
      memberId: this.state.appForm.handlerIdNumber,
      taskId: taskStackData.taskId,
      isPass: 'Y',
      bankName: this.state.selectItemData.bank, // 开户行名称
      bankProvince: this.state.selectItemData.province, // 开户行所在省份
      bankCity: this.state.selectItemData.city, // 开户行所在城市
      subBankName: this.state.selectItemData.bankName, // 开户支行名称
      cnapsCode: this.state.selectItemData.cnapsCode, // 联行号
      bankAccount: this.state.bankCard.replace(/\s+/g, '') // 开户行账号
    }
    const res = await ajaxStore.credit.taskSubmit(data)
    if (res.data && res.data.code === '0') {
      this.props.navigation.navigate('EnterprisePlayVali', { currentTask: taskStackData })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskStack () {
    const data = {
      processInstanceId: this.state.appForm.processInstanceId,
      taskId: ''
    }
    const res = await ajaxStore.credit.taskStack(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data.currentTask.taskDefKey === 'PERSON_FACTOR') {
        this.props.navigation.navigate('EnterpriseRealAuth', { currentTask: res.data.data.currentTask })
      } else if (res.data.data.currentTask.taskDefKey === 'BANK_INFO') {
        this.taskSubmit(res.data.data.currentTask)
      } else if (res.data.data.currentTask.taskDefKey === 'AMOUNT_CHECK') {
        this.props.navigation.navigate('EnterprisePlayVali', { currentTask: res.data.data.currentTask })
      } else if (res.data.data.currentTask.taskDefKey === 'FACE_RECOGNIZATION') {
        // 权限申请
        const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
        if (!hasPermission) { return }
        this.faceFace(res.data.data.currentTask)
      } else {
        this.taskSubmit(res.data.data.currentTask)
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async faceFace (taskStackData) {
    const data = {
      idcardName: this.state.appForm.legalPersonName,
      idcardNumber: this.state.appForm.legalPersonIdNum,
      callBackUrl: `${webUrl}/mine/faceNuclearBody?memberId=${this.state.appForm.legalPersonIdNum}&taskId=${taskStackData.currentTask.taskId}`
    }
    const res = await ajaxStore.credit.faceFace(data)
    if (res.data && res.data.code === 0) {
      this.setVariablesLocal(res.data.data, taskStackData.currentTask.taskId)
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async setVariablesLocal (faceFaceData, taskId) {
    const { navigation } = this.props
    const data = {
      eFlowId: faceFaceData.flowId
    }
    const res = await ajaxStore.credit.setVariablesLocal(taskId, data)
    if (res.data && res.data.code === '0') {
      navigation.navigate('WebView', { url: faceFaceData.originalUrl, title: '人脸识别', faceFace: faceFaceData })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  toSignerList (item, index, section) {
    console.log(item, index, section)
    this.setState({
      selectItemRow: item.row,
      selectItemData: item.itemData
    })
  }

  renderItem (data) {
    const { item, index } = data
    return (
      <Touchable onPress={() => { this.toSignerList(item, index) }}>
        <View key={index} style={styles.statusWrap}>
          <Text style={styles.itemStatus}>{item.name}</Text>
          <Iconfont style={styles.statusIcon} name={ this.state.selectItemRow === item.row ? 'icon-signed' : ''} size={dp(46)} />
        </View>
      </Touchable>
    )
  }

  // 点击立即认证
  async certificationImmediately () {
    if (this.state.selectItemData.bank.length < 1) {
      global.alert.show({
        content: '请选择开户银行'
      })
      return
    }
    if (this.state.bankCard.replace(/\s+/g, '').length < 1) {
      global.alert.show({
        content: '请填写正确的银行账号'
      })
      return
    }
    this.customerList()
  }

  async faceSubbranchData (text) {
    console.log(text)
    if (text.length < 4) {
      return
    }
    const res = await ajaxStore.credit.faceSubbranch({
      flowId: this.state.flowId,
      keyWord: text
    })
    console.log(res.data.data.list)
    if (res.data && res.data.code === 0) {
      // // 开户银行搜索列表
      const bankNameListData = []
      res.data.data.list.forEach((item, index) => {
        console.log(item, index)
        const dicData = {
          name: item.bankName,
          row: index,
          itemData: item
        }
        bankNameListData.push(dicData)
      })
      console.log('bankNameListData:' + bankNameListData)
      this.setState({
        bankNameData: bankNameListData
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'企业对公打款认证'} navigation={navigation}
          onLeftPress={() => { navigation.navigate('RealNameAuth') }}/>
        {/* 顶部第几步显示 */}
        <View style={styles.topStepBg}>
          <View style={styles.topStepLineBg}/>
          <View style={styles.topStepNBg}>
            <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(40)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-daiban'} size={dp(56)} />
            <Iconfont style={styles.arrow} name={'liuchengyindao-weikaishi-1'} size={dp(40)} />
          </View>
          <View style={styles.topStepTextBg}>
            <Text style={{ fontSize: dp(26) }}>经办人实名认证</Text>
            <Text style={{ fontSize: dp(26) }}>填写企业信息</Text>
            <Text style={{ fontSize: dp(26), opacity: 0.5 }}>打款信息验证</Text>
          </View>
        </View>
        {/* 中间实名认证信息填写 */}
        <View style={styles.centerStepBg}>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>开户名称</Text>
            <Text style={{ fontSize: dp(28), marginLeft: dp(180), position: 'absolute', opacity: 0.5 }}>{this.state.appForm.companyName}</Text>
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>开户银行</Text>
            <TextInput placeholder={'请选择开户银行'}
              placeholderTextColor={Color.TEXT_LIGHT}
              keyboardType='number-pad'
              style={styles.itemInput}
              value={this.state.bankCardName}
              onChangeText={text => {
                this.setState({
                  bankCardName: text
                })
              }}
            />
            <Touchable style={styles.touchItem} onPress={() => {
              this.setState({ infoModal: true })
            }}></Touchable>
          </View>
          <View style={{ height: dp(90), marginHorizontal: dp(30), flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: dp(28) }}>对公银行账号</Text>
            <TextInput placeholder={'请填写银行账号'}
              placeholderTextColor={Color.TEXT_LIGHT}
              keyboardType='number-pad'
              style={styles.itemInput}
              maxLength={50}
              value={this.state.bankCard}
              onChangeText={text => {
                this.setState({
                  bankCard: text.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                })
              }}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            this.setState({ comfirmModal: true })
          }} style={styles.btn} text={'提交企业信息'} />
        </View>
        <Modal
          style={styles.modal}
          isVisible={this.state.infoModal}
          animationIn='zoomIn'
          animationOut='zoomOut'
          coverScreen={false}
          hasBackdrop={true}
          backdropTransitionInTiming={0}
          // onBackdropPress={() => this.setModalVisible(false)}
          onBackButtonPress={() => this.setState({
            infoModal: false,
            selectItemRow: '-1',
            selectItemData: {}
          }) }
        >
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: dp(34), textAlign: 'center', marginTop: dp(64) }}>请选择开户银行</Text>
            <TextInput placeholder={'输入银行名称模糊搜索'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.inputSearch}
              value={this.state.inputSearchText}
              onChangeText={text => {
                this.setState({
                  inputSearchTextNum: text.length,
                  inputSearchText: text
                })
                this.faceSubbranchData(text)
              }}
            />
            {this.state.inputSearchTextNum >= 4 ? <FlatList
              horizontal = {false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}

              style={styles.flatList}
              data={this.state.bankNameData}
              renderItem={data => this.renderItem(data)}
              keyExtractor={(item, index) => index.toString()}
            /> : null}

            <View style={{ marginTop: dp(20) }}>
              <View style={{ height: dp(2), marginTop: 0, backgroundColor: Color.SPLIT_LINE }}/>
              <View style={styles.modalBtnC}>
                <Text style={styles.modalBtn} onPress={() => {
                  this.setState({
                    infoModal: false,
                    inputSearchText: '',
                    inputSearchTextNum: 0
                  })
                }}>取消</Text>
                <Text style={[styles.modalBtn, { color: '#576B95' }]} onPress={() => {
                  this.setState({
                    infoModal: false,
                    bankCardName: this.state.selectItemData.bankName,
                    inputSearchText: '',
                    inputSearchTextNum: 0
                  })
                }}>确定</Text>
              </View>
              <View style={{ height: dp(110), width: dp(2), marginTop: 0, backgroundColor: Color.SPLIT_LINE, marginLeft: (DEVICE_WIDTH - dp(110)) / 2 - dp(1), position: 'absolute' }}/>
            </View>
          </View>
        </Modal>
        <ComfirmModal
          title={'请确认对公账号信息'}
          content={`开户名称\n${this.state.appForm.companyName}\n\n开户银行\n${this.state.bankCardName}\n\n对公银行账号\n${this.state.bankCard.replace(/\s+/g, '')}`}
          cancelText={'取消'}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({
              comfirmModal: false
            })
          }}
          confirm={() => {
            this.setState({
              comfirmModal: false
            })
            this.certificationImmediately()
          }}
          infoModal={this.state.comfirmModal} />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  btn: {
    marginTop: dp(50)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  topStepBg: {
    height: dp(240),
    width: DEVICE_WIDTH
  },
  topStepNumBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    height: dp(56)
  },
  topStepNBg: {
    top: dp(57),
    marginHorizontal: dp(120),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centerStepBg: {
    width: DEVICE_WIDTH,
    backgroundColor: 'white'
  },
  topStepLineBg: {
    top: dp(57) + dp(31),
    height: dp(6),
    backgroundColor: 'white',
    marginHorizontal: dp(130)
  },
  topStepTextBg: {
    top: dp(56) + dp(28),
    marginHorizontal: dp(60),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemInput: {
    fontSize: dp(28),
    height: dp(90),
    width: DEVICE_WIDTH - dp(180) - dp(60),
    color: Color.TEXT_MAIN,
    marginLeft: dp(180),
    position: 'absolute'
  },
  smsBtn: {
    width: DEVICE_WIDTH * 0.3,
    fontSize: dp(24),
    color: '#00b2a9',
    marginLeft: DEVICE_WIDTH * 0.7 - dp(120),
    textAlign: 'center'
  },
  countBtn: {
    color: Color.TEXT_LIGHT,
    borderColor: Color.TEXT_LIGHT
  },
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  inputSearch: {
    marginHorizontal: dp(48),
    borderColor: '#D0D0D4',
    borderRadius: dp(8),
    borderWidth: dp(2),
    height: dp(80),
    marginTop: dp(30),
    padding: dp(20),
    fontSize: dp(28)
  },
  itemStatus: {
    fontSize: dp(28),
    color: '#353535',
    width: DEVICE_WIDTH - dp(280)
  },
  statusWrap: {
    height: dp(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  flatList: {
    marginTop: dp(20),
    marginHorizontal: dp(48),
    height: dp(400)
  },
  modal: {
    margin: 0,
    justifyContent: 'center'
  },
  modalContainer: {
    marginHorizontal: dp(55),
    backgroundColor: 'white',
    borderRadius: dp(8),
    marginTop: -dp(200)
  },
  modalBtnC: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(110)
  },
  modalBtn: {
    flex: 1,
    textAlign: 'center',
    fontSize: dp(34),
    fontWeight: 'bold'
  },
  separator: {
    height: dp(2),
    backgroundColor: Color.DEFAULT_BG,
    marginRight: dp(10)
  },
  statusIcon: {
    marginRight: dp(24),
    marginLeft: dp(20)
  }
})
