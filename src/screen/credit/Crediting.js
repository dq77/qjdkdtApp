import React, { PureComponent, Component } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { showToast } from '../../utils/Utility'
import { callPhone } from '../../utils/PhoneUtils'
import ComfirmModal from '../../component/ComfirmModal'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import CustomerService from '../../component/CustomerService'
import { connect } from 'react-redux'

class Crediting extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      list: [
        { name: '收到申请', date: '', actived: true, icon: 'icon-crediting', iconActive: 'icon-crediting-actived', text: '一般需要1工作日' },
        { name: '客户经理审核', date: '', actived: false, icon: 'icon-crediting1', iconActive: 'icon-crediting-actived1', text: '一般需要1工作日' },
        { name: '资料解析中', date: '', actived: false, icon: 'icon-crediting2', iconActive: 'icon-crediting-actived2', text: '一般需要1工作日' },
        { name: '风险初审', date: '', actived: false, icon: 'icon-crediting3', iconActive: 'icon-crediting-actived3', text: '一般需要1工作日' },
        { name: '风险复审', date: '', actived: false, icon: 'icon-crediting4', iconActive: 'icon-crediting-actived4', text: '一般需要1工作日' },
        { name: '获得额度', date: '', actived: false, icon: 'icon-crediting5', iconActive: 'icon-crediting5', text: '授信额度将以短信形式通知您' }
      ]
    }
  }

  componentDidMount () {
    this.getData()
  }

  async getData () {
    const res = await ajaxStore.credit.creditResult()
    if (res.data && res.data.code === '0') {
      const array = [...this.state.list]
      const step = res.data.data.step
      array[0] = {
        ...array[0],
        date: res.data.data.createTime
      }
      if (step && step > 0) {
        for (let i = 1; i < step + 1; i++) {
          array[i] = {
            ...array[i],
            date: res.data.data.timeLine[i] || '',
            actived: true
          }
        }
      }
      this.setState({
        list: array
      })
    }
  }

  renderItems () {
    const views = []
    for (let i = 0, length = this.state.list.length; i < length; i++) {
      views.push(<StepItem item={this.state.list[i]} key={i} />)
    }
    return views
  }

  render () {
    const { navigation, userInfo } = this.props
    return (
      <View >
        <NavBar title={'授信额度申请审核中'} navigation={navigation} />
        <ScrollView contentContainerStyle={{ paddingBottom: dp(200) }}>
          <View style={styles.container}>
            <View style={styles.content}>
              {this.renderItems()}
            </View>
            <SolidBtn text='拨打客服咨询热线' style={styles.btn} onPress={() => { callPhone(4006121666) }} />
            <Text style={styles.hint}> 工作时间：全年 9:00-18.00</Text>
            <CustomerService navigation={navigation} name={userInfo.userName}/>
          </View>
        </ScrollView>
      </View>
    )
  }
}

class StepItem extends PureComponent {
  constructor (props) {
    super(props)
    const { item } = this.props
    this.state = {
      item
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (props.item !== state.item) {
      return {
        item: props.item
      }
    }
    return null
  }

  render () {
    const { item } = this.state
    return (
      <View style={styles.row} >
        <View style={styles.left}>
          <Iconfont name={item.actived ? item.iconActive : item.icon} size={dp(100)} style={styles.icon} />
          {item.name === '获得额度' ? null : <View style={item.actived ? styles.line : styles.line1} />}
        </View>
        <View style={styles.right}>
          <Text style={item.actived ? styles.name : styles.name1}>{item.name}</Text>
          <Text style={item.actived ? styles.date : styles.date1}>{(item.actived && item.date !== '') ? item.date : item.text}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  content: {
    paddingVertical: dp(60)
  },
  left: {
    alignItems: 'center'
  },
  right: {
    paddingLeft: dp(30)
  },
  row: {
    flexDirection: 'row',
    marginLeft: DEVICE_WIDTH * 0.13
  },
  line: {
    width: dp(5),
    height: dp(20),
    backgroundColor: '#4c4b74',
    marginVertical: dp(20)
  },
  line1: {
    width: dp(5),
    height: dp(20),
    backgroundColor: '#e5e5e5',
    marginVertical: dp(20)
  },
  icon: {
  },
  name: {
    fontSize: dp(30),
    marginTop: dp(10),
    fontWeight: 'bold',
    color: Color.TEXT_MAIN
  },
  name1: {
    fontSize: dp(30),
    marginTop: dp(10),
    fontWeight: 'bold',
    color: Color.TEXT_LIGHT
  },
  date: {
    fontSize: dp(25),
    marginTop: dp(10),
    color: Color.TEXT_MAIN
  },
  date1: {
    fontSize: dp(25),
    marginTop: dp(10),
    color: Color.TEXT_LIGHT
  },
  btn: {
    marginTop: dp(30)
  },
  hint: {
    fontSize: dp(25),
    marginTop: dp(30),
    color: Color.TEXT_LIGHT
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo
  }
}

export default connect(mapStateToProps)(Crediting)
