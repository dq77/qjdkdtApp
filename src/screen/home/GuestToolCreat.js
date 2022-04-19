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
import {
  goodsImgUrl
} from '../../utils/config'
import ajaxStore from '../../utils/ajaxStore'
import { isEmojiCharacterInString, trim } from '../../utils/Utility'
import { onEvent } from '../../utils/AnalyticsUtil'

class GuestToolCreat extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      companyName: '',
      slogan: '',
      height: dp(563)
    }

    const { navigation } = this.props
    const { dataPic } = navigation.state.params
    Image.getSize(`${goodsImgUrl}${dataPic.pictureUrl}`, (w, h) => {
      // 这里的w和h就是图片的宽高
      const height = Math.floor(h) / Math.floor(w) * DEVICE_WIDTH
      this.setState({
        height
      })
    })
  }

  async clickCreat () {
    const { navigation } = this.props
    const { dataPic } = navigation.state.params
    const { name, companyName, slogan } = this.state
    if (isEmojiCharacterInString(companyName) || isEmojiCharacterInString(name) || isEmojiCharacterInString(slogan)) {
      global.alert.show({
        content: '不能输入表情'
      })
      return
    }
    if (!name) {
      global.alert.show({
        content: '请输入海报名称'
      })
      return
    }
    if (!companyName) {
      global.alert.show({
        content: '请输入公司名称'
      })
      return
    }
    if (!slogan) {
      global.alert.show({
        content: '请输入宣传语'
      })
      return
    }
    const data = {
      storageUrl: dataPic.pictureUrl, // 图片url
      enterpriseName: trim(companyName, 'g'), // 企业名称
      activityTitle: trim(name, 'g'), // 海报标题
      activitySlogan: trim(slogan, 'g') // 宣传语
    }
    const res = await ajaxStore.company.visitorAddPoster(data)
    if (res.data && res.data.code === '0') {
      onEvent('销售工具-生成链接', 'home/GuestToolCreat', '/erp/visitor/addPoster')
      navigation.navigate('GuestToolCreatSuccess', { itemId: res.data.data })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  render () {
    const { navigation } = this.props
    const { dataPic } = navigation.state.params
    const { name, companyName, slogan, height } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'生成'} navigation={navigation} />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Image
            resizeMode={'cover'}
            defaultSource={require('../../images/default_banner.png')}
            style={[styles.toolImg, { height: height }]} source={{ uri: `${goodsImgUrl}${dataPic.pictureUrl}` }}></Image>
          <Text style={styles.nameText}>
            海报名称
            <Text style={styles.xText}>*</Text>
          </Text>
          <TextInput
            placeholder={'请输入海报名称'}
            autoCapitalize={'none'}
            style={styles.textInput}
            maxLength={100}
            onChangeText={(text) => {
              this.setState({
                name: text
              })
            }}
          />
          <Text style={styles.nameText}>
            公司名称
            <Text style={styles.xText}>*</Text>
          </Text>
          <TextInput
            placeholder={'请输入公司名称'}
            autoCapitalize={'none'}
            maxLength={100}
            style={styles.textInput}
            onChangeText={(text) => {
              this.setState({
                companyName: text
              })
            }}
          />
          <Text style={styles.nameText}>
            宣传语
            <Text style={styles.xText}>*</Text>
          </Text>
          <TextInput
            placeholder={'请输入宣传语'}
            maxLength={100}
            autoCapitalize={'none'}
            style={styles.textInput}
            onChangeText={(text) => {
              this.setState({
                slogan: text
              })
            }}
          />
          <Touchable
            isNativeFeedback={true}
            onPress={() => {
              this.clickCreat()
            }}>
            <View style={[styles.creatBGView, { opacity: (!name || !companyName || !slogan) ? 0.5 : 1 }]}>
              <Text style={styles.creatText}>生成链接</Text>
            </View>
          </Touchable>
        </ScrollView>
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
    marginTop: dp(62),
    marginBottom: dp(191)
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
    marginTop: dp(10)
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
    width: DEVICE_WIDTH,
    height: dp(582)
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

export default connect(mapStateToProps)(GuestToolCreat)
