import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, DEVICE_HEIGHT, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, showToast, injectUnmount } from '../../../utils/Utility'
import PhotoModal from '../../../component/PhotoModal'
import { connect } from 'react-redux'
import { getAuthFile } from '../../../actions'
import Iconfont from '../../../iconfont/Icon'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from '../../../component/actionsheet'
import { getFileName } from '../../../utils/FileUtils'
import ajaxStore from '../../../utils/ajaxStore'
import RegionPickerUtil from '../../../utils/RegionPickerUtil'

/**
 * 上传房屋照片
 */
@injectUnmount
class UploadHouse extends PureComponent {
  static defaultProps = {
    creditItem: {}
  }

  static propTypes = {
    creditItem: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      imageData: [],
      modalVisible: false,
      curentImage: '',
      currentCateCode: '',
      currentAuthFileMap: [],
      authFiles: [],
      houseMap: {},
      uploadFailCount: {}
    }
    this.pickSingleWithCamera = this.pickSingleWithCamera.bind(this)
    this.pickSingle = this.pickSingle.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
    this.showPhoto = this.showPhoto.bind(this)
  }

  pickSingleWithCamera (cropping, mediaType = 'photo') {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType
    }).then(async image => {
      this.uploadOCR(image.path)
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  pickSingle (cropit, circular = false, mediaType = 'photo') {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      compressImageQuality: 0.5,
      mediaType,
      includeExif: true
    }).then(async image => {
      this.uploadOCR(image.path)
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  async addPic (path) {
    const imageData = this.state.imageData
    const currentCateCode = this.state.currentCateCode
    let files = []
    files = files.concat(imageData[this.state.currentCateCode]).concat(path)
    imageData[currentCateCode] = files
    await this.setState({
      imageData
    })
    this.forceUpdate()
  }

  async uploadOCR (photoPath) {
    const data = {
      uploadedFile: {
        uri: photoPath,
        type: 'multipart/form-data',
        name: getFileName(photoPath)
      },
      code: this.state.currentCateCode
    }
    this.props.onLoading(true)
    const res = await ajaxStore.credit.assetsUpload(data)
    console.log(res.data)
    this.props.onLoading(false)
    if (res.data && res.data.code === '0') {
      const code = this.state.currentCateCode
      const uploadFailCount = {}
      if (res.data.data.identification) { // 识别成功
        uploadFailCount[code] = 0
        this.setState({
          uploadFailCount: {
            ...this.state.uploadFailCount,
            ...uploadFailCount
          }
        })
      } else { // 识别失败 两次机会
        const count = this.state.uploadFailCount[code]
        if (count && count === 1) { // 识别失败过
          uploadFailCount[code] = 0
          this.setState({
            uploadFailCount: {
              ...this.state.uploadFailCount,
              ...uploadFailCount
            }
          })
        } else { // 第一次失败
          uploadFailCount[code] = 1
          this.setState({
            uploadFailCount: {
              ...this.state.uploadFailCount,
              ...uploadFailCount
            }
          })
          this.props.onError()
          return
        }
      }
      this.addPic(photoPath)
      const authFiles = this.state.authFiles
      const currentCateCode = this.state.currentCateCode
      let files = []
      files = files.concat(authFiles[currentCateCode]).concat(res.data.data.fileKey)
      authFiles[currentCateCode] = files
      await this.setState({ authFiles })
      this.props.onChange(this.state.authFiles)
      console.log(this.state)
    }
  }

  async deletePhoto (index, cateCode) {
    let localFiles = []
    let onlineFiles = []
    const imageData = this.state.imageData
    const authFiles = this.state.authFiles

    // 删除地址信息
    const houseMap = this.state.houseMap
    if (houseMap[authFiles[cateCode][index]]) {
      delete houseMap[authFiles[cateCode][index]]
    }
    this.setState({
      houseMap
    })
    console.log(houseMap)
    this.props.onAddAddress(houseMap)
    // 删除图片信息
    localFiles = localFiles.concat(imageData[cateCode])
    onlineFiles = onlineFiles.concat(authFiles[cateCode])
    localFiles.splice(index, 1)
    onlineFiles.splice(index, 1)
    imageData[cateCode] = localFiles
    authFiles[cateCode] = onlineFiles
    await this.setState({
      imageData,
      authFiles
    })
    this.props.onChange(this.state.authFiles)
    this.forceUpdate()
  }

  showPhoto (modalVisible, index, cateCode) {
    this.setState({
      currentCateCode: cateCode,
      modalVisible,
      curentImage: index || index === 0 ? index : ''
    })
  }

  setCurrentAuthFileMap () {
    const currentAuthFileMap = []
    const authFiles = []
    const imageData = []
    this.props.authFileMap.map((item, index) => {
      if (this.props.creditItem.cateCode.indexOf(item.cateCode) > -1) {
        currentAuthFileMap.push(item)
        authFiles[item.cateCode] = []
        imageData[item.cateCode] = []
      }
    })
    this.setState({
      currentAuthFileMap,
      authFiles,
      imageData
    })
  }

  choseLocation = (index) => {
    RegionPickerUtil
      .setConfirm((data) => {
        // console.log(data)
        // console.log(this.state.authFiles)
        // console.log(this.state.currentAuthFileMap)
        const key = this.state.authFiles[this.state.currentAuthFileMap[0].cateCode][index]
        const temp = {}
        temp[key] = {
          name: data.label,
          code: data.areaCode
        }
        this.setState({
          houseMap: {
            ...this.state.houseMap,
            ...temp
          }
        }, () => { this.props.onAddAddress(this.state.houseMap) })
      })
      .show()
  }

  isAddAddress (index) {
    const key = this.state.authFiles[this.state.currentAuthFileMap[0].cateCode][index]
    return this.state.houseMap[key]
  }

  componentDidMount () {
    this.setCurrentAuthFileMap()

    RegionPickerUtil
      .init()
  }

  render () {
    return (
      <View>
        <View style={styles.uploadWrap}>
          <View style={styles.uploadTitle}>
            <Text style={styles.uploadTitleText}>{'上传照片'}</Text>
          </View>
          {this.state.currentAuthFileMap.map((authFileItem, i) => {
            return (
              <View style={styles.uploadDetail} key={i}>
                {this.state.currentAuthFileMap.length > 1 ? (
                  <View style={styles.uploadMapTitle}>
                    {authFileItem.isRequired ? (
                      <Text style={styles.required}>{'*'}</Text>
                    ) : (null)}
                    <Text style={styles.uploadMapTitleText}>{authFileItem.title}</Text>
                  </View>
                ) : (null)}
                {this.state.imageData[authFileItem.cateCode] && this.state.imageData[authFileItem.cateCode].map((item, index) => {
                // console.log(authFileItem)
                // console.log(i)
                // console.log(item)
                // console.log(index)
                  return (
                    <View style={styles.imgContainer} key={index}>
                      <Touchable style={styles.ImgWarp} onPress={() => { this.showPhoto(true, index, authFileItem.cateCode) }}>
                        <Image style={styles.uploadImg} source={{ uri: item }} />
                      </Touchable>
                      <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(index, authFileItem.cateCode)}>
                        <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                      </Touchable>

                      {authFileItem.title === '房产'
                        ? <Touchable onPress={() => { this.choseLocation(index) }}>
                          <View style={styles.localContainer}>
                            <Iconfont name={this.isAddAddress(index) ? 'icon-signed' : 'icon-unsigned'} size={dp(30)} />
                            <Text style={styles.localText}>{this.isAddAddress(index) ? '已选择' : '选择地址'}</Text>
                          </View>
                        </Touchable>
                        : null}
                    </View>
                  )
                })}
                <Touchable onPress={() => {
                  this.setState({
                    currentCateCode: authFileItem.cateCode
                  })
                  this.ActionSheet.show()
                }}>
                  <View style={styles.uploadBtnWarp}>
                    <Iconfont style={styles.uploadBtn} name={'iconfont707'} size={dp(100)} />
                  </View>
                </Touchable>
              </View>
            )
          })}
          <ActionSheet
            ref={o => { this.ActionSheet = o }}
            options={['拍照', '从相册中选择', '取消']}
            cancelButtonIndex={2} // 表示取消按钮是第index个
            destructiveButtonIndex={2} // 第几个按钮显示为红色
            onPress={(index) => {
              switch (index) {
                case 0:
                  this.pickSingleWithCamera(false)
                  break
                case 1:
                  this.pickSingle(false)
                  break
              }
            }}
          />
          {this.state.imageData[this.state.currentCateCode] && this.state.imageData[this.state.currentCateCode].length && this.state.modalVisible && this.state.curentImage !== '' ? (
            <PhotoModal imageData={this.state.imageData[this.state.currentCateCode]} modalVisible={this.state.modalVisible} curentImage={this.state.curentImage} cancel={() => this.showPhoto(false)} />
          ) : (null)
          }

        </View>
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
    borderWidth: dp(2),
    borderColor: Color.ICON_GRAY

  },
  uploadBtn: {
    color: Color.ICON_GRAY
  },
  uploadImg: {
    width: DEVICE_WIDTH * 0.19,
    height: DEVICE_WIDTH * 0.19
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
  imgContainer: {
    marginRight: dp(30),
    marginBottom: dp(30)
  },
  localText: {
    color: Color.TEXT_DARK,
    marginLeft: dp(5),
    fontSize: dp(25)
  },
  localContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(10)
  }
})

const mapStateToProps = state => {
  return {
    authFileItems: state.credit.authFileItems,
    authFileMap: state.credit.authFileMap
  }
}

export default connect(mapStateToProps)(UploadHouse)
