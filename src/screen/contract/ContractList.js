import React, { PureComponent } from 'react'
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { getCSContractList, getOtherContractList, getSecondContractInfo } from '../../actions'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Color from '../../utils/Color'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import CSContractList from './component/CSContractList'
import OtherContractList from './component/OtherContractList'
import SecondContractList from './component/SecondContractList'

/**
 * 合同列表
 */
class ContractList extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      refreshing: true,
      status: '0', // 0未签署 1已签署
      type: '0', // 0二级合同 1贸易合同 2其他
    }
    this.onRefresh = this.onRefresh.bind(this)
    this.changeStatus = this.changeStatus.bind(this)
  }

  componentDidMount() {
    if (this.props.companyInfo.companyTag.isSupportwoDistribution === '0') {
      this.setState({
        type: '2',
      })
    }
    this.didFocusListener = this.props.navigation.addListener('didFocus', obj => {
      this.init()
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  changeStatus(status) {
    this.setState({
      status,
    })
  }

  changeType(type) {
    this.setState({
      type,
    })
  }

  async init() {
    StatusBar.setBarStyle('dark-content')
    this.setState({
      refreshing: true,
    })
    await Promise.all([
      getSecondContractInfo({
        companyId: this.props.companyInfo.companyId,
      }),
      getCSContractList({
        name: '',
        page: 1,
        pageSize: 1000,
        ownerList: [this.props.companyInfo.companyId, this.props.supplierInfo.id],
      }),
      getOtherContractList({
        cifCompanyId: this.props.companyInfo.companyId,
        contractName: '',
      }),
    ]).catch(error => {
      console.log(error)
      this.setState({
        refreshing: false,
      })
    })
    // await getProductContractList({
    //   cifCompanyId: this.props.companyInfo.companyId
    // })
    this.setState({
      refreshing: false,
    })
  }

  onRefresh() {
    this.init()
  }

  render() {
    const { navigation, screenKey } = this.props
    const { status, type, refreshing } = this.state
    return (
      <View style={styles.container}>
        <NavBar
          title={'合同列表'}
          navigation={navigation}
          // onLeftPress={() => {
          // const resetAction = {
          //   index: 0,
          //   actions: [
          //     NavigationActions.navigate({
          //       routeName: 'MainTabs',
          //       action: NavigationActions.navigate({
          //         routeName: 'Mine'
          //       })
          //     })
          //   ]
          // }
          // this.props.navigation.dispatch(StackActions.reset(resetAction))
          // }}
        />
        <ScrollView
          refreshControl={
            <RefreshControl colors={[Color.THEME]} refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
          }
        >
          <View style={styles.contractMain}>
            <View style={styles.statusBtnMain}>
              <Touchable onPress={() => this.changeStatus('0')}>
                {status === '0' ? (
                  <Text style={[styles.btnText, styles.activedBtn]}>未签署</Text>
                ) : (
                  <Text style={[styles.btnText]}>未签署</Text>
                )}
              </Touchable>
              <Touchable onPress={() => this.changeStatus('1')}>
                {status === '0' ? (
                  <Text style={[styles.btnText, styles.statusBorderRightRadis]}>已签署</Text>
                ) : (
                  <Text style={[styles.btnText, styles.activedBtn]}>已签署</Text>
                )}
              </Touchable>
            </View>
            {this.props.companyInfo.companyTag.isSupportwoDistribution === '0' ? (
              <View style={styles.typeBtnMain}>
                <Touchable style={type === '1' ? styles.borderRadius : ''} onPress={() => this.changeType('1')}>
                  {type === '1' ? (
                    <Text style={[styles.typeBtnText, styles.typeActivedBtn, styles.halfBtn]}>贸易合同</Text>
                  ) : (
                    <Text style={[styles.typeBtnText, styles.halfBtn]}>贸易合同</Text>
                  )}
                </Touchable>
                <Touchable style={type === '2' ? styles.borderRadius : ''} onPress={() => this.changeType('2')}>
                  {type === '2' ? (
                    <Text style={[styles.typeBtnText, styles.typeActivedBtn, styles.halfBtn]}>其他</Text>
                  ) : (
                    <Text style={[styles.typeBtnText, styles.halfBtn]}>其他</Text>
                  )}
                </Touchable>
              </View>
            ) : (
              <View style={styles.typeBtnMain}>
                <Touchable style={type === '0' ? styles.borderRadius : ''} onPress={() => this.changeType('0')}>
                  {type === '0' ? (
                    <Text style={[styles.typeBtnText, styles.typeActivedBtn]}>二级</Text>
                  ) : (
                    <Text style={styles.typeBtnText}>二级</Text>
                  )}
                </Touchable>
                <Touchable style={type === '1' ? styles.borderRadius : ''} onPress={() => this.changeType('1')}>
                  {type === '1' ? (
                    <Text style={[styles.typeBtnText, styles.typeActivedBtn]}>贸易合同</Text>
                  ) : (
                    <Text style={styles.typeBtnText}>贸易合同</Text>
                  )}
                </Touchable>
                <Touchable style={type === '2' ? styles.borderRadius : ''} onPress={() => this.changeType('2')}>
                  {type === '2' ? (
                    <Text style={[styles.typeBtnText, styles.typeActivedBtn]}>其他</Text>
                  ) : (
                    <Text style={styles.typeBtnText}>其他</Text>
                  )}
                </Touchable>
              </View>
            )}
            {type === '0' ? (
              !refreshing && (
                <SecondContractList
                  status={status}
                  navigation={navigation}
                  refresh={() => {
                    this.onRefresh()
                  }}
                />
              )
            ) : type === '1' ? (
              <CSContractList
                status={status}
                navigation={navigation}
                refresh={() => {
                  this.onRefresh()
                }}
              />
            ) : (
              <OtherContractList
                status={status}
                navigation={navigation}
                refresh={() => {
                  this.onRefresh()
                }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG,
  },
  contractMain: {
    paddingVertical: dp(40),
    paddingHorizontal: dp(30),
  },
  statusBtnMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dp(70),
    borderRadius: dp(36),
    borderWidth: dp(2),
    borderColor: Color.THEME,
    overflow: 'hidden',
  },
  btnText: {
    color: Color.THEME,
    textAlign: 'center',
    width: (DEVICE_WIDTH - dp(60)) * 0.5,
    lineHeight: dp(72),
    fontSize: dp(32),
  },
  typeBtnMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dp(40),
  },
  typeBtnText: {
    textAlign: 'center',
    width: (DEVICE_WIDTH - dp(60)) * (1 / 3),
    lineHeight: dp(60),
    fontSize: dp(28),
    color: '#91969A',
  },
  halfBtn: {
    width: DEVICE_WIDTH * 0.48,
  },
  activedBtn: {
    backgroundColor: Color.THEME,
    color: Color.WHITE,
  },
  borderRadius: {
    borderRadius: dp(30),
    backgroundColor: Color.WHITE,
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  typeActivedBtn: {
    color: '#353535',
  },
  supplierList: {
    marginBottom: dp(40),
    backgroundColor: Color.WHITE,
  },
  supplierName: {
    color: '#888',
    padding: dp(30),
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
  },
  item: {
    backgroundColor: Color.WHITE,
    paddingVertical: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    paddingRight: dp(30),
  },
  itemRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemTitle: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.65,
  },
  arrow: {
    marginLeft: dp(10),
  },
  itemStatus: {
    fontSize: dp(28),
    color: '#888',
  },
  statusWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier,
    secondContractList: state.contract.secondContractList,
  }
}

export default connect(mapStateToProps)(ContractList)
