import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback
} from 'react-native'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import { SolidBtn } from '../../../component/CommonButton'
import Touchable from '../../../component/Touchable'
import Modal from 'react-native-modal'
import ajaxStore from '../../../utils/ajaxStore'
import PropTypes from 'prop-types'
import { webUrl } from '../../../utils/config'

/**
 * 其他类型合同
 */
class OtherContractList extends PureComponent {
  static defaultProps = {
    status: '0',
    navigation: '',
    refresh: () => { }
  }

  static propTypes = {
    status: PropTypes.string.isRequired,
    navigation: PropTypes.object.isRequired,
    refresh: PropTypes.func
  }

  static getDerivedStateFromProps (nextProps) {
    return {
      status: nextProps.status
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      status: '0', // 0未签署 1已签署
      threeParty: ['3', '6', '15', '28', '30']
    }
    this.toContractDetail = this.toContractDetail.bind(this)
  }

  toContractDetail (item) {
    const { contractCode, electronSchedule, contractType } = item
    this.checkProcessId(item)

    // const url = electronSchedule === 'SIGN_SUCCESS'
    //   ? 'OtherContractDetail'
    //   : this.state.threeParty.indexOf(contractType) > -1
    //     ? 'OtherSignPersonList'
    //     : 'OtherContractSign'
    // this.props.navigation.navigate(url, { contractCode, cifComanpyId: this.props.companyInfo.companyId, idNumber: this.props.companyInfo.legalPersonCertId, name: this.props.companyInfo.legalPerson })
  }

  async checkProcessId (item) {
    const res = await ajaxStore.contract.checkProcessId({ code: item.contractCode })
    if (res.data && res.data.code === '0') {
      const processInstanceId = res.data.data.processInstanceId || ''
      if (this.state.status === '1') {
        const isOld = processInstanceId ? 0 : 1
        this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/contractDetail?processInstanceId=${processInstanceId}&contractCode=${item.contractCode}&isNew=1&isOld=${isOld}`, title: '合同详情' })
      } else if (!processInstanceId) {
        this.startProcess(item)
      } else {
        this.toSignerList(processInstanceId, item.contractCode)
      }
    }
  }

  toSignerList (processInstanceId, contractCode) {
    this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/secondSignPersonList?processInstanceId=${processInstanceId || ''}&contractCode=${contractCode}`, title: '合同签约' })
  }

  async startProcess (contractItem) {
    console.log(contractItem, 'contractItem')
    const supplierId = contractItem.supplierId ? contractItem.supplierId : (contractItem.project ? contractItem.project.supplierId : '')
    const res = await ajaxStore.contract.startProcess({
      code: contractItem.contractCode,
      companyId: this.props.companyInfo.companyId,
      supplierId
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.toSignerList(data, contractItem.contractCode)
    }
  }

  componentDidMount () {
  }

  renderItem (item, index) {
    const { status } = this.state
    return (
      <View key={index}>
        {item.status === status &&
          <Touchable isNativeFeedback={true} onPress={() => this.toContractDetail(item)}>
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.contractName}</Text>
              <View style={styles.itemRight}>
                {status === '1' ? (
                  <View style={styles.statusWrap}>
                    <Text style={styles.itemStatus}>已签署</Text>
                    <Iconfont style={styles.arrow} name={'icon-signed'} size={dp(30)} />
                  </View>
                ) : (
                  <View style={styles.statusWrap}>
                    <Text style={styles.itemStatus}>待签署</Text>
                    <Iconfont style={styles.arrow} name={'icon-unsigned'} size={dp(30)} />
                  </View>
                )}
                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
              </View>
            </View>
          </Touchable>
        }
      </View>
    )
  }

  renderMore (data) {
    const { status } = this.state
    let noSignNum = 0
    let signedNum = 0
    this.props.companyContractList && this.props.companyContractList.map((item, key) => {
      if (item.status === '1') {
        signedNum++
      } else {
        noSignNum++
      }
    })
    this.props.projectContractList && this.props.projectContractList.filter((item, key) => {
      return true
    }).map((projectItem, index) => {
      projectItem.projectVOList && projectItem.projectVOList.map((item, key) => {
        if (item.status === '1') {
          signedNum++
        } else {
          noSignNum++
        }
      })
    })
    return (
      <View>
        {this.props.projectContractList && this.props.projectContractList.map((item, key) => {
          return (
            <View key={key}>
              {((status === '0' && (item.noSignNum !== 0 || item.orderNoSignNum !== 0)) || (status === '1' && (item.signedNum !== 0 || item.orderSignedNum !== 0))) &&
                <View style={styles.supplierList}>
                  <Text style={styles.supplierName}>{`项目名称：${item.projectName}`}</Text>
                  <View style={styles.borderRadius}>
                    {item.projectVOList && item.projectVOList.map((contractItem, index) => {
                      return (
                        <View key={index}>
                          {contractItem.status === status &&
                            <Touchable isNativeFeedback={true} onPress={() => this.toContractDetail(contractItem)}>
                              <View style={styles.item}>
                                <Text style={styles.itemTitle}>{contractItem.contractName}</Text>
                                <View style={styles.itemRight}>
                                  {contractItem.status === '1' ? (
                                    <View style={styles.statusWrap}>
                                      <Text style={styles.itemStatus}>已签署</Text>
                                      <Iconfont style={styles.arrow} name={'icon-signed'} size={dp(30)} />
                                    </View>
                                  ) : (
                                    <View style={styles.statusWrap}>
                                      <Text style={styles.itemStatus}>待签署</Text>
                                      <Iconfont style={styles.arrow} name={'icon-unsigned'} size={dp(30)} />
                                    </View>
                                  )}
                                  <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                                </View>
                              </View>
                            </Touchable>
                          }
                        </View>
                      )
                    })}
                  </View>
                  {item.orderContractVOList.length && ((status === '0' && item.orderNoSignNum !== 0) || (status === '1' && item.orderSignedNum !== 0)) ? (
                    <Text style={styles.supplierName}>{'订单关联合同'}</Text>
                  ) : (null)
                  }
                  <View style={styles.borderRadius}>
                    {item.orderContractVOList.map((orderItem, j) => {
                      return (
                        <View key={j}>
                          {orderItem.status === status &&
                          <Touchable isNativeFeedback={true} onPress={() => this.toContractDetail(orderItem)}>
                            <View style={styles.item}>
                              <Text style={styles.itemTitle}>{orderItem.contractName}</Text>
                              <View style={styles.itemRight}>
                                {orderItem.status === '1' ? (
                                  <View style={styles.statusWrap}>
                                    <Text style={styles.itemStatus}>已签署</Text>
                                    <Iconfont style={styles.arrow} name={'icon-signed'} size={dp(30)} />
                                  </View>
                                ) : (
                                  <View style={styles.statusWrap}>
                                    <Text style={styles.itemStatus}>待签署</Text>
                                    <Iconfont style={styles.arrow} name={'icon-unsigned'} size={dp(30)} />
                                  </View>
                                )}
                                <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
                              </View>
                            </View>
                          </Touchable>
                          }
                        </View>
                      )
                    })}
                  </View>
                </View>
              }
            </View>
          )
        })}
        {(status === '0' && noSignNum === 0) || (status === '1' && signedNum === 0) ? (
          <View style={styles.emptyContainer}>
            <Iconfont name={'icon-order'} size={dp(140)} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>暂时没有合同</Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.indicatorText, { paddingVertical: dp(30) }]}>—— 页面到底了 ——</Text>
          </View>
        )}
      </View>
    )
  }

  render () {
    const { navigation, dataSource } = this.props
    return (
      <View style={styles.container}>
        <View style={styles.borderRadius}>
          { this.props.companyContractList && this.props.companyContractList.map((item, key) => {
            return (
              this.renderItem(item, key)
            )
          })
          }
        </View>
        {this.renderMore()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.24
  },
  borderRadius: {
    borderRadius: dp(16),
    backgroundColor: Color.WHITE,
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  supplierList: {
    marginTop: dp(60)
  },
  supplierName: {
    color: '#2D2926',
    paddingBottom: dp(30),
    fontWeight: 'bold'
  },
  item: {
    paddingVertical: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    paddingRight: dp(30)
  },
  itemRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  itemTitle: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.65
  },
  arrow: {
    marginLeft: dp(10)
  },
  itemStatus: {
    fontSize: dp(28),
    color: '#888'
  },
  statusWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  indicatorText: {
    color: '#A7ADB0'
  },
  emptyIcon: {
    backgroundColor: '#ebebf1',
    marginBottom: dp(35),
    borderRadius: dp(70),
    overflow: 'hidden'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    companyContractList: state.contract.otherContractList.companyContractList,
    projectContractList: state.contract.otherContractList.projectContractList
  }
}

export default connect(mapStateToProps)(OtherContractList)
