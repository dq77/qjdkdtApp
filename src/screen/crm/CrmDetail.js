import React, { Component } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import { getRegionTextArr } from '../../utils/RegionByAjax'
import { SolidBtn } from '../../component/CommonButton'
import Picker from 'react-native-picker'
import { isEmpty } from '../../utils/StringUtils'
import { setGoodsItems } from '../../actions/index'
import { showToast, toAmountStr, formValid } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import {
  vEmail, vPhone, vCompanyName, vChineseName
} from '../../utils/reg'
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import BottomFullModal from '../../component/BottomFullModal'
import { callPhone } from '../../utils/PhoneUtils'
import { onClickEvent } from '../../utils/AnalyticsUtil'

class CrmDetail extends Component {
  constructor (props) {
    super(props)

    this.state = {
      id: '',
      refreshing: false,
      data: {},
      tabIndex: 0,
      traceList: [],
      traceDateList: [] // 处理后

    }
  }

  async componentDidMount () {
    const { params } = this.props.navigation.state
    await this.setState({
      id: params.id || ''
    })

    this.didFocusListener = this.props.navigation.addListener('didFocus',
      (obj) => {
        this.onRefresh()
      }
    )
  }

  componentWillUnmount () {
    this.didFocusListener.remove()
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    await this.loadData()
    await this.getTraceList()
    this.setState({ refreshing: false })
  }

  async loadData () {
    const res = await ajaxStore.crm.getCrmDetail({ id: this.state.id })
    if (res && res.data && res.data.code === '0') {
      this.setState({
        data: res.data.data
      })
    }
  }

  async getTraceList () {
    const res = await ajaxStore.crm.getTraceList({
      leadsId: this.state.id
    })
    if (res && res.data && res.data.code === '0') {
      await this.setState({
        traceList: res.data.data,
        traceDateList: res.data.data ? this.processData(res.data.data) : []
      })
      console.log(this.state)
    }
  }

  processData (data = []) {
    var map = {}
    var dest = []
    for (var i = 0; i < data.length; i++) {
      var ai = data[i]
      var year = ai.gmtCreated.split(' ')[0]
      if (!map[year]) {
        dest.push({
          year,
          data: [ai]
        })
        map[year] = ai
      } else {
        for (var j = 0; j < dest.length; j++) {
          var dj = dest[j]
          if (dj.year === year) {
            dj.data.push(ai)
            break
          }
        }
      }
    }
    return dest
  }

  renderTrance () {
    const views = []

    if (!this.state.traceDateList || this.state.traceDateList.length === 0) {
      views.push(
        <View key={'empty'} style={{ flex: 1, height: dp(300), alignItems: 'center', justifyContent: 'center' }} >
          <Text style={{ color: '#999999' }}>暂无数据</Text>
        </View>
      )
      return views
    }
    this.state.traceDateList && this.state.traceDateList.forEach((item, index) => {
      views.push(
        <View style={styles.dateitem} key={'a' + index} >
          <Text style={{ color: '#494949', fontSize: dp(38), marginVertical: dp(8) }}>{item.year}</Text>

          {item.data && item.data.map((item2, index2) => {
            return (<View style={styles.tranceItem} key={'b' + index2}>
              <View style={{ width: dp(170) }}>
                <Text style={{ color: '#494949', fontSize: dp(28) }}>{item2.gmtCreated.split(' ')[1]}</Text>
                <View style={styles.liness} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: dp(28), color: '#494949', marginTop: dp(2) }}>跟进记录</Text>
                <Text style={{ marginVertical: dp(28), color: '#91969A', fontSize: dp(28) }}>{item2.logContent}</Text>
              </View>

            </View>)
          })}

        </View>
      )
    })

    return views
  }

  renderContract () {
    const views = []
    this.state.data.leadsAppContactDtoList && this.state.data.leadsAppContactDtoList.forEach((item, index) => {
      views.push(
        <View key={index}>
          <Text style={{ marginTop: dp(30) }}>{`联系人${index + 1}`}</Text>
          <View style={styles.row}>
            <Text style={styles.linktext}>联系人：</Text>
            <Text style={[styles.linktext, { flex: 1, textAlign: 'right' }]}>{item.linkName || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.linktext}>职位：</Text>
            <Text style={[styles.linktext, { flex: 1, textAlign: 'right' }]}>{item.post || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.linktext}>联系电话：</Text>
            <Text
              onPress={() => {
                callPhone(item.phoneNumber)
              }}
              style={[styles.linktext, {
                flex: 1,
                textAlign: 'right',
                marginRight: dp(8),
                color: '#2A6EE7'
              }]}>{item.phoneNumber || ''}</Text>
            <Iconfont name={'CRM-dadianhua'} size={dp(22)} color={'#2A6EE7'} />
          </View>
          {index !== this.state.data.leadsAppContactDtoList.length - 1 &&
            <View style={{ height: dp(1), backgroundColor: '#E7EBF2', marginTop: dp(30) }} />
          }
        </View>
      )
    })

    return views
  }

  editCrm = () => {
    this.props.navigation.navigate('CrmCreat', { type: 'edit', data: this.state.data })
    // this.props.navigation.navigate('CrmCreat', {
    //   data: {
    //     fissionId:'',
    //     leadsAppContactDtoList:[
    //       {
    //         linkName: '', // 联系人姓名
    //         phoneNumber: '', // 联系人手机号
    //       }
    //     ]
    //   }
    // })
  }

  render () {
    const { navigation } = this.props
    const { data, tabIndex, id } = this.state
    const {
      socialCreditCode, legalPerson, leadsName,
      provinceCode, cityCode, areaCode, leadsDetailAddress,
      leadsSource, leadsManagerUser
    } = data
    return (
      <View style={styles.container}>
        <NavBar title={'客户详情'} navigation={navigation} rightIcon={null} />
        <ScrollView keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              // colors={[Color.THEME]}
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }>
          <View style={{ marginVertical: dp(30) }}>

            <Touchable isNativeFeedback={true} onPress={() => {
              this.editCrm()
            }}>
              <View style={styles.item} >
                <Iconfont name={'CRM-gongjuicon'} size={dp(50)} color={'#2A6EE7'} />
                <View style={{ marginLeft: dp(10), flex: 1 }}>
                  <Text style={styles.title}>{leadsName || ''}</Text>
                  <Text style={styles.text}>{`法人：${legalPerson || ''}`}</Text>
                  <Text style={styles.text}>{`社会统一信用代码：${socialCreditCode || ''}`}</Text>
                  <Text style={styles.text}>{`地址： ${provinceCode && cityCode ? getRegionTextArr(provinceCode, cityCode, areaCode).join(' ') : ''} ${leadsDetailAddress || ''}`}</Text>
                </View>
                <Iconfont name={'CRM-xiugaixinxi'} size={dp(30)} style={{ marginTop: dp(17), marginLeft: dp(3) }} color={'#3C68EF'} />
              </View>
            </Touchable>

            <View style={[styles.item, { flexDirection: 'column' }]} >
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: dp(28), color: '#91969A', flex: 1 }}>客户来源：</Text>
                <Text style={{ fontSize: dp(28), color: '#91969A' }}>{leadsSource}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: dp(20) }}>
                <Text style={{ fontSize: dp(28), color: '#91969A', flex: 1 }}>客户负责人：</Text>
                <Text style={{ fontSize: dp(28), color: '#91969A' }}>{leadsManagerUser}</Text>
              </View>
            </View>

            <View style={[styles.item, { flexDirection: 'column', paddingBottom: dp(50) }]} >
              <View style={{ paddingVertical: dp(6), flexDirection: 'row', marginBottom: dp(30) }}>
                <Touchable style={styles.tab} onPress={() => { this.setState({ tabIndex: 0 }) }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={tabIndex === 0 ? styles.tabtext : styles.tabtext1}>跟进记录</Text>
                    <View style={tabIndex === 0 ? styles.line : styles.line1} />
                  </View>
                </Touchable>
                <Touchable style={styles.tab} onPress={() => { this.setState({ tabIndex: 1 }) }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={tabIndex === 1 ? styles.tabtext : styles.tabtext1}>联系人</Text>
                    <View style={tabIndex === 1 ? styles.line : styles.line1} />
                  </View>
                </Touchable>
              </View>

              {this.state.tabIndex === 0
                ? this.renderTrance()
                : this.renderContract()}

            </View>

          </View>
        </ScrollView>

        <Touchable style={styles.creatOrder} onPress={() => {
          onClickEvent('CRM-客户详情页-填写跟进', 'crm/AddTrance')
          this.props.navigation.navigate('AddTrance', { id })
        }}>
          <View >
            <Text style={{ color: 'white', fontSize: dp(26) }}>填写</Text>
            <Text style={{ color: 'white', fontSize: dp(26) }}>跟进</Text>
          </View>
        </Touchable>

      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId
  }
}

export default connect(mapStateToProps)(CrmDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  item: {
    width: dp(690),
    flexDirection: 'row',
    paddingHorizontal: dp(30),
    paddingVertical: dp(30),
    backgroundColor: 'white',
    marginHorizontal: dp(30),
    marginBottom: dp(30),
    borderRadius: dp(16)
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    marginTop: dp(7),
    fontWeight: 'bold',
    marginBottom: dp(20)
  },
  text: {
    fontSize: dp(25),
    color: '#888888',
    marginTop: dp(10)
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  line: {
    width: dp(50),
    height: dp(8),
    backgroundColor: '#2A6EE7',
    marginTop: dp(10)
  },
  line1: {
    width: dp(50),
    height: dp(8),
    // backgroundColor: '#2A6EE7',
    marginTop: dp(10)
  },
  tabtext: {
    color: '#2A6EE7',
    fontSize: dp(32)
  },
  tabtext1: {
    color: '#2D2926',
    fontSize: dp(32)
  },
  creatOrder: {
    position: 'absolute',
    bottom: dp(120),
    right: dp(30),
    backgroundColor: '#2A6EE7',
    width: dp(110),
    height: dp(110),
    borderRadius: dp(60),
    alignItems: 'center',
    justifyContent: 'center'
  },
  tranceItem: {
    flexDirection: 'row'
  },
  dateitem: {
    // paddingHorizontal: dp(30)
  },
  liness: {
    width: dp(1),
    flex: 1,
    backgroundColor: '#DCDCDC',
    marginVertical: dp(13),
    marginLeft: dp(60)
  },
  row: {
    flexDirection: 'row',
    marginTop: dp(20),
    alignItems: 'center'
  },
  linktext: {
    color: '#91969A',
    fontSize: dp(28)
  }

})
