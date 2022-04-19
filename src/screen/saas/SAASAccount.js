import React, { PureComponent } from 'react'
import { Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { connect } from 'react-redux'
import { setSaasCurrentIndex } from '../../actions'
import ListPageComponent from '../../component/ListPageComponent'
import NavBar from '../../component/NavBar'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import Color from '../../utils/Color'
import { DEVICE_WIDTH, getRealDP as dp, getStatusBarHeight } from '../../utils/screenUtil'
class SAASAccount extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showShadow: false,
    }
  }

  componentDidMount() {}

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  loadData = async (pageNo, pageSize) => {
    this.hideShadow()
    const res = await ajaxStore.saas.getAccountList({
      pageNo,
      pageSize,
    })
    // res.data.data.pagedRecords = [
    //   {
    //     name: '小满',
    //     mobile: '13555555555',
    //     job: '总监',
    //     remark: '这是一段备注',
    //   },
    // ]
    if (res && res.data && res.data.code === '0') {
      return res.data.data.pagedRecords
    } else {
      return null
    }
  }

  renderTitle = () => {
    return (
      <View style={styles.titleMain}>
        <Touchable
          isWithoutFeedback={true}
          onPress={() => {
            if (this.props.saasList.length > 1) {
              this.showShadow()
            }
          }}
        >
          <View style={styles.navTitleMain}>
            <Text style={styles.navTitle}>{this.props.saasInfo.tenantName}</Text>
            {this.props.saasList.length > 1 && <Iconfont name={'arrow2x'} size={dp(40)} color={this.props.color} />}
          </View>
        </Touchable>
      </View>
    )
  }

  renderItem = data => {
    const item = data.item
    return (
      <Touchable
        isWithoutFeedback={true}
        onPress={() => {
          this.props.navigation.navigate('SAASAccountDetail', { detail: item })
        }}
      >
        <View style={styles.personItem}>
          <View>
            <Text style={styles.name}>{item.memberName}</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summary}>电话：{item.mobile}</Text>
              <Text style={{ ...styles.summary, maxWidth: dp(240) }}>职位：{item.departmentTreeName || '管理员'}</Text>
            </View>
          </View>
          <Iconfont style={styles.summaryArrow} name={'daiban-jiantou'} size={dp(40)} />
        </View>
      </Touchable>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          style={styles.emptyIcon}
          source={require('../../images/saas_account_empty.png')}
          resizeMode={'contain'}
        ></Image>
        <Text style={styles.emptyText}>您还没有添加过账户</Text>
      </View>
    )
  }

  render() {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar titleView={() => this.renderTitle()} navigation={navigation} rightIcon={null} isReturnRoot="1" />
        <ListPageComponent
          ref={ref => {
            this.listView = ref
          }}
          isAutoRefresh={true}
          navigation={navigation}
          canChangePageSize={false}
          loadData={this.loadData}
          renderItem={this.renderItem}
          renderEmpty={this.renderEmpty}
          renderSeparator={null}
        />
        {this.state.showShadow ? (
          <TouchableWithoutFeedback
            onPress={() => {
              this.hideShadow()
            }}
          >
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback>
        ) : null}
        {this.state.showShadow ? (
          <View style={styles.titleList}>
            {this.props.saasList.map((item, index) => {
              return (
                <Touchable
                  key={index}
                  isWithoutFeedback={true}
                  onPress={() => {
                    this.hideShadow()
                    setSaasCurrentIndex(index)
                    this.listView.refreshData()
                  }}
                >
                  <View style={styles.titleItem}>
                    <Text style={styles.titleText}>{item.tenantName}</Text>
                  </View>
                </Touchable>
              )
            })}
          </View>
        ) : null}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
    saasInfo: state.user.saas.saasList[state.user.saas.currentIndex],
    saasList: state.user.saas.saasList,
  }
}

export default connect(mapStateToProps)(SAASAccount)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  titleMain: {
    width: '82%',
  },
  navTitleMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    textAlign: 'center',
    fontSize: dp(38),
    color: Color.TEXT_MAIN,
    marginHorizontal: dp(20),
  },
  personItem: {
    backgroundColor: '#fff',
    paddingVertical: dp(40),
    paddingHorizontal: dp(30),
    margin: dp(40),
    borderRadius: dp(16),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  name: {
    color: '#2D2926',
    fontSize: dp(32),
    marginBottom: dp(32),
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
  },
  summary: {
    color: '#91969A',
    fontSize: dp(28),
    marginRight: dp(40),
    lineHeight: dp(48),
  },
  summaryArrow: {
    position: 'absolute',
    right: dp(20),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: dp(250),
  },
  emptyText: {
    fontSize: dp(30),
    color: '#A7ADB0',
    marginTop: dp(50),
  },
  emptyIcon: {
    width: dp(300),
    height: dp(300),
  },
  titleList: {
    backgroundColor: '#FFFFFF',
    borderWidth: dp(3),
    borderColor: '#1E78F1',
    position: 'absolute',
    top: getStatusBarHeight() + dp(60) + dp(28) * 2,
  },
  titleItem: {
    borderBottomWidth: dp(1),
    borderColor: '#dcdcdc',
    width: DEVICE_WIDTH,
  },
  titleText: {
    fontSize: dp(32),
    paddingVertical: dp(20),
    textAlign: 'center',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    right: 0,
    top: getStatusBarHeight() + dp(60) + dp(28) * 2,
    bottom: 0,
    left: 0,
  },
})
