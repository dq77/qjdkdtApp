import React, { Component } from 'react'
import {
  View, StyleSheet, FlatList, Text, Platform,
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
import { getRegionTextArr } from '../../utils/Region'
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
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import BottomFullModal from '../../component/BottomFullModal'
import { onEvent } from '../../utils/AnalyticsUtil'

class AddTrance extends Component {
  constructor (props) {
    super(props)

    this.state = {
      text: ''
    }
  }

  async componentDidMount () {

  }

  componentWillUnmount () {

  }

  submit = async () => {
    const text = this.state.text.trim()
    if (!text) {
      global.alert.show({ content: '内容不能为空' })
      return
    }
    const res = await ajaxStore.crm.addTrace({
      leadsId: this.props.navigation.state.params.id,
      logContent: this.state.text
    })
    if (res && res.data && res.data.code === '0') {
      onEvent('CRM-填写跟进页-提交', 'crm/AddTrance', '/erp/leads/addTrace', {
        leadsId: this.props.navigation.state.params.id,
        logContent: this.state.text
      })

      global.alert.show({
        content: '提交成功',
        callback: () => {
          this.props.navigation.goBack()
        }
      })
    }
  }

  render () {
    const { navigation } = this.props
    const { data, tabIndex } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={'填写跟进'} navigation={navigation} rightIcon={null} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{ padding: dp(30), alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'white',
              paddingHorizontal: dp(30),
              paddingVertical: dp(40),
              borderRadius: dp(16),
              width: dp(690)
            }}>
              <TextInput
                placeholder={'请输入跟进记录'}
                placeholderTextColor={Color.TEXT_LIGHT}
                multiline={true}
                maxLength={200}
                style={{
                  height: DEVICE_HEIGHT * 0.4,
                  fontSize: dp(28),
                  textAlignVertical: 'top',
                  textAlign: 'left'
                }}
                // value={this.state.text}
                onChangeText={text => {
                  this.setState({ text })
                }} />
            </View>

            <SolidBtn onPress={this.submit} style={{ borderRadius: dp(45), marginVertical: dp(60) }} text={'提交'} />
          </View>
        </ScrollView>

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(AddTrance)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    width: dp(690),
    flexDirection: 'row',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16)
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(10),
    fontWeight: 'bold',
    marginBottom: dp(20)
  },
  text: {
    fontSize: dp(25),
    color: '#888888',
    marginTop: dp(10)
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  line: {
    width: dp(50),
    height: dp(8),
    backgroundColor: '#2A6EE7',
    marginTop: dp(10)
  },
  line1: {
    width: dp(50),
    height: dp(8),
    // backgroundColor: '#2A6EE7',
    marginTop: dp(10)
  },
  tabtext: {
    color: '#2A6EE7',
    fontSize: dp(32)
  },
  tabtext1: {
    color: '#2D2926',
    fontSize: dp(32)
  },
  creatOrder: {
    position: 'absolute',
    bottom: dp(120),
    right: dp(30),
    backgroundColor: '#2A6EE7',
    width: dp(110),
    height: dp(110),
    borderRadius: dp(60),
    alignItems: 'center',
    justifyContent: 'center'
  }

})
