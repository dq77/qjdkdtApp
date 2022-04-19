import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, RefreshControl, FlatList, ActivityIndicator } from 'react-native'
import { PropTypes } from 'prop-types'
import Color from '../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../utils/screenUtil'
import Iconfont from '../iconfont/Icon'

export default class ListPageComponent extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object.isRequired,
    pageSize: PropTypes.number, // 自定义分页数
    canChangePageSize: PropTypes.bool, // 接口是否支持自定义分页数，不支持则只能刷新成第一页，（在页面没有被销毁的情况下 去创建或者新增一条数据必须手动设置为false）
    isAutoRefresh: PropTypes.bool, // 是否开启自动刷新
    canPullRefresh: PropTypes.bool, // 是否可以下拉刷新
    loadData: PropTypes.func.isRequired, // 列表数据加载
    loadHeader: PropTypes.func, // 头布局数据加载
    renderItem: PropTypes.func.isRequired,
    renderSeparator: PropTypes.func,
    renderEmpty: PropTypes.func,
    renderMore: PropTypes.func,
    renderEnd: PropTypes.func,
    renderHeader: PropTypes.func
  }

  static defaultProps = {
    pageSize: 10, // 默认10，需与接口实际返回条数一致
    canChangePageSize: true,
    isAutoRefresh: true,
    canPullRefresh: true,
    renderSeparator: () => {
      return <View style={styles.separator} />
    },
    renderEmpty: () => {
      return (
        <View style={styles.emptyContainer}>
          <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>暂无信息</Text>
        </View>
      )
    },
    renderMore: () => {
      return (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator style={styles.indicator} color={Color.THEME} />
          <Text style={styles.indicatorText}>正在加载更多</Text>
        </View>
      )
    },
    renderEnd: () => {
      return (
        <View style={styles.end}>
          <Text style={styles.endText}>—— 页面到底了 ——</Text>
        </View>
      )
    },
    renderHeader: null,
    loadHeader: () => { }
  }

  constructor (props) {
    super(props)
    const { pageSize } = this.props
    this.state = {
      data: [],
      pageNo: 1,
      pageSize,
      loadingMore: false,
      loadEnd: false,
      refreshing: false
    }
  }

  componentDidMount () {
    const { canChangePageSize, isAutoRefresh } = this.props
    if (!isAutoRefresh) {
      return
    }
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        if (canChangePageSize) {
          this.refreshItemData()
        } else {
          this.refreshToTop()
        }
      }
    )
  }

  componentWillUnmount () {
    const { isAutoRefresh } = this.props
    if (!isAutoRefresh) return
    this.didFocusListener.remove()
  }

  async loadData (refresh = false) {
    const { pageNo, pageSize, data } = this.state
    const { loadData, loadHeader } = this.props
    let list
    if (refresh) await loadHeader()

    const res = await loadData(pageNo, pageSize).catch((e) => {
      this.setLoadMore(false)
      this.setRefreshing(false)
    })
    if (res) {
      if (refresh) {
        list = res
        await this.setState({ loadEnd: res.length !== 0 && res.length < pageSize })
      } else {
        list = data.concat(res)
        await this.setState({ loadEnd: res.length < pageSize })
      }
      await this.setState({ data: list })
    }
    this.setLoadMore(false)
    this.setRefreshing(false)
  }

  loadMoreData = async () => {
    const { pageNo, loadingMore, refreshing, loadEnd, data } = this.state
    const { pageSize } = this.props
    if (loadingMore || refreshing || loadEnd || data.length === 0) return

    this.setLoadMore(true)
    await this.setState({ pageNo: Math.ceil((data.length / pageSize) + 1), pageSize })
    this.loadData()
  }

  updateUI = () => {
    this.forceUpdate()
  }

  refreshToTop = () => {
    if (this.state.data.length > 0) {
      this.scrollview.scrollToOffset({ offset: 0, animated: false })
    }
    this.refreshData()
  }

  refreshData = async () => {
    if (this.state.refreshing) return
    const { pageSize } = this.props
    this.canLoadMore = true // 第一次允许加载
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize, loadEnd: false })
    await this.loadData(true)
  }

  refreshItemData = async () => {
    if (this.state.refreshing) return
    const { pageSize } = this.props
    const { data } = this.state
    this.canLoadMore = true // 第一次允许加载
    this.setRefreshing(true)
    await this.setState({ pageNo: 1, pageSize: data.length === 0 ? pageSize : data.length })
    this.loadData(true)
  }

  setLoadMore (visible) {
    this.setState({ loadingMore: visible })
  }

  setRefreshing (visible) {
    this.setState({ refreshing: visible })
  }

  changeItemData = async (index, itemData) => {
    const listData = [...this.state.data]
    listData[index] = itemData
    await this.setState({
      data: listData
    })
  }

  changeListData = async (list) => {
    await this.setState({
      data: list
    })
  }

  getData = () => {
    return this.state.data
  }

  renderMore = () => {
    if (!this.state.loadEnd) {
      return this.state.loadingMore
        ? this.props.renderMore()
        : null
    } else {
      return this.props.renderEnd()
    }
  }

  render () {
    const {
      renderItem, renderSeparator, renderEmpty,
      renderHeader, canPullRefresh
    } = this.props

    return (
      <FlatList
        ref={(r) => { this.scrollview = r }}
        data={this.state.data}
        keyExtractor={(item, index) => String(index)}
        keyboardShouldPersistTaps={'handled'}
        ItemSeparatorComponent={renderSeparator}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={this.renderMore}
        refreshControl={canPullRefresh &&
          <RefreshControl
            title={'加载中'}
            titleColor={Color.TEXT_MAIN}
            colors={[Color.THEME]}
            refreshing={this.state.refreshing}
            onRefresh={this.refreshData}
            tintColor={Color.THEME}
          />

        }
        onEndReached={() => {
          // console.log('onEndReached', this.canLoadMore)
          if (this.canLoadMore) { // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
            this.loadMoreData()
            this.canLoadMore = false
          }
        }}
        onEndReachedThreshold={0.2}// 决定当距离内容最底部还有多远时触发onEndReached回调。注意此参数是一个比值而非像素单位。比如，0.5 表示距离内容最底部的距离为当前列表可见长度的一半时触发。
        onMomentumScrollBegin={() => {
          // console.log('onMomentumScrollBegin')
          this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
        }}
        onMomentumScrollEnd={() => {
          // console.log('onMomentumScrollEnd')
        }}
        onScrollBeginDrag={() => {
          // console.log('onScrollBeginDrag')
        }}
        onScrollEndDrag={() => {
          // console.log('onScrollEndDrag')
        }}
      />

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5'
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.35
  },
  emptyText: {
    fontSize: dp(30),
    color: Color.TEXT_MAIN
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  },
  end: {
    alignItems: 'center',
    paddingVertical: dp(20)
  },
  endText: {
    fontSize: dp(24),
    color: '#A7ADB0',
    paddingVertical: dp(70)
  }
})
