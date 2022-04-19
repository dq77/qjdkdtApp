import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, ScrollView, RefreshControl, TextInput, Keyboard, TouchableWithoutFeedback
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
import { customerServiceUrl, baseUrl } from '../../utils/config'
import { getRegionTextArr } from '../../utils/Region'
import ajaxStore from '../../utils/ajaxStore'
import { handleBackPress, toAmountStr, showToast, getProductDetail } from '../../utils/Utility'
import { formatDate, createDateData } from '../../utils/DateUtils'
import Picker from 'react-native-picker'
import { DateData } from '../../utils/Date'
import { open } from '../../utils/FileReaderUtils'
import AlertModal from '../../component/AlertModal'

import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'

/**
 * 项目详情
 */
class ProjectDetail extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      refreshing: false,
      approvalStatus: 'DONE',
      projectId: '',
      supplierId: '',
      projectInfo: {},
      productInfo: {},
      clmsProject: {},
      modalContent: '',
      showModal: false,
      tabIndex: 0,
      orderList: [],
      loanList: []
    }

    // 订单状态
    this.orderStatusV2 = {
      0: '待确认', // 确认订单   orderWay:1下游下单 2上游下单   确认订单(与当前身份相反时)
      1: '待审核', // 无操作按钮
      2: '待付款', // 申请放款（loanAllowAmount>0 && loanStatus"===2"）、修改订单、申请垫资（loanStatus === “0” || loanStatus === “3”）
      3: '已关闭', // 修改订单（重新编辑）
      4: '已付款', // 确认修改
      5: '修改订单中'
    }
    this.orderStatusChinese = {
      已制单: '0',
      已下单: '2',
      已申请: '2',
      工厂已确认: '0',
      分销工厂已确认: '2',
      已发货: '2',
      修改订单中: '5',
      已确认修改: '5',
      已签收: '2',
      到货签收: '2',
      已复核: '1',
      已排产: '2',
      已审批: '2',
      已提取: '1',
      已完工: '2',
      已施工: '2',
      仅零售订单修改: '5',
      已入库: '2',
      已生产: '2',
      已关闭: '3',
      重新编辑: '3'
    }
    this.loanStatus = {
      0: '未支付货款',
      1: '审批中',
      2: '审批未通过',
      3: '已支付货款',
      4: '已完成',
      DEL: '已删除'
    }
  }

  componentDidMount () {
    const { approvalStatus, projectId } = this.props.navigation.state.params
    this.setState({
      approvalStatus,
      projectId
    })

    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.onRefresh()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })

    const { approvalStatus, projectId } = this.props.navigation.state.params
    await this.getProjectInfo(projectId)
    if (approvalStatus === 'DONE' || approvalStatus === 'DISABLED') {
      await this.getProjectInfoAll(projectId)
      await this.getOrderList(projectId)
      await this.getLoanList(projectId)
    }

    this.setState({ refreshing: false })
  }

  getProjectInfo = async (projectId) => {
    const res = await ajaxStore.order.getProjectInfo({ projectId })
    if (res.data && res.data.code === '0') {
      this.setState({
        projectInfo: res.data.data,
        supplierId: res.data.data.supplierIds ? res.data.data.supplierIds[0] : ''
      })
      this.getProductInfo(res.data.data.productCode)
    }
  }

  getProjectInfoAll = async (projectId) => {
    const res = await ajaxStore.order.getProjectInfoAll({ projectId })
    if (res.data && res.data.code === '0') {
      this.setState({
        clmsProject: res.data.data.clmsProject
      })
    }
  }

  getLoanList = async (projectId) => {
    const data = {
      pageNo: 1,
      pageSize: 999,
      projectId
    }
    const res = await ajaxStore.loan.loadLoanList(data)
    if (res.data && res.data.code === '0') {
      const { pagedRecords, totalPages } = res.data.data
      pagedRecords.forEach(item => {
        let validTimeStr = ''
        if (item.validTime) {
          const validTime = item.validTime.replace(/-/ig, '/')
          validTimeStr = (new Date(validTime) - new Date()) / 1000 / 3600
          validTimeStr = validTimeStr > 1 ? `${parseInt(validTimeStr)}小时` : `${parseInt(validTimeStr * 60)}分钟`
        }
        item.validTimeStr = validTimeStr
      })
      this.setState({ loanList: pagedRecords })
    }
  }

  getOrderList = async (projectId) => {
    const data = {
      pageNo: 1,
      pageSize: 999,
      typeStatus: '0',
      projectId
    }
    const res = await ajaxStore.order.orderAllList(data)
    if (res.data && res.data.code === '0') {
      this.handleOrderStatus(res.data.data.pagedRecords)
    }
  }

  handleOrderStatus (list) {
    const orderList = list || this.state.orderList
    orderList.forEach((item, index) => {
      // v1版本订单直接取流程中中文订单状态，并映射成v2版本状态
      if (item.currentNodeCode === 'LAUNCH_ORDER') {
        item.statusStr = this.orderStatusV2['3']
      } else if (item.exchangeStatus === 'TO_CONFIRM_MODIFY' || item.exchangeStatus === 'TO_SUPPLIER_CONFIRM' || item.exchangeStatus === 'TO_CUSTOMER_MANAGER' || item.currentNodeCode === 'TO_CUSTOMER_MANAGER' || item.currentNodeCode === 'TO_CASHIER_CONFIRM') {
        item.statusStr = this.orderStatusV2['5']
      } else if (item.orderVersion === '1') {
        if (item.processInstanceVO) {
          item.statusStr = this.orderStatusV2[this.orderStatusChinese[item.processInstanceVO.processProperties.orderStatusStr]]
        } else {
          item.statusStr = '获取失败'
        }
      } else if (item.orderVersion === '2') {
        item.statusStr = this.orderStatusV2[item.orderNodeStatus]
      }
    })
    this.setState({ orderList })
  }

  getProductInfo = async (productCode) => {
    const res = await ajaxStore.order.getProductInfo({ productCode })
    if (res.data && res.data.code === '0') {
      this.setState({
        productInfo: res.data.data
      })

      //   res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
      //   const productInfo = res.data.data
      //   const interestRate = productInfo.interestRate
      //   let rateVoList = interestRate.rateVoList
      //   let content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n服务费率：${productInfo.serviceRate}%\n开票主体：${!productInfo.makeTicketObject ? '' : productInfo.makeTicketObject === 'QJD_INFORMATION' ? '仟金顶信息科技有限公司' : '仟金顶网络科技有限公司'}\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

      //   if (this.state.useRate) {
      //     rateVoList = this.state.useRate.rateVoList
      //     if (rateVoList && rateVoList.length > 0) {
      //       content += '信息系统服务费率：\n'
      //       for (var j = 0; j < rateVoList.length; j++) {
      //         if (this.state.useSource === '1' || this.state.useSource === '2') {
      //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
      //         } else { // 信用认证会员费率
      //           content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${interestRate.rateVoList[j].stairRate}%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${this.state.comprehensiveServiceFreeRate}%`
      //         }
      //       }
      //     }
      //   } else {
      //     if (rateVoList && rateVoList.length > 0) {
      //       content += '信息系统服务费率：\n'
      //       for (var i = 0; i < rateVoList.length; i++) {
      //         content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${rateVoList[i].stairRate}%\n`
      //       }
      //     }
      //   }

    //   this.setState({ modalContent: content })
    }
    const content = await getProductDetail(productCode, this.props.ofsCompanyId)
    await this.setState({
      modalContent: content
    })
  }

  async previewFile (item) {
    global.loading.show()
    await open(`${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${item}`)
    global.loading.hide()
  }

  clickTab = (tabIndex) => {
    this.setState({ tabIndex })
  }

  renderModal () {
    return <AlertModal
      title={'产品要素'}
      content={this.state.modalContent}
      comfirmText={'确定'}
      cancel={() => {
        this.setState({ showModal: false })
      }}
      confirm={() => {
        this.setState({ showModal: false })
      }}
      infoModal={this.state.showModal} />
  }

  goOrderDetail = (item) => {
    const data = {}
    if (this.state.lockChecked === '4') {
      data.orderId = item.extWkaOrder.id
      data.orderCode = item.extWkaOrder.orderCode
      data.type = 'FXB'
    } else {
      data.orderId = item.orderBasicVO.orderId
      data.orderCode = item.orderBasicVO.orderCode
      data.projectId = item.orderBasicVO.projectId
      data.totalCost = item.orderBasicVO.totalCost
    }
    this.props.navigation.navigate('OrderDetail', data)
  }

  goLoanDetail = (item) => {
    const loanCode = item.makeLoanCode
    const supplierName = item.supplierName
    const amount = item.amount
    const status = item.status
    const loanType = item.loanType
    const fundSource = item.fundSource
    const statusText = this.loanStatus[status]

    if (status !== '3') {
      return
    }
    this.props.navigation.navigate('LoanDetail', { loanCode, statusText, supplierName, amount, loanType, fundSource })
  }

  goLoanPay = (item) => {
    this.props.navigation.navigate('LoanPay', { loanCode: item.makeLoanCode })
  }

  tapLoanSign = (bankUrl) => {
    this.props.navigation.navigate('WebView', {
      url: bankUrl + '&cpUrl=' + encodeURIComponent('https://wx.zhuozhuwang.com/ofs_weixin/html/wxRedirectTo.html?qjdkdt://Loan')
    })
  }

  tapContractsSign = (makeLoansId) => {
    // 签署合同
    if (this.props.njTime && ((new Date().getTime() - this.props.njTime) / 1000 / 60) <= 30) { // 超过30分钟重新认证
      this.props.navigation.navigate('ContractsByNanJing', { makeLoansId })
    } else {
      this.props.navigation.navigate('FaceIdentity', {
        idcardName: this.props.companyInfo.legalPerson,
        idcardNumber: this.props.companyInfo.legalPersonCertId,
        // idcardName: '韩小乐',
        // idcardNumber: '370304199504020010',
        isNJBank: true,
        callback: (navigation) => {
          navigation.replace('ContractsByNanJing', { makeLoansId })
        }
      })
    }
  }

  creatOrder = () => {
    this.props.navigation.navigate('ProjectOrderCreateStepTwo', {
      supplierId: this.state.supplierId,
      projectId: this.state.projectId,
      businessType: '5',
      businessTypeName: '工程采',
      isBack: true,
      stepOne: {
        selectValue: '5',
        supplierId: this.state.supplierId,
        projectId: this.state.projectId,
        form: {
          projectName: this.state.projectInfo.projectName
        }
      }

    })
  }

  renderLoanList = () => {
    const views = []
    for (let i = 0, length = this.state.loanList.length; i < length; i++) {
      const item = this.state.loanList[i]
      views.push(
        <View style={styles.itemRow3}>
          <View style={item.status === '2' ? [styles.itemHeader, { backgroundColor: 'rgba(205,170,116,0.3)' }] : styles.itemHeader}>
            <Text style={item.status === '2' ? [styles.itemHeadText, { color: '#B7916C' }] : styles.itemHeadText} numberOfLines={1} ellipsizeMode='tail'>{`${toAmountStr(item.amount, 2, true) || ''}`}</Text>
            <Text style={item.status === '2' ? [styles.itemHeadText1, { color: '#B7916C' }] : styles.itemHeadText1} numberOfLines={1} ellipsizeMode='tail'>{`${this.loanStatus[item.status] || ''}`}</Text>
          </View>
          <View style={styles.itemContent2}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.itemText3, { marginTop: dp(14) }]}>支付货款编号：</Text>
              <Text style={[styles.itemText3, { flex: 1 }]} >{`${item.makeLoanCode}` || ''}</Text>
            </View>
            <Text style={styles.itemText3} numberOfLines={1} ellipsizeMode='tail'>{`订单编号：${item.orderCode || ''}`}</Text>
            {item.loanType === '0'
              ? <Text style={styles.itemText3} numberOfLines={1} ellipsizeMode='tail'>{`项目名称：${item.projectName || ''}`}</Text>
              : <Text style={styles.itemText3} numberOfLines={1} ellipsizeMode='tail'>{`订单名称：${item.orderName || ''}`}</Text>
            }
            {item.loanType === '2'
              ? <Text style={styles.itemText3} numberOfLines={1} ellipsizeMode='tail'>{`一级经销商：${item.supplierName || ''}`}</Text>
              : <Text style={styles.itemText3} numberOfLines={1} ellipsizeMode='tail'>{`合作厂家：${item.supplierName || ''}`}</Text>
            }

            {/* 按钮 */}
            <View style={styles.btnLine}>
              {(item.status === '3' && item.repaymentShow === 1 && item.typeStatus !== '5')
                ? <Touchable onPress={() => this.goLoanDetail(item)} isPreventDouble={true}>
                  <Text style={styles.itemBtn3}>{'货款支付详情'}</Text>
                </Touchable>
                : null}
              {item.repayShow !== 'blank'
                ? <Touchable
                  onPress={() => {
                    if (item.repayShow !== 'disable') { this.goLoanPay(item) }
                  }}
                  isPreventDouble={true}>
                  <Text style={item.repayShow === 'disable' ? styles.itemBtn2 : styles.itemBtn3}>{'申请还款'}</Text>
                </Touchable>
                : null}
              {item.isShow
                ? <Touchable onPress={() => this.tapLoanSign(item.bankUrl)} isPreventDouble={true}>
                  <Text style={styles.itemBtn3}>{'支付货款签约'}</Text>
                </Touchable>
                : null}
              {item.isShow && item.validTimeStr
                ? <Text style={styles.validTime}>{`${item.validTimeStr || ''}后失效`}</Text>
                : null}
              {item.fundSource === '4' && item.nanJingLoansStatus
                ? <Touchable onPress={() => this.tapContractsSign(item.makeLoanCode)} isPreventDouble={true}>
                  <Text style={styles.itemBtn3}>{'签署合同'}</Text>
                </Touchable>
                : null}
            </View>
          </View>
        </View>)
    }
    if (this.state.loanList.length === 0) {
      views.push(
        <Text key={this.state.loanList.length} style={[styles.bottom, { marginVertical: dp(200) }]}>{'暂无数据'}</Text>
      )
    } else {
      views.push(
        <Text key={this.state.loanList.length} style={styles.bottom}>{'—— 页面到底了 ——'}</Text>
      )
    }
    return views
  }

  clickItemBtn = (item) => {
    this.props.navigation.navigate('ApplyLoan', {
      orderId: item.orderBasicVO.orderId,
      supplierId: item.supplierCode,
      orderCode: item.orderBasicVO.orderCode,
      projectId: item.orderBasicVO.projectId
    })
  }

  renderOrderList = () => {
    const views = []
    for (let i = 0, length = this.state.orderList.length; i < length; i++) {
      let {
        projectName, orderBasicVO, supplierName, supplierVO,
        orderAmount, statusStr, loanAllowAmount
      } = this.state.orderList[i]
      const orderCode = orderBasicVO ? orderBasicVO.orderCode : ''
      supplierName = supplierName || (supplierVO && supplierVO.supplierName)
      let showBtn = false

      if (statusStr.indexOf('待付款') > -1) {
        if (orderBasicVO && orderBasicVO.orderVersion === '1') {
          if (orderBasicVO.loanStatus === '2' && loanAllowAmount > 0) {
            showBtn = true
          }
        } else {
          if (loanAllowAmount > 0) {
            showBtn = true
          }
        }
      }

      views.push(
        <Touchable
          key={i}
          isNativeFeedback={true}
          onPress={() => this.goOrderDetail(this.state.orderList[i])}>
          <View style={styles.itemRow2}>
            <Text style={styles.itemTitile} numberOfLines={1} ellipsizeMode='tail'>{projectName || ''}</Text>
            <Text style={styles.itemText2} numberOfLines={1} ellipsizeMode='tail'>{`订单编号：${orderCode || ''}`}</Text>
            <Text style={styles.itemText2} numberOfLines={1} ellipsizeMode='tail'>{`合作销售方：${supplierName || ''}`}</Text>
            <Text style={styles.itemText2} numberOfLines={1} ellipsizeMode='tail'>{`订单金额：${toAmountStr(orderAmount, 2, true)}`}</Text>
            <Text style={styles.itemText2} numberOfLines={1} ellipsizeMode='tail'>{`订单状态：${statusStr || ''}`}</Text>
            {showBtn
              ? <Touchable style={styles.itemBtn1} onPress={() => { this.clickItemBtn(this.state.orderList[i]) }} isPreventDouble={true}>
                <View style={styles.itemBtn}>
                  <Text style={styles.itemBtnText}>{'申请支付货款'}</Text>
                </View>
              </Touchable>
              : null}
          </View>
        </Touchable>
      )
    }
    if (this.state.orderList.length === 0) {
      views.push(
        <Text key={this.state.orderList.length} style={[styles.bottom, { marginVertical: dp(200) }]}>{'暂无数据'}</Text>
      )
    } else {
      views.push(
        <Text key={this.state.orderList.length} style={styles.bottom}>{'—— 页面到底了 ——'}</Text>
      )
    }
    return views
  }

  renderProjectInfo = () => {
    const {
      projectName, projectSide, provinceCode, cityCode,
      areaCode, address, projectContractPath
    } = this.state.projectInfo
    let showAddress = provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') : ''
    const add = address || ''
    showAddress = showAddress + ' ' + add
    const file = projectContractPath && projectContractPath.split('/')[1]

    return (
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>项目信息</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'项目名称：'}</Text>
          <Text style={styles.itemText}>{projectName || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'项目方：'}</Text>
          <Text style={styles.itemText}>{projectSide || ''}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'项目所在地：'}</Text>
          <Text style={styles.itemText}>{showAddress || ''}</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemText1}>{'项目合同：'}</Text>
          <Text onPress={() => {
            this.previewFile(projectContractPath && projectContractPath.split('/')[0])
          }} style={[styles.itemText, { color: '#0092d5' }]}>{file || ''}</Text>
        </View>
      </View>
    )
  }

  renderLoanInfo = () => {
    let {
      contractAmount, loanAmount, supplierNames
    } = this.state.projectInfo
    const {
      categoryName = '', brandName = '', name
    } = this.state.productInfo

    supplierNames = supplierNames && supplierNames.length > 0 ? supplierNames[0] : ''
    return (
      <View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>赊销信息</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'合同金额：'}</Text>
            <Text style={styles.itemText}>{toAmountStr(contractAmount, 2, true) || ''}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'申请金额：'}</Text>
            <Text style={styles.itemText}>{toAmountStr(loanAmount, 2, true) || ''}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'合作厂家：'}</Text>
            <Text style={styles.itemText}>{supplierNames || ''}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'品类品牌：'}</Text>
            <Text style={styles.itemText}>{categoryName + '-' + brandName || ''}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemText1}>{'产品类型：'}</Text>
            <Text onPress={() => {
              this.setState({ showModal: true })
            }} style={[styles.itemText, { color: '#0092d5' }]}>{name || ''}</Text>
          </View>
        </View>
        <Text style={styles.bottom}>{'—— 页面到底了 ——'}</Text>
      </View>
    )
  }

  renderHeader = () => {
    const {
      loanLimit, usableLoanLimit
    } = this.state.clmsProject
    const {
      contractAmount, loanAmount
    } = this.state.projectInfo
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>资金概况</Text>
        <View style={{ flexDirection: 'row' }}>
          {/* 项目可垫资金额 */}
          <View style={styles.headerItem}>
            <View style={styles.line}>
              <View style={styles.icon} />
              <Text style={styles.headerAmount}>{toAmountStr(loanLimit, 2, true)}</Text>
            </View>
            <Text style={styles.headerText}>项目可垫资金额</Text>
          </View>
          {/* 项目剩余可垫资金额 */}
          <View style={styles.headerItem}>
            <View style={styles.line}>
              <View style={styles.icon} />
              <Text style={styles.headerAmount}>{toAmountStr(usableLoanLimit, 2, true)}</Text>
            </View>
            <Text style={styles.headerText}>项目剩余可垫资金额</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: dp(40), alignItems: 'center' }}>
          {/* 合同金额 */}
          <View style={styles.headerItem}>
            <View style={styles.line}>
              <View style={[styles.icon, { backgroundColor: '#DDDDE8' }]} />
              <Text style={styles.headerAmount}>{toAmountStr(contractAmount, 2, true)}</Text>
            </View>
            <Text style={styles.headerText}>合同金额</Text>
          </View>
          {/* 申请金额 */}
          <View style={styles.headerItem}>
            <View style={styles.line}>
              <View style={[styles.icon, { backgroundColor: '#DDDDE8' }]} />
              <Text style={styles.headerAmount}>{toAmountStr(loanAmount, 2, true)}</Text>
            </View>
            <Text style={styles.headerText}>申请金额</Text>
          </View>
        </View>
      </View>

    )
  }

  renderProjectDetail = () => {
    return (
      <View>
        {this.renderHeader()}
        <Text style={styles.createOrder} onPress={this.creatOrder}>创建新订单</Text>

        <View style={styles.row}>
          <Text style={this.state.tabIndex === 0 ? styles.tab : styles.tab2} onPress={() => this.clickTab(0)}>{`订单(${this.state.orderList.length})`}</Text>
          <Text style={this.state.tabIndex === 1 ? styles.tab : styles.tab2} onPress={() => this.clickTab(1)}>{`货款(${this.state.loanList.length})`}</Text>
          <Text style={this.state.tabIndex === 2 ? styles.tab : styles.tab2} onPress={() => this.clickTab(2)}>摘要</Text>
        </View>
        {this.state.tabIndex === 0 && this.renderOrderList()}
        {this.state.tabIndex === 1 && this.renderLoanList()}

        {this.state.tabIndex === 2 && this.renderProjectInfo()}
        {this.state.tabIndex === 2 && this.renderLoanInfo()}

      </View>
    )
  }

  render () {
    const { navigation } = this.props
    const { approvalStatus } = this.props.navigation.state.params
    return (
      <View style={styles.container}>

        <NavBar
          title={'项目详情'}
          navigation={navigation}
          elevation={0.5}
        />
        <ScrollView
          refreshControl={
            <RefreshControl
              colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
        >
          {approvalStatus === 'DOING' && this.renderProjectInfo()}
          {approvalStatus === 'DOING' && this.renderLoanInfo()}

          {(approvalStatus === 'DONE' || approvalStatus === 'DISABLED') && this.renderProjectDetail()}

        </ScrollView>

        {this.renderModal()}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(ProjectDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  itemTitle: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: 'bold',
    marginBottom: dp(13)
  },
  itemContent: {
    padding: dp(30),
    margin: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16),
    borderColor: '#e5e5e5',
    borderWidth: dp(1)
  },
  itemText: {
    fontSize: dp(28),
    color: '#91969A',
    flex: 1,
    marginTop: dp(15)
  },
  itemText1: {
    fontSize: dp(28),
    color: '#91969A',
    marginTop: dp(15),
    width: dp(220)
  },
  itemRow: {
    flexDirection: 'row'
  },
  headerContainer: {
    marginTop: dp(30),
    marginHorizontal: dp(30),
    padding: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(32),
    elevation: 0,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  headerTitle: {
    color: '#2D2926',
    fontSize: dp(33),
    fontWeight: 'bold',
    marginBottom: dp(40),
    marginTop: dp(17)
  },
  headerAmount: {
    fontSize: dp(36),
    fontWeight: 'bold',
    marginHorizontal: dp(16)
  },
  headerItem: {
    flex: 1
  },
  headerText: {
    fontSize: dp(28),
    color: '#91969A',
    marginTop: dp(15)
  },
  icon: {
    width: dp(16),
    height: dp(36),
    backgroundColor: '#FECD00'
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dp(30),
    marginTop: dp(90),
    marginBottom: dp(10)
  },
  createOrder: {
    fontSize: dp(30),
    color: '#2D2926',
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: dp(30),
    paddingVertical: dp(30),
    backgroundColor: 'white',
    marginTop: dp(60),
    borderRadius: dp(48),
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    overflow: 'hidden'
  },
  tab: {
    color: '#353535',
    fontSize: dp(28),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: dp(22),
    borderRadius: dp(48),
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    overflow: 'hidden'
  },
  tab2: {
    color: '#91969A',
    fontSize: dp(28),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingVertical: dp(22),
    borderRadius: dp(48),
    overflow: 'hidden'
  },
  bottom: {
    color: '#A7ADB0',
    fontSize: dp(24),
    textAlign: 'center',
    marginVertical: dp(90)
  },
  itemRow2: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16),
    alignItems: 'flex-start',
    padding: dp(30),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  itemLeft: {
    flex: 1
  },

  itemTitile: {
    fontSize: dp(32),
    color: Color.TEXT_MAIN,
    fontWeight: 'bold',
    marginBottom: dp(6)
  },
  itemText2: {
    fontSize: dp(27),
    color: Color.TEXT_LIGHT,
    marginTop: dp(11)
  },
  itemBtn: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    backgroundColor: '#464678',
    color: 'white',
    fontSize: dp(24),
    borderRadius: dp(35),
    overflow: 'hidden'
  },
  itemBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(24)
  },
  itemBtn1: {
    marginTop: dp(25)
  },
  itemRow3: {
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16),
    alignItems: 'stretch',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  itemHeader: {
    flexDirection: 'row',
    backgroundColor: '#DDDDE8',
    height: dp(90),
    borderTopLeftRadius: dp(16),
    borderTopRightRadius: dp(16),
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemHeadText: {
    fontSize: dp(30),
    color: '#464678',
    fontWeight: 'bold',
    marginLeft: dp(30)
  },
  itemHeadText1: {
    fontSize: dp(24),
    color: '#464678',
    marginRight: dp(30)
  },
  itemContent2: {
    padding: dp(30)
  },
  itemText3: {
    fontSize: dp(26),
    color: '#91969A',
    marginTop: dp(11)
  },
  btnLine: {
    marginTop: dp(30),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  itemBtn3: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: '#464678',
    textAlign: 'center',
    borderRadius: dp(30),
    fontSize: dp(24),
    marginRight: dp(30),
    overflow: 'hidden'
  },
  itemBtn2: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(17),
    color: 'white',
    backgroundColor: 'rgba(70,70,120,0.5)',
    textAlign: 'center',
    borderRadius: dp(35),
    fontSize: dp(24),
    marginRight: dp(10),
    overflow: 'hidden'
  },
  validTime: {
    fontSize: dp(26),
    color: '#999999'
  }
})
