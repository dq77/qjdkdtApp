import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  getRealDP as dp
} from '../../utils/screenUtil'
import { DashVerticalLine } from '../../component/DashLine'
import Color from '../../utils/Color'
import { injectUnmount } from '../../utils/Utility'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn } from '../../component/CommonButton'
import CustomerService from '../../component/CustomerService'

/**
 * BusinessTypeSelect
 */
@injectUnmount
export default class BusinessTypeSelect extends PureComponent {
  constructor (props) {
    super(props)
    this.list = [
      { name: '分销采', businessType: 'SECLEVEL', amount: '50', icon: 'icon-fenxiaobao', textList: ['供应链赊销周期：90天', '适用场景：全品类小额经销商'] },
      { name: '直营采', businessType: 'DIRECT', amount: '100', icon: 'icon-zhiyingbao', textList: ['供应链赊销周期：90天', '适用场景：仟金顶品牌评分4分以上直营经销商'] },
      { name: '电商采', businessType: 'NOTACCWAREHOUSE', amount: '200', icon: 'icon-dianshangbao', textList: ['供应链赊销周期：90天', '适用场景：各大电商平台的商户'] },
      { name: '诚信销', businessType: 'isSupportPurchaser', amount: '3000', icon: 'icon-wangzhuyihao', textList: ['服务费：1%一笔付清', '供应链赊销周期：180天', '适用场景：对下游有赊销账期的供货商'] },
      { name: '诚信采', businessType: 'sincerityPick', amount: '500', icon: 'icon-wangzhuyihao', textList: ['供应链赊销周期：180天', '适用场景：对上游有支付需求的采购方'] },
      { name: '工程采', businessType: 'PROJECT', amount: '500', icon: 'icon-qianjinbao', textList: ['供应链赊销周期：180天', '适用场景：承接工程项目的经销商'] },
      { name: '货押采', businessType: 'ACCWAREHOUSE', amount: '500', icon: 'icon-tunhuobao', textList: ['供应链赊销周期：90天', '适用场景：囤货于第三方仓库/工厂仓库的囤货商'] },
      { name: '托盘', businessType: 'isSupportTray', amount: '5000', icon: 'icon-tuopanbao', textList: ['供应链赊销周期：120天', '适用场景：主板上市企业'] }
    ]
    this.state = {
      data: [],
      selectNo: -1,
      hint: '请选择一种业务类型'
    }
  }

  componentDidMount () {
    this.getSupplier()
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'还有2步获得额度'} navigation={navigation} />
        <FlatList
          data={this.state.data}
          renderItem={data => this.renderItem(data)}
          keyExtractor={item => '' + item.name}
          ListHeaderComponent={() => this.renderHeader()}
          ListFooterComponent={() => this.renderFooter()}
          showsVerticalScrollIndicator={false}

        />
      </View>
    )
  }

  renderItem (data) {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => this.selectBusiness(data.index)}>
        <View style={[styles.itemContainer,
          { backgroundColor: this.state.selectNo === data.index ? '#f4c06e' : 'white' }]}>
          <View style={styles.itemLeft}>
            <Text style={styles.leftTitle}>{data.item.name}</Text>
            <Iconfont name={data.item.icon} size={dp(120)} />
          </View>
          {/* <DashVerticalLine backgroundColor='#efeff4' len={25} /> */}
          <View style={styles.dash} />
          <View style={styles.itemRight}>
            <Text style={styles.rightTitle2}><Text style={styles.rightTitle}>{`￥${data.item.amount}万`}</Text>（最高）</Text>
            {this.renderDesItems(data.item.textList)}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderDesItems (textList) {
    const views = []
    for (let i = 0; i < textList.length; i++) {
      views.push(<Item key={i} content={textList[i]} />)
    }
    return views
  }

  renderHeader () {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitile}>请选择一种业务类型</Text>
        <Text style={styles.headerTitle2} onPress={this.clickToCompare}>查看业务类型对比</Text>
      </View>)
  }

  renderFooter () {
    const { navigation } = this.props
    return (
      <View style={styles.footerContainer}>
        <Text style={{ fontWeight: 'bold' }}>{this.state.hint}</Text>
        <SolidBtn text='下一步，提交授信额度申请资料'
          style={{ marginTop: dp(50) }}
          disabled={this.state.selectNo === -1}
          onPress={this.submitSelect } />
        <CustomerService navigation={navigation} />

      </View>)
  }

  selectBusiness = (index) => {
    if (this.state.selectNo !== index) {
      this.setState({
        selectNo: index,
        hint: `您已选择${this.state.data[index].name}`
      })
    }
  }

  submitSelect=() => {
    const { navigation } = this.props
    if (this.state.data[this.state.selectNo].businessType === 'SECLEVEL') { // 分销采
      navigation.navigate('CreditSummary')
    } else { // pc端申请
      navigation.navigate('CreditByPC')
    }
  }

  clickToCompare=() => {
    this.props.navigation.navigate('BusinessTypeCompare')
  }

  getSupplier = async () => {
    const res = await ajaxStore.credit.getSupplier()
    if (res.data && res.data.code === '0' && res.data.data.length !== 0) {
      const businessTypes = {}
      const addedSuppliers = res.data.data
      addedSuppliers.forEach(item => {
        for (const i in item.businessTypes) {
          if (item.businessTypes[i] === '1') businessTypes[i] = '1'
        }
      })

      const hasAdded = this.list.filter((item) => businessTypes[item.businessType] === '1')
      this.setState({ data: hasAdded })
    }
  }
}

class Item extends PureComponent {
  render () {
    return (
      <View style={{ flexDirection: 'row', marginBottom: dp(6) }}>
        <View style={{
          width: dp(5),
          height: dp(5),
          backgroundColor: Color.TEXT_MAIN,
          borderRadius: 50,
          margin: dp(12)
        }} />
        <Text style={{
          fontSize: dp(25)
        }}>{this.props.content}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: dp(12),
    marginVertical: dp(20),
    marginHorizontal: dp(30)
  },
  itemLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: dp(50)
  },
  itemRight: {
    flex: 2.6,
    paddingHorizontal: dp(30),
    paddingTop: dp(40)
  },
  leftTitle: {
    fontSize: dp(34),
    marginBottom: dp(40),
    fontWeight: 'bold'
  },
  rightTitle: {
    fontSize: dp(50),
    fontWeight: 'bold'
  },
  rightTitle2: {
    fontSize: dp(25),
    marginBottom: dp(30)
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: dp(10)
  },
  headerTitile: {
    fontSize: dp(33),
    marginLeft: dp(35),
    fontWeight: 'bold'
  },
  headerTitle2: {
    color: '#4792e0',
    padding: dp(30)
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: dp(200),
    paddingTop: dp(30)
  },
  dash: {
    borderColor: '#e5e5e5',
    borderRadius: 0.1,
    width: 0,
    borderWidth: 0.5,
    borderStyle: 'dashed'
  }
})
