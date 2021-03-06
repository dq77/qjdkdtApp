import React, { PureComponent } from 'react'
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import CheckBox from 'react-native-check-box'
import Modal, { ModalButton, ModalContent, ModalFooter, ScaleAnimation } from 'react-native-modals'
import AlertModal from '../../component/AlertModal'
import BottomFullModal from '../../component/BottomFullModal'
import { SolidBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { onEvent } from '../../utils/AnalyticsUtil'
import Color from '../../utils/Color'
import { getRealDP as dp } from '../../utils/screenUtil'
import { isNumber, toAmountStr } from '../../utils/Utility'
import ChooseCoupon from '../mine/component/ChooseCoupon'

export default class LoanPay extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      refundInfo: {},
      applyInfo: {},
      inputVal: '',
      inputShowed: false,
      loanInfoId: '',
      canGoDetail: false,
      payChecked: true,
      alertModal: false,
      alertTitle: '',
      alertContent: '',
      detailModal: false,
      commitModal: false,
      infoModal: false,
      dataNormalNum: 0,
      selectItemData: null,
    }
  }

  componentDidMount() {
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      StatusBar.setBarStyle('light-content')
    })
    this.didBlurListener = this.props.navigation.addListener('didBlur', (obj) => {
      StatusBar.setBarStyle('dark-content')
    })
    const { loanCode, canGoDetail } = this.props.navigation.state.params
    this.setState({
      loanInfoId: loanCode,
      canGoDetail,
    })
    this.onRefresh()
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.didBlurListener.remove()
  }

  onRefresh = () => {
    this.setState({
      refreshing: true,
    })
    this.loadData()
  }

  async loadData() {
    this.couponFind()
    const res = await ajaxStore.loan.getRepaymentDetail({
      loanInfoId: this.props.navigation.state.params.loanCode || '',
    })
    if (res.data && res.data.code === '0') {
      this.setState({ refundInfo: res.data.data, refreshing: false })
    }
  }

  // ???????????????1: ?????? 2. ????????? 3. ??????
  async couponFind() {
    const data = {
      state: '1', // ????????? 1: ?????? 2. ????????? 3. ??????
      pageNo: '1',
      pageSize: '100',
      timeBetween: true,
      scene: '1',
      order: 'ASC', // ASC ????????? DESC ????????? ???????????????
      orderBy: 'endTime',
    }
    const res = await ajaxStore.company.couponFind(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        dataNormalNum: res.data.data.pagedRecords.length,
      })
    }
  }

  submit = () => {
    if (!(isNumber(this.state.inputVal) && parseFloat(this.state.inputVal) > 0)) {
      this.setState({
        alertTitle: '??????????????????0',
        alertContent: '????????????????????????0',
        alertModal: true,
      })
    } else {
      this.getRepayCoupon()
    }
  }

  async getRepayCoupon() {
    const data = {
      otherExpenses: this.state.refundInfo.receivables, // ????????????
      bankDepositAmount: this.state.inputVal, // ????????????
      loanInfoId: this.state.loanInfoId, // ????????????
      couponCode: this.state.selectItemData ? this.state.selectItemData.couponCode : null,
      couponId: this.state.selectItemData ? this.state.selectItemData.id : null,
    }
    const res = await ajaxStore.loan.getRepayCoupon(data)

    if (res.data && res.data.code === '0') {
      if (Number(this.state.inputVal) > Number(this.state.refundInfo.maxRepayAmount)) {
        this.setState({
          alertTitle: '????????????????????????????????????',
          alertContent: '??????????????????????????????????????????',
          alertModal: true,
        })
      } else if (Number(this.state.inputVal - res.data.data) > Number(this.state.refundInfo.bankBalanceAvailable)) {
        this.setState({
          alertTitle: '????????????????????????????????????',
          alertContent: '??????????????????????????????????????????',
          alertModal: true,
        })
      } else {
        this.applyRefund()
      }
    }
  }

  // ??????????????????
  async applyRefund() {
    const data = {
      otherExpenses: this.state.refundInfo.receivables,
      bankDepositAmount: this.state.inputVal,
      loanInfoId: this.state.loanInfoId,
      couponCode: this.state.selectItemData ? this.state.selectItemData.couponCode : null,
      couponId: this.state.selectItemData ? this.state.selectItemData.id : null,
    }
    const res = await ajaxStore.loan.applyRefund(data)
    if (res.data && res.data.code === '0') {
      this.setState({
        applyInfo: res.data.data,
        commitModal: true,
      })
    }
  }

  async doRefund() {
    const data = {
      otherExpenses: this.state.refundInfo.receivables, // ????????????
      bankDepositAmount: this.state.inputVal, // ????????????
      companyId: this.state.refundInfo.companyId, // ??????id
      companyName: this.state.refundInfo.companyName, // ????????????
      fromBankDepositAccount: this.state.refundInfo.bankAccountId, // ??????id
      loanInfoId: this.state.loanInfoId, // ????????????
    }
    if (this.state.applyInfo.couponSaving && this.state.applyInfo.couponSaving > 0) {
      data.couponCode = this.state.selectItemData ? this.state.selectItemData.couponCode : null
      data.couponId = this.state.selectItemData ? this.state.selectItemData.id : null
    }
    const res = await ajaxStore.loan.doRefund(data)
    if (res.data && res.data.code === '0') {
      onEvent('????????????', 'LoanPay', '/ofs/weixin/repayment/repayReg', {
        repaymentRecordNo: this.state.loanInfoId,
        processNo: '',
        repaymentMethod: '??????',
        repaymentForm: '????????????',
      })
      this.props.navigation.navigate('LoanPaySuccess')
    }
    this.props.navigation.navigate('LoanPaySuccess')
  }

  selectCoupon = () => {
    this.setState({
      infoModal: true,
    })
  }

  goDetail = () => {
    this.props.navigation.navigate('LoanDetail', {
      loanCode: this.state.loanInfoId,
    })
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.headerTitileRow}>
          <Text style={styles.headerTitle}>??????????????????</Text>
          <Text
            style={styles.headerDetail}
            onPress={() => {
              // this.setState({ detailModal: true })
              this.modal.show()
            }}
          >
            ??????
          </Text>
        </View>
        <Text style={styles.headerAmount}>{`${toAmountStr(this.state.refundInfo.minRepayAmount, 2, true)}`}</Text>
        <Text style={styles.hedaerDate}>{`???????????? ${this.state.refundInfo.currentRepayDate || ''}`}</Text>
      </View>
    )
  }

  renderRange() {
    return (
      <View style={styles.range}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.rangeTitle}>??????????????????</Text>
          {this.state.canGoDetail ? (
            <Text style={[styles.rangeText, { color: '#1A97F6' }]} onPress={this.goDetail}>
              ????????????????????????
            </Text>
          ) : null}
        </View>

        <View style={styles.rangeBg}>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeText}>??????????????????</Text>
            <Text style={styles.rangeText}>{`${toAmountStr(
              this.state.refundInfo.bankBalanceAvailable,
              2,
              true,
            )}`}</Text>
          </View>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeText}>??????????????????</Text>
            <Text style={styles.rangeText}>{`${toAmountStr(this.state.refundInfo.maxRepayAmount, 2, true)}`}</Text>
          </View>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeText}>????????????</Text>
            <Text style={styles.rangeText}>{`${toAmountStr(this.state.refundInfo.remainPrincipal, 2, true)}`}</Text>
          </View>
        </View>
      </View>
    )
  }

  renderAmount() {
    return (
      <View style={styles.range}>
        <View style={styles.amountTitle}>
          <Text style={styles.rangeTitle}>????????????</Text>
        </View>
        <Text style={styles.title}>?????????????????????(???)</Text>
        <View style={styles.amountItem}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              this.setState({ inputVal: text })
            }}
            value={this.state.inputVal}
            keyboardType="numeric"
            placeholder={'?????????????????????'}
            maxLength={16}
            placeholderTextColor={Color.TEXT_LIGHT}
          />
        </View>

        {this.state.dataNormalNum > 0 ? (
          <Touchable onPress={this.selectCoupon}>
            <View style={[styles.amountItem, { marginTop: dp(48), paddingHorizontal: dp(30) }]}>
              <Text style={styles.amountName}>???????????????</Text>
              {this.state.selectItemData ? (
                <Text style={[styles.amountContent, { color: 'red' }]}>
                  {this.state.selectItemData.price ? `-${this.state.selectItemData.price}` : ''}
                </Text>
              ) : (
                <Text style={styles.amountContent}>{`??????${this.state.dataNormalNum}???`}</Text>
              )}
              <Iconfont name={'arrow-right'} size={dp(20)} />
            </View>
          </Touchable>
        ) : null}
      </View>
    )
  }

  renderAlertModal() {
    return (
      <AlertModal
        title={this.state.alertTitle}
        content={this.state.alertContent}
        comfirmText={'??????'}
        cancel={() => {
          this.setState({ alertModal: false })
        }}
        confirm={() => {
          this.setState({ alertModal: false })
        }}
        infoModal={this.state.alertModal}
      />
    )
  }

  renderCommitModal() {
    if (Object.keys(this.state.applyInfo).length === 0 || Object.keys(this.state.refundInfo).length === 0) {
      return null
    }
    return (
      <Modal
        onTouchOutside={() => {
          this.setState({ commitModal: false })
        }}
        width={0.8}
        visible={this.state.commitModal}
        onSwipeOut={() => this.setState({ commitModal: false })}
        modalAnimation={
          new ScaleAnimation({
            initialValue: 0.1, // optional
            useNativeDriver: true, // optional
          })
        }
        onHardwareBackPress={() => {
          this.setState({ commitModal: false })
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text="??????"
              onPress={() => {
                this.setState({ commitModal: false })
              }}
              key="button-1"
              textStyle={{ color: Color.TEXT_MAIN, fontWeight: 'bold' }}
            />
            <ModalButton
              text="??????"
              onPress={async () => {
                await this.setState({ commitModal: false })
                this._timer = setInterval(() => {
                  this.doRefund()
                  this._timer && clearInterval(this._timer)
                }, 200)
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={styles.modalTitle}>
            {this.state.refundInfo.minRepayAmount > this.state.inputVal ? '????????????????????????????????????' : '??????????????????'}
          </Text>

          <View style={[styles.modalRow, { marginTop: dp(10) }]}>
            {this.state.refundInfo.minRepayAmount > this.state.inputVal ? (
              <Text style={styles.modalText}>
                {'??????????????????????????????????????????????????????????????????????????????????????????????????????????????????'}
              </Text>
            ) : (
              <Text style={styles.modalText}>{`??????????????????${this.state.inputVal}???????????????????????????`}</Text>
            )}
          </View>
          {this.state.applyInfo.couponSaving && this.state.applyInfo.couponSaving > 0 ? (
            <Text style={styles.modalText}>{`??????????????????${this.state.applyInfo.couponSaving.toFixed(2)}`}</Text>
          ) : null}
        </ModalContent>
      </Modal>
    )
  }

  renderDetailModal() {
    return (
      <Modal
        onTouchOutside={() => {
          this.setState({ detailModal: false })
        }}
        width={0.8}
        visible={this.state.detailModal}
        onSwipeOut={() => this.setState({ detailModal: false })}
        modalAnimation={
          new ScaleAnimation({
            initialValue: 0.1, // optional
            useNativeDriver: true, // optional
          })
        }
        onHardwareBackPress={() => {
          this.setState({ detailModal: false })
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text="??????"
              onPress={() => {
                this.setState({ detailModal: false })
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={styles.modalTitle}>????????????????????????</Text>
          <View style={styles.modalClomn}>
            <Text style={styles.modalText}>????????????????????????</Text>
            <Text style={styles.modalText}>{toAmountStr(this.state.refundInfo.principalNeedRepay, 2, true)}</Text>
          </View>
          <View style={styles.modalClomn}>
            <Text style={styles.modalText}>?????????????????????????????????</Text>
            <Text style={styles.modalText}>{toAmountStr(this.state.refundInfo.interestSubNeedRepay, 2, true)}</Text>
          </View>
          <View style={styles.modalClomn}>
            <Text style={styles.modalText}>???????????????????????????</Text>
            <Text style={styles.modalText}>{toAmountStr(this.state.refundInfo.compositeFeeNeedRepay, 2, true)}</Text>
          </View>
          <View style={styles.modalClomn}>
            <Text style={styles.modalText}>?????????????????????</Text>
            <Text style={styles.modalText}>{toAmountStr(this.state.refundInfo.penalNeedRepay, 2, true)}</Text>
          </View>
        </ModalContent>
      </Modal>
    )
  }

  renderModal = () => {
    return (
      <BottomFullModal
        ref={(ref) => {
          this.modal = ref
        }}
        title={'????????????'}
        confirm={null}
      >
        <View style={styles.range}>
          <Text style={styles.rangeTitle}>{`??????????????????  ${toAmountStr(
            this.state.refundInfo.minRepayAmount,
            2,
            true,
          )}`}</Text>
          <View style={styles.rangeBg}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeText}>????????????????????????</Text>
              <Text style={styles.rangeText}>{toAmountStr(this.state.refundInfo.principalNeedRepay, 2, true)}</Text>
            </View>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeText}>?????????????????????????????????</Text>
              <Text style={styles.rangeText}>{toAmountStr(this.state.refundInfo.interestSubNeedRepay, 2, true)}</Text>
            </View>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeText}>???????????????????????????</Text>
              <Text style={styles.rangeText}>{toAmountStr(this.state.refundInfo.compositeFeeNeedRepay, 2, true)}</Text>
            </View>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeText}>?????????????????????</Text>
              <Text style={styles.rangeText}>{toAmountStr(this.state.refundInfo.penalNeedRepay, 2, true)}</Text>
            </View>
          </View>
          <Text style={[styles.rangeTitle, { marginTop: dp(60), marginBottom: dp(28) }]}>{'????????????'}</Text>
          <Text style={[styles.rangeText, { color: '#91969A', lineHeight: dp(45) }]}>
            ????????????????????????????????????????????????????????????????????????????????????????????????
          </Text>
        </View>
      </BottomFullModal>
    )
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        {/* <StatusBar
          barStyle={'light-content'}
          translucent={true}
          backgroundColor={'transparent'}
        /> */}
        <NavBar
          title={'????????????'}
          navigation={navigation}
          elevation={10}
          stateBarStyle={{ backgroundColor: Color.THEME }}
          navBarStyle={{ backgroundColor: Color.THEME }}
          titleStyle={{ color: 'white' }}
          leftIconColor={'white'}
          rightIconColor={'white'}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl colors={[Color.THEME]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
          }
        >
          {this.renderHeader()}
          {this.renderRange()}
          {this.renderAmount()}

          <CheckBox
            style={styles.checkbox}
            checkBoxColor={Color.TEXT_LIGHT}
            uncheckedCheckBoxColor={Color.TEXT_LIGHT}
            checkedCheckBoxColor={'#00b2a9'}
            onClick={() => {
              this.setState({
                payChecked: !this.state.payChecked,
              })
            }}
            isChecked={this.state.payChecked}
            checkedImage={
              <Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
            }
            unCheckedImage={
              <Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(30)} color={Color.WX_GREEN} />
            }
            rightText={'??????????????????'}
            rightTextStyle={{ color: Color.TEXT_MAIN }}
          />

          <View style={{ alignItems: 'center', marginVertical: dp(30) }}>
            <SolidBtn
              style={{ borderRadius: dp(48) }}
              text={'????????????'}
              disabled={!this.state.payChecked}
              onPress={this.submit}
            />
          </View>
        </ScrollView>
        {this.renderAlertModal()}
        {/* {this.renderDetailModal()} */}
        {this.renderModal()}
        {this.renderCommitModal()}

        {this.state.infoModal && (
          <ChooseCoupon
            navigation={this.props.navigation}
            //  companyId={this.props.companyInfo.companyId}
            scene={'1'}
            cancel={() => {
              this.setState({
                infoModal: false,
              })
            }}
            comfirm={(selectItemData) => {
              console.log(selectItemData)
              this.setState({ selectItemData })
            }}
            infoModal={this.state.infoModal}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: dp(1.5),
    backgroundColor: '#e5e5e5',
    marginHorizontal: dp(30),
  },
  header: {
    backgroundColor: Color.THEME,
    alignItems: 'center',
  },
  headerTitileRow: {
    flexDirection: 'row',
    marginTop: dp(50),
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: 'white',
    fontSize: dp(33),
  },
  headerDetail: {
    color: 'orange',
    fontSize: dp(28),
    position: 'absolute',
    right: -dp(90),
  },
  headerAmount: {
    color: 'white',
    fontSize: dp(57),
    fontWeight: 'bold',
    marginTop: dp(30),
    marginRight: dp(25),
  },
  hedaerDate: {
    color: '#cccccc',
    fontSize: dp(28),
    marginTop: dp(30),
    marginBottom: dp(50),
  },
  range: {
    padding: dp(30),
    paddingTop: dp(50),
    paddingBottom: 0,
  },
  rangeTitle: {
    fontSize: dp(32),
    fontWeight: 'bold',
    color: '#2D2926',
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginBottom: dp(24),
    marginTop: dp(18),
  },
  amountText: {
    fontSize: dp(24),
    color: '#888888',
  },
  rangeBg: {
    backgroundColor: '#F8F8FA',
    borderRadius: dp(10),
    marginTop: dp(30),
    padding: dp(15),
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: dp(15),
  },
  rangeText: {
    fontSize: dp(28),
    color: '#333333',
  },
  amountTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dp(30),
  },
  amountItem: {
    flexDirection: 'row',
    height: dp(95),
    alignItems: 'center',
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    borderRadius: dp(16),
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    // textAlign: 'right',
    paddingVertical: dp(13),
    paddingHorizontal: dp(30),
    color: '#333333',
  },
  amountContent: {
    flex: 1,
    textAlign: 'right',
    fontSize: dp(28),
    color: '#888888',
    marginRight: dp(8),
  },
  checkbox: {
    margin: dp(30),
  },
  modalTitle: {
    fontSize: dp(38),
    fontWeight: 'bold',
    marginBottom: dp(30),
    textAlign: 'center',
  },
  modalRow: {
    marginBottom: dp(20),
    alignItems: 'center',
  },
  modalClomn: {
    marginBottom: dp(40),
    alignItems: 'center',
  },
  modalText: {
    fontSize: dp(32),
    color: '#888888',
    marginTop: dp(10),
  },
  modalRedText: {
    fontSize: dp(28),
    color: 'red',
  },
  bg: {
    backgroundColor: 'rgba(239,239,244,0.70)',
    height: dp(31),
    marginTop: dp(29),
  },
  spliteLine: {
    height: dp(1),
    backgroundColor: '#F2F2F2',
  },
  checkboxIcon: {
    // marginRight: dp(0)
  },
  amountName: {
    fontSize: dp(28),
    color: '#2D2926',
  },
})
