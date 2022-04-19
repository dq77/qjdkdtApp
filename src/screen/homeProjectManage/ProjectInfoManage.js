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
import { onClickEvent } from '../../utils/AnalyticsUtil'
import { checkLogin, checkCertification, checkCreadit, updatePendingNum } from '../../utils/UserUtils'

class ProjectManage extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      dataList: [{
        imgName: 'qianjindingxiangmu2x',
        title: '仟金顶项目'
      }, {
        imgName: 'qitaxiangmu2x',
        title: '其他项目'
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

  @checkCreadit
  selectNum () {
    // 仟金顶项目
    onClickEvent('项目信息管理-分类项页-仟金顶项目', 'homeProjectManage/ProjectManage')
    this.props.navigation.navigate('ProjectList')
  }

  selectNumOther () {
    // 其他项目
    onClickEvent('项目信息管理-分类项页-其他项目', 'homeProjectManage/ProjectManage')
    this.props.navigation.navigate('OtherProjectManageList')
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'项目信息管理'} navigation={navigation} />
        <FlatList
          data={this.state.dataList}
          renderItem={data => (
            <Touchable onPress={() => {
              if (data.index === 0) {
                this.selectNum()
              } else {
                this.selectNumOther()
              }
            }} style={styles.bgView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Iconfont style={styles.iconBG} size={dp(150)} name={data.item.imgName} />
                <Text style={styles.titleBG}>{data.item.title}</Text>
              </View>
              <Iconfont style={styles.iconBG} size={dp(44)} name={'daiban-jiantou'} />
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
    marginHorizontal: dp(30),
    height: dp(220),
    borderRadius: dp(16),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconBG: {
    marginHorizontal: dp(30)
  },
  titleBG: {
    fontSize: dp(32),
    color: '#2D2926',
    fontWeight: '500'
  }
})

export default ProjectManage
