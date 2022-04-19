import React, { Component } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import { SolidBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import { isEmpty } from '../../utils/StringUtils'
import { setGoodsItems } from '../../actions/index'
import { showToast, toAmountStr, formValid } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import {
  vEmail, vPhone, vCompanyName, vChineseName
} from '../../utils/reg'

class InvoiceInfo extends Component {
  constructor (props) {
    super(props)
    this.rule = [
      { id: 'companyName', required: true, reg: vCompanyName, name: '企业名称' },
      { id: 'receivePerson', required: true, reg: vChineseName, name: '收件人' },
      { id: 'receiveContact', required: true, reg: vPhone, name: '收件人电话' },
      { id: 'receiveEmail', required: false, reg: vEmail, name: '收件人邮箱' }
    ]
    this.state = {
      bankAccount: '',
      companyId: '',
      companyName: '',
      gmtCreated: '',
      gmtModified: '',
      id: null,
      invoiceTitle: '',
      operator: '',
      receiveAddress: '',
      receiveContact: '',
      receiveEmail: '',
      receivePerson: '',
      taxpayerId: '',
      telAddress: '',
      editable_companyName: true,
      editable_taxpayerId: true,
      editable_telAddress: true,
      editable_bankAccount: true
    }
  }

  componentDidMount () {
    this.loadData()
  }

  async loadData () {
    const res = await ajaxStore.order.queryInvoiceInfo({ companyId: this.props.ofsCompanyId })
    if (res.data && res.data.code === '0') {
      this.setState({
        ...res.data.data,
        editable_companyName: isEmpty(res.data.data.companyName) || res.data.data.companyName === '.',
        editable_taxpayerId: isEmpty(res.data.data.taxpayerId) || res.data.data.taxpayerId === '.',
        editable_telAddress: isEmpty(res.data.data.telAddress) || res.data.data.telAddress === '.',
        editable_bankAccount: isEmpty(res.data.data.bankAccount) || res.data.data.bankAccount === '.'
      })
    }
  }

  save = async () => {
    const data = {
      id: this.state.id === 0 ? null : this.state.id,
      companyId: this.state.companyId,
      companyName: this.state.companyName,
      invoiceTitle: this.state.invoiceTitle,
      taxpayerId: this.state.taxpayerId,
      telAddress: this.state.telAddress,
      bankAccount: this.state.bankAccount,
      receivePerson: this.state.receivePerson,
      receiveAddress: this.state.receiveAddress,
      receiveContact: this.state.receiveContact,
      receiveEmail: this.state.receiveEmail
    }
    const valid = formValid(this.rule, data)
    if (!valid.result) {
      global.alert.show({
        content: valid.msg
      })
      return
    }
    const res = await ajaxStore.order.updateInvoiceInfo(data)
    if (res.data && res.data.code === '0') {
      await global.loading.showSuccess('保存成功', () => { this.props.navigation.goBack() })
    }
  }

  disable = () => {
    const { companyName, taxpayerId, telAddress, bankAccount, receivePerson, receiveAddress, receiveContact } = this.state
    return !(companyName && taxpayerId && telAddress && bankAccount && receivePerson && receiveAddress && receiveContact)
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'开票信息'} navigation={navigation} />
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center' }}>
            {/* 发票信息 */}
            <Text style={styles.title}>发票信息（必填）</Text>
            {/* 企业名称 */}
            <FormItemComponent
              title={'企业名称'}
              placeholder={'请输入企业名称'}
              maxLength={32}
              value={this.state.companyName}
              editable={this.state.editable_companyName}
              onChangeText={text => {
                this.setState({ companyName: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 纳税人识别号 */}
            <FormItemComponent
              title={'纳税人识别号'}
              placeholder={'请输入纳税人识别号'}
              maxLength={25}
              value={this.state.taxpayerId}
              editable={this.state.editable_taxpayerId}
              onChangeText={text => {
                this.setState({ taxpayerId: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 地址、电话 */}
            <FormItemComponent
              title={'地址、电话'}
              placeholder={'请输入地址、电话'}
              maxLength={100}
              value={this.state.telAddress}
              editable={this.state.editable_telAddress}
              onChangeText={text => {
                this.setState({ telAddress: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 开户行及账号 */}
            <FormItemComponent
              title={'开户行及账号'}
              placeholder={'请输入开户行及账号'}
              maxLength={100}
              value={this.state.bankAccount}
              editable={this.state.editable_bankAccount}
              onChangeText={text => {
                this.setState({ bankAccount: text })
              }}
            />

            {/* 收件人信息 */}
            <Text style={styles.title}>收件信息</Text>
            {/* 收件人姓名 */}
            <FormItemComponent
              title={'收件人'}
              placeholder={'请输入收件人'}
              maxLength={50}
              value={this.state.receivePerson}
              onChangeText={text => {
                this.setState({ receivePerson: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件人电话 */}
            <FormItemComponent
              title={'收件人电话'}
              placeholder={'请输入收件人电话'}
              maxLength={20}
              keyboardType={'numeric'}
              value={this.state.receiveContact}
              onChangeText={text => {
                this.setState({ receiveContact: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件人邮箱 */}
            <FormItemComponent
              title={'收件人邮箱'}
              placeholder={'请输入收件人邮箱'}
              maxLength={50}
              value={this.state.receiveEmail}
              onChangeText={text => {
                this.setState({ receiveEmail: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 收件地址 */}
            <FormItemComponent
              title={'收件地址'}
              placeholder={'请输入收件地址'}
              value={this.state.receiveAddress}
              maxLength={100}
              onChangeText={text => {
                this.setState({ receiveAddress: text })
              }}
            />

            <SolidBtn style={styles.btn} onPress={this.save} disabled={this.disable()} text={'保存'} />

          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    // companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(InvoiceInfo)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4'
  },
  title: {
    fontSize: dp(28),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20),
    width: DEVICE_WIDTH
  },
  splitLine: {
    height: 1,
    marginLeft: dp(30),
    backgroundColor: '#f0f0f0'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  checkbox: {
    padding: dp(30),
    backgroundColor: '#EFEFF4'
  },
  checkboxIcon: {
    marginLeft: dp(10),
    marginRight: dp(-10),
    marginTop: dp(5)
  },
  hint: {
    fontSize: dp(23),
    color: '#a0a0a0',
    marginTop: dp(35),
    marginBottom: dp(50)
  },
  btn: {
    marginTop: dp(70),
    marginBottom: dp(30)
  }
})
