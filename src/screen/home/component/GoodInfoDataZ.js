
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
import SixMonthDataZ from './SixMonthDataZ'

class GoodInfoDataZ extends PureComponent {
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
    const { title1, aiManageWarnData = {} } = this.props
    // const dataList = (data.length > 5 && this.state.isUnfold === '0') ? data.slice(0, 5) : data
    // console.log(this.state.dataList, 'this.state.dataList')
    return (
      <View style={{ backgroundColor: 'white', marginBottom: 0, borderRadius: dp(16) }}>
        <View style={{ backgroundColor: 'white', marginTop: dp(40), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: dp(30) }}>
          <Text style={{ fontSize: dp(24), color: '#91969A' }}>累计销售金额</Text>
          <TouchableOpacity onPress={() => {
            this._Comfirm()
          }} >
            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
              <Text style={[styles.title2Style, { marginRight: 0 }]}>{this.props.title1}</Text>
              <Iconfont style={styles.title2Style} name={'arrow2x'} size={dp(24)} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: dp(30), marginTop: dp(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#2D2926', fontSize: dp(48), fontWeight: 'bold' }}>{title1 === '本月' ? '59623.42' : title1 === '本季度' ? '621556.64' : '36921252.32'}</Text>
        </View>
        <SixMonthDataZ creditSaleInfo={aiManageWarnData.creditSaleInfo || []} type={1} dataType={1} title1={title1}/>
      </View>
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

export default GoodInfoDataZ
