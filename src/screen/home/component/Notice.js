import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../../utils/screenUtil'
import { onClickEvent } from '../../../utils/AnalyticsUtil'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import Swiper from 'react-native-swiper'
import {
  goodsImgUrl,
  webUrl
} from '../../../utils/config'

class Notice extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
  }

  renderImg = () => {
    const { bulletinList = [] } = this.props
    const imageViews = []
    for (let i = 0; i < bulletinList.length; i++) {
      imageViews.push(
        <Touchable
          onPress={(data) => {
            onClickEvent('主页-公告', 'home/notice', { noticeId: bulletinList[i].id })
            this.props.navigation.navigate('WebView', {
              url:
              `${webUrl}/tools/noticeDetail?id=${bulletinList[i].id}`,
              title: bulletinList[i].noticeName
            })
          }} key={`${i}`}>
          <View key={`${i}`} style={styles.slide1}>
            <Text style={styles.text} numberOfLines={1}>{bulletinList[i].noticeName}</Text>
          </View>
        </Touchable>
      )
    }
    return imageViews
  }

  render () {
    return (
      <View style={styles.slide}>
        <View style={styles.leftSlide}>
          <Iconfont
            style={styles.my}
            size={dp(32)}
            name={'xiaoxilaba'}
          />
          <Swiper
            width={dp(480)}
            horizontal={false}
            removeClippedSubviews={false}
            dot={
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0)'
                }}
              />
            }
            activeDot={
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0)'
                }}
              />
            }
            autoplayTimeout={5}
            autoplay={true}>
            {this.renderImg()}
          </Swiper>
          <Touchable
            onPress={() => {
              this.props.navigation.navigate('NoticeList')
            }}>
            <View style={styles.leftSlide}>
              <Text style={styles.moreText}>更多</Text>
              <Iconfont
                style={styles.myRight}
                size={dp(24)}
                name={'arrow-right1'}
              />
            </View>
          </Touchable>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    color: '#2D2926',
    fontSize: dp(28),
    width: dp(440)
  },
  moreText: {
    color: '#91969A',
    fontSize: dp(28),
    marginRight: dp(17)
  },
  myRight: {
    marginRight: dp(30)
  },
  slide1: {
    justifyContent: 'center',
    backgroundColor: 'white',
    height: dp(96)
  },
  slide: {
    backgroundColor: 'white',
    height: dp(96),
    borderRadius: dp(48),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dp(40),
    justifyContent: 'space-between',
    marginHorizontal: dp(30)
  },
  leftSlide: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  my: {
    marginLeft: dp(38),
    marginRight: dp(20)
  }
})

export default Notice
