import {
  clearLoginInfo,
  getAreaData,
  setContractNum,
  setCreditStatus,
  setLoanNum,
  setSessionInfo,
  setUserInfo,
} from '../actions'
import store from '../store/index'
import ajaxStore from './ajaxStore'
import { onEvent } from './AnalyticsUtil'
import AuthUtil from './AuthUtil'
import { pwd } from './config'
import StorageUtil from './storageUtil'
import { dec, resetLoginPage } from './Utility'

// 自动登录 更新用户信息
export async function autoLogin() {
  let autologinInfo = await AuthUtil.getAutoLoginInfo()
  autologinInfo = autologinInfo ? autologinInfo.split('&') : []
  if (autologinInfo.length) {
    // 已登录 需自动登录
    const loginName = dec(autologinInfo[0], pwd)
    const passwd = dec(autologinInfo[1], pwd)

    if (loginName === '13300500016') {
      // shneghe账号 pres  密码 pres
      await StorageUtil.save('isShenHe', '1').then(res => {
        if (!res) {
          console.log('save success')
        }
      })
    } else {
      await StorageUtil.save('isShenHe', '0')
    }

    const res = await ajaxStore.common
      .login({
        loginName,
        passwd,
        code: '',
      })
      .catch(e => {
        console.log(e)
      })
    if (res && res.data && res.data.code === '0') {
      // 登录成功
      await setUserInfo({ userInfo: res.data.data })
      getAreaData()
      // await AuthUtil.saveAutoLoginInfo(enc(loginName, pwd), enc(passwd, pwd))
      if (res.data.data.tenantVO) {
        setSessionInfo(res.data.data.tenantVO[0])
      }
      onEvent('用户登录成功', 'Login', '/ofs/front/user/SSOlogin', {
        cifCompanyId: res.data.data.cifCompanyId,
        companyName: res.data.data.loginResult
          ? res.data.data.loginResult.corpName || res.data.data.loginResult.userName
          : '',
        memberId: res.data.data.loginResult ? res.data.data.loginResult.memberId : '',
      })
      const response = res.data.data
      if (response.memberApplyVO && response.memberApplyVO.step === 1) {
        // 认证成功
        setCreditStatus({ creditStatus: response.creaditToOfsVO.status || '' })
      }
    }
  }
}

// 退出登录
export async function logout() {
  global.loading.show()
  await AuthUtil.removeTempOrderInfo()
  await clearLoginInfo()
  setTimeout(() => {
    global.loading.hide()
    global.navigation && resetLoginPage(global.navigation)
  }, 500)
}

// 登录验证
export function checkLogin(target, name, descriptor) {
  const method = descriptor.value
  descriptor.value = function (...args) {
    const state = store.getState()
    // console.log(state, 'state')
    if (state && state.user && state.user.isLogin) {
      console.log('已登录')
      method.apply(this, args)
      return
    }
    console.log('未登录')
    global.navigation.navigate('Login')
  }
}

// 真实性验证
export function checkCertification(target, name, descriptor) {
  const method = descriptor.value
  descriptor.value = async function (...args) {
    const state = store.getState()
    const userInfo = state.user.allUserInfo

    if (userInfo.memberApplyVO && userInfo.memberApplyVO.step === 1) {
      // 认证通过
      console.log('已真实性验证')
      method.apply(this, args)
      return
    }
    // 未认证
    console.log('未真实性验证')
    const res = await ajaxStore.credit.processTask({
      memberId: userInfo.loginResult.memberId,
      processDefKey: 'USER_REGISTER',
    })
    if (res.data && res.data.code === '0') {
      await StorageUtil.save('memberId', userInfo.loginResult.memberId)
      const processTaskData = res.data.data
      if (processTaskData.taskDefKey === 'AWAIT_APPROVE') {
        global.navigation.navigate('CertificationFail')
      } else if (processTaskData.taskDefKey === 'SUBMIT_ENTERPRISE_INFORMATION') {
        global.navigation.navigate('Certification', { isUpdate: false })
      }
    }
  }
}

// 授信验证
export function checkCreadit(target, name, descriptor) {
  const method = descriptor.value
  descriptor.value = function (...args) {
    const state = store.getState()
    const userInfo = state.user.allUserInfo

    if (
      userInfo.creaditToOfsVO == null ||
      userInfo.creaditToOfsVO.status === 'TODO' ||
      userInfo.creaditToOfsVO.status === null
    ) {
      global.navigation.navigate('AddSupplier')
    } else if (userInfo.creaditToOfsVO.status === 'REJECT') {
      global.navigation.navigate('CreditFail')
    } else if (userInfo.creaditToOfsVO.status === 'PROCESS') {
      global.navigation.navigate('Crediting')
    } else if (userInfo.creaditToOfsVO.status === 'DONE' || userInfo.creaditToOfsVO.status === 'INVALID') {
      console.log('已完成授信')
      method.apply(this, args)
      return
    }
    console.log('未完成授信')
  }
}

// 待办消息数
export async function updatePendingNum(companyId, legalPersonCertId) {
  let contractNum = 0
  const res = await ajaxStore.order.getContractList({
    memberId: companyId,
    signWay: 1,
    totalCount: 0,
    pageSize: 9999,
    pageNo: 1,
  })

  if (res.data && res.data.code === '0' && res.data.data.pagedRecords) {
    contractNum += res.data.data.pagedRecords.length
  }

  const res2 = await ajaxStore.order.getContractListCxcNoPage({
    memberId: legalPersonCertId,
    organizationId: companyId,
    signWay: 1,
  })
  if (res2.data && res2.data.code === '0' && res2.data.data) {
    contractNum += res2.data.data.length
  }
  setContractNum(contractNum)

  const res3 = await ajaxStore.loan.getLoanTodoList({
    totalCount: 0,
    pageSize: 10,
    pageNo: 1,
    isFactory: 0,
  })

  if (res3 && res3.data && res3.data.code === '0') {
    setLoanNum(res3.data.data.totalCount)
  }
}
