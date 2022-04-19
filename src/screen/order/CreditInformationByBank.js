import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, Alert, DeviceEventEmitter, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import EventTypes from '../../utils/EventTypes'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { setGoodsItems, setOrderSubmitData, setDefaultBaseInfo } from '../../actions/index'
import { formatTime, toAmountStr, formValid, showToast } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import { getRegionTextArr } from '../../utils/Region'
import RegionPickerUtil from '../../utils/RegionPickerUtil'
import CheckBox from 'react-native-check-box'
import GoodsListComponent from './component/GoodsListComponent'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import {
  vAmount, vPhone
} from '../../utils/reg'

export default class CreditInformationByBank extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      hasAuthed: false,
      reason: '',
      canSubmit: false,
      dataList: [
        { name: '经营地信息', id: '7', cateCode: ['C10023'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
        { name: '租赁合同或产权证明', id: '9', cateCode: ['C10088'], authFileId: [], count: 0, isRequired: false, url: 'NormalUpload' }
      ]
    }
  }

  componentDidMount () {
    this.lodaData()
  }

  async lodaData () {
    const res = await ajaxStore.order.memberAuthFileRequired()
    console.log(res.data)
    if (res.data && res.data.code === '0' && res.data.data.length > 0) {
      const dataList = [].concat(this.state.dataList)
      const cateCodeMap = {
        C10001: '1',
        C10012: '3',
        C10013: '10',
        C10045: '13',
        C10044: '14',
        C10014: '5',
        C10015: '5',
        C10017: '4',
        C10018: '6',
        C10021: '2',
        C10023: '7',
        C10024: '9',
        C10025: '8',
        C10026: '3',
        C10088: '9'
      }
      dataList.forEach((item) => {
        item.count = 0
        item.authFileId = []
        res.data.data.forEach((item2) => {
          if (item.id === cateCodeMap[item2.cateCode]) {
            const count = item2.count || 0

            item.authFileId.push(item2.id)

            item.count += count * 1
          }
        })
        // item.url = '/customerPages/pages/erji_creditUpload/erji_creditUpload?id=' + item.id + '&uploaded=' + (item.count > 0 ? '1' : '0') + '&authFileId=' + item.authFileId
      })
      this.setState({
        dataList
      })
    }
  }

  back = () => {
    this.props.navigation.goBack()
  }

  toUpload = (item) => {
    const { url, id } = item
    const { navigation } = this.props
    navigation.navigate(url, {
      creditItem: item,
      refresh: () => {
        this.lodaData()
      }
    })
  }

  renderList () {
    const views = []
    // this.state.dataList.forEach((item, index) => {
    //   views.push(this.renderItem(item, index))
    // })
    for (let i = 0; i < this.state.dataList.length; i++) {
      views.push(this.renderItem(this.state.dataList[i], i))
    }
    return views
  }

  renderItem (item, index) {
    const { otherInfo } = this.props
    return (
      <View key={index}>
        <View style={styles.splitLine} />
        <Touchable isNativeFeedback={true} onPress={() => this.toUpload(item)}>
          <View style={styles.itemWarp} key={item.id} >

            <Text style={styles.itemNameWarp}>
              <Text style={styles.itemName}>{`${index + 1}.${item.name}`}</Text>
            </Text>
            {item.successMsg
              ? (
                otherInfo.holderPhone ? (
                  <Text style={styles.itemUploaded}>{item.successMsg}</Text>
                ) : (
                  <Text style={styles.itemNoUploaded}>{item.failMsg}</Text>
                )
              )
              : (
                item.count > 0 ? (
                  <Text style={styles.itemUploaded}>{`已上传${item.count}张`}</Text>
                ) : (
                  <Text style={styles.itemNoUploaded}>{'未上传'}</Text>
                )
              )}

            <Iconfont style={styles.arrow} name={'arrow-right'} size={dp(25)} />
          </View>
        </Touchable>
      </View>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'补充资料'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.title}>资料补充清单</Text>
            {this.renderList()}
            <View style={styles.btn}>
              <SolidBtn text={'返回订单'} onPress={this.back} />
            </View>
          </View>
        </ScrollView>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#e5e5e5'
  },
  itemWarp: {
    width: DEVICE_WIDTH,
    padding: dp(40),
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  itemNameWarp: {
    marginBottom: dp(30)
  },
  itemName: {
    fontSize: dp(30)
  },
  noRequired: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT
  },
  itemNoUploaded: {
    fontSize: dp(26),
    padding: dp(10),
    paddingHorizontal: dp(15),
    backgroundColor: '#C9C9C9',
    borderRadius: dp(10),
    color: Color.WHITE
  },
  itemUploaded: {
    fontSize: dp(26),
    padding: dp(10),
    paddingHorizontal: dp(15),
    backgroundColor: '#3DC2B8',
    borderRadius: dp(10),
    color: Color.WHITE
  },
  arrow: {
    position: 'absolute',
    right: dp(30),
    top: dp(100)
  },
  title: {
    fontSize: dp(33),
    fontWeight: 'bold',
    marginLeft: dp(30),
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  btn: {
    alignItems: 'center',
    marginTop: dp(70)
  }
})
