import React, { PureComponent } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { getRegionTextArr } from '../../utils/Region'

class CompanyBaseInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const { navigation, companyInfo } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'企业信息'} navigation={navigation} />
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <View style={styles.item}>
              <Text style={styles.label}>企业名称</Text>
              <Text style={styles.input}>{companyInfo.corpName}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>企业注册号</Text>
              <Text style={styles.input}>{companyInfo.regNo}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>企业法人</Text>
              <Text style={styles.input}>{companyInfo.legalPerson}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>企业所在地区</Text>
              <Text style={styles.input}>{getRegionTextArr(companyInfo.provinceCode, companyInfo.cityCode, companyInfo.areaCode).join(' ')}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>详细地址</Text>
              <Text style={styles.input}>{companyInfo.address}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>联系人</Text>
              <Text style={styles.input}>{companyInfo.contactName}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>联系电话</Text>
              <Text style={styles.input}>{companyInfo.phone}</Text>
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
    backgroundColor: Color.WHITE,
    marginTop: dp(30)
  },
  item: {
    paddingHorizontal: dp(20),
    paddingVertical: dp(30),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  label: {
    width: DEVICE_WIDTH * 0.3
  },
  input: {
    flex: 1,
    flexWrap: 'wrap'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(CompanyBaseInfo)
