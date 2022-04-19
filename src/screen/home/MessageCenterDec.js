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

class MessageCenter extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      itemData: {}
    }
  }

  componentDidMount () {
    this.init()
  }

  async init () {
    const params = this.props.navigation.state.params
    const itemData = params && params.itemData
    this.setState({
      itemData
    })
  }

  moreClick () {
    const { itemData } = this.state
    const { navigation } = this.props
    if (itemData.appUrl && itemData.appUrl.length >= 7) {
      if (itemData.appUrl.substr(0, 7) === 'http://' || itemData.appUrl.substr(0, 8) === 'https://') {
        navigation.navigate('WebView', { url: itemData.appUrl })
      } else {
        navigation.navigate(itemData.appUrl)
      }
    }
  }

  more () {
    const { itemData } = this.state
    return (
      (itemData && itemData.appUrl && itemData.appUrl.length > 0 && itemData.appUrl !== 'null') ? <Touchable onPress={() => this.moreClick()}>
        <View style={styles.moreBG}>
          <Text style={styles.moreText}>查看更多详情</Text>
        </View>
      </Touchable> : null
    )
  }

  render () {
    const { navigation } = this.props
    const { itemData } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={'消息中心'} navigation={navigation} />
        <View style={styles.itemBG}>
          <Text style={styles.itemTopText}>{itemData.messageTitle}</Text>
          <Text style={styles.itemTopTimeText}>{itemData.gmtCreated}</Text>
          <Text style={styles.itemBottomText}>{itemData.messageContent}</Text>
        </View>
        {this.more()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  moreBG: {
    marginVertical: dp(42),
    borderColor: '#1A97F6',
    borderWidth: dp(1),
    height: dp(60),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(30),
    marginHorizontal: (DEVICE_WIDTH - dp(250)) / 2
  },
  moreText: {
    color: '#1A97F6',
    fontSize: dp(26)
  },
  separatorComponent: {
    width: DEVICE_WIDTH,
    height: dp(30),
    backgroundColor: 'transparent',
    marginLeft: dp(30)
  },
  sectionList: {
    position: 'absolute',
    marginTop: dp(320),
    height: DEVICE_HEIGHT - dp(320)
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
    paddingHorizontal: dp(30),
    marginHorizontal: dp(30)
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
    paddingVertical: dp(30)
  },
  itemTopTimeText: {
    color: '#91969A',
    fontSize: dp(28),
    paddingBottom: dp(30)
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
