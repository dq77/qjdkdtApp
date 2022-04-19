import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput, Keyboard } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import AlertPage from '../../../component/AlertPage'
import ajaxStore from '../../../utils/ajaxStore'
import { DashLine } from '../../../component/DashLine'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import { callPhone } from '../../../utils/PhoneUtils'

export default class AddSupplier extends PureComponent {
  static propTypes = {
    infoModal: PropTypes.bool,
    cancel: PropTypes.func,
    confirm: PropTypes.func,
    loaded: PropTypes.func
  }

  static defaultProps = {
    infoModal: false,
    cancel: function () {},
    confirm: function () {},
    loaded: function () {}
  }

  constructor (props) {
    super(props)
    this.state = {
      supplierList: [],
      supplier: '',
      keywords: '',
      keyboardShow: false,
      saveData: [],
      firstSearch: true
    }
    this.selectSupplier = this.selectSupplier.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  componentDidMount () {
    this.getSupplier()
  }

  selectSupplier (item) {
    this.setState({
      supplier: item
    })
  }

  getSupplier = async () => {
    const res = await ajaxStore.credit.getSupplier()
    if (res.data && res.data.code === '0' && res.data.data.length !== 0) {
      this.setState({
        saveData: res.data.data
      })
    }
  }

  searchSupplier = async (corpName) => {
    const res = await ajaxStore.credit.searchSupplier({ corpName, type: 2 })
    // console.log(res)
    if (res.data && res.data.code === '0') {
      this.setState({
        firstSearch: false,
        supplierList: res.data.data
      })
    }
  }

  addSupplier = async (data) => {
    const hasAdded = this.state.saveData.filter((item) => item.supplierId ===
      data.relSupplierCategoryBrandVOS[0].supplierId)

    if (hasAdded && hasAdded.length > 0) {
      global.alert.show({
        content: '该经销商已存在，请勿重复添加'
      })
    } else {
      let array = []
      data = {
        supplierId: data.id,
        supplierName: data.name,
        categoryCode: data.relSupplierCategoryBrandVOS[0].categoryCode,
        plantType: data.plantType,
        currentAdded: true
      }
      array = this.state.saveData.concat(data)
      await this.setState({ saveData: array })
      this.submitSupplier()
    }
  }

  submitSupplier = async () => {
    const saveData = this.state.saveData
    const hasCurrentAdded = saveData.filter((item) => item.currentAdded)
    if (hasCurrentAdded && hasCurrentAdded.length > 0) {
      const data = []
      hasCurrentAdded.forEach((item) => {
        data.push({
          categoryCode: item.categoryCode,
          supplierId: item.supplierId,
          supplierName: item.name
        })
      })
      const res = await ajaxStore.credit.addSupplier({ jsonStr: JSON.stringify(data) })
      if (res.data && res.data.code === '0') {
        // showToast('提交成功')
        this.props.confirm()
        this.props.cancel()
      }
    }
  }

  renderItem (supplierList) {
    return (
      <View>
        <View key={'searchInput'}>
          <View style={styles.formItem}>
            <TextInput
              ref={ref => this.input = ref}
              placeholder={'请输入厂家名称可快速查找'}
              placeholderTextColor={'#D8DDE2'}
              style={styles.input}
              defaultValue={this.state.keywords}
              onChangeText={text => {
                this.searchSupplier(text)
                this.setState({ keywords: text })
              }}
            />
          </View>
        </View>
        {supplierList.length ? (supplierList.map((item, key) => {
          return (
            <Touchable key={key} onPress={() => { this.selectSupplier(item) }}>
              <View style={styles.item}>
                <View>
                  <Text style={styles.supplierName}>{item.name}</Text>
                </View>
                { this.state.supplier.id === item.id &&
                  <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(32)} />
                }
              </View>
              <DashLine backgroundColor='#C7C7D6' len={dp(150)} />
            </Touchable>
          )
        })) : (!this.state.firstSearch &&
          <View style={styles.tipsMain}>
            <Text style={styles.tips}>找不到一级经销商，请联系客服</Text>
            <Text onPress={() => { callPhone(4006121666) }} style={[styles.tips, styles.phoneText]}>400-612-1666<Text style={styles.tips}>（全年 9:00-21:00）</Text></Text>
          </View>
        )}
      </View>
    )
  }

  render () {
    const { supplierList, supplier } = this.state
    return (
      <AlertPage
        title={'添加一级经销商'}
        render={ () => {
          return this.renderItem(supplierList)
        }}
        comfirmText={'下一步'}
        cancel={() => {
          this.setState({
            keywords: '',
            supplierList: [],
            firstSearch: true
          })
          this.props.cancel()
        }}
        confirm={async () => {
          if (supplier) {
            this.addSupplier(supplier)
          }
          this.props.cancel()
        }}
        infoModal={this.props.infoModal} />
    )
  }
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  supplierName: {
    fontSize: dp(28)
  },
  input: {
    backgroundColor: '#F8F8FA',
    borderRadius: dp(36),
    paddingHorizontal: dp(30),
    height: dp(90)
  },
  tipsMain: {
    marginTop: dp(100)
  },
  tips: {
    color: '#999',
    textAlign: 'center',
    marginBottom: dp(20)
  },
  phoneText: {
    color: '#1A97F6'
  }
})
