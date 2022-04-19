import React, { PureComponent } from 'react'
import { View, StyleSheet, FlatList, Text } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { onClickEvent } from '../../utils/AnalyticsUtil'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import {
  goodsImgUrl,
  webUrl
} from '../../utils/config'

class NoticeList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      bulletinList: []
    }
  }

  componentDidMount () {
    this.bulletinList()
  }

  async bulletinList () {
    const data = {
      // ofsCompanyId: userInfo.loginResult.ofsCompanyId,
      noticeType: 2
    }
    const res = await ajaxStore.company.bulletinCarousel(data)
    if (res.data && res.data.code === '0') {
      const bulletinList = res.data.data
      this.setState({
        bulletinList
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  clickItem (item) {
    onClickEvent('公告列表-查看', 'home/NoticeList', { noticeId: item.item.id })
    this.props.navigation.navigate('WebView', {
      url:
      `${webUrl}/tools/noticeDetail?id=${item.item.id}`,
      title: item.item.noticeName
    })
  }

  renderItem = (item) => {
    return (
      <View>
        <Touchable
          onPress={() => {
            this.clickItem(item)
          }}>
          <View style={styles.itemBG}>
            <Text style={styles.itemTimeText} numberOfLines={1}>
              {item.item.noticePublishTime}
            </Text>
            <View style={styles.itemTopBG}>
              <Text style={styles.itemTopText} numberOfLines={1}>
                {item.item.noticeName}
              </Text>
              <Text style={styles.itemDecText} numberOfLines={1}>
                {item.item.noticeContent}
              </Text>
              <View style={styles.lineBGView}></View>
              <View style={styles.itemBottomBGView}>
                <Text style={styles.itemBottomText} numberOfLines={2}>
                  查看详情
                </Text>
                <Iconfont
                  style={styles.myRight}
                  size={dp(24)}
                  name={'arrow-right1'}
                />
              </View>
            </View>
          </View>
        </Touchable>
        <View style={styles.separatorComponent} />
      </View>
    )
  };

  render () {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <NavBar title={'平台公告'} navigation={navigation} />
        <FlatList
          ref={(view) => {
            this.list = view
          }}
          data={this.state.bulletinList}
          renderItem={(data) => this.renderItem(data)}
          keyExtractor={(item, index) => `${index}`}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  itemBG: {
    height: dp(364)
  },
  itemTimeText: {
    color: '#91969A',
    fontSize: dp(26),
    marginTop: dp(20),
    textAlign: 'center'
  },
  itemTopBG: {
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16),
    marginTop: dp(20)
  },
  itemTopText: {
    color: '#2D2926',
    fontSize: dp(28),
    marginTop: dp(40),
    marginLeft: dp(30),
    fontWeight: 'bold'
  },
  itemDecText: {
    color: '#91969A',
    fontSize: dp(28),
    marginTop: dp(32),
    marginLeft: dp(30),
    marginHorizontal: dp(30)
  },
  lineBGView: {
    height: dp(1),
    backgroundColor: '#E7EBF2',
    marginHorizontal: dp(30),
    marginTop: dp(30)
  },
  itemBottomBGView: {
    height: dp(68),
    marginHorizontal: dp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemBottomText: {
    color: '#91969A',
    fontSize: dp(28)
  }
})

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company,
    supplierInfo: state.company.supplier
  }
}

export default connect(mapStateToProps)(NoticeList)
