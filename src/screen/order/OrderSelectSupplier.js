import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, TouchableWithoutFeedback, TouchableNativeFeedback
} from 'react-native'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import { injectUnmount } from '../../utils/Utility'

@injectUnmount
export default class OrderSelectSupplier extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      supplierListSelectable: [],
      supplierListUnselectable: [],
      selectKey: -1,
      modal: false
    }
  }

  componentDidMount () {
    this.loadData()
  }

  async loadData () {
    const res = await ajaxStore.order.getAll({})
    if (res.data && res.data.code === '0') {
      const supplierListSelectable = []
      const supplierListUnselectable = []
      res.data.data.forEach(item => {
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
          supplierListSelectable.push(item)
        }
      })
      this.setState({
        supplierListSelectable,
        supplierListUnselectable
      })
    }
  }

  clickItem = (key) => {
    this.setState({ selectKey: key })
    this.props.navigation.navigate('OrderCreate', {
      type: 'create',
      supplierId: this.state.supplierListSelectable[key / 2].supplierId,
      supplierName: this.state.supplierListSelectable[key / 2].supplierName
    })
    setInterval(() => {
      this.setState({ selectKey: -1 })
    }, 1000)
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  showModal =() => {
    this.setState({ modal: true })
  }

  renderSelectable () {
    const views = []
    for (let i = 0; i < this.state.supplierListSelectable.length; i++) {
      views.push(
        <Touchable key={i * 2} isPreventDouble={false} isNativeFeedback={true} onPress={() => this.clickItem((i * 2))}>
          <View style={styles.itenRow} >
            <Text style={styles.itemTitle}>{this.state.supplierListSelectable[i].supplierName}</Text>
            {this.state.selectKey === (i * 2)
              ? <Iconfont name={'icon-signed'} size={dp(60)} />
              : <View style={styles.noSelect} />}
          </View>
        </Touchable>,
        <View style={styles.separate} key={i * 2 + 1} />
      )
    }
    return views
  }

  renderUnSelectable () {
    const views = []
    for (let i = 0; i < this.state.supplierListUnselectable.length; i++) {
      views.push(
        <View style={styles.itenRow} key={i * 2}>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemTitle, { marginVertical: 0 }]}>{this.state.supplierListUnselectable[i].supplierName}</Text>
            <Text style={styles.reason}>{this.state.supplierListUnselectable[i].reason}</Text>
          </View>
          <View style={styles.unSelect} />
        </View>,
        <View style={styles.separate} key={i * 2 + 1} />
      )
    }
    return views
  }

  renderModal () {
    return (<ComfirmModal
      title={'添加步骤'}
      content={'完成以下两步，即可将一级经销商添加至列表中。\n1. 在合同列表中添加经销商，\n2. 签署该经销商下两方合同。'}
      cancelText={'暂不添加'}
      comfirmText={'去添加'}
      cancel={() => {
        this.setState({ modal: false })
      }}
      confirm={() => {
        this.setState({ modal: false })
        this.props.navigation.navigate('ContractList')
      }}
      infoModal={this.state.modal} />)
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'请选择经销商'} navigation={navigation} />
        <ScrollView>
          <View>
            <Text style={styles.title}>一级经销商列表</Text>
            <Text style={styles.hint}>请选择从哪家一级经销商采购</Text>
            <Text style={styles.selectIcon}>可选择</Text>
            {this.state.supplierListSelectable.length <= 0
              ? <Text style={styles.empty}>暂无可选</Text>
              : this.renderSelectable()}
            {this.state.supplierListUnselectable.length <= 0
              ? null
              : [<Text key={-1} style={[styles.selectIcon, { backgroundColor: '#c1c1c1' }]}>不可选</Text>,
                this.renderUnSelectable()] }
            <Text onPress={this.showModal} style={styles.addSupplier}>列表里没有找到？现在去添加</Text>
          </View>
        </ScrollView>
        <Touchable onPress={this.goBack}>
          <Text style={styles.btn}>返回上一步</Text>
        </Touchable>
        {this.renderModal()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: dp(34),
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: dp(30),
    marginTop: dp(40)

  },
  hint: {
    fontSize: dp(29),
    color: '#777777',
    marginLeft: dp(30),
    marginTop: dp(20)

  },
  btn: {
    textAlign: 'center',
    borderColor: '#666666',
    borderWidth: dp(2),
    paddingVertical: dp(27),
    margin: dp(30),
    borderRadius: dp(10),
    fontSize: dp(35)
  },
  selectIcon: {
    backgroundColor: Color.WX_GREEN,
    width: dp(150),
    fontSize: dp(27),
    color: 'white',
    marginTop: dp(40),
    paddingVertical: dp(5),
    paddingLeft: dp(30),
    borderTopRightRadius: dp(30),
    borderBottomRightRadius: dp(30)
  },
  empty: {
    textAlign: 'center',
    padding: dp(40)
  },
  itenRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: dp(30),
    paddingRight: dp(50)
  },
  itemTitle: {
    flex: 1,
    marginRight: dp(50),
    marginVertical: dp(40),
    fontSize: dp(30)
  },
  separate: {
    height: dp(1.5),
    backgroundColor: '#e5e5e5',
    marginLeft: dp(30)
  },
  noSelect: {
    borderWidth: dp(2),
    width: dp(50),
    height: dp(50),
    borderRadius: dp(30),
    borderColor: '#cccccc'
  },
  unSelect: {
    borderWidth: dp(2),
    width: dp(50),
    height: dp(50),
    borderRadius: dp(30),
    borderColor: '#cccccc',
    backgroundColor: '#e5e5e5'
  },
  itemLeft: {
    flex: 1,
    paddingVertical: dp(30)
  },
  reason: {
    fontSize: dp(27),
    marginTop: dp(17),
    color: '#999999'
  },
  addSupplier: {
    paddingHorizontal: dp(30),
    paddingVertical: dp(60),
    fontSize: dp(30),
    color: '#0092d5'
  }
})
