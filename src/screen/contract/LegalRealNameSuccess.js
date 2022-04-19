import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { StrokeBtn } from '../../component/CommonButton'

export default class LegalRealNameSuccess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {
  }

  render () {
    const { navigation } = this.props
    return (
      <View >
        <NavBar title={'法人认证成功'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <Iconfont style={styles.icon} name={'icon-result-success1'} size={dp(250)} />
            <Text style={styles.title}>企业真实性核实成功!</Text>
            <Text style={styles.info}>在电脑端完善电子签章信息后即可在线签署合同了</Text>
            <StrokeBtn style={styles.btn} text={'返回首页'} onPress={() => {
              navigation.navigate('Home')
            }} />
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  pageMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: dp(200)
  },
  title: {
    fontSize: dp(40),
    width: DEVICE_WIDTH,
    textAlign: 'center',
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  info: {
    width: DEVICE_WIDTH * 0.7,
    fontSize: dp(30),
    color: '#888'
  },
  btn: {
    marginTop: dp(80)
  }
})
