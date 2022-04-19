import React from 'react'
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RNCamera } from 'react-native-camera'
import { getSafeAreaInset } from 'react-native-pure-navigation-bar'
import Video from 'react-native-video'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'

/**
 * callback: (data: any[]) => void: 回调方法，传回照片或视频的数组。
 * maxSize?: number: 照片的最大数量。在拍照和从相册选择模式下生效。
 * sideType?: RNCamera.Constants.Type: 镜头，前置还是后置。在拍照和录像模式下生效。
 * flashMode?: RNCamera.Constants.FlashMode: 闪光灯。在拍照和录像模式下生效。
 * closePreview: 是否关闭预览
 * */

export default class extends React.PureComponent {
  static defaultProps = {
    maxSize: 1,
    sideType: RNCamera.Constants.Type.back,
    flashMode: 0,
    videoQuality: RNCamera.Constants.VideoQuality['480p'],
    pictureOptions: {},
    recordingOptions: {},
    closePreview: true,
    recordTime: 5, // 拍摄秒数
    navigation: {}
  };

  constructor (props) {
    super(props)

    this.flashModes = [
      RNCamera.Constants.FlashMode.auto,
      RNCamera.Constants.FlashMode.off,
      RNCamera.Constants.FlashMode.on
    ]
    this.state = {
      data: [],
      isPreview: false,
      sideType: this.props.sideType,
      flashMode: this.props.flashMode,
      isRecording: false,
      time: this.props.recordTime,
      hintMsg: `点击开始拍摄,时长${this.props.recordTime}秒`
    }
    this.isUnmount = false
  }

  componentDidMount () {
    Dimensions.addEventListener('change', this._onWindowChanged)
  }

  componentWillUnmount () {
    Dimensions.removeEventListener('change', this._onWindowChanged)
    this._timer && clearInterval(this._timer)
    this.isUnmount = true
    if (this.camera && this.state.isRecording) {
      console.log('停止录制')
      this.camera.stopRecording()
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'人脸识别'} navigation={navigation} />
        {this.props.closePreview
          ? this._renderCameraView()
          : !this.state.isPreview // 是否结束拍摄并开启预览
            ? this._renderCameraView()
            : this._renderPreviewView()}
        {!this.state.isPreview && this._renderTopView()}
        {this._renderBottomView()}
        {this._renderHintView()}
      </View>
    )
  }

  _renderHintView = () => {
    const safeArea = getSafeAreaInset()
    const style = {
      top: safeArea.top,
      left: safeArea.left,
      right: safeArea.right
    }
    return (
      <View style={[styles.hint, style]}>
        <Text style={styles.hintText}>{this.state.hintMsg}</Text>
      </View>
    )
  };

  _renderTopView = () => {
    // const safeArea = getSafeAreaInset();
    // const style = {
    //   top: safeArea.top,
    //   left: safeArea.left,
    //   right: safeArea.right,
    // };
    // const {flashMode} = this.state;
    // let image;
    // switch (flashMode) {
    //   case 1:
    //     image = require('./images/flash_close.png');
    //     break;
    //   case 2:
    //     image = require('./images/flash_open.png');
    //     break;
    //   default:
    //     image = require('./images/flash_auto.png');
    // }
    // return (
    //   <View style={[styles.top, style]}>
    //     {!this.props.isVideo &&
    //       this._renderTopButton(image, this._clickFlashMode)}
    //     {this._renderTopButton(
    //       require('./images/switch_camera.png'),
    //       this._clickSwitchSide,
    //     )}
    //   </View>
    // );
  };

  _renderTopButton = (image, onPress) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <Image style={styles.topImage} source={image} />
      </TouchableOpacity>
    )
  };

  _renderCameraView = () => {
    return (
      <RNCamera
        ref={cam => (this.camera = cam)}
        type={this.state.sideType}
        defaultVideoQuality={this.props.videoQuality}
        flashMode={this.flashModes[this.state.flashMode]}
        style={styles.camera}
        captureAudio={true}
        fixOrientation={true}
        onCameraReady={() => {
          // this._clickRecordVideo();
          // this.timer = setTimeout(() => {
          //   this._clickRecordVideo();
          // }, 5000);
        }}
      />
    )
  };

  _renderPreviewView = () => {
    const { width, height } = Dimensions.get('window')
    const safeArea = getSafeAreaInset()
    const style = {
      flex: 1,
      marginTop: safeArea.top + topHeight,
      marginLeft: safeArea.left,
      marginRight: safeArea.right,
      marginBottom: safeArea.bottom + bottomHeight,
      backgroundColor: 'black'
    }
    return (
      <View style={{ width, height }}>
        {this.props.isVideo ? (
          <Video
            source={{ uri: this.state.data[0].uri }}
            ref={ref => (this.player = ref)}
            style={style}
          />
        ) : (
          <Image
            resizeMode="contain"
            style={style}
            source={{ uri: this.state.data[0].uri }}
          />
        )}
      </View>
    )
  };

  _renderBottomView = () => {
    const safeArea = getSafeAreaInset()
    const style = {
      bottom: safeArea.bottom,
      left: safeArea.left,
      right: safeArea.right
    }
    const isMulti = this.props.maxSize > 1
    const hasPhoto = this.state.data.length > 0
    const inPreview = this.state.isPreview
    const isRecording = this.state.isRecording
    const buttonName = this.props.isVideo
      ? this.props.useVideoLabel
      : this.props.usePhotoLabel
    return (
      <View style={[styles.bottom, style]}>
        {isMulti && hasPhoto
          ? this._renderPreviewButton()
          : !isRecording &&
          this._renderBottomButton(this.props.cancelLabel, this._clickCancel)}
        {!inPreview && this._renderTakePhotoButton()}
        {isMulti
          ? hasPhoto &&
          this._renderBottomButton(this.props.okLabel, this._clickOK)
          : inPreview && this._renderBottomButton(buttonName, this._clickOK)}
      </View>
    )
  };

  _renderPreviewButton = () => {
    const text = '' + this.state.data.length + '/' + this.props.maxSize
    return (
      <TouchableOpacity
        onPress={this._clickPreview}
        style={styles.previewTouch}>
        <View style={styles.previewView}>
          <Image
            style={styles.previewImage}
            source={{ uri: this.state.data[this.state.data.length - 1].uri }}
          />
          <Text style={styles.previewText}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  };

  _renderBottomButton = (text, onPress) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.buttonTouch}>
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  };

  _renderTakePhotoButton = () => {
    const safeArea = getSafeAreaInset()
    const left =
      (Dimensions.get('window').width - safeArea.left - safeArea.right - 84) /
      2
    const icon = this.state.isRecording
      ? require('./images/video_recording.png')
      : require('./images/shutter.png')
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.isVideo) { // 录像
            if (this.state.isRecording) {
              this._clickRecordVideo()
            } else {
              this._clickRecordVideo()

              this._timer = setInterval(() => {
                this.setState({
                  time: this.state.time - 1,
                  hintMsg: `${this.state.time - 1}秒后结束`
                })
                if (this.state.time <= 0) {
                  this._clickRecordVideo()
                  this._timer && clearInterval(this._timer)
                }
              }, 1000)
            }
          } else { // 拍照
            this._clickTakePicture()
          }
          // this.props.isVideo ? this._clickRecordVideo : this._clickTakePicture;
        }}
        style={[styles.takeView, { left }]}>
        <Image style={styles.takeImage} source={icon} />
      </TouchableOpacity>
    )
  };

  _onFinish = data => {
    this.props.callback && this.props.callback(data)
  };

  _onDeletePageFinish = data => {
    this.setState({
      data: [...data]
    })
  };

  _clickTakePicture = async () => {
    if (this.camera) {
      const item = await this.camera.takePictureAsync({
        mirrorImage: this.state.sideType === RNCamera.Constants.Type.front,
        fixOrientation: true,
        forceUpOrientation: true,
        ...this.props.pictureOptions
      })
      if (Platform.OS === 'ios') {
        if (item.uri.startsWith('file://')) {
          item.uri = item.uri.substring(7)
        }
      }
      if (this.props.maxSize > 1) {
        if (this.state.data.length >= this.props.maxSize) {
          Alert.alert('', this.props.maxSizeTakeAlert(this.props.maxSize))
        } else {
          this.setState({
            data: [...this.state.data, item]
          })
        }
      } else {
        this.setState({
          data: [item],
          isPreview: true
        })
      }
    }
  };

  _clickRecordVideo = () => {
    if (this.camera) {
      if (this.state.isRecording) {
        console.log('停止录制')
        this.camera.stopRecording()
        this._timer && clearInterval(this._timer)
      } else {
        console.log('开始录制')
        this.setState(
          {
            isRecording: true
          },
          this._startRecording
        )
      }
    }
  };

  _startRecording = () => {
    this.camera.recordAsync(this.props.recordingOptions).then(item => {
      if (this.isUnmount) { return }
      if (Platform.OS === 'ios') {
        if (item.uri.startsWith('file://')) {
          item.uri = item.uri.substring(7)
        }
      }
      this.setState({
        data: [item],
        isRecording: false,
        isPreview: true
      })
      console.log('录制完成')
      console.log('callback' + item)
      this.props.callback && this.props.callback(item)
    })
  };

  _clickOK = () => {
    this._onFinish(this.state.data)
  };

  _clickSwitchSide = () => {
    const target =
      this.state.sideType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back
    this.setState({ sideType: target })
  };

  _clickFlashMode = () => {
    const newMode = (this.state.flashMode + 1) % this.flashModes.length
    this.setState({ flashMode: newMode })
  };

  _clickPreview = () => {
    this.props.navigation.navigate('PreviewMultiViewPage', {
      ...this.props,
      images: this.state.data,
      callback: this._onDeletePageFinish
    })
  };

  _clickCancel = () => {
    if (this.props.maxSize <= 1 && this.state.isPreview) {
      this.setState({
        data: [],
        isPreview: false
      })
    } else {
      this._onFinish([])
    }
  };

  _onWindowChanged = () => {
    this.forceUpdate()
  };
}

const topHeight = 60
const bottomHeight = 84

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  top: {
    position: 'absolute',
    height: topHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 5
  },
  hint: {
    position: 'absolute',
    height: topHeight,
    marginTop: dp(150),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  hintText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20
  },

  topImage: {
    margin: 10,
    width: 27,
    height: 27
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bottom: {
    position: 'absolute',
    height: 84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  takeView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  takeImage: {
    width: 64,
    height: 64,
    margin: 10
  },
  buttonTouch: {
    marginHorizontal: 5
  },
  buttonText: {
    margin: 10,
    height: 44,
    lineHeight: 44,
    fontSize: 16,
    color: 'white',
    backgroundColor: 'transparent'
  },
  previewTouch: {
    marginLeft: 15
  },
  previewView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 84
  },
  previewImage: {
    width: 50,
    height: 50
  },
  previewText: {
    fontSize: 16,
    marginLeft: 10,
    color: 'white',
    backgroundColor: 'transparent'
  }
})
