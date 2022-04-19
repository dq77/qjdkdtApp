// import * as React from 'react'
import React, { PureComponent, useState } from 'react'
import { View, StyleSheet, Dimensions, Text, BackHandler, StatusBar } from 'react-native'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import Color from '../../../utils/Color'
import { getRealDP as dp } from '../../../utils/screenUtil'
import ContractPending from './ContractPending'
import OrderPending from './OrderPending'
import LoanPending from './LoanPending'
import { TopBar } from './TopBar'
import { handleBackPress } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import { connect } from 'react-redux'
import Touchable from '../../../component/Touchable'

const initialLayout = { width: Dimensions.get('window').width }

class Pending extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      index: 0,
      routes: [
        { key: 'contract', title: '合同待办' },
        { key: 'loan', title: '还款待办' }
      ],
      messageListNum: 0
    }
  }

  componentDidMount () {
    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        StatusBar.setBarStyle('dark-content')
        this.init()
      }
    )
    BackHandler.addEventListener('hardwareBackPress', () =>
      handleBackPress(this.props.navigation)
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
    BackHandler.removeEventListener('hardwareBackPress', () =>
      handleBackPress(this.props.navigation)
    )
  }

  async init () {
    this.messageListData()
  }

  async messageListData () {
    const data = {
      messageStatus: 'SUCCESS',
      companyName: this.props.companyInfo.corpName,
      pageNo: 1,
      pageSize: 100
    }
    const res = await ajaxStore.company.messageList(data)
    if (res.data && res.data.code === '0') {
      const messageList = res.data.data.pagedRecords
      this.setState({
        messageListNum: messageList.length || 0
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  renderScene = ({ route }) => {
    switch (route.key) {
      case 'contract':
        return <ContractPending navigation={this.props.navigation} />
      // case 'order':
      //   return <OrderPending navigation={this.props.navigation} load={load => { this.loadOrder = load }} />
      default:
        return <LoanPending navigation={this.props.navigation} />
    }
  }

   renderTabBar = (props) => (
     <TabBar
       {...props}
       labelStyle={{}}
       contentContainerStyle={{}}
       indicatorContainerStyle={{}}
       tabStyle={{ width: dp(220), padding: 0 }}
       indicatorStyle={{
         backgroundColor: '#FECD00',
         height: dp(8),
         width: dp(130),
         marginBottom: dp(10),
         borderRadius: dp(10),
         marginLeft: dp(40)
       }}
       style={{
         backgroundColor: Color.DEFAULT_BG,
         shadowColor: 'transparent',
         shadowOpacity: 0,
         elevation: 0,
         shadowOffset: { height: 0, width: 0 },
         marginBottom: dp(20)
       }}
       renderLabel={({ route, focused, color }) => {
         const { contractNum, loanNum } = this.props
         //  console.log('contractNum', contractNum)
         //  console.log('loanNum', loanNum)
         const num = route.key === 'contract' ? contractNum : loanNum

         return (
           <View style={styles.tab}>
             <Text style={focused ? styles.tabtext : styles.tabtext1}>{route.title}</Text>
             {num > 0 ? <Text style={styles.dot}>{num}</Text> : null}
           </View>
         )
       }}
     />
   )

   render () {
     const { navigation } = this.props
     const { index } = this.state
     return (
       <View style={styles.container}>
         <TopBar title={'待办'} navigation={navigation} messageListNum={this.state.messageListNum} />

         <TabView
           navigationState={{ index: this.state.index, routes: this.state.routes }}
           renderScene={this.renderScene}
           onIndexChange={(index) => this.setState({ index })}
           initialLayout={initialLayout}
           renderTabBar={this.renderTabBar}
         />
       </View>

     )
   }
}

const mapStateToProps = (state) => {
  return {
    contractNum: state.user.contractNum,
    loanNum: state.user.loanNum,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(Pending)

const styles = StyleSheet.create({
  scene: {

  },
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  tabview: {
    flexDirection: 'row'
  },
  tab: {
    paddingTop: dp(28),
    paddingBottom: dp(10),
    paddingLeft: dp(32),
    paddingRight: dp(38),
    alignItems: 'center'
  },
  line: {
    backgroundColor: '#FECD00',
    width: dp(130),
    height: dp(8)
  },
  line1: {
    // backgroundColor: '#FECD00',
    width: dp(130),
    height: dp(8)
  },
  tabtext: {
    fontSize: dp(32),
    marginBottom: dp(10),
    color: '#2D2926'
  },
  tabtext1: {
    fontSize: dp(32),
    marginBottom: dp(10),
    color: '#91969A'
  },
  dot: {
    position: 'absolute',
    left: dp(160),
    top: dp(17),
    backgroundColor: '#F55849',
    color: 'white',
    fontSize: dp(24),
    textAlign: 'center',
    borderRadius: dp(16),
    paddingHorizontal: dp(8),
    overflow: 'hidden'
  }
})
