import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { callPhone } from '../../utils/PhoneUtils'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn } from '../../component/CommonButton'
import AlertModal from '../../component/AlertModal'
import {
  getCompanyInfo
} from '../../actions'

export default class ContactUs extends PureComponent {
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
      <View style={styles.container}>
        <NavBar title={'联系我们'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <View style={{ ...styles.pageItem, ...styles.borderBottom }}>
              <Text style={styles.title}>联系我们</Text>
              <View style={styles.detail}>
                <Text style={styles.detailText}>如有疑问请拨打咨询热线 <Text style={styles.phoneNum} onPress={() => {
                  callPhone(4006121666)
                }}>400-612-1666</Text>（全年 9:00-21:00）。</Text>
              </View>
            </View>
            <View style={styles.pageItem}>
              <Text style={styles.title}>现场拜访</Text>
              <View style={styles.detail}>
                <Text style={styles.detailText}>地址：浙江省杭州市滨江区秋溢路289号</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  pageMain: {

  },
  pageItem: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(50)
  },
  borderBottom: {
    borderBottomWidth: dp(1),
    borderBottomColor: Color.TEXT_LIGHT
  },
  title: {
    fontWeight: 'bold',
    fontSize: dp(32),
    marginBottom: dp(50)
  },
  detailText: {
    fontSize: dp(28),
    color: '#888',
    lineHeight: dp(50),
    fontWeight: 'normal'
  },
  phoneNum: {
    color: '#4fbf9f'
  }
})
