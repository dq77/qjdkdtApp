import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, DeviceEventEmitter, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { ScrollView } from 'react-native-gesture-handler'

export default class FourElementsProtocol extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'四要素服务协议'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={{ padding: dp(30) }}>
            <Text style={styles.text}>一、您保证提供给本行的银行卡资料（包括：卡号、姓名、证件号码、手机号码等）为您本人持有的真实、完整、准确、合法、有效的银行卡信息，并同意本行将以上信息送至发卡银行进行核验。</Text>
            <Text style={styles.text}>二、您同意并授权本行根据您所购买产品和服务的金额，通过支付清算机构以及发卡银行，从您提供的银行卡中扣款。您承诺前述委托扣款视同您本人作出，不得向本行、支付清算机构以及发卡银行提出异议。</Text>
            <Text style={styles.text}>三、因您提供他人银行卡资料或虚假信息、您提供的银行卡账户余额不足或被挂失、冻结、销户等原因而引起的一切法律责任，由您自行承担，与本行无关。</Text>
            <Text style={styles.text}>四、因支付清算机构或发卡银行原因导致扣款错误或延迟，给您造成损失的，由过错方承担责任，本行将协助您向其追究相应责任。</Text>
            <Text style={styles.text}>五、如发生不属于您的款项已先行拨入您账户的情况，您认可并同意本行以及与本行合作的第三方支付公司具有向您事后索回的权利。</Text>
          </View>
        </ScrollView>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#f0f0f0'
  },
  text: {
    fontSize: dp(30),
    color: '#333333',
    marginBottom: dp(30),
    lineHeight: dp(50)
  }

})
