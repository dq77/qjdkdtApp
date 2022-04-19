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
import UploadHouse from './component/UploadHouse'
import ComfirmModal from '../../component/ComfirmModal'
import AlertModal from '../../component/AlertModal'

@injectUnmount
class HouseUpload extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      creditItem: {},
      historyItem: [],
      deleted: [],
      authFiles: [],
      address: {},
      loadHistory: false,
      onLoading: false,
      infoModal: false,
      addressModal: false
    }
    this.setDeleted = this.setDeleted.bind(this)
    this.setAuthFiles = this.setAuthFiles.bind(this)
    this.setAddress = this.setAddress.bind(this)
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

  setAddress (address) {
    this.setState({
      address
    })
  }

  setHistory (currentItem) {
    this.setState({
      historyItem: currentItem,
      loadHistory: true
    })
  }

  hasAddress () {
    const authFiles = this.state.authFiles.C10014
    const address = this.state.address
    if (Object.keys(this.state.address).length <= 0) {
      return false
    }
    for (const file of authFiles) {
      if (!address[file]) { return false }
    }
    return true
  }

  async save () {
    const currentAuthFiles = this.state.authFiles
    const currentDeleted = this.state.deleted
    const historyItem = this.state.historyItem
    let authFiles = []
    let deleted = []
    const houseItem = historyItem.filter((item, key) => {
      return item.cateCode === 'C10014'
    })[0]
    const currentHouseItem = currentAuthFiles.C10014 || []
    if (currentHouseItem.length > 0 || houseItem.historyItem.length > 0) {
      for (const key in currentAuthFiles) {
        const item = {
          code: key,
          files: currentAuthFiles[key]
        }
        if (key === 'C10014' && currentAuthFiles[key].length > 0) { // 房产
          if (!this.hasAddress()) {
            this.setState({ addressModal: true })
            return
          }
          item.houseMap = this.state.address
        }
        authFiles.push(item)
      }
    } else {
      global.alert.show({
        content: '请上传房产'
      })
      return
    }

    currentDeleted.map((item, key) => {
      deleted.push({
        uploadId: item
      })
    })
    authFiles = JSON.stringify(authFiles)
    deleted = JSON.stringify(deleted)
    console.log({ deleted, authFiles })
    const res = await ajaxStore.credit.saveAuthFile({ deleted, authFiles })
    console.log(res.data)
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
                <UploadHistory creditItem={creditItem}
                  onLoad={(currentItem) => { this.setHistory(currentItem) }}
                  onChange={(deleted) => { this.setDeleted(deleted) }}/>
                <UploadHouse creditItem={creditItem}
                  onChange={(authFiles) => { this.setAuthFiles(authFiles) }}
                  onLoading={(onLoading) => { this.setState({ onLoading }) }}
                  onError={() => { this.setState({ infoModal: true }) }}
                  onAddAddress={(address) => { this.setAddress(address) }}
                />
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

        {this.state.onLoading ? (
          <View style={styles.loading}>
            <View style={styles.loadingWarp}>
              <Text style={styles.loadingText}>正在识别照片内容，请稍后</Text>
              <Iconfont style={styles.loadingIcon} name={'icon-uploading'} size={dp(150)} />
            </View>
          </View>
        ) : (null)}
        {/* 识别失败弹窗 */}
        <ComfirmModal
          title={'识别失败'}
          content={'请上传符合照片要求、清晰的图片'}
          cancelText={'取消'}
          comfirmText={'再次上传'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
          }}
          infoModal={this.state.infoModal} />
        {/* 未选择地址弹窗 */}
        <AlertModal
          title={'提示'}
          content={'请选择对应房产图片的房产地址之后再保存'}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({
              addressModal: false
            })
          }}
          confirm={() => {
            this.setState({
              addressModal: false
            })
          }}
          infoModal={this.state.addressModal} />
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
    bottom: 0,
    right: 0,
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
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
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

export default connect(mapStateToProps)(HouseUpload)
