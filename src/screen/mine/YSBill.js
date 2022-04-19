import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Banner from '../../component/Banner'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import BottomFullModal from '../../component/BottomFullModal'
import { webUrl, baseUrl } from '../../utils/config'
import ajaxStore from '../../utils/ajaxStore'
import { handleBackPress, toAmountStr, showToast } from '../../utils/Utility'
import { formatDate, createDateData } from '../../utils/DateUtils'
import Picker from 'react-native-picker'
import { DateData } from '../../utils/Date'
import { open } from '../../utils/FileReaderUtils'

/**
 * 亚士对账单
 */
class YSBill extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      tabIndex: 0,
      statusList: 2
    }
    this.status = {
      1: '待签署',
      2: '待签署',
      3: '已签署',
      4: '废弃'
    }
  }

  async componentDidMount () {

  }

  openExcel = async (id) => {
    // const res = await ajaxStore.company.downloadBill({ id, sessionId: this.props.sessionId })
    global.loading.show()
    await open(`${baseUrl}/ofs/weixin/company/statement/asia/details/download?id=${id}`, this.props.sessionId)
    global.loading.hide()
  }

  async toSignerList (item) {
    if (item.status === 1 || item.status === 2) {
      const res = await ajaxStore.company.confirm({ statementsSerialNumber: item.serialNum, contractCode: item.contractNo })
      if (res.data && res.data.code === '0') {
        const processId = res.data.data.processId
        this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${processId}&contractCode=${item.contractNo}`, title: '合同签约' })
      }
    } else if (item.status === 3) {
      const res = await ajaxStore.company.getProcessId({ contractCode: item.contractNo })
      if (res.data && res.data.code === '0') {
        const processId = res.data.data.flowId
        this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/contractDetail?processInstanceId=${processId}&contractCode=${item.contractNo}`, title: '合同详情' })
      }
    }
  }

  loadData = async (pageNo, pageSize) => {
    // const { orderCode } = this.props.navigation.state.params

    const res = await ajaxStore.company.getBillList({ pageNo, pageSize, statusList: this.state.statusList })

    if (res && res.data && res.data.code === '0') {
      const list = res.data.data.pagedRecords
      list.forEach((item) => {
        item.month = parseInt(item.batchNo.substring(4, 6), 10)
      })

      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  clickTab =async (tabIndex) => {
    if (tabIndex !== this.state.tabIndex) {
      const statusList = tabIndex === 0 ? 2 : 3
      await this.setState({ tabIndex, statusList })
      this.listView.refreshItemData()
    }
  }

  renderItem = (item) => {
    const { month, batchNo, gmtCreated, payableTotal, payableUnpaidTotal, status, id } = item.item

    return (
      <View style={styles.item} >
        <View style={styles.itemHeader}>
          <Text style={styles.title}>{`${month}月对账单`}</Text>
          <Text style={[styles.hint, { marginRight: dp(10), paddingVertical: dp(30) }]} >{this.status[status]}</Text>
          <Iconfont name={status === 3 ? 'yiqianshu' : 'daiqianshu'} size={dp(35)} />
        </View>
        <View style={styles.itemContainer}>
          <View style={styles.line}>
            <Text style={styles.hint}>{`流水号：${batchNo}`}</Text>
            <Text style={styles.hint}>{gmtCreated}</Text>
          </View>
          <View style={styles.line1}>
            <Text style={styles.hint}>{'当月应付赊销货款金额：'}</Text>
            <Text style={[styles.hint, { color: '#2D2926' }]}>{toAmountStr(payableTotal, 2, true)}</Text>
          </View>
          <View style={styles.line1}>
            <Text style={styles.hint}>{'累计应付赊销货款金额：'}</Text>
            <Text style={[styles.hint, { color: '#2D2926' }]}>{toAmountStr(payableUnpaidTotal, 2, true)}</Text>
          </View>
          <View style={styles.separator} />
          {status === 1 || status === 2
            ? <View style={[styles.line1, { justifyContent: 'flex-end', marginTop: dp(15) }]}>
              <Touchable onPress={() => this.openExcel(id)}>
                <Text style={[styles.btn, { backgroundColor: 'white', borderWidth: dp(1), borderColor: Color.THEME, color: Color.THEME, marginRight: dp(30) }]} >对账单明细</Text>
              </Touchable>
              <Touchable onPress={() => this.toSignerList(item.item)}>
                <Text style={styles.btn} >确认对账单</Text>
              </Touchable>
            </View>
            : null
          }
          {status === 3
            ? <View style={[styles.line1, { justifyContent: 'flex-end', marginTop: dp(15), paddingVertical: 0 }]}>
              <Touchable onPress={() => this.openExcel(id)}>
                <Text style={[styles.btn, { backgroundColor: 'white', borderWidth: dp(1), borderColor: Color.THEME, color: Color.THEME, marginRight: dp(30) }]} >对账单明细</Text>
              </Touchable>
              <Touchable onPress={() => this.toSignerList(item.item)}>
                <Text style={styles.btn} >查看</Text>
              </Touchable>
            </View>
            : null}
          {status === 4
            ? <View style={[styles.line1, { justifyContent: 'flex-end', marginTop: dp(15), paddingVertical: 0 }]}>
              <Text style={styles.btn1} ></Text>
            </View>
            : null}
        </View>
      </View>

    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'亚士对账单'}
          navigation={navigation}
          rightIcon={null}
        />
        <View style={styles.tab}>
          <Text style={this.state.tabIndex === 0 ? styles.tabText : styles.tabText1} onPress={() => this.clickTab(0)}>待签署</Text>
          <Text style={this.state.tabIndex === 1 ? styles.tabText : styles.tabText1} onPress={() => this.clickTab(1)}>已签署</Text>
        </View>
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          navigation={navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderSeparator={null}
        />

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    ssoCookie: state.user.ssoCookie,
    sessionId: state.user.sessionId
  }
}

export default connect(mapStateToProps)(YSBill)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    paddingHorizontal: dp(30)
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: '#2D2926',
    fontSize: dp(32),
    fontWeight: 'bold',
    flex: 1
  },
  hint: {
    color: '#A7ADB0',
    fontSize: dp(28)
  },
  itemContainer: {
    backgroundColor: 'white',
    paddingTop: dp(30),
    paddingBottom: dp(10),
    paddingHorizontal: dp(16),
    marginBottom: dp(15),
    borderRadius: dp(16)
  },
  line: {
    backgroundColor: '#F8F8FA',
    borderRadius: dp(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dp(16),
    paddingHorizontal: dp(20)
  },
  line1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dp(16),
    paddingHorizontal: dp(20)
  },
  separator: {
    backgroundColor: '#E7EBF2',
    height: dp(1),
    marginHorizontal: dp(16),
    marginTop: dp(12)

  },
  btn: {
    backgroundColor: '#464678',
    paddingVertical: dp(16),
    paddingHorizontal: dp(30),
    borderRadius: dp(30),
    color: 'white',
    fontSize: dp(24),
    overflow: 'hidden'
  },
  btn1: {
    paddingVertical: dp(16),
    // paddingHorizontal: dp(30),
    color: '#1A97F6',
    fontSize: dp(28)
  },
  tab: {
    flexDirection: 'row',
    marginHorizontal: dp(30),
    alignItems: 'center',
    marginBottom: dp(30)
  },
  tabText: {
    fontSize: dp(28),
    color: '#353535',
    paddingVertical: dp(22),
    flex: 1,
    textAlign: 'center',
    backgroundColor: 'white',
    overflow: 'hidden',
    borderRadius: dp(36),
    borderColor: '#e5e5e5',
    borderWidth: 0.3
  },
  tabText1: {
    fontSize: dp(28),
    color: '#91969A',
    paddingVertical: dp(22),
    flex: 1,
    textAlign: 'center'
  }

})
