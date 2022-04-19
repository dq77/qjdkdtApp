
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, FlatList, Platform, RefreshControl, ActivityIndicator } from 'react-native'
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
import { webUrl } from '../../utils/config'
import { getTimeDifference } from '../../utils/DateUtils'
import { onEvent } from '../../utils/AnalyticsUtil'
import Iconfont from '../../iconfont/Icon'
import NavBar from '../../component/NavBar'

class HistoricalOpinionInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      totalPages: 1,
      refreshing: false,
      loadEnd: false,
      opinionListData: [],
      loadingMore: false,
      pageNo: 1,
      pageSize: 10
    }
  }

  componentDidMount () {
    this.setRefreshing(true)
    this.loadData()
  }

  async loadData (refresh = false) {
    const { navigation } = this.props
    const { companyId } = navigation.state.params
    const data = {
      companyId: companyId,
      pageNum: this.state.pageNo,
      pageSize: this.state.pageSize,
      readFlag: 1
    }
    const res = await ajaxStore.company.opinionList(data)
    if (res.data && res.data.code === '0') {
      const dataList = res.data.data || []

      let loanList
      if (refresh) {
        loanList = dataList
      } else {
        loanList = this.state.opinionListData.concat(dataList)
      }
      this.setState({
        opinionListData: loanList,
        totalPages: res.data.pages,
        loadEnd: dataList && res.data.pages === this.state.pageNo
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    if (this.state.loadingMore === true || this.state.refreshing === true) return
    this.setLoadMore(true)
    if (this.state.pageNo < this.state.totalPages) {
      await this.setState({ pageNo: this.state.pageNo + 1 })
      this.loadData()
    } else {
      this.setState({ loadEnd: true })
    }
  }

  setLoadMore (visible) {
    this.setState({ loadingMore: visible })
  }

  renderMore () {
    if (!this.state.loadEnd) {
      return this.state.loadingMore
        ? <View style={styles.indicatorContainer}>
          <ActivityIndicator style={styles.indicator} color={Color.THEME}/>
          <Text style={styles.indicatorText}>正在加载更多</Text>
        </View>
        : null
    } else {
      return <View style={{ alignItems: 'center' }}>
        {/* <View style={styles.separator} /> */}
        <Text style={[styles.indicatorText, { paddingVertical: dp(30), color: '#666666' }]}>——页面到底了——</Text>
      </View>
    }
  }

  renderItem (item) {
    // console.log(item, 'item')
    return (
      <Touchable onPress={() => {
        this.props.navigation.navigate('WebView', { url: item.item.webSite, title: item.item.source })
      }} key={item.item.id}>
        <View >
          <View style={{ marginHorizontal: dp(30), marginTop: dp(40) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#2D2926', fontSize: dp(24), fontWeight: 'bold' }}>{item.item.companyName}</Text>
              <Text style={{ color: '#A5A5A5', fontSize: dp(24) }}>{item.publishTime}</Text>
            </View>
            <Text style={{ marginTop: dp(24), color: '#1A97F6', fontSize: dp(24), lineHeight: dp(35) }}>{item.item.title}</Text>
            <View style={{ flex: 1, height: dp(1), backgroundColor: Color.SPLIT_LINE, marginTop: dp(40) }}></View>
          </View>
        </View>
      </Touchable>
    )
  }

  renderEmpty () {
    return <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂时没有历史舆情信息</Text>
    </View>
  }

  refreshData = async () => {
    if (this.state.refreshing) return
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
    this.loadData(true)
  }

  setRefreshing (visible) {
    this.setState({ refreshing: visible })
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'历史舆情信息'} navigation={navigation} />
        <FlatList
          ref={(r) => { this.scrollview = r }}
          data={this.state.opinionListData}
          keyExtractor={(item, index) => index + '' }
          // ItemSeparatorComponent={() => this.renderSeparator()}
          renderItem={data => this.renderItem(data)}
          ListEmptyComponent={this.renderEmpty()}
          refreshControl={
            <RefreshControl
              title={'加载中'}
              titleColor={Color.TEXT_MAIN}
              colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.refreshData}
              tintColor={Color.THEME}
            />
          }
          ListFooterComponent={this.renderMore()}
          onEndReached={() => {
            if (this.canLoadMore) { // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
              this.loadMoreData()
              this.canLoadMore = false
            }
          }}
          onEndReachedThreshold={Platform.OS === 'android' ? 0.1 : 0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
          }}

        />
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
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dp(30)
  },
  indicator: {
    marginRight: dp(20)
  },
  indicatorText: {
    fontSize: dp(28),
    color: '#666666'
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  }
})

export default HistoricalOpinionInfo
