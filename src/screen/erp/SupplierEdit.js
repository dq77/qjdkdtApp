/*
 * @Date: 2021-02-01 09:08:56
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-04 13:39:57
 */
import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TouchableWithoutFeedback, TextInput } from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'
import { ScrollView } from 'react-native-gesture-handler'
import CheckBox from 'react-native-check-box'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { onEvent } from '../../utils/AnalyticsUtil'
import RegionPicker from '../../component/RegionPickerByAjax'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { formValid, injectUnmount } from '../../utils/Utility'
import { vPhone, vPrice, vNumber } from '../../utils/reg'
import { connect } from 'react-redux'
import Iconfont from '../../iconfont/Icon'

@injectUnmount
class SupplierEdit extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      supplierName: '',
      supplierCode: '',
      contactName: '',
      contactPhone: '',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      address: '',
      goodCat: '',
      supplierYear: '',
      historyAmount: '',
      tip: '',
      showAddress: '',
      pageTitle: '',
      status: false,
      showShadow: false
    }

    this.rule = [
      {
        id: 'supplierCode',
        required: true,
        name: '供应商编码'
      },
      {
        id: 'contactPhone',
        required: false,
        reg: vPhone,
        name: '联系人电话'
      },
      {
        id: 'supplierYear',
        required: false,
        reg: vNumber,
        regErrorMsg: '合作年限为正整数',
        name: '合作年限'
      },
      {
        id: 'historyAmount',
        required: false,
        reg: vPrice,
        name: '历史采购金额'
      },
      {
        id: 'tip',
        required: false,
        name: '备注'
      }

    ]
  }

  componentDidMount () {
    const params = this.props.navigation.state.params
    let pageTitle = '添加供应商'
    if (params && params.id) {
      pageTitle = '编辑供应商'
      this.getSupplierInfo(params.id)
    }
    this.setState({ pageTitle })
  }

  getSupplierInfo = async (id) => {
    const res = await ajaxStore.order.getSupplierInfo({ id })
    if (res.data && res.data.code === '0') {
      const {
        supplierName, supplierCode, contactName, contactPhone, provinceCode, cityCode, areaCode,
        address, goodCat, supplierYear, historyAmount, tip, status
      } = res.data.data

      await this.setState({
        supplierName,
        supplierCode,
        contactName,
        contactPhone,
        provinceCode,
        cityCode,
        areaCode,
        address,
        showAddress: provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode) : '',
        goodCat,
        supplierYear: supplierYear || '',
        historyAmount: historyAmount || '',
        tip,
        status: !status
      })
    }
  }

  commit = async () => {
    const {
      supplierName, supplierCode, contactName, contactPhone, provinceCode, cityCode, areaCode, address, goodCat, supplierYear,
      historyAmount, tip, status
    } = this.state

    const valid = formValid(this.rule, this.state)
    if (valid.result) {
      const data = {
        supplierName,
        supplierCode,
        contactName,
        contactPhone,
        provinceCode,
        cityCode,
        areaCode,
        address,
        goodCat,
        supplierYear,
        historyAmount,
        tip,
        status: status ? 0 : 1
      }
      const params = this.props.navigation.state.params
      if (params && params.id) {
        data.id = params.id
        onEvent('供应商管理-编辑供应商页-完成', 'erp/SupplierEdit', '/erp/supplier/update', { data })
        const res = await ajaxStore.order.updateSupplierItem(data)
        if (res.data && res.data.code === '0') {
          global.alert.show({
            content: '供应商修改完成',
            callback: () => {
              this.props.navigation.state.params.refresh()
              this.props.navigation.goBack()
            }
          })
        }
      } else {
        onEvent('供应商管理-添加供应商页-完成', 'erp/SupplierEdit', '/erp/supplier/add', { data })
        const res = await ajaxStore.order.addSupplierItem(data)
        if (res.data && res.data.code === '0') {
          global.alert.show({
            content: '供应商添加完成',
            callback: () => {
              this.props.navigation.state.params.refresh()
              this.props.navigation.goBack()
            }
          })
        }
      }
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  changeHistoryAmount = (text) => {
    // 限制输入为两位小数 可不限制
    const reg = /^\d+(\.)?(\d{1,2})?$/
    if (reg.test(text) || text === '') {
      this.setState({ historyAmount: text })
    }
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  render () {
    const { navigation } = this.props
    const {
      supplierName, supplierCode, contactName, contactPhone, showAddress, address,
      goodCat, supplierYear, historyAmount, tip, pageTitle, status
    } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={pageTitle} navigation={navigation} rightIcon={''} rightText={'完成'} onRightPress={() => { this.commit() }}/>
        <ScrollView>

          <View style={styles.content}>
            <View style={styles.blockMain}>
              {/* 供应商名称 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>供应商名称</Text>
              </View>
              <TextInput
                placeholder={'请输入供应商名称'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={supplierName}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ supplierName: text })
                }}
              />
              {/* 供应商编码 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>供应商编码</Text>
              </View>
              <TextInput
                placeholder={'请输入供应商编码'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={supplierCode}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ supplierCode: text })
                }}
              />
              {/* 联系人 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>联系人</Text>
              </View>
              <TextInput
                placeholder={'请输入联系人'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={contactName}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ contactName: text })
                }}
              />
              {/* 联系人电话 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>联系人电话</Text>
              </View>
              <TextInput
                placeholder={'请输入联系人电话'}
                keyboardType='numeric'
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={contactPhone}
                maxLength={11}
                onChangeText={text => {
                  this.setState({ contactPhone: text })
                }}
              />
              {/* 联系人地址 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>联系人地址</Text>
              </View>
              <View style={[styles.input, styles.picker]}>
                <RegionPicker
                  ref={o => { this.RegionPicker = o }}
                  style={{ marginVertical: dp(2) }}
                  fontSize={28}
                  hint={'请选择所在地区'}
                  monitorChange={true}
                  selectedValue={showAddress}
                  onPickerConfirm={(data) => {
                    this.setState({
                      provinceCode: data.provinceCode,
                      cityCode: data.cityCode,
                      areaCode: data.areaCode,
                      showAddress: data.label.split(' ')
                    })
                  }}
                  onOpen={() => { this.showShadow() }}
                  onClose={() => { this.hideShadow() }}
                />
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </View>
              {/* 联系人详细地址 */}
              {/* <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>联系人详细地址</Text>
              </View> */}
              <TextInput
                placeholder={'联系人详细地址'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={address}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ address: text })
                }}
              />
              {/* 货物类型 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>货物类型</Text>
              </View>
              <TextInput
                placeholder={'请输入货物类型'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={goodCat}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ goodCat: text })
                }}
              />
              {/* 合作年限 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>合作年限（年）</Text>
              </View>
              <TextInput
                placeholder={'请输入合作年限'}
                keyboardType='numeric'
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={`${supplierYear}`}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ supplierYear: text })
                }}
              />
              {/* 历史采购金额 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>历史采购金额（万元）</Text>
              </View>
              <TextInput
                placeholder={'请输入历史采购金额'}
                keyboardType='numeric'
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={`${historyAmount}`}
                maxLength={200}
                onChangeText={text => {
                  this.changeHistoryAmount(text)
                }}
              />
              {/* 备注 */}
              <View style={styles.titleRow}>
                <Text style={styles.name}>备注</Text>
              </View>
              <TextInput
                placeholder={'请输入备注'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={tip}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ tip: text })
                }}
              />
              <View style={styles.checkboxWrapper}>
                <CheckBox
                  style={styles.checkbox}
                  onClick={() => {
                    this.setState({ status: !status })
                  }}
                  isChecked={status}
                  checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.THEME} />}
                  unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.TEXT_LIGHT} />}
                  rightText={'禁用'}
                  rightTextStyle={{ color: Color.TEXT_MAIN }}
                />
              </View>

            </View>

          </View>
        </ScrollView>

        {this.state.showShadow
          ? <TouchableWithoutFeedback
            onPress={() => {
              this.RegionPicker.hide()
              this.hideShadow()
            }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
          : null}
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

export default connect(mapStateToProps)(SupplierEdit)

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
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16)
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
    marginBottom: dp(20),
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
    fontSize: dp(28)

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
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingVertical: dp(30)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.34
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10)
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
  }

})
