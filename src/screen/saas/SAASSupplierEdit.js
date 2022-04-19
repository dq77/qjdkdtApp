/*
 * @Date: 2021-02-01 09:08:56
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-04 13:39:57
 */
import React, { PureComponent } from 'react'
import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Picker from 'react-native-picker'
import { connect } from 'react-redux'
import BottomFullModal from '../../component/BottomFullModal'
import NavBar from '../../component/NavBar'
import RegionPicker from '../../component/RegionPickerByAjax'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { vNumber, vPhone, vPrice } from '../../utils/reg'
import { DEVICE_WIDTH, getBottomSpace, getRealDP as dp } from '../../utils/screenUtil'
import { injectUnmount } from '../../utils/Utility'

// address: "详细地址"
// areaCode: "110101"
// cityCode: "1101"
// compantName: {id: 1, createdTime: "20210304134125", updatedTime: "20210304134129", createdBy: null, orgId: "1", …}
// contactName: "联系人"
// contactPhone: "15936982589"
// projectName: "测试项目"
// provinceCode: "11"
// showAddress: (3) ["北京市", "市辖区", "东城区"]
// tip: "备注"
@injectUnmount
class SAASSupplierEdit extends PureComponent {
  constructor(props) {
    super(props)
    const { defaultData = {} } = this.props.navigation.state.params
    this.state = {
      // customerName: '请选择',
      payType: '请选择',
      projectName: defaultData.projectName || '请选择',
      contactName: defaultData.contactName || '',
      contactPhone: defaultData.contactPhone || '',
      provinceCode: defaultData.provinceCode || '',
      compantName: defaultData.compantName || {},
      cityCode: defaultData.cityCode || '',
      areaCode: defaultData.areaCode || '',
      address: defaultData.address || '',
      showAddress: defaultData.showAddress || '',
      invoice: defaultData.invoiceData ? defaultData.invoiceData.Name : '',
      supplierYear: '',
      historyAmount: '',
      tip: defaultData.tip || '',
      pageTitle: '',
      status: false,
      showShadow: false,
      byParentList: defaultData.byParentList || [],
      byParentTwoList: [],
      people: defaultData,
    }

    this.rule = [
      {
        id: 'customerName',
        required: true,
        name: '客户',
      },
      {
        id: 'projectName',
        required: true,
        name: '项目',
      },
      {
        id: 'contactPhone',
        required: false,
        reg: vPhone,
        name: '联系人电话',
      },
      {
        id: 'supplierYear',
        required: false,
        reg: vNumber,
        regErrorMsg: '合作年限为正整数',
        name: '合作年限',
      },
      {
        id: 'historyAmount',
        required: false,
        reg: vPrice,
        name: '历史采购金额',
      },
      {
        id: 'tip',
        required: false,
        name: '备注',
      },
    ]
  }

  componentDidMount() {
    this.getByParentId()
  }

  onPressData(data) {
    this.setState({
      people: {
        ...this.state.people,
        ...data,
      },
    })
  }

  getByParentId = async (parentId = 0) => {
    const { defaultData = {} } = this.props.navigation.state.params

    const res = await ajaxStore.saas.getByParentId({ parentId })
    if (res.data && res.data.code === '0') {
      const data = res.data.data || []
      console.log(data)
      data.forEach(element => {
        let a = 1
        defaultData.byParentList &&
          defaultData.byParentList.forEach(element1 => {
            if (element.id === element1.id) {
              a = 2
              element.selectItem = element1.selectItem
            }
          })
        if (a === 1) {
          element.selectItem = {}
        }
      })
      this.setState({
        byParentList: data,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  getByParentTwoId = async (parentId, key, selectItemTitle, title) => {
    const res = await ajaxStore.saas.getByParentId({ parentId })
    if (res.data && res.data.code === '0') {
      await this.setState({
        byParentTwoList: res.data.data || [],
      })
      if (res.data.data && res.data.data.length > 0) {
        this.showSupplierPicker(res.data.data || [], '1', key, selectItemTitle, title)
      } else {
        global.alert.show({
          content: '配置错误',
        })
      }
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  changeHistoryAmount = text => {
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

  showSupplierPicker = (arrayData, type, index, selectItemTitle, title) => {
    // const { categoryName, categorySmallName, categoryCode, itemFlieType, itemType, itemFiles } = this.state
    let array = []
    if (type === '1') {
      array = arrayData.map((item, index) => {
        return item.title
      })
    }
    Picker.init({
      pickerData: array,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: type === '1' ? `请选择${title}` : '请选择',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: type === '1' ? [selectItemTitle] : [''],
      onPickerConfirm: async (pickedValue, pickedIndex) => {
        if (type === '1') {
          const byParentList = this.state.byParentList
          byParentList[index].selectItem = arrayData[pickedIndex]
          // 项目类型
          this.setState({
            byParentList,
          })
          this.onPressData({
            byParentList,
          })
          console.log(byParentList, 'byParentListbyParentList')
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

  searchCompany = name => {
    console.log(name)
    name = name.trim()
    if (name.length < 1) return
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      const res = await ajaxStore.company.getProjectList({
        name,
      })
      if (res && res.data && res.data.code === '0') {
        this.setState({
          companyList: res.data.data || [],
        })
      }
    }, 500)
  }

  projectSelect() {
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
  }

  renderModal = () => {
    return (
      <BottomFullModal
        // pageHeight={DEVICE_HEIGHT * 0.5}
        ref={ref => {
          this.modal = ref
        }}
        title={'选择项目方'}
        confirm={'确定'}
        isAutoClose={false}
        submit={() => {
          this.projectSelect()
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
            onChangeText={text => {
              this.searchCompany(text)
            }}
          />
          {/* <Text style={{ fontSize: dp(26), color: '#b0b0b0', margin: dp(20) }}>最少输入两个字</Text> */}
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
                          projectName: data.name,
                        })
                        this.onPressData({
                          compantName: data,
                          projectName: data.name,
                        })
                      }}
                    >
                      <View>
                        <View style={styles.companyItem}>
                          <Text style={{ fontSize: dp(28), flex: 1 }}>{data.name}</Text>
                          {this.state.projectName === data.name && (
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

  searchInvoice = name => {
    console.log(name)
    name = name.trim()
    // if (name.length < 2) return

    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      const res = await ajaxStore.company.qccQymh({
        name,
      })
      if (res && res.data && res.data.code === '0') {
        this.setState({
          invoiceList: res.data.data.list || [],
        })
      }
    }, 500)
  }

  invoiceSelect() {
    if (!this.state.invoice) {
      global.alert.show({
        content: '请选择开票信息',
      })
      return
    }
    this.setState({
      invoice: this.state.invoice,
    })
    this.modalInvoice.cancel()
  }

  orderCreatInfo() {
    if (!this.state.people.projectName) {
      global.alert.show({
        content: '请选择项目',
      })
      return
    }
    const byParentList = this.state.people.byParentList || []
    let isUse = '1'
    for (let index = 0; index < byParentList.length; index++) {
      const element = byParentList[index]
      if (!element.selectItem.title) {
        global.alert.show({
          content: `请选择${element.title}`,
        })
        isUse = '2'
        break
      }
    }
    if (isUse === '2') {
      return
    }
    if (!this.state.people.areaCode) {
      global.alert.show({
        content: '请选择地址',
      })
      return
    }
    if (!this.state.people.address) {
      global.alert.show({
        content: '请输入具体地址',
      })
      return
    }
    if (!this.state.people.contactName) {
      global.alert.show({
        content: '请输入联系人',
      })
      return
    }
    if (!this.state.people.contactPhone || this.state.people.contactPhone.length !== 11) {
      global.alert.show({
        content: '请输入正确的联系电话',
      })
      return
    }
    if (!this.state.people.contactPhone) {
      global.alert.show({
        content: '请输入联系电话',
      })
      return
    }
    if (!this.state.invoice) {
      global.alert.show({
        content: '请选择开票信息',
      })
      return
    }
    this.props.navigation.navigate('SAASOrderCreat', { people: this.state.people })
  }

  renderModalInvoice = () => {
    const { defaultData = {} } = this.props.navigation.state.params
    return (
      <BottomFullModal
        // pageHeight={defaultData.projectName ? DEVICE_HEIGHT * 0.5 : DEVICE_HEIGHT * 0.5}
        ref={ref => {
          this.modalInvoice = ref
        }}
        title={'选择开票信息'}
        confirm={'确定'}
        isAutoClose={false}
        submit={() => {
          this.invoiceSelect()
        }}
      >
        <View
          style={{
            margin: dp(30),
          }}
        >
          <TextInput
            placeholder={'请输入开票信息'}
            placeholderTextColor={'#D8DDE2'}
            style={styles.input}
            onChangeText={text => {
              this.searchInvoice(text)
            }}
          />
          {/* <Text style={{ fontSize: dp(26), color: '#b0b0b0', margin: dp(20) }}>最少输入两个字</Text> */}
          <ScrollView keyboardShouldPersistTaps="handled" style={{ marginBottom: dp(360) }}>
            <View>
              {this.state.invoiceList &&
                this.state.invoiceList.map((data, index) => {
                  return (
                    <Touchable
                      key={index}
                      isPreventDouble={false}
                      onPress={() => {
                        this.setState({
                          invoiceData: data,
                          invoice: data.Name,
                        })
                        this.onPressData({
                          invoiceData: data,
                          invoice: data.Name,
                        })
                      }}
                    >
                      <View>
                        <View style={styles.companyItem}>
                          <Text style={{ fontSize: dp(28), flex: 1 }}>{data.Name}</Text>
                          {this.state.invoice === data.Name && (
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
      customerName,
      projectName,
      contactName,
      contactPhone,
      showAddress,
      address,
      payType,
      tip,
      invoice,
    } = this.state
    const { type = '' } = this.props.navigation.state.params

    return (
      <View style={styles.container}>
        <NavBar
          title={type === '1' ? '填写基本信息' : '修改基本信息'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={''}
          rightText={type === '1' ? '下一步' : '确定'}
          onRightPress={() => {
            if (type === '1') {
              this.orderCreatInfo()
            } else {
              if (navigation.state.params.clickModifyData) {
                navigation.state.params.clickModifyData(this.state.people)
              }
              this.props.navigation.goBack()
            }
          }}
        />
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.blockMain}>
              {/* 项目 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>项目</Text>
                {type === '2' && (
                  <Iconfont style={[{ marginRight: dp(10), marginLeft: dp(16) }]} name={'jinggao'} size={dp(28)} />
                )}
                {type === '2' && <Text style={[styles.name, { color: '#EDA22C' }]}>修改后，已添加的产品将清空</Text>}
              </View>
              <Touchable
                style={styles.select}
                onPress={() => {
                  this.modal.show()
                }}
              >
                <Text
                  style={[styles.selectText, projectName.toString().indexOf('请选择') > -1 ? styles.placeholder : '']}
                >
                  {projectName}
                </Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
              {/* 付款方式 */}
              {this.state.byParentList
                ? this.state.byParentList.map((item, key) => {
                    return (
                      <View key={key}>
                        <View style={styles.titleRow}>
                          <Text style={{ color: 'red' }}>* </Text>
                          <Text style={styles.name}>{item.title}</Text>
                        </View>
                        <Touchable
                          style={styles.select}
                          onPress={() => {
                            this.getByParentTwoId(item.id, key, item.selectItem.title || '', item.title || '')
                          }}
                        >
                          <Text style={[styles.selectText, !item.selectItem.title ? styles.placeholder : '']}>
                            {!item.selectItem.title ? '请选择' : item.selectItem.title}
                          </Text>
                          <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
                        </Touchable>
                      </View>
                    )
                  })
                : null}

              {/* 地址 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>地址</Text>
              </View>
              <View style={[styles.input, styles.picker]}>
                <RegionPicker
                  ref={o => {
                    this.RegionPicker = o
                  }}
                  style={{ marginVertical: dp(2) }}
                  fontSize={28}
                  hint={'请选择省市区'}
                  monitorChange={true}
                  selectedValue={showAddress}
                  onPickerConfirm={data => {
                    this.setState({
                      provinceCode: data.provinceCode,
                      cityCode: data.cityCode,
                      areaCode: data.areaCode,
                      showAddress: data.label.split(' '),
                    })
                    this.onPressData({
                      provinceCode: data.provinceCode,
                      cityCode: data.cityCode,
                      areaCode: data.areaCode,
                      showAddress: data.label.split(' '),
                    })
                  }}
                  onOpen={() => {
                    this.showShadow()
                  }}
                  onClose={() => {
                    this.hideShadow()
                  }}
                />
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </View>
              {/* 联系人详细地址 */}
              {/* <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>联系人详细地址</Text>
              </View> */}
              <TextInput
                placeholder={'请输入具体地址'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={address}
                maxLength={200}
                onChangeText={text => {
                  this.setState({ address: text })
                  this.onPressData({
                    address: text,
                  })
                }}
              />
              {/* 联系人 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
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
                  this.onPressData({
                    contactName: text,
                  })
                }}
              />
              {/* 联系电话 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>联系电话</Text>
              </View>
              <TextInput
                placeholder={'请输入联系电话'}
                placeholderTextColor={'#D8DDE2'}
                style={styles.input}
                value={contactPhone}
                keyboardType={'number-pad'}
                maxLength={11}
                onChangeText={text => {
                  this.setState({ contactPhone: text.replace(/[^\d]+/, '') })
                  this.onPressData({
                    contactPhone: text,
                  })
                }}
              />
              {/* 开票单位 */}
              <View style={styles.titleRow}>
                <Text style={{ color: 'red' }}>* </Text>
                <Text style={styles.name}>开票信息</Text>
              </View>
              <Touchable
                style={styles.select}
                onPress={() => {
                  this.setState({
                    invoiceList: [],
                  })
                  this.modalInvoice.show()
                }}
              >
                <Text style={[styles.selectText, !invoice ? styles.placeholder : '']}>{invoice || '请选择'}</Text>
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(24)} />
              </Touchable>
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
                  this.onPressData({
                    tip: text,
                  })
                }}
              />
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
        {this.renderModal()}
        {this.renderModalInvoice()}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId,
    saasInfo: state.user.saas,
  }
}

export default connect(mapStateToProps)(SAASSupplierEdit)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'stretch',
    marginBottom: dp(30) + getBottomSpace(),
  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    marginHorizontal: dp(30),
    borderRadius: dp(16),
  },
  name: {},
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    padding: dp(30),
    height: dp(100),
  },
  selectText: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  picker: {
    marginBottom: dp(20),
    paddingHorizontal: dp(15),
    paddingVertical: dp(10),
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: dp(16),
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    paddingHorizontal: dp(30),
    height: dp(100),
    fontSize: dp(28),
  },
  arrow: {
    transform: [{ rotateZ: '90deg' }],
  },
  save: {
    flex: 1,
    borderRadius: dp(48),
    marginHorizontal: dp(30),
    marginTop: dp(96),
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
  placeholder: {
    color: '#A7ADB0',
  },
  checkboxWrapper: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingVertical: dp(30),
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.34,
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
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
    color: '#464678',
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
