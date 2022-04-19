/*
 * @Date: 2021-02-01 11:28:27
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-04 13:40:27
 */
import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { onEvent } from '../../utils/AnalyticsUtil'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import { showToast } from '../../utils/Utility'

@connect((state) => ({
  ...state.company
}))
export default class SupplierList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      inputVal: '',
      totalPages: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isShowClear: false
    }

    this.status = {
      TODO: '待审核',
      DOING: '审核中',
      REJECT: '审核失败',
      DONE: '审核成功',
      DISABLED: '已失效'
    }
  }

  componentDidMount () {}

  search (text) {
    if (text) {
      this.setState({ isShowClear: true })
      this.listView.updateUI()
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        onEvent('供应商管理-供应商列表页-搜索', 'erp/SupplierList', '/erp/supplier/page', { supplierCodeOrName: text })
        this.listView.refreshData()
      }, 500)
    } else {
      this.setState({ isShowClear: false })
      this.listView.updateUI()
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.listView.refreshData()
  }

  startSearch = () => {
    this.input.focus()
  }

  onFocus = () => {
    // console.log('onFocus')
  }

  onBlur = () => {
    // console.log('onBlur')
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.order.getSupplierLists({
      supplierCodeOrName: this.state.inputVal || null,
      pageNo,
      pageSize
    })
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  goDetail = (id) => {
    onEvent('供应商管理-供应商列表页-查看', 'erp/SupplierList', '/erp/SupplierDetail', { id })
    this.props.navigation.navigate('SupplierDetail', { id })
  }

  toEdit = (id) => {
    onEvent('供应商管理-供应商列表页-编辑', 'erp/SupplierList', '/erp/SupplierEdit', { id })
    this.props.navigation.navigate('SupplierEdit', {
      id,
      refresh: () => {
        this.listView.refreshData()
      }
    })
  }

  delItem = (id) => {
    global.confirm.show({
      title: '确认删除',
      content: '是否确认删除该供应商？',
      confirmText: '确认',
      confirm: async () => {
        onEvent('供应商管理-供应商列表页-删除', 'erp/SupplierList', '/erp/supplier/deleteById', { id })
        const res = await ajaxStore.order.delSupplierItem({ id })
        if (res.data && res.data.code === '0') {
          showToast('删除成功')
          this.listView.refreshData()
        }
      }
    })
  }

  renderItem = (item) => {
    const {
      supplierName, supplierCode, goodCat, contactName,
      contactPhone, id
    } = item.item

    return (
      <Touchable isWithoutFeedback={true} onPress={() => this.goDetail(id)}>
        <View style={styles.item} >

          <Text style={styles.itemTitle}>{supplierName}</Text>
          <View style={styles.line} />
          <View style={[styles.itemRow]}>
            <Text style={styles.itemText} >{'供应商编号'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{supplierCode}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'货物类型'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{goodCat}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'联系人'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]} >{contactName}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'联系电话'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{contactPhone}</Text>
          </View>
          <View style={styles.line} />
          <View style={[styles.itemRow, { justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
            <Text style={styles.btn} onPress={() => this.delItem(id)}>删除</Text>
            <Text style={styles.btn} onPress={() => this.toEdit(id)}>编辑</Text>
          </View>

        </View>
      </Touchable>
    )
  }

  renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TouchableWithoutFeedback onPress={this.startSearch}>
            <View style={styles.searchView}>
              <TextInput
                ref={view => { this.input = view }}
                placeholder={'搜索供应商编码、名称'}
                placeholderTextColor={'#A7ADB0'}
                style={[styles.input, { flex: 1 }]}
                onChangeText={text => { this.search(text) }}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
              />
              {this.state.isShowClear
                ? <Iconfont name={'qingchu'}
                  size={dp(40)} onPress={this.clearSearch}
                  style={styles.clearIcon} />
                : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'icon-loan'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>

        <NavBar
          title={'供应商列表'}
          navigation={navigation}
          elevation={0.5}
          isReturnRoot='1'
          rightIcon={''}
          rightText={'添加供应商'}
          onRightPress={() => {
            onEvent('供应商管理-供应商列表页-添加', 'erp/SupplierList', '/erp/SupplierEdit')
            navigation.navigate('SupplierEdit', {
              refresh: () => {
                this.listView.refreshData()
              }
            })
          }}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          navigation={navigation}
          loadData={this.loadData}
          loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
          renderSeparator={null}
        />

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  headerContainer: {
    // alignItems: 'flex-end'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dp(30)
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: dp(30),
    marginRight: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearIcon: {
    marginRight: dp(15)
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.13
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
  item: {
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    paddingVertical: dp(30),
    paddingLeft: dp(30),
    paddingRight: dp(30),
    marginHorizontal: dp(30),
    marginBottom: dp(30)
  },
  itemTitle: {
    color: '#2D2926',
    fontSize: dp(30),
    fontWeight: 'bold',
    marginBottom: dp(10)
  },
  itemText: {
    color: '#91969A',
    fontSize: dp(27)
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  line: {
    backgroundColor: '#e5e5e5',
    height: dp(1),
    marginVertical: dp(20)
  },
  btn: {
    fontSize: dp(27),
    color: '#91969A',
    paddingVertical: dp(14),
    paddingHorizontal: dp(55),
    borderRadius: dp(30),
    borderColor: '#2D2926',
    borderWidth: dp(1),
    marginLeft: dp(20),
    overflow: 'hidden'
  }
})
