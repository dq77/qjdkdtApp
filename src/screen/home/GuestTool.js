import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { connect } from 'react-redux'
import ActionSheet from '../../component/actionsheet'
import ComfirmModal from '../../component/ComfirmModal'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onClickEvent, onEvent } from '../../utils/AnalyticsUtil'
import AuthUtil from '../../utils/AuthUtil'
import Color from '../../utils/Color'
import { customerServiceUrl } from '../../utils/config'
import { getFileName } from '../../utils/FileUtils'
import PermissionUtils from '../../utils/PermissionUtils'
import { DEVICE_WIDTH, getBottomSpace, getRealDP as dp } from '../../utils/screenUtil'
import StorageUtil from '../../utils/storageUtil'
import AddCrm from './component/AddCrm'
import GuestToolCom from './component/GuestToolCom'
import IntentionClient from './component/IntentionClient'
import MapDepot from './component/MapDepot'

class GuestTool extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      comfirmTitle: '',
      comfirmDec: '',
      infoModal: false,
      visitorMyImagesNum: 0,
      infoModalAddCrm: false,
      selectNum: 2, // 1.图库  2.销售工具   3.意向客户
      imgStatus: 1, // 1.编辑  2.完成
    }
    this.guestToolCom()
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.visitorMyImages()
    })
    // getCompanyInfo()
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  async guestToolCom() {
    await StorageUtil.save('GuestToolCom', '1').then(res => {
      if (!res) {
        console.log('save success')
      }
    })
  }

  async visitorMyImages() {
    const res = await ajaxStore.company.visitorMyImages()
    if (res.data && res.data.code === '0') {
      const visitorMyImagesList = res.data.data || []
      this.setState({
        imgStatus: visitorMyImagesList.length === 0 ? 1 : this.state.imgStatus,
        visitorMyImagesNum: visitorMyImagesList.length,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  // 权限申请
  async checkPermission(index) {
    // 权限申请
    const hasPermission = await PermissionUtils.checkPermission(PermissionUtils.PERMISSION.video)
    if (!hasPermission) {
      return
    }
    switch (index) {
      case 0:
        this.pickSingleWithCamera(false)
        break
      case 1:
        this.pickSingle(false)
        break
    }
  }

  pickSingleWithCamera = (cropping, mediaType = 'photo') => {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType,
    })
      .then(image => {
        // 图片上传
        this.visitorAddImages(image.path)
      })
      .catch(e => {
        console.log(e)
        if (e.toString().indexOf('Required permission missing') !== -1) {
          global.alert.show({
            content: '请开启所需权限',
          })
        }
      })
  }

  pickSingle = (cropit, circular = false, mediaType = 'photo') => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      compressImageQuality: 0.5,
      mediaType,
      includeExif: true,
    })
      .then(image => {
        // 图片上传
        this.visitorAddImages(image.path)
      })
      .catch(e => {
        console.log(e)
        if (e.toString().indexOf('Required permission missing') !== -1) {
          global.alert.show({
            content: '请开启所需权限',
          })
        }
      })
  }

  // 图片上传
  visitorAddImages = async path => {
    const userInfo = await AuthUtil.getUserInfo()
    this.setState({
      imgStatus: 1,
    })
    global.loading.show('图片分析中')
    const data = {
      fileName: {
        uri: path,
        type: 'multipart/form-data',
        name: getFileName(path),
      },
    }
    const res = await ajaxStore.company.offBatchUpload(data)
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const dataSave = {
        ofsCompanyId: userInfo.loginResult.ofsCompanyId,
        pictureUrl: res.data.data[0].key,
      }
      const resSave = await ajaxStore.company.visitorAddImages(dataSave)
      if (resSave.data && resSave.data.code === '0') {
        onEvent('获客工具-图库-新增图片', 'home/GuestTool', 'erp/visitor/addImages')
        this.visitorMyImages()
        this.mapDepot.visitorDefaultImages()
      } else {
        global.alert.show({
          content: resSave.data.message,
        })
      }
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  async visitorDeleteImage(value) {
    const data = {
      id: value,
    }
    const res = await ajaxStore.company.visitorDeleteImage(data)
    if (res.data && res.data.code === '0') {
      onEvent('获客工具-图库-删除', 'home/GuestTool', 'erp/visitor/deleteImage')
      this.visitorMyImages()
      this.mapDepot.visitorDefaultImages()
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  clickRightPress() {
    const { navigation } = this.props
    const { selectNum, imgStatus, visitorMyImagesNum } = this.state
    if (selectNum === 2) {
      navigation.navigate('GuestToolMapDepot')
    } else if (selectNum === 3) {
      global.navigation.navigate('WebView', {
        title: '在线客服',
        url: `${customerServiceUrl}${'客户'}`,
      })
    } else if (selectNum === 1 && visitorMyImagesNum !== 0) {
      imgStatus === 1 && onClickEvent('获客工具-图库-编辑', 'home/GuestTool')
      this.setState({
        imgStatus: imgStatus === 1 ? 2 : 1,
      })
    }
  }

  async visitorInvalidPotential(dataId) {
    const data = {
      id: dataId,
    }
    const res = await ajaxStore.company.visitorInvalidPotential(data)
    if (res.data && res.data.code === '0') {
      onEvent('意向客户-客户列表页-删除-确认', 'home/GuestTool', '/erp/visitor/invalidPotential')
      this.intentionClient.refreshData()
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  bottomSelectColumn() {
    return (
      <View style={styles.bottomSelectColumnBGView}>
        <Touchable
          onPress={() => {
            this.setState({
              selectNum: 1,
            })
            this.visitorMyImages()
          }}
        >
          <View style={styles.bottomItemBGView}>
            <Iconfont
              size={dp(34)}
              name={'huokegongju-tuku'}
              color={this.state.selectNum === 1 ? '#2A6EE7' : '#2D2926'}
            />
            <Text style={[styles.bottomItemText, { color: this.state.selectNum === 1 ? '#2A6EE7' : '#2D2926' }]}>
              图库
            </Text>
          </View>
        </Touchable>
        <Touchable
          onPress={() => {
            this.setState({
              imgStatus: 1,
              selectNum: 2,
            })
          }}
        >
          <View style={styles.bottomItemBGView}>
            <Iconfont
              style={styles.myRight}
              size={dp(34)}
              name={'huokegongju-huokegongju'}
              color={this.state.selectNum === 2 ? '#2A6EE7' : '#2D2926'}
            />
            <Text style={[styles.bottomItemText, { color: this.state.selectNum === 2 ? '#2A6EE7' : '#2D2926' }]}>
              销售工具
            </Text>
          </View>
        </Touchable>
        <Touchable
          onPress={() => {
            this.setState({
              imgStatus: 1,
              selectNum: 3,
            })
          }}
        >
          <View style={styles.bottomItemBGView}>
            <Iconfont
              style={styles.myRight}
              size={dp(34)}
              name={'huokegongju-yixiangkehu'}
              color={this.state.selectNum === 3 ? '#2A6EE7' : '#2D2926'}
            />
            <Text style={[styles.bottomItemText, { color: this.state.selectNum === 3 ? '#2A6EE7' : '#2D2926' }]}>
              意向客户
            </Text>
          </View>
        </Touchable>
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    const { selectNum, imgStatus, comfirmTitle, comfirmDec, visitorMyImagesNum } = this.state
    const titleText = selectNum === 1 ? '图库' : selectNum === 2 ? '销售工具' : '意向客户'
    const rightText = selectNum === 1 ? (imgStatus === 1 ? '编辑' : '完成') : selectNum === 2 ? '创建链接' : ''
    const rightIcon = selectNum === 3 ? 'navibar_kefu' : ''
    const rightTextColor = selectNum === 1 && visitorMyImagesNum === 0 ? '#999999' : '#1A97F6'
    return (
      <View style={styles.container}>
        <NavBar
          title={titleText}
          navigation={navigation}
          rightText={rightText}
          rightTextColor={rightTextColor}
          rightIcon={rightIcon}
          onRightPress={() => {
            this.clickRightPress()
          }}
        />
        {selectNum === 1 && (
          <MapDepot
            ref={ref => {
              this.mapDepot = ref
            }}
            imgStatus={imgStatus}
            navigation={navigation}
            clickX={valueId => {
              this.setState({
                comfirmTitle: '确认删除图片',
                comfirmDec: '图片删除后将无法恢复',
                infoModal: true,
                valueId,
              })
            }}
            clickAdd={() => {
              if (imgStatus === 2) {
                global.alert.show({
                  content: '编辑时不可新增图片',
                })
              } else {
                this.ActionSheet.show()
              }
            }}
          />
        )}
        {selectNum === 2 && <GuestToolCom navigation={navigation} />}
        {selectNum === 3 && (
          <IntentionClient
            ref={ref => {
              this.intentionClient = ref
            }}
            navigation={navigation}
            clickDelete={valueId => {
              this.setState({
                comfirmTitle: '确认删除客户信息',
                comfirmDec: '信息删除后将无法恢复',
                infoModal: true,
                valueId,
              })
            }}
            clickAddCrm={() => {
              this.setState({
                infoModalAddCrm: true,
              })
            }}
          />
        )}
        <ComfirmModal
          title={`${comfirmTitle}`}
          content={`${comfirmDec}`}
          cancelText={'取消'}
          comfirmText={'确认'}
          cancel={() => {
            this.setState({
              infoModal: false,
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false,
            })
            if (selectNum === 1) {
              this.visitorDeleteImage(this.state.valueId)
            } else if (selectNum === 3) {
              this.visitorInvalidPotential(this.state.valueId)
            }
          }}
          infoModal={this.state.infoModal}
        />
        <ActionSheet
          ref={o => {
            this.ActionSheet = o
          }}
          options={['拍照', '从相册中选择', '取消']}
          cancelButtonIndex={2} // 表示取消按钮是第index个
          destructiveButtonIndex={2} // 第几个按钮显示为红色
          onPress={index => {
            ;(index === 0 || index === 1) && this.checkPermission(index)
          }}
        />
        <AddCrm
          navigation={this.props.navigation}
          cancel={() => {
            this.setState({
              infoModalAddCrm: false,
            })
          }}
          comfirm={selectItemData => {
            this.setState({
              infoModalAddCrm: false,
            })
          }}
          infoModal={this.state.infoModalAddCrm}
        />
        {this.bottomSelectColumn()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bottomItemText: {
    fontSize: dp(20),
    color: '#2D2926',
    marginTop: dp(20),
  },
  bottomItemBGView: {
    marginBottom: dp(73),
    alignItems: 'center',
    width: DEVICE_WIDTH / 3,
  },
  bottomSelectColumnBGView: {
    paddingBottom: getBottomSpace(),
    paddingTop: dp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
    justifyContent: 'space-between',
  },
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
  }
}

export default connect(mapStateToProps)(GuestTool)
