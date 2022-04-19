import React, { PureComponent } from 'react'
import { ScrollView, StyleSheet, Text, View, FlatList } from 'react-native'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast, formValid, assign } from '../../utils/Utility'
import Touchable from '../../component/Touchable'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import CustomerService from '../../component/CustomerService'
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import Iconfont from '../../iconfont/Icon'
import StorageUtil from '../../utils/storageUtil'
import moment from 'moment'
import { setCreditSummary, setMarryStatus, setHasAuthed, setOtherInfo } from '../../actions'
import ComfirmModal from '../../component/ComfirmModal'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import { StackActions, NavigationActions } from 'react-navigation'
import { onEvent } from '../../utils/AnalyticsUtil'
import { autoLogin } from '../../utils/UserUtils'
class CreditSummaryScreen extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      done: 0,
      all: 0,
      redioButtonItems: [
        {
          value: '1',
          label: '未婚',
          item: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '14'],
          required: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            true,
            true,
            true
          ]
        },
        {
          value: '2',
          label: '已婚',
          item: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14'
          ],
          required: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            true,
            false,
            false,
            true,
            true
          ]
        },
        {
          value: '3',
          label: '离异',
          item: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '14'
          ],
          required: [
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            true,
            true,
            true,
            true
          ]
        }
      ],
      marryStatus: '',
      allItems: [],
      currentItems: [],
      hasAuthed: false,
      otherInfo: {},
      requestDone: 0,
      infoModal: false
    }
    this.selectMarryStatus = this.selectMarryStatus.bind(this)
    this.toUpload = this.toUpload.bind(this)
    this.apply = this.apply.bind(this)
    this.creditApply = this.creditApply.bind(this)
    this.valid = this.valid.bind(this)
  }

  async selectMarryStatus (index, value) {
    await this.setState({
      marryStatus: value
    })
    await setMarryStatus({
      marryStatus: value
    })
    this.setCurrentItems()
  }

  async initAllItems (data) {
    const allItems = this.state.allItems
    allItems.map((item, i) => {
      allItems[i].count = 0
      allItems[i].authFileId = []
      data.map((item2, j) => {
        if (
          item.cateCode &&
          item.cateCode.indexOf(item2.cateCode) > -1 &&
          allItems[i].authFileId.indexOf(item2.id) === -1
        ) {
          allItems[i].authFileId.push(item2.id)
          allItems[i].count += item2.count
        }
      })
    })
    await this.setState({
      allItems
    })
    await setCreditSummary({
      allItems
    })
    this.setCurrentItems()
  }

  setCurrentItems () {
    const allItems = this.state.allItems
    const otherInfo = this.state.otherInfo
    let done = 0
    let all = 0
    let key
    const currentItems = []
    this.state.redioButtonItems.map((item) => {
      if (item.value === this.state.marryStatus) {
        all = item.item.length
        allItems.map((item2, key) => {
          if (item.item.indexOf(item2.id) > -1 && item2.count) {
            done++
          }
          if (item.item.indexOf(item2.id) > -1) {
            key = item.item.indexOf(item2.id)
            item2.isRequired = item.required[key]
            currentItems.push(item2)
          }
        })
      }
    })
    if (otherInfo.holderPhone) {
      done++
    }
    this.setState({
      all,
      done,
      currentItems
    })
  }

  async getAllCreditInfo () {
    const res = await ajaxStore.credit.getAllCreditInfo()
    if (res.data && res.data.code === '0') {
      this.initAllItems(res.data.data)
    }
  }

  async getAuthStatus () {
    const res = await ajaxStore.credit.getAuthStatus()
    if (res.data && res.data.code === '0') {
      this.setState({
        hasAuthed: res.data.data
      })
      setHasAuthed({
        hasAuthed: res.data.data
      })
    }
  }

  async getOtherInfo (isSetMarryStatus) {
    const res = await ajaxStore.credit.getOtherInfo()
    if (res.data && res.data.code === '0') {
      console.log(res.data.data.maritalStatus, '==========>maritalStatus')
      const maritalStatus = res.data.data.maritalStatus
        ? res.data.data.maritalStatus.toString()
        : '2'
      this.setState({ otherInfo: res.data.data })
      setOtherInfo({
        otherInfo: res.data.data
      })
      isSetMarryStatus &&
        setMarryStatus({
          marryStatus: maritalStatus
        }) &&
        this.setState({
          marryStatus: maritalStatus
        })
    }
  }

  async creditApply () {
    const creditStatus = this.props.creditStatus
    const data =
      creditStatus === 'REJECT' ? {} : { maritalStatus: this.state.marryStatus }
    const res = await ajaxStore.credit.creditApply(data)
    if (res.data && res.data.code === '0') {
      onEvent('发起授信', 'CreditSummary', '/ofs/weixin/creditApply/creditApplication', {
        creditType: '', // 授信类型
        creditBusiness: '', // 授信业务
        creditNo: res.data.data.processId // 授信编号
      })
      StorageUtil.save(
        'creditSubmitTime',
        moment().format('YYYY-MM-DD HH:mm:ss')
      )
      setMarryStatus({
        marryStatus: this.state.marryStatus || '2'
      })
      autoLogin()
      const statusMap = {
        REJECT: 'CreditFail',
        PROCESS: 'Crediting',
        DONE: 'MainTabs',
        INVALID: 'MainTabs'
      }
      const page =
        (res.data.data && statusMap[res.data.data.status]) || 'MainTabs'
      this.props.navigation.navigate(page)
    }
  }

  async componentDidMount () {
    const { allItems, marryStatus, hasAuthed } = this.props
    await this.setState({
      allItems,
      marryStatus,
      hasAuthed
    })
    this.setCurrentItems()
    this.getAllCreditInfo()
    // this.getAuthStatus()
    this.getOtherInfo(true)
  }

  toUpload (item) {
    const { url, id } = item
    const { navigation } = this.props

    navigation.navigate(url, {
      creditItem: item,
      refresh: () => {
        setTimeout(() => {
          this.getAllCreditInfo()
          if (id === '14') {
            this.getOtherInfo()
          }
        }, 500)
      }
    })
  }

  valid () {
    const allItems = this.props.allItems
    const otherInfo = this.props.otherInfo
    let validItems = []
    this.state.redioButtonItems.map((item, index) => {
      if (this.state.marryStatus === item.value) {
        validItems = item.item
      }
    })
    let result = true
    let msg = ''

    allItems.map((item, index) => {
      if (
        validItems.indexOf(item.id) > -1 &&
        item.isRequired &&
        !item.count &&
        item.id !== '14'
      ) {
        result = false
        msg = msg || `请上传${item.name}`
      }
    })

    if (!otherInfo.holderPhone) {
      result = false
      msg = msg || '请填写其他资料信息'
    }
    return {
      result,
      msg
    }
  }

  apply () {
    const creditStatus = this.props.creditStatus
    const valid = this.valid()
    if (valid.result || creditStatus === 'REJECT') {
      this.setState({ infoModal: true })
    } else {
      global.alert.show({
        content: valid.msg
      })
    }
  }

  render () {
    const { navigation, userInfo, creditStatus } = this.props
    return (
      <View style={styles.container}>
        {creditStatus === 'REJECT' ? (
          <NavBar title={'重新上传授信额度申请资料'} navigation={navigation} />
        ) : (
          <NavBar title={'还有1步获得额度'} navigation={navigation} />
        )}
        {creditStatus === 'REJECT' ? (
          <View style={styles.pageMain}>
            <FlatList
              ListHeaderComponent={this.renderRejectHeader()}
              data={this.state.currentItems}
              renderItem={(data) => this.renderItem(data.item, data.index)}
              ListFooterComponent={this.renderRejectFooter()}
            />
          </View>
        ) : (
          <View style={styles.pageMain}>
            <FlatList
              ListHeaderComponent={this.renderHeader()}
              data={this.state.currentItems}
              renderItem={(data) => this.renderItem(data.item, data.index)}
              ListFooterComponent={this.renderFooter()}
            />
          </View>
        )}

        <ComfirmModal
          title={'是否确认提交？'}
          content={'授信额度申请审核中资料不可修改，请确认无误后提交。'}
          cancelText={'取消'}
          comfirmText={'确认'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.creditApply()
          }}
          infoModal={this.state.infoModal}
        />
      </View>
    )
  }

  renderRejectHeader () {
    const { failReason } = this.props
    return (
      <View style={styles.rejectContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'授信额度申请资料清单'}</Text>
        </View>
        <Text style={styles.reason}>{`审核未通过原因：${failReason}`}</Text>
      </View>
    )
  }

  renderHeader () {
    return (
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{'授信额度申请资料清单'}</Text>
          {this.state.all ? (
            <Text
              style={
                styles.headerProcess
              }>{`已完成进度${this.state.done}/${this.state.all}`}</Text>
          ) : (
            <Text></Text>
          )}
        </View>
        <Text style={[styles.requireText, { lineHeight: dp(40) }]}>
          请按要求上传照片，我们将在您提交审核之后3个工作日内完成审核。
        </Text>
        <View style={styles.marryInfo}>
          <Text style={styles.marryText}>请选择您的婚姻状况以确定所需资料</Text>
          <RadioGroup
            style={styles.reaioGroup}
            size={dp(32)}
            thickness={1}
            color={Color.WX_GREEN}
            selectedIndex={parseInt(this.state.marryStatus) - 1}
            onSelect={(index, value) => this.selectMarryStatus(index, value)}>
            {this.state.redioButtonItems.map((item, index) => {
              return (
                <RadioButton
                  style={styles.radioButton}
                  value={item.value}
                  key={item.value}>
                  <Text style={styles.reaioText}>{item.label}</Text>
                </RadioButton>
              )
            })}
          </RadioGroup>
        </View>
      </View>
    )
  }

  renderItem (item, index) {
    const { otherInfo, creditStatus } = this.props
    return (
      <Touchable isNativeFeedback={true} onPress={() => this.toUpload(item)}>
        <View style={styles.itemWarp} key={item.id}>
          <Text style={styles.itemNameWarp}>
            <Text style={styles.itemName}>{`${index + 1}.${item.name}`}</Text>
            {creditStatus === 'REJECT' || item.isRequired ? (
              <Text></Text>
            ) : (
              <Text style={styles.noRequired}>（非必填）</Text>
            )}
          </Text>
          {item.id !== '14' ? (
            item.count ? (
              <Text style={styles.itemUploaded}>{`已上传${item.count}张`}</Text>
            ) : (
              <Text style={styles.itemNoUploaded}>{'未上传'}</Text>
            )
          ) : otherInfo.holderPhone ? (
            <Text style={styles.itemUploaded}>{item.successMsg}</Text>
          ) : (
            <Text style={styles.itemNoUploaded}>{item.failMsg}</Text>
          )}

          <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
        </View>
      </Touchable>
    )
  }

  renderRejectFooter () {
    const { navigation, userInfo, themeColor } = this.props
    return (
      <View style={styles.footer}>
        <View style={styles.btnWarp}>
          <Touchable
            style={{
              ...styles.submitBtn,
              ...styles.singleBtn,
              borderColor: themeColor,
              backgroundColor: themeColor
            }}
            onPress={this.apply}>
            <Text style={styles.submitBtnText}>{'提交审核'}</Text>
          </Touchable>
        </View>
        <CustomerService navigation={navigation} name={userInfo.userName} />
      </View>
    )
  }

  renderFooter () {
    const { navigation, userInfo, themeColor } = this.props
    return (
      <View style={styles.footer}>
        <View style={styles.btnWarp}>
          <StrokeBtn
            text={'返回上一步'}
            style={styles.gobackBtn}
            onPress={() => {
              const resetAction =
                navigation.state.params &&
                navigation.state.params.source === 'Home'
                  ? {
                    index: 2,
                    actions: [
                      NavigationActions.navigate({ routeName: 'Home' }),
                      NavigationActions.navigate({ routeName: 'AddSupplier' })
                    ]
                  }
                  : {
                    index: 2,
                    actions: [
                      NavigationActions.navigate({ routeName: 'Login' }),
                      NavigationActions.navigate({ routeName: 'AddSupplier' })
                    ]
                  }
              resetAction.actions.push(
                NavigationActions.navigate({
                  routeName: 'BusinessTypeSelect'
                })
              )
              this.props.navigation.dispatch(StackActions.reset(resetAction))
            }}
          />
          {this.valid().result || this.state.creditStatus === 'REJECT' ? (
            <SolidBtn
              text={'提交审核'}
              style={{ ...styles.submitBtn }}
              onPress={this.apply}
            />
          ) : (
            <SolidBtn
              text={'提交审核'}
              style={{ ...styles.submitBtn, ...styles.disabled }}
              onPress={this.apply}
            />
          )}
        </View>
        <CustomerService navigation={navigation} name={userInfo.userName} />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  pageMain: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: Color.WHITE
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: dp(70)
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: dp(70)
  },
  header: {
    width: DEVICE_WIDTH * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: dp(36)
  },
  headerProcess: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(26)
  },
  requireText: {
    width: DEVICE_WIDTH * 0.9,
    color: Color.TEXT_LIGHT,
    fontSize: dp(30),
    marginTop: dp(30)
  },
  marryInfo: {
    textAlign: 'left',
    width: DEVICE_WIDTH,
    padding: dp(40),
    marginTop: dp(30),
    backgroundColor: Color.GUIDE_BG,
    borderTopWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  marryText: {
    fontSize: dp(30)
  },
  reaioGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: dp(30)
  },
  radioButton: {
    width: DEVICE_WIDTH * 0.33,
    alignItems: 'center'
  },
  reaioText: {
    fontSize: dp(30)
  },
  itemWarp: {
    width: DEVICE_WIDTH,
    padding: dp(40),
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  itemNameWarp: {
    marginBottom: dp(30)
  },
  itemName: {
    fontSize: dp(30)
  },
  noRequired: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT
  },
  itemNoUploaded: {
    fontSize: dp(26),
    padding: dp(10),
    paddingHorizontal: dp(15),
    backgroundColor: '#C9C9C9',
    borderRadius: dp(10),
    color: Color.WHITE
  },
  itemUploaded: {
    fontSize: dp(26),
    padding: dp(10),
    paddingHorizontal: dp(15),
    backgroundColor: '#3DC2B8',
    borderRadius: dp(10),
    color: Color.WHITE
  },
  arrow: {
    position: 'absolute',
    right: dp(30),
    top: dp(100)
  },
  btnWarp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dp(50)
  },
  gobackBtn: {
    height: dp(100),
    borderWidth: dp(2),
    borderRadius: dp(10),
    flex: 1,
    justifyContent: 'center',
    marginLeft: dp(30),
    marginRight: dp(15)
  },
  gobackBtnText: {
    textAlign: 'center',
    fontSize: dp(32)
  },
  submitBtn: {
    height: dp(100),
    borderWidth: dp(1),
    borderRadius: dp(10),
    flex: 1,
    justifyContent: 'center',
    marginLeft: dp(15),
    marginRight: dp(30)
  },
  disabled: {
    backgroundColor: '#9d9ead',
    borderColor: '#9d9ead'
  },
  singleBtn: {
    marginLeft: dp(30)
  },
  submitBtnText: {
    textAlign: 'center',
    color: Color.WHITE,
    fontSize: dp(32)
  },
  dialogText: {
    color: Color.TEXT_LIGHT,
    textAlign: 'center'
  },
  rejectContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: dp(70),
    marginLeft: dp(30)
  },
  reason: {
    marginTop: dp(30),
    color: Color.RED
  }
})

const mapStateToProps = (state) => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    allItems: state.credit.allItems,
    marryStatus: state.credit.marryStatus,
    hasAuthed: state.credit.hasAuthed,
    otherInfo: state.credit.otherInfo,
    creditStatus: state.credit.creditStatus,
    failReason: state.credit.failReason
  }
}

export default connect(mapStateToProps)(CreditSummaryScreen)
