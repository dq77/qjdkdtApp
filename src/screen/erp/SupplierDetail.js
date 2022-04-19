/*
 * @Date: 2021-02-02 11:24:11
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-02 15:22:23
 */
import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp } from '../../utils/screenUtil'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import { injectUnmount } from '../../utils/Utility'
import { connect } from 'react-redux'
import { getRegionTextArr } from '../../utils/RegionByAjax'

@injectUnmount
class SupplierDetail extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      supplierName: '',
      projectSide: '',
      personName: '',
      personMobile: '',
      provinceCode: '',
      cityCode: '',
      areaCode: '',
      address: '',
      goodCat: '',
      supplierYear: '',
      historyAmount: '',
      tip: '',
      showAddress: '',
      status: ''
    }
  }

  async componentDidMount () {
    const params = this.props.navigation.state.params

    if (params && params.id) {
      await this.getSupplierInfo(params.id)
    } else {
      console.log('供应商不存在')
    }
  }

  getSupplierInfo = async (id) => {
    const res = await ajaxStore.order.getSupplierInfo({ id })
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      const {
        supplierName, supplierCode, contactName, contactPhone, provinceCode, cityCode, areaCode,
        address, goodCat, supplierYear, historyAmount, tip, id, status
      } = res.data.data

      await this.setState({
        supplierName,
        supplierCode,
        contactName,
        contactPhone,
        provinceCode,
        cityCode,
        areaCode,
        address,
        goodCat,
        supplierYear,
        historyAmount,
        tip,
        showAddress: provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode) : '',
        id,
        status
      })
    }
  }

  render () {
    const { navigation } = this.props
    const {
      supplierName, supplierCode, contactName, contactPhone, showAddress, address, goodCat, supplierYear, historyAmount,
      tip, status
    } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={'供应商详情'} navigation={navigation} rightIcon={''}/>
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.blockMain}>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'供应商名称'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{supplierName}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'供应商编码'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{supplierCode}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'联系人'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{contactName}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'联系人电话'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{contactPhone}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'联系人地址'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{showAddress}{address}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'货物类型'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{goodCat}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'合同年限（年）'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{supplierYear}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'历史采购金额（万元）'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{historyAmount}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'备注'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{tip}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText} >{'供应商状态'}</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: '#2D2926' }]}>{
                  status ? '已启用' : '已禁用'
                }</Text>
              </View>
            </View>
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

export default connect(mapStateToProps)(SupplierDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  content: {
    alignItems: 'stretch'

  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(40),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16)
  },
  itemText: {
    color: '#91969A',
    fontSize: dp(27)
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(30)
  }

})
