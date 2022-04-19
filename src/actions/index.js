import store from '../store'
import ajaxStore from '../utils/ajaxStore'
import AuthUtil from '../utils/AuthUtil'
import { deepCopy } from '../utils/Utility'
import {
  clearLoginInfoAction,
  getAccountInfoAction,
  getAgentListAction,
  getAreaDataAction,
  getAuthFileAction,
  getCompanyInfoAction,
  getCompanyTagAction,
  getCSContractListAction,
  getGuarantorListAction,
  getInitialAuthInfoAction,
  getIsAuditAction,
  getLoanInfoAction,
  getMemberVipInfoAction,
  getOtherContractListAction,
  getPaymentAccountAction,
  getProductContractListAction,
  getSecondContractInfoAction,
  setContractNumAction,
  setCreditStatusAction,
  setCreditSummaryAction,
  setDefaultBaseInfoAction,
  setFaceExtraDataAction,
  setFailReasonAction,
  setGoodsItemsAction,
  setHasAuthedAction,
  setLoanNumAction,
  setMarryStatusAction,
  setNJTimeAction,
  setOrderSubmitDataAction,
  setOtherInfoAction,
  setSaasCurrentIndexAction,
  setSaasInfoAction,
  setScreenKeyAction,
  setSessionIdAction,
  setSessionInfoAction,
  setSsoCookieAction,
  setUserInfoAction,
} from './action-creator'

export function toInitialAuthInfo(initialInfo) {
  store.dispatch(getInitialAuthInfoAction(initialInfo))
}

export async function setSessionId(data) {
  await AuthUtil.saveSessionId(data.sessionId)
  store.dispatch(setSessionIdAction(data.sessionId))
}

export async function setSsoCookie(data) {
  await AuthUtil.saveSsoCookie(data.ssoCookie)
  store.dispatch(setSsoCookieAction(data.ssoCookie))
}

export async function setUserInfo(data) {
  await AuthUtil.saveUserInfo(data.userInfo)
  store.dispatch(setUserInfoAction(data.userInfo))
}

export async function setCreditSummary(data) {
  store.dispatch(setCreditSummaryAction(data.allItems))
}

export async function setMarryStatus(data) {
  store.dispatch(setMarryStatusAction(data.marryStatus))
}

export async function setHasAuthed(data) {
  store.dispatch(setHasAuthedAction(data.hasAuthed))
}
export async function setContractNum(data) {
  store.dispatch(setContractNumAction(data))
}
export async function setLoanNum(data) {
  store.dispatch(setLoanNumAction(data))
}

export async function getAuthFile(data) {
  const authFileId = data.authFileId
  const cateCode = data.cateCode
  let historyItem
  const res = await ajaxStore.credit.findAuthFilesByAuthFileId({ authFileId: authFileId, pageNo: 1, pageSize: 40 })
  if (res.data && res.data.code === '0') {
    const fileList = res.data.data.pagedRecords
    fileList.map((pic, key) => {
      fileList[key].fileJson = JSON.parse(fileList[key].fileJson)
    })
    historyItem = fileList
  }
  const authItem = {
    authFileId,
    cateCode,
    historyItem,
  }
  store.dispatch(getAuthFileAction(authItem))
}

export async function setOtherInfo(data) {
  store.dispatch(setOtherInfoAction(data.otherInfo))
}

export async function setCreditStatus(data) {
  store.dispatch(setCreditStatusAction(data.creditStatus))
}
export async function setFailReason(failReason) {
  store.dispatch(setFailReasonAction(failReason))
}

export async function getCompanyInfo() {
  let creditStatus
  let isMember
  let vipLevelCode
  let corpName
  let sequence
  let sealStatus
  let legalPerson
  let companyId
  let regNo
  let legalPersonCertId
  let memberFeeDeadLine
  let step
  let provinceCode
  let cityCode
  let areaCode
  let address
  let contactName
  let phone
  let customerId
  const res = await ajaxStore.company.getCompanyInfo()
  console.log(res.data.data, 'companyInfo')
  if (res.data && res.data.code === '0') {
    const data = res.data.data
    creditStatus = data.creditStatus
    isMember = data.company.isMember
    vipLevelCode = data.memberVip ? data.memberVip.vipLevelCode : '0'
    corpName = data.company.corpName
    sequence = data.sequence
    sealStatus = data.sealStatus
    legalPerson = data.memberApplyVO ? data.memberApplyVO.legalPersonName : data.userName
    legalPersonCertId = data.memberApplyVO ? data.memberApplyVO.legalPersonCertId : ''
    companyId = data.company.id
    regNo = data.company.regNo
    memberFeeDeadLine = data.company.memberFeeDeadLine
    step = data.step
    provinceCode = data.company.provinceCode
    cityCode = data.company.cityCode
    areaCode = data.company.areaCode
    address = data.company.address
    contactName = data.company.contactName
    phone = data.company.phone
    if (companyId) {
      const res2 = await ajaxStore.common.getCustomerId({
        id: companyId,
        type: 0, // 0-经销商 1-厂家
      })
      if (res2.data && res2.data.code === '0') {
        customerId = res2.data.data.customerId
      }
    }
  }
  const companyInfo = {
    customerId,
    companyId,
    regNo,
    creditStatus,
    isMember,
    vipLevelCode,
    corpName,
    sequence,
    sealStatus,
    legalPerson,
    legalPersonCertId,
    memberFeeDeadLine,
    step,
    provinceCode,
    cityCode,
    areaCode,
    address,
    contactName,
    phone,
  }
  store.dispatch(getCompanyInfoAction(companyInfo))
}
export async function getIsAudit() {
  let isAudit
  const res = await ajaxStore.company.getIsAudit()
  if (res.data && res.data.code === '0') {
    isAudit = res.data.data
  }
  store.dispatch(getIsAuditAction(isAudit))
}

export async function getCompanyTag() {
  let companyTag
  let supplier
  const res = await ajaxStore.company.getCompanyTag({ flag: 1 })
  if (res.data && res.data.code === '0') {
    const data = res.data.data
    companyTag = {
      isCompany: data.isCompany,
      isSupplier: data.isSupplier,
      isSupportProject: data.isSupportProject,
      isSupportPurchaser: data.isSupportPurchaser,
      isSupportRetailcontrolstore: data.isSupportRetailcontrolstore,
      isSupportRetaildirect: data.isSupportRetaildirect,
      sincerityPick: data.sincerityPick,
      isSupportRetailfreestore: data.isSupportRetailfreestore,
      isSupportSupplier: data.isSupportSupplier,
      isSupportTray: data.isSupportTray,
      isSupportwoDistribution: data.isSupportwoDistribution,
      isDirectMining: data.isDirectMining, // 直采
    }
    supplier = data.supplier || {}
  }
  await store.dispatch(
    getCompanyTagAction({
      companyTag,
      supplier,
    }),
  )
}

export async function getLoanInfo() {
  let loanInfo
  const res = await ajaxStore.company.getLoanInfo()
  if (res.data && res.data.code === '0') {
    loanInfo = res.data.data
  }
  store.dispatch(getLoanInfoAction(loanInfo))
}

export async function getSecondContractInfo(data) {
  let contractInfo = {}
  const res = await ajaxStore.contract.getSecondContractInfo(data)
  if (res.data && res.data.code === '0') {
    contractInfo = res.data.data
  }
  // console.log(res.data, 'secondContractList')
  // if (res.data && res.data.code === '0') {
  //   const { contract, factoryProduct, infoContracts, guarantor, serviceFeeContracts } = res.data.data
  //   // 会员费协议
  //   const memberFeeContractList = []
  //   contract && contract.length && contract.forEach((item, index) => {
  //     memberFeeContractList.push(item)
  //   })
  //   // 两方合同
  //   const twoPartyContractList = []
  //   if (factoryProduct) {
  //     for (const supplierId in factoryProduct) {
  //       const list = factoryProduct[supplierId]
  //       list && list.length && list.forEach((item) => {
  //         twoPartyContractList.push(item)
  //       })
  //     }
  //   }
  //   // 信息系统服务协议
  //   const infoContractList = []
  //   if (infoContracts) {
  //     for (const supplierId in infoContracts) {
  //       const list = infoContracts[supplierId]
  //       list && list.length && list.forEach((item) => {
  //         infoContractList.push(item)
  //       })
  //     }
  //   }
  //   // 最高额保证合同
  //   const guarantorContractList = []
  //   if (guarantor) {
  //     guarantor && guarantor.length && guarantor.forEach((item, index) => {
  //       guarantorContractList.push(item)
  //     })
  //   }
  //   // 居间服务协议
  //   const serviceFeeContractList = []
  //   if (serviceFeeContracts) {
  //     for (const supplierId in serviceFeeContracts) {
  //       const list = serviceFeeContracts[supplierId]
  //       list && list.length && list.forEach((item) => {
  //         serviceFeeContractList.push(item)
  //       })
  //     }
  //   }
  //   contractInfo = {
  //     memberFeeContractList,
  //     twoPartyContractList,
  //     infoContractList,
  //     guarantorContractList,
  //     serviceFeeContractList
  //   }
  // }
  store.dispatch(getSecondContractInfoAction(contractInfo))
}

export async function getProductContractList(params) {
  let contractInfo = {}
  const res = await ajaxStore.contract.getProductContractsList(params)
  if (res.data && res.data.code === '0') {
    contractInfo = {
      guarantorContracts: res.data.data.guarantorContracts,
      productContracts: res.data.data.productContracts,
    }
  }
  store.dispatch(getProductContractListAction(contractInfo))
}

export async function getAccountInfo() {
  let accountInfo
  const res = await ajaxStore.company.getAccountInfo()
  if (res.data && res.data.code === '0') {
    accountInfo = res.data.data
  }
  store.dispatch(getAccountInfoAction(accountInfo))
}

export async function clearLoginInfo() {
  await AuthUtil.clearAutoLoginInfo()
  await AuthUtil.removeBuyCarProductInfo()
  await AuthUtil.removeReceiveAddressInfo()
  await store.dispatch(clearLoginInfoAction())
}

export async function getOtherContractList(data) {
  let contractList
  data.queryType = 2
  const res = await ajaxStore.contract.getOtherContractList(data)
  data.queryType = 3
  const res2 = await ajaxStore.contract.getOtherContractList(data)
  if (res.data && res.data.code === '0') {
    contractList = res.data.data[0]
    contractList.companyContractVOList = contractList.companyContractVOList || []
  }
  if (res2.data && res2.data.code === '0') {
    let { companyContractVOList, projectContractVOList } = res2.data.data[0]
    companyContractVOList = companyContractVOList || []
    contractList.companyContractVOList = [...contractList.companyContractVOList, ...companyContractVOList]
    const oldProjectContractVOList = deepCopy(contractList.projectContractVOList)
    const projectCodes = []
    oldProjectContractVOList.map((item, key) => {
      projectCodes.push(item.projectCode)
    })
    projectContractVOList.map((item, key) => {
      const index = projectCodes.indexOf(item.projectCode)
      const projectVOList = item.projectVOList || []
      const orderContractVOList = item.orderContractVOList || []
      if (index > -1) {
        const oldProjectContractVOList = contractList.projectContractVOList[index].projectVOList || []
        const oldOrderContractVOList = contractList.projectContractVOList[index].orderContractVOList || []
        contractList.projectContractVOList[index].projectVOList = oldProjectContractVOList.concat(projectVOList)
        contractList.projectContractVOList[index].orderContractVOList = oldOrderContractVOList.concat(
          orderContractVOList,
        )
      } else {
        contractList.projectContractVOList.push(item)
      }
    })
  }
  store.dispatch(getOtherContractListAction(contractList))
}

export async function getCSContractList(data) {
  let contractList
  const res = await ajaxStore.contract.getCSContractList(data)
  console.log(res, 'CSres')
  if (res.data && res.data.code === '0') {
    contractList = res.data.data ? res.data.data.records : []
  }
  store.dispatch(getCSContractListAction(contractList))
}

export async function getGrarantorList(legalPersonCertId) {
  let guarantorList
  let paperList
  const res = await ajaxStore.contract.getGrarantorList()
  if (res.data && res.data.code === '0') {
    paperList = res.data.data.filter(item => {
      return item.contractVO && item.contractVO.status === 'SIGN_SUCCESS' && !item.id
    })
    guarantorList = res.data.data.filter(item => {
      return !(item.contractVO && item.contractVO.status === 'SIGN_SUCCESS' && !item.id)
    })
  }
  store.dispatch(getGuarantorListAction({ guarantorList, paperList, legalPersonCertId }))
}

export async function setFaceExtraData(faceExtraData) {
  store.dispatch(setFaceExtraDataAction(faceExtraData))
}
export async function setNJTime(njTime) {
  store.dispatch(setNJTimeAction(njTime))
}
export async function setScreenKey(screenKey) {
  store.dispatch(setScreenKeyAction(screenKey))
}
export function setGoodsItems(erjiAddGoodsItems) {
  store.dispatch(setGoodsItemsAction(erjiAddGoodsItems))
}
export function setOrderSubmitData(erjiOrderSubmitData) {
  store.dispatch(setOrderSubmitDataAction(erjiOrderSubmitData))
}
export function setDefaultBaseInfo(erjiDefaultBaseInfo) {
  store.dispatch(setDefaultBaseInfoAction(erjiDefaultBaseInfo))
}
export async function getPaymentAccount() {
  const res = await ajaxStore.company.checkPaymentAccount()
  let paymentAccount = []
  if (res.data && res.data.code === '0') {
    const data = res.data.data
    if (data && data.dataModel && data.dataModel.length > 0) {
      paymentAccount = data.dataModel
    }
  }
  store.dispatch(getPaymentAccountAction(paymentAccount))
}
export async function getAgentList(companyId) {
  const res = await ajaxStore.company.getAgentList({ cifCompanyId: companyId })
  let agentList = []
  if (res.data && res.data.code === '0') {
    agentList = res.data.data
  }
  store.dispatch(getAgentListAction(agentList))
}
export async function getMemberVipInfo(companyId) {
  const res = await ajaxStore.company.getMemberVipInfo({ companyId })
  let memberInfo
  // console.log(res, 'getMemberVipInfo')
  if (res.data && res.data.code === '0') {
    memberInfo = res.data.data
  }
  store.dispatch(getMemberVipInfoAction(memberInfo))
}

export async function getAreaData(data) {
  let areas = []
  const res = await ajaxStore.common.getAreaData()
  if (res.data && res.data.code === '0') {
    data = JSON.parse(res.data.data)
    areas = []
    // const res = await ajaxStore.common.getAreaData()
    // if (res.data && res.data.code === '0') {
    data.map((pItem, pKey) => {
      areas.push({
        id: pItem.code,
        name: pItem.name,
        child: [],
      })
      if (pItem.citys.length) {
        pItem.citys.map((cItem, cKey) => {
          areas[pKey].child.push({
            id: cItem.code,
            name: cItem.name,
            child: [],
          })
          if (cItem.areas.length) {
            cItem.areas.map((aItem, aKey) => {
              areas[pKey].child[cKey].child.push({
                id: aItem.code,
                name: aItem.name,
              })
            })
          } else {
            areas[pKey].child[cKey].child.push({
              id: cItem.code,
              name: cItem.name,
            })
          }
        })
      }
    })
  }
  store.dispatch(getAreaDataAction(areas))
}
export function setSessionInfo(session) {
  store.dispatch(setSessionInfoAction(session))
}
export function setSaasInfo(saas) {
  store.dispatch(setSaasInfoAction(saas))
}
export function setSaasCurrentIndex(saas) {
  store.dispatch(setSaasCurrentIndexAction(saas))
}
