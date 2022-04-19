
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
import { AnimatedCircularProgress } from 'react-native-circular-progress'

class ManufacturerData extends PureComponent {
  static defaultProps = {
    companyId: ''
  }

  static propTypes = {
    companyId: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      comfirmText: '取消',
      isUnfold: '0' // 是否展开
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
    const dataList = (data.length > 3 && this.state.isUnfold === '0') ? data.slice(0, 3) : data
    return (
      <SectionList
        stickySectionHeadersEnabled={false}// 关闭头部粘连
        ItemSeparatorComponent={() => this.renderSeparator()}
        style={{
          backgroundColor: 'white',
          marginHorizontal: dp(30),
          borderRadius: dp(16),
          marginTop: dp(40)
        }}
        renderItem={
          ({ item, index, section }) =>
            // <Touchable key={index} isNativeFeedback={true} onPress={() => this.toSignerList(item, index, section)}>
            <View key={index} style={styles.itemLeftBg}>
              <View style={{ }}>
                <Text style={{ color: '#91969A', fontSize: dp(28) }}>{item.supplierName}</Text>
                <Text style={{ color: '#2D2926', fontSize: dp(28), marginTop: dp(20) }}>{toAmountStr(item.amount, 2, true)}</Text>
              </View>
              {/* <AnimatedCircularProgress
                  rotation={0}
                  style={styles.progress}
                  size={dp(100)}
                  width={dp(10)}
                  fill={20}
                  tintColor={'#D3B685'}
                  lineCap={'round'}
                  backgroundColor={Color.DEFAULT_BG}>
                  {(fill) => (
                    <Text style={styles.progressText}>{`${parseFloat(fill).toFixed(0)}%`}</Text>
                  )}
                </AnimatedCircularProgress> */}
            </View>
            // </Touchable>
        }
        renderSectionHeader={
          ({ section: { title } }) => (
            <View style={{ backgroundColor: 'white', marginTop: dp(40), marginBottom: dp(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: dp(30) }}>
              <Text style={{ fontSize: dp(28), color: '#2D2926', fontWeight: 'bold' }}>合作厂家数据</Text>
              <TouchableOpacity onPress={() => {
                this._Comfirm()
              }} >
                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                  <Text style={[styles.title2Style, { marginRight: 0 }]}>{this.props.title1}</Text>
                  <Iconfont style={styles.title2Style} name={'arrow2x'} size={dp(24)} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        renderSectionFooter={
          ({ section: { title } }) => (
            <View>
              {(dataList.length > 2 && this.state.isUnfold === '0') && this.renderSeparator()}
              {(dataList.length > 2 && this.state.isUnfold === '0') &&
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
                <Text style={{ color: '#91969A', fontSize: dp(28) }}>暂无合作厂家数据</Text>
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
    height: dp(159),
    marginHorizontal: dp(30),
    justifyContent: 'space-between',
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

export default ManufacturerData
