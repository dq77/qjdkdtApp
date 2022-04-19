import React, { PureComponent } from 'react'
import { Image, Keyboard, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { RadioButton, RadioGroup } from 'react-native-flexi-radio-button'
import ImagePicker from 'react-native-image-crop-picker'
import Modal, { ModalButton, ModalContent, ModalFooter, ScaleAnimation } from 'react-native-modals'
import Picker from 'react-native-picker'
import ActionSheet from '../../component/actionsheet'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import RegionPicker from '../../component/RegionPicker'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import globalStyles from '../../styles/globalStyles'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent } from '../../utils/AnalyticsUtil'
import Color from '../../utils/Color'
import { imgUrl } from '../../utils/config'
import { DateData } from '../../utils/Date'
import { CompareDate } from '../../utils/DateUtils'
import { getFileName } from '../../utils/FileUtils'
import PermissionUtils from '../../utils/PermissionUtils'
import { vIdcardNumber } from '../../utils/reg'
import { getRegionTextArr, parseAddress } from '../../utils/Region'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import StorageUtil from '../../utils/storageUtil'
import { autoLogin, logout } from '../../utils/UserUtils'
import { showToast } from '../../utils/Utility'
export default class Certification extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      taskId: '',
      showShadow: false,
      businessLicense: 0, // 0上传照片 1手动输入
      portrait: 0, // 0上传照片 1手动输入
      nationalEmblem: 0, // 0上传照片 1手动输入
      photoPath: '', // 图片本地路径
      portraitPhotoPath: '', // 图片本地路径
      nationalEmblemPhotoPath: '', // 图片本地路径
      errorModal: false,
      businessLicenseShowAddress: '',
      portraitShowAddress: '',
      authFiles: '',
      portraitAuthFiles: '',
      nationalEmblemAuthFiles: '',
      businessLicenseUploadId: null,
      form: {
        // 营业执照
        corpName: '', // 公司名称
        regCode: '', // 工商注册号
        legalPersonName: '', // 企业法人
        provinceCode: '', // 省code
        cityCode: '', // 市code
        areaCode: '', // 区code
        address: '', // 详细地址
      },
      portraitForm: {
        // 人像面
        legalName: '', // 法人姓名
        sexCode: '', // 性别
        idCardNo: '', // 身份证号码
        provinceCode: '', // 省code
        cityCode: '', // 市code
        areaCode: '', // 区code
        address: '', // 详细地址
      },
      nationalEmblemForm: {
        // 国徽面
        isLongTime: false, // 身份证长期有效
        idCardStartDate: '', // 身份证起始日
        idCardEndDate: '', // 身份证截止日
      },
      failureTipDecText: '',
      failureTipTitleText: '',
    }
    // 判断当前点击的是哪个上传图片1.营业执照上传  2.人像面上传  3.国徽面上传
    // const clickPicType = '1'
    // const failureTipDecText = ''
    // const failureTipTitleText = ''
  }

  componentDidMount() {
    // 判断是否是更新信息
    // const params = this.props.navigation.state.params
    // const isUpdate = params && params.isUpdate
    // if (isUpdate) {
    //   // 如果是认证失败，进入更新操作，先接口获取历史认证数据
    //   this.getLicenseData()
    // }
    this.getLicenseData()
    this.getTaskInfo()
  }

  async getTaskInfo() {
    const memberId = await StorageUtil.get('memberId')
    const res = await ajaxStore.credit.processTask({ memberId, processDefKey: 'USER_REGISTER' })
    if (res.data && res.data.code === '0') {
      const processTaskData = res.data.data
      this.setState({
        taskId: processTaskData.taskId,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  getLicenseData = async () => {
    global.loading.show()
    const res = await ajaxStore.company.getLicenseInfo({ isCardApply: 'isCardApply' })
    global.loading.hide()
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      const memberApplyVO = res.data.data.memberApplyVO || {}
      const idCardVo = res.data.data.idCardVo || {}
      const resAddressData = parseAddress(idCardVo.cardAddress)
      const enterpriseRegionText = getRegionTextArr(
        memberApplyVO.provinceCode,
        memberApplyVO.cityCode,
        memberApplyVO.areaCode,
      )
      const idCardRegionText = getRegionTextArr(resAddressData.province, resAddressData.city, resAddressData.district)

      this.setState({
        businessLicenseUploadId: res.data.data.authFile ? res.data.data.authFile.id : null,
        businessLicense: 1,
        portrait: 1, // 0上传照片 1手动输入
        nationalEmblem: 1, // 0上传照片 1手动输入
        authFiles:
          res.data.data.authFile && res.data.data.authFile.fileJson && JSON.parse(res.data.data.authFile.fileJson).key,
        portraitAuthFiles: idCardVo.fileKeyFace,
        nationalEmblemAuthFiles: idCardVo.fileKeyBack,
        businessLicenseShowAddress: enterpriseRegionText,
        portraitShowAddress: idCardRegionText,
        form: {
          ...this.state.form,
          corpName: memberApplyVO.corpName,
          regCode: memberApplyVO.regCode,
          legalPersonName: idCardVo.cardUserName,
          provinceCode: memberApplyVO.provinceCode,
          cityCode: memberApplyVO.cityCode,
          areaCode: memberApplyVO.areaCode,
          address: memberApplyVO.address,
        },
        portraitForm: {
          // 人像面
          ...this.state.portraitForm,
          legalName: idCardVo.cardUserName, // 法人姓名
          sexCode: idCardVo.cardSex === '女' ? '1' : '0', // 性别
          idCardNo: idCardVo.cardNo, // 身份证号码
          provinceCode: resAddressData.province, // 省code
          cityCode: resAddressData.city, // 市code
          areaCode: resAddressData.district, // 区code
          address: resAddressData.address, // 详细地址
        },
        nationalEmblemForm: {
          // 国徽面
          ...this.state.nationalEmblemForm,
          isLongTime: idCardVo.longTerm.length > 0, // 身份证长期有效
          idCardStartDate: idCardVo.cardBeginDt, // 身份证起始日
          idCardEndDate: idCardVo.cardEndDt, // 身份证截止日
        },
        failureTipDecText: '',
        failureTipTitleText: '',
      })
    }
  }

  disabled() {
    return !(
      this.state.form.corpName &&
      this.state.form.regCode &&
      this.state.form.provinceCode &&
      this.state.form.address &&
      this.state.portraitForm.legalName &&
      (this.state.portraitForm.sexCode === '0' || this.state.portraitForm.sexCode === '1') &&
      this.state.portraitForm.idCardNo &&
      this.state.businessLicenseShowAddress &&
      this.state.portraitShowAddress &&
      this.state.nationalEmblemForm.idCardStartDate &&
      (this.state.nationalEmblemForm.isLongTime === true
        ? true
        : this.state.nationalEmblemForm.idCardEndDate
        ? this.state.nationalEmblemForm.idCardEndDate
        : false)
    )
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

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar isReturnRoot="1" title="企业真实性认证" navigation={navigation} />
        {this.uploadPic()}
        {/* {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}><View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null} */}
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
        <Modal
          onTouchOutside={() => {
            this.setState({ errorModal: false })
          }}
          width={0.8}
          visible={this.state.errorModal}
          onSwipeOut={() => this.setState({ errorModal: false })}
          modalAnimation={
            new ScaleAnimation({
              initialValue: 0.5, // optional
              useNativeDriver: true, // optional
            })
          }
          onHardwareBackPress={() => {
            this.setState({ errorModal: false })
            return true
          }}
          footer={
            <ModalFooter>
              <ModalButton
                text="手动填写"
                onPress={() => {
                  if (this.clickPicType === '1') {
                    // 营业执照上传
                    this.setState({
                      errorModal: false,
                      form: {
                        ...this.state.form,
                        corpName: '',
                        regCode: '',
                        legalPersonName: '',
                        provinceCode: '',
                        cityCode: '',
                        areaCode: '',
                        address: '',
                      },
                      businessLicenseShowAddress: '',
                      businessLicense: 1,
                    })
                  } else if (this.clickPicType === '2') {
                    // 人像面上传
                    this.setState({
                      errorModal: false,
                      portraitForm: {
                        // 人像面
                        ...this.state.portraitForm,
                        legalName: '', // 法人姓名
                        sexCode: '2', // 性别
                        idCardNo: '', // 身份证号码
                        provinceCode: '', // 省code
                        cityCode: '', // 市code
                        areaCode: '', // 区code
                        address: '', // 详细地址
                      },
                      portraitShowAddress: '',
                      portrait: 1,
                    })
                  } else if (this.clickPicType === '3') {
                    // 国徽面上传
                    this.setState({
                      errorModal: false,
                      nationalEmblemForm: {
                        // 国徽面
                        ...this.state.nationalEmblemForm,
                        isLongTime: false, // 身份证长期有效
                        idCardStartDate: '', // 身份证起始日
                        idCardEndDate: '', // 身份证截止日
                      },
                      nationalEmblem: 1,
                    })
                  }
                }}
                key="button-1"
                textStyle={{ color: Color.TEXT_MAIN, fontWeight: 'bold' }}
              />

              <ModalButton
                text="再次上传"
                onPress={() => {
                  if (this.clickPicType === '1') {
                    // 营业执照上传
                    this.setState({
                      errorModal: false,
                      businessLicense: 0,
                      authFiles: '',
                    })
                    this.ActionSheet.show()
                  } else if (this.clickPicType === '2') {
                    // 人像面上传
                    this.setState({ errorModal: false, portrait: 0, portraitAuthFiles: '' })
                    this.ActionSheet.show()
                  } else if (this.clickPicType === '3') {
                    // 国徽面上传
                    this.setState({ errorModal: false, nationalEmblem: 0, nationalEmblemAuthFiles: '' })
                    this.ActionSheet.show()
                  }
                }}
                key="button-2"
                textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
              />
            </ModalFooter>
          }
        >
          <ModalContent style={{ alignItems: 'stretch' }}>
            <Text
              style={{
                fontSize: dp(32),
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {this.state.failureTipTitleText}
            </Text>
            <Text
              style={{
                fontSize: dp(30),
                textAlign: 'center',
                marginTop: dp(30),
                color: '#999999',
              }}
            >
              {this.state.failureTipDecText}
            </Text>
          </ModalContent>
        </Modal>
      </View>
    )
  }

  uploadPic = () => {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <View>
          <Text style={[styles.title, { paddingTop: dp(50), paddingLeft: dp(32) }, { alignSelf: 'flex-start' }]}>
            营业执照照片
          </Text>
          <Touchable
            style={styles.businessLicenseContainer}
            onPress={() => {
              this.clickPicType = '1'
              this.setState({
                failureTipTitleText: '照片内容识别失败',
              })
              this.ActionSheet.show()
            }}
          >
            {this.state.authFiles === '' ? null : (
              <Image
                style={styles.itemBusinessLicenseImageContainer}
                source={{ uri: `${imgUrl}${this.state.authFiles}` }}
              ></Image>
            )}

            {this.state.authFiles === '' ? null : <View style={styles.itemBshadowContainer}></View>}
            <Iconfont
              name={this.state.authFiles === '' ? 'icon-license' : 'icon-reupload'}
              size={dp(92)}
              style={{
                marginTop: dp(40),
                position: 'absolute',
              }}
            />
            <Text
              style={{
                fontSize: dp(24),
                color: this.state.authFiles === '' ? Color.TEXT_LIGHT : Color.WHITE,
                marginTop: dp(85) + dp(104),
                position: 'absolute',
              }}
            >
              {this.state.authFiles === '' ? '点击上传营业执照照片' : '重新上传营业执照照片'}
            </Text>
          </Touchable>
          {this.state.businessLicense === 0 ? null : this.inputManual()}
        </View>
        <Text style={[styles.title, { paddingTop: dp(50), paddingLeft: dp(32) }, { alignSelf: 'flex-start' }]}>
          法定代表人身份证照片
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Touchable
            style={styles.businessLicenseBottomContainer}
            onPress={() => {
              this.clickPicType = '2'
              this.setState({
                failureTipTitleText: '身份证内容识别失败',
              })
              this.ActionSheet.show()
            }}
          >
            {this.state.portraitAuthFiles === '' ? null : (
              <Image
                style={styles.itemImageContainer}
                source={{ uri: `${imgUrl}${this.state.portraitAuthFiles}` }}
              ></Image>
            )}
            {this.state.portraitAuthFiles === '' ? null : <View style={styles.itemBshadowHalfContainer}></View>}
            <Iconfont
              name={this.state.portraitAuthFiles === '' ? 'icon-identity-face' : 'icon-reupload'}
              size={dp(92)}
              style={{
                marginTop: dp(40),
                position: 'absolute',
              }}
            />
            <Text
              style={{
                fontSize: dp(24),
                color: this.state.portraitAuthFiles === '' ? Color.TEXT_LIGHT : Color.WHITE,
                marginTop: dp(85) + dp(104),
                position: 'absolute',
              }}
            >
              {this.state.portraitAuthFiles === '' ? '点击上传人像面照片' : '重新上传人像面照片'}
            </Text>
          </Touchable>
          <Touchable
            style={styles.businessLicenseBottomContainer}
            onPress={() => {
              this.clickPicType = '3'
              this.setState({
                failureTipTitleText: '身份证内容识别失败',
              })
              this.ActionSheet.show()
            }}
          >
            {this.state.nationalEmblemAuthFiles === '' ? null : (
              <Image
                style={styles.itemImageContainer}
                source={{ uri: `${imgUrl}${this.state.nationalEmblemAuthFiles}` }}
              ></Image>
            )}
            {this.state.nationalEmblemAuthFiles === '' ? null : <View style={styles.itemBshadowHalfContainer}></View>}
            <Iconfont
              name={this.state.nationalEmblemAuthFiles === '' ? 'icon-identity-back' : 'icon-reupload'}
              size={dp(92)}
              style={{
                marginTop: dp(40),
                position: 'absolute',
              }}
            />
            <Text
              style={{
                fontSize: dp(24),
                color: this.state.nationalEmblemAuthFiles === '' ? Color.TEXT_LIGHT : Color.WHITE,
                marginTop: dp(85) + dp(104),
                position: 'absolute',
              }}
            >
              {this.state.nationalEmblemAuthFiles === '' ? '点击上传国徽面照片' : '重新上传国徽面照片'}
            </Text>
          </Touchable>
        </View>
        {this.state.portrait === 0 && this.state.nationalEmblem === 0 ? null : (
          <Text style={[{ margin: dp(30), marginTop: dp(50), color: '#888888' }, { alignSelf: 'flex-start' }]}>
            请检查身份证照片已识别内容
          </Text>
        )}
        {this.state.portrait === 0 ? null : this.inputManualPortrait()}
        {this.state.nationalEmblem === 0 ? null : this.inputManualNationalEmblem()}

        <SolidBtn
          style={{
            marginLeft: dp(30),
            marginTop: dp(80),
            backgroundColor: !this.disabled() ? Color.THEME : Color.BTN_DISABLE,
          }}
          text={'提交真实性认证'}
          onPress={() => {
            this.postInfo()
          }}
        />
        <StrokeBtn
          style={{ marginLeft: dp(30), marginTop: dp(60), marginBottom: dp(100) }}
          text={'退出登录'}
          onPress={() => {
            logout()
          }}
        />
      </ScrollView>
    )
  }

  // 营业执照输入文本界面
  inputManual = () => {
    return (
      <View>
        <Text style={[{ margin: dp(30), marginTop: dp(50), color: '#888888' }, { alignSelf: 'flex-start' }]}>
          请检查营业执照照片已识别内容
        </Text>

        <View style={styles.picContainer}>
          <View style={globalStyles.splitLine} />
          {/* 企业名称 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>企业名称</Text>
            <TextInput
              placeholder={'请输入企业名称'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.form.corpName}
              onChangeText={text => {
                this.setState({
                  form: { ...this.state.form, corpName: text },
                })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 企业注册号 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>社会统一信用代码</Text>
            <TextInput
              placeholder={'请输入社会统一信用代码'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.form.regCode}
              onChangeText={text => {
                this.setState({ form: { ...this.state.form, regCode: text } })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 企业所在地区 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>企业所在地区</Text>
            <RegionPicker
              monitorChange={true}
              selectedValue={this.state.businessLicenseShowAddress}
              onPickerConfirm={data => {
                console.log(data, '1212121212')
                this.setState({
                  form: {
                    ...this.state.form,
                    provinceCode: data.provinceCode,
                    cityCode: data.cityCode,
                    areaCode: data.areaCode,
                  },
                  businessLicenseShowAddress: data.label.split(' '),
                })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 详细地址 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>企业详细地址</Text>
            <TextInput
              placeholder={'请输入企业详细地址'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.form.address}
              onChangeText={text => {
                this.setState({ form: { ...this.state.form, address: text } })
              }}
            />
          </View>
        </View>
      </View>
    )
  }

  // 人像面输入文本界面
  inputManualPortrait = () => {
    return (
      <View>
        <View style={styles.picContainer}>
          <View style={globalStyles.splitLine} />
          {/* 法人姓名 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>法人姓名</Text>
            <TextInput
              placeholder={'请输入法人姓名'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.portraitForm.legalName}
              onChangeText={text => {
                this.setState({
                  portraitForm: { ...this.state.portraitForm, legalName: text },
                })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 性别 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>性别</Text>
            <RadioGroup
              style={styles.reaioGroup}
              color={Color.WX_GREEN}
              selectedIndex={this.state.portraitForm.sexCode}
              onSelect={(index, value) => {
                if (value === '女') {
                  this.setState({
                    portraitForm: {
                      ...this.state.portraitForm,
                      sexCode: '1',
                    },
                  })
                } else if (value === '男') {
                  this.setState({
                    portraitForm: {
                      ...this.state.portraitForm,
                      sexCode: '0',
                    },
                  })
                } else {
                  this.setState({
                    portraitForm: {
                      ...this.state.portraitForm,
                      sexCode: 2,
                    },
                  })
                }
              }}
            >
              <RadioButton value={'男'} style={styles.radioButton}>
                <Text>男</Text>
              </RadioButton>
              <RadioButton value={'女'} style={styles.radioButton}>
                <Text>女</Text>
              </RadioButton>
            </RadioGroup>
          </View>
          {/* 身份证号码 */}
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 性别 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>身份证号码</Text>
            <TextInput
              placeholder={'请输入身份证号码'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.portraitForm.idCardNo}
              onChangeText={text => {
                this.setState({ portraitForm: { ...this.state.portraitForm, idCardNo: text } })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 住址所在地区 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>住址所在地区</Text>
            <RegionPicker
              monitorChange={true}
              selectedValue={this.state.portraitShowAddress}
              onPickerConfirm={data => {
                this.setState({
                  portraitForm: {
                    ...this.state.portraitForm,
                    provinceCode: data.provinceCode,
                    cityCode: data.cityCode,
                    areaCode: data.areaCode,
                  },
                  portraitShowAddress: data.label.split(' '),
                })
              }}
            />
          </View>
          <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
          {/* 详细地址 */}
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>详细住址</Text>
            <TextInput
              placeholder={'请输入详细住址'}
              placeholderTextColor={Color.TEXT_LIGHT}
              style={styles.itemInput}
              value={this.state.portraitForm.address}
              onChangeText={text => {
                this.setState({ portraitForm: { ...this.state.portraitForm, address: text } })
              }}
            />
          </View>
        </View>
      </View>
    )
  }

  // 国徽面输入文本界面
  inputManualNationalEmblem = () => {
    return (
      // <ScrollView keyboardShouldPersistTaps="handled">
      <View style={[styles.picContainer, { marginTop: dp(20) }]}>
        {/* 身份证长期有效 */}
        <View style={styles.itemContainer}>
          <Text style={[styles.itemTitle, { width: DEVICE_WIDTH / 2 }]}>身份证长期有效</Text>
          <Switch
            style={styles.switch}
            width={50}
            height={28}
            value={this.state.nationalEmblemForm.isLongTime}
            onValueChange={value => {
              this.setState({
                nationalEmblemForm: {
                  ...this.state.nationalEmblemForm,
                  isLongTime: value,
                },
              })
            }}
          />
        </View>
        <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
        {/* 身份证起始日 */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemTitle}>身份证起始日</Text>
          <Text style={styles.input} onPress={this.showStartDatePicker}>
            {this.state.nationalEmblemForm.idCardStartDate}
          </Text>
          <Iconfont style={{ marginRight: dp(20) }} name={'arrow-right'} size={dp(25)} />
        </View>
        <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
        {/* 身份证截止日 */}
        {this.state.nationalEmblemForm.isLongTime === false ? this.endDateView() : null}
        {/* {this.endDateView()} */}
        <View style={[globalStyles.splitLine, { marginLeft: dp(50) }]} />
      </View>
      // {/* </ScrollView> */}
    )
  }

  endDateView = () => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemTitle}>身份证截止日</Text>
        <Text style={styles.input} onPress={this.showEndDatePicker}>
          {this.state.nationalEmblemForm.idCardEndDate}
        </Text>
        <Iconfont style={{ marginRight: dp(20) }} name={'arrow-right'} size={dp(25)} />
      </View>
    )
  }

  showStartDatePicker = () => {
    Keyboard.dismiss()

    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择身份证起始日',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: this.state.nationalEmblemForm.idCardStartDate
        ? this.format(this.state.nationalEmblemForm.idCardStartDate).split('-')
        : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        let m = '0'
        let d = '0'
        if (pickedValue[1].length < 2) {
          m = '0' + pickedValue[1]
        } else {
          m = pickedValue[1]
        }
        if (pickedValue[2].length < 2) {
          d = '0' + pickedValue[2]
        } else {
          d = pickedValue[2]
        }
        pickedValue = [pickedValue[0], m, d]
        this.setState({
          nationalEmblemForm: {
            ...this.state.nationalEmblemForm,
            idCardStartDate: pickedValue.join('-'),
          },
        })
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

  showEndDatePicker = () => {
    Keyboard.dismiss()

    Picker.init({
      pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择身份证截止日',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: this.state.nationalEmblemForm.idCardEndDate
        ? this.format(this.state.nationalEmblemForm.idCardEndDate).split('-')
        : [],
      onPickerConfirm: (pickedValue, pickedIndex) => {
        let m = '0'
        let d = '0'
        if (pickedValue[1].length < 2) {
          m = '0' + pickedValue[1]
        } else {
          m = pickedValue[1]
        }
        if (pickedValue[2].length < 2) {
          d = '0' + pickedValue[2]
        } else {
          d = pickedValue[2]
        }
        pickedValue = [pickedValue[0], m, d]
        this.setState({
          nationalEmblemForm: {
            ...this.state.nationalEmblemForm,
            idCardEndDate: pickedValue.join('-'),
          },
        })
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

  format = dataStrArr => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
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
        // console.log('received image', image)
        if (this.clickPicType === '1') {
          this.setState({
            photoPath: image.path,
          })
          // 营业执照上传
          this.uploadBuseLicenseOCR()
        } else if (this.clickPicType === '2') {
          this.setState({
            portraitPhotoPath: image.path,
          })
          // 人像面上传
          this.uploadSurfaceOCR()
        } else if (this.clickPicType === '3') {
          this.setState({
            nationalEmblemPhotoPath: image.path,
          })
          // 国徽面上传
          this.uploadNationalEmblemSurfaceOCR()
        }
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
        console.log('received image', image)
        if (this.clickPicType === '1') {
          this.setState({
            photoPath: image.path,
          })
          // 营业执照上传
          this.uploadBuseLicenseOCR()
        } else if (this.clickPicType === '2') {
          this.setState({
            portraitPhotoPath: image.path,
          })
          // 人像面上传
          this.uploadSurfaceOCR()
        } else if (this.clickPicType === '3') {
          this.setState({
            nationalEmblemPhotoPath: image.path,
          })
          // 国徽面上传
          this.uploadNationalEmblemSurfaceOCR()
        }
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

  // 营业执照上传
  uploadBuseLicenseOCR = async () => {
    global.loading.show('图片分析中')
    const data = {
      file: {
        uri: this.state.photoPath,
        type: 'multipart/form-data',
        name: getFileName(this.state.photoPath),
      },
    }
    console.log(data)
    const res = await ajaxStore.company.ocrBusinessLicense(data)
    global.loading.hide()
    if (res.data && res.data.code === '0') {
      const dataValue = res.data.data
      const resAddressData = parseAddress(dataValue.address)
      // console.log(resAddressData)
      this.setState({
        form: {
          ...this.state.form,
          corpName: dataValue.name,
          regCode: dataValue.regNum,
          legalPersonName: dataValue.person,
          provinceCode: resAddressData.province,
          cityCode: resAddressData.city,
          areaCode: resAddressData.district,
          address: resAddressData.address,
        },
        businessLicenseShowAddress: resAddressData.regionStr.split(' '),
        authFiles: dataValue.fileKey,
        businessLicense: 1,
      })
    } else {
      const dataValue = res.data.data
      this.setState({
        errorModal: true,
        businessLicense: 0,
        failureTipDecText: res.data.message || '请上传清晰的营业执照照片，以便准确识别内容。',
        authFiles: dataValue.fileKey,
      })
    }
  }

  // 人像面上传
  uploadSurfaceOCR = async () => {
    global.loading.show('图片分析中')
    const side = 'face'
    const data = {
      file: {
        uri: this.state.portraitPhotoPath,
        type: 'multipart/form-data',
        name: getFileName(this.state.portraitPhotoPath),
      },
      side,
    }
    console.log(data)
    const res = await ajaxStore.company.ocrIdCard(data)
    global.loading.hide()
    console.log(res.data)
    // console.log(res.data.data.picturePath)
    if (res.data && res.data.code === '0') {
      const dataValue = res.data.data
      const resAddressData = parseAddress(dataValue.address)
      this.setState({
        portraitForm: {
          // 人像面
          ...this.state.portraitForm,
          legalName: dataValue.name, // 法人姓名
          sexCode: dataValue.gender === '女' ? '1' : '0', // 性别
          idCardNo: dataValue.idcardNo, // 身份证号码
          provinceCode: resAddressData.province, // 省code
          cityCode: resAddressData.city, // 市code
          areaCode: resAddressData.district, // 区code
          address: resAddressData.address, // 详细地址
        },
        portraitShowAddress: resAddressData.regionStr.split(' '),
        portraitAuthFiles: dataValue.fileKey,
        portrait: 1,
      })
    } else {
      const dataValue = res.data.data
      this.setState({
        errorModal: true,
        portrait: 0,
        failureTipDecText: res.data.message || '请上传清晰的身份证照片，以便准确识别内容。',
        portraitAuthFiles: dataValue.fileKey,
      })
    }
  }

  // 国徽面上传
  uploadNationalEmblemSurfaceOCR = async () => {
    global.loading.show('图片分析中')
    const side = 'back'
    const data = {
      file: {
        uri: this.state.nationalEmblemPhotoPath,
        type: 'multipart/form-data',
        name: getFileName(this.state.nationalEmblemPhotoPath),
      },
      side,
    }
    console.log(data)
    const res = await ajaxStore.company.ocrIdCard(data)
    global.loading.hide()
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      const dataValue = res.data.data
      console.log(dataValue)
      this.setState({
        nationalEmblemForm: {
          // 国徽面
          ...this.state.nationalEmblemForm,
          isLongTime: dataValue.idcardEffectiveData === '长期', // 身份证长期有效
          idCardStartDate: dataValue.idcardStartData, // 身份证起始日
          idCardEndDate: dataValue.idcardEffectiveData, // 身份证截止日
        },
        nationalEmblemAuthFiles: dataValue.fileKeyBack,
        nationalEmblem: 1,
      })
    } else {
      const dataValue = res.data.data
      this.setState({
        errorModal: true,
        failureTipDecText: res.data.message || '请上传清晰的身份证照片，以便准确识别内容。',
        nationalEmblemAuthFiles: dataValue.fileKeyBack,
        nationalEmblem: 0,
      })
    }
  }

  postInfo = async () => {
    const { navigation } = this.props
    if (this.state.businessLicense === 0) {
      global.alert.show({
        content: '请上传营业执照照片',
      })
      return
    } else {
      if (this.state.form.corpName.length < 1) {
        global.alert.show({
          content: '请输入企业名称',
        })
        return
      }
      if (this.state.form.regCode.length < 13) {
        global.alert.show({
          content: '社会统一信用代码不能少于13位',
        })
        return
      }
      if (this.state.form.regCode.length > 18) {
        global.alert.show({
          content: '社会统一信用代码不能大于18位',
        })
        return
      }
      if (
        this.state.form.provinceCode.length < 1 ||
        this.state.form.cityCode.length < 1 ||
        this.state.form.areaCode.length < 1
      ) {
        global.alert.show({
          content: '请选择企业所在地区',
        })
        return
      }
      if (this.state.form.address.length < 1) {
        global.alert.show({
          content: '请填写企业详细地址',
        })
        return
      }
    }
    if (this.state.portrait === 0) {
      global.alert.show({
        content: '请上传人像面照片',
      })
      return
    } else {
      if (this.state.portraitForm.legalName.length < 1) {
        global.alert.show({
          content: '请输入正确的法人姓名',
        })
        return
      }
      if (this.state.portraitForm.sexCode.length < 1 || this.state.portraitForm.sexCode === '2') {
        global.alert.show({
          content: '请选择性别',
        })
        return
      }
      if (!vIdcardNumber.test(this.state.portraitForm.idCardNo)) {
        global.alert.show({
          content: '请输入正确的身份证号码',
        })
        return
      }
      if (this.state.portraitForm.sexCode.length < 1) {
        global.alert.show({
          content: '请选择性别',
        })
        return
      }
      if (
        this.state.portraitForm.provinceCode.length < 1 ||
        this.state.portraitForm.cityCode.length < 1 ||
        this.state.portraitForm.areaCode.length < 1
      ) {
        global.alert.show({
          content: '请选择身份证住所所在地区',
        })
        return
      }
      if (this.state.portraitForm.address.length < 1) {
        global.alert.show({
          content: '请选输入身份证详细地址',
        })
        return
      }
    }
    if (this.state.nationalEmblem === 0) {
      global.alert.show({
        content: '请上传国徽面照片',
      })
      return
    } else {
      if (this.state.nationalEmblemForm.idCardStartDate.length < 1) {
        global.alert.show({
          content: '请选择身份证起始日',
        })
        return
      }
      if (this.state.nationalEmblemForm.isLongTime === false) {
        console.log('1')
        if (
          this.state.nationalEmblemForm.idCardEndDate.length < 1 ||
          this.state.nationalEmblemForm.idCardEndDate === '长期'
        ) {
          console.log('2')
          global.alert.show({
            content: '请选择身份证截止日',
          })
          return
        } else {
          console.log('3')
          if (CompareDate(this.state.nationalEmblemForm.idCardStartDate, this.state.nationalEmblemForm.idCardEndDate)) {
            console.log('4')
            global.alert.show({
              content: '身份证截止日不能早于身份证起始日',
            })
            return
          }
        }
      }
    }
    const Mun =
      parseInt(this.state.form.provinceCode) === 11 ||
      parseInt(this.state.form.provinceCode) === 12 ||
      parseInt(this.state.form.provinceCode) === 31 ||
      parseInt(this.state.form.provinceCode) === 50 ||
      parseInt(this.state.form.provinceCode) === 71 ||
      parseInt(this.state.form.provinceCode) === 81 ||
      parseInt(this.state.form.provinceCode) === 82
    console.log('122311211', Mun)

    const publicObj = this.state
    const licenseObj = this.state.form
    const faceObj = this.state.portraitForm
    const backObj = this.state.nationalEmblemForm
    console.log('122311211', Mun, licenseObj, faceObj)

    if (licenseObj.provinceCode.length < 1 || licenseObj.cityCode.length < 1) {
      global.alert.show({
        content: '营业执照地区信息不全，请检查确认',
      })
      console.log('33333', licenseObj.provinceCode, licenseObj.cityCode)
      return
    }
    if (faceObj.provinceCode.length < 1 || faceObj.cityCode.length < 1) {
      global.alert.show({
        content: '身份证地区信息不全，请检查确认',
      })
      console.log('4444', faceObj.provinceCode, faceObj.cityCode)
      return
    }

    const memberId = await StorageUtil.get('memberId')
    const data = {
      taskId: this.state.taskId,
      memberId: memberId,
      isPass: 'Y',
      fileCateCode: 'C10021',
      isCardApply: 'isCardApply',
      jsonStr: '',
      businessLicenseUploadId: this.state.businessLicenseUploadId || null,

      fileKeyLicense: publicObj.authFiles,
      corpName: licenseObj.corpName.trim(),
      regCode: licenseObj.regCode.trim(),
      provinceCode: licenseObj.provinceCode,
      cityCode: Mun && licenseObj.areaCode.length > 0 ? licenseObj.areaCode : licenseObj.cityCode,
      areaCode: Mun && licenseObj.areaCode.length > 0 ? '' : licenseObj.areaCode,
      address: licenseObj.address.trim(),

      fileKeyFace: this.state.portraitAuthFiles,
      legalPersonName: faceObj.legalName.trim(),
      cardSex: faceObj.sexCode === '1' ? '女' : '男', // 性别
      legalPersonCertId: faceObj.idCardNo, // 身份证号码
      cardAddress:
        getRegionTextArr(faceObj.provinceCode, faceObj.cityCode, faceObj.areaCode).join('') + faceObj.address.trim(), // 身份证完整地址

      fileKeyBack: this.state.nationalEmblemAuthFiles,
      longTerm: backObj.isLongTime ? '长期' : '', // 身份证是否长期有效
      cardBeginDt: backObj.idCardStartDate, // 身份证起始日期
      cardEndDt: backObj.isLongTime ? '' : backObj.idCardEndDate, // 身份证截止日期
    }

    const res = await ajaxStore.company.postProcess(data)

    console.log(res.data)
    if (res.data && res.data.code === '0') {
      const resultCode = res.data.data.resultCode || ''
      if (resultCode.toString() === '1') {
        // 认证成功
        onEvent('真实性认证结果', 'Certification', '/process/task/submit', {})
        showToast('认证成功')
        autoLogin()
        navigation.replace('AddSupplier', { certificationFailReturnRoot: '1' })
      } else {
        // 认证失败
        navigation.replace('CertificationFail')
      }
    }
  }
}

// position:'absolute',
const styles = StyleSheet.create({
  itemBshadowHalfContainer: {
    alignItems: 'center',
    backgroundColor: 'black',
    width: (DEVICE_WIDTH - dp(90)) / 2,
    height: dp(240),
    borderRadius: dp(10),
    opacity: 0.5,
    position: 'absolute',
  },
  itemBshadowContainer: {
    alignItems: 'center',
    backgroundColor: 'black',
    width: DEVICE_WIDTH - dp(60),
    height: dp(240),
    // margin: dp(30),
    borderRadius: dp(10),
    opacity: 0.5,
    position: 'absolute',
  },
  itemBusinessLicenseImageContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    width: DEVICE_WIDTH - dp(60),
    height: dp(240),
    // margin: dp(30),
    borderRadius: dp(10),
    opacity: 0.5,
  },
  itemImageContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    width: (DEVICE_WIDTH - dp(90)) / 2,
    height: dp(240),
    borderRadius: dp(10),
    opacity: 0.5,
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  header: { flexDirection: 'row' },
  tabbar: {
    flex: 1,
    textAlign: 'center',
    padding: dp(35),
    fontSize: dp(30),
    fontWeight: 'bold',
  },
  businessLicenseBottomContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    width: (DEVICE_WIDTH - dp(90)) / 2,
    height: dp(240),
    marginLeft: dp(30),
    marginTop: dp(30),
    borderRadius: dp(10),
  },
  businessLicenseContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    width: DEVICE_WIDTH - dp(60),
    height: dp(240),
    margin: dp(30),
    borderRadius: dp(10),
  },
  picContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    fontSize: dp(32),
  },
  itemContainer: {
    height: dp(90),
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    width: DEVICE_WIDTH / 3,
    paddingLeft: dp(30),
    fontSize: dp(30),
    color: Color.TEXT_MAIN,
  },
  itemInput: {
    fontSize: dp(30),
    flex: 1,
    marginRight: dp(20),
    color: Color.TEXT_MAIN,
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(7),
  },
  submitRealnameAuthentication: {
    borderRadius: dp(10),
    fontSize: dp(36),
    width: DEVICE_WIDTH - dp(60),
    height: dp(90),
    backgroundColor: '#3B3C5A',
    margin: dp(30),
  },
  reaioGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioButton: {
    width: dp(160),
    alignItems: 'center',
    paddingLeft: 0,
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingVertical: dp(20),
  },
  switch: {
    position: 'absolute',
    right: dp(30),
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
})
