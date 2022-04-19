import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, TextInput } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import {
  setFaceExtraData
} from '../../actions'
import ajaxStore from '../../utils/ajaxStore'
import CheckBox from 'react-native-check-box'
import { SolidBtn } from '../../component/CommonButton'
import { showToast } from '../../utils/Utility'
import { getLocation } from '../../utils/LocationUtils'

/**
 * 合同签署
 */
class CSContractSign extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      title: '合同签约',
      taskId: '',
      processInstanceId: '',
      name: '',
      idNumber: '',
      contractCode: '',
      contractName: '',
      elements: [],
      contractObj: '',
      signerInfo: '',
      detailShow: false,
      checkbox: true,
      source: ''
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
      taskId: params.taskId,
      processInstanceId: params.processInstanceId,
      contractType: params.contractType,
      contractCode: params.contractCode,
      name: params.name,
      idNumber: params.idNumber,
      source: params.source
    })
    this.getTaskTemplate()
  }

  previewContract () {
    this.props.navigation.navigate('PreviewPDF', { buzKey: this.state.contractObj.contractFileKey, version: '2' })
  }

  checkContractTemplate () {
    this.props.navigation.navigate('PreviewPDF', { buzKey: this.state.contractObj.contractTemplateFileKey, version: '2' })
  }

  changeDetailShow () {
    this.setState({
      detailShow: !this.state.detailShow
    })
  }

  async toSign () {
    global.loading.show()
    const map = await getLocation()
    if (!map) {
      global.loading.hide()
      this.props.navigation.goBack()
      return
    }
    const { name, idNumber, taskId, elements, source, contractCode, processInstanceId } = this.state
    await setFaceExtraData({
      name,
      idNumber,
      memberId: idNumber,
      taskId: taskId,
      isPass: 'Y',
      elements: elements ? JSON.stringify(elements) : '[]',
      lng: map.longitude,
      lat: map.latitude,
      source,
      contractType: '-1',
      contractCode,
      processInstanceId
    })
    this.goFaceIdentity()
    global.loading.hide()
  }

  goFaceIdentity () {
    const { idNumber, name } = this.state
    this.props.navigation.navigate('FaceIdentity', {
      idcardName: name,
      idcardNumber: idNumber
    })
  }

  toIdentity () {
    if (this.state.checkbox) {
      this.toSign()
    } else {
      global.alert.show({
        content: '请先阅读并同意相关协议及合同'
      })
    }
  }

  async getTaskTemplate () {
    const res = await ajaxStore.process.getTaskDetail({ processInstanceId: this.state.processInstanceId, taskId: this.state.taskId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      const elements = data.elements ? JSON.parse(data.elements).elements : []
      const contractObj = {
        contractTemplateName: data.contractTemplateName,
        contractTemplateFileKey: data.contractTemplateFileKey,
        contractFileKey: data.signedFileKey || data.contractFileKey,
        contractName: data.contractName
      }
      const name = this.state.name || data.candidatorList[0].name
      const idNumber = this.state.idNumber || data.candidatorList[0].idNumber
      const signerInfo = {
        memberId: data.candidatorList[0].idNumber,
        name,
        idNumber,
        taskId: this.state.taskId
      }
      this.setState({
        elements,
        contractObj,
        signerInfo,
        detailShow: true
      })
    }
  }

  render () {
    const { navigation } = this.props
    const { title, detailShow, elements, contractObj } = this.state
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
                    <Text style={styles.contractName}>{contractObj.contractName}</Text>
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
                {elements.map((item, key) => {
                  return (
                    <View style={styles.detailItem} key={key}>
                      <Text style={styles.detailLabel}>{item.key}</Text>
                      <TextInput
                        placeholderTextColor={'#ddd'}
                        autoCapitalize={'none'}
                        style={styles.textInput}
                        editable={false}
                        defaultValue={item.value}
                        maxLength={100}
                        multiline={true}
                      />
                    </View>
                  )
                })}
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
                  <Text style={styles.linkText}>{`《${contractObj.contractName}》`}</Text>
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
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(CSContractSign)
