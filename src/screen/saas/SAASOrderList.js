import React, { PureComponent } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import ListPageComponent from '../../component/ListPageComponent'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import ajaxStore from '../../utils/ajaxStore'
import { onClickEvent } from '../../utils/AnalyticsUtil'
import { createDateData } from '../../utils/DateUtils'
import { DEVICE_HEIGHT, getRealDP as dp } from '../../utils/screenUtil'
import { toAmountStr } from '../../utils/Utility'

class SAASOrderList extends PureComponent {
  constructor(props) {
    super(props)
    this.status = {
      0: '待审核',
      1: '已审核',
      2: '进行中',
      3: '已关闭',
      4: '已取消',
      5: '已完成',
    }
    this.state = {
      isShowClear: false,
      showShadow: false,
      form: {
        likeOrderCode: '',
        likeGoodsName: '',
        status: null, //
        createType: null, // 创建类型,0-自主创建 1-分享创建
        startSum: null,
        endSum: null,
        startDate: null,
        endDate: null,
      },
      people: {},
    }

    this.data = createDateData(2010, 2040)
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.listView.refreshData()
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.saas.orderPage({
      status: this.state.form.status, // 订单状态：0->待付款；1->待发货；2->已发货；3->已完成；4->已关闭；5->无效订单
      pageNo,
      pageSize,
    })

    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  async orderAdvice(item) {
    const res = await ajaxStore.saas.orderAdvice({ id: item.id })
    if (res.data && res.data.code === '0') {
      this.listView.refreshData()
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  changeTab = async status => {
    await this.setState({ form: { ...this.state.form, status } })
    this.listView.updateUI()
    this.listView.refreshData()
  }

  toOrderDetail = id => {
    onClickEvent('商品管理-订单列表页-查看', 'saas/SAASOrderDetail')
    if (id) {
      this.props.navigation.navigate('SAASOrderDetail', { orderId: id || '' })
    }
  }

  renderItem = item => {
    const { projectName, status, extId, gmtModified, id, orderCode, payAmount } = item.item

    return (
      <Touchable
        isNativeFeedback={true}
        onPress={() => {
          this.toOrderDetail(id)
        }}
      >
        <View style={styles.item}>
          <View style={styles.row}>
            <Text style={[styles.title1, { flex: 1 }]}>{id}</Text>
            <Text style={styles.title1}>{this.status[status]}</Text>
          </View>
          <View style={{ backgroundColor: '#EAEAF1', height: dp(1) }} />
          <View style={[styles.searchContainer, { justifyContent: 'space-between' }]}>
            <View style={[{ flex: 1 }]}>
              <Text style={styles.itemtext}>{projectName}</Text>
              <Text style={[styles.itemtext, { color: '#2D2926' }]}>
                订单金额<Text style={{ color: '#F55849' }}>{`￥${toAmountStr(payAmount, 2, true)}`}</Text>
              </Text>
            </View>
            {!extId && (
              <Touchable
                style={styles.itemRow}
                onPress={() => {
                  this.orderAdvice(item.item)
                }}
              >
                <Text style={styles.itemBtn}>发起审核</Text>
              </Touchable>
            )}
          </View>
        </View>
      </Touchable>
    )
  }

  renderHeader = () => {
    const { form } = this.state
    const { status } = form
    return (
      <ScrollView style={{}} horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.tabline}>
          <Text onPress={() => this.changeTab(null)} style={status === null ? styles.tab : styles.tab1}>
            全部
          </Text>
          <Text onPress={() => this.changeTab(0)} style={status === 0 ? styles.tab : styles.tab1}>
            待审核
          </Text>
          <Text onPress={() => this.changeTab(1)} style={status === 1 ? styles.tab : styles.tab1}>
            已审核
          </Text>
          <Text onPress={() => this.changeTab(2)} style={status === 2 ? styles.tab : styles.tab1}>
            进行中
          </Text>
          <Text onPress={() => this.changeTab(3)} style={status === 3 ? styles.tab : styles.tab1}>
            已关闭
          </Text>
          <Text onPress={() => this.changeTab(4)} style={status === 4 ? styles.tab : styles.tab1}>
            已取消
          </Text>
          <Text onPress={() => this.changeTab(5)} style={status === 5 ? styles.tab : styles.tab1}>
            已完成
          </Text>
        </View>
      </ScrollView>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../../images/dingdanliebiaokongbaiye.png')} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>暂无信息</Text>
      </View>
    )
  }

  // renderModal = () => {
  //   const { form } = this.state
  //   return (
  //     <BottomFullModal
  //       ref={ref => {
  //         this.modal = ref
  //       }}
  //       pageHeight={DEVICE_HEIGHT * 0.83}
  //       title={'编辑基本信息'}
  //       confirm={'确定'}
  //       // coverScreen={true}
  //       isAutoClose={false}
  //       submit={() => {
  //         this.orderCreatInfo()
  //       }}
  //     >
  //       <SupplierEdit
  //         defaultData={{}}
  //         onPressData={async data => {
  //           await this.setState({
  //             people: {
  //               ...this.state.people,
  //               ...data,
  //             },
  //           })
  //           console.log(this.state)
  //         }}
  //       />
  //       {this.state.showShadow ? (
  //         <TouchableWithoutFeedback
  //           onPress={() => {
  //             Picker.hide()
  //             this.hideShadow()
  //           }}
  //         >
  //           <View style={styles.shadow}></View>
  //         </TouchableWithoutFeedback>
  //       ) : null}
  //     </BottomFullModal>
  //   )
  // }

  render() {
    return (
      <View style={styles.container}>
        <NavBar
          title={'订单列表'}
          navigation={this.props.navigation}
          elevation={10}
          rightIcon={''}
          rightText={'新建订单'}
          onLeftPress={() => {
            this.props.navigation.pop()
          }}
          onRightPress={() => {
            this.props.navigation.navigate('SAASSupplierEdit', {
              type: '1',
              defaultData: {},
            })
          }}
        />
        <ListPageComponent
          ref={ref => {
            this.listView = ref
          }}
          isAutoRefresh={true}
          canChangePageSize={false}
          navigation={this.props.navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderSeparator={null}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
        />
        {/* {this.renderModal()} */}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(SAASOrderList)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  item: {
    width: dp(690),
    paddingHorizontal: dp(30),
    // paddingVertical: dp(30),
    paddingBottom: dp(26),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16),
    // alignItems: 'center',
    elevation: 0.3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: '#E7EBF2',
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(10),
    fontWeight: 'bold',
  },
  text: {
    fontSize: dp(28),
    color: '#888888',
    marginTop: dp(30),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchView: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: dp(30),
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginLeft: dp(10),
  },
  input: {
    backgroundColor: 'white',
    height: dp(72),
    marginHorizontal: dp(40),
    fontSize: dp(28),
    padding: 0,
    flex: 1,
  },
  clearIcon: {
    marginRight: dp(15),
  },
  selectType: {
    fontSize: dp(29),
    color: '#2D2926',
    paddingHorizontal: dp(30),
  },
  tabline: {
    flexDirection: 'row',
    marginHorizontal: dp(30),
    marginVertical: dp(30),
  },
  tab: {
    color: '#353535',
    fontSize: dp(28),
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'white',
    paddingVertical: dp(16),
    paddingHorizontal: dp(16),
    borderRadius: dp(36),
    overflow: 'hidden',
  },
  tab1: {
    color: '#91969A',
    fontSize: dp(28),
    width: dp(138),
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: dp(16),
    paddingHorizontal: dp(16),
    borderRadius: dp(36),
    overflow: 'hidden',
  },
  modalContainer: {
    padding: dp(60),
    paddingTop: 0,
  },
  modalTitle: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(40),
    marginBottom: dp(24),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.2,
  },
  emptyText: {
    fontSize: dp(28),
    color: '#C7C7D6',
  },
  emptyIcon: {
    marginBottom: dp(35),
    overflow: 'hidden',
    width: dp(280),
    height: dp(280),
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
  row: {
    flexDirection: 'row',
    paddingVertical: dp(20),
    alignItems: 'center',
  },
  title1: {
    color: '#2D2926',
    fontSize: dp(28),
  },
  itemtext: {
    color: '#91969A',
    fontSize: dp(24),
    marginTop: dp(20),
  },
  itemRow: {
    // flexDirection: 'row',
    justifyContent: 'flex-end',
    // alignItems: 'flex-end',
    marginTop: dp(40),
  },
  itemBtn: {
    borderRadius: dp(25),
    color: 'white',
    overflow: 'hidden',
    paddingHorizontal: dp(26),
    paddingVertical: dp(12),
    fontSize: dp(24),
    marginLeft: dp(20),
    backgroundColor: '#2A6EE7',
  },
})
