import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { SolidBtn } from '../../component/CommonButton'
import CustomerService from '../../component/CustomerService'
import ComfirmModal from '../../component/ComfirmModal'
import { callPhone } from '../../utils/PhoneUtils'

/**
 * CreditByPC
 */
export default class CreditByPC extends PureComponent {
  constructor (props) {
    super(props)
    this.phone = '400-612-1666'
    this.state = {
      infoModal: false
    }
  }

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'还有1步获得额度'} navigation={navigation} />
        <View style={styles.content}>
          <Text style={styles.title}>请前往仟金顶官网申请授信额度</Text>
          <Text style={styles.text}>1.使用电脑打开仟金顶官网 www.qjdchina.com，登录后即可上传授信额度申请资料。</Text>
          <Text style={styles.text}>2.如有疑问，请拨打客服热线，咨询详情。</Text>
          <SolidBtn text='拨打客服咨询热线' style={styles.btn} onPress={() => this.setState({ infoModal: true })} />
          <Text style={styles.hint}>工作时间：全年 9:00-21:00</Text>
          <CustomerService style={styles.serice} navigation={navigation} />
        </View>
        <ComfirmModal
          title={'是否拨打电话？'}
          content={this.phone}
          cancelText={'取消'}
          comfirmText={'确定'}
          cancel={() => {
            this.setState({
              infoModal: false
            })
          }}
          confirm={() => {
            this.setState({
              infoModal: false
            })
            callPhone(this.phone)
          }}
          infoModal={this.state.infoModal} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: dp(35),
    fontWeight: 'bold',
    marginVertical: dp(60),
    color: 'black'
  },
  text: {
    textAlign: 'left',
    paddingHorizontal: dp(30),
    lineHeight: dp(50),
    width: DEVICE_WIDTH,
    marginBottom: dp(30),
    color: Color.TEXT_DARK
  },
  btn: {
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  hint: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(25)
  },
  serice: {
    position: 'absolute',
    bottom: 0,
    marginBottom: dp(70)
  }
})
