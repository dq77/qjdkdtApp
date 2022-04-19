import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Image
} from 'react-native'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../../utils/screenUtil'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import {
  goodsImgUrl
} from '../../../utils/config'
import ajaxStore from '../../../utils/ajaxStore'

class MapDepot extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      imageList: [],
      refreshing: true
    }
  }

  componentDidMount () {
    this.visitorDefaultImages()
  }

  async visitorDefaultImages () {
    const res = await ajaxStore.company.visitorDefaultImages()
    if (res.data && res.data.code === '0') {
      const data = res.data.data || []
      data.forEach(element => {
        element.status = '1'
      })

      this.visitorMyImages(data)
    } else {
      this.setState({
        refreshing: false
      })
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async visitorMyImages (list) {
    const res = await ajaxStore.company.visitorMyImages()
    if (res.data && res.data.code === '0') {
      this.setState({
        refreshing: false
      })
      const visitorMyImagesList = res.data.data || []
      this.setState({
        imageList: [{ status: '1', index: -1 }, ...visitorMyImagesList, ...list]
      })
    } else {
      this.setState({
        refreshing: false
      })
      global.alert.show({
        content: res.data.message
      })
    }
  }

  onRefresh = async () => {
    if (this.state.refreshing) return
    this.visitorDefaultImages(true)
  }

  render () {
    const { imgStatus } = this.props
    const { imageList } = this.state
    return (
      <FlatList
        data={imageList}
        horizontal={false}
        numColumns={2}
        renderItem={data => (
          <View>
            {data.item.index === -1
              ? <Touchable onPress={() => {
                if (data.item.index === -1) {
                  this.props.clickAdd()
                }
              }}>
                <View style={styles.addImgBGView}>
                  <Iconfont
                    size={dp(60)}
                    name={'xinzengtupian'}
                    color={'#91969A'}
                  />
                  <Text style={{ color: '#91969A', fontSize: dp(26), marginTop: dp(20) }}>新增图片</Text>
                </View>
                {/* <Image style={styles.img} source={{ uri: `${guestToolImgUrl}${data.item.pictureUrl}` }}></Image> */}
              </Touchable> : <Image
                resizeMode={'cover'}
                defaultSource={require('../../../images/default_banner.png')}
                style={styles.img} source={{ uri: `${goodsImgUrl}${data.item.pictureUrl}` }}></Image>}
            {imgStatus === 2 && data.item.status !== '1' && <Touchable onPress={() => {
              this.props.clickX(data.item.id)
            }}
            style={styles.mycha}>
              <Iconfont
                size={dp(37)}
                name={'huokegongju-shanchutupian'}
              />
            </Touchable>}
          </View>)}
        keyExtractor={(item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  addImgBGView: {
    width: dp(330),
    height: dp(248),
    marginLeft: dp(30),
    marginTop: dp(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8DDE2'
  },
  mycha: {
    position: 'absolute',
    marginLeft: dp(310),
    marginTop: dp(40),
    width: dp(50),
    height: dp(50)
  },
  img: {
    width: dp(330),
    height: dp(248),
    marginLeft: dp(30),
    marginTop: dp(30)
  },
  BGView: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  }
})

export default MapDepot
