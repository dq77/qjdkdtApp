import React, { PureComponent } from 'react'
import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import ImagePicker from 'react-native-image-crop-picker'
import Picker from 'react-native-picker'
import { connect } from 'react-redux'
import { getCompanyInfo } from '../../actions'
import ActionSheet from '../../component/actionsheet'
import BottomFullModal from '../../component/BottomFullModal'
import { SolidBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import PhotoModal from '../../component/PhotoModal'
import RegionPickerByAjax from '../../component/RegionPickerByAjax'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onClickEvent, onEvent } from '../../utils/AnalyticsUtil'
import { baseUrl } from '../../utils/config'
import { open } from '../../utils/FileReaderUtils'
import { getFileName } from '../../utils/FileUtils'
import { vNumber, vPrice } from '../../utils/reg'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { convertCurrency, formValid, injectUnmount, numberAndPoint } from '../../utils/Utility'

@injectUnmount
class OtherProjectManageCreate extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      itemName: '',
      itemCode: '',
      itemType: {
        title: '请选择项目类型',
        id: '',
      },
      party: '请输入',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      provinceName: '',
      cityName: '',
      areaName: '',
      address: '',
      showAddress: '',
      cycle: '',
      contractAmount: '',
      amtContract: '',
      categoryCode: '',
      categoryIndex: 0,
      categoryName: '请选择',
      categorySmallCode: '',
      categorySmallIndex: 0,
      categorySmallName: '请选择',
      categoryList: [],
      fileKey: '',
      showShadow: false,
      amtBudget: '',
      itemLeader: '',
      itemFilesIndex: 0,
      itemFiles: [],
      itemFlieType: {
        title: '请选择',
        id: '',
      },
    }

    this.itemType = [
      {
        title: '居住建筑',
        id: '001',
      },
      {
        title: '市政建筑',
        id: '002',
      },
      {
        title: '企事业建筑',
        id: '003',
      },
      {
        title: '商业娱乐建筑',
        id: '004',
      },
      {
        title: '生产性建筑',
        id: '005',
      },
    ]

    this.itemFlieType = [
      {
        title: '合同',
        id: '001',
      },
      {
        title: '标书',
        id: '002',
      },
      {
        title: '其他',
        id: '003',
      },
    ]

    this.rule = [
      {
        id: 'itemName',
        required: true,
        name: '项目名称',
      },
      {
        id: 'party',
        required: true,
        name: '项目方',
      },
      {
        id: 'provinceCode',
        required: true,
        name: '省市区',
      },
      {
        id: 'address',
        required: true,
        name: '项目详细地址',
      },
      {
        id: 'contractAmount',
        required: true,
        name: '合同金额',
        reg: vPrice,
        regErrorMsg: '请输入正确合同金额，最多两位小数',
      },
      {
        id: 'categoryCode',
        required: true,
        name: '所属分类',
      },
      {
        id: 'categorySmallCode',
        required: true,
        name: '所属分类',
      },
      {
        id: 'cycle',
        required: true,
        name: '项目周期',
        reg: vNumber,
        regErrorMsg: '请输入正确项目周期',
      },
      {
        id: 'amtBudget',
        required: true,
        name: '项目预算',
        reg: vPrice,
        regErrorMsg: '请输入正确项目预算，最多两位小数',
      },
      {
        id: 'itemLeader',
        required: true,
        name: '项目负责人',
      },
    ]
  }

  async componentDidMount() {
    await getCompanyInfo()
    await this.categorySubclass()
    const params = this.props.navigation.state.params
    console.log(params, 'paramsparams')
    if (params && params.type === 'edit') {
      await this.itemInfo(params.id)
    }
  }

  async categorySubclass() {
    const res = await ajaxStore.company.categorySubclass()
    if (res.data && res.data.code === '0') {
      const info = res.data.data
      this.setState({
        categoryList: info,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  itemInfo = async (id) => {
    const params = this.props.navigation.state.params
    const res = await ajaxStore.company.itemInfo({ id })
    if (res.data && res.data.code === '0') {
      const data = res.data.data || {}
      const itemFilesData = data.itemFiles || []
      const itemFiles = []
      for (let index = 0; index < itemFilesData.length; index++) {
        const element = itemFilesData[index]
        itemFiles.push({
          attachmentName: element.attachmentName, // 源文件名
          fileKey: element.fileKey, // 文件系统返回file-key
          fileName: element.fileName, // 附件名称
          fileSuffix: element.fileSuffix, // 文件后缀
          fileType: {
            title:
              element.fileType === '001'
                ? '合同'
                : element.fileType === '002'
                ? '标书'
                : element.fileType === '003'
                ? '其他'
                : '请选择',
            id: element.fileType,
          }, // 本期先分三类：合同-001、标书-002、其他-003
        })
      }
      let categoryName = ''
      let categorySmallName = ''
      this.state.categoryList.forEach((element) => {
        if (element.enumCode === data.category) {
          categoryName = element.enumName
        }
        element.subsets.forEach((element1) => {
          if (element1.enumCode === data.subclass) {
            categorySmallName = element1.enumName
          }
        })
      })

      this.setState({
        itemName: data.itemName || '',
        itemCode: data.itemCode || '',
        itemType: {
          title:
            data.itemType === '001'
              ? '居住建筑'
              : data.itemType === '002'
              ? '市政建筑'
              : data.itemType === '003'
              ? '企事业建筑'
              : data.itemType === '004'
              ? '商业娱乐建筑'
              : data.itemType === '005'
              ? '生产性建筑'
              : data.itemType === '006'
              ? '非工程类项目'
              : '请选择项目类型',
          id: data.itemType,
        },
        itemSort: data.itemSort || '',
        party: data.party.toString() || '',
        cycle: data.cycle.toString() || '',
        provinceCode: data.provinceCode || '',
        cityCode: data.cityCode || '',
        areaCode: data.areaCode || '',
        address: data.address || '',
        contractAmount: data.amtContract.toString() || '',
        categoryName: categoryName || '请选择',
        categoryCode: data.category || '',
        categorySmallName: categorySmallName || '请选择',
        categorySmallCode: data.subclass || '',
        itemFiles,
        itemLeader: data.itemLeader || '',
        provinceName: data.provinceName || '',
        cityName: data.cityName || '',
        areaName: data.areaName || '',
        showAddress: [`${data.provinceName} ${data.cityName} ${data.areaName}`],
        amtBudget: data.amtBudget.toString() || '',
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  showSupplierPicker = (arrayData, type, index) => {
    const { categoryName, categorySmallName, categoryCode, itemFlieType, itemType, itemFiles } = this.state
    let array = []
    if (type === '1' || type === '5') {
      array = arrayData.map((item, index) => {
        return item.title
      })
    } else if (type === '2' || type === '3') {
      if (type === '3' && !categoryCode) {
        global.alert.show({
          content: '请先选择上个类目',
        })
        return
      }
      array = arrayData.map((item, index) => {
        return item.enumName
      })
    }
    Picker.init({
      pickerData: array,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText:
        type === '1'
          ? '请选择项目类型'
          : type === '2' || type === '3'
          ? '请选择所属类目'
          : type === '5'
          ? '请选择'
          : '请选择厂家',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue:
        type === '1'
          ? [itemType.title]
          : type === '2'
          ? [categoryName]
          : type === '3'
          ? [categorySmallName]
          : type === '5'
          ? [itemFlieType.title]
          : [''],
      onPickerConfirm: async (pickedValue, pickedIndex) => {
        if (type === '1') {
          // 项目类型
          this.setState({
            itemType: arrayData[pickedIndex],
          })
        } else if (type === '2') {
          this.setState({
            categoryIndex: pickedIndex,
            categoryName: arrayData[pickedIndex].enumName,
            categoryCode: arrayData[pickedIndex].enumCode,
            categorySmallIndex: 0,
            categorySmallName: '请选择',
            categorySmallCode: '',
          })
        } else if (type === '3') {
          this.setState({
            categorySmallIndex: pickedIndex,
            categorySmallName: arrayData[pickedIndex].enumName,
            categorySmallCode: arrayData[pickedIndex].enumCode,
          })
        } else if (type === '5') {
          const list = [...itemFiles]
          const attachmentName = itemFiles[index].attachmentName
          const fileKey = itemFiles[index].fileKey
          const fileName = itemFiles[index].fileName
          const fileSuffix = itemFiles[index].fileSuffix
          list.splice(index, 1, {
            attachmentName, // 源文件名
            fileKey, // 文件系统返回file-key
            fileName, // 附件名称
            fileSuffix, // 文件后缀
            fileType: arrayData[pickedIndex], // 本期先分三类：合同-001、标书-002、其他-003
          })
          this.setState({
            itemFiles: [...list],
          })
        }
        this.hideShadow()
      },
      onPickerCancel: (pickedValue, pickedIndex) => {
        this.hideShadow()
      },
      onPickerSelect: (pickedValue, pickedIndex) => {},
    })
    this.showShadow()
    Picker.show()
  }

  async uploadOrderFile(path) {
    const data = {
      fileName: {
        uri: path,
        type: 'multipart/form-data',
        name: getFileName(path),
      },
    }
    global.loading.show('上传中')
    const res = await ajaxStore.credit.uploadAuthFile2(data)

    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const file = res.data.data

      const { itemFilesIndex, itemFiles } = this.state
      const list = [...itemFiles]
      const attachmentName = file.fileName
      const fileKey = file.key
      const fileName = itemFiles[itemFilesIndex].fileName
      const fileSuffix = file.fileType
      const fileType = itemFiles[itemFilesIndex].fileType
      list.splice(itemFilesIndex, 1, {
        attachmentName, // 源文件名
        fileKey, // 文件系统返回file-key
        fileName, // 附件名称
        fileSuffix, // 文件后缀
        fileType, // 本期先分三类：合同-001、标书-002、其他-003
      })
      this.setState({
        itemFiles: [...list],
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  commit = async () => {
    const {
      itemName,
      itemCode,
      itemType,
      party,
      provinceCode,
      cityCode,
      areaCode,
      address,
      contractAmount,
      itemLeader,
      categoryCode,
      categorySmallCode,
      provinceName,
      cityName,
      areaName,
      cycle,
      itemFiles,
      amtBudget,
    } = this.state
    const params = this.props.navigation.state.params
    const valid = formValid(this.rule, this.state)

    if (valid.result) {
      if (params.index === 0 && !itemType.id) {
        global.alert.show({
          content: '请选择项目类型',
        })
        return
      }
      let a = 0
      for (let index = 0; index < itemFiles.length; index++) {
        const element = itemFiles[index]
        if (!element.attachmentName || !element.fileKey || !element.fileSuffix || !element.fileType.id) {
          a = 1
        }
      }
      if (a === 1) {
        global.alert.show({
          content: '项目文件必填项不能为空',
        })
        return
      }
      const itemFilesData = []
      for (let index = 0; index < itemFiles.length; index++) {
        const element = itemFiles[index]
        itemFilesData.push({
          attachmentName: element.attachmentName, // 源文件名
          fileKey: element.fileKey, // 文件系统返回file-key
          fileName: element.fileName, // 附件名称
          fileSuffix: element.fileSuffix, // 文件后缀
          fileType: element.fileType.id, // 本期先分三类：合同-001、标书-002、其他-003
        })
      }

      const { userInfo, companyInfo } = this.props

      const data = {
        cifCompanyId: companyInfo.companyId,
        cifCompanyName: companyInfo.corpName,
        itemName,
        itemCode,
        itemType: params.index === 0 ? itemType.id : '006',
        itemSort: params.index === 0 ? '001' : '002',
        party,
        cycle,
        provinceCode,
        cityCode,
        areaCode,
        address,
        amtContract: contractAmount,
        subclass: categorySmallCode,
        category: categoryCode,
        itemFiles: itemFilesData,
        itemLeader,
        provinceName,
        cityName,
        areaName,
        amtBudget,
      }
      console.log(data)
      if (params && params.type === 'creat') {
        data.addingMode = '001'
        data.creator = companyInfo.corpName
        const res = await ajaxStore.company.itemCreate(data)
        if (res.data && res.data.code === '0') {
          onEvent('项目信息管理-创建项目页-保存', 'homeProjectManage/OtherProjectManageCreate', '/erp/item/create')
          global.alert.show({
            content: '项目创建完成',
            callback: () => {
              this.props.navigation.goBack()
            },
          })
        }
      } else {
        data.id = params.id
        const res = await ajaxStore.company.itemEdit(data)
        if (res.data && res.data.code === '0') {
          onEvent('项目信息管理-编辑项目页-保存', 'homeProjectManage/OtherProjectManageCreate', '/erp/item/edit')
          global.alert.show({
            content: '项目修改完成',
            callback: () => {
              this.props.navigation.goBack()
            },
          })
        }
      }
    } else {
      global.alert.show({
        content: valid.msg,
      })
    }
  }

  disabled() {
    return false
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  pickSingleWithCamera(cropping, mediaType = 'photo') {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 500,
      includeExif: true,
      compressImageQuality: 0.5,
      mediaType,
    })
      .then(async (image) => {
        console.log('received image', image)
        this.uploadOrderFile(image.path)
      })
      .catch((e) => {
        console.log(e)
        if (e.toString().indexOf('Required permission missing') !== -1) {
          global.alert.show({
            content: '请开启所需权限',
          })
        }
      })
  }

  pickSingle(cropit, circular = false, mediaType = 'photo') {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      compressImageQuality: 0.5,
      multiple: true,
      maxFiles: 1,
      mediaType,
      includeExif: true,
    })
      .then(async (image) => {
        console.log('received image', image)
        image.map((item, key) => {
          this.uploadOrderFile(item.path)
        })
      })
      .catch((e) => {
        console.log(e)
        if (e.toString().indexOf('Required permission missing') !== -1) {
          global.alert.show({
            content: '请开启所需权限',
          })
        }
      })
  }

  deletePhoto(index) {
    this.setState({
      fileKey: '',
    })
  }

  editFileData(dic, type) {
    const { itemFiles, itemFilesIndex } = this.state

    const list = [...itemFiles]
    const attachmentName = itemFiles[itemFilesIndex].attachmentName
    const fileKey = itemFiles[itemFilesIndex].fileKey
    const fileName = type === '1' ? dic.text : itemFiles[itemFilesIndex].fileName
    const fileSuffix = itemFiles[itemFilesIndex].fileSuffix
    const fileType = itemFiles[itemFilesIndex].fileType
    list.splice(itemFilesIndex, 1, {
      attachmentName, // 源文件名
      fileKey, // 文件系统返回file-key
      fileName, // 附件名称
      fileSuffix, // 文件后缀
      fileType, // 本期先分三类：合同-001、标书-002、其他-003
    })
    this.setState({
      itemFiles: [...list],
    })
  }

  async showPhoto(isShow) {
    this.setState({
      modalVisible: !!isShow,
      currentImage: 0,
    })
    const { itemFiles, itemFilesIndex } = this.state

    if (itemFiles[itemFilesIndex].fileSuffix.toString().indexOf('image') > -1) {
      global.loading.show()
      await open(`${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${itemFiles[itemFilesIndex].fileKey}`)
      global.loading.hide()
    } else {
      global.alert.show({
        content: '此处仅支持查看格式：jpg、jpeg、gif、bmp、png若需查看其他格式为文件，请前往仟金顶官网',
      })
    }
  }

  // 上传项目文件UI
  picUI() {
    // { /* <Touchable onPress={() => { this.showPhoto(true) }}>
    //               </Touchable> */ }
    // { /* this.ActionSheet.show() */ }

    const { itemFiles = [] } = this.state
    const picUIViews = []
    const { itemFlieType } = this.state

    for (let index = 0; index < itemFiles.length; index++) {
      const element = itemFiles[index]
      console.log(element)
      picUIViews.push(
        <View
          key={`${index + 1}`}
          style={{
            backgroundColor: '#F8F8FA',
            borderColor: '#F8F8FA',
            borderWidth: dp(1),
            padding: dp(1),
            borderRadius: dp(16),
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderTopRightRadius: index === 0 ? dp(16) : 0,
              borderTopLeftRadius: index === 0 ? dp(16) : 0,
            }}
          >
            <View style={styles.picUIBGView}>
              <View style={styles.leftBGView}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.leftName}>文件类型</Text>
              </View>
              <Touchable
                style={styles.picUISelect}
                onPress={() => {
                  this.showSupplierPicker(this.itemFlieType, '5', index)
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    element.fileType.title.toString().indexOf('请选择') > -1 ? styles.placeholder : '',
                  ]}
                >
                  {element.fileType.title}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
            </View>
            <View style={styles.picUIBGView}>
              <View style={styles.leftBGView}>
                <Text style={styles.leftName}>文件名</Text>
              </View>
              <TextInput
                placeholder={'请输入'}
                placeholderTextColor={'#91969A'}
                style={styles.picUIInput}
                maxLength={10}
                defaultValue={element.fileName || ''}
                onChangeText={(text) => {
                  this.setState({
                    itemFilesIndex: index,
                  })
                  this.editFileData({ text }, '1')
                }}
              />
            </View>
            <View style={styles.picUIBGView}>
              <View style={styles.leftBGView}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.leftName}>文件</Text>
              </View>
              <Touchable
                style={styles.picUISelect}
                onPress={() => {
                  this.setState({
                    itemFilesIndex: index,
                  })
                  if (element.attachmentName.toString().indexOf('上传') > -1) {
                    this.ActionSheet.show()
                  } else {
                    this.showPhoto(true)
                  }
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    element.attachmentName.toString().indexOf('上传') > -1
                      ? { color: '#1A97F6' }
                      : { color: '#1A97F6' },
                  ]}
                  numberOfLines={2}
                >
                  {element.attachmentName}
                </Text>
              </Touchable>
            </View>
          </View>
          <View
            style={[
              styles.picUIBGView,
              {
                justifyContent: 'space-between',
                flex: 1,
                backgroundColor: '#F8F8FA',
                borderBottomRightRadius: dp(16),
                borderBottomLeftRadius: dp(16),
              },
            ]}
          >
            {index === itemFiles.length - 1 ? (
              <Touchable
                onPress={() => {
                  this.setState({
                    itemFiles: [
                      ...itemFiles,
                      {
                        attachmentName: '上传', // 源文件名
                        fileKey: '', // 文件系统返回file-key
                        fileName: '', // 附件名称
                        fileSuffix: '', // 文件后缀
                        fileType: itemFlieType, // 本期先分三类：合同-001、标书-002、其他-003
                      },
                    ],
                  })
                }}
              >
                <View style={[styles.leftBGView, { position: 'relative' }]}>
                  <Iconfont style={styles.arrow} name={'tianjia'} size={dp(24)} />
                  <Text style={[styles.leftName, { color: '#1A97F6' }]}> 继续添加</Text>
                </View>
              </Touchable>
            ) : (
              <View />
            )}
            <Touchable
              onPress={() => {
                const list = [...itemFiles]
                list.splice(index, 1)
                this.setState({
                  itemFiles: [...list],
                })
              }}
            >
              <Text style={[styles.leftName, { color: '#F55849', marginRight: dp(30), paddingVertical: dp(30) }]}>
                删除
              </Text>
            </Touchable>
          </View>
        </View>,
      )
    }
    if (itemFiles.length === 0) {
      picUIViews.push(
        <Touchable
          key={'0'}
          onPress={() => {
            this.setState({
              itemFiles: [
                ...itemFiles,
                {
                  attachmentName: '上传', // 源文件名
                  fileKey: '', // 文件系统返回file-key
                  fileName: '', // 附件名称
                  fileSuffix: '', // 文件后缀
                  fileType: itemFlieType, // 本期先分三类：合同-001、标书-002、其他-003
                },
              ],
            })
          }}
        >
          <View
            style={[
              styles.picUIBGView,
              {
                justifyContent: 'space-between',
                flex: 1,
                backgroundColor: '#F8F8FA',
                borderBottomRightRadius: dp(16),
                borderBottomLeftRadius: dp(16),
              },
            ]}
          >
            <View style={[styles.leftBGView, { position: 'relative' }]}>
              <Iconfont style={styles.arrow} name={'tianjia'} size={dp(24)} />
              <Text style={[styles.leftName, { color: '#1A97F6' }]}> 添加</Text>
            </View>
          </View>
        </Touchable>,
      )
    }
    return picUIViews
  }

  searchCompany = (name) => {
    console.log(name)
    name = name.trim()
    if (name.length < 2) return

    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      const res = await ajaxStore.company.qccQuery({
        company_name: name,
      })
      if (res && res.data && res.data.code === '0') {
        this.setState({
          companyList: res.data.data || [],
        })
      }
    }, 500)
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={(ref) => {
          this.modal = ref
        }}
        title={'选择项目方'}
        confirm={'确定'}
        isAutoClose={false}
        submit={() => {
          if (!this.state.compantName) {
            global.alert.show({
              content: '请选择项目方',
            })
            return
          }
          this.setState({
            party: this.state.compantName,
          })
          this.modal.cancel()
        }}
      >
        <View
          style={{
            margin: dp(30),
          }}
        >
          <TextInput
            placeholder={'请输入项目方名称'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            // value={''}
            onChangeText={(text) => {
              this.searchCompany(text)
            }}
          />
          <Text style={{ fontSize: dp(26), color: '#b0b0b0', margin: dp(20) }}>最少输入两个字</Text>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ marginBottom: dp(360) }}>
            <View>
              {this.state.companyList &&
                this.state.companyList.map((data, index) => {
                  return (
                    <Touchable
                      key={index}
                      isPreventDouble={false}
                      onPress={() => {
                        this.setState({
                          compantName: data,
                        })
                      }}
                    >
                      <View>
                        <View style={styles.companyItem}>
                          <Text style={{ fontSize: dp(28), flex: 1 }}>{data}</Text>
                          {this.state.compantName === data && (
                            <Iconfont name={'liuchengyindao-yiwancheng'} size={dp(32)} />
                          )}
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

  render() {
    const { navigation } = this.props
    const {
      itemName,
      itemCode,
      itemType,
      party,
      showAddress,
      address,
      contractAmount,
      cycle,
      amtBudget,
      categoryName,
      categorySmallName,
      categoryList,
      categoryIndex,
      itemLeader,
      itemFiles,
    } = this.state
    const params = navigation.state.params
    const title =
      params.type === 'creat'
        ? params.index === 0
          ? '创建工程项目'
          : '创建非工程项目'
        : params.index === 0
        ? '编辑工程项目'
        : '编辑非工程项目'
    return (
      <View style={styles.container}>
        <NavBar title={title} navigation={navigation} />
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.blockMain}>
              {/* 项目名称 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目名称</Text>
              </View>
              <TextInput
                placeholder={'请输入项目名称'}
                style={styles.input}
                defaultValue={itemName}
                maxLength={50}
                onChangeText={(text) => {
                  this.setState({ itemName: text })
                }}
              />
              {/* 项目编号 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>项目编号</Text>
              </View>
              <TextInput
                placeholder={'请输入项目编号'}
                keyboardType="numeric"
                style={styles.input}
                value={itemCode}
                maxLength={50}
                onChangeText={(text) => {
                  this.setState({ itemCode: text })
                }}
              />
              {/* 项目类型 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目类型</Text>
              </View>
              <Touchable
                style={styles.select}
                onPress={() => {
                  params.index === 0 && this.showSupplierPicker(this.itemType, '1')
                }}
              >
                {params.index === 0 ? (
                  <Text
                    style={[
                      styles.selectText,
                      itemType.title.toString().indexOf('请选择项目类型') > -1 ? styles.placeholder : '',
                    ]}
                  >
                    {itemType.title}
                  </Text>
                ) : (
                  <Text style={[styles.selectText, styles.placeholder]}>{'非工程项目'}</Text>
                )}
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 项目地址 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目地址</Text>
              </View>
              <View style={[styles.input, styles.picker]}>
                <RegionPickerByAjax
                  ref={(o) => {
                    this.RegionPicker = o
                  }}
                  fontSize={28}
                  hint={'请选择省市区'}
                  monitorChange={true}
                  selectedValue={showAddress}
                  onPickerConfirm={(data) => {
                    console.log(data)
                    this.setState({
                      provinceCode: data.provinceCode,
                      cityCode: data.cityCode,
                      areaCode: data.areaCode,
                      showAddress: data.label.split(' '),
                      provinceName: data.provinceName,
                      cityName: data.cityName,
                      areaName: data.areaName,
                    })
                  }}
                  onOpen={() => {
                    this.showShadow()
                  }}
                  onClose={() => {
                    this.hideShadow()
                  }}
                />
                <Iconfont style={[styles.arrow, { paddingRight: dp(60) }]} name={'arrow-right'} size={dp(24)} />
              </View>
              <TextInput
                placeholder={'请填写详细地址'}
                style={[styles.input, { marginTop: dp(30) }]}
                value={address}
                maxLength={50}
                onChangeText={(text) => {
                  this.setState({ address: text })
                }}
              />
              {/* 项目方 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目方</Text>
              </View>

              {/* <TextInput
                placeholder={'请输入项目方'}
                style={styles.input}
                defaultValue={party}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ party: text })
                }}
              /> */}
              <Touchable
                style={styles.select}
                onPress={() => {
                  this.modal.show()
                }}
              >
                <Text style={[styles.selectText, party.toString().indexOf('请输入') > -1 ? styles.placeholder : '']}>
                  {party}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 合同金额 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={styles.titleRow}>
                  <Text style={{ color: 'red' }}>* </Text>
                  <Text style={styles.name}>合同金额（元）</Text>
                </View>
                <View style={styles.titleRow}>
                  <Text
                    style={{
                      fontSize: dp(28),
                      color: '#91969A',
                      width: dp(400),
                      textAlign: 'right',
                      lineHeight: dp(35),
                    }}
                  >
                    {convertCurrency(contractAmount.replace(/,/g, ''))}
                  </Text>
                </View>
              </View>
              <TextInput
                placeholder={'请输入合同金额'}
                keyboardType="numeric"
                maxLength={13}
                style={styles.input}
                value={contractAmount}
                onChangeText={(text) => {
                  this.setState({ contractAmount: numberAndPoint(text) })
                }}
              />
              {/* 所属类目 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>所属类目</Text>
              </View>
              <Touchable
                style={styles.select}
                onPress={() => {
                  this.showSupplierPicker(categoryList, '2')
                }}
              >
                <Text
                  style={[styles.selectText, categoryName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}
                >
                  {categoryName}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              <Touchable
                style={[styles.select, { marginTop: dp(30) }]}
                onPress={() => {
                  this.showSupplierPicker(categoryList[categoryIndex].subsets, '3')
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    categorySmallName.toString().indexOf('请选择') > -1 ? styles.placeholder : '',
                  ]}
                >
                  {categorySmallName}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 项目周期（天） */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目周期（天）</Text>
              </View>
              <TextInput
                placeholder={'请输入天数'}
                keyboardType="number-pad"
                maxLength={9}
                style={styles.input}
                value={cycle}
                onChangeText={(text) => {
                  this.setState({ cycle: text.replace(/[^\d]+/, '') })
                }}
              />
              {/* 项目预算（元） */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目预算（元）</Text>
              </View>
              <TextInput
                placeholder={'请输入项目预算（元）'}
                keyboardType="numeric"
                maxLength={13}
                style={styles.input}
                value={amtBudget}
                onChangeText={(text) => {
                  this.setState({ amtBudget: numberAndPoint(text) })
                }}
              />
              {/* 项目负责人 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目负责人</Text>
              </View>
              <TextInput
                placeholder={'请输入项目负责人'}
                maxLength={20}
                style={styles.input}
                defaultValue={itemLeader}
                onChangeText={(text) => {
                  this.setState({ itemLeader: text })
                }}
              />
              {/* 上传项目文件 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>上传项目文件</Text>
              </View>
              <View style={{ borderRadius: dp(16), backgroundColor: '#F8F8FA' }}>{this.picUI()}</View>
              <View style={[styles.titleRow, { flexDirection: 'row', width: DEVICE_WIDTH - dp(120) }]}>
                <Text style={{ fontSize: dp(28), color: '#999999' }}>
                  {'温馨提示：此处仅支持格式：jpg、jpeg、gif、bmp、png；若需上传其他格式为文件，请前往仟金顶官网。'}
                </Text>
              </View>
            </View>
            <View style={styles.footerBtn}>
              <SolidBtn onPress={this.commit} style={styles.save} text={'提交'} />
              <Text
                style={styles.cancelText}
                onPress={() => {
                  if (params && params.type === 'creat') {
                    onClickEvent('项目信息管理-创建项目页-取消创建', 'homeProjectManage/OtherProjectManageCreate')
                  } else {
                    onClickEvent('项目信息管理-编辑项目页-取消编辑', 'homeProjectManage/OtherProjectManageCreate')
                  }
                  this.props.navigation.goBack()
                }}
              >
                取消填写
              </Text>
            </View>
          </View>
        </ScrollView>

        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              this.RegionPicker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
        <ActionSheet
          ref={(o) => {
            this.ActionSheet = o
          }}
          options={['拍照', '从相册中选择', '取消']}
          cancelButtonIndex={2} // 表示取消按钮是第index个
          destructiveButtonIndex={2} // 第几个按钮显示为红色
          onPress={(index) => {
            switch (index) {
              case 0:
                this.pickSingleWithCamera(false)
                break
              case 1:
                this.pickSingle(false)
                break
            }
          }}
        />
        {this.state.fileKey && this.state.modalVisible && this.state.currentImage !== '' ? (
          <PhotoModal
            type={'orderFile'}
            imageData={[this.state.fileKey.split('/')[0]]}
            modalVisible={this.state.modalVisible}
            curentImage={this.state.currentImage}
            cancel={() => this.showPhoto(false)}
          />
        ) : null}

        {this.renderModal()}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId,
  }
}

export default connect(mapStateToProps)(OtherProjectManageCreate)

const styles = StyleSheet.create({
  dashline: {
    backgroundColor: '#e5e5e5',
    height: dp(1),
  },
  companyItem: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picUIInput: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(30),
    fontSize: dp(28),
    flex: 1,
    marginLeft: dp(182),
  },
  picUISelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: dp(30),
    flex: 1,
    marginLeft: dp(182),
  },
  leftName: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  leftBGView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: dp(20),
    position: 'absolute',
    marginVertical: dp(30),
  },
  picUIBGView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#F8F8FA',
    borderBottomWidth: dp(2),
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'stretch',
  },
  hint: {
    color: '#91969A',
    fontSize: dp(28),
    marginVertical: dp(30),
    textAlign: 'center',
  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    // paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16),
    paddingBottom: dp(140),
  },
  name: {
    fontSize: dp(28),
    color: '#2D2926',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    padding: dp(30),
  },
  selectText: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  picker: {
    paddingHorizontal: dp(15),
    paddingVertical: 0,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30),
    fontSize: dp(28),
  },
  placeholder: {
    color: '#A7ADB0',
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }],
  },
  save: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    marginTop: dp(65),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(24),
    marginTop: dp(48),
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  imageWapper: {
    position: 'relative',
  },
  imgDetleteBtn: {
    position: 'absolute',
    right: -dp(25),
    top: -dp(25),
  },
  fileImage: {
    flex: 1,
    width: dp(630),
    height: dp(300),
    marginBottom: dp(30),
    borderRadius: dp(16),
  },
  uploadBtn: {
    backgroundColor: '#DDDDE8',
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(68),
  },
  uploadIcon: {
    color: '#fff',
    fontSize: dp(120),
  },
  cancelText: {
    fontSize: dp(30),
    color: '#91969A',
    paddingVertical: dp(30),
    marginVertical: dp(60),
  },
  productDetail: {
    backgroundColor: '#F8F8FA',
    paddingVertical: dp(30),
    paddingHorizontal: dp(28),
    marginTop: dp(30),
  },
  productDetailTitle: {
    marginBottom: dp(15),
  },
  productDetailItem: {
    lineHeight: dp(50),
    color: '#999',
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
    paddingHorizontal: dp(30),
  },
})
