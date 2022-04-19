import React, { PureComponent } from 'react'
import { View, StyleSheet, SectionList, Text, StatusBar, RefreshControl, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Touchable from '../../component/Touchable'
import {
  getCompanyInfo,
  getMemberVipInfo
} from '../../actions'
import { toAmountStr } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import ListPageComponent from '../../component/ListPageComponent'

class MessageCenter extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectNum: '1',
      sectionData: [],
      noReadNum: 0
    }
    getCompanyInfo()
  }

  loadData = async (pageNo, pageSize) => {
    const data = {
      messageStatus: this.state.selectNum === '1' ? 'SUCCESS' : 'READ',
      companyName: this.props.companyInfo.corpName,
      pageNo: pageNo,
      pageSize: pageSize
    }
    const res = await ajaxStore.company.messageList(data)
    if (res && res.data && res.data.code === '0') {
      res.data.data.pagedRecords.forEach(e => {
        e.checked = false
      })
      if (this.state.selectNum === '1') {
        this.setState({
          noReadNum: res.data.data.totalCount || 0
        })
      }

      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  async selectNum (type) {
    await this.setState({
      selectNum: type
    })
    this.listView.refreshData()
  }

  async messageRead (item) {
    const data = {
      messageId: item.id
    }
    const res = await ajaxStore.company.messageRead(data)
    if (res && res.data && res.data.code === '0') {
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async messageReadAll () {
    const data = {
      companyName: this.props.companyInfo.corpName
    }
    const res = await ajaxStore.company.messageReadAll(data)
    if (res && res.data && res.data.code === '0') {
      this.listView.refreshData()
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  topView () {
    const num = this.state.noReadNum.toString()
    const showNum = parseInt(this.state.noReadNum) > 99 ? '99+' : num
    return (
      <View style={{ marginHorizontal: dp(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: dp(30) }} >
        <Touchable onPress={() => this.selectNum('1')}>
          <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '1' ? 'white' : '#F7F7F9', flexDirection: 'row' }]} >
            <Text style={[styles.title1Style, { color: this.state.selectNum === '1' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '1' ? 'bold' : 'normal' }]}>未读消息</Text>
            {parseInt(this.state.noReadNum) > 0 && <View style={[styles.red, { width: showNum === '99+' ? dp(55) : (num.length === 1 ? dp(32) : dp(46)) }]}>
              <Text style={styles.redText}>{showNum}</Text>
            </View>}
          </View>
        </Touchable>
        <Touchable onPress={() => this.selectNum('2')}>
          <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '2' ? 'white' : '#F7F7F9' }]} >
            <Text style={[styles.title1Style, { color: this.state.selectNum === '2' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '2' ? 'bold' : 'normal' }]}>已读消息</Text>
          </View>
        </Touchable>
      </View>
    )
  }

  clickItem (item) {
    this.messageRead(item)
    this.props.navigation.navigate('MessageCenterDec', {
      itemData: item
    })
  }

  renderItem = (item) => {
    const message = item.item
    return (
      <View>
        <Touchable isNativeFeedback={true} onPress={() => {
          this.clickItem(item.item)
        }}>
          <View style={styles.itemBG}>
            <View style={styles.itemTopBG}>
              <Text style={styles.itemTopText} numberOfLines={1}>{message.messageTitle}</Text>
              <Text style={styles.itemTopTimeText} numberOfLines={1}>{`${message.gmtCreated} >`}</Text>
            </View>
            <Text style={styles.itemBottomText} numberOfLines={2}>{message.messageContent}</Text>
          </View>
        </Touchable>
        <View style={styles.separatorComponent} />
      </View>
    )
  }

  render () {
    const { navigation } = this.props
    const num = parseInt(this.state.noReadNum)

    return (
      <View style={styles.container}>
        <NavBar title={'消息中心'} navigation={navigation} rightIcon={'yijianyidu'} rightIconSize={dp(150)} rightIconColor={ num > 0 ? '#1A97F6' : '#333333'} rightIconStyle={{ marginRight: dp(50) }} onRightPress={() => {
          num > 0 && this.messageReadAll()
        }}/>
        {this.topView()}
        <ListPageComponent
          ref={ref => { this.listView = ref }}
          navigation={this.props.navigation}
          loadData={this.loadData}
          renderItem={this.renderItem}
          isAutoRefresh={true}
          renderSeparator={null}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({

  separatorComponent: {
    width: DEVICE_WIDTH,
    height: dp(30),
    backgroundColor: 'transparent',
    marginLeft: dp(30)
  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold'
  },
  bgView: {
    borderRadius: dp(36),
    width: dp(345),
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dp(40)
  },
  itemBG: {
    borderRadius: dp(16),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    paddingHorizontal: dp(30)
  },
  itemTopBG: {
    flexDirection: 'row',
    marginTop: dp(40),
    marginBottom: dp(30),
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemBottomText: {
    marginBottom: dp(40),
    lineHeight: dp(40),
    color: '#91969A',
    fontSize: dp(28)
  },
  itemTopText: {
    color: '#2D2926',
    fontSize: dp(28),
    fontWeight: 'bold',
    maxWidth: dp(300)
  },
  itemTopTimeText: {
    color: '#91969A',
    fontSize: dp(28)
  },
  red: {
    backgroundColor: 'red',
    borderRadius: dp(16),
    height: dp(32),
    alignItems: 'center',
    justifyContent: 'center',
    margin: dp(10)
  },
  redText: {
    fontSize: dp(24),
    color: '#FFFFFF',
    textAlign: 'center'
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier
  }
}

export default connect(mapStateToProps)(MessageCenter)
