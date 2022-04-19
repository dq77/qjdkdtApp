import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Image
} from 'react-native'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../../utils/screenUtil'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import ListPageComponent from '../../../component/ListPageComponent'
import { callPhone } from '../../../utils/PhoneUtils'
import Color from '../../../utils/Color'
import ajaxStore from '../../../utils/ajaxStore'
import AuthUtil from '../../../utils/AuthUtil'
import { onEvent, onClickEvent } from '../../../utils/AnalyticsUtil'

class IntentionClient extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {
    this.refreshData()
  }

  refreshData () {
    this.listView.refreshData()
  }

  loadData = async (pageNo, pageSize) => {
    const userInfo = await AuthUtil.getUserInfo()
    const data = {
      ofsCompanyId: userInfo.loginResult.ofsCompanyId,
      pageNo: pageNo,
      pageSize: pageSize
    }
    const res = await ajaxStore.company.visitorPotentialList(data)
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  };

  clickAddCrm (data) {
    onClickEvent('意向客户-客户详情页-添加至CRM', 'home/component/IntentionClient')
    this.props.navigation.navigate('CrmCreat', {
      data: {
        fissionId: data.id,
        leadsAppContactDtoList: [
          {
            linkName: data.fullName, // 联系人姓名
            phoneNumber: data.enterprisePhone // 联系人手机号
          }
        ]
      }
    })
  }

  renderItem = (item) => {
    const data = item.item
    return (
      <View style={styles.itemCustomerBG}>
        <Text style={styles.itemTopCustomerNameText}>{data.fullName}</Text>
        <View style={styles.itemCustomerDecBG}>
          <Text style={styles.itemTopCustomerIphoneText}>
            电话：{data.enterprisePhone}
          </Text>
          <Text style={styles.itemTopCustomerIphoneText}>
            添加日期：{data.gmtCreated.split(' ')[0]}
          </Text>
        </View>
        <View style={styles.lineBGView}></View>
        <View style={styles.bottomCustomerBGView}>
          <Touchable onPress={() => {
            this.props.clickDelete(`${data.id}`)
          }}>
            <View style={styles.itemCustomerDeleteBGView}>
              <Text style={styles.itemCustomerDeleteText}>删除</Text>
            </View>
          </Touchable>
          {data.fissionStatus === 0 &&
          <Touchable onPress={() => {
            this.clickAddCrm(data)
          }}>
            <View style={styles.itemCustomerAddBGView}>
              <Text style={styles.itemCustomerAddText}>添加至CRM</Text>
            </View>
          </Touchable>}
          <Touchable
            onPress={() => {
              onClickEvent('意向客户-客户列表页-拨打电话', 'home/component/IntentionClient')
              callPhone(`${data.enterprisePhone}`)
            }}>
            <View style={styles.itemCustomerCallBGView}>
              <Text style={styles.itemCustomerCallText}>拨打电话</Text>
            </View>
          </Touchable>
        </View>
      </View>
    )
  };

  render () {
    return (
      <ListPageComponent
        ref={(ref) => {
          this.listView = ref
        }}
        navigation={this.props.navigation}
        loadData={this.loadData}
        canChangePageSize={false}
        renderItem={this.renderItem}
        isAutoRefresh={true}
        renderSeparator={null}
      />
    )
  }
}

const styles = StyleSheet.create({
  bottomCustomerBGView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: dp(38)
  },
  itemCustomerAddBGView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(27),
    height: dp(54),
    width: dp(180),
    backgroundColor: '#2A6EE7',
    marginRight: dp(30)
  },
  itemCustomerAddText: {
    color: '#FFFFFF',
    fontSize: dp(26)
  },
  itemCustomerCallBGView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(27),
    height: dp(54),
    width: dp(143),
    backgroundColor: '#2A6EE7',
    marginRight: dp(30)
  },
  itemCustomerCallText: {
    color: '#FFFFFF',
    fontSize: dp(26)
  },
  itemCustomerDeleteText: {
    color: '#F55849',
    fontSize: dp(26)
  },
  itemCustomerDeleteBGView: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(27),
    height: dp(54),
    width: dp(105),
    borderWidth: dp(1),
    borderColor: '#F55849',
    marginRight: dp(30)
  },
  itemCustomerDecBG: {
    flexDirection: 'row',
    marginTop: dp(20)
  },
  lineBGView: {
    backgroundColor: Color.SPLIT_LINE,
    height: dp(1),
    marginHorizontal: dp(30),
    marginVertical: dp(30)
  },
  itemTopCustomerIphoneText: {
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#91969A'
  },
  itemTopCustomerNameText: {
    marginTop: dp(43),
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#2D2926',
    fontWeight: 'bold'
  },
  itemCustomerBG: {
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    marginBottom: dp(30),
    borderRadius: dp(16)
  }
})

export default IntentionClient
