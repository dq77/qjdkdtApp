import React, { PureComponent, useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import ajaxStore from '../../utils/ajaxStore'
import { connect } from 'react-redux'
import { getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { TouchableOpacity } from 'react-native-gesture-handler'
import store from '../../store/index'
import LoadingView from '../../component/LoadingView'
import Touchable from '../../component/Touchable'
import ListPageComponent from '../../component/ListPageComponent'
import { setLoanNum } from '../../actions'
import NavBar from '../../component/NavBar'
import { callPhone } from '../../utils/PhoneUtils'
import { onEvent, onClickEvent } from '../../utils/AnalyticsUtil'

class CrmList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      isLoading: false,
      listSearchForm: {
        totalCount: 0,
        pageSize: 9999,
        pageNo: 1,
        isFactory: 0
      }
    }
  }

  componentDidMount () {
    // this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const res = await ajaxStore.crm.getList({
      ofsCompanyId: this.props.userInfo.ofsCompanyId
    })

    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  call = (phone) => {
    onClickEvent('CRM-客户列表页-拨号', 'crm/CrmList')
    callPhone(phone)
  }

  toCrmDetail = (id) => {
    onClickEvent('CRM-客户列表页-查看', 'crm/CrmDetail')
    this.props.navigation.navigate('CrmDetail', { id })
  }

  renderItem = (item) => {
    const {
      leadsName, gmtRecentlyFollow, gmtCreated, leadsAppContactDtoList, id
    } = item.item

    return (
      <Touchable isNativeFeedback={true} onPress={() => {
        this.toCrmDetail(id)
      }}>
        <View style={styles.item} >
          <Iconfont name={'CRM-gongjuicon'} size={dp(50)} color={'#2A6EE7'} />
          <View style={{ marginHorizontal: dp(20), flex: 1 }}>
            <Text style={styles.title}>{leadsName}</Text>
            <Text style={styles.text}>{`跟进时间：${gmtRecentlyFollow || gmtCreated}`}</Text>
            <Text style={styles.text}>{`联系人：${leadsAppContactDtoList[0].linkName || ''}`}</Text>
            <View style={{ flexDirection: 'row', marginTop: dp(30), alignItems: 'center' }}>
              <Text style={[styles.text, { marginTop: 0 }]}>联系电话：</Text>
              <Text onPress={() => this.call(leadsAppContactDtoList[0].phoneNumber)} style={[styles.text, { marginTop: 0, color: '#1A97F6' }]}>{leadsAppContactDtoList[0].phoneNumber}</Text>
              <Iconfont name={'CRM-dadianhua'} size={dp(20)} style={{ marginLeft: dp(10) }} color={'#2A6EE7'} />
            </View>
          </View>
          <Iconfont name={'arrow-right'} size={dp(20)} style={{ marginTop: dp(17) }} />
        </View>
      </Touchable>
    )
  }

  render () {
    return (
      <View style={styles.container}>

        <NavBar
          title={'CRM'}
          navigation={this.props.navigation}
          elevation={10}
          rightText={'添加客户'}
          rightIcon={null}
          onRightPress={() => {
            onClickEvent('CRM-客户列表页-添加客户', 'crm/CrmList')
            this.props.navigation.navigate('CrmCreat')
          }}
        />
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          isAutoRefresh={true}
          canChangePageSize={false}
          navigation={this.props.navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderSeparator={null}
        />

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(CrmList)

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
    borderRadius: dp(16),
    // alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.1
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(10),
    fontWeight: 'bold'
  },
  text: {
    fontSize: dp(28),
    color: '#888888',
    marginTop: dp(30)
  }

})
