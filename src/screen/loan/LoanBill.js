import React, { PureComponent } from 'react'
import {
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Picker from 'react-native-picker'
import BottomFullModal from '../../component/BottomFullModal'
import ListPageComponent from '../../component/ListPageComponent'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { createDateData, formatDate } from '../../utils/DateUtils'
import { DEVICE_HEIGHT, getRealDP as dp } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'

/**
 * 还款账单
 */
export default class LoanBill extends PureComponent {
  constructor(props) {
    super(props)
    this.loanStatus = {
      0: '审批中',
      1: '还款中',
      2: '信息系统服务费违约中',
      3: '货款违约中',
      4: '已还款',
      5: '坏账',
      DEL: '已删除',
    }
    this.data = createDateData(2010, 2040)
    this.state = {
      showShadow: false,
      interest: '', // 信息系统服务费
      remainPrincipal: '', // 最近应还货款
      compositeFee: '', // 综合服务费
      principal: '', // 总剩余货款
      sort: 'asc', // asc升序 desc降序
      form: {
        makeLoanCode: '',
        companyName: '',
        status: '',
        months: '',
        orderCode: '',
        valueStartTime: '', // 付款日
        valueEndTime: '',
        finalStartTime: '', // 货款到期日
        finalEndTime: '',
      },
    }
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      StatusBar.setBarStyle('light-content')
    })
    this.didBlurListener = this.props.navigation.addListener('didBlur', (obj) => {
      StatusBar.setBarStyle('dark-content')
    })
    this.listView.refreshData()
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.didBlurListener.remove()
  }

  parseText = (remainPrincipal, interestNeedRepay, compositeFeeNeedRepay, penalNeedRepay, status) => {
    const amount = remainPrincipal + interestNeedRepay + compositeFeeNeedRepay + penalNeedRepay
    const text = []

    if (remainPrincipal && remainPrincipal !== 0) {
      text.push('货款')
    }
    if (interestNeedRepay && interestNeedRepay !== 0) {
      text.push('信息系统服务费')
    }
    if (compositeFeeNeedRepay && compositeFeeNeedRepay !== 0) {
      text.push('综合服务费')
    }
    if (penalNeedRepay && penalNeedRepay !== 0) {
      text.push('违约金')
    }

    if (amount === 0) {
      text.push(this.loanStatus[status])
    }

    return { amount, text: text.join('/') }
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  loadData = async (pageNo, pageSize) => {
    const form = Object.assign(this.state.form, { pageNo, pageSize, sort: this.state.sort })
    const res = await ajaxStore.loan.getLoanList(form)
    if (res && res.data && res.data.code === '0') {
      return res.data.data.loanBills.pagedRecords
    } else {
      return null
    }
  }

  loadHeader = async () => {
    const res = await ajaxStore.loan.getLoanInfo()
    if (res && res.data && res.data.code === '0') {
      const { interest, principal, remainPrincipal, compositeFee } = res.data.data
      this.setState({
        interest,
        principal,
        remainPrincipal,
        compositeFee,
      })
    }
  }

  showModal = () => {
    this.modal.setModalVisible(true)
  }

  submit = async () => {
    await this.listView.refreshData()
  }

  reset = () => {
    this.setState({
      form: {
        makeLoanCode: '',
        companyName: '',
        status: '',
        months: '',
        orderCode: '',
        valueStartTime: '', // 付款日
        valueEndTime: '',
        finalStartTime: '', // 货款到期日
        finalEndTime: '',
      },
    })
  }

  format = (dataStrArr) => {
    var dataIntArr = []
    dataIntArr = dataStrArr.split('-').map(function (data) {
      return +data
    })
    return dataIntArr.join('-')
  }

  sort = async () => {
    console.log('11')
    await this.setState({
      sort: this.state.sort === 'asc' ? 'desc' : 'asc',
    })
    this.listView.refreshData()
  }

  goBatchPay = () => {
    this.props.navigation.navigate('BatchPay')
  }

  showDatePicker = (index) => {
    let date, name, title

    switch (index) {
      case 1:
        date = this.state.form.valueStartTime
        name = 'valueStartTime'
        title = '付款日起始日期'
        break
      case 2:
        date = this.state.form.valueEndTime
        name = 'valueEndTime'
        title = '付款日截止日期'
        break
      case 3:
        date = this.state.form.finalStartTime
        name = 'finalStartTime'
        title = '货款到期日起始日期'
        break
      case 4:
        date = this.state.form.finalEndTime
        name = 'finalEndTime'
        title = '货款到期日截止日期'
        break
    }

    Keyboard.dismiss()
    Picker.init({
      pickerData: this.data,
      // pickerData: DateData,
      isLoop: false,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: `请选择${title}`,
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: date ? this.format(date).split('-') : formatDate(new Date()).split('-'),
      onPickerConfirm: (pickedValue, pickedIndex) => {
        const form = {}
        form[name] = pickedValue.join('-')
        this.setState({
          form: {
            ...this.state.form,
            ...form,
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

  goPay = (item) => {
    if (item.status !== '0' && item.repayShow === 'show') {
      this.props.navigation.navigate('LoanPay', { loanCode: item.makeLoanCode, canGoDetail: true })
    } else {
      this.props.navigation.navigate('LoanDetail', { loanCode: item.makeLoanCode })
    }
  }

  renderItem = (item) => {
    const {
      remainPrincipal,
      interestNeedRepay,
      compositeFeeNeedRepay,
      penalNeedRepay,
      loanInfoEndDate,
      status,
      makeLoanCode,
    } = item.item
    const delay = status === '2' || status === '3' || status === '5'

    return (
      <Touchable isWithoutFeedback={true} onPress={() => this.goPay(item.item)}>
        <View style={styles.item}>
          <View style={styles.itemRow}>
            <Text style={delay ? styles.itemAmountRed : styles.itemAmount}>{`应还：${toAmountStr(
              this.parseText(remainPrincipal, interestNeedRepay, compositeFeeNeedRepay, penalNeedRepay, status).amount,
              2,
              true,
            )}`}</Text>
            <Text style={delay ? styles.itemStatusRed : styles.itemStatus}>{delay ? '逾期' : '正常'}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={[styles.itemText, { flex: 1 }]} numberOfLines={1} ellipsizeMode={'tail'}>
              {this.parseText(remainPrincipal, interestNeedRepay, compositeFeeNeedRepay, penalNeedRepay, status).text}
            </Text>
            <Text style={styles.itemText}>{loanInfoEndDate}</Text>
          </View>
        </View>
      </Touchable>
    )
  }

  renderHeader = () => {
    return (
      <View>
        <View style={styles.bg} />
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>最近应还账单总览</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* 信息系统服务费 */}
            <View style={styles.headerItem}>
              <View style={styles.line}>
                <View style={styles.icon} />
                <Text style={styles.headerAmount}>{toAmountStr(this.state.interest, 2, true)}</Text>
              </View>
              <Text style={styles.headerText}>信息系统服务费</Text>
            </View>
            {/* 最近应还货款 */}
            <View style={styles.headerItem}>
              <View style={styles.line}>
                <View style={styles.icon} />
                <Text style={styles.headerAmount}>{toAmountStr(this.state.remainPrincipal, 2, true)}</Text>
              </View>
              <Text style={styles.headerText}>最近应还货款</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: dp(40), alignItems: 'center' }}>
            {/* 综合服务费 */}
            <View style={styles.headerItem}>
              <View style={styles.line}>
                <View style={styles.icon} />
                <Text style={styles.headerAmount}>{toAmountStr(this.state.compositeFee, 2, true)}</Text>
              </View>
              <Text style={styles.headerText}>综合服务费</Text>
            </View>
            {/* 总剩余货款 */}
            <View style={styles.headerItem}>
              <View style={styles.line}>
                <View style={styles.icon} />
                <Text style={styles.headerAmount}>{toAmountStr(this.state.principal, 2, true)}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.headerText}>总剩余货款</Text>
                <Text style={[styles.headerText, { color: '#1A97F6', marginLeft: dp(20) }]} onPress={this.goBatchPay}>
                  批量结清 >
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.title}>账单列表</Text>
          <Text style={styles.filter} onPress={this.showModal}>
            筛选
          </Text>
        </View>

        <View style={styles.row1}>
          <Text style={styles.title1}>还款金额</Text>
          <Touchable onPress={this.sort}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title1}>到期日期</Text>
              <Iconfont
                style={{ marginLeft: dp(12) }}
                name={this.state.sort === 'asc' ? 'xiangshangjiantou' : 'xiangxiajiantou-copy'}
                size={dp(23)}
              />
            </View>
          </Touchable>
        </View>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        {/* <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} /> */}
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={(ref) => {
          this.modal = ref
        }}
        title={'筛选'}
        submit={this.submit}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.modalContainer}>
            {/* <Text style={styles.modalTitle}>项目名称</Text>
            <TextInput
              placeholder={'请输入项目名称'}
              placeholderTextColor={'#A7ADB0'}
              style={styles.itemInput}
              value={this.state.form.name}
              onChangeText={text => {
                this.setState({
                  form: { ...this.state.form, name: text }
                })
              }}
            /> */}

            <Text style={styles.modalTitle}>订单编号</Text>
            <TextInput
              placeholder={'请输入订单编号'}
              placeholderTextColor={'#A7ADB0'}
              style={styles.itemInput}
              value={this.state.form.orderCode}
              onChangeText={(text) => {
                this.setState({
                  form: { ...this.state.form, orderCode: text },
                })
              }}
            />
            <Text style={styles.modalTitle}>付款日</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Touchable
                style={{ flex: 1 }}
                onPress={() => {
                  this.showDatePicker(1)
                }}
              >
                <View style={styles.modalRow}>
                  <Iconfont style={{ marginRight: dp(10) }} name={'rili'} size={dp(32)} color={'#A7ADB0'} />
                  <TextInput
                    pointerEvents={'none'}
                    placeholder={'起始日期'}
                    placeholderTextColor={'#A7ADB0'}
                    style={styles.inputText}
                    value={this.state.form.valueStartTime}
                    editable={false}
                    onChangeText={(text) => {
                      this.setState({
                        form: { ...this.state.form, valueStartTime: text },
                      })
                    }}
                  />
                </View>
              </Touchable>
              <Text style={{ color: '#D8DDE2' }}>{'  -  '}</Text>
              <Touchable
                style={{ flex: 1 }}
                onPress={() => {
                  this.showDatePicker(2)
                }}
              >
                <View style={styles.modalRow}>
                  <Iconfont style={{ marginRight: dp(10) }} name={'rili'} size={dp(32)} color={'#A7ADB0'} />
                  <TextInput
                    pointerEvents={'none'}
                    placeholder={'截止日期'}
                    placeholderTextColor={'#A7ADB0'}
                    style={styles.inputText}
                    value={this.state.form.valueEndTime}
                    editable={false}
                    onChangeText={(text) => {
                      this.setState({
                        form: { ...this.state.form, valueEndTime: text },
                      })
                    }}
                  />
                </View>
              </Touchable>
            </View>

            <Text style={styles.modalTitle}>货款到期日</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Touchable
                style={{ flex: 1 }}
                onPress={() => {
                  this.showDatePicker(3)
                }}
              >
                <View style={styles.modalRow}>
                  <Iconfont style={{ marginRight: dp(10) }} name={'rili'} size={dp(32)} color={'#A7ADB0'} />
                  <TextInput
                    pointerEvents={'none'}
                    placeholder={'起始日期'}
                    placeholderTextColor={'#A7ADB0'}
                    style={styles.inputText}
                    value={this.state.form.finalStartTime}
                    editable={false}
                    onChangeText={(text) => {
                      this.setState({
                        form: { ...this.state.form, finalStartTime: text },
                      })
                    }}
                  />
                </View>
              </Touchable>
              <Text style={{ color: '#D8DDE2' }}>{'  -  '}</Text>
              <Touchable
                style={{ flex: 1 }}
                onPress={() => {
                  this.showDatePicker(4)
                }}
              >
                <View style={styles.modalRow}>
                  <Iconfont style={{ marginRight: dp(10) }} name={'rili'} size={dp(32)} color={'#A7ADB0'} />
                  <TextInput
                    pointerEvents={'none'}
                    placeholder={'截止日期'}
                    placeholderTextColor={'#A7ADB0'}
                    style={styles.inputText}
                    value={this.state.form.finalEndTime}
                    editable={false}
                    onChangeText={(text) => {
                      this.setState({
                        form: { ...this.state.form, finalEndTime: text },
                      })
                    }}
                  />
                </View>
              </Touchable>
            </View>
            <Touchable onPress={this.reset} style={{ marginTop: dp(100) }}>
              <Text style={styles.reset}>重置</Text>
            </Touchable>
          </View>
        </ScrollView>
        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              Picker.hide()
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
      </BottomFullModal>
    )
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'还款账单'}
          navigation={navigation}
          elevation={0.5}
          titleStyle={{ color: 'white' }}
          leftIconColor={'white'}
          rightIconColor={'white'}
          stateBarStyle={{ backgroundColor: Color.THEME }}
          navBarStyle={{ backgroundColor: Color.THEME }}
        />
        <ListPageComponent
          ref={(ref) => {
            this.listView = ref
          }}
          navigation={navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderHeader={this.renderHeader}
          loadHeader={this.loadHeader}
          renderEmpty={this.renderEmpty}
          renderSeparator={null}
          canChangePageSize={false}
          isAutoRefresh={false}
        />
        {this.renderModal()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  bg: {
    backgroundColor: Color.THEME,
    height: dp(90),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    width: dp(16),
    height: dp(48),
    backgroundColor: '#FECD00',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContainer: {
    marginTop: dp(50),
    padding: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(32),
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  headerTitle: {
    color: '#2D2926',
    fontSize: dp(33),
    fontWeight: 'bold',
    marginBottom: dp(40),
    marginTop: dp(17),
  },
  headerAmount: {
    fontSize: dp(46),
    fontWeight: 'bold',
    marginHorizontal: dp(16),
  },
  headerItem: {
    flex: 1,
  },
  headerText: {
    fontSize: dp(28),
    color: '#91969A',
    marginTop: dp(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: dp(30),
    alignItems: 'center',
    marginTop: dp(50),
  },
  title: {
    color: '#2D2926',
    fontSize: dp(33),
    fontWeight: 'bold',
  },
  filter: {
    color: '#2D2926',
    fontSize: dp(28),
    padding: dp(15),
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: dp(30),
    alignItems: 'center',
    paddingHorizontal: dp(26),
    paddingVertical: dp(20),
    borderRadius: dp(16),
    backgroundColor: 'white',
  },
  title1: {
    color: '#91969A',
    fontSize: dp(28),
  },
  item: {
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    paddingVertical: dp(40),
    paddingLeft: dp(30),
    paddingRight: dp(24),
    marginHorizontal: dp(30),
    marginBottom: dp(30),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemAmount: {
    color: '#2D2926',
    fontSize: dp(32),
    fontWeight: 'bold',
  },
  itemText: {
    color: '#91969A',
    fontSize: dp(26),
  },
  itemAmountRed: {
    color: '#F55849',
    fontSize: dp(32),
    fontWeight: 'bold',
  },
  itemStatus: {
    color: 'white',
    fontSize: dp(24),
    backgroundColor: '#B0DBF6',
    borderRadius: dp(4),
    paddingHorizontal: dp(4),
    paddingVertical: dp(2),
  },
  itemStatusRed: {
    color: 'white',
    fontSize: dp(24),
    backgroundColor: '#F55849',
    borderRadius: dp(4),
    paddingHorizontal: dp(4),
    paddingVertical: dp(2),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.13,
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN,
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden',
  },
  modalContainer: {
    padding: dp(60),
    paddingTop: 0,
  },
  modalTitle: {
    fontSize: dp(29),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24),
  },
  itemInput: {
    fontSize: dp(28),
    flex: 1,
    color: Color.TEXT_MAIN,
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    borderRadius: dp(16),
    paddingHorizontal: dp(30),
    height: dp(88),
  },
  modalRow: {
    flexDirection: 'row',
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    borderRadius: dp(16),
    paddingHorizontal: dp(20),
    height: dp(88),
    alignItems: 'center',
  },
  inputText: {
    fontSize: dp(28),
    flex: 1,
    color: Color.TEXT_MAIN,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0,
  },
  reset: {
    borderRadius: dp(16),
    paddingVertical: dp(20),
    marginHorizontal: dp(120),
    color: '#666666',
    borderWidth: dp(2),
    borderColor: '#D8DDE2',
    textAlign: 'center',
  },
})
