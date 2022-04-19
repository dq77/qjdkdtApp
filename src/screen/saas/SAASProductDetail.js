/*
 * @Date: 2021-02-02 11:24:11
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-02 15:22:23
 */
import React, { PureComponent } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import ajaxStore from '../../utils/ajaxStore'
import { DEVICE_WIDTH, getBottomSpace, getRealDP as dp } from '../../utils/screenUtil'
import { injectUnmount } from '../../utils/Utility'

@injectUnmount
class SAASProductDetail extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      spuGetData: {},
    }
  }

  async componentDidMount() {
    const params = this.props.navigation.state.params

    if (params && params.id) {
      await this.spuGet(params.id)
    } else {
    }
  }

  spuGet = async id => {
    const res = await ajaxStore.saas.spuGet({ id })
    if (res.data && res.data.code === '0') {
      const data = res.data.data
      await this.setState({
        spuGetData: data,
      })
    } else {
      global.alert.show({
        content: res.data.message,
      })
    }
  }

  render() {
    const { navigation } = this.props
    const { mainPicPath, basePrice, unitName, name, productSn, specification } = this.state.spuGetData

    return (
      <View style={styles.container}>
        <NavBar title={'产品详情'} navigation={navigation} rightIcon={''} />
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.itemBGView}>
              <Image
                style={styles.itemIMG}
                defaultSource={require('../../images/default_banner.png')}
                source={{ uri: mainPicPath }}
              ></Image>
            </View>
            <View style={styles.blockMain}>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemMoneyText}>
                  <Text style={styles.itemUnitText}>{'¥'}</Text>
                  <Text style={styles.itemNumText}>{basePrice}</Text>/{unitName}
                </Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemTitleText}>{name}</Text>
              </View>
              <View style={[styles.lineBGView]}></View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText}>物料编码：{productSn}</Text>
              </View>
              <View style={[styles.itemRow]}>
                <Text style={styles.itemText}>规格：{specification}</Text>
              </View>
              <View style={[styles.itemRow, { marginBottom: 0 }]}>
                <Text style={styles.itemText}>销售单位：{unitName}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    ofsCompanyId: state.user.userInfo.ofsCompanyId,
  }
}

export default connect(mapStateToProps)(SAASProductDetail)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  content: {
    marginBottom: dp(30) + getBottomSpace(),
    alignItems: 'stretch',
  },
  blockMain: {
    backgroundColor: 'white',
    paddingHorizontal: dp(30),
    paddingVertical: dp(36),
    marginHorizontal: dp(30),
    marginTop: dp(30),
    borderRadius: dp(16),
  },
  itemText: {
    color: '#91969A',
    fontSize: dp(28),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dp(30),
  },
  itemIMG: {
    width: DEVICE_WIDTH - dp(120),
    height: DEVICE_WIDTH - dp(120),
  },
  itemBGView: {
    marginHorizontal: dp(30),
    padding: dp(30),
    marginTop: dp(20),
    marginBottom: dp(30),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dp(16),
  },
  itemMoneyText: {
    color: '#93989C',
    fontSize: dp(26),
  },
  itemUnitText: {
    color: '#F55849',
    fontSize: dp(28),
  },
  itemNumText: {
    color: '#F55849',
    fontSize: dp(42),
  },
  itemTitleText: {
    color: '#2D2926',
    fontSize: dp(34),
  },
  lineBGView: {
    backgroundColor: '#EAEAF1',
    height: dp(1),
    marginBottom: dp(20),
  },
})
