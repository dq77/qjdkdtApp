
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, SectionList, TouchableOpacity } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../../utils/screenUtil'
import PropTypes from 'prop-types'
import Color from '../../../utils/Color'
import Touchable from '../../../component/Touchable'
import {
  getCSContractList
} from '../../../actions'
import { toAmountStr } from '../../../utils/Utility'
import ajaxStore from '../../../utils/ajaxStore'
import { processStatus } from '../../../utils/enums'
import { webUrl } from '../../../utils/config'
import { getTimeDifference } from '../../../utils/DateUtils'
import { onEvent } from '../../../utils/AnalyticsUtil'
import Iconfont from '../../../iconfont/Icon'

class GoodInfoData extends PureComponent {
  static defaultProps = {
    comfirm: function () { },
    companyId: ''
  }

  static propTypes = {
    comfirm: PropTypes.func,
    companyId: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      comfirmText: '取消',
      isUnfold: '0', // 是否展开
      dataList: []
    }
  }

  _Comfirm () {
    this.props.confirm && this.props.confirm()
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { data } = this.props
    const dataList = (data.length > 5 && this.state.isUnfold === '0') ? data.slice(0, 5) : data
    // console.log(this.state.dataList, 'this.state.dataList')
    return (
      <SectionList
        stickySectionHeadersEnabled={false}// 关闭头部粘连
        ItemSeparatorComponent={() => this.renderSeparator()}
        scrollEnabled={false}
        style={{
          backgroundColor: 'white',
          marginHorizontal: dp(30),
          borderRadius: dp(16),
          marginTop: dp(40)
        }}
        renderItem={
          ({ item, index, section }) =>
          // <Touchable key={index} isNativeFeedback={true} onPress={() => this.toSignerList(item, index, section)}>
          // {item.productName}
          // {item.orderAmount}
            <View key={index} style={styles.itemLeftBg}>
              <Text style={{ fontSize: dp(24), color: '#91969A', width: dp(80) }}>{index + 1}</Text>
              <Text style={{ fontSize: dp(24), color: '#91969A', marginLeft: dp(20), width: dp(140), textAlign: 'left' }}>{item.productName}</Text>
              <Text style={{ fontSize: dp(24), color: '#91969A', marginLeft: dp(44), width: dp(104), textAlign: 'right' }}>{item.orderAmount}</Text>
              <Text style={{ fontSize: dp(24), color: '#91969A', marginLeft: dp(44), width: dp(190), textAlign: 'right' }}>{toAmountStr(item.totalCost, 2, true)}</Text>
            </View>
            // </Touchable>
        }
        renderSectionHeader={
          ({ section: { title } }) => (
            <View >
              <View style={{ backgroundColor: 'white', marginVertical: dp(40), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: dp(30) }}>
                <Text style={{ fontSize: dp(28), color: '#2D2926', fontWeight: 'bold' }}>商品信息</Text>
                <TouchableOpacity onPress={() => {
                  this.setState({
                    isUnfold: '0'
                  })
                  this._Comfirm()
                }} >
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={[styles.title2Style, { marginRight: 0 }]}>{this.props.title1}</Text>
                    <Iconfont style={styles.title2Style} name={'arrow2x'} size={dp(24)} />
                  </View>
                </TouchableOpacity>
              </View>
              {(dataList.length > 0) && <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: dp(20), marginBottom: dp(30) }}>
                <Text style={{ fontSize: dp(24), color: '#2D2926', marginLeft: dp(30) }}>排名</Text>
                <Text style={{ fontSize: dp(24), color: '#2D2926', marginLeft: dp(54) }}>商品名称</Text>
                <Text style={{ fontSize: dp(24), color: '#2D2926', marginLeft: dp(114) }}>出货量</Text>
                <Text style={{ fontSize: dp(24), color: '#2D2926', marginLeft: dp(144) }}>出货金额</Text>
              </View>}
              {(dataList.length > 4 && this.state.isUnfold === '0') && this.renderSeparator()}
            </View>
          )}
        renderSectionFooter={
          ({ section: { title } }) => (
            <View>
              {(dataList.length > 4 && this.state.isUnfold === '0') && this.renderSeparator()}
              {(dataList.length > 4 && this.state.isUnfold === '0') &&
              <TouchableOpacity onPress={() => {
                this.setState({
                  isUnfold: '1'
                })
              }} ><View style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: dp(30), height: dp(90) }}>
                  <Text style={{ color: '#91969A', fontSize: dp(28) }}>展开更多数据</Text>
                  <Iconfont style={styles.title2Style} name={'arrow-right1'} size={dp(24)} />
                </View>
              </TouchableOpacity>}
              {dataList.length === 0 && <View style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: dp(30), height: dp(90) }}>
                <Text style={{ color: '#91969A', fontSize: dp(28) }}>暂无商品信息</Text>
              </View>}
            </View>
          )
        }
        sections= {[{
          title: '',
          data: dataList
        }]}
        keyExtractor={(item, index) => item + index}
      />
    )
  }
}

const styles = StyleSheet.create({
  dialogTitle: {
    fontSize: dp(40),
    textAlign: 'center',
    marginBottom: dp(30)
  },
  title2Style: {
    fontSize: dp(24),
    color: '#A5A5A5'
  },
  separator: {
    height: dp(1),
    backgroundColor: Color.SPLIT_LINE,
    marginHorizontal: dp(30)
  },
  itemLeftBg: {
    // minHeight: dp(83),
    marginHorizontal: dp(30),
    marginVertical: dp(30),
    // justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  progress: {
    // transform: [{ scaleX: -1 }]
  },
  progressText: {
    textAlign: 'center',
    fontSize: dp(24)
    // transform: [{ scaleX: -1 }]
  }
})

export default GoodInfoData
