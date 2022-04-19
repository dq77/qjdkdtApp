
import React, { PureComponent } from 'react'
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  ScrollView,
  ListView,
  Image,
  Modal,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'
import ImageViewer from 'react-native-image-zoom-viewer'
import { DEVICE_WIDTH, DEVICE_HEIGHT, getRealDP as dp } from '../utils/screenUtil'
import { baseUrl } from '../utils/config'

class PhotoModal extends PureComponent {
  static defaultProps = {
    type: 'normal',
    modalVisible: false,
    imageData: [],
    curentImage: 0,
    cancel: function () {}
  }

  static propTypes = {
    type: PropTypes.string,
    modalVisible: PropTypes.bool.isRequired,
    imageData: PropTypes.array.isRequired,
    curentImage: PropTypes.number,
    cancel: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      animating: true
    }
    this.renderLoad = this.renderLoad.bind(this)
    this._Close = this._Close.bind(this)
  }

  componentDidMount () {

  }

  _Close () {
    this.props.cancel()
  }

  renderLoad () { // 这里是写的一个loading
    return (
      <View style={{ marginTop: (DEVICE_HEIGHT / 2) - 20 }}>
        <ActivityIndicator animating={this.state.animating} size={'large'} />
      </View>
    )
  }

  render () {
    const { imageData, curentImage, modalVisible, type } = this.props
    const ImageObjArray = []
    for (let i = 0; i < imageData.length; i++) {
      const Obj = {}
      if (type === 'orderFile') {
        Obj.url = `${baseUrl}/ofs/weixin/project/loadFile?buzKey=${imageData[i]}`
      } else {
        Obj.url = imageData[i]
      }
      ImageObjArray.push(Obj)
    }
    return (
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={modalVisible}
        //    onRequestClose={() => { this._pressSignClose() }}
        >
          <ImageViewer
            imageUrls={ImageObjArray} // 照片路径
            enableImageZoom={true} // 是否开启手势缩放
            saveToLocalByLongPress={false} // 是否开启长按保存
            index={curentImage} // 初始显示第几张
            // failImageSource={} // 加载失败图片
            loadingRender={this.renderLoad}
            enableSwipeDown={false}
            menuContext={{ saveToLocal: '保存图片', cancel: '取消' }}
            onChange={(index) => { }} // 图片切换时触发
            onClick={() => { // 图片单击事件
              this._Close()
            }}
            onSave={(url) => { this.savePhoto(url) }}

          />

        </Modal>

      </View>

    )
  }
}

export default PhotoModal
