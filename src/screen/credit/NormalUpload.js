import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
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
@injectUnmount
class NormalUpload extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      creditItem: {},
      historyItem: [],
      deleted: [],
      authFiles: [],
      loadHistory: false
    }
    this.setDeleted = this.setDeleted.bind(this)
    this.setAuthFiles = this.setAuthFiles.bind(this)
    this.save = this.save.bind(this)
  }

  componentDidMount () {
    this.setCreditItem()
  }

  setDeleted (deleted) {
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
    this.setState({
      historyItem: currentItem,
      loadHistory: true
    })
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
    authFiles = JSON.stringify(authFiles)
    deleted = JSON.stringify(deleted)
    const res = await ajaxStore.credit.saveAuthFile({ deleted, authFiles })
    if (res.data && res.data.code === '0') {
      this.props.navigation.goBack()
      this.props.navigation.state.params.refresh()
    }
  }

  setCreditItem () {
    const creditItem = this.props.navigation.state.params.creditItem
    this.setState({
      creditItem
    })
    console.log(creditItem, 'creditItemcreditItemcreditItem')
  }

  render () {
    const { navigation, userInfo, exampleList, themeColor } = this.props
    const { creditItem, historyItem, loadHistory } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={this.state.creditItem.name} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {JSON.stringify(this.state.creditItem) !== '{}' ? (
              <View style={styles.detailWarp}>
                <Example
                  exampleList={exampleList}
                  creditIteId={this.state.creditItem.id}
                />
                <UploadHistory
                  creditItem={creditItem}
                  onLoad={(currentItem) => {
                    this.setHistory(currentItem)
                  }}
                  onChange={(deleted) => {
                    this.setDeleted(deleted)
                  }}
                />
                <Upload
                  creditItem={creditItem}
                  onChange={(authFiles) => {
                    this.setAuthFiles(authFiles)
                  }}
                />
                <Touchable
                  style={[styles.submitBtn, { backgroundColor: themeColor }]}
                  onPress={this.save}>
                  <Text style={styles.submitBtnText}>{'保存'}</Text>
                </Touchable>
              </View>
            ) : null}
            <View style={styles.footer}>
              <CustomerService
                navigation={navigation}
                name={userInfo.userName}
              />
            </View>
          </View>
        </ScrollView>
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
  }
})

const mapStateToProps = (state) => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    exampleList: state.credit.exampleList,
    authFileMap: state.credit.authFileMap
  }
}

export default connect(mapStateToProps)(NormalUpload)
