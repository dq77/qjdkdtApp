import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, showToast, injectUnmount, deepCopy } from '../../../utils/Utility'
import { connect } from 'react-redux'
import { getAuthFile } from '../../../actions'
import Iconfont from '../../../iconfont/Icon'
import { imgUrl } from '../../../utils/config'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from '../../../component/actionsheet'
import { getFileName } from '../../../utils/FileUtils'
import ajaxStore from '../../../utils/ajaxStore'
/**
 * 上传照片
 */
@injectUnmount
class IdcardFrontAndBack extends PureComponent {
  static defaultProps = {
    type: '',
    authFileItem: {},
    authFiles: [],
    front: '',
    back: ''
  }

  static propTypes = {
    type: PropTypes.string.isRequired,
    authFileItem: PropTypes.object.isRequired,
    authFiles: PropTypes.array.isRequired,
    front: PropTypes.string,
    back: PropTypes.string
  }

  static getDerivedStateFromProps (nextProps) {
    if (typeof (nextProps.count) === 'number') {
      return {
        count: nextProps.count
      }
    } else {
      return null
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      count: 0
    }
    this.pickSingleWithCamera = this.pickSingleWithCamera.bind(this)
    this.pickSingle = this.pickSingle.bind(this)
  }

  pickSingleWithCamera (cropping, mediaType = 'photo') {
    ImagePicker.openCamera({
      cropping: cropping,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType
    }).then(async image => {
      console.log('received image', image)
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
      cropping: cropit,
      compressImageQuality: 0.5,
      mediaType,
      includeExif: true
    }).then(async image => {
      console.log('received image', image)
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

  async uploadOCR (photoPath) {
    const side = this.props.type === 'back' ? 'back' : 'face'
    const data = {
      uploadedFile: {
        uri: photoPath,
        type: 'multipart/form-data',
        name: getFileName(photoPath)
      },
      side
    }

    this.props.onLoading(true)
    const res = await ajaxStore.credit.idcardUpload(data)
    this.props.onLoading(false)
    if (res.data && res.data.code === '0') {
      const count = this.state.count + 1
      if (res.data.data.identification || count > 1) {
        // const nav = this.props.type === 'front' ? 'IDCardFrontResult' : 'IDCardBackResult'
        if (this.props.type === 'front') {
          this.props.navigation.navigate('IDCardFrontResult', {
            ...res.data.data.idcardInfo,
            code: this.props.authFileItem.cateCode,
            fileKeyBack: this.props.back || undefined,
            submit: (data) => {
              this.props.onSuccess({
                code: this.props.authFileItem.cateCode,
                file: data.fileKey,
                type: this.props.type
              })
            }
          })
        } else {
          this.props.navigation.navigate('IDCardBackResult', {
            ...res.data.data.idcardInfo,
            code: this.props.authFileItem.cateCode,
            fileKey: this.props.front || undefined,
            submit: (data) => {
              this.props.onSuccess({
                code: this.props.authFileItem.cateCode,
                file: data.fileKeyBack,
                type: this.props.type
              })
            }
          })
        }
      } else {
        this.props.onFail({
          code: this.props.authFileItem.cateCode,
          count,
          type: this.props.type
        })
      }
    }
  }

  componentDidMount () {

  }

  render () {
    return (
      <View>
        <View style={styles.ImgWarp}>
          <Touchable onPress={() => {
            this.setState({
              currentCateCode: this.props.authFileItem.cateCode
            })
            this.ActionSheet.show()
          }}>
            <Iconfont style={styles.idcardUploadBtn} name={`idcard-${this.props.type}`} size={dp(320)} />
          </Touchable>
        </View>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  ImgWarp: {
    marginRight: dp(30),
    marginBottom: dp(30),
    width: DEVICE_WIDTH * 0.43,
    height: dp(200)
  },
  idcardUploadBtn: {
    marginTop: dp(-60)
  }
})

const mapStateToProps = state => {
  return {
  }
}

export default connect(mapStateToProps)(IdcardFrontAndBack)
