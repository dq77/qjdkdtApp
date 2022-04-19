import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import {
  getRealDP as dp,
  DEVICE_WIDTH,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'

class NoticeListDec extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {}

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'平台公告'} navigation={navigation} />
        <View style={styles.itemBG}>
          <Text style={styles.itemTopText}>关于仟金顶服务升级的公告</Text>
          <Text style={styles.itemTopTimeText}>
            杭州仟金顶信息科技有限公司 2021-1-20 13:30
          </Text>
          <Text style={styles.itemBottomText}>尊敬的客户：</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  moreBG: {
    marginVertical: dp(42),
    borderColor: '#1A97F6',
    borderWidth: dp(1),
    width: dp(250),
    height: dp(60),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(30)
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
    width: DEVICE_WIDTH - dp(60),
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
    fontSize: dp(26)
  },
  itemTopText: {
    color: '#2D2926',
    fontSize: dp(32),
    fontWeight: 'bold',
    paddingVertical: dp(30)
  },
  itemTopTimeText: {
    color: '#91969A',
    fontSize: dp(26),
    paddingBottom: dp(30)
  }
})

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier
  }
}

export default connect(mapStateToProps)(NoticeListDec)
