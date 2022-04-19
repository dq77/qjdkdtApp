import actionTypes from './actionType'

export function getInitialAuthInfoAction(initialInfo) {
  return {
    type: actionTypes.INITIAL_AUTH_INFO,
    initialInfo,
  }
}

export function setSessionIdAction(sessionId) {
  return {
    type: actionTypes.SET_SESSION_ID,
    sessionId,
  }
}

export function setSsoCookieAction(ssoCookie) {
  return {
    type: actionTypes.SET_SSO_COOKIE,
    ssoCookie,
  }
}

export function setUserInfoAction(userInfo) {
  return {
    type: actionTypes.SET_USERINFO,
    userInfo,
  }
}

export function setCreditSummaryAction(allItems) {
  return {
    type: actionTypes.SET_CREDIT_SUMMARY,
    allItems,
  }
}

export function setMarryStatusAction(marryStatus) {
  return {
    type: actionTypes.SET_MARRY_STATUS,
    marryStatus,
  }
}

export function setHasAuthedAction(hasAuthed) {
  return {
    type: actionTypes.SET_HASAUTHED,
    hasAuthed,
  }
}

export function getAuthFileAction(authItem) {
  return {
    type: actionTypes.GET_AUTHFILE,
    authItem,
  }
}

export function setOtherInfoAction(otherInfo) {
  return {
    type: actionTypes.SET_OTHERINFO,
    otherInfo,
  }
}

export function setCreditStatusAction(creditStatus) {
  return {
    type: actionTypes.SET_CREDIT_STATUS,
    creditStatus,
  }
}

export function setFailReasonAction(failReason) {
  return {
    type: actionTypes.SET_FAILREASON,
    failReason,
  }
}

export function getCompanyInfoAction(companyInfo) {
  return {
    type: actionTypes.GET_COMPANYINFO,
    companyInfo,
  }
}

export function getIsAuditAction(isAudit) {
  return {
    type: actionTypes.GET_ISAUDIT,
    isAudit,
  }
}

export function getCompanyTagAction({ companyTag, supplier }) {
  return {
    type: actionTypes.GET_COMPANYTAG,
    companyTag,
    supplier,
  }
}

export function getLoanInfoAction(loanInfo) {
  return {
    type: actionTypes.GET_LOANINFO,
    loanInfo,
  }
}

export function getSecondContractInfoAction(contractInfo) {
  return {
    type: actionTypes.GET_SECOND_CONTRACT_INFO,
    contractInfo,
  }
}

export function getProductContractListAction(contractInfo) {
  return {
    type: actionTypes.GET_PRODUCT_CONTRACT_LIST,
    contractInfo,
  }
}

export function getAccountInfoAction(accountInfo) {
  return {
    type: actionTypes.GET_ACCOUNTINFO,
    accountInfo,
  }
}

export function clearLoginInfoAction() {
  return {
    type: actionTypes.CLEAR_LOGININFO,
  }
}

export function getOtherContractListAction(contractList) {
  return {
    type: actionTypes.GET_OTHER_CONTRACT_LIST,
    contractList,
  }
}

export function getCSContractListAction(contractList) {
  return {
    type: actionTypes.GET_CS_CONTRACT_LIST,
    contractList,
  }
}

export function getGuarantorListAction({ guarantorList, paperList, legalPersonCertId }) {
  return {
    type: actionTypes.GET_GUARANTOR_LIST,
    guarantorList,
    paperList,
    legalPersonCertId,
  }
}

export function setFaceExtraDataAction(faceExtraData) {
  return {
    type: actionTypes.SET_FACE_EXTRA_DATA,
    faceExtraData,
  }
}
export function setNJTimeAction(njTime) {
  return {
    type: actionTypes.SET_NJ_TIME,
    njTime,
  }
}
export function setGoodsItemsAction(erjiAddGoodsItems) {
  return {
    type: actionTypes.SET_GOODSITEMS,
    erjiAddGoodsItems,
  }
}
export function setOrderSubmitDataAction(erjiOrderSubmitData) {
  return {
    type: actionTypes.SET_SUBMITDATA,
    erjiOrderSubmitData,
  }
}
export function setDefaultBaseInfoAction(erjiDefaultBaseInfo) {
  return {
    type: actionTypes.SET_DEFAULTBASEINFO,
    erjiDefaultBaseInfo,
  }
}
export function getPaymentAccountAction(paymentAccount) {
  return {
    type: actionTypes.GET_PAYMENTACCOUNT,
    paymentAccount,
  }
}
export function getAgentListAction(agentList) {
  return {
    type: actionTypes.GET_AGENT_LIST,
    agentList,
  }
}
export function getMemberVipInfoAction(memberInfo) {
  return {
    type: actionTypes.GET_MEMBER_INFO,
    memberInfo,
  }
}
export function setContractNumAction(contractNum) {
  return {
    type: actionTypes.SET_CONTRACT_NUM,
    contractNum,
  }
}
export function setLoanNumAction(loanNum) {
  return {
    type: actionTypes.SET_LOAN_NUM,
    loanNum,
  }
}
export function getAreaDataAction(areaData) {
  return {
    type: actionTypes.GET_AREA_DATA,
    areaData,
  }
}
export function setSessionInfoAction(session) {
  return {
    type: actionTypes.SET_SESSION_INFO,
    session,
  }
}
export function setSaasInfoAction(saas) {
  return {
    type: actionTypes.SET_SAAS_INFO,
    saas,
  }
}
export function setSaasCurrentIndexAction(index) {
  return {
    type: actionTypes.SET_SAAS_CURRENT_INDEX,
    index,
  }
}
