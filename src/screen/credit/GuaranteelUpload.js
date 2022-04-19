import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, formValid, assign, injectUnmount, deepCopy } from '../../utils/Utility'
import Touchable from '../../component/Touchable'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import CustomerService from '../../component/CustomerService'
import Iconfont from '../../iconfont/Icon'
import Example from './component/Example'
import UploadHistory from './component/UploadHistory'
import Upload from './component/Upload'
import MultipleIdcardUpload from './component/MultipleIdcardUpload'
import { vPhone } from '../../utils/reg'

@injectUnmount
class GuaranteelUpload extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      creditItem: {},
      historyItem: [],
      deleted: [],
      authFiles: [],
      loadHistory: false,
      normalHistory: [],
      idcardHistory: [],
      idcardLoading: false,
      idcardAuthFiles: [],
      idcardDeleted: [],
      guaranteePerson: [],
      currentIdcards: []
    }
    this.setDeleted = this.setDeleted.bind(this)
    this.setAuthFiles = this.setAuthFiles.bind(this)
    this.save = this.save.bind(this)
    this.setIdcardAuthFiles = this.setIdcardAuthFiles.bind(this)
  }

  componentDidMount () {
    this.setCreditItem()
  }

  setDeleted (deleted) {
    this.setState({
      deleted
    })
  }

  setIdcardDeleted (deleted) {
    this.setState({
      idcardDeleted: deleted
    })
  }

  setAuthFiles (authFiles) {
    this.setState({
      authFiles
    })
  }

  setIdcardAuthFiles (authFiles) {
    this.setState({
      idcardAuthFiles: authFiles
    })
  }

  setHistory (currentItem) {
    const normalHistory = []
    const idcardHistory = []
    const guaranteePerson = []
    const phone = []
    currentItem[0].historyItem.map((item, index) => {
      if (!item.idCardNo) {
        normalHistory.push(item)
      } else {
        let hasIdcard = false
        idcardHistory.map((history, key) => {
          if (history.idcard === item.idCardNo) {
            hasIdcard = true
            if (item.idCardInfoType) {
              idcardHistory[key].front = item.filePath
              idcardHistory[key].frontId = item.id
              if (phone.indexOf(item.phone) === -1) {
                guaranteePerson.push({
                  phone: item.phone,
                  fileKey: idcardHistory[key].front
                })
                phone.push(item.phone)
              }
            } else {
              idcardHistory[key].back = item.filePath
              idcardHistory[key].backId = item.id
            }
            idcardHistory[key].phone = item.phone
          }
        })
        if (!hasIdcard) {
          idcardHistory.push({
            idcard: item.idCardNo,
            phone: item.phone
          })
        }
        if (item.idCardInfoType) {
          idcardHistory[idcardHistory.length - 1].front = item.filePath
          idcardHistory[idcardHistory.length - 1].frontId = item.id
          if (phone.indexOf(item.phone) === -1) {
            guaranteePerson.push({
              phone: item.phone,
              fileKey: idcardHistory[idcardHistory.length - 1].front
            })
            phone.push(item.phone)
          }
        } else {
          idcardHistory[idcardHistory.length - 1].back = item.filePath
          idcardHistory[idcardHistory.length - 1].backId = item.id
        }
      }
    })
    let newNormalHistory = []
    newNormalHistory = deepCopy(currentItem)
    newNormalHistory[0].historyItem = normalHistory
    idcardHistory.reverse()
    this.setState({
      historyItem: currentItem,
      normalHistory: newNormalHistory,
      idcardHistory,
      loadHistory: true,
      guaranteePerson
    })
  }

  valid () {
    console.log(this.state.currentIdcards)
    const currentIdcards = this.state.currentIdcards
    let result = true
    let msg = ''
    const phone = []
    const idcard = []
    for (let key = 0; key < currentIdcards.length; key++) {
      if (!currentIdcards[key].front || !currentIdcards[key].back) {
        result = false
        msg = '请上传身份证照片'
        break
      }
      if (idcard.indexOf(currentIdcards[key].idcard) === -1) {
        idcard.push(currentIdcards[key].idcard)
      } else {
        result = false
        msg = '存在多个相同身份证担保人,请勿重复添加'
        break
      }
      if (vPhone.test(currentIdcards[key].phone)) {
        if (phone.indexOf(currentIdcards[key].phone) === -1) {
          phone.push(currentIdcards[key].phone)
        } else {
          result = false
          msg = '担保人手机号不能重复'
          break
        }
      } else {
        result = false
        msg = '请填写正确担保人手机号'
        break
      }
    }
    return {
      result,
      msg
    }
  }

  async saveGuarantee () {
    const res = await ajaxStore.credit.saveGuarantee(this.state.guaranteePerson)
  }

  async save () {
    const currentAuthFiles = this.state.authFiles
    const currentDeleted = this.state.deleted
    const currentIdcardAuthFiles = this.state.idcardAuthFiles
    const currentIdcardDeleted = this.state.idcardDeleted
    let authFiles = []
    let deleted = []
    for (const key in currentIdcardAuthFiles) {
      authFiles.push({
        code: key,
        files: currentIdcardAuthFiles[key]
      })
    }
    for (const key in currentAuthFiles) {
      if (authFiles.length) {
        authFiles.map((item, index) => {
          if (item.code === key) {
            const oldFiles = authFiles[index].files
            const newFiles = oldFiles.concat(currentAuthFiles[key])
            authFiles[index].files = newFiles
          }
        })
      } else {
        authFiles.push({
          code: key,
          files: currentAuthFiles[key]
        })
      }
    }
    currentIdcardDeleted.map((item, key) => {
      deleted.push({
        uploadId: item
      })
    })
    currentDeleted.map((item, key) => {
      deleted.push({
        uploadId: item
      })
    })

    console.log('authFiles', authFiles)
    console.log('deleted', deleted)
    console.log('person', this.state.guaranteePerson)
    const valid = this.valid()
    if (valid.result) {
      authFiles = JSON.stringify(authFiles)
      deleted = JSON.stringify(deleted)
      this.saveGuarantee()
      const res = await ajaxStore.credit.saveAuthFile({ deleted, authFiles })
      if (res.data && res.data.code === '0') {
        this.props.navigation.goBack()
        this.props.navigation.state.params.refresh()
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  setcurrentIdcards (currentIdcards) {
    this.setState({
      currentIdcards
    })
  }

  setCreditItem () {
    const creditItem = this.props.navigation.state.params.creditItem
    this.setState({
      creditItem
    })
  }

  setIdcardLoading (idcardLoading) {
    this.setState({
      idcardLoading
    })
  }

  setGuaranteePerson (guaranteePerson) {
    this.setState({
      guaranteePerson
    })
  }

  render () {
    const { navigation, userInfo, exampleList, themeColor } = this.props
    const { creditItem, historyItem, loadHistory, idcardHistory, guaranteePerson } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={this.state.creditItem.name} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled" >
          <View style={styles.content}>
            {JSON.stringify(this.state.creditItem) !== '{}' ? (
              <View style={styles.detailWarp}>
                <Example exampleList={exampleList} creditIteId={this.state.creditItem.id} />
                {loadHistory ? (
                  <MultipleIdcardUpload guaranteePerson={guaranteePerson} navigation={navigation} loadHistory={loadHistory} historyItem={idcardHistory} creditItem={creditItem} onChange={(authFiles) => { this.setIdcardAuthFiles(authFiles) }} onDelete={(deleted) => { this.setIdcardDeleted(deleted) }} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} onPersonChange={(guaranteePerson) => { this.setGuaranteePerson(guaranteePerson) }} onIdcardItemChange={(currentIdcards) => { this.setcurrentIdcards(currentIdcards) }} />
                ) : (null)}
                <UploadHistory creditItem={creditItem} onLoad={(currentItem) => { this.setHistory(currentItem) }} onChange={(deleted) => { this.setDeleted(deleted) }} />
                <Upload creditItem={creditItem} onChange={(authFiles) => { this.setAuthFiles(authFiles) }} />
                <Touchable
                  style={[styles.submitBtn, { backgroundColor: themeColor }]}
                  onPress={this.save}>
                  <Text style={styles.submitBtnText}>{'保存'}</Text>
                </Touchable>
              </View>
            ) : (null)}
            <View style={styles.footer}>
              <CustomerService navigation={navigation} name={userInfo.userName} />
            </View>
          </View>
        </ScrollView>
        {this.state.idcardLoading ? (
          <View style={styles.loading}>
            <View style={styles.loadingWarp}>
              <Text style={styles.loadingText}>正在识别照片内容，请稍后</Text>
              <Iconfont style={styles.loadingIcon} name={'icon-uploading'} size={dp(150)} />
            </View>
          </View>
        ) : (null)}
      </View>
    )
  }
}
const styles = StyleSheet.create({
  pageMain: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: dp(20)
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: dp(70)
  },
  submitBtn: {
    width: DEVICE_WIDTH * 0.9,
    marginTop: dp(60),
    padding: dp(30),
    borderRadius: dp(10)
  },
  submitBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(32)
  },
  detailWarp: {
    flex: 1,
    alignItems: 'center'
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EFEFF4',
    flex: 1,
    justifyContent: 'center'
  },
  loadingWarp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  loadingText: {
    width: DEVICE_WIDTH,
    textAlign: 'center',
    marginBottom: dp(100),
    fontSize: dp(36)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    exampleList: state.credit.exampleList,
    authFileMap: state.credit.authFileMap
  }
}

export default connect(mapStateToProps)(GuaranteelUpload)
