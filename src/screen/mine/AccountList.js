import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { StrokeBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import ajaxStore from '../../utils/ajaxStore'
import { showToast } from '../../utils/Utility'
import Iconfont from '../../iconfont/Icon'
import { connect } from 'react-redux'
import Touchable from '../../component/Touchable'
import {
  getPaymentAccount
} from '../../actions'
import ComfirmModal from '../../component/ComfirmModal'

/**
 * AccountList
 */
class AccountList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      deleteItem: ''
    }
    this.toCreate = this.toCreate.bind(this)
    this.toEdit = this.toEdit.bind(this)
    this.toDelete = this.toDelete.bind(this)
    this.comfirmDelete = this.comfirmDelete.bind(this)
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        getPaymentAccount()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  toCreate () {
    this.props.navigation.navigate('AccountCreate')
  }

  toEdit (item) {
    this.props.navigation.navigate('AccountCreate', { ...item })
  }

  comfirmDelete (item) {
    this.setState({
      infoModal: true,
      deleteItem: item
    })
  }

  async toDelete () {
    const item = this.state.deleteItem
    const res = await ajaxStore.company.editIndividualAccount({ id: item.id, isDeleted: true })
    if (res.data && res.data.code === '0') {
      getPaymentAccount()
    }
  }

  render () {
    const { navigation, companyInfo } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'个人代付账户列表'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <StrokeBtn onPress={() => { this.toCreate() }} text={'+添加个人代付账户'} />
          </View>
          <View style={styles.listWrap}>
            <Text style={styles.listTitle}>已添加的个人代付账户</Text>
            <View style={styles.listContent}>
              {companyInfo.paymentAccount.map((item, key) => {
                return (
                  <View style={styles.listItem} key={key}>
                    {item.type === 1 ? (
                      <Iconfont name={'icon-yinhang'} size={dp(80)} />
                    ) : (
                      <Iconfont name={'icon-zhifubao1'} size={dp(80)} />
                    )}
                    <View style={styles.listDetail}>
                      <Text style={styles.listName}>{item.name}</Text>
                      <Text style={styles.listAccount}>{item.account}</Text>
                    </View>
                    <Touchable onPress={() => { this.toEdit(item) }}>
                      <Iconfont style={styles.listIcon} name={'icon-edit'} size={dp(50)} />
                    </Touchable>
                    <Touchable onPress={() => { this.comfirmDelete(item) }}>
                      <Iconfont style={styles.listIcon} name={'icon-del-fork'} size={dp(50)} />
                    </Touchable>
                  </View>
                )
              })}
            </View>
          </View>
        </ScrollView>
        <ComfirmModal
          title={'注意'}
          content={'是否确认删除该个人代付账户'}
          cancelText={'取消'}
          comfirmText={'确认'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            this.toDelete()
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  header: {
    flex: 1,
    paddingHorizontal: dp(30),
    paddingVertical: dp(50)
  },
  listWrap: {
    paddingHorizontal: dp(30)
  },
  listTitle: {
    fontSize: dp(28),
    color: '#888',
    borderBottomWidth: dp(1),
    paddingBottom: dp(20),
    borderColor: '#ccc'
  },
  listItem: {
    paddingVertical: dp(30),
    borderBottomWidth: dp(1),
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  listDetail: {
    width: DEVICE_WIDTH * 0.6,
    paddingHorizontal: dp(30)
  },
  listName: {
    fontSize: dp(30)
  },
  listAccount: {
    fontSize: dp(30),
    color: '#888'
  },
  listIcon: {
    marginRight: dp(40)
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AccountList)
