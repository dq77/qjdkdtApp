import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SolidBtn } from '../../component/CommonButton'
import NavBar from '../../component/NavBar'
import Iconfont from '../../iconfont/Icon'
import { getRealDP as dp } from '../../utils/screenUtil'

export default class LoanPaySuccess extends PureComponent {
  goBack = () => {
    this.props.navigation.navigate('Loan')
    // DeviceEventEmitter.emit(EventTypes.REFRESH_LOAN)
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        <NavBar title={'申请还款'} navigation={navigation} elevation={10} />
        <View style={styles.container}>
          <Iconfont style={{ marginTop: dp(130), marginBottom: dp(40) }} name={'icon-result-success1'} size={dp(230)} />
          <Text style={styles.text}>还款申请已提交，</Text>
          <Text style={styles.text}>还款成功后将以短信通知您。</Text>
          <SolidBtn onPress={this.goBack} style={{ marginTop: dp(80) }} text={'跳转货款支付列表'} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: dp(36),
    marginTop: dp(10),
  },
})
