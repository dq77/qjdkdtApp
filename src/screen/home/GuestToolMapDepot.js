import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  Image,
  Text,
  FlatList,
  RefreshControl
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, getBottomSpace } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import {
  goodsImgUrl
} from '../../utils/config'
import { onClickEvent } from '../../utils/AnalyticsUtil'

class GuestToolMapDepot extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: true,
      imageList: [],
      dataPic: {},
      selectNum: -1
    }
  }

  componentDidMount () {
    this.visitorDefaultImages()
  }

  async visitorDefaultImages () {
    const res = await ajaxStore.company.visitorDefaultImages()
    if (res.data && res.data.code === '0') {
      const data = res.data.data || []
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
        imageList: [...visitorMyImagesList, ...list]
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
    const { navigation } = this.props
    const { imageList, dataPic } = this.state
    return (
      <View style={styles.container}>
        <NavBar
          title={'选择图片'}
          navigation={navigation}
        />
        <FlatList
          data={imageList}
          horizontal={false}
          numColumns={2}
          renderItem={(data) => (
            <View>
              <Touchable onPress={() => {
                this.setState({
                  selectNum: data.index,
                  dataPic: data.item
                })
              }}>
                <Image
                  resizeMode={'cover'}
                  defaultSource={require('../../images/default_banner.png')}
                  style={styles.img} source={{ uri: `${goodsImgUrl}${data.item.pictureUrl}` }}></Image>
              </Touchable>
              <Iconfont
                style={styles.mycha}
                size={dp(37)}
                name={this.state.selectNum === data.index ? 'huokegongju-tijiaochenggong' : 'weixuanze'}
                color={'white'}
              />
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
        <Touchable
          isNativeFeedback={true}
          onPress={() => {
            if (this.state.selectNum !== -1) {
              onClickEvent('销售工具-创建链接-选择图片-下一步', 'home/GuestToolCreat')
              navigation.navigate('GuestToolCreat', { dataPic })
            } else {
              global.alert.show({
                content: '请先选择一张宣传图'
              })
            }
          }}>
          <View style={[styles.creatBGView, { opacity: this.state.selectNum === -1 ? 0.5 : 1 }]}>
            <Text style={styles.creatText}>下一步</Text>
          </View>
        </Touchable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  creatBGView: {
    marginHorizontal: dp(30),
    backgroundColor: '#2A6EE7',
    height: dp(88),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(44),
    marginBottom: dp(90) + getBottomSpace()
  },
  creatText: {
    fontSize: dp(30),
    color: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  mycha: {
    position: 'absolute',
    marginLeft: dp(310),
    marginTop: dp(40)
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

export default GuestToolMapDepot
