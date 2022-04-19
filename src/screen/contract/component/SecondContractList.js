import React, { PureComponent } from 'react'
import { View, StyleSheet, Button, ScrollView, Text, RefreshControl } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import Iconfont from '../../../iconfont/Icon'
import Touchable from '../../../component/Touchable'
import PropTypes from 'prop-types'
import { contractType } from '../../../utils/enums'
import ajaxStore from '../../../utils/ajaxStore'
import { webUrl } from '../../../utils/config'
import AddSupplier from '../../credit/component/AddSupplier'
import {
  getSecondContractInfo
} from '../../../actions'

/**
 * 二级合同列表
 */
class SecondContractList extends PureComponent {
  static defaultProps = {
    status: '0',
    navigation: '',
    refresh: () => {}
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
      factoryModal: false
    }
    this.toContractDetail = this.toContractDetail.bind(this)
    this.addSupplier = this.addSupplier.bind(this)
  }

  addSupplier () {
    this.props.navigation.navigate('AddSupplier', { source: 'ContractList', refresh: () => { this.props.refresh() } })
  }

  componentDidMount () {

  }

  toContractDetail (contractItem, isGuarantor) {
    let code
    let processInstanceId
    if (isGuarantor) {
      code = contractItem.guarantor.code
      processInstanceId = contractItem.guarantor.processInstanceId
    } else {
      code = contractItem.code
      processInstanceId = contractItem.processInstanceId
    }
    console.log(contractItem, 'contractItem')
    if (this.state.status === '1') {
      const isOld = processInstanceId ? 0 : 1
      this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/contractDetail?processInstanceId=${processInstanceId}&contractCode=${code}&isNew=1&isOld=${isOld}`, title: '合同详情' })
    } else if (!code) {
      this.createContract(contractItem, isGuarantor)
    } else if (!processInstanceId) {
      this.startProcess(contractItem, isGuarantor)
    } else {
      this.toSignerList(processInstanceId, code)
    }
  }

  toSignerList (processInstanceId, contractCode) {
    this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/secondSignPersonList?processInstanceId=${processInstanceId}&contractCode=${contractCode}`, title: '合同签约' })
  }

  async startProcess (contractItem, isGuarantor) {
    const code = isGuarantor ? contractItem.guarantor.code : contractItem.code
    const res = await ajaxStore.contract.startProcess({
      code,
      companyId: this.props.companyInfo.companyId
    })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.toSignerList(data, contractItem.code)
    }
  }

  async createContract (contractItem, isGuarantor) {
    let data
    console.log(contractItem.type, 'contractItem.type')
    const type = contractItem.type || (isGuarantor ? '13' : contractItem.type)
    switch (type) {
      case '6':
      case '13':
      case '34':
        data = {
          contractType: type,
          companyId: this.props.companyInfo.companyId,
          guarantorList: contractItem.guarantorList
        }
        break
      default:
        data = {
          supplierId: contractItem.supplierId,
          brandCode: contractItem.brandCode,
          categoryCode: contractItem.categoryCode,
          contractType: contractItem.type,
          companyId: this.props.companyInfo.companyId,
          productCode: contractItem.productCode
        }
        break
    }
    console.log(data, 'postdata')
    const res = await ajaxStore.contract.createSecondContract(data)
    console.log(res.data.data, 'response')
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      this.toSignerList(data.processInstanceId, data.code)
    }
  }

  hideFactoryModal = () => {
    this.setState({ factoryModal: false })
  }

  showFactoryModal = () => {
    this.setState({ factoryModal: true })
  }

  render () {
    const { secondContractList, guarantorContractList, guarantorContractsNoTicket } = this.props
    const { status } = this.state
    let isShowOther = false
    guarantorContractList && guarantorContractList.map((contractItem, contractKey) => {
      if (!contractItem.guarantor.delete && contractItem.guarantor.signStatus === status) {
        isShowOther = true
      }
    })
    guarantorContractsNoTicket && guarantorContractsNoTicket.map((contractItem, contractKey) => {
      if (contractItem.guarantor.signStatus === status) {
        isShowOther = true
      }
    })
    return (
      <View style={styles.contractList}>
        { isShowOther &&
          <View style={[styles.supplierList, styles.borderRadius]}>
            {guarantorContractList && guarantorContractList.map((contractItem, contractKey) => {
              return (
                !contractItem.guarantor.delete && contractItem.guarantor.signStatus === status &&
                <Touchable key={contractKey} isHighlight={true} onPress={() => this.toContractDetail(contractItem, true)}>
                  <View style={styles.item}>
                    { contractItem.guarantor.type === '1' ? (
                      <Text style={styles.itemTitle}>{`最高额担保合同（${contractItem.guarantor.companyName}）`}</Text>
                    ) : (
                      <Text style={styles.itemTitle}>{`最高额担保合同（${contractItem.guarantor.name}）`}</Text>
                    )}
                    <View style={styles.itemRight}>
                      {contractItem.guarantor.signStatus === '1' ? (
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
              )
            })}
            { guarantorContractsNoTicket && guarantorContractsNoTicket.map((contractItem, contractKey) => {
              return (contractItem.guarantor.signStatus === status &&
                <Touchable key={contractKey} isHighlight={true} onPress={() => this.toContractDetail(contractItem, true)}>
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>{`担保函（${contractItem.guarantorList[0].name}）`}</Text>
                    <View style={styles.itemRight}>
                      {contractItem.guarantor.signStatus === '1' ? (
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
              )
            })
            }
          </View>
        }
        { secondContractList && secondContractList.map((item, key) => {
          return (
            <View key={key}>
              { item.contractList.filter((i) => { return i.signStatus === status }).length > 0 &&
                <View style={styles.supplierList}>
                  <Text style={styles.supplierName}>{item.supplierName}</Text>
                  <View style={styles.borderRadius}>
                    { item.contractList.map((contractItem, contractKey) => {
                      return (
                        contractItem.signStatus === status &&
                        <Touchable key={contractKey} isHighlight={true} onPress={() => this.toContractDetail(contractItem)}>
                          <View style={styles.item}>
                            {contractItem.type === '34' ? (
                              <Text style={styles.itemTitle}>{`${contractItem.productName}·${contractType[contractItem.type]}`}</Text>
                            ) : (
                              <Text style={styles.itemTitle}>{`${contractItem.productName}·${contractType[contractItem.type]}`}</Text>
                            )}

                            <View style={styles.itemRight}>
                              <View style={styles.itemRight}>
                                {contractItem.signStatus === '1' ? (
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
                          </View>
                        </Touchable>
                      )
                    })}
                  </View>

                </View>
              }
            </View>
          )
        })
        }
        <Touchable style={styles.addSupplier} isHighlight={true} onPress={() => this.showFactoryModal()}>
          <Text style={styles.addSupplierText}>添加一级经销商</Text>
        </Touchable>
        <AddSupplier
          ref={child => this.selectSupplier = child}
          cancel = {() => {
            this.hideFactoryModal()
          }}
          confirm = {async (supplier) => {
            getSecondContractInfo({
              companyId: this.props.companyInfo.companyId
            })
          }}
          infoModal={this.state.factoryModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
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
    marginBottom: dp(60)
  },
  supplierName: {
    color: '#2D2926',
    paddingBottom: dp(30),
    fontWeight: 'bold'
  },
  item: {
    padding: dp(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  itemRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  itemTitle: {
    width: DEVICE_WIDTH * 0.6
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
  addSupplierText: {
    fontSize: dp(30),
    color: '#fff',
    textAlign: 'center',
    padding: dp(15)
  },
  addSupplier: {
    width: DEVICE_WIDTH * 0.35,
    backgroundColor: '#464678',
    borderRadius: dp(32),
    marginTop: dp(50),
    marginLeft: dp(30),
    marginBottom: dp(50)
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    secondContractList: state.contract.secondContractList,
    guarantorContractList: state.contract.guarantorContractList,
    memberFeeContractList: state.contract.memberFeeContractList,
    guarantorContractsNoTicket: state.contract.guarantorContractsNoTicket
  }
}

export default connect(mapStateToProps)(SecondContractList)
