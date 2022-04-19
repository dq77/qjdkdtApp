import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, formValid, assign, injectUnmount } from '../../utils/Utility'
import Touchable from '../../component/Touchable'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import CustomerService from '../../component/CustomerService'
import Iconfont from '../../iconfont/Icon'
import Example from './component/Example'
import UploadHistory from './component/UploadHistory'
import Upload from './component/Upload'
import SingleIdcardUpload from './component/SingleIdcardUpload'
@injectUnmount
class IdcardUpload extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      creditItem: {},
      historyItem: [],
      deleted: [],
      authFiles: [],
      loadHistory: false,
      idcardLoading: false
    }
    this.setDeleted = this.setDeleted.bind(this)
    this.setAuthFiles = this.setAuthFiles.bind(this)
    this.save = this.save.bind(this)
  }

  componentDidMount () {
    this.getAuthFileType()
  }

  setDeleted (deleted) {
    console.log(deleted)
    this.setState({
      deleted
    })
  }

  setAuthFiles (authFiles) {
    this.setState({
      authFiles
    })
  }

  setHistory (currentItem) {
    const loadHistory = this.state.creditItem.cateCode.length === currentItem.length
    this.setState({
      historyItem: currentItem,
      loadHistory
    })
  }

  setIdcardLoading (idcardLoading) {
    this.setState({
      idcardLoading
    })
  }

  valid (authFiles) {
    let result = true
    let msg = ''
    const authFileMap = this.props.authFileMap
    console.log(authFiles, '==============>authFiles')
    if (authFiles.length) {
      authFiles.map((item, i) => {
        authFileMap.map((item2, j) => {
          if (item2.cateCode === item.code) {
            item.files.map((file, key) => {
              if ((!item.files[0] && item.files[1]) || (item.files[0] && !item.files[1])) {
                result = false
                msg = `请上传完整${item2.title}信息`
              }
            })
            if (item2.isRequired && !item.files[0] && !item.files[1]) {
              result = false
              msg = `${item2.title}为必填项`
            }
          }
        })
      })
    } else {
      result = false
      msg = '请上传完整身份证信息'
    }
    return {
      result,
      msg
    }
  }

  async save () {
    const currentAuthFiles = this.state.authFiles
    const currentDeleted = this.state.deleted
    let authFiles = []
    let deleted = []
    for (const key in currentAuthFiles) {
      authFiles.push({
        code: key,
        files: currentAuthFiles[key]
      })
    }
    currentDeleted.map((item, key) => {
      deleted.push({
        uploadId: item
      })
    })
    const valid = this.valid(authFiles)
    if (valid.result) {
      authFiles = authFiles.filter((item, key) => {
        return item.files[0] && item.files[1]
      })
      authFiles = JSON.stringify(authFiles)
      deleted = JSON.stringify(deleted)
      console.log(authFiles, deleted)
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

  async getAuthFileType () {
    const creditItem = this.props.navigation.state.params.creditItem
    creditItem.isIdcard = []
    creditItem.hasIdcard = false
    this.props.authFileMap.map((item, i) => {
      creditItem.cateCode.map((item2, j) => {
        if (item.cateCode === item2) {
          creditItem.isIdcard[j] = item.isIdcard
          if (item.isIdcard) {
            creditItem.hasIdcard = true
          }
        }
      })
    })
    await this.setState({
      creditItem
    })
  }

  render () {
    const { navigation, userInfo, exampleList, themeColor } = this.props
    const { creditItem, historyItem, loadHistory } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={this.state.creditItem.name} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled" >
          <View style={styles.content}>
            {JSON.stringify(this.state.creditItem) !== '{}' ? (
              <View style={styles.detailWarp}>
                <Example exampleList={exampleList} creditIteId={this.state.creditItem.id} />
                <UploadHistory creditItem={creditItem} onLoad={(currentItem) => { this.setHistory(currentItem) }} onChange={(deleted) => { this.setDeleted(deleted) }} />
                {loadHistory ? (
                  <SingleIdcardUpload navigation={navigation} loadHistory={loadHistory} historyItem={historyItem} creditItem={creditItem} onChange={(authFiles) => { this.setAuthFiles(authFiles) }} onDelete={(deleted) => { this.setDeleted(deleted) }} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} />
                ) : (null)}
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

export default connect(mapStateToProps)(IdcardUpload)
