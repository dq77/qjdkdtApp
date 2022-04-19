import React, { PureComponent } from 'react'
import { View, StyleSheet, SectionList, Text } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'
import { SolidBtn } from '../../../component/CommonButton'
import { blurIdCard } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import { webUrl } from '../../../utils/config'
import PermissionUtils from '../../../utils/PermissionUtils'

export default class RealNameAuthList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      signModal: false,
      selectItemSection: 0,
      selectItemRow: 0,
      transactorListData: {},
      itemData: {}
    }
  }

  componentDidMount () {
    this.customerListData()
  }

  async customerListData () {
    const { navigation } = this.props
    const { cifCompanyId } = navigation.state.params
    global.loading.show()
    const res = await ajaxStore.credit.customerList({ cifCompanyId: cifCompanyId })
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      this.setState({
        transactorListData: {
          customerCorpInfo: res.data.data.customerCorpInfo,
          legalPeronInfo: res.data.data.legalPeronInfo,
          agentPersonList: res.data.data.agentPersonList,
          guarantorPersonData: res.data.data.guarantorPersonData,
          handlerPersonList: res.data.data.handlerPersonList
        },
        itemData: {
          itemData: res.data.data.legalPeronInfo
        }
      })
    }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  toSignerList (item, index, section) {
    console.log(item, index, section)
    this.setState({
      selectItemSection: item.key.section,
      selectItemRow: item.key.row,
      itemData: item
    })
  }

  // 先调用列表接口查当前认证状态，然后如果已经开始，那么直接根据taskStack接口判断进入到哪个流程。如果没有开始流程，那么申请开始流程，然后再判断应该进入哪个流程
  async customerList (data) {
    const { navigation } = this.props
    const { cifCompanyId } = navigation.state.params
    global.loading.show()
    const res = await ajaxStore.credit.customerList({ cifCompanyId: cifCompanyId })
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      if (res.data.data.customerCorpInfo.authStatus === '1') {
        if (res.data.data.customerCorpInfo.corpAuthProcessId) {
          // 当前处于认证中,有processId
          this.taskStack(res.data.data.customerCorpInfo, data)
        } else {
          // 当前处于认证中，没有processId
          this.startCorpAuth(data)
        }
        // 当前处于认证中
      } else {
        // 当前处于其他要重新开启认证的状态
        this.startCorpAuth(data)
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async startCorpAuth (data) {
    const dataDic = {
      companyId: this.state.transactorListData.customerCorpInfo.cifCompanyId,
      supplierId: '',
      corpName: this.state.transactorListData.customerCorpInfo.corpName,
      regNo: this.state.transactorListData.customerCorpInfo.regNo,
      legalPersonName: this.state.transactorListData.legalPeronInfo.personName,
      legalPersonIdcard: this.state.transactorListData.legalPeronInfo.personIdcard,
      handlerName: data.type === '1' ? this.state.itemData.itemData.personName : this.state.transactorListData.legalPeronInfo.personName,
      handlerIdcard: data.type === '1' ? this.state.itemData.itemData.personIdcard : this.state.transactorListData.legalPeronInfo.personIdcard,
      handlerPhone: data.type === '1' ? this.state.itemData.itemData.personPhone : this.state.transactorListData.legalPeronInfo.personPhone,
      startUser: data.type === '1' ? this.state.itemData.itemData.personIdcard : this.state.transactorListData.legalPeronInfo.personIdcard,
      status: 1,
      authType: data.type === '1' ? 1 : 0 // 认证类型,0-法人人脸识别,1-对公打款
    }
    const res = await ajaxStore.credit.startCorpAuth(dataDic)
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      this.taskStack(res.data.data, data)
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async taskStack (startCorpAuthData, typeData) {
    const data = {
      processInstanceId: startCorpAuthData.corpAuthProcessId,
      taskId: ''
    }
    const res = await ajaxStore.credit.taskStack(data)
    if (res.data && res.data.code === '0') {
      if (typeData.type === '1') {
        if (res.data.data.currentTask) {
          if (res.data.data.currentTask.taskDefKey === 'PERSON_FACTOR') {
            this.props.navigation.navigate('EnterpriseRealAuth', { currentTask: res.data.data.currentTask })
          } else if (res.data.data.currentTask.taskDefKey === 'BANK_INFO') {
            this.props.navigation.navigate('EnterpriseFillInfo', { currentTask: res.data.data.currentTask })
          } else if (res.data.data.currentTask.taskDefKey === 'AMOUNT_CHECK') {
            this.props.navigation.navigate('EnterprisePlayVali', { currentTask: res.data.data.currentTask })
          } else if (res.data.data.currentTask.taskDefKey === 'FACE_RECOGNIZATION') {
            // 权限申请
            const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
            if (!hasPermission) { return }
            this.faceFace(res.data.data.currentTask)
          } else {
            this.props.navigation.navigate('EnterpriseRealAuth', { currentTask: res.data.data.currentTask })
          }
        } else {
          this.props.navigation.navigate('EnterpriseRealAuth', { currentTask: res.data.data.currentTask })
        }
      } else {
        // 权限申请
        const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
        if (!hasPermission) { return }
        this.faceFace(res.data.data)
      }
    }
  }

  async faceFace (taskStackData) {
    const data = {
      idcardName: this.state.transactorListData.legalPeronInfo.personName,
      idcardNumber: this.state.transactorListData.legalPeronInfo.personIdcard,
      callBackUrl: `${webUrl}/mine/faceNuclearBody?memberId=${this.state.transactorListData.legalPeronInfo.personIdcard}&taskId=${taskStackData.currentTask.taskId}`
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
      navigation.navigate('WebView', { url: faceFaceData.originalUrl, title: '人脸识别', faceFace: faceFaceData, typeNav: '1' })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  render () {
    const { navigation } = this.props
    // 授权人列表
    const agentPersonData = []
    const agentPersonList = this.state.transactorListData.agentPersonList || []

    agentPersonList.forEach((item, index) => {
      const dicData = {
        name: item.personName,
        num: item.personIdcard,
        key: {
          section: 1,
          row: index
        },
        itemData: item
      }
      if (item.corpType === 'COMPANY') {
        agentPersonData.push(dicData)
      }
    })

    const data = [{
      title: '法人',
      data: [
        {
          name: this.state.transactorListData.legalPeronInfo && this.state.transactorListData.legalPeronInfo.personName,
          num: this.state.transactorListData.legalPeronInfo && this.state.transactorListData.legalPeronInfo.personIdcard,
          key: { section: 0, row: 0 },
          itemData: this.state.transactorListData.legalPeronInfo || []
        }]
    }
    ]
    agentPersonData.length > 0 && data.push({ title: '授权人', data: agentPersonData })
    return (
      <View style={styles.container}>
        <NavBar title={'选择办理人'} navigation={navigation}
          onLeftPress = {() => {
            this.props.navigation.navigate('RealNameAuth')
          }}/>
        <SectionList
          stickySectionHeadersEnabled={false}// 关闭头部粘连
          ItemSeparatorComponent={() => this.renderSeparator()}
          renderItem={
            ({ item, index, section }) =>
              <Touchable key={index} onPress={() => this.toSignerList(item, index, section)}>
                <View key={index} style={styles.itemLeftBg}>
                  <View style={{ }}>
                    <Text style={[styles.itemText, { fontSize: dp(40) }]}>{item.name}</Text>
                    <Text style={[styles.itemText, { color: '#888888', marginTop: dp(30) }]}>{blurIdCard(item.num)}</Text>
                  </View>
                  <Iconfont style={styles.statusIcon} name={(this.state.selectItemSection === item.key.section && this.state.selectItemRow === item.key.row) ? 'icon-signed' : 'select_weixuanzhong'} size={dp(46)} />
                </View>
              </Touchable>
          }
          renderSectionHeader={
            ({ section: { title } }) => (
              <View style={[styles.headerBg, { backgroundColor: '#EFEFF4', height: dp(108) }]}>
                <Text style={styles.headerText}>{title}</Text>
              </View>
            )}
          sections= {data}
          keyExtractor={(item, index) => item + index}
        />
        <View style={styles.footer}>
          <SolidBtn onPress={() => {
            if (this.state.selectItemSection === 1) {
              this.customerList({ type: '1' })
            } else {
              this.setState({
                signModal: true
              })
            }
          }} style={styles.btn} text={'前往企业实名认证'} />
        </View>
        <Modal
          onTouchOutside={() => {
          }}
          width={0.8}
          visible={this.state.signModal}
          onSwipeOut={() => {}}
          modalAnimation={new ScaleAnimation({
            initialValue: 0.1, // optional
            useNativeDriver: true // optional
          })}
          onHardwareBackPress={() => {

          }}
          footer={
            <ModalFooter style={styles.bottomMain}>
              <Touchable onPress={() => {
                this.setState({
                  signModal: false
                })
                this.customerList({ type: '2' })
              }}>
                <View style={styles.faceRecoBg}>
                  <Text style={{ color: '#576B95', fontSize: dp(34), textAlign: 'center' }}>法人人脸识别</Text>
                </View>
              </Touchable>
              <View style={styles.separatorModal} />
              <Touchable onPress={() => {
                this.setState({
                  signModal: false
                })
                this.customerList({ type: '1' })
              }}>
                <View style={styles.faceRecoBg}>
                  <Text style={{ color: '#576B95', fontSize: dp(34), textAlign: 'center' }}>企业对公账户打款验证</Text>
                </View>
              </Touchable>
              <View style={styles.separatorModal} />
              <Touchable onPress={() => {
                this.setState({
                  signModal: false
                })
              }}>
                <View style={styles.faceRecoBg}>
                  <Text style={{ color: '#000', fontSize: dp(34), textAlign: 'center', fontWeight: '500' }}>取消</Text>
                </View>
              </Touchable>
            </ModalFooter>
          }
        >
          <ModalContent style={{ alignItems: 'stretch' }}>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: dp(34), color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>请选择企业实名认证方式</Text>
            </View>
          </ModalContent>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  separatorModal: {
    height: dp(1),
    backgroundColor: '#e5e5e5',
    marginVertical: 0
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(30),
    backgroundColor: Color.DEFAULT_BG,
    marginLeft: dp(30)
  },
  headerText: {
    marginTop: dp(50),
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#888888'
  },
  headerBg: {
    height: dp(108),
    width: DEVICE_WIDTH,
    backgroundColor: '#EFEFF4'
  },
  itemText: {
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#353535'
  },
  itemLeftBg: {
    height: dp(178),
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: dp(8)
  },
  itemRightBg: {
    height: dp(90),
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrow: {
    marginRight: dp(30)
  },
  statusIcon: {
    marginRight: dp(24),
    marginLeft: dp(20)
  },
  statusText: {
    fontSize: dp(28),
    color: '#888888'
  },
  addText: {
    fontSize: dp(28),
    color: '#2EA2DB',
    marginLeft: dp(30),
    height: dp(90),
    marginTop: dp(31)
  },
  faceRecoBg: {
    height: dp(110),
    justifyContent: 'center'
  },
  bottomMain: {
    marginBottom: dp(-60)
  },
  btn: {
    marginTop: dp(50)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: dp(60)
  }

})
