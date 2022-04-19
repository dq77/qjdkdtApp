import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  Image,
  View,
  RefreshControlBase
} from 'react-native'

import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import { callPhone } from '../../utils/PhoneUtils'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import StorageUtil from '../../utils/storageUtil'

export default class CertificationFail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      failReason: ''
    }
  }

  componentDidMount () {
    this.getLicenseData()
  }

  getLicenseData = async () => {
    global.loading.show()
    const res = await ajaxStore.company.getLicenseInfo({ isCardApply: 'isCardApply' })
    global.loading.hide()
    console.log(res.data)
    if (res.data && res.data.code === '0') {
      this.setState({
        failReason: '失败原因：' + res.data.data.memberApplyVO.stepQCCDescription
      })
    }
  }

  reload = async () => {
    const { navigation } = this.props
    const res = await ajaxStore.company.getCompanyInfo()
    if (res.data && res.data.code === '0') {
      if (res.data.data.step === 1) {
        navigation.navigate('AddSupplier', { certificationFailReturnRoot: '1' })
      } else {
        const memberId = await StorageUtil.get('memberId')
        const res = await ajaxStore.credit.processTask({ memberId, processDefKey: 'USER_REGISTER' })
        if (res.data && res.data.code === '0') {
          const processTaskData = res.data.data
          if (processTaskData.taskDefKey === 'AWAIT_APPROVE') {
            const processRes = await ajaxStore.company.postProcess({
              isPass: 'true',
              taskId: processTaskData.taskId,
              memberId
            })
            if (processRes.data && processRes.data.code === '0') {
              navigation.replace('Certification', { isUpdate: true })
            } else {
              global.alert.show({
                content: res.data.message
              })
            }
          } else if (processTaskData.taskDefKey === 'SUBMIT_ENTERPRISE_INFORMATION') {
            navigation.replace('Certification', { isUpdate: true })
          }
        } else {
          global.alert.show({
            content: res.data.message
          })
        }
      }
    }
  }

  // myInfo = () => {
  //   return (
  //     <View >
  //       {/* <Text style={{
  //         fontWeight: 'bold',
  //         fontSize: dp(40),
  //         textAlign: 'center',
  //         marginTop: dp(40),
  //         marginBottom: dp(30)
  //       }}>请确认实名认证信息</Text> */}
  //       <Text style={[styles.dialogText, { marginTop: dp(40) }]}>{`企业名称：${corpName}`}</Text>
  //       <Text style={styles.dialogText}>{`企业注册号：${regCode}`}</Text>
  //       <Text style={styles.dialogText}>{`企业法人：${legalPersonName}`}</Text>
  //       <Text style={styles.dialogText}>{`企业所在地区：${showAddress}`}</Text>
  //       <Text style={styles.dialogText}>{`企业详细地址：${address}`}</Text>
  //     </View>
  //   )
  // }
  render () {
    const { navigation } = this.props

    return (
      <View >
        <NavBar isReturnRoot='1' title={'认证未通过'} navigation={navigation} />
        <View style={{ alignItems: 'center' }}>
          <Iconfont name={'icon-warn'} size={dp(220)} style={{ marginTop: dp(100) }} />
          <Text style={{ fontSize: dp(40), marginTop: dp(40), color: Color.TEXT_MAIN }}>企业真实性认证未通过</Text>
          <Text style={{ fontSize: dp(30), marginTop: dp(40), color: Color.TEXT_LIGHT }}>{this.state.failReason}</Text>
          <SolidBtn text='重新进行企业认证' style={{ marginTop: dp(70) }} onPress={this.reload} />
          <StrokeBtn text='拨打电话人工认证' style={{ marginTop: dp(30) }} onPress={() => {
            callPhone(4006121666)
          }} />
          <Text style={{ fontSize: dp(25), marginTop: dp(30), color: Color.TEXT_LIGHT }}>
            工作时间：全年 9:00-21:00
          </Text>
          {/* <Text style={{ fontSize: dp(30), marginTop: dp(50), color: 'blue' }}
            onPress={() => { this.setState({ isShowInfo: !this.state.isShowInfo }) }} >
            {this.state.isShowInfo ? '收起详情' : '点击查看您所提交的资料'}
          </Text> */}
          {/* {this.state.isShowInfo ? this.myInfo() : null} */}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  dialogText: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(7)
  }
})
