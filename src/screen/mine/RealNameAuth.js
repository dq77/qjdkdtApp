import React, { PureComponent } from 'react'
import { StatusBar, View, StyleSheet, SectionList, Text, Platform, RefreshControl, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, getBottomSpace } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import ajaxStore from '../../utils/ajaxStore'
import {
  getCompanyInfo
} from '../../actions'
import { webUrl } from '../../utils/config'
import { isEmpty } from '../../utils/StringUtils'
import PermissionUtils from '../../utils/PermissionUtils'
// enterpriseType 1.自己企业实名   2.担保企业实名
// isClose ： 1.直接返回上一个页面，  其他：退出h5
// personType  认证人类型，接口返的
// realCompanyId：自己企业实名：companyId    担保企业实名 ：enterpriseId
// idcardNumber：身份证号码

class RealNameAuth extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      infoModal: false,
      data: [],
      selectNum: '1',
      entityData: [],
      transactorListData: {},
      guaranteePersonItemData: {},
      indexData: 0,
      sectionData: {},
      totalPages: 1,
      refreshing: false,
      loadEnd: false,
      loadingMore: false,
      pageNo: 1
    }
  }

  componentDidMount () {
    this.setRefreshing(true)
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.init()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  init = async () => {
    StatusBar.setBarStyle('dark-content')
    await this.setState({
      pageNo: 1
    })
    await getCompanyInfo()
    await this.customerListData()
    await this.listPageForEntity(true)
  }

 customerListData = async () => {
   const res = await ajaxStore.credit.customerList({ cifCompanyId: this.props.companyInfo.companyId })
   if (res.data && res.data.code === '0') {
     const data = res.data.data
     // 授权人
     const agentPersonData = []
     data.agentPersonList.forEach(item => {
       const dicData = {
         name: item.personName,
         status: item.personAuthStatus,
         itemData: data.agentPersonList
       }
       agentPersonData.push(dicData)
     })
     // 担保人
     const guarantorPersonData = []
     data.guarantorPersonList.forEach(item => {
       const dicData = {
         name: item.personName,
         status: item.personAuthStatus,
         itemData: data.guarantorPersonList
       }
       guarantorPersonData.push(dicData)
     })
     const dataList = [
       { title: '企业实名认证', data: [{ name: data.customerCorpInfo.corpName, status: data.customerCorpInfo.authStatus, itemData: data.customerCorpInfo, personName: data.legalPeronInfo.personName }] },
       { title: '法人实名认证', data: [{ name: data.legalPeronInfo.personName, status: data.legalPeronInfo.personAuthStatus, itemData: data.legalPeronInfo }] }
       //  { title: '', data: [] } 2020年4月20日上线再加上，这个日期之前隐藏
     ]
     agentPersonData.length > 0 && dataList.push({ title: '授权人', data: agentPersonData })
     guarantorPersonData.length > 0 && dataList.push({ title: '担保人', data: guarantorPersonData })
     this.setState({
       // 0 未认证  1 认证中  2 认证成功 3 认证失败  4 认证失效
       // status : TODO未认证 PROCESS 认证中 SUCCESS 认证成功 REJECT 认证失败 EFFECT 认证失效
       data: dataList,
       transactorListData: {
         customerCorpInfo: data.customerCorpInfo,
         legalPeronInfo: data.legalPeronInfo,
         agentPersonList: data.agentPersonList,
         handlerPersonList: data.handlerPersonList,
         guarantorPersonData: data.guarantorPersonData
       }
     })
   } else {
     global.alert.show({
       content: res.data.message
     })
   }
   this.setRefreshing(false)
 }

 listPageForEntity = async (refresh = false) => {
   const data = {
     customerId: this.props.companyInfo.companyId,
     enterpriseType: 0, // 企业类型：0-担保企业
     //  enterpriseAuthStatus: 0,//企业认证状态：0-初始化，1-认证中，2-认证成功，3-认证失败，4-认证失效
     //  personAuthStatus: 0,//自然人认证状态：0-初始化，1-认证中，2-认证成功，3-认证失败，4-认证失效
     //  cifSupplierId: this.props.companyInfo.companyId,//厂家id
     pageNum: this.state.pageNo, // 第几页
     pageSize: 10// 每页条数
   }
   const res = await ajaxStore.company.listPageForEntity(data)
   if (res.data && res.data.code === '0') {
     const data = res.data.data.list || []
     const entityData = []
     data.forEach(item => {
       const dicData = { title: `${item.enterpriseName}`, data: [item] }
       entityData.push(dicData)
     })

     let loanList
     if (refresh) {
       loanList = entityData
     } else {
       loanList = this.state.entityData.concat(entityData)
     }
     // 企业认证状态：0-初始化，1-认证中，2-认证成功，3-认证失败，4-认证失效
     this.setState({
       entityData: loanList,
       totalPages: res.data.data.total,
       loadEnd: entityData && res.data.data.pages === this.state.pageNo
     })
   } else {
     global.alert.show({
       content: res.data.message
     })
   }
   this.setLoadMore(false)
   this.setRefreshing(false)
 }

 loadMoreData = async () => {
   if (this.state.loadingMore === true || this.state.refreshing === true) return
   this.setLoadMore(true)
   if (this.state.pageNo < this.state.totalPages) {
     await this.setState({ pageNo: this.state.pageNo + 1 })
     this.listPageForEntity()
   } else {
     this.setState({ loadEnd: true })
   }
 }

 setLoadMore (visible) {
   this.setState({ loadingMore: visible })
 }

 renderMore () {
   if (!this.state.loadEnd) {
     return this.state.loadingMore
       ? <View style={styles.indicatorContainer}>
         <ActivityIndicator style={styles.indicator} color={Color.THEME}/>
         <Text style={styles.indicatorText}>正在加载更多</Text>
       </View>
       : null
   } else {
     return <View style={{ alignItems: 'center' }}>
       {/* <View style={styles.separator} /> */}
       <Text style={[styles.indicatorText, { paddingVertical: dp(30), color: '#666666' }]}>——页面到底了——</Text>
     </View>
   }
 }

 refreshData = async () => {
   if (this.state.refreshing) return
   this.setRefreshing(true)
   switch (this.state.selectNum) {
     case '1':
       this.customerListData()
       break
     default:
       await this.setState({ pageNo: 1, pageSize: 10, loadEnd: false })
       this.listPageForEntity(true)
       break
   }
 }

 setRefreshing (visible) {
   this.setState({ refreshing: visible })
 }

 agentCreateComfirm () {
   this.setState({
     infoModal: true
   })
 }

 renderSeparator () {
   return <View style={styles.separator} />
 }

 // enterpriseType 1.自己企业实名   2.担保企业实名
 async toSignerList (item, index, section) {
   console.log('item:' + item + index + section)
   const time = new Date()
   if (section.title !== '') {
     if (section.title === '企业实名认证') {
       if (item.status === '2') { // 认证成功页面
         this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/enterpriseInfo?realCompanyId=${this.props.companyInfo.companyId}&type=2&time=${time.getTime()}&enterpriseType=1`, title: '企业实名认证' })
       } else {
         const res = await ajaxStore.credit.customerList({ cifCompanyId: this.props.companyInfo.companyId })
         if (res.data && res.data.code === '0') {
           const data = res.data.data.customerCorpInfo
           this.taskStack(data, this.props.companyInfo.companyId, '1')
         }
       }
     } else {
       const data = section.title === '法人实名认证' ? this.state.transactorListData.legalPeronInfo : item.itemData[index]
       if (item.status === '2') { // 认证成功页面
         this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/enterpriseInfo?idcardNumber=${data.personIdcard}&realCompanyId=${this.props.companyInfo.companyId}&personType=${encodeURIComponent(data.personType)}&type=1&enterpriseType=1`, title: '实名认证' })
       } else {
         this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/naturalPersonAuth?idcardNumber=${data.personIdcard}&realCompanyId=${this.props.companyInfo.companyId}&personType=${encodeURIComponent(data.personType)}&enterpriseType=1`, title: '实名认证' })
       }
     }
   }
 }

 // 担保企业实名认证
 async guaranteeEnterprise (item, index, section) {
   const res = await ajaxStore.company.getEntity({ enterpriseId: item.enterpriseId })
   if (res.data && res.data.code === '0') {
     const data = res.data.data
     if (data.enterpriseAuthStatus === 2) { // 认证成功页面
       this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/enterpriseInfo?type=2&enterpriseType=2&realCompanyId=${item.enterpriseId}`, title: '企业实名认证' })
     } else {
       this.taskStack(data, item.enterpriseId, '2')
     }
   } else {
     global.alert.show({
       content: res.data.message
     })
   }
 }

 async taskStack (data, realCompanyId, type) {
   if (!data.corpAuthProcessId) {
     this.realnameAuthJumpPage('0', realCompanyId, type)
   } else {
     const taskStackData = {
       processInstanceId: data.corpAuthProcessId,
       taskId: ''
     }
     const res = await ajaxStore.credit.taskStack(taskStackData)
     if (res.data && res.data.code === '0') {
       const currentTask = res.data.data.currentTask || '1'
       if (currentTask !== '1') {
         if (currentTask.taskDefKey === 'FACE_RECOGNIZATION') {
           this.realnameAuthJumpPage('1', realCompanyId, type)
         } else {
           this.realnameAuthJumpPage('0', realCompanyId, type)
         }
       } else {
         this.realnameAuthJumpPage('0', realCompanyId, type)
       }
     } else {
       global.alert.show({
         content: res.data.message
       })
     }
   }
 }

 realnameAuthJumpPage (text, realCompanyId, type) {
   this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/RealnameAuthJumpPage?realCompanyId=${realCompanyId}&enterpriseType=${type}`, title: '企业对公打款认证', backFace: text })
 }

 // 担保自然人实名认证
 async guaranteePerson (item, index, section) {
   const res = await ajaxStore.company.getEntity({ enterpriseId: item.enterpriseId })
   if (res.data && res.data.code === '0') {
     const data = res.data.data.naturalPersonAuthVos[0]
     if (data.personAuthStatus === 2) { // 认证成功页面
       this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/enterpriseInfo?idcardNumber=${data.personIdCard}&realCompanyId=${res.data.data.enterpriseId}&personType=${encodeURIComponent(data.personType)}&type=1&enterpriseType=2`, title: '实名认证' })
     } else {
       this.props.navigation.navigate('WebView', { url: `${webUrl}/mine/naturalPersonAuth?idcardNumber=${data.personIdCard}&realCompanyId=${res.data.data.enterpriseId}&personType=${encodeURIComponent(data.personType)}&enterpriseType=2`, title: '实名认证' })
     }
   } else {
     global.alert.show({
       content: res.data.message
     })
   }
 }

 async selectNum (type) {
   await this.setState({
     selectNum: type
   })
   if (type === '1') {
     await this.customerListData()
   } else {
     await this.listPageForEntity(true)
   }
 }

 topSelectBar () {
   return (
     <View style={{ marginHorizontal: dp(30), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
       <Touchable onPress={() => this.selectNum('1')}>
         <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '1' ? 'white' : '#F7F7F9' }]} >
           <Text style={[styles.title1Style, { color: this.state.selectNum === '1' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '1' ? 'bold' : 'normal' }]}>本企业</Text>
         </View>
       </Touchable>
       <Touchable onPress={() => this.selectNum('2')}>
         <View style={[styles.bgView, { backgroundColor: this.state.selectNum === '2' ? 'white' : '#F7F7F9' }]} >
           <Text style={[styles.title1Style, { color: this.state.selectNum === '2' ? '#353535' : '#91969A', fontWeight: this.state.selectNum === '2' ? 'bold' : 'normal' }]}>担保企业</Text>
         </View>
       </Touchable>
     </View>
   )
 }

 render () {
   const { navigation } = this.props
   return (
     <View style={styles.container}>
       <NavBar title={'实名认证'} navigation={navigation} />
       {this.topSelectBar()}
       {this.state.selectNum === '2' ? <SectionList
         ref={(r) => { this.scrollview = r }}
         style={{ marginTop: dp(20) }}
         stickySectionHeadersEnabled={false}// 关闭头部粘连
         ItemSeparatorComponent={() => this.renderSeparator()}
         renderItem={
           ({ item, index, section }) => (
             <View style={{ backgroundColor: 'white', borderRadius: dp(16), marginHorizontal: dp(30) }}>
               <Touchable key={index} onPress={() => {
                 this.setState({
                   guaranteePersonItemData: item,
                   indexData: index,
                   sectionData: section
                 })
                 this.guaranteeEnterprise(item, index, section)
               }}>
                 <View style={styles.entityItemLeftBg}>
                   <Text style={styles.itemText}>{item.enterpriseName}</Text>
                   <View style={styles.itemRightBg}>
                     <Text style={styles.statusText}>{item.enterpriseAuthStatus === 0 ? '立即认证' : item.enterpriseAuthStatus === 1 ? '认证中' : item.enterpriseAuthStatus === 2 ? '认证成功' : item.enterpriseAuthStatus === 3 ? '认证失败' : item.enterpriseAuthStatus === 4 ? '认证失效' : '立即认证'}</Text>
                     {item.enterpriseAuthStatus !== 2 && <View style={{ borderRadius: dp(6), width: dp(12), height: dp(12), backgroundColor: '#F55849', marginLeft: dp(8), marginRight: dp(20) }}></View>}
                     <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(20)} />
                   </View>
                 </View>
               </Touchable>
               {item.naturalPersonAuthVos.map((item1, key1) => {
                 return (<Touchable key={key1} onPress={() => {
                   this.guaranteePerson(item1, index, section)
                 }}>
                   <View style={styles.entityItemLeftBg} key={key1}>
                     <Text style={styles.itemText}>{item1.personName}</Text>
                     <View style={styles.itemRightBg}>
                       <Text style={styles.statusText}>{item1.personAuthStatus === 0 ? '立即认证' : item1.personAuthStatus === 1 ? '认证中' : item1.personAuthStatus === 2 ? '认证成功' : item1.personAuthStatus === 3 ? '认证失败' : item1.personAuthStatus === 4 ? '认证失效' : '立即认证'}</Text>
                       {item1.personAuthStatus !== 2 && <View style={{ borderRadius: dp(6), width: dp(12), height: dp(12), backgroundColor: '#F55849', marginLeft: dp(8), marginRight: dp(20) }}></View>}
                       <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(20)} />
                     </View>
                   </View>
                 </Touchable>
                 )
               })}
             </View>
           )
         }
         renderSectionHeader={
           ({ section: { title } }) => (
             <View style={[styles.headerBg, { backgroundColor: title !== '' ? '#F7F7F9' : 'white', height: title !== '' ? dp(108) : dp(90) }]}>
               <Text style={styles.headerText}>{title}</Text>
             </View>
           )}
         sections={this.state.entityData}
         keyExtractor={(item, index) => item + index}
         refreshControl={
           <RefreshControl
             title={'加载中'}
             titleColor={Color.TEXT_MAIN}
             colors={[Color.THEME]}
             refreshing={this.state.refreshing}
             onRefresh={this.refreshData}
             tintColor={Color.THEME}
           />
         }
         ListFooterComponent={this.renderMore()}
         onEndReached={() => {
           if (this.canLoadMore) { // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
             this.loadMoreData()
             this.canLoadMore = false
           }
         }}
         onEndReachedThreshold={Platform.OS === 'android' ? 0.1 : 0.5}
         onMomentumScrollBegin={() => {
           this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
         }}

       /> : <SectionList
         ref={(r) => { this.scrollview = r }}
         style={{ marginTop: dp(20) }}
         stickySectionHeadersEnabled={false}// 关闭头部粘连
         ItemSeparatorComponent={() => this.renderSeparator()}
         renderItem={
           ({ item, index, section }) => (<Touchable key={index} onPress={() => this.toSignerList(item, index, section)}>
             <View style={[styles.itemLeftBg, { borderRadius: section.data.length === 1 ? dp(16) : 0, borderTopLeftRadius: index === 0 ? dp(16) : 0, borderTopRightRadius: index === 0 ? dp(16) : 0, borderBottomLeftRadius: index === section.data.length - 1 ? dp(16) : 0, borderBottomRightRadius: index === section.data.length - 1 ? dp(16) : 0 }]}>
               <Text style={styles.itemText}>{item.name}</Text>
               <View style={styles.itemRightBg}>
                 <Text style={styles.statusText}>{item.status === '0' ? '立即认证' : item.status === '1' ? '认证中' : item.status === '2' ? '认证成功' : item.status === '3' ? '认证失败' : item.status === '4' ? '认证失效' : '立即认证'}</Text>
                 {item.status !== '2' && <View style={{ borderRadius: dp(6), width: dp(12), height: dp(12), backgroundColor: '#F55849', marginLeft: dp(8), marginRight: dp(20) }}></View>}
                 <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(20)} />
               </View>
             </View>
           </Touchable>
           )
         }
         renderSectionHeader={
           ({ section: { title } }) => (
             <View style={[styles.headerBg, { backgroundColor: title !== '' ? '#F7F7F9' : 'white', height: title !== '' ? dp(108) : dp(90) }]}>
               {title !== '' ? <Text style={styles.headerText}>{title}</Text> : <Touchable onPress={() => { this.agentCreateComfirm() }}>
                 <View >
                   <View style={styles.separator} />
                   <Text style={styles.addText}>添加授权人</Text>
                 </View>
               </Touchable>}
             </View>
           )}
         sections={this.state.data}
         keyExtractor={(item, index) => item + index}
         refreshControl={
           <RefreshControl
             title={'加载中'}
             titleColor={Color.TEXT_MAIN}
             colors={[Color.THEME]}
             refreshing={this.state.refreshing}
             onRefresh={this.refreshData}
             tintColor={Color.THEME}
           />
         }
         onEndReached={() => {
           if (this.canLoadMore) { // fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
             this.loadMoreData()
             this.canLoadMore = false
           }
         }}
         onEndReachedThreshold={Platform.OS === 'android' ? 0.1 : 0.5}
         onMomentumScrollBegin={() => {
           this.canLoadMore = true // fix 初始化时页调用onEndReached的问题
         }}
       />}

       <ComfirmModal
         title={'声明'}
         content={'委托人特别授权受托人办理线上签约，因委托人自己保管不善、导致账户和密码被使用，产生的一切经济纠纷及法律责任都由委托人自行承担，需授权委托书公司盖章、法定代表人签字、受托人签字。'}
         cancelText={'取消'}
         comfirmText={'同意'}
         textAlign={'left'}
         cancel={() => {
           this.setState({
             infoModal: false
           })
         }}
         confirm={async () => {
           this.setState({
             infoModal: false
           })
           setTimeout(() => {
             this.props.navigation.navigate('AgentCreate', { typePage: '2' })
           }, 500)
         }}
         infoModal={this.state.infoModal} />
     </View>
   )
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    paddingBottom: getBottomSpace()
  },
  separatorModal: {
    height: dp(1),
    backgroundColor: '#e5e5e5',
    marginVertical: 0
  },
  separator: {
    height: dp(1),
    backgroundColor: '#E7EBF2',
    marginLeft: dp(30),
    marginRight: dp(30)
  },
  headerText: {
    marginTop: dp(50),
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#2D2926',
    fontWeight: 'bold'
  },
  headerBg: {
    height: dp(108),
    width: DEVICE_WIDTH,
    backgroundColor: '#EFEFF4'
  },
  itemText: {
    marginLeft: dp(30),
    fontSize: dp(28),
    color: '#2D2926',
    maxWidth: dp(400)
  },
  itemLeftBg: {
    height: dp(96),
    marginHorizontal: dp(30),
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  entityItemLeftBg: {
    height: dp(96),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemRightBg: {
    height: dp(90),
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center'
  },
  arrow: {
    marginRight: dp(30)
  },
  statusIcon: {
    marginRight: dp(24),
    marginLeft: dp(20)
  },
  statusText: {
    fontSize: dp(28),
    color: '#91969A'
  },
  addText: {
    fontSize: dp(28),
    color: '#2EA2DB',
    marginLeft: dp(30),
    height: dp(90),
    marginTop: dp(31)
  },
  bgView: {
    borderRadius: dp(36),
    width: (DEVICE_WIDTH - dp(60)) / 2,
    height: dp(72),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dp(30)
  },
  title1Style: {
    fontSize: dp(28),
    color: '#353535',
    fontWeight: 'bold'
  }

})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(RealNameAuth)
