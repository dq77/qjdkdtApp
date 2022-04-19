import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, showToast, injectUnmount, deepCopy } from '../../../utils/Utility'
import PhotoModal from '../../../component/PhotoModal'
import { connect } from 'react-redux'
import { getAuthFile } from '../../../actions'
import Iconfont from '../../../iconfont/Icon'
import { imgUrl } from '../../../utils/config'
import ajaxStore from '../../../utils/ajaxStore'
import IdcardFrontAndBack from './IdcardFrontAndBack'
import ComfirmModal from '../../../component/ComfirmModal'
/**
 * 上传照片
 */
@injectUnmount
class SingleIdcardUpload extends PureComponent {
  static defaultProps = {
    creditItem: {},
    historyItem: [],
    loadHistory: false
  }

  static propTypes = {
    creditItem: PropTypes.object.isRequired,
    historyItem: PropTypes.array.isRequired,
    loadHistory: PropTypes.bool.isRequired
  }

  static getDerivedStateFromProps (nextProps) {
    if (nextProps.loadHistory) {
      return {
        loadHistory: nextProps.loadHistory,
        historyItem: nextProps.historyItem,
        creditItem: nextProps.creditItem
      }
    } else {
      return {}
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,
      currentImage: '',
      currentCateCode: '',
      currentAuthFileMap: [],
      authFiles: [],
      side: '',
      historyItem: [],
      imageData: [],
      count: [],
      deleted: [],
      infoModal: false
    }
    this.deletePhoto = this.deletePhoto.bind(this)
    this.showPhoto = this.showPhoto.bind(this)
  }

  // componentDidUpdate (prevProps) {
  //   if (prevProps.loadHistory !== this.props.loadHistory) {
  //     this.initHistory()
  //   }
  // }

  async initHistory () {
    const currentAuthFileMap = deepCopy(this.state.currentAuthFileMap)
    const authFiles = this.state.authFiles
    const count = []
    let files = []
    currentAuthFileMap.map((authFileItem, i) => {
      count[authFileItem.cateCode] = {
        front: 0,
        back: 0
      }
      this.state.historyItem.map((historyItem, j) => {
        historyItem.historyItem.map((history, k) => {
          if (history.cateCode === authFileItem.cateCode) {
            files = files.concat(history.filePath)
            if (history.idCardNo && history.idCardInfoType && historyItem.historyItem.length - 1 === k) {
              const newFiles = deepCopy(files)
              files[0] = newFiles[1]
              files[1] = newFiles[0]
            }
            authFiles[history.cateCode] = files
            if (files.length === 2) {
              files = []
            }
          }
        })
      })
    })
    await this.setState({
      currentAuthFileMap,
      authFiles,
      count
    })
    this.setImageData()
  }

  async setAuthFiles (authFile) {
    const authFiles = this.state.authFiles
    const index = authFile.type === 'front' ? 0 : 1
    const count = this.state.count
    count[authFile.code][authFile.type] = 0
    authFiles[authFile.code][index] = authFile.file
    await this.setState({
      authFiles,
      count
    })
    this.setImageData()
    this.props.onChange(this.state.authFiles)
  }

  async deletePhoto (i, type, cateCode) {
    let onlineFiles = []
    let deleted = []
    deleted = deleted.concat(this.state.deleted)
    const index = type === 'front' ? 0 : 1
    const authFiles = deepCopy(this.state.authFiles)
    const currentAuthFileMap = deepCopy(this.state.currentAuthFileMap)
    onlineFiles = onlineFiles.concat(authFiles[cateCode])
    onlineFiles[index] = ''
    authFiles[cateCode] = onlineFiles
    currentAuthFileMap[i][type] = ''
    authFiles[cateCode][index] = ''
    this.props.authFileItems.map((item, key) => {
      if (item.cateCode === cateCode && item.historyItem[index]) {
        deleted.push(item.historyItem[index].id)
      }
    })
    await this.setState({
      authFiles,
      currentAuthFileMap,
      deleted
    })
    this.setImageData()
    this.props.onChange(this.state.authFiles)
    this.props.onDelete(deleted)
    let count = []
    count = this.state.count
    count[cateCode][type] = 0
    this.setState({
      count
    })
  }

  showPhoto (modalVisible, index, cateCode) {
    let currentImage = index || index === 0 ? index : ''
    if (this.state.imageData[cateCode] && index > this.state.imageData[cateCode].length - 1) {
      currentImage = 0
    }
    this.setState({
      currentCateCode: cateCode,
      modalVisible,
      currentImage: currentImage
    })
  }

  async setCurrentAuthFileMap () {
    const currentAuthFileMap = []
    const authFiles = []
    this.props.authFileMap.map((item, index) => {
      if (this.props.creditItem.cateCode.indexOf(item.cateCode) > -1) {
        currentAuthFileMap.push(item)
        authFiles[item.cateCode] = []
      }
    })
    await this.setState({
      currentAuthFileMap,
      authFiles
    })
    this.initHistory()
  }

  setImageData () {
    const imageData = []
    const authFiles = this.state.authFiles
    for (const key in authFiles) {
      imageData[key] = []
      authFiles[key].map((url, index) => {
        url && imageData[key].push(`${imgUrl}${url}`)
      })
    }
    this.setState({
      imageData
    })
  }

  setIdcardLoading (idcardLoading) {
    this.props.onLoading(idcardLoading)
  }

  onFail (data) {
    let count = []
    count = this.state.count
    count[data.code][data.type] = data.count
    this.setState({
      count
    })
    if (data.count < 2) {
      this.setState({
        infoModal: true
      })
    }
    this.props.onLoading(false)
  }

  componentDidMount () {
    this.setCurrentAuthFileMap()
  }

  render () {
    return (
      <View>
        {this.state.loadHistory ? (
          <View style={styles.uploadWrap}>
            <View style={styles.uploadTitle}>
              <Text style={styles.uploadTitleText}>{'上传照片'}</Text>
            </View>
            {this.state.currentAuthFileMap.map((authFileItem, i) => {
              return (
                <View key={i}>
                  <View style={styles.uploadDetail}>
                    {this.state.currentAuthFileMap.length > 1 ? (
                      <View style={styles.uploadMapTitle}>
                        {authFileItem.isRequired ? (
                          <Text style={styles.required}>{'*'}</Text>
                        ) : (null)}
                        <Text style={styles.uploadMapTitleText}>{authFileItem.title}</Text>
                      </View>
                    ) : (null)}
                    <View style={styles.uploadIdcard}>
                      {this.state.authFiles[authFileItem.cateCode][0] ? (
                        <View style={styles.ImgWarp}>
                          <Touchable onPress={() => { this.showPhoto(true, 0, authFileItem.cateCode) }}>
                            <Image style={styles.uploadImg} source={{ uri: `${imgUrl}${this.state.authFiles[authFileItem.cateCode][0]}` }} />
                          </Touchable>
                          <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(i, 'front', authFileItem.cateCode)}>
                            <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                          </Touchable>
                        </View>
                      ) : this.state.count[authFileItem.cateCode] ? (
                        <IdcardFrontAndBack navigation={this.props.navigation} count={this.state.count[authFileItem.cateCode].front} type={'front'} authFiles={this.state.authFiles} authFileItem={authFileItem} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} onSuccess={(authFile) => { this.setAuthFiles(authFile) }} onFail={(data) => { this.onFail(data) }} />
                      ) : (null)
                      }
                      {this.state.authFiles[authFileItem.cateCode][1] ? (
                        <View style={styles.ImgWarp}>
                          <Touchable onPress={() => { this.showPhoto(true, 1, authFileItem.cateCode) }}>
                            <Image style={styles.uploadImg} source={{ uri: `${imgUrl}${this.state.authFiles[authFileItem.cateCode][1]}` }} />
                          </Touchable>
                          <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(i, 'back', authFileItem.cateCode)}>
                            <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                          </Touchable>
                        </View>
                      ) : this.state.count[authFileItem.cateCode] ? (
                        <IdcardFrontAndBack navigation={this.props.navigation} count={this.state.count[authFileItem.cateCode].back} type={'back'} authFiles={this.state.authFiles} authFileItem={authFileItem} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} onSuccess={(authFile) => { this.setAuthFiles(authFile) }} onFail={(data) => { this.onFail(data) }} />
                      ) : (null)
                      }
                    </View>
                  </View>
                </View>
              )
            })}
            {this.state.authFiles[this.state.currentCateCode] && this.state.authFiles[this.state.currentCateCode].length && this.state.modalVisible && this.state.currentImage !== '' ? (
              <PhotoModal imageData={this.state.imageData[this.state.currentCateCode]} modalVisible={this.state.modalVisible} currentImage={this.state.currentImage} cancel={() => this.showPhoto(false)} />
            ) : (null)
            }
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
          </View>
        ) : (null)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  uploadWrap: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.WHITE
  },
  uploadTitle: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.DEFAULT_BG,
    paddingHorizontal: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(15)
  },
  uploadTitleText: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(32)
  },
  uploadDetail: {
    backgroundColor: Color.WHITE,
    paddingTop: dp(30),
    paddingLeft: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  uploadBtnWarp: {
    padding: dp(23),
    borderWidth: dp(2),
    borderColor: Color.ICON_GRAY,
    marginBottom: dp(30)
  },
  ImgWarp: {
    marginRight: dp(30),
    marginBottom: dp(30),
    width: DEVICE_WIDTH * 0.43,
    height: dp(200)
  },
  uploadBtn: {
    color: Color.ICON_GRAY
  },
  uploadImg: {
    width: DEVICE_WIDTH * 0.43,
    height: dp(200)
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: dp(-25),
    top: dp(-25)
  },
  uploadMapTitle: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: dp(30)
  },
  required: {
    color: Color.RED
  },
  uploadMapTitleText: {
    color: Color.TEXT_LIGHT
  },
  uploadIdcard: {
    width: DEVICE_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  idcardUploadBtn: {
    marginTop: dp(-60)
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  }
})

const mapStateToProps = state => {
  return {
    authFileItems: state.credit.authFileItems,
    authFileMap: state.credit.authFileMap
  }
}

export default connect(mapStateToProps)(SingleIdcardUpload)
