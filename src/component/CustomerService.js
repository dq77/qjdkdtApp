/*
 * @Date: 2021-01-29 09:31:32
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-04 15:41:02
 */
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from './Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../utils/screenUtil'
import Color from '../utils/Color'
import { onClickEvent } from '../utils/AnalyticsUtil'
import { customerServiceUrl } from '../utils/config'
import Iconfont from '../iconfont/Icon'
/**
 * 客服按钮
 */
class CustomerService extends PureComponent {
  static defaultProps = {
    name: '客户',
    showText: true,
    navigation: {}
  }

  static propTypes = {
    name: PropTypes.string,
    showText: PropTypes.bool,
    navigation: PropTypes.object.isRequired
  }

  render () {
    const { navigation, name, style } = this.props
    return (
      <View style={[styles.customerServiceWrapper, style]}>
        <Touchable
          style={styles.customerServiceMain}
          onPress={() => {
            onClickEvent('在线客服', 'component/CustomerService')
            navigation.navigate('WebView', {
              title: '在线客服',
              url: `${customerServiceUrl}${name}`
            })
          }}>
          <Iconfont name={'navibar_kefu'} size={dp(60)} color={this.props.color} />
          {
            this.props.showText
              ? <Text style={styles.customerServiceText}>{'在线客服'}</Text>
              : null
          }

        </Touchable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  customerServiceWrapper:
  {

  },
  customerServiceMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  customerServiceText: {
    color: Color.TEXT_LIGHT,
    marginLeft: dp(20),
    fontSize: dp(30)
  }
})

export default CustomerService
