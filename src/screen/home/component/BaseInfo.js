import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount, showToast } from '../../../utils/Utility'
import Iconfont from '../../../iconfont/Icon'
import { connect } from 'react-redux'
import ComfirmModal from '../../../component/ComfirmModal'
import ajaxStore from '../../../utils/ajaxStore'

@injectUnmount
class BaseInfo extends PureComponent {
  static defaultProps = {

  }

  static propTypes = {

  }

  constructor (props) {
    super(props)
    this.state = {
      infoModal: false
    }
    this.applySupplier = this.applySupplier.bind(this)
  }

  async applySupplier () {
    const res = await ajaxStore.company.toBeAudit()
    if (res.data && res.data.code === '0') {
      this.props.refresh()
      showToast('已申请')
    }
  }

  componentDidMount () {
  }

  render () {
    const { navigation, companyInfo, userInfo } = this.props
    return (
      <View style={styles.header}>
        <Text style={styles.corpName}>{userInfo.corpName || companyInfo.corpName}</Text>
        <View style={styles.tags}>
          <View style={styles.icons}>
            {companyInfo.creditStatus === 'DONE' ? (
              <Iconfont style={styles.iconsItem} name={'icon-credit-on'} size={dp(40)} />
            ) : (
              <Iconfont style={styles.iconsItem} name={'icon-credit'} size={dp(40)} />
            )}
            {/* {companyInfo.isMember === '1' ? (
              <Iconfont style={styles.iconsItem} name={'icon-member-on'} size={dp(40)} />
            ) : (
              <Iconfont style={styles.iconsItem} name={'icon-member'} size={dp(40)} />
            )} */}
            {companyInfo.vipLevelCode === '8' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang7'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '7' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang6'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '6' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang3'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '5' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang5'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '4' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang1'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '3' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '2' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang2'} size={dp(40)} />
            ) : companyInfo.vipLevelCode === '1' ? (
              <Iconfont style={styles.iconsItem} name={'Vdianliang4'} size={dp(40)} />
            ) : (
              <Iconfont style={styles.iconsItem} name={'Vputongkehu'} size={dp(40)} />
            )}
          </View>
          {companyInfo.companyTag && companyInfo.companyTag.isSupplier === '0' && (
            companyInfo.isAudit === '0' ? (
              <Touchable onPress={() => {
                this.setState({
                  infoModal: true
                })
              }}>
                <Text style={styles.applyBtn}>成为销售方</Text>
              </Touchable>
            ) : (
              <Text style={{ ...styles.applyBtn, ...styles.applyBtnDisable }}>销售方准入中</Text>
            )
          )}
          <ComfirmModal
            title={'是否申请成为销售方'}
            content={'成为销售方后，销售方的相关功能暂时只能在PC端操作'}
            cancelText={'取消'}
            comfirmText={'确定'}
            textAlign={'left'}
            cancel={() => {
              this.setState({
                infoModal: false
              })
            }}
            confirm={() => {
              this.setState({
                infoModal: false
              })
              this.applySupplier()
            }}
            infoModal={this.state.infoModal} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: dp(30),
    paddingBottom: dp(20),
    paddingTop: dp(50),
    backgroundColor: Color.WHITE,
    flex: 1,
    marginBottom: dp(30)
  },
  corpName: {
    fontSize: dp(34),
    color: Color.THEME,
    marginBottom: dp(20)
  },
  tags: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  iconsItem: {
    marginRight: dp(20)
  },
  applyBtn: {
    fontSize: dp(24),
    color: '#3B3C5A',
    backgroundColor: '#FED300',
    borderRadius: dp(30),
    paddingVertical: dp(14),
    paddingHorizontal: dp(28)
  },
  applyBtnDisable: {
    color: Color.TEXT_LIGHT,
    backgroundColor: Color.DEFAULT_BG
  }
})

const mapStateToProps = state => {
  return {
    themeColor: state.user.themeColor,
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(BaseInfo)
