
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../utils/Color'
import Touchable from '../../component/Touchable'
import {
  getCSContractList
} from '../../actions'
import { toAmountStr } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'
import { processStatus } from '../../utils/enums'
import { webUrl, baseUrl } from '../../utils/config'
import { getTimeDifference } from '../../utils/DateUtils'
import { onEvent } from '../../utils/AnalyticsUtil'
import Iconfont from '../../iconfont/Icon'
import NavBar from '../../component/NavBar'
import TimePeriodSelection from './component/TimePeriodSelection'
import { open } from '../../utils/FileReaderUtils'

class BusinessStatement extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pageNo: 1,
      loadEnd: false,
      loadingMore: false,
      refreshing: false,
      opinionListData: [],
      stateTime: this.getFullDate(1), // 上月第一天默认
      endTime: this.getFullDate(), // 上月最后一天默认
      infoModal: false,
      totalPages: 1// 总的页数
    }
  }

  // 获取日期
  getFullDate (targetDate) {
    var nowDate = new Date()
    var fullYear = nowDate.getFullYear()
    var month = nowDate.getMonth() // getMonth 方法返回 0-11，代表1-12月
    var endOfMonth = new Date(fullYear, month, 0).getDate() // 获取本月最后一天

    var D, y, m, d

    y = fullYear
    m = month
    if (targetDate === 1) {
      d = 1
    } else {
      d = endOfMonth
    }

    m = m > 9 ? m : '0' + m
    d = d > 9 ? d : '0' + d
    return y + '-' + m + '-' + d
  }

  componentDidMount () {
    this.billExport(this.state.stateTime, this.state.endTime)
  }

  async resetData (orderStartTime, orderEndTime) {
    await this.setState({
      stateTime: orderStartTime, //
      endTime: orderEndTime //
    })
  }

  async billExport (orderStartTime, orderEndTime) {
    const { navigation } = this.props
    const { companyId } = navigation.state.params
    const data = {
      cifCompanyId: companyId,
      orderStartTime: orderStartTime,
      orderEndTime: orderEndTime
    }
    const res = await ajaxStore.company.billExport(data)
    if (res.data && res.data.code === '0') {
      if (res.data.data) {
        global.loading.show()
        open(`${baseUrl}/ofs/front/file/preview?fileKey=${res.data.data}`)
        global.loading.hide()
      }
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  renderEmpty () {
    return <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂时没有企业对账单</Text>
    </View>
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { navigation } = this.props
    const { companyId } = navigation.state.params
    return (
      <View style={styles.container}>
        <NavBar title={'企业对账单'} navigation={navigation} stateBarStyle= {{ backgroundColor: Color.DEFAULT_BG }} navBarStyle= {{ backgroundColor: Color.DEFAULT_BG }} rightIcon="zidingyi" rightIconSize={dp(80)} onRightPress={() => {
          this.setState({
            infoModal: true
          })
        }}/>
        <TimePeriodSelection
          navigation={this.props.navigation}
          companyId={companyId}
          orderStartTime={this.state.stateTime}
          orderEndTime={this.state.endTime}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          comfirm={(orderStartTime, orderEndTime) => {
            this.resetData(orderStartTime, orderEndTime)
            this.billExport(orderStartTime, orderEndTime)
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: dp(40),
    textAlign: 'center',
    marginBottom: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5'
  },
  separator: {
    height: dp(1),
    backgroundColor: Color.SPLIT_LINE,
    marginHorizontal: dp(30)
  },
  itemLeftBg: {
    height: dp(83),
    marginHorizontal: dp(30),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  progress: {
    // transform: [{ scaleX: -1 }]
  },
  progressText: {
    textAlign: 'center',
    fontSize: dp(24)
    // transform: [{ scaleX: -1 }]
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: 50
  },
  emptyText: {
    fontSize: dp(28),
    marginBottom: dp(20),
    color: Color.TEXT_LIGHT
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.24
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  }
})

export default BusinessStatement
