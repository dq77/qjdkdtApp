import React, { PureComponent } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, formValid, assign, injectUnmount } from '../../utils/Utility'
import Touchable from '../../component/Touchable'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import { vChineseName, vIdcardNumber } from '../../utils/reg'
import Iconfont from '../../iconfont/Icon'
import AlertModal from '../../component/AlertModal'
import { setNJTime, setFaceExtraData } from '../../actions/index'
import PermissionUtils from '../../utils/PermissionUtils'

@injectUnmount
class FaceIdentity extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      form: {
        validateData: '',
        idcardName: '',
        idcardNumber: '',
        sessionId: ''
      },
      rule: [
        {
          id: 'idcardName',
          required: true,
          reg: vChineseName,
          name: '姓名'
        },
        {
          id: 'idcardNumber',
          required: true,
          reg: vIdcardNumber,
          name: '身份证'
        }
      ],
      lipNumber: [],
      idcardNameReadOnly: true,
      idcardNumberReadOnly: true,
      infoModal: false,
      responseData: '',
      isNJBank: false
    }
    this.getLipNumber = this.getLipNumber.bind(this)
    this.faceIdentityVideo = this.faceIdentityVideo.bind(this)
    this.goNext = this.goNext.bind(this)
  }

  async getLipNumber () {
    Keyboard.dismiss()
    const valid = formValid(this.state.rule, this.state.form)
    if (valid.result) {
      const { sessionId, userInfo, companyInfo } = this.props
      const data = assign(this.state.form, {
        sessionId: sessionId,
        loadingText: '获取唇语中'
      })
      // console.log(userInfo);
      await this.setState({ form: data })
      if (!sessionId) {
        global.showError = false
        const res = await ajaxStore.common.getLipNumber(this.state.form)
        global.showError = true
        this.getLipNumber()
        return false
      }
      const res = await ajaxStore.common.getLipNumber(this.state.form)
      if (res.data && res.data.code === '0') {
        let form = assign(this.state.form, {
          validateData: res.data.data,
          memberId: userInfo.memberId // 南京银行下单需要插入活体检测表
        })
        // 法人实名认证需要多传memeberId和companyId进行企业真实性校验（此处后期最好剥离单独接口处理）
        if (this.props.faceExtraData.contractType === '0') {
          form = assign(form, {
            companyId: companyInfo.companyId
          })
        }
        this.setState({ form: form })
        this.setState({ lipNumber: res.data.data.split('') })
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  async faceIdentityVideo () {
    const { navigation, userInfo } = this.props
    const valid = formValid(this.state.rule, this.state.form)
    if (valid.result) {
      // 权限申请
      const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
      if (!hasPermission) { return }

      navigation.navigate('VideoRecord', {
        callback: async data => {
          const form = assign(this.state.form, {
            video: {
              uri: data.uri,
              type: 'multipart/form-data',
              name: new Date().getTime().toString()
            }
          })
          console.log(form, 'formformform')
          await this.setState({ form: form })
          global.loading.show('视频分析中')
          const res = await ajaxStore.common.faceIdentity(this.state.form)
          global.loading.hide()
          if (res.data && res.data.code === '0') {
            // 如果来自南京银行需记录时间
            if (this.state.isNJBank) {
              setNJTime(new Date().getTime())
              setFaceExtraData({
                videoPhoto: res.data.data.videoPhoto,
                idcardName: res.data.data.idcardName,
                idcardNumber: res.data.data.idcardNumber
              })
            }
            this.setState({
              responseData: res.data.data,
              infoModal: true
            })
          } else {
            // this.getLipNumber()
            global.alert.show({
              content: res.data.message
            })
          }
        }
      })
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  goNext () {
    const data = this.state.responseData
    const faceData = {
      sim: data.sim,
      faceImgPath: data.videoPhoto,
      idcardName: data.idcardName,
      idcardNumber: data.idcardNumber,
      time: new Date().getTime()
    }
    if (this.state.isNJBank) {
      // this.props.navigation.goBack()
      this.props.navigation.state.params.callback(this.props.navigation)
      return
    }
    if (this.props.faceExtraData.contractType === '-1') {
      this.props.navigation.navigate('CSSigning', {
        faceData,
        retry: () => {
          this.getLipNumber()
        }
      })
    } else if (this.props.faceExtraData.defaultContractType) {
      this.props.navigation.navigate('OtherSigning', {
        faceData,
        retry: () => {
          this.getLipNumber()
        }
      })
    } else {
      this.props.navigation.navigate('Signing', {
        faceData,
        retry: () => {
          this.getLipNumber()
        }
      })
    }
  }

  componentDidMount () {
    const { idcardName, idcardNameReadOnly, idcardNumber, idcardNumberReadOnly, isNJBank } = this.props.navigation.state.params
    const data = assign(this.state.form, {
      idcardName,
      idcardNumber
    })
    // 方便测试人脸识别
    // const data = assign(this.state.form, {
    //   idcardName: '姚博钦',
    //   idcardNumber: '330104199006303511'
    // })
    // title: '成功',
    //   content: '人脸核身成功',
    //     btnText: '下一步',
    this.setState({ form: data, idcardNameReadOnly: idcardNameReadOnly || true, idcardNumber, idcardNumberReadOnly: idcardNumberReadOnly || true, isNJBank: isNJBank || false })
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'身份认证'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.titleWrapper}>
              <Text style={styles.titleNum}>{'1'}</Text>
              <Text style={styles.titleText}>{'请输入身份证信息'}</Text>
            </View>
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder={'姓名'}
                editable={!this.state.idcardNameReadOnly}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.textInput}
                value={this.state.form.idcardName}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    idcardName: text
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder={'身份证'}
                editable={!this.state.idcardNumberReadOnly}
                placeholderTextColor={Color.TEXT_DARK}
                autoCapitalize={'none'}
                style={styles.textInput}
                value={this.state.form.idcardNumber}
                onChangeText={text => {
                  const data = assign(this.state.form, {
                    idcardNumber: text
                  })
                  this.setState({ form: data })
                }}
              />
            </View>
            {this.state.form.validateData ? (
              <View style={styles.stepWrapper}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.titleNum}>{'2'}</Text>
                  <Text style={styles.titleText}>
                    {'请在视频中读出下方数字，验证身份'}
                  </Text>
                </View>
                <View style={styles.lipNumberWrapper}>
                  {this.state.lipNumber.map((item, key) => (
                    <View style={styles.lipNumberBgWrapper} key={key}>
                      <Text style={styles.lipNumber} key={key}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
                <Touchable
                  style={[styles.startVideo]}
                  onPress={this.faceIdentityVideo}>
                  <Iconfont name={'take-video1'} size={dp(300)} />
                </Touchable>
                <Text style={styles.tips}>温馨提示：拍摄时保持面部清晰可见，总时长约4秒</Text>
              </View>
            ) : (
              <View style={styles.stepWrapper}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.titleNum}>{'2'}</Text>
                  <Touchable
                    style={[styles.startIdentityBtn]}
                    onPress={this.getLipNumber}>
                    <Text style={styles.startIdentityText}>
                      {'开启面部识别'}
                    </Text>
                  </Touchable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <AlertModal
          title={'成功'}
          content={'人脸核身成功'}
          comfirmText={'下一步'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={async () => {
            await this.setState({
              infoModal: false
            })
            setTimeout(() => {
              this.goNext()
            }, 500)
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.WHITE
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: dp(100)
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Color.ICON_GRAY,
    borderWidth: dp(1),
    borderRadius: dp(15),
    marginBottom: dp(30)
  },
  textInput: {
    width: DEVICE_WIDTH * 0.7,
    height: dp(80),
    margin: dp(20),
    paddingLeft: dp(5),
    paddingRight: dp(50),
    color: Color.TEXT_MAIN,
    fontSize: dp(28)
  },
  startIdentityBtn: {
    width: DEVICE_WIDTH * 0.75,
    padding: dp(30),
    backgroundColor: Color.themeColor,
    borderWidth: dp(2),
    borderRadius: dp(15)
  },
  startIdentityText: {
    color: Color.themeColor,
    textAlign: 'center',
    fontSize: dp(32),
    borderColor: Color.themeColor
  },
  lipNumberWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: dp(30)
  },
  lipNumberBgWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8f9',
    width: dp(100),
    height: dp(100),
    marginHorizontal: dp(10)
  },
  lipNumber: {
    fontSize: dp(60),
    color: Color.THEME,
    textAlign: 'center'
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: DEVICE_WIDTH,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginBottom: dp(30)
  },
  titleNum: {
    backgroundColor: '#00b2a9',
    borderRadius: dp(50),
    fontSize: dp(28),
    width: dp(50),
    height: dp(50),
    lineHeight: dp(50),
    color: Color.WHITE,
    textAlign: 'center',
    marginRight: dp(10)
  },
  titleText: {
    fontSize: dp(28)
  },
  stepWrapper: {
    flex: 1
  },
  startVideo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: dp(70)
  },
  logo: {
    width: DEVICE_WIDTH * 0.6
  },
  tips: {
    textAlign: 'center',
    color: '#999',
    marginTop: dp(50)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    sessionId: state.user.sessionId,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(FaceIdentity)
