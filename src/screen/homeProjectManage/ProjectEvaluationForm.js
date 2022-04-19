import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, TouchableWithoutFeedback, TextInput, Image
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import Picker from 'react-native-picker'
import RegionPickerByAjax from '../../component/RegionPickerByAjax'
import AuthUtil from '../../utils/AuthUtil'
import { formValid, showToast, injectUnmount } from '../../utils/Utility'
import { baseUrl } from '../../utils/config'
import { undertakeMode } from '../../utils/enums'
import { connect } from 'react-redux'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { SolidBtn } from '../../component/CommonButton'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from '../../component/actionsheet'
import { getFileName } from '../../utils/FileUtils'
import PhotoModal from '../../component/PhotoModal'
import BottomFullModal from '../../component/BottomFullModal'
import ProjectEvaluationSuccess from './ProjectEvaluationSuccess'
import { open } from '../../utils/FileReaderUtils'
import { onEvent, onClickEvent } from '../../utils/AnalyticsUtil'

@injectUnmount
class ProjectEvaluationForm extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      provinceCode: '',
      provinceName: '',
      cityCode: '',
      cityName: '',
      areaCode: '',
      areaName: '',
      address: '',
      showAddress: '',
      partyA: '',
      undertakeMode: '',
      tenderAttachmentList: [],
      bidsAttachmentList: [],
      contractAttachmentList: [],
      showShadow: false,
      currentIndex: 0,
      companyList: [],
      companyName: '',
      undertakeModeList: [],
      undertakeModeIndex: '',
      undertakeModeName: '请选择项目承接方式',
      currentType: ''
    }

    this.rule = [
      {
        id: 'name',
        required: true,
        name: '项目名称'
      },
      {
        id: 'provinceCode',
        required: true,
        name: '项目所在地'
      },
      {
        id: 'address',
        required: true,
        name: '项目详细地址'
      },
      {
        id: 'partyA',
        required: true,
        name: '甲方公司（项目方）'
      },
      {
        id: 'tenderAttachmentList',
        required: true,
        requiredErrorMsg: '请上传招标文件',
        name: '招标文件'
      },
      {
        id: 'undertakeMode',
        required: true,
        requiredErrorMsg: '请选择项目承接方式',
        name: '项目承接方式'
      },
      {
        id: 'contractAttachmentList',
        required: true,
        requiredErrorMsg: '请上传合同文件',
        name: '合同文件'
      }
    ]
  }

  componentDidMount () {
    this.initUndertakeMode()
    const params = this.props.navigation.state.params
    if (params && params.detail) {
      this.initValue(params.detail)
    }
  }

  initValue (detail) {
    const { id, name, provinceCode, provinceName, cityCode, cityName, areaCode, areaName, address, partyA, tenderAttachmentList, bidsAttachmentList, contractAttachmentList } = detail
    const undertakeModeCode = detail.undertakeMode
    this.setState({
      id,
      name,
      provinceCode,
      provinceName,
      cityCode,
      cityName,
      areaCode,
      areaName,
      address,
      showAddress: [provinceName, cityName, areaName],
      partyA,
      undertakeMode: undertakeModeCode,
      undertakeModeName: undertakeMode[undertakeModeCode],
      tenderAttachmentList,
      bidsAttachmentList,
      contractAttachmentList
    })
  }

  initUndertakeMode () {
    const undertakeModeList = []
    Object.entries(undertakeMode).map((item, key) => {
      undertakeModeList.push({
        name: item[1],
        code: item[0]
      })
    })
    this.setState({
      undertakeModeList
    })
  }

  async uploadFile (path, type) {
    const data = {
      fileName: {
        uri: path,
        type: 'multipart/form-data',
        name: getFileName(path)
      }
    }
    global.loading.show('上传中')
    const res = await ajaxStore.common.uploadFile(data)

    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const file = res.data.data[0]
      let fileList
      switch (type) {
        case 'tenderAttachment':
          fileList = this.state.tenderAttachmentList
          break
        case 'bidsAttachment':
          fileList = this.state.bidsAttachmentList
          break
        case 'contractAttachment':
          fileList = this.state.contractAttachmentList
          break
      }
      fileList.push({
        name: file.fileName,
        fileKey: file.key
      })
      fileList = JSON.parse(JSON.stringify(fileList))
      switch (type) {
        case 'tenderAttachment':
          this.setState({
            tenderAttachmentList: fileList
          })
          break
        case 'bidsAttachment':
          this.setState({
            bidsAttachmentList: fileList
          })
          break
        case 'contractAttachment':
          this.setState({
            contractAttachmentList: fileList
          })
          break
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  commit = async () => {
    const {
      id, name, provinceCode, provinceName, cityCode, cityName, areaCode, areaName, address, partyA,
      bidsAttachmentList, contractAttachmentList, tenderAttachmentList, undertakeMode
    } = this.state

    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      const data = {
        id,
        name,
        provinceCode,
        cityCode,
        areaCode,
        address,
        partyA,
        provinceName,
        cityName,
        areaName,
        bidsAttachmentList,
        contractAttachmentList,
        tenderAttachmentList,
        undertakeMode,
        cifCompanyId: this.props.companyInfo.companyId
      }
      let res
      global.loading.show()
      if (id) {
        res = await ajaxStore.project.editProjectEvalutaion(data)
      } else {
        res = await ajaxStore.project.submitProjectEvalutaion(data)
      }
      global.loading.hide()
      if (res.data && res.data.code === '0') {
        if (id) {
          onEvent('项目评估-发起评估页-提交', 'ProjectEvaluationForm', '/erp/evaluation/project/edit')
        } else {
          onEvent('项目评估-发起评估页-提交', 'ProjectEvaluationForm', '/erp/evaluation/project/save')
        }
        this.props.navigation.replace('ProjectEvaluationSuccess')
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  disabled () {
    return false
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  pickSingleWithCamera (cropping, mediaType = 'photo', type) {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType
    }).then(async image => {
      console.log('received image', image)
      this.uploadFile(image.path, type)
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  pickSingle (cropit, circular = false, mediaType = 'photo', type) {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      compressImageQuality: 0.5,
      multiple: true,
      maxFiles: 9,
      mediaType,
      includeExif: true
    }).then(async image => {
      console.log('received image', image)
      image.map((item, key) => {
        this.uploadFile(item.path, type)
      })
    }).catch(e => {
      console.log(e)
      if (e.toString().indexOf('Required permission missing') !== -1) {
        global.alert.show({
          content: '请开启所需权限'
        })
      }
    })
  }

  deletePhoto (index, type) {
    let fileList
    switch (type) {
      case 'tenderAttachment':
        fileList = this.state.tenderAttachmentList
        break
      case 'bidsAttachment':
        fileList = this.state.bidsAttachmentList
        break
      case 'contractAttachment':
        fileList = this.state.contractAttachmentList
        break
    }
    fileList.splice(index, 1)
    fileList = JSON.parse(JSON.stringify(fileList))
    switch (type) {
      case 'tenderAttachment':
        this.setState({
          tenderAttachmentList: fileList
        })
        break
      case 'bidsAttachment':
        this.setState({
          bidsAttachmentList: fileList
        })
        break
      case 'contractAttachment':
        this.setState({
          contractAttachmentList: fileList
        })
        break
    }
  }

  async showPhoto (isShow, index, type) {
    this.setState({
      modalVisible: !!isShow,
      currentIndex: index || 0,
      currentType: type || this.state.currentType
    })
    // const fileKey = this.state.bidsAttachmentList[index].fileKey
    // global.loading.show()
    // await open(`${baseUrl}/ofs/front/file/preview?fileKey=${fileKey}`)
    // global.loading.hide()
  }

  searchCompany = (name) => {
    console.log(name)
    name = name.trim()
    if (name.length < 2) return

    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      const res = await ajaxStore.company.qccQuery({
        company_name: name
      })
      if (res && res.data && res.data.code === '0') {
        this.setState({
          companyList: res.data.data || []
        })
      }
    }, 500)
  }

  showUndertakeModePicker = () => {
    Picker.init({
      pickerData: Object.values(undertakeMode),
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择项目承接方式',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 16,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.undertakeModeName],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        const { undertakeModeIndex, undertakeModeList } = this.state
        if (pickedIndex !== undertakeModeIndex) {
          this.setState({
            undertakeModeIndex: pickedIndex,
            undertakeModeName: undertakeModeList[pickedIndex].name,
            undertakeMode: undertakeModeList[pickedIndex].code
          })
        }
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {

      }
    })
    this.showShadow()
    Picker.show()
  }

  async checkFile (fileKey) {
    console.log(fileKey)
    global.loading.show()
    await open(`${baseUrl}/ofs/front/file/preview?fileKey=${fileKey}`)
    global.loading.hide()
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'选择企业'}
        confirm={'确定'}
        isAutoClose={false}
        submit={() => {
          if (!this.state.companyName) {
            global.alert.show({
              content: '请选择企业'
            })
            return
          }
          this.setState({
            partyA: this.state.companyName
          })
          this.modal.cancel()
        }} >
        <View style={{
          margin: dp(30)
        }}>
          <TextInput
            placeholder={'请输入企业名称'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            // value={''}
            onChangeText={text => {
              this.searchCompany(text)
            }}
          />
          <Text style={{ fontSize: dp(26), color: '#b0b0b0', margin: dp(20) }}>最少输入两个字</Text>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ marginBottom: dp(360) }}>
            <View>
              {this.state.companyList && this.state.companyList.map((data, index) => {
                return (
                  <Touchable key={index} isPreventDouble={false} onPress={() => {
                    this.setState({
                      companyName: data
                    })
                  }}>
                    <View>
                      <View style={styles.companyItem}>
                        <Text style={{ fontSize: dp(28), flex: 1 }}>{data}</Text>
                        {this.state.companyName === data &&
                        <Iconfont name={'liuchengyindao-yiwancheng'} size={dp(32)} />
                        }
                      </View>
                      <View style={styles.dashline} />
                    </View>

                  </Touchable>
                )
              })}
            </View>
          </ScrollView>

        </View>
      </BottomFullModal>
    )
  }

  render () {
    const { navigation } = this.props
    const {
      name, showAddress, address, partyA,
      undertakeModeName
    } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'发起评估'} navigation={navigation} />
        <ScrollView >

          <View style={styles.content}>
            <View style={styles.blockMain}>
              {/* 项目名称 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目名称</Text>
              </View>
              <TextInput
                placeholder={'请输入项目名称'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                defaultValue={name}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ name: text })
                }}
              />
              {/* 项目所在地区 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目地址</Text>
              </View>
              <View style={[styles.input, styles.picker]}>
                <RegionPickerByAjax
                  ref={o => { this.RegionPickerByAjax = o }}
                  fontSize={28}
                  monitorChange={true}
                  selectedValue={showAddress}
                  onPickerConfirm={(data) => {
                    const names = data.label.split(' ')
                    this.setState({
                      provinceCode: data.provinceCode,
                      provinceName: names[0],
                      cityCode: data.cityCode,
                      cityName: names[1],
                      areaCode: data.areaCode,
                      areaName: names[2],
                      showAddress: data.label.split(' ')
                    })
                  }}
                  onOpen={() => { this.showShadow() }}
                  onClose={() => { this.hideShadow() }}
                />
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </View>
              {/* 项目详细地址 */}
              <TextInput
                placeholder={'请填写详细地址'}
                placeholderTextColor={'#D8DDE2'}
                style={[styles.input, styles.itemMargin]}
                defaultValue={address}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ address: text })
                }}
              />
              {/* 甲方公司（项目方） */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>甲方公司（项目方）</Text>
              </View>
              <View>
                <TextInput
                  placeholder={'请输入项目名称'}
                  placeholderTextColor={'#D8DDE2'}
                  style={styles.input}
                  defaultValue={partyA}
                  maxLength={200}
                  onChangeText={text => {
                    this.setState({ partyA: text })
                  }}
                />
                <Touchable onPress={() => {
                  this.setState({
                    companyList: [],
                    compantName: ''
                  })
                  this.modal.show()
                }} style={styles.touchItem}></Touchable>
              </View>
              {/* 招标文件 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>招标文件</Text>
              </View>
              {this.state.tenderAttachmentList.map((fileItem, index) => {
                return (<View style={styles.imageWapper} key={index}>
                  <View>
                    { /(.jpg|.png|.jpeg|.gif|.bmp)/.test(fileItem.name) ? (
                      <Touchable onPress={() => { this.showPhoto(true, index, 'tenderAttachment') }}>
                        <Image
                          style={styles.fileImage}
                          source={{ uri: `${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${fileItem.fileKey}` }}
                          resizeMode={'cover'}
                        />
                      </Touchable>
                    ) : (
                      <Touchable style={styles.fileItem} onPress={() => this.checkFile(fileItem.fileKey)}>
                        <Iconfont name={'shangchuanwenjian'} size={dp(50)} />
                        <Text style={{ fontSize: dp(26), color: '#8997AE', flex: 1, marginLeft: dp(20) }}>{fileItem.name}</Text>
                      </Touchable>
                    )}
                    <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(index, 'tenderAttachment')}>
                      <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                    </Touchable>
                  </View>
                </View>)
              })
              }
              <Touchable onPress={() => {
                this.setState({
                  currentType: 'tenderAttachment'
                })
                this.ActionSheet.show()
              }}>
                <View style={styles.uploadBtn}>
                  <Text style={styles.uploadIcon}>+</Text>
                </View>
              </Touchable>
              <Text style={styles.tips}>仅支持：jpg、jpeg、gif、bmp、png格式，其他格式请前往仟金顶官网上传</Text>
            </View>
            <View style={[styles.blockMain, { marginTop: dp(60) }]}>
              {/* 项目承接方式 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目承接方式</Text>
              </View>
              <View>
                <Touchable style={styles.select} onPress={() => { this.showUndertakeModePicker() }} >
                  <Text placeholder={'请选择项目承接方式'} placeholderTextColor={'#D8DDE2'} style={[styles.selectText, undertakeModeName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}>{undertakeModeName}</Text>
                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                </Touchable>
              </View>
              {/* 投标文件 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>投标文件</Text>
              </View>
              {this.state.bidsAttachmentList.map((fileItem, index) => {
                return (<View style={styles.imageWapper} key={index}>
                  <View>
                    { /(.jpg|.png|.jpeg|.gif|.bmp)/.test(fileItem.name) ? (
                      <Touchable onPress={() => { this.showPhoto(true, index, 'bidsAttachment') }}>
                        <Image
                          style={styles.fileImage}
                          source={{ uri: `${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${fileItem.fileKey}` }}
                          resizeMode={'cover'}
                        />
                      </Touchable>
                    ) : (
                      <Touchable style={styles.fileItem} onPress={() => this.checkFile(fileItem.fileKey)}>
                        <Iconfont name={'shangchuanwenjian'} size={dp(50)} />
                        <Text style={{ fontSize: dp(26), color: '#8997AE', flex: 1, marginLeft: dp(20) }}>{fileItem.fileKey.split('/')[1]}</Text>
                      </Touchable>
                    )}
                    <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(index, 'bidsAttachment')}>
                      <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                    </Touchable>
                  </View>
                </View>)
              })
              }
              <Touchable onPress={() => {
                this.setState({
                  currentType: 'bidsAttachment'
                })
                this.ActionSheet.show()
              }}>
                <View style={styles.uploadBtn}>
                  <Text style={styles.uploadIcon}>+</Text>
                </View>
              </Touchable>
              <Text style={styles.tips}>仅支持：jpg、jpeg、gif、bmp、png格式，其他格式请前往仟金顶官网上传</Text>
              {/* 合同文件 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>合同文件</Text>
              </View>
              {this.state.contractAttachmentList.map((fileItem, index) => {
                return (<View style={styles.imageWapper} key={index}>
                  <View>
                    { /(.jpg|.png|.jpeg|.gif|.bmp)/.test(fileItem.name) ? (
                      <Touchable onPress={() => { this.showPhoto(true, index, 'contractAttachment') }}>
                        <Image
                          style={styles.fileImage}
                          source={{ uri: `${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${fileItem.fileKey}` }}
                          resizeMode={'cover'}
                        />
                      </Touchable>
                    ) : (
                      <Touchable style={styles.fileItem} onPress={() => this.checkFile(fileItem.fileKey)}>
                        <Iconfont name={'shangchuanwenjian'} size={dp(50)} />
                        <Text style={{ fontSize: dp(26), color: '#8997AE', flex: 1, marginLeft: dp(20) }}>{fileItem.fileKey.split('/')[1]}</Text>
                      </Touchable>
                    )}
                    <Touchable style={styles.imgDetleteBtn} onPress={() => this.deletePhoto(index, 'contractAttachment')}>
                      <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                    </Touchable>
                  </View>
                </View>)
              })
              }
              <Touchable onPress={() => {
                this.setState({
                  currentType: 'contractAttachment'
                })
                this.ActionSheet.show()
              }}>
                <View style={styles.uploadBtn}>
                  <Text style={styles.uploadIcon}>+</Text>
                </View>
              </Touchable>
              <Text style={styles.tips}>仅支持：jpg、jpeg、gif、bmp、png格式，其他格式请前往仟金顶官网上传</Text>
            </View>

            <View style={styles.footerBtn}>
              <SolidBtn onPress={this.commit} style={styles.save} text={'提交项目审核'} />
              <Text style={styles.cancelText} onPress={() => {
                onClickEvent('项目评估-发起评估页-取消填写', 'ProjectEvaluationForm')
                this.props.navigation.goBack()
              }}>取消填写</Text>
            </View>

          </View>
        </ScrollView>
        { this.renderModal() }
        {this.state.showShadow
          ? <TouchableWithoutFeedback
            onPress={() => {
              this.RegionPickerByAjax.hide()
              this.hideShadow()
            }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
          : null}
        <ActionSheet
          ref={o => { this.ActionSheet = o }}
          options={['拍照', '从相册中选择', '取消']}
          cancelButtonIndex={2} // 表示取消按钮是第index个
          destructiveButtonIndex={2} // 第几个按钮显示为红色
          onPress={(index) => {
            switch (index) {
              case 0:
                this.pickSingleWithCamera(false, 'photo', this.state.currentType)
                break
              case 1:
                this.pickSingle(false, false, 'photo', this.state.currentType)
                break
            }
          }}
        />
        {this.state.currentType === 'bidsAttachment' && this.state.bidsAttachmentList.length && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={[this.state.bidsAttachmentList[this.state.currentIndex].fileKey]}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}
        {this.state.currentType === 'tenderAttachment' && this.state.tenderAttachmentList.length && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={[this.state.tenderAttachmentList[this.state.currentIndex].fileKey]}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}
        {this.state.currentType === 'contractAttachment' && this.state.contractAttachmentList.length && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={[this.state.contractAttachmentList[this.state.currentIndex].fileKey]}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : (null)}

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(ProjectEvaluationForm)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  content: {
    alignItems: 'stretch'

  },
  hint: {
    color: '#91969A',
    fontSize: dp(28),
    marginVertical: dp(30),
    textAlign: 'center'
  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingBottom: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16)
  },
  blockTitle: {
    fontSize: dp(32),
    fontWeight: 'bold'
  },
  name: {

  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    padding: dp(30)
  },
  selectText: {
    color: '#2D2926',
    fontSize: dp(28)
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    paddingVertical: dp(15),
    fontSize: dp(28),
    height: dp(88)
  },
  itemMargin: {
    marginTop: dp(20)
  },
  placeholder: {
    color: '#D8DDE2'
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }]
  },
  save: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    marginTop: dp(96)
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(24),
    marginTop: dp(48)
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  imageWapper: {
    position: 'relative'
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: -dp(25),
    top: -dp(25)
  },
  fileImage: {
    flex: 1,
    width: dp(630),
    height: dp(300),
    marginBottom: dp(30),
    borderRadius: dp(16)
  },
  uploadBtn: {
    backgroundColor: '#DDDDE8',
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(68)
  },
  uploadIcon: {
    color: '#fff',
    fontSize: dp(120)
  },
  cancelText: {
    fontSize: dp(30),
    color: '#464678',
    paddingVertical: dp(30),
    marginVertical: dp(60)
  },
  productDetail: {
    backgroundColor: '#F8F8FA',
    paddingVertical: dp(30),
    paddingHorizontal: dp(28),
    marginTop: dp(30)
  },
  productDetailTitle: {
    marginBottom: dp(15)
  },
  productDetailItem: {
    lineHeight: dp(50),
    color: '#999'
  },
  fileItem: {
    flex: 1,
    width: dp(630),
    height: dp(110),
    marginBottom: dp(30),
    borderRadius: dp(16),
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: dp(30)
  },
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  companyItem: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dashline: {
    backgroundColor: '#e5e5e5',
    height: dp(1)
  },
  tips: {
    color: '#A7ADB0',
    fontSize: dp(24),
    marginTop: dp(10)
  }
})
