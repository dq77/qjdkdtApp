import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Canvas,
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
import {
  goodsImgUrl
} from '../../../utils/config'
import ajaxStore from '../../../utils/ajaxStore'
import AuthUtil from '../../../utils/AuthUtil'
import StorageUtil from '../../../utils/storageUtil'

class GuestToolCom extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  async componentDidMount () {
    const guestToolCom = await StorageUtil.get('GuestToolCom')
    if (guestToolCom === '2') {
      this.listView.refreshData()
    }
    await StorageUtil.save('GuestToolCom', '2').then(res => {
      if (!res) {
        console.log('save success')
      }
    })
  }

  loadData = async (pageNo, pageSize) => {
    const userInfo = await AuthUtil.getUserInfo()
    const data = {
      ofsCompanyId: userInfo.loginResult.ofsCompanyId,
      pageNo: pageNo,
      pageSize: pageSize
    }
    const res = await ajaxStore.company.visitorPosterList(data)
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  };

  clickItem (item) {
    const { navigation } = this.props

    navigation.navigate('GuestToolCreatSuccess', { itemId: item.id })
  }

  renderItem = (item) => {
    return (
      <Touchable
        isNativeFeedback={true}
        onPress={() => {
          this.clickItem(item.item)
        }}>
        <View style={styles.itemToolBG}>
          <Image
            resizeMode={'cover'}
            defaultSource={require('../../../images/default_banner.png')}
            style={styles.leftToolImg} source={{ uri: `${goodsImgUrl}${item.item.storageUrl}` }}></Image>
          <View style={styles.itemRightToolBG}>
            <View style={styles.itemTopToolBG}>
              <Text style={styles.itemTopToolText}>
                {item.item.activityTitle}
              </Text>
              <Text style={[styles.itemTopStatusToolText, { color: item.item.activityStatus === 0 ? '#4FBF9F' : '#F55849' }]} numberOfLines={1}>
                {item.item.activityStatus === 0 ? '有效' : '失效'}
              </Text>
            </View>
            <Text style={styles.itemBottomToolText} numberOfLines={2}>
            生成时间：{item.item.gmtCreated.split(' ')[0]}
            </Text>
          </View>
        </View>
      </Touchable>
    )
  };

  render () {
    console.log('aaaa')
    return (
      <ListPageComponent
        ref={(ref) => {
          this.listView = ref
        }}
        navigation={this.props.navigation}
        loadData={this.loadData}
        renderItem={this.renderItem}
        isAutoRefresh={true}
        canChangePageSize={false}
        renderSeparator={null}
      />
    )
  }
}

const styles = StyleSheet.create({
  itemBottomToolText: {
    marginTop: dp(20),
    marginLeft: dp(20),
    fontSize: dp(28),
    color: '#2D2926',
    marginBottom: dp(30)
  },
  itemTopToolText: {
    fontSize: dp(28),
    color: '#2D2926',
    fontWeight: 'bold',
    width: dp(420)
  },
  itemTopStatusToolText: {
    fontSize: dp(28),
    color: '#4FBF9F',
    marginRight: dp(30)
  },
  itemRightToolBG: { flex: 1 },
  itemTopToolBG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: dp(20),
    marginTop: dp(30)
  },
  itemToolBG: {
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    marginBottom: dp(30),
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  leftToolImg: {
    marginLeft: dp(30),
    width: dp(110),
    height: dp(83),
    marginVertical: dp(40)
  }
})

export default GuestToolCom
