import React, { Component } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { SolidBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import { isEmpty } from '../../utils/StringUtils'
import { setGoodsItems } from '../../actions/index'
import { showToast, toAmountStr, formValid } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import {
  vEmail, vPhone, vCompanyName, vChineseName
} from '../../utils/reg'
import RegionPickerUtilByAjax from '../../utils/RegionPickerUtilByAjax'
import BottomFullModal from '../../component/BottomFullModal'
import { onEvent } from '../../utils/AnalyticsUtil'

class CrmCreat extends Component {
  constructor (props) {
    super(props)
    this.rule = [
      { id: 'leadsName', required: true, name: '企业名称' }
    ]
    this.rule1 = [
      { id: 'linkName', required: true, reg: vChineseName, name: '联系人姓名' },
      { id: 'phoneNumber', required: true, reg: vPhone, name: '联系人手机号' }
    ]
    this.state = {
      pageTitle: '添加客户',
      isEdit: false,
      form: {
        leadsName: '', // 企业名称
        socialCreditCode: '', // 社会统一信用代码
        legalPerson: '', // 法人
        provinceCode: '',
        cityCode: '',
        areaCode: '',
        leadsDetailAddress: '', // 详细地址
        leadsAppContactDtoList: [
          {
            linkName: '', // 联系人姓名
            phoneNumber: '', // 联系人手机号
            post: '' // 联系人职务
          }
        ], // 联系人列表
        leadsSource: '', // 客户来源
        leadsManagerUser: ''// 客户负责人
      },
      showShadow: false,
      companyList: [],
      compantName: ''
    }
  }

  componentDidMount () {
    const { params } = this.props.navigation.state
    // console.log(params)
    if (params) {
      if (params.type === 'edit') { // 编辑
        this.setState({
          pageTitle: '编辑客户',
          isEdit: true,
          form: { ...params.data }
        })
      } else { // 新增
        this.setState({
          pageTitle: '添加客户',
          isEdit: false,
          form: { ...params.data }
        })
      }
    }
  }

  async loadData () {

  }

  addItem = () => {
    const list = this.state.form.leadsAppContactDtoList
    list.push(
      {
        linkName: '', // 联系人姓名
        phoneNumber: '', // 联系人手机号
        post: '' // 联系人职务
      }
    )
    this.setState({
      form: {
        ...this.state.form,
        leadsAppContactDtoList: list
      }
    })
  }

  showRegionDialog = () => {
    RegionPickerUtilByAjax
      .init()
      .setOnOpen(this.showShadow)
      .setOnClose(this.hideShadow)
      .setConfirm((data) => {
        this.setState({
          form: {
            ...this.state.form,
            provinceCode: data.provinceCode,
            cityCode: data.cityCode,
            areaCode: data.areaCode || ''
          }
        })
      })
      .show(this.state.form.provinceCode && this.state.form.cityCode
        ? getRegionTextArr(this.state.form.provinceCode, this.state.form.cityCode, this.state.form.areaCode)
        : [])
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  disable = () => {
    const { leadsName } = this.state.form
    return !(leadsName)
  }

  submit = async () => {
    // console.log(this.props.companyInfo)
    // const { } = this.state

    const valid = formValid(this.rule, this.state.form)
    if (valid.result) {
      if (!this.check() || !this.checkCompanyName()) { return }
      const data = {
        ofsCompanyId: this.props.ofsCompanyId,
        ...this.state.form
      }
      const res = this.state.isEdit
        ? await ajaxStore.crm.crmEdit(data)
        : await ajaxStore.crm.crmAdd(data)
      if (res && res.data && res.data.code === '0') {
        if (this.state.form.fissionId) {
          onEvent('意向客户-客户详情页-添加至CRM-提交', 'crm/CrmCreat', '/erp/leads/addCommerce', data)
        } else {
          onEvent('CRM-添加客户页-提交', 'crm/CrmCreat', this.state.isEdit ? '/erp/leads/editCommerce' : '/erp/leads/addCommerce', data)
        }
        global.alert.show({
          content: this.state.isEdit ? '保存成功' : '添加成功',
          callback: () => {
            this.props.navigation.goBack()
          }
        })
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  check () {
    let is = true
    this.state.form.leadsAppContactDtoList.forEach(value => {
      const valid = formValid(this.rule1, value)
      if (!valid.result) {
        is = false
        global.alert.show({
          content: valid.msg
        })
      }
    })
    return is
  }

  async checkCompanyName () {
    let is = false
    const res = await ajaxStore.crm.checkName({
      name: this.state.form.leadsName
    })
    if (res && res.data && res.data.code === '0') {
      is = res.data.data
      if (!res.data.data) { // 存在
        global.alert.show({
          content: '该企业已存在，请重新选择'
        })
      }
    }
    return is
  }

  searchCompany = (name) => {
    console.log(name)
    name = name.trim()
    if (name.length < 2) return

    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      const res = await ajaxStore.crm.qccQuery({
        companyName: name
      })
      if (res && res.data && res.data.code === '0') {
        this.setState({
          companyList: res.data.data || []
        })
      }
    }, 500)
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'选择企业'}
        confirm={'确定'}
        isAutoClose={false}
        submit={() => {
          if (!this.state.compantName) {
            global.alert.show({
              content: '请选择企业'
            })
            return
          }
          this.setState({
            form: {
              ...this.state.form,
              leadsName: this.state.compantName
            }
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
                      compantName: data.name,
                      form: {
                        ...this.state.form,
                        socialCreditCode: data.creditCode,
                        legalPerson: data.legalPersonName
                      }
                    })
                  }}>
                    <View>
                      <View style={styles.companyItem}>
                        <Text style={{ fontSize: dp(28), flex: 1 }}>{data.name}</Text>
                        {this.state.compantName === data.name &&
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
      leadsName, provinceCode, areaCode, cityCode,
      leadsDetailAddress, leadsSource, leadsManagerUser,
      leadsAppContactDtoList
    } = this.state.form
    return (
      <View style={styles.container}>
        <NavBar title={this.state.pageTitle} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center' }}>

            <View style={styles.block}>
              {/* 企业名称 */}
              <FormItemComponent
                title={'企业名称'}
                placeholder={'请输入企业名称'}
                style={styles.formItem}
                titleStyle={styles.titleStyle}
                maxLength={32}
                value={leadsName}
                showStar={true}
                editable={false}
                onPress={() => {
                  this.setState({
                    companyList: [],
                    compantName: ''
                  })
                  this.modal.show()
                }}
              />
              <View style={styles.splitLine} />
              {/* 联系地址 */}
              <FormItemComponent
                style={styles.formItem}
                titleStyle={styles.titleStyle}
                title={'联系地址'}
                placeholder={'请选择省市区'}
                editable={false}
                showArrow={false}
                value={provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') : ''}
                onPress={() => {
                  this.showRegionDialog()
                }}
              />
              <View style={styles.splitLine} />
              {/* 详细地址 */}
              <FormItemComponent
                style={styles.formItem}
                titleStyle={styles.titleStyle}
                title={'详细地址'}
                placeholder={'请输入具体地址'}
                maxLength={100}
                value={leadsDetailAddress}
                onChangeText={text => {
                  this.setState({
                    form: { ...this.state.form, leadsDetailAddress: text }
                  })
                }}
              />
            </View>

            {/* 联系人 */}
            <View style={styles.block}>
              {leadsAppContactDtoList && leadsAppContactDtoList.map((data, index) => {
                return (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <FormItemComponent
                      style={styles.formItem}
                      titleStyle={styles.titleStyle}
                      title={'联系人'}
                      placeholder={'请输入联系人姓名'}
                      maxLength={20}
                      showStar={true}
                      value={data.linkName}
                      onChangeText={text => {
                        const list = this.state.form.leadsAppContactDtoList
                        list[index].linkName = text
                        this.setState({
                          form: { ...this.state.form, leadsAppContactDtoList: list }
                        })
                      }}
                    />
                    <FormItemComponent
                      style={styles.formItem}
                      titleStyle={styles.titleStyle}
                      title={'职位'}
                      placeholder={'请输入联系人职位'}
                      maxLength={30}
                      value={data.post}
                      onChangeText={text => {
                        const list = this.state.form.leadsAppContactDtoList
                        list[index].post = text
                        this.setState({
                          form: { ...this.state.form, leadsAppContactDtoList: list }
                        })
                      }}
                    />
                    <View style={styles.splitLine} />
                    <FormItemComponent
                      style={styles.formItem}
                      titleStyle={styles.titleStyle}
                      showStar={true}
                      title={'联系方式'}
                      placeholder={'请输入联系人联系方式'}
                      maxLength={30}
                      keyboardType="number-pad"
                      value={data.phoneNumber}
                      onChangeText={text => {
                        const list = this.state.form.leadsAppContactDtoList
                        list[index].phoneNumber = text
                        this.setState({
                          form: { ...this.state.form, leadsAppContactDtoList: list }
                        })
                      }}
                    />
                    <View style={[styles.splitLine, { marginBottom: dp(20) }]} />

                  </View>
                )
              })}

              <Touchable onPress={this.addItem}>
                <Iconfont style={{ height: dp(10), padding: 0, marginVertical: -dp(30) }} name={'tianjialianxiren'} size={dp(170)} />
              </Touchable>
            </View>

            <View style={styles.block}>
              {/* 客户来源 */}
              <FormItemComponent
                style={styles.formItem}
                titleStyle={styles.titleStyle}
                title={'客户来源'}
                placeholder={'请输入客户来源'}
                maxLength={100}
                value={leadsSource}
                onChangeText={text => {
                  this.setState({
                    form: { ...this.state.form, leadsSource: text }
                  })
                }}
              />
              <View style={styles.splitLine} />
              {/* 客户负责人 */}
              <FormItemComponent
                style={styles.formItem}
                titleStyle={styles.titleStyle}
                title={'客户负责人'}
                placeholder={'请输入客户负责人'}
                maxLength={100}
                value={leadsManagerUser}
                onChangeText={text => {
                  this.setState({
                    form: { ...this.state.form, leadsManagerUser: text }
                  })
                }}
              />
            </View>

            <SolidBtn style={styles.btn} onPress={this.submit} disabled={false} text={'提交'} />

          </View>
        </ScrollView>
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
        {this.renderModal()}
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

export default connect(mapStateToProps)(CrmCreat)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  title: {
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20),
    width: DEVICE_WIDTH
  },
  splitLine: {
    height: dp(1),
    width: dp(660),
    marginLeft: dp(30),
    backgroundColor: '#E7EBF2'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  checkbox: {
    padding: dp(30),
    backgroundColor: '#EFEFF4'
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
  },
  hint: {
    fontSize: dp(23),
    color: '#a0a0a0',
    marginTop: dp(35),
    marginBottom: dp(50)
  },
  btn: {
    marginTop: dp(70),
    marginBottom: dp(70),
    borderRadius: dp(45)
  },
  block: {
    backgroundColor: 'white',
    borderRadius: dp(16),
    alignItems: 'center',
    marginHorizontal: dp(30),
    marginTop: dp(30)
  },
  formItem: { backgroundColor: null },
  titleStyle: {
    fontWeight: 'normal'
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    paddingVertical: dp(20),
    fontSize: dp(28)
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
  }
})
