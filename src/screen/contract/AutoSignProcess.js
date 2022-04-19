import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  ActivityIndicator
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import {
  getSecondContractInfo,
  getProductContractList
} from '../../actions'
import { connect } from 'react-redux'
import { SolidBtn } from '../../component/CommonButton'
import { StackActions, NavigationActions } from 'react-navigation'

class AutoSignProcess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      idcardName: '',
      idcardNumber: '',
      idcardNameStr: '',
      idcardNumberStr: '',
      memberStatus: 'SIGN_PROCESS',
      firstDone: false,
      continueLoading: true,
      num: 0
    }
  }

  initRealName () {
    const { idcardName, idcardNumber } = this.props.navigation.state.params
    let idcardNameStr = idcardName
    idcardNameStr = idcardNameStr.split('')
    idcardNameStr.splice(idcardNameStr.length - 2, 1, '*')
    idcardNameStr = idcardNameStr.join('')
    let idcardNumberStr = idcardNumber
    idcardNumberStr = idcardNumberStr.split('')
    idcardNumberStr.splice(6, 10, '**********')
    idcardNumberStr = idcardNumberStr.join('')
    this.setState({
      idcardName,
      idcardNumber,
      idcardNameStr,
      idcardNumberStr
    })
  }

  async getAllContractInfo () {
    let continueLoading = false
    await getSecondContractInfo()
    getProductContractList({
      cifCompanyId: this.props.companyInfo.companyId
    })
    const { memberFeeContractList, twoPartyContractList, infoContractList } = this.props.contractInfo
    let memberStatus
    if (memberFeeContractList && memberFeeContractList.length > 0) {
      const memberFeeList = memberFeeContractList.filter((item) => {
        return item.signWay === 'SEC_ONLINE'
      })
      if (memberFeeList && memberFeeList.length > 0) {
        memberStatus = memberFeeList[0].status || 'SIGN_FAIL'
      } else {
        memberStatus = 'SIGN_FAIL'
      }
    } else {
      memberStatus = 'SIGN_FAIL'
    }

    if (memberStatus === 'SIGN_PROCESS') {
      continueLoading = true
    }

    if (twoPartyContractList) {
      twoPartyContractList.map((item, key) => {
        if (item.contractVO && item.contractVO.status === 'SIGN_PROCESS') {
          continueLoading = true
        }
      })
    }

    if (infoContractList) {
      infoContractList.map((item, key) => {
        if (item.contractVO && item.contractVO.status === 'SIGN_PROCESS') {
          continueLoading = true
        }
      })
    }
    const num = this.state.num + 1
    this.setState({
      memberStatus,
      firstDone: true,
      continueLoading,
      num
    })

    if (continueLoading) {
      setTimeout(() => {
        this.getAllContractInfo()
      }, 3000)
    }
  }

  componentDidMount () {
    this.initRealName()
    this.getAllContractInfo()
  }

  render () {
    const { navigation, contractInfo, screenKey } = this.props
    const { idcardNameStr, idcardNumberStr, memberStatus, firstDone, continueLoading, num } = this.state
    const { twoPartyContractList, infoContractList } = contractInfo
    return (
      <View >
        <NavBar title={'认证结果'} navigation={navigation} onLeftPress={() => {
          const resetAction = {
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'MainTabs',
                action: NavigationActions.navigate({
                  routeName: 'Home'
                })
              })
            ]
          }
          this.props.navigation.dispatch(StackActions.reset(resetAction))
        }} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <View style={styles.resultItem}>
              <View style={styles.resultDetail}>
                <Text style={styles.resultTitle}>法人实名认证成功！</Text>
                <Text style={styles.resultText}>{`法人姓名：${idcardNameStr}`}</Text>
                <Text style={styles.resultText}>{`法人身份证：${idcardNumberStr}`}</Text>
              </View>
              <Iconfont style={styles.resultIcon} name={'icon-success'} size={dp(220)} />
            </View>
            {/* {memberStatus === 'SIGN_SUCCESS' ? (
              <View style={styles.resultItem}>
                <View style={styles.resultDetail}>
                  <Text style={styles.resultTitle}>《会员费协议》在线签署成功！</Text>
                  <Text style={styles.resultText}>您可以在第二步——合同在线签约，查看《会员费》协议签署详情。</Text>
                </View>
                <Iconfont style={styles.resultIcon} name={'icon-success'} size={dp(220)} />
              </View>
            ) : memberStatus === 'SIGN_PROCESS' ? (
              <View style={styles.resultItem}>
                <View style={styles.resultDetail}>
                  <Text style={styles.resultTitle}>《会员费协议》在线签署中!</Text>
                </View>
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <View style={styles.resultItem}>
                <View style={styles.resultDetail}>
                  <Text style={styles.resultTitle}>《会员费协议》在线签署失败</Text>
                  <Text style={styles.resultText}>您可以在第二步——合同在线签约，再次尝试签署此合同。</Text>
                </View>
                <Iconfont style={styles.resultIcon} name={'icon-fail'} size={dp(220)} />
              </View>
            )
            } */}
            {twoPartyContractList && twoPartyContractList.map((item, key) => {
              return (
                item.contractVO && item.contractVO.status === 'SIGN_SUCCESS'
                  ? (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·两方合同》在线签署成功！`}</Text>
                        <Text style={styles.resultText}>{`您可以在第二步——合同在线签约，查看《${item.productName}》协议签署详情。`}</Text>
                      </View>
                      <Iconfont style={styles.resultIcon} name={'icon-success'} size={dp(220)} />
                    </View>
                  ) : (item.contractVO && item.contractVO.status === 'SIGN_PROCESS') || !firstDone ? (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·两方合同》在线签署中!`}</Text>
                      </View>
                      <ActivityIndicator size="large" />
                    </View>
                  ) : (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·两方合同》在线签署失败`}</Text>
                        <Text style={styles.resultText}>您可以在第二步——合同在线签约，再次尝试签署此合同。</Text>
                      </View>
                      <Iconfont style={styles.resultIcon} name={'icon-fail'} size={dp(220)} />
                    </View>
                  )
              )
            })}
            {infoContractList && infoContractList.map((item, key) => {
              return (
                item.contractVO && item.contractVO.status === 'SIGN_SUCCESS'
                  ? (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·信息系统服务协议》在线签署成功！`}</Text>
                        <Text style={styles.resultText}>{`您可以在第二步——合同在线签约，查看《${item.productName}》协议签署详情。`}</Text>
                      </View>
                      <Iconfont style={styles.resultIcon} name={'icon-success'} size={dp(220)} />
                    </View>
                  ) : (item.contractVO && item.contractVO.status === 'SIGN_PROCESS') || !firstDone ? (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·信息系统服务协议》在线签署中!`}</Text>
                      </View>
                      <ActivityIndicator size="large" />
                    </View>
                  ) : (
                    <View style={styles.resultItem} key={key}>
                      <View style={styles.resultDetail}>
                        <Text style={styles.resultTitle}>{`《${item.productName}·信息系统服务协议》在线签署失败`}</Text>
                        <Text style={styles.resultText}>您可以在第二步——合同在线签约，再次尝试签署此合同。</Text>
                      </View>
                      <Iconfont style={styles.resultIcon} name={'icon-fail'} size={dp(220)} />
                    </View>
                  )
              )
            })}
            {(!continueLoading || num > 5) &&
            <View style={styles.footerBtn}>
              <SolidBtn text='返回首页' style={{ marginTop: dp(70) }} onPress={() => {
                navigation.navigate('Home')
              }}/>
            </View>
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  resultItem: {
    borderBottomWidth: dp(1),
    color: Color.SPLIT_LINE,
    marginHorizontal: dp(30),
    paddingVertical: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: dp(300)
  },
  resultTitle: {
    fontSize: dp(32),
    fontWeight: 'bold',
    marginBottom: dp(20)
  },
  resultText: {
    color: Color.TEXT_LIGHT
  },
  resultDetail: {
    width: DEVICE_WIDTH * 0.65
  },
  resultIcon: {

  },
  pageMain: {
    paddingBottom: dp(300)
  },
  footerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    contractInfo: state.contract,
    screenKey: state.cache.screenKey
  }
}

export default connect(mapStateToProps)(AutoSignProcess)
