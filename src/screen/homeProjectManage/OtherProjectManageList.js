import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import NavBar from '../../component/NavBar'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import BottomFullModal from '../../component/BottomFullModal'
import ajaxStore from '../../utils/ajaxStore'
import { handleBackPress, toAmountStr, toDateStr } from '../../utils/Utility'
import {
  getCompanyInfo
} from '../../actions'
import { connect } from 'react-redux'
import ActionSheet from '../../component/actionsheet'
import { onEvent, onClickEvent } from '../../utils/AnalyticsUtil'

/**
 * 项目列表
 * todo:
 */
class OtherProjectManageList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      inputVal: '',
      statusVal: '',
      pageNo: 1,
      pageSize: 10,
      totalPages: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isShowClear: false,
      selectNum: '1',
      lockChecked: 0,
      infoModal: false,
      projectId: ''
    }
  }

  async componentDidMount () {
    await getCompanyInfo()
    // this.listView.refreshData()
  }

  search (text) {
    if (text) {
      this.setState({ isShowClear: true })
      this.listView.updateUI()
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
        this.listView.refreshData()
      }, 500)
    } else {
      this.setState({ isShowClear: false, inputVal: '' })
      this.listView.updateUI()
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.listView.refreshData()
      }, 500)
    }
  }

  clearSearch = () => {
    this.input.clear()
    this.setState({ isShowClear: false, inputVal: '' })
    this.listView.refreshData()
  }

  startSearch = () => {
    onClickEvent('项目信息管理-其他项目列表页-搜索', 'homeProjectManage/OtherProjectManageList')
    this.input.focus()
  }

  onFocus = () => {
    // console.log('onFocus')
  }

  onBlur = () => {
    // console.log('onBlur')
  }

  // showModal = async () => {
  //   await this.setState({
  //     checked: this.state.lockChecked
  //   })
  //   this.modal.setModalVisible(true)
  // }

  loadData = async (pageNo, pageSize) => {
    const { userInfo, companyInfo } = this.props
    const res = await ajaxStore.company.itemAppPage({
      cifCompanyId: companyInfo.companyId,
      itemSort: this.state.selectNum === '1' ? '001' : '002',
      keyword: this.state.inputVal || null,
      pageNo,
      pageSize
    })
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  change = (index, data) => {
    onClickEvent('项目信息管理-其他项目列表页-编辑项目', 'homeProjectManage/OtherProjectManageList')
    this.props.navigation.navigate('OtherProjectManageCreate', { index: index === '1' ? 0 : 1, type: 'edit', id: data })
  }

  goDetail = (data) => {
    onClickEvent('项目信息管理-其他项目列表页-查看', 'homeProjectManage/OtherProjectManageList')
    this.props.navigation.navigate('OtherProjectManageDetail', { id: data })
  }

  async selectNum (type) {
    await this.setState({
      selectNum: type
    })
    this.listView.refreshToTop()
  }

  // index 0 1
  async checkPermission (index) {
    onClickEvent('项目信息管理-其他项目列表页-创建项目', 'homeProjectManage/OtherProjectManageList')
    this.props.navigation.navigate('OtherProjectManageCreate', { index, type: 'creat' })
  }

  renderItem = (item) => {
    const {
      itemName, itemCode, party, provinceName,
      cityName, areaName, itemLeader, gmtCreated, id
    } = item.item

    return (
      <Touchable isWithoutFeedback={true} onPress={() => this.goDetail(id)}>
        <View style={styles.item} >
          <Text style={styles.itemTitle}>{itemName}</Text>
          <View style={styles.line} />
          <View style={[styles.itemRow]}>
            <Text style={styles.itemText} >{'项目编号'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{itemCode}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'项目方'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{party}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'项目地点'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]} >{`${provinceName}${cityName}${areaName}`}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'项目负责人'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{itemLeader}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'添加时间'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{toDateStr(gmtCreated, 'yyyy-MM-dd')}</Text>
          </View>
          <View style={styles.line} />
          <View style={[styles.itemRow, { marginTop: dp(30), alignItems: 'flex-start' }]}>
            <Text style={styles.itemText} >{''}</Text>
            <Text style={styles.btn} onPress={() => this.change(this.state.selectNum, id)}>{'编辑'}</Text>
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
                placeholder={'搜索项目名称/项目编号'}
                placeholderTextColor={'#A7ADB0'}
                style={[styles.input, { flex: this.state.isShowClear ? 1 : 0 }]}
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
          <Text style={styles.filter} ></Text>
          {/* <Text style={styles.filter} onPress={this.showModal}>筛选</Text> */}
        </View>
        {(!this.state.inputVal || this.state.inputVal.length < 1) && this.topView()}
      </View >
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

  topView () {
    return (
      <View style={{ marginHorizontal: dp(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: dp(30) }} >
        <Touchable onPress={() => this.selectNum('1')}>
          <View style={[styles.bgView, this.state.selectNum === '1' && styles.bgViewShadow, { backgroundColor: this.state.selectNum === '1' ? 'white' : '#F7F7F9', flexDirection: 'row' }]} >
            <Text style={[styles.title1Style, { color: this.state.selectNum === '1' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '1' ? 'bold' : 'normal' }]}>工程项目</Text>
          </View>
        </Touchable>
        <Touchable onPress={() => this.selectNum('2')}>
          <View style={[styles.bgView, this.state.selectNum === '2' && styles.bgViewShadow, { backgroundColor: this.state.selectNum === '2' ? 'white' : '#F7F7F9' }]} >
            <Text style={[styles.title1Style, { color: this.state.selectNum === '2' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '2' ? 'bold' : 'normal' }]}>非工程项目</Text>
          </View>
        </Touchable>
      </View>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar
          title={'项目信息管理'}
          navigation={navigation}
          elevation={0.5}
          rightIcon={'bianzu'}
          rightIconColor={''}
          onRightPress={() => {
            this.ActionSheet.show()
          }}
        />
        {this.renderHeader()}
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          navigation={navigation}
          loadData={this.loadData}
          canChangePageSize={false}
          // loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          // renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
          renderSeparator={null}
        />
        <ActionSheet
          ref={o => { this.ActionSheet = o }}
          options={['工程项目', '非工程项目', '取消']}
          cancelButtonIndex={2} // 表示取消按钮是第index个
          destructiveButtonIndex={2} // 第几个按钮显示为红色
          onPress={(index) => {
            (index === 0 || index === 1) && this.checkPermission(index)
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold'
  },
  bgView: {
    borderRadius: dp(36),
    width: dp(345),
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bgViewShadow: {
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
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
    marginVertical: dp(20),
    borderRadius: dp(36),
    alignItems: 'center'
    // justifyContent: 'center'
  },
  searchIcon: {
    marginLeft: dp(10)
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
  filter: {
    color: '#2D2926',
    fontSize: dp(28),
    // paddingHorizontal: dp(30)
    paddingRight: dp(30)
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
  modalItem: {
    borderWidth: dp(2),
    borderColor: '#5E608A',
    borderRadius: dp(35),
    overflow: 'hidden',
    color: '#464678',
    width: DEVICE_WIDTH * 0.266,
    marginLeft: DEVICE_WIDTH * 0.05,
    paddingVertical: dp(16),
    textAlign: 'center',
    fontSize: dp(27),
    marginTop: dp(35)
  },
  modalBorder: {
    backgroundColor: '#5E608A',
    color: 'white'
  },
  modalContent: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  stateText: {
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    fontSize: dp(28),
    color: '#2D2926'
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
  point: {
    borderRadius: dp(16),
    width: dp(14),
    height: dp(14),
    backgroundColor: 'red'
  },
  line: {
    backgroundColor: '#e5e5e5',
    height: dp(1),
    marginVertical: dp(20)
  },
  btn: {
    color: '#91969A',
    fontSize: dp(24),
    paddingVertical: dp(15),
    paddingHorizontal: dp(66),
    borderRadius: dp(28),
    overflow: 'hidden',
    borderColor: '#979797',
    borderWidth: dp(1)
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(OtherProjectManageList)
