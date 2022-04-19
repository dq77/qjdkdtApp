import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import { toAmountStr } from '../../../utils/Utility'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'
import AlertPage from '../../../component/AlertPage'
import ajaxStore from '../../../utils/ajaxStore'
import { DashLine } from '../../../component/DashLine'

export default class OrderSelectSupplier extends PureComponent {
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
      supplierListSelectable: [],
      supplierListUnselectable: [],
      supplier: '',
      projectList: [],
      selectValue: ''
    }
    this.selectSupplier = this.selectSupplier.bind(this)
  }

  componentDidMount () {

  }

  async loadData (selectValue) {
    this.setState({ selectValue })
    let data
    switch (selectValue) {
      case '4':
        data = {
          isRelSupplier: true,
          plantType: 'DEALERS',
          relSupplier: true,
          supplierName: '',
          businessType: 1
        }
        break
      case '1':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 5
        }
        break
      case '3':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 4
        }
        break
      case '2':
        data = {
          isSupportRetail: 1,
          isRelSupplier: true,
          supplierName: '',
          businessType: 3
        }
        break
      case '5':
        data = {
          // isSupportRetail: 1,
          // isRelSupplier: true,
          // supplierName: '',
          // businessType: 3
        }
        break
      default:
        break
    }

    if (selectValue === '5') { // 工程采
      const res = await ajaxStore.order.getInvalidProjectList({ projectType: 0 })
      if (res.data && res.data.code === '0') {
        if (res.data.data.length) {
          this.setState({
            projectList: res.data.data
          })
          this.props.loaded(res.data.data)
        }

        // if (res.data.data.length) {
        //   this.projectList = res.data.data
        //   // 下游qjb 如果只有一个，设置为默认
        //   if (this.projectList.length === 1) {
        //     const project = this.projectList[0]
        //     this.project = project.projectId + '-' + project.supplierId
        //   }
        // } else {
        //   this.options[this.businessType].disabled = true
        //   this.options[this.businessType].placeholder = '没有可选择的项目'
        // }
      }
    } else { // 其他
      const res = await ajaxStore.order.getAll(data)
      if (res.data && res.data.code === '0') {
        const supplierListSelectable = []
        const supplierListUnselectable = []
        res.data.data = res.data.data || []
        res.data.data.forEach(item => {
          if (data.businessType === 1) {
            if (!item.creditOk) {
              item.reason = '一级经销商授信额度未生效'
              supplierListUnselectable.push(item)
            } else if (!item.contractOk) {
              item.reason = '一级经销商两方合同未签署'
              supplierListUnselectable.push(item)
            } else if (!item.userContractOk) {
              item.reason = '二级经销商两方合同未签署'
              supplierListUnselectable.push(item)
            } else {
              item.selectable = true
              supplierListSelectable.push(item)
            }
          } else {
            item.selectable = true
            supplierListUnselectable.push(item)
          }
        })
        this.props.loaded(res.data.data)
        this.setState({
          supplier: '',
          supplierListSelectable,
          supplierListUnselectable
        })
      }
    }
  }

  selectSupplier (item) {
    if (item.selectable) {
      this.setState({
        supplier: item
      })
    }
  }

  selectProject (item) {
    this.setState({
      supplier: item
    })
  }

  renderItem () {
    const { supplierListSelectable, supplierListUnselectable, supplier, projectList, selectValue } = this.state

    if (selectValue === '5') { // 工程采
      return (
        projectList.map((item, key) => {
          return (
            <Touchable key={key} isPreventDouble={false} onPress={() => { this.selectProject(item) }}>
              <View style={styles.item}>
                <View>
                  <Text style={styles.supplierName}>{item.projectName}</Text>
                </View>
                { supplier.projectId === item.projectId &&
                  <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(32)} />
                }
              </View>
              <View style={styles.dashline} />
            </Touchable>

          )
        })
      )
    } else {
      const items = supplierListSelectable.concat(supplierListUnselectable)
      return (
        items.map((item, key) => {
          return (
            <Touchable key={key} isPreventDouble={false} onPress={() => { this.selectSupplier(item) }}>
              <View style={styles.item}>
                <View>
                  <Text style={[styles.supplierName, item.selectable ? '' : styles.disabledText]}>{item.supplierName}</Text>
                  { item.reason &&
                    <Text style={styles.reason}>{item.reason}</Text>
                  }
                </View>
                { supplier.supplierId === item.supplierId &&
                  <Iconfont style={styles.arrow} name={'liuchengyindao-yiwancheng'} size={dp(32)} />
                }
              </View>
              {/* <DashLine backgroundColor='#C7C7D6' len={dp(150)} /> */}
              <View style={styles.dashline} />
            </Touchable>

          )
        })
      )
    }
  }

  render () {
    const { selectValue } = this.state
    const title = selectValue === '5' ? '选择项目' : '选择厂家'
    return (
      <AlertPage
        title={title}
        render={ () => {
          return this.renderItem()
        }}
        comfirmText={'下一步'}
        cancel={() => {
          this.props.cancel()
        }}
        confirm={async () => {
          if (this.state.supplier) {
            this.props.confirm(this.state.supplier, selectValue)
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
  disabledText: {
    color: '#c0c4cc'
  },
  reason: {
    color: '#fe6a6a'
  },
  dashline: {
    backgroundColor: '#e5e5e5',
    height: dp(1)
  }

})
