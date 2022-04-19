import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  findNodeHandle,
  UIManager
} from 'react-native'
import ComfirmModal from '../../component/ComfirmModal'
import Iconfont from '../../iconfont/Icon'
import NavBar from '../../component/NavBar'
import globalStyles from '../../styles/globalStyles'
import CustomerService from '../../component/CustomerService'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, injectUnmount } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'
import { connect } from 'react-redux'
import Touchable from '../../component/Touchable'
import { SolidBtn } from '../../component/CommonButton'
import { callPhone } from '../../utils/PhoneUtils'

/**
 * AddSupplier
 */
@injectUnmount
export default class AddSupplier extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      showEmpty: false,
      isSearch: false,
      isShowClear: false,
      searchData: [],
      saveData: [],
      source: '',
      keyboardShow: false
    }
  }

  componentDidMount () {
    const source = this.props.navigation.state.params ? this.props.navigation.state.params.source : ''
    this.setState({
      source
    })
    this.getSupplier()
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = () => {

  }

  keyboardDidHide = () => {
    this.input.blur()
    this.setState({ keyboardShow: false })
  }

  render () {
    const { navigation } = this.props
    const params = navigation.state.params
    // 判断state里面是否有certificationFailReturnRoot
    const certificationFailReturnRoot = params && params.certificationFailReturnRoot
    const { source } = this.state
    return (
      <View style={styles.container}>
        <NavBar isReturnRoot = {certificationFailReturnRoot === '1' ? '1' : ''} title={source !== 'ContractList' ? '还有3步获得额度' : '添加一级经销商'} navigation={navigation} />
        <View style={styles.content}>
          <ScrollView style={{ width: DEVICE_WIDTH }} keyboardShouldPersistTaps="handled" ref={(view) => { this.myScrollView = view }}>
            <View>
              {source !== 'ContractList' &&
                <View>
                  <Text ref={view => { this.title = view }} style={styles.title}>添加您合作的销售方</Text>
                  {(this.state.saveData && this.state.saveData.length > 0) ? (
                    <FlatList
                      ref={view => { this.list = view }}
                      data={this.state.saveData}
                      renderItem={data => this.renderAddItem(data)}
                      keyExtractor={item => '' + item.supplierId}
                    />) : (
                    <Text style={styles.title2}>在下方搜索框内输入销售方名称关键字即可查找</Text>
                  )}
                </View>
              }
              <View
                style={styles.searchContainer}>
                <TouchableWithoutFeedback
                  style={{ flex: 1 }}
                  onPress={this.startSearch}>
                  <View
                    style={styles.searchView}>
                    <Iconfont
                      name={'sousuo'}
                      size={dp(26)}
                      style={{ marginLeft: dp(10), marginRight: dp(10) }} />
                    <TextInput
                      ref={view => { this.input = view }}
                      placeholder={source !== 'ContractList' ? '搜索销售方' : '输入一级经销商名称'}
                      placeholderTextColor={Color.TEXT_LIGHT}
                      style={[styles.input, { flex: this.state.isSearch ? 1 : 0 }]}
                      onChangeText={text => {
                        if (text) {
                          this.searchSupplier(text)
                          this.setState({ isShowClear: true })
                        } else {
                          this.setState({ isShowClear: false })
                        }
                      }}
                      onFocus={() => { this.onFocus() }}
                      onBlur={() => { this.onBlur() }}
                    />

                    {this.state.isShowClear
                      ? <Iconfont name={'icon-del-fork'} size={dp(40)}
                        onPress={() => {
                          this.input.clear()
                          this.setState({ isShowClear: false, searchData: [], showEmpty: false })
                        }} style={{ marginRight: dp(15) }} /> : null}
                  </View>
                </TouchableWithoutFeedback>
                {this.state.isSearch
                  ? <Text style={styles.cancel}
                    onPress={() => {
                      this.cancelSearch()
                    }}>取消</Text> : null}

              </View>

              {
                !this.state.showEmpty
                  ? <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={this.state.searchData}
                    renderItem={data => this.renderItem(data)}
                    keyExtractor={item => '' + item.id}
                  />
                  : <View style={{ alignItems: 'center', paddingVertical: dp(70) }}>
                    {source !== 'ContractList' ? (
                      <Text>找不到销售方，联系客服</Text>
                    ) : (
                      <Text>找不到一级经销商，联系客服</Text>
                    )}
                    <Text><Text style={{ color: Color.GREEN_BTN }} onPress={() => { callPhone(4006121666) }}>400-612-1666</Text>（全年 9:00-21:00）</Text>
                  </View>
              }
              {/* <View style={{ height: DEVICE_HEIGHT }}></View> */}
            </View>
          </ScrollView>
          {(source !== 'ContractList' && !this.state.keyboardShow) &&
            <SolidBtn text='下一步，选择业务类型'
              style={styles.submit}
              disabled={!this.state.saveData || this.state.saveData.length === 0}
              onPress={this.submitSupplier} />
          }
          {(source !== 'ContractList' && !this.state.keyboardShow) &&
            <CustomerService style={{ marginBottom: dp(30), marginTop: dp(0) }} navigation={navigation} />
          }
        </View>
      </View >
    )
  }

  renderItem (data) {
    return (
      <View>
        <View style={styles.item}>
          <Text style={styles.itemText}>{data.item.name}</Text>
          <Touchable onPress={() => this.addSupplier(data.item)}>
            <Text style={styles.addBtn} >添加</Text>
          </Touchable>
        </View>
        <View style={[globalStyles.splitLine]} />
      </View>)
  }

  renderAddItem (data) {
    return (
      <View>
        <View style={styles.item}>
          <Text style={styles.itemText}>{data.item.supplierName}</Text>
          <Touchable onPress={() => this.deleteSupplier(data.item)}>
            <Iconfont name={'icon-del'} size={dp(45)} style={{ paddingVertical: dp(35) }} />
          </Touchable>
          {/* <Iconfont name={'icon-del-fork'} size={dp(80)} style={{ marginTop: dp(0) }} /> */}
        </View>
        <View style={[globalStyles.splitLine]} />
      </View>)
  }

  // renderPhoneModal () {
  //   return (<ComfirmModal
  //     title={'是否拨打电话'}
  //     content={'400-612-1666'}
  //     cancelText={'取消'}
  //     comfirmText={'确定'}
  //     cancel={ () => {
  //       this.setState({ phoneModal: false })
  //     }}
  //     confirm={async () => {
  //       this.setState({ phoneModal: false })
  //       callPhone(4006121666)
  //     }}
  //     infoModal={this.state.phoneModal} />)
  // }

  onFocus = () => {
    this.setState({
      isSearch: true,
      keyboardShow: true
    })
    // this.clickToScroll()
  }

  onBlur = () => {
    this.setState({
      keyboardShow: false
    })
    this.myScrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  clickToScroll = () => {
    let distence = 0
    UIManager.measure(findNodeHandle(this.title), (x, y, width, height, pageX, pageY) => {
      distence += height
      // console.log(height)
      UIManager.measure(findNodeHandle(this.list), (x, y, width, height, pageX, pageY) => {
        // console.log('相对父视图位置x:', x)
        // console.log('相对父视图位置y:', y)
        // console.log('组件宽度width:', width)
        // console.log('组件高度height:', height)
        // console.log('距离屏幕的绝对位置x:', pageX)
        // console.log('距离屏幕的绝对位置y:', pageY)
        distence += height
        // console.log(height)
        this.myScrollView.scrollTo({ x: 0, y: distence, animated: true })
      })
    })
  }

  startSearch = () => {
    this.setState({ isSearch: true })
    this.input.focus()
  }

  cancelSearch = () => {
    this.input.blur()
    this.input.clear()
    this.setState({ isSearch: false, isShowClear: false, searchData: [], showEmpty: false })
  }

  searchSupplier = async (corpName) => {
    const res = await ajaxStore.credit.searchSupplier({ corpName, type: this.state.source !== 'ContractList' ? 1 : 2 })
    // console.log(res)
    if (res.data && res.data.code === '0' && res.data.data.length !== 0) {
      this.setState({
        searchData: res.data.data,
        showEmpty: false
      })
    } else {
      this.setState({
        showEmpty: true
      })
    }
  }

  getSupplier = async () => {
    const res = await ajaxStore.credit.getSupplier()
    if (res.data && res.data.code === '0' && res.data.data.length !== 0) {
      this.setState({
        saveData: res.data.data
      })
    }
  }

  addSupplier = async (data) => {
    const hasAdded = this.state.saveData.filter((item) => item.supplierId ===
      data.relSupplierCategoryBrandVOS[0].supplierId)

    if (hasAdded && hasAdded.length > 0) {
      global.alert.show({
        content: '该经销商已存在，请勿重复添加'
      })
    } else {
      let array = []
      data = {
        supplierId: data.id,
        supplierName: data.name,
        categoryCode: data.relSupplierCategoryBrandVOS[0].categoryCode,
        plantType: data.plantType,
        currentAdded: true
      }
      array = this.state.saveData.concat(data)
      await this.setState({ saveData: array })
      if (this.state.source === 'ContractList') {
        this.submitSupplier()
      }
    }
  }

  deleteSupplier = async (data) => {
    const delSupplier = () => {
      const addedSuppliers = this.state.saveData.filter((item) => item.supplierId !== data.supplierId)
      this.setState({ saveData: addedSuppliers })
    }
    if (data.currentAdded) {
      delSupplier()
    } else {
      const json = [{ categoryCode: data.categoryCode, supplierId: data.supplierId, supplierName: data.supplierName, appId: data.appId }]
      const res = await ajaxStore.credit.deleteSupplier({ jsonStr: JSON.stringify(json) })

      if (res.data && res.data.code === '0') {
        delSupplier()
      }
    }
  }

  submitSupplier = async () => {
    const saveData = this.state.saveData
    const hasCurrentAdded = saveData.filter((item) => item.currentAdded)
    if (hasCurrentAdded && hasCurrentAdded.length > 0) {
      const data = []
      hasCurrentAdded.forEach((item) => {
        data.push({
          categoryCode: item.categoryCode,
          supplierId: item.supplierId,
          supplierName: item.name
        })
      })
      const res = await ajaxStore.credit.addSupplier({ jsonStr: JSON.stringify(data) })
      if (res.data && res.data.code === '0') {
        // showToast('提交成功')
        if (this.state.source !== 'ContractList') {
          this.props.navigation.navigate('BusinessTypeSelect')
        } else {
          this.props.navigation.state.params.refresh()
          this.props.navigation.goBack()
        }
      }
    } else {
      // showToast('提交成功')
      this.props.navigation.navigate('BusinessTypeSelect')
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    color: Color.TEXT_MAIN,
    fontSize: dp(35),
    fontWeight: 'bold',
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(30)
  },
  title2: {
    paddingLeft: dp(30),
    color: Color.TEXT_LIGHT,
    fontSize: dp(28),
    marginBottom: dp(20)
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dp(30),
    paddingVertical: dp(19)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dddddd',
    borderWidth: dp(2),
    backgroundColor: '#eeeeee'
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: dp(25),
    marginVertical: dp(20),
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancel: {
    paddingRight: dp(20),
    fontWeight: 'bold',
    fontSize: dp(32),
    color: Color.GREEN_BTN
  },
  addBtn: {
    backgroundColor: '#66bfb7',
    borderRadius: dp(8),
    color: 'white',
    paddingVertical: dp(10),
    paddingHorizontal: dp(25)
  },
  itemText: {
    flex: 1,
    fontSize: dp(30)
  },
  content: {
    flex: 1,
    alignItems: 'center'
  },
  submit: {
    marginTop: dp(10),
    marginBottom: dp(30)

  },
  input: {
    backgroundColor: 'white',
    height: dp(70),
    marginRight: dp(10),
    flex: 1,
    fontSize: dp(26),
    padding: 0
  }

})
