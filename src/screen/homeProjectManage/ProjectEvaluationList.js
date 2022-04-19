import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, TextInput, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import ListPageComponent from '../../component/ListPageComponent'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import BottomFullModal from '../../component/BottomFullModal'
import ajaxStore from '../../utils/ajaxStore'
import { projectEvaluationStatus } from '../../utils/enums'
import ProgressChartTwoAngle from '../../component/ProgressChartTwoAngle'
import { onEvent, onClickEvent } from '../../utils/AnalyticsUtil'

/**
 * 项目列表
 * todo:
 */
export default class ProjecEvaluationtList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      inputVal: '',
      pageNo: 1,
      pageSize: 10,
      totalPages: 1,
      loadingMore: false,
      loadEnd: false,
      refreshing: false,
      isShowClear: false,
      checked: 0,
      lockChecked: 0,
      projectId: ''
    }
    this.statusMap = [
      { key: null, label: '全部' },
      { key: '1', label: '待评估' },
      { key: '2', label: '已取消' },
      { key: '3', label: '已完成' }
    ]

    this.statusColor = {
      1: '#4FBF9F',
      2: '#C7C7D6',
      3: '#2A6EE7'
    }
  }

  componentDidMount () {
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
      this.setState({ isShowClear: false })
      this.listView.updateUI()
      this.timer = setTimeout(() => {
        this.setState({ inputVal: text })
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
    this.input.focus()
  }

  onFocus = () => {
    // console.log('onFocus')
  }

  onBlur = () => {
    // console.log('onBlur')
  }

  showModal = async () => {
    await this.setState({
      checked: this.state.lockChecked
    })
    this.modal.setModalVisible(true)
  }

  selectState = (index) => {
    this.setState({
      checked: index
    })
  }

  submit = async () => {
    await this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.project.getProjectEvaluationList({
      name: this.state.inputVal || null,
      pageNo,
      pageSize
    })
    if (res && res.data && res.data.code === '0') {
      onEvent('项目评估-项目列表页-搜索', 'ProjectEvaluationList', '/erp/evaluation/project/appPage')
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  getChartColor (resultScore) {
    let color
    if (resultScore < 60) {
      color = '#F55849'
    } else {
      color = '#2A6EE7'
    }
    return color
  }

  goDetail = (id) => {
    onClickEvent('项目评估-项目列表页-查看', 'ProjectEvaluationList')
    this.props.navigation.navigate('ProjectEvaluationDetail', { id })
  }

  renderItem = (item) => {
    const {
      name, status, id, resultScore
    } = item.item
    return (
      <Touchable isWithoutFeedback={true} onPress={() => this.goDetail(id)}>
        <View style={styles.item} >
          <View style={styles.itemLeft}>
            <Text style={styles.itemTitle}>{name}</Text>
            <Text style={{ backgroundColor: this.statusColor[status], ...styles.itemStatus }}>{projectEvaluationStatus[parseInt(status)]}</Text>
          </View>
          <View style={styles.itemRight}>
            { status === 1 || status === 2 ? (
              <ProgressChartTwoAngle style={styles.progress} colorsEndTop={['#EAEAF1', '#EAEAF1']} colorsEndBottom={['#EAEAF1', '#EAEAF1']} showOneTextFont={dp(60)} showOneTextColor={'#EAEAF1'} text={'--'} strokeWidths={[dp(8), dp(8), dp(8), dp(8)]} openAngle ={120} rotate={-30} openAngleData = {0} radius={dp(DEVICE_WIDTH * 0.4 / 3)} widthBG = {dp(DEVICE_WIDTH * 0.3)} heightBG = {dp(DEVICE_WIDTH * 0.3)}/>
            ) : (
              <ProgressChartTwoAngle style={styles.progress} colorsEndTop={[this.getChartColor(resultScore), this.getChartColor(resultScore)]} colorsEndBottom={['#EAEAF1', '#EAEAF1']} showOneTextFont={dp(36)} showOneTextColor={this.getChartColor(resultScore)} text={resultScore} strokeWidths={[dp(8), dp(8), dp(8), dp(8)]} openAngle ={120} rotate={-30} openAngleData = {(resultScore / 100).toFixed(2)} radius={dp(DEVICE_WIDTH * 0.4 / 3)} widthBG = {dp(DEVICE_WIDTH * 0.3)} heightBG = {dp(DEVICE_WIDTH * 0.3)}/>
            )}
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
                placeholder={'搜索项目名称'}
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
          {/* <Text style={styles.filter} onPress={this.showModal}>筛选</Text> */}
        </View>
        {/* <Text style={styles.stateText}>{`审核状态：${this.statusMap[this.state.checked].label}`}</Text> */}
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Iconfont name={'dangqianwuxiangmu'} size={dp(140)} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>您还没有发起过项目风险评估</Text>
      </View>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'选择审核状态'}
        submit={this.submit} >
        <View style={styles.modalContent}>
          {this.statusMap.map((value, index) => {
            return (
              <Text key={index} style={this.state.checked === index ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                onPress={() => this.selectState(index)}>{value.label}</Text>
            )
          })}
        </View>
      </BottomFullModal>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>

        <NavBar
          title={'项目评估'}
          navigation={navigation}
          elevation={0.5}
          rightText={'发起评估'}
          rightIcon={''}
          onRightPress={() => {
            onClickEvent('项目评估-列表页-发起评估', 'ProjectEvaluationList')
            navigation.navigate('ProjectEvaluationForm')
          }}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          navigation={navigation}
          canChangePageSize={false}
          loadData={this.loadData}
          loadHeader={this.loadHeader}
          renderItem={this.renderItem}
          renderHeader={this.renderHeader}
          renderEmpty={this.renderEmpty}
          renderSeparator={null}
        />
        {this.renderModal()}

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
    color: '#A7ADB0'
  },
  emptyIcon: {
    marginBottom: dp(50)
  },
  filter: {
    color: '#2D2926',
    fontSize: dp(28),
    paddingHorizontal: dp(30)
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
    paddingHorizontal: dp(30),
    paddingVertical: dp(20),
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemLeft: {
    borderRightWidth: dp(1),
    borderColor: '#DDDDE8',
    width: DEVICE_WIDTH * 0.65
  },
  itemRight: {
    width: DEVICE_WIDTH * 0.25,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: dp(20)
  },
  progress: {
    marginTop: dp(30)
  },
  itemStatus: {
    paddingVertical: dp(5),
    paddingHorizontal: dp(10),
    width: dp(110),
    color: '#fff',
    textAlign: 'center'
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
    marginBottom: dp(28)
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
    backgroundColor: Color.THEME,
    color: 'white',
    fontSize: dp(27),
    paddingVertical: dp(14),
    paddingHorizontal: dp(35),
    borderRadius: dp(28),
    overflow: 'hidden'
  },
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT
  }
})
