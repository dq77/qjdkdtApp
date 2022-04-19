import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image, TextInput } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, showToast, injectUnmount, deepCopy } from '../../../utils/Utility'
import PhotoModal from '../../../component/PhotoModal'
import { connect } from 'react-redux'
import { getAuthFile } from '../../../actions'
import Iconfont from '../../../iconfont/Icon'
import { imgUrl } from '../../../utils/config'
import ajaxStore from '../../../utils/ajaxStore'
import IdcardFrontAndBack from './IdcardFrontAndBack'
import ComfirmModal from '../../../component/ComfirmModal'
/**
 * 上传照片
 */
@injectUnmount
class MultipleIdcardUpload extends PureComponent {
  static defaultProps = {
    creditItem: {},
    historyItem: [],
    loadHistory: false
  }

  static propTypes = {
    creditItem: PropTypes.object.isRequired,
    historyItem: PropTypes.array.isRequired,
    loadHistory: PropTypes.bool.isRequired
  }

  static getDerivedStateFromProps (nextProps) {
    if (nextProps.loadHistory) {
      return {
        loadHistory: nextProps.loadHistory,
        historyItem: nextProps.historyItem,
        creditItem: nextProps.creditItem,
        guaranteePerson: nextProps.guaranteePerson
      }
    } else {
      return {}
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,
      curentImage: '',
      currentCateCode: '',
      currentAuthFileMap: [],
      authFiles: [],
      side: '',
      historyItem: [],
      imageData: [],
      count: [],
      deleted: [],
      infoModal: false,
      currentIdcards: [],
      guaranteePerson: []
    }
    this.deletePhoto = this.deletePhoto.bind(this)
    this.showPhoto = this.showPhoto.bind(this)
    this.deletePerson = this.deletePerson.bind(this)
    this.addPerson = this.addPerson.bind(this)
    this.setPhone = this.setPhone.bind(this)
  }

  // componentDidUpdate (prevProps) {
  //   if (prevProps.loadHistory !== this.props.loadHistory) {
  //     this.initHistory()
  //   }
  // }

  async initHistory () {
    const currentAuthFileMap = deepCopy(this.state.currentAuthFileMap)
    const authFiles = this.state.authFiles
    const currentIdcards = this.state.historyItem
    const count = []
    const files = []
    currentAuthFileMap.map((authFileItem, i) => {
      this.state.historyItem.map((item, key) => {
        authFiles[authFileItem.cateCode].push(item.front)
        authFiles[authFileItem.cateCode].push(item.back)
        count[item.idcard] = {
          front: 0,
          back: 0
        }
      })
    })
    await this.setState({
      currentAuthFileMap,
      authFiles,
      count,
      currentIdcards
    })
    this.props.onIdcardItemChange(currentIdcards)
    if (!currentIdcards.length) {
      this.addPerson()
    }
    this.setImageData()
  }

  async setAuthFiles (authFile, idcard) {
    const currentIdcards = this.state.currentIdcards
    const authFiles = this.state.authFiles
    const index = authFile.type === 'front' ? 0 : 1
    const count = this.state.count
    count[idcard][authFile.type] = 0
    authFiles[authFile.code].push(authFile.file)
    currentIdcards.map((item, key) => {
      if (item.idcard === idcard) {
        currentIdcards[key][authFile.type] = authFile.file
      }
    })
    await this.setState({
      authFiles,
      count,
      currentIdcards
    })
    this.setImageData()
    this.props.onChange(this.state.authFiles)
  }

  async deletePhoto (i, type, cateCode, historyKey) {
    const historyItem = this.state.historyItem
    const authFiles = deepCopy(this.state.authFiles)
    let deleted = []
    let count = []
    let currentIdcards = []
    currentIdcards = this.state.currentIdcards
    count = this.state.count
    deleted = deleted.concat(this.state.deleted)
    let hasDeleted = false
    currentIdcards.map((item, key) => {
      if (key === historyKey) {
        count[item.idcard][type] = 0
        this.setState({
          count
        })
        historyItem.map((item2, index) => {
          if (!hasDeleted) {
            if (item2.front === item[type] && deleted.indexOf(item2.frontId) === -1) {
              deleted.push(item2.frontId)
              hasDeleted = true
            } else if (item2.back === item[type] && deleted.indexOf(item2.backId) === -1) {
              deleted.push(item2.backId)
              hasDeleted = true
            }
          }
        })
        authFiles[cateCode].map((file, index) => {
          if (file === currentIdcards[key][type]) {
            authFiles[cateCode].splice(index, 1)
          }
        })
        currentIdcards[key][type] = ''
      }
    })

    await this.setState({
      currentIdcards,
      authFiles,
      deleted
    })
    this.setImageData()
    this.props.onChange(this.state.authFiles)
    this.props.onDelete(deleted)
    this.props.onIdcardItemChange(currentIdcards)
  }

  showPhoto (modalVisible, fileKey, cateCode) {
    const imageData = this.state.imageData
    let curentImage = ''
    imageData[cateCode] && imageData[cateCode].map((item, key) => {
      if (item === imgUrl + fileKey) {
        curentImage = key
      }
    })
    this.setState({
      currentCateCode: cateCode,
      modalVisible,
      curentImage
    })
  }

  async setCurrentAuthFileMap () {
    const currentAuthFileMap = []
    const authFiles = []
    this.props.authFileMap.map((item, index) => {
      if (this.props.creditItem.cateCode.indexOf(item.cateCode) > -1) {
        currentAuthFileMap.push(item)
        authFiles[item.cateCode] = []
      }
    })
    await this.setState({
      currentAuthFileMap,
      authFiles
    })
    this.initHistory()
  }

  setImageData () {
    const imageData = []
    const authFiles = this.state.authFiles
    for (const key in authFiles) {
      imageData[key] = []
      authFiles[key].map((url, index) => {
        url && imageData[key].push(`${imgUrl}${url}`)
      })
    }
    this.setState({
      imageData
    })
  }

  setIdcardLoading (idcardLoading) {
    this.props.onLoading(idcardLoading)
  }

  onFail (data, idcard) {
    let count = []
    count = this.state.count
    count[idcard][data.type] = data.count
    this.setState({
      count
    })
    if (data.count < 2) {
      this.setState({
        infoModal: true
      })
    }
    this.props.onLoading(false)
  }

  addPerson () {
    const currentIdcards = deepCopy(this.state.currentIdcards)
    const count = deepCopy(this.state.count)
    const guaranteePerson = this.state.guaranteePerson
    const idcard = new Date().getTime()
    currentIdcards.push(
      {
        idcard,
        front: '',
        frontId: '',
        back: '',
        backId: '',
        phone: ''
      }
    )
    count[idcard] = {
      front: 0,
      back: 0
    }
    guaranteePerson.push({
      phone: '',
      fileKey: ''
    })
    this.setState({
      currentIdcards,
      count,
      guaranteePerson
    })
    this.props.onIdcardItemChange(currentIdcards)
  }

  async deletePerson (index) {
    const currentIdcards = deepCopy(this.state.currentIdcards)
    const count = deepCopy(this.state.count)
    const currentAuthFileMap = this.state.currentAuthFileMap
    const guaranteePerson = this.state.guaranteePerson
    if (currentIdcards[index].front) {
      await this.deletePhoto(2 * index, 'front', currentAuthFileMap[0].cateCode, index)
    }
    if (currentIdcards[index].back) {
      await this.deletePhoto(2 * index + 1, 'back', currentAuthFileMap[0].cateCode, index)
    }
    guaranteePerson.map((item, key) => {
      if (item.phone === currentIdcards[0].phone) {
        console.log(key)
        guaranteePerson.splice(key, 1)
      }
    })
    if (currentIdcards.length > 1) {
      currentIdcards.splice(index, 1)
    } else {
      const idcard = new Date().getTime()
      currentIdcards[0] = {
        idcard,
        front: '',
        frontId: '',
        back: '',
        backId: '',
        phone: ''
      }
      count[idcard] = {
        front: 0,
        back: 0
      }
    }

    this.setState({
      currentIdcards,
      count,
      guaranteePerson
    })
    this.props.onPersonChange(guaranteePerson)
    this.props.onIdcardItemChange(currentIdcards)
  }

  setPhone (data) {
    const { phone, index } = data
    const guaranteePerson = this.state.guaranteePerson
    const currentIdcards = this.state.currentIdcards
    guaranteePerson.map((item, key) => {
      if (item.fileKey === currentIdcards[index].front) {
        guaranteePerson.splice(key, 1)
      }
    })
    guaranteePerson[index] = {
      phone,
      fileKey: currentIdcards[index].front
    }
    currentIdcards[index].phone = phone
    this.setState({
      guaranteePerson,
      currentIdcards
    })
    this.props.onPersonChange(guaranteePerson)
    this.props.onIdcardItemChange(currentIdcards)
  }

  componentDidMount () {
    this.setCurrentAuthFileMap()
  }

  render () {
    return (
      <View>
        {this.state.loadHistory ? (
          <View style={styles.uploadWrap}>
            <View style={styles.uploadTitle}>
              <Text style={styles.uploadTitleText}>{'上传最高额担保人信息'}</Text>
            </View>
            {this.state.currentAuthFileMap.map((authFileItem, i) => {
              return (
                <View key={i}>
                  <View style={styles.uploadDetail}>
                    {this.state.currentAuthFileMap.length > 1 ? (
                      <View style={styles.uploadMapTitle}>
                        {authFileItem.isRequired ? (
                          <Text style={styles.required}>{'*'}</Text>
                        ) : (null)}
                        <Text style={styles.uploadMapTitleText}>{authFileItem.title}</Text>
                      </View>
                    ) : (null)}
                    {this.state.currentIdcards.map((history, key) => {
                      return (
                        <View style={styles.idcardListWarp} key={key}>
                          <View style={styles.uploadIdcard}>
                            {history.front ? (
                              <View style={styles.ImgWarp}>
                                <Touchable onPress={() => { this.showPhoto(true, history.front, authFileItem.cateCode) }}>
                                  <Image style={styles.uploadImg} source={{ uri: `${imgUrl}${history.front}` }} />
                                </Touchable>
                                <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(2 * key, 'front', authFileItem.cateCode, key)}>
                                  <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                                </Touchable>
                              </View>
                            ) : this.state.count[history.idcard] ? (
                              <IdcardFrontAndBack back={history.back} navigation={this.props.navigation} count={this.state.count[history.idcard].front} type={'front'} authFiles={this.state.authFiles} authFileItem={authFileItem} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} onSuccess={(authFile) => { this.setAuthFiles(authFile, history.idcard) }} onFail={(data) => { this.onFail(data, history.idcard) }} />
                            ) : (null)
                            }
                            {history.back ? (
                              <View style={styles.ImgWarp}>
                                <Touchable onPress={() => { this.showPhoto(true, history.back, authFileItem.cateCode) }}>
                                  <Image style={styles.uploadImg} source={{ uri: `${imgUrl}${history.back}` }} />
                                </Touchable>
                                <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(2 * key + 1, 'back', authFileItem.cateCode, key)}>
                                  <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                                </Touchable>
                              </View>
                            ) : this.state.count[history.idcard] ? (
                              <IdcardFrontAndBack front={history.front} navigation={this.props.navigation} count={this.state.count[history.idcard].back} type={'back'} authFiles={this.state.authFiles} authFileItem={authFileItem} onLoading={(idcardLoading) => this.setIdcardLoading(idcardLoading)} onSuccess={(authFile) => { this.setAuthFiles(authFile, history.idcard) }} onFail={(data) => { this.onFail(data, history.idcard) }} />
                            ) : (null)
                            }
                          </View>
                          {history.front ? (
                            <View style={styles.phoneWarp}>
                              <Text style={styles.label}>手机号码：</Text>
                              <TextInput
                                placeholder={'请输入担保人手机号码'}
                                placeholderTextColor={Color.TEXT_DARK}
                                autoCapitalize={'none'}
                                keyboardType={'phone-pad'}
                                style={styles.textInput}
                                defaultValue={history.phone}
                                maxLength={11}
                                onChangeText={text => {
                                  this.setPhone({
                                    phone: text,
                                    index: key
                                  })
                                }}
                              />
                            </View>
                          ) : (null)}
                          <View style={styles.operateWarp}>
                            {key === 0 && this.state.currentIdcards.length === 1 ? (
                              null
                            ) : (
                              <Touchable onPress = { () => { this.deletePerson(key) }}>
                                <Iconfont style={styles.operateBtn} name={'icon-del'} size={dp(50)} />
                              </Touchable>
                            )}
                            {key === this.state.currentIdcards.length - 1 ? (
                              <Touchable onPress={() => { this.addPerson() }}>
                                <Iconfont style={styles.operateBtn} name={'icon-add'} size={dp(50)} />
                              </Touchable>
                            ) : (null)}
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )
            })}
            {this.state.authFiles[this.state.currentCateCode] && this.state.authFiles[this.state.currentCateCode].length && this.state.modalVisible && this.state.curentImage !== '' ? (
              <PhotoModal imageData={this.state.imageData[this.state.currentCateCode]} modalVisible={this.state.modalVisible} curentImage={this.state.curentImage} cancel={() => this.showPhoto(false)} />
            ) : (null)
            }
            <ComfirmModal
              title={'识别失败'}
              content={'请上传符合照片要求、清晰的图片'}
              cancelText={'取消'}
              comfirmText={'再次上传'}
              cancel={() => {
                this.setState({
                  infoModal: false
                })
              }}
              confirm={() => {
                this.setState({
                  infoModal: false
                })
              }}
              infoModal={this.state.infoModal} />
          </View>
        ) : (null)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  uploadWrap: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.WHITE
  },
  uploadTitle: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.DEFAULT_BG,
    paddingHorizontal: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(15)
  },
  uploadTitleText: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(32)
  },
  uploadDetail: {
    backgroundColor: Color.WHITE,
    paddingTop: dp(30),
    paddingLeft: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  uploadBtnWarp: {
    padding: dp(23),
    borderWidth: dp(2),
    borderColor: Color.ICON_GRAY,
    marginBottom: dp(30)
  },
  ImgWarp: {
    marginRight: dp(30),
    marginBottom: dp(30),
    width: DEVICE_WIDTH * 0.43,
    height: dp(200)
  },
  uploadBtn: {
    color: Color.ICON_GRAY
  },
  uploadImg: {
    width: DEVICE_WIDTH * 0.43,
    height: dp(200)
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: dp(-25),
    top: dp(-25)
  },
  uploadMapTitle: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: dp(30)
  },
  required: {
    color: Color.RED
  },
  uploadMapTitleText: {
    color: Color.TEXT_LIGHT
  },
  uploadIdcard: {
    width: DEVICE_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  idcardUploadBtn: {
    marginTop: dp(-60)
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  },
  idcardListWarp: {
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    marginBottom: dp(50),
    paddingBottom: dp(30)
  },
  operateWarp: {
    width: DEVICE_WIDTH * 0.9,
    flexDirection: 'row'
  },
  operateBtn: {
    marginRight: dp(15)
  },
  phoneWarp: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: dp(10)
  },
  label: {
    marginTop: dp(10)
  },
  textInput: {
    width: DEVICE_WIDTH * 0.7,
    padding: 0
  }
})

const mapStateToProps = state => {
  return {
    authFileItems: state.credit.authFileItems,
    authFileMap: state.credit.authFileMap
  }
}

export default connect(mapStateToProps)(MultipleIdcardUpload)
