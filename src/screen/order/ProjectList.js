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
import { customerServiceUrl } from '../../utils/config'
import ajaxStore from '../../utils/ajaxStore'
import { handleBackPress, toAmountStr, showToast } from '../../utils/Utility'
import { formatDate, createDateData } from '../../utils/DateUtils'
import Picker from 'react-native-picker'
import { DateData } from '../../utils/Date'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'

/**
 * 项目列表
 * todo:
 */
export default class ProjectList extends PureComponent {
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
      checked: 0,
      lockChecked: 0,
      infoModal: false,
      projectId: ''
    }
    this.statusMap = [
      { key: null, label: '全部' },
      { key: 'TODO', label: '待审核' },
      { key: 'DOING', label: '审核中' },
      { key: 'REJECT', label: '审核失败' },
      { key: 'DONE', label: '审核成功' },
      { key: 'DISABLED', label: '已失效' }
    ]

    this.statusColor = {
      TODO: '#edad58',
      DOING: '#edad58',
      REJECT: '#ff6666',
      DONE: '#9aca40',
      DISABLED: '#ff6666'
    }

    this.status = {
      TODO: '待审核',
      DOING: '审核中',
      REJECT: '审核失败',
      DONE: '审核成功',
      DISABLED: '已失效'
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
    await this.setState({
      lockChecked: this.state.checked,
      statusVal: this.statusMap[this.state.checked].key
    })
    await this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.order.getProjectLists({
      approvalStatus: this.state.statusVal || null,
      likeProjectName: this.state.inputVal || null,
      projectType: 0,
      pageNo,
      pageSize
    })
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  async getProductInfo (projectId) {
    const res = await ajaxStore.order.getProductInfo2({ projectId })

    if (res.data && res.data.code === '0') {
      res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
      const productInfo = res.data.data
      const interestRate = productInfo.interestRate
      let rateVoList = interestRate.rateVoList
      let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

      if (this.state.useRate) {
        rateVoList = this.state.useRate.rateVoList
        if (rateVoList && rateVoList.length > 0) {
          content += '信息系统服务费率：\n'
          for (var j = 0; j < rateVoList.length; j++) {
            if (this.state.useSource === '1' || this.state.useSource === '2') {
              content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
            } else { // 信用认证会员费率
              content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
            }
          }
        }
      } else {
        if (rateVoList && rateVoList.length > 0) {
          content += '信息系统服务费率：\n'
          for (var i = 0; i < rateVoList.length; i++) {
            content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%\n`
          }
        }
      }

      await this.setState({ modalContent: content })
      return true
    } else {
      return false
    }
  }

  toComfirm = async (applyStatus) => {
    this.submitLoading = true
    const res = await ajaxStore.order.comfirmProduct({
      projectId: this.state.projectId,
      applyStatus: applyStatus
    })
    if (res.data && res.data.code === '0') {
      if (applyStatus === 2) {
        global.alert.show({
          content: '确认成功'
        })
      } else {
        global.alert.show({
          content: '驳回成功'
        })
      }
      this.listView.refreshData()
    }
  }

  confirm = async (projectId) => {
    const isLoad = await this.getProductInfo(projectId)
    if (isLoad) {
      this.setState({
        infoModal: true,
        projectId
      })
    }
  }

  change = (projectId) => {
    this.props.navigation.navigate('ProjectCreate', { projectId })
  }

  goDetail = (approvalStatus, projectId) => {
    if (approvalStatus === 'DOING' || approvalStatus === 'DONE' || approvalStatus === 'DISABLED') {
      this.props.navigation.navigate('ProjectDetail', { approvalStatus, projectId })
    }
  }

  renderItem = (item) => {
    const {
      projectName, approvalStatus, contractAmount, loanAmount,
      supplierName, applyStatus, projectId
    } = item.item

    return (
      <Touchable isWithoutFeedback={true} onPress={() => this.goDetail(approvalStatus, projectId)}>
        <View style={styles.item} >

          <Text style={styles.itemTitle}> <View style={[styles.point, { backgroundColor: this.statusColor[approvalStatus] }]} />{' ' + projectName}</Text>
          <View style={styles.line} />
          <View style={[styles.itemRow]}>
            <Text style={styles.itemText} >{'申请金额'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{toAmountStr(loanAmount, 2, true)}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'合同金额'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{toAmountStr(contractAmount, 2, true)}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'合作厂家'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]} >{supplierName}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: dp(30) }]}>
            <Text style={styles.itemText} >{'审核状态'}</Text>
            <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{this.status[approvalStatus]}</Text>
          </View>
          {
            applyStatus === '1'
              ? <View style={[styles.itemRow, { marginTop: dp(30), alignItems: 'flex-start' }]}>
                <Text style={styles.itemText} >{'操作'}</Text>
                <Text style={styles.btn} onPress={() => this.confirm(projectId)}>{'确认产品'}</Text>
              </View>
              : null
          }
          {
            approvalStatus === 'REJECT'
              ? <View style={[styles.itemRow, { marginTop: dp(30), alignItems: 'flex-start' }]}>
                <Text style={styles.itemText} >{'操作'}</Text>
                <Text style={styles.btn} onPress={() => this.change(projectId)}>{'修改项目信息'}</Text>
              </View>
              : null
          }

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
          <Text style={styles.filter} onPress={this.showModal}>筛选</Text>
        </View>
        <Text style={styles.stateText}>{`审核状态：${this.statusMap[this.state.checked].label}`}</Text>
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

  renderModal = () => {
    return (
      <BottomFullModal
        ref={ref => { this.modal = ref }}
        title={'选择审核状态'}
        submit={this.submit} >
        <View style={styles.modalContent}>
          {this.statusMap.map((value, index) => {
            return (
              <Text style={this.state.checked === index ? [styles.modalItem, styles.modalBorder] : styles.modalItem}
                onPress={() => this.selectState(index)}>{value.label}</Text>
            )
          })}
        </View>
      </BottomFullModal>
    )
  }

  renderProductModal = () => {
    return (
      <Modal
        onTouchOutside={() => {
        }}
        width={0.8}
        visible={this.state.infoModal}
        onSwipeOut={() => { }}
        modalAnimation={new ScaleAnimation({
          initialValue: 0.1, // optional
          useNativeDriver: true // optional
        })}
        onHardwareBackPress={() => {
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text={'取消'}
              onPress={() => {
                this.setState({ infoModal: false })
              }}
              key="button-1"
              style={{
                borderColor: '#e5e5e5',
                borderBottomWidth: 1
              }}
              textStyle={{ color: 'gray', fontSize: dp(32) }}
            />
            <ModalButton
              text={'驳回'}
              onPress={() => {
                this.setState({ infoModal: false })
                this.toComfirm(3)
              }}
              key="button-2"
              style={{
                borderColor: '#e5e5e5',
                borderBottomWidth: 1
              }}
              textStyle={{ color: Color.RED, fontSize: dp(32) }}
            />
            <ModalButton
              text={'确定'}
              onPress={() => {
                this.setState({ infoModal: false })
                this.toComfirm(2)
              }}
              key="button-3"
              style={{
              }}
              textStyle={{ color: Color.GREEN_BTN, fontSize: dp(32) }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={{
            fontSize: dp(40),
            textAlign: 'center',
            marginBottom: dp(30)
          }}>{'项目产品要素变更如下'}</Text>
          <Text style={styles.dialogText}>{this.state.modalContent}</Text>
        </ModalContent>
      </Modal>

    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>

        <NavBar
          title={'项目管理'}
          navigation={navigation}
          elevation={0.5}
          rightIcon={'xinzengxiangmu'}
          rightIconColor={''}
          onRightPress={() => {
            navigation.navigate('ProjectCreate')
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
        {this.renderModal()}
        {this.renderProductModal()}

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
