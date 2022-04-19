import React, { PureComponent } from 'react'
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Clipboard,
  Linking,
  RefreshControl
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn } from '../../component/CommonButton'
import ajaxStore from '../../utils/ajaxStore'
import Iconfont from '../../iconfont/Icon'
import { connect } from 'react-redux'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import StorageUtil from '../../utils/storageUtil'
import { endText, startText, pwd, webUrl, baseUrl } from '../../utils/config'
import { blurIdCard } from '../../utils/Utility'
import {
  getAgentList
} from '../../actions'

/**
 * AgentList
 */
class AgentList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      statusMap: {
        SIGN: '待签署',
        DO: '未到期',
        OVER: '已失效',
        INVALID: '已失效',
        SIGN_FAILURE: '已失效',
        null: '待签署'
      },
      infoModal: false,
      shareModal: false,
      refreshing: false
    }
    this.previewContract = this.previewContract.bind(this)
    this.agentCreateComfirm = this.agentCreateComfirm.bind(this)
    this.sendContract = this.sendContract.bind(this)
    this.onRefresh = this.onRefresh.bind(this)
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.onRefresh()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  getParams (item) {
    return {
      cifCompanyId: this.props.companyInfo.companyId,
      name: item.agentName,
      idNumber: item.agentNumber,
      contractType: '29',
      contractCode: item.contractCode
    }
  }

  agentCreateComfirm () {
    this.setState({
      infoModal: true
    })
  }

  async sendContract (item) {
    const params = this.getParams(item)
    let paramsString = ''
    for (const key in params) {
      paramsString += `${key}=${params[key]}&`
    }
    const shareText = `/signPage?${paramsString}`
    const processInstanceId = item.status === 'OVER' ? '' : (item.contractProcessId || '')
    const contractCode = item.status === 'OVER' ? '' : (item.contractCode || '')
    this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/agentAuth?companyId=${this.props.companyInfo.companyId}&companyName=${this.props.companyInfo.corpName}&regCode=${this.props.companyInfo.regNo || ''}&legalPersonCertId=${this.props.companyInfo.legalPersonCertId || ''}&legalPersonName=${this.props.companyInfo.legalPerson || ''}&legalArea=${this.props.companyInfo.legalArea || '0'}&processInstanceId=${processInstanceId}&contractCode=${contractCode}&personIdcard=${item.personIdcard}&personName=${item.personName}&relCode=${item.id}`, title: '签署授权委托协议' })
  }

  async onRefresh () {
    StatusBar.setBarStyle('dark-content')
    this.setState({
      refreshing: true
    })
    setTimeout(() => {
      global.loading.hide()
    }, 0)
    await getAgentList(this.props.companyInfo.companyId)
    this.setState({
      refreshing: false
    })
  }

  async previewContract (item) {
    const res = await ajaxStore.contract.getFileType({ contractCode: item.contractCode })
    // if (res.data && res.data.code === '0') {
    if (res.data === 'pdf') {
      this.props.navigation.navigate('PreviewPDF', { contractCode: item.contractCode, version: '3' })
    } else {
      this.props.navigation.navigate('WebView', {
        title: '文件查看',
        url: `${baseUrl}/ofs/front/contract/previewContract?contractCode=${item.contractCode}&time=${new Date().getTime()}`
      })
    }
    // }
  }

  render () {
    const { navigation, companyInfo } = this.props
    const { statusMap } = this.state
    return (
      <View style={styles.container}>
        <NavBar title={'添加授权委托人'} navigation={navigation} />
        <ScrollView refreshControl={
          <RefreshControl
            colors={[Color.THEME]}
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }>
          <View style={styles.pageMain}>
            <Text style={styles.title}>授权委托人</Text>
            {companyInfo.agentList.length ? (
              companyInfo.agentList.map((item, key) => {
                return (
                  <View style={styles.agentItem} key={key}>
                    <Text style={styles.tips}>{`委托人${key + 1}`}</Text>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>姓名</Text>
                      <Text style={styles.detailContent}>{item.personName}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>性别</Text>
                      <Text style={styles.detailContent}>{item.personGender === '1' ? '男' : '女'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>身份证号码</Text>
                      <Text style={styles.detailContent}>{blurIdCard(item.personIdcard)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>有效期</Text>
                      <Text style={styles.detailContent}>{item.endTime || '长期'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>状态</Text>
                      <Text style={styles.detailContent}>{statusMap[item.status]}</Text>
                      {(item.status === 'SIGN' || item.status === null || item.status === 'OVER') &&
                        <Touchable style={styles.sendContract} isHighlight={true} onPress={() => this.sendContract(item)}>
                          <Text style={styles.sendContractText}>立即签署</Text>
                        </Touchable>
                      }
                    </View>
                    { item.contractCode &&
                      <Touchable isNativeFeedback={true} onPress={() => { this.previewContract(item) }}>
                        <View style={styles.detailItem}>
                          <View style={styles.label}>
                            <Iconfont name='icon-pdf1' size={dp(50)} />
                            <Text style={styles.contractName}>授权委托协议</Text>
                          </View>
                          <Iconfont name='arrow-right1' size={dp(30)} />
                        </View>
                      </Touchable>
                    }
                  </View>
                )
              })
            ) : (
              <Text style={styles.tips}>暂未添加任何授权委托人</Text>
            )}
            <View style={styles.footer}>
              <SolidBtn onPress={() => { this.agentCreateComfirm() }} style={styles.btn} text={'添加授权委托人'} />
            </View>
          </View>
        </ScrollView>
        <ComfirmModal
          title={'声明'}
          content={'委托人特别授权受托人办理线上签约，因委托人自己保管不善、导致账户和密码被使用，产生的一切经济纠纷及法律责任都由委托人自行承担，需授权委托书公司盖章、法定代表人签字、受托人签字。'}
          cancelText={'取消'}
          comfirmText={'同意'}
          textAlign={'left'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={async () => {
            this.setState({
              infoModal: false
            })
            setTimeout(() => {
              this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/agentAuth?companyId=${this.props.companyInfo.companyId}&companyName=${this.props.companyInfo.corpName}&regCode=${this.props.companyInfo.regNo || ''}&legalPersonCertId=${this.props.companyInfo.legalPersonCertId || ''}&legalPersonName=${this.props.companyInfo.legalPerson || ''}&legalArea=${this.props.companyInfo.legalArea || '0'}`, title: '添加授权委托人' })
            }, 500)
          }}
          infoModal={this.state.infoModal} />
        <ComfirmModal
          title={'合同签署口令复制成功！'}
          content={this.state.shareText}
          cancelText={'取消'}
          comfirmText={'去粘贴'}
          cancel={() => {
            this.setState({
              shareModal: false
            })
          }}
          confirm={() => {
            this.setState({
              shareModal: false
            })
            this.toWechat()
          }}
          textAlign={'left'}
          numberOfLines={2}
          infoModal={this.state.shareModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebf2'
  },
  title: {
    fontSize: dp(34),
    marginBottom: dp(30),
    paddingHorizontal: dp(30)
  },
  pageMain: {
    paddingTop: dp(50),
    paddingBottom: dp(100)
  },
  tips: {
    color: '#888',
    paddingHorizontal: dp(30),
    marginBottom: dp(10)
  },
  btn: {
    marginTop: dp(100)
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  detailItem: {
    backgroundColor: Color.WHITE,
    padding: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderBottomColor: Color.SPLIT_LINE
  },
  detailLabel: {
    fontSize: dp(30),
    width: DEVICE_WIDTH * 0.3,
    marginRight: dp(30)
  },
  detailContent: {
    color: '#888',
    width: DEVICE_WIDTH * 0.6
  },
  agentItem: {
    marginBottom: dp(50)
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  contractName: {
    marginLeft: dp(30),
    width: DEVICE_WIDTH * 0.77
  },
  sendContractText: {
    fontSize: dp(26),
    color: '#00b2a9',
    borderWidth: dp(2),
    borderColor: '#00b2a9',
    width: DEVICE_WIDTH * 0.2,
    textAlign: 'center',
    borderRadius: dp(10),
    padding: dp(10)
  },
  sendContract: {
    width: DEVICE_WIDTH * 0.2,
    borderRadius: dp(10),
    position: 'absolute',
    right: dp(30)
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AgentList)
