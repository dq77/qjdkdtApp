import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import NavBar from '../../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { blurIdCard, bankIdCard, iphoneNo } from '../../../utils/Utility'
import { isEmpty } from '../../../utils/StringUtils'
import { SolidBtn, StrokeBtn } from '../../../component/CommonButton'
import ajaxStore from '../../../utils/ajaxStore'

export default class EnterpriseInfo extends PureComponent {
  constructor (props) {
    super(props)

    /*   authType
        实名认证类型
     • 企业  QCC        企查查 cif_fnt_mem_app  step
     • 企业  CORPFACE  四要素+人脸识别   cif_fnt_mem_app  auth_status
     • 企业  CORPPAY   三要素+对公打款   cif_fnt_mem_app  auth_status
     • 企业(四要素+人脸识别)和(三要素+对公打款) 二选一
     • 个人  PERSONFOUR 银行卡四要素
    */
    this.state = {
    }
  }

  // 重新认证按钮
  async recertification () {
    const { navigation } = this.props
    const params = navigation.state.params
    if (params.type === '1') {
      this.props.navigation.navigate('NaturalPersonAuth', {
        item: {
          personName: params.itemData.personName,
          personIdcard: params.itemData.personIdcard,
          personType: params.itemData.personType
        },
        transactorListData: params.transactorListData,
        type: '1'// 再次认证，告诉后面要重新认证
      })
    } else {
      // 企业信息
      navigation.navigate('RealNameAuthList', { cifCompanyId: params.transactorListData.customerCorpInfo.cifCompanyId })
    }
  }

  renderSeparator () {
    return <View style={styles.separator} />
  }

  render () {
    const { navigation } = this.props
    const params = navigation.state.params
    return (
      <View style={styles.container}>
        <NavBar title={params.type === '1' ? '实名认证' : '企业实名认证'} navigation={navigation} />
        <Text style={styles.titleText}>{params.type === '1' ? '个人信息' : '企业信息'}</Text>
        <Text style={styles.decText}>{params.type === '1' ? `姓名：${params.itemData ? params.itemData.personName : ''}` : `企业名称：${params.transactorListData ? (isEmpty(params.transactorListData.customerCorpInfo.corpName) ? '' : params.transactorListData.customerCorpInfo.corpName) : ''}`}</Text>
        <Text style={[styles.decText, { marginTop: dp(5) }]}>{params.type === '1' ? `身份证号：${params.itemData ? blurIdCard(params.itemData.personIdcard) : ''}` : `社会统一信用代码：${params.transactorListData ? params.transactorListData.customerCorpInfo.regNo : ''}`}</Text>
        <Text style={[styles.decText, { marginTop: dp(5) }]}>{params.type === '1' ? `认证银行卡号：${params.itemData ? (isEmpty(bankIdCard(params.itemData.personBankno)) ? '' : bankIdCard(params.itemData.personBankno)) : ''}` : `法人：${params.transactorListData ? (isEmpty(params.transactorListData.legalPeronInfo.personName) ? '' : params.transactorListData.legalPeronInfo.personName) : ''}`}</Text>
        {params.type === '1' ? <Text style={[styles.decText, { marginTop: dp(5) }]}>{`预留手机号：${params.itemData ? iphoneNo(params.itemData.personPhone) : ''}`}</Text> : null}
        <Text style={styles.titleText}>实名认证记录</Text>
        <Text style={styles.decText}>状态：已认证</Text>
        <Text style={[styles.decText, { marginTop: dp(5) }]}>{params.type === '1' ? `认证方式：${params.itemData ? (params.itemData.authType === 'QCC' ? '企查查' : params.itemData.authType === 'CORPFACE' ? '四要素+人脸识别' : params.itemData.authType === 'CORPPAY' ? '三要素+对公打款' : params.itemData.authType === 'PERSONFOUR' ? '银行卡四要素' : '') : ''}` : `认证方式：${params.transactorListData ? (params.transactorListData.customerCorpInfo.authType === '0' ? '人脸识别' : '对公打款') : ''}`}</Text>
        {params.type === '1' ? null : <Text style={[styles.decText, { marginTop: dp(5) }]}>{`办理人：${isEmpty(params.personName) ? '' : params.personName}`}</Text>}
        <Text style={[styles.decText, { marginTop: dp(5) }]}>{params.type === '1' ? `认证时间：${params.itemData ? params.itemData.authTime : ''}` : `认证时间：${params.transactorListData.customerCorpInfo.authTime}`}</Text>
        <View style={{ alignItems: 'center' }}>
          <SolidBtn text='重新认证' style={{ marginTop: dp(70) }} onPress={() => {
            this.recertification()
          }} />
          <StrokeBtn text='返回' style={{ marginTop: dp(30) }} onPress={() => {
            navigation.goBack()
          }} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  titleText: {
    marginTop: dp(70),
    marginHorizontal: dp(30),
    fontSize: dp(34)
  },
  decText: {
    marginHorizontal: dp(30),
    marginTop: dp(24),
    fontSize: dp(28),
    color: '#888888'
  }
})
