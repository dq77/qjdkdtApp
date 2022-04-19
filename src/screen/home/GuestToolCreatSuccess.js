import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TextInput
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import { share } from '../../utils/ShareUtil'
import ComfirmModal from '../../component/ComfirmModal'
import {
  goodsImgUrl,
  webUrl
} from '../../utils/config'
import ajaxStore from '../../utils/ajaxStore'
import { onClickEvent, onEvent } from '../../utils/AnalyticsUtil'

class GuestToolCreatSuccess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      infoData: {},
      height: dp(563)
    }
  }

  componentDidMount () {
    this.visitorInfoPoster()
  }

  async visitorInfoPoster () {
    const { navigation } = this.props
    const { itemId } = navigation.state.params
    const data = {
      id: itemId
    }
    const res = await ajaxStore.company.visitorInfoPoster(data)
    if (res.data && res.data.code === '0') {
      Image.getSize(`${goodsImgUrl}${res.data.data.storageUrl}`, (w, h) => {
      // 这里的w和h就是图片的宽高
        const height = Math.floor(h) / Math.floor(w) * DEVICE_WIDTH
        this.setState({
          infoData: res.data.data,
          height
        })
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async visitorInvalidPoster () {
    const { navigation } = this.props
    const { itemId } = navigation.state.params
    const data = {
      id: itemId
    }
    const res = await ajaxStore.company.visitorInvalidPoster(data)
    if (res.data && res.data.code === '0') {
      onEvent('销售工具- 详情页-失效链接-确认', 'home/GuestToolCreatSuccess', '/erp/visitor/invalidPoster')
      navigation.navigate('GuestTool')
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  render () {
    const { navigation } = this.props
    const { itemId } = navigation.state.params
    const { infoData, height } = this.state
    return (
      <View style={styles.container}>
        <NavBar
          title={`${infoData.activityTitle || ''}`}
          navigation={navigation}
          rightText={'关闭'}
          rightIcon={''}
          leftIcon={''}
          onRightPress={() => navigation.navigate('GuestTool')}
          onLeftPress={() => {}}
        />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Image
            resizeMode={'cover'}
            defaultSource={require('../../images/default_banner.png')}
            style={[styles.toolImg, { height: height }]} source={{ uri: `${goodsImgUrl}${infoData.storageUrl}` }}></Image>
          <Text style={styles.companyNameText}>{infoData.enterpriseName}</Text>
          <Text style={styles.decText}>{infoData.activitySlogan}</Text>
          <Text style={styles.titleText}>—— 客户资料登记 ——</Text>
          <Text style={styles.nameText}>
            姓名
            <Text style={styles.xText}>*</Text>
          </Text>
          <TextInput
            placeholder={'请输入姓名'}
            autoCapitalize={'none'}
            style={styles.textInput}
            onChangeText={(text) => {}}
          />
          <Text style={styles.nameText}>
            联系方式
            <Text style={styles.xText}>*</Text>
          </Text>
          <TextInput
            placeholder={'请输入联系方式'}
            autoCapitalize={'none'}
            style={styles.textInput}
            onChangeText={(text) => {}}
          />
          {infoData.activityStatus === 0 ? <View style={styles.creatBottomBGView}>
            <Touchable
              isNativeFeedback={true}
              onPress={() => {
                this.setState({
                  infoModal: true
                })
              }}>
              <View style={styles.creatLeftBGView}>
                <Text style={styles.creatLeftText}>失效链接</Text>
              </View>
            </Touchable>
            <Touchable
              isNativeFeedback={true}
              onPress={() => {
                onClickEvent('销售工具-分享链接', 'home/GuestToolCreatSuccess')
                share(`${infoData.activitySlogan}`, `${webUrl}/tools/research?id=${itemId}`, `${infoData.enterpriseName}`, (index, message) => {
                  console.log(index + '--' + message)
                })
              }}>
              <View style={styles.creatBGView}>
                <Text style={styles.creatText}>分享链接</Text>
              </View>
            </Touchable>
          </View> : <View style={styles.creatBottomBGView}></View>}
          <ComfirmModal
            title={'确认失效链接'}
            content={'链接失效后，用户将无法查看页面'}
            cancelText={'取消'}
            comfirmText={'确认'}
            cancel={() => {
              this.setState({
                infoModal: false
              })
            }}
            confirm={() => {
              this.setState({
                infoModal: false
              })
              this.visitorInvalidPoster()
            }}
            infoModal={this.state.infoModal} />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  creatBottomBGView: {
    flexDirection: 'row',
    marginBottom: dp(159),
    marginTop: dp(40),
    justifyContent: 'space-evenly'
  },
  decText: {
    fontSize: dp(28),
    color: '#91969A',
    textAlign: 'center',
    marginTop: dp(20)
  },
  titleText: {
    fontSize: dp(30),
    color: '#000000',
    textAlign: 'center',
    marginTop: dp(58)
  },
  companyNameText: {
    fontSize: dp(32),
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: dp(20)
  },
  creatLeftBGView: {
    height: dp(88),
    width: dp(330),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(44),
    borderWidth: dp(1),
    borderColor: '#91969A'
  },
  creatBGView: {
    backgroundColor: '#2A6EE7',
    height: dp(88),
    width: dp(330),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(44)
  },
  creatLeftText: {
    fontSize: dp(30),
    color: '#91969A'
  },
  creatText: {
    fontSize: dp(30),
    color: '#FFFFFF'
  },
  textInput: {
    paddingVertical: dp(20),
    paddingHorizontal: dp(20),
    marginHorizontal: dp(30),
    color: '#2D2926',
    textAlign: 'left',
    fontSize: dp(30),
    borderRadius: dp(8),
    borderColor: '#D8DDE2',
    borderWidth: dp(1),
    marginTop: dp(10),
    backgroundColor: '#FFFFFF'
  },
  xText: {
    fontSize: dp(28),
    color: '#F55849'
  },
  nameText: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(30),
    marginLeft: dp(30)
  },
  toolImg: {
    marginBottom: dp(10),
    width: DEVICE_WIDTH
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  }
})

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier
  }
}

export default connect(mapStateToProps)(GuestToolCreatSuccess)
