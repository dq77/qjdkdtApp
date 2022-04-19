import React, { PureComponent } from 'react'
import {
  View, StyleSheet, Text, Keyboard, FlatList, TextInput,
  ActivityIndicator, ToastAndroid, ScrollView
} from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import Banner from '../../component/Banner'
import ListFooter from '../../component/ListFooter'
import CommonFlatList from '../../component/CommonFlatList'
import Color from '../../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import { getLocation } from '../../utils/LocationUtils'
import AlertModal from '../../component/AlertModal'
import ComfirmModal from '../../component/ComfirmModal'
import { setGoodsItems } from '../../actions/index'
import { toAmountStr, isNumber, showToast } from '../../utils/Utility'
import ajaxStore from '../../utils/ajaxStore'

class ContractsByNanJing extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      dataList: [],
      makeLoansId: '',
      canSubmit: false
    }
  }

  componentDidMount () {
    const makeLoansId = this.props.navigation.state.params ? this.props.navigation.state.params.makeLoansId : ''
    this.setState({
      makeLoansId
    })
    this.getContracts(makeLoansId)
  }

  // 获取南京银行待签署合同
  async getContracts (makeLoansId) {
    const res = await ajaxStore.loan.findNanJingLoansStatusByMakeLoansId({ makeLoansId })
    if (res.data && res.data.code === '0') {
      this.renderContracts(res.data.data)
      this.setState({
        message: res.data.data
      })
    }
  }

  renderContracts (data) {
    const contracts = [
      { name: '最高额借贷', id: '2', readed: false, contract: '', contractCode: data.qjdHighestLimitContractCode, status: data.highestLimitContractStatus, statusName: 'highestLimitContractStatus', type: 'company' },
      { name: '一般用信合同', id: '3', readed: false, contract: '', contractCode: data.qjdCommonUseCreditContractCode, status: data.commonUseCreditContractStatus, statusName: 'commonUseCreditContractStatus', type: 'order' }
    ]
    const dataList = contracts.filter(item => item.status === '1')
    this.setState({
      dataList
    })
  }

  previewContract = (fileKey, cb) => {
    this.props.navigation.navigate('PreviewPDF', { buzKey: fileKey })
    cb && cb()
  }

  validateCanSubmit () {
    const dataList = this.state.dataList
    let canSubmit = true
    dataList.forEach(item => {
      if (!item.readed) canSubmit = false
    })
    this.setState({ canSubmit })
  }

  tapPreview = async (index) => {
    const dataList = this.state.dataList
    if (!dataList[index].readed) {
      const map = await getLocation()
      if (map) {
        const data = {
          videoPhoto: this.props.faceExtraData.videoPhoto,
          idcardName: this.props.faceExtraData.idcardName,
          idcardNumber: this.props.faceExtraData.idcardNumber,
          contractVO: JSON.stringify({
            code: dataList[index].contractCode,
            lng: map.longitude,
            lat: map.latitude
          })
        }
        const res = await ajaxStore.loan.njcbSign(data)
        if (res.data && res.data.code === '0') {
          this.previewContract(res.data.data, () => {
            const message = this.state.message
            message[dataList[index].statusName] = '2'
            dataList[index].readed = true
            dataList[index].fileKey = res.data.data
            dataList[index].contract = {
              code: dataList[index].contractCode,
              type: dataList[index].id,
              fileKey: res.data.data
            }
            this.setState({ dataList, message })
            this.validateCanSubmit()
          })
        }
      }
    } else {
      this.previewContract(dataList[index].fileKey)
    }
  }

  tapSend = async () => {
    const dataList = this.state.dataList
    const message = this.state.message
    const contracts = dataList.map(item => item.contract)
    const data = {
      contracts: JSON.stringify(contracts),
      message: JSON.stringify(message)
    }
    const res = await ajaxStore.loan.njcbContract(data)
    if (res.data && res.data.code === '0') {
      await global.loading.showSuccess('成功', () => { this.props.navigation.goBack() })
    }
  }

  renderList () {
    const views = []
    for (let i = 0; i < this.state.dataList.length; i++) {
      views.push(
        <View key={i}>
          <View style={styles.separator} />
          <Touchable onPress={() => { this.tapPreview(i) }} isNativeFeedback={true}>
            <View style={styles.row}>
              <View style={styles.cloumn}>
                <Text style={styles.name}>{`《${this.state.dataList[i].name}》`}</Text>
                {this.state.dataList[i].readed
                  ? <Text style={styles.sign}>已签署</Text>
                  : <Text style={styles.unsign}>点击签署</Text>}
              </View>
              <Iconfont name='arrow-right1' size={dp(30)} />
            </View>
          </Touchable>
        </View>
      )
    }
    return views
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'签订合同'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.title}>合同列表</Text>
            <Text style={styles.text}>点击签署以下合同，全部完成后点击“提交以上合同”按钮，合同方可生效。中途退出需从支付货款列表中进入，并重新签订所有合同。</Text>
            {this.renderList()}

            <View style={{ alignItems: 'center', marginTop: dp(70) }}>
              <SolidBtn text={'提交以上合同'} onPress={this.tapSend} disabled={!this.state.canSubmit} />
            </View>

          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    faceExtraData: state.cache.faceExtraData
  }
}

export default connect(mapStateToProps)(ContractsByNanJing)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  separator: {
    width: DEVICE_WIDTH,
    height: dp(1),
    backgroundColor: '#e5e5e5'
  },
  content: {
    paddingHorizontal: dp(20)
  },
  title: {
    fontSize: dp(36),
    fontWeight: 'bold',
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  text: {
    fontSize: dp(28),
    color: '#999999',
    marginBottom: dp(40)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: dp(26)
  },
  cloumn: {
    flex: 1,
    alignItems: 'flex-start'
  },
  name: {
    fontSize: dp(30)
  },
  sign: {
    borderRadius: dp(7),
    backgroundColor: '#3DC2B8',
    paddingVertical: dp(5),
    paddingHorizontal: dp(15),
    fontSize: dp(27),
    color: 'white',
    marginLeft: dp(10),
    marginTop: dp(20)
  },
  unsign: {
    borderRadius: dp(7),
    backgroundColor: '#C9C9C9',
    paddingVertical: dp(5),
    paddingHorizontal: dp(15),
    fontSize: dp(27),
    color: 'white',
    marginLeft: dp(10),
    marginTop: dp(20)
  }

})
