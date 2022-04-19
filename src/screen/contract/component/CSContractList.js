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
import { getLocation } from '../../../utils/LocationUtils'

/**
 * 诚信销/采合同列表
 */
class CSContractList extends PureComponent {
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
      status: '0' // 0未签署 1已签署
    }
    this.toSignerList = this.toSignerList.bind(this)
  }

  async toSignerList (item) {
    if (item.status === '1') {
      this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/contractDetail?processInstanceId=${item.flowId}&contractCode=${item.code}`, title: '合同详情' })
      // this.props.navigation.navigate('CSContractDetail', {
      //   processInstanceId: item.flowId || '',
      //   contractCode: item.code || ''
      // })
    } else {
      this.props.navigation.navigate('WebView', { url: `${webUrl}/agreement/signPersonList?processInstanceId=${item.flowId}&contractCode=${item.code}`, title: '合同签约' })
      // this.props.navigation.navigate('CSSignPersonList', {
      //   processInstanceId: item.flowId || '',
      //   contractCode: item.code || ''
      // })
    }
  }

  componentDidMount () {
  }

  renderItem (item, index) {
    const { status } = this.state
    return (
      <View key={index}>
        {item.status === status && ((status === '0' && item.supportWay !== 1) || status === '1') &&
          <Touchable isNativeFeedback={true} onPress={() => this.toSignerList(item)}>
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.name}</Text>
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
    this.props.CSContractList.map((item, key) => {
      console.log(item)
      if (item.status === '1') {
        signedNum++
      } else if (item.status === '0' && item.supportWay !== 1) {
        noSignNum++
      }
    })
    console.log(signedNum, noSignNum)
    return (
      <View>
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
    console.log(this.props.CSContractList)
    return (
      <View style={styles.container}>
        <View style={styles.borderRadius}>
          { this.props.CSContractList && this.props.CSContractList.map((item, key) => {
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

const mapStateToProps = state => {
  return {
    sessionId: state.user.sessionId,
    ssoCookie: state.user.ssoCookie,
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    CSContractList: state.contract.CSContractList
  }
}

export default connect(mapStateToProps)(CSContractList)

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
    shadowOpacity: 0.1
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
