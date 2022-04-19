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
} from '../../utils/screenUtil'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import { creditMobileUrl } from '../../utils/config'
import { onClickEvent } from '../../utils/AnalyticsUtil'

class ProjectManage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      dataList: [{
        imgName: 'zhaotoubiaoguanli2x',
        title: '招投标管理'
      }, {
        imgName: 'xiangmupingguguanli2x',
        title: '项目评估管理'
      }, {
        imgName: 'xiangmuxinxiguanli2x',
        title: '项目信息管理'
      }],
      refreshing: true
    }
  }

  componentDidMount () {
    // this.visitorDefaultImages()
  }

  // async visitorDefaultImages () {
  //   const res = await ajaxStore.company.visitorDefaultImages()
  //   if (res.data && res.data.code === '0') {
  //     const data = res.data.data || []
  //     data.forEach(element => {
  //       element.status = '1'
  //     })

  //     this.visitorMyImages(data)
  //   } else {
  //     this.setState({
  //       refreshing: false
  //     })
  //     global.alert.show({
  //       content: res.data.message
  //     })
  //   }
  // }

  selectNum (index) {
    switch (index) {
      case 0:// 招投标管理
        onClickEvent('项目管理-主页-分类图标-招投标管理', 'homeProjectManage/ProjectManage')
        this.props.navigation.navigate('WebView', {
          title: '招投标管理',
          url: `${creditMobileUrl}/m/biddingIndex`
        })
        break
      case 1:// 项目评估管理
        onClickEvent('项目管理-主页-分类图标-项目评估管理', 'homeProjectManage/ProjectManage')
        this.props.navigation.navigate('ProjectEvaluationList')
        break
      case 2:// 项目信息管理
        onClickEvent('项目管理-主页-分类图标-项目信息管理', 'homeProjectManage/ProjectManage')
        this.props.navigation.navigate('ProjectInfoManage')
        break

      default:
        break
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'项目管理'} navigation={navigation} />
        <FlatList
          data={this.state.dataList}
          horizontal={false}
          numColumns={2}
          renderItem={data => (
            <Touchable onPress={() => this.selectNum(data.index)}>
              <View style={styles.bgView} >
                <View style={styles.iconBG}>
                  <Iconfont style={styles.icon} size={dp(65)} name={data.item.imgName} />
                </View>
                <Text style={styles.titleBG}>{data.item.title}</Text>
              </View>
            </Touchable>)}
          keyExtractor={(item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
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
  bgView: {
    marginLeft: dp(30),
    marginTop: dp(30),
    backgroundColor: 'white',
    width: DEVICE_WIDTH * 0.44,
    borderRadius: dp(16),
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dp(30)
  },
  iconBG: {
    marginBottom: dp(20),
    backgroundColor: '#F4F9FF',
    width: dp(120),
    height: dp(120),
    borderRadius: dp(70)
  },
  icon: {
    marginLeft: dp(30),
    marginTop: dp(30)
  },
  titleBG: {
    fontSize: dp(28),
    color: '#2D2926'
  }
})

export default ProjectManage
