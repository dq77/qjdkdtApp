import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text, TouchableWithoutFeedback } from 'react-native'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'

export default class CouponUsageRule extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'优惠券使用规则'} navigation={navigation} />
        <Text style={styles.titleText}>优惠劵使用一般性规则如下：</Text>
        <Text style={styles.decText}>1.自动扣款不可使用；</Text>
        <Text style={styles.dec1Text}>2.现金抵扣券可在客户还款时，抵扣相应金额的服费；</Text>
        <Text style={styles.dec1Text}>3.现金抵扣券可用于抵扣综合服务费、信息系统服务费及会员费，无法用于抵扣平台其他费用；</Text>
        <Text style={styles.dec1Text}>4.每次使用时，仅限抵扣1张；</Text>
        <Text style={styles.dec1Text}>5.每张现金抵扣券仅限使用1次，无论抵扣金额是否全部使用，使用后都无法再次抵扣。
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  titleText: {
    fontSize: dp(28),
    color: '#353535',
    marginHorizontal: dp(30),
    marginTop: dp(30)
  },
  decText: {
    fontSize: dp(28),
    color: '#888888',
    marginHorizontal: dp(30),
    marginTop: dp(40)
  },
  dec1Text: {
    fontSize: dp(28),
    color: '#888888',
    marginHorizontal: dp(30),
    marginTop: dp(6),
    lineHeight: dp(35)
  }
})
