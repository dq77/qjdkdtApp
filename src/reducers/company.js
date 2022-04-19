import actionTypes from '../actions/actionType'

const initialStore = {
  customerId: '', // 新版公司id
  companyId: '', // cifcompanyId
  corpName: '', // 公司名称
  regNo: '', // 工商注册号
  creditStatus: 'DONE', // 授信状态
  isMember: '0', // 是否是会员
  vipLevelCode: '0', // vip等级
  isAudit: '0', // 是否申请销售方准入
  sequence: '', // 引导步骤
  sealStatus: 0, // 是否生成电子签章
  legalPerson: '', // 法人姓名
  legalPersonCertId: '', // 法人身份证
  memberFeeDeadLine: '', // 会员到期日
  step: 0, // 公司是否实名认证
  provinceCode: '', // 省份code
  cityCode: '', // 市code
  areaCode: '', // 区域code
  address: '', // 详细地址
  contactName: '', // 联系人姓名
  phone: '', // 联系人电话
  legalArea: '0', // 法人所在地区
  companyTag: {
    // 公司打标信息
    isCompany: '0',
    isSupplier: '0',
    isSupportProject: '0', // 工程采
    isSupportPurchaser: '0', // 诚信销
    sincerityPick: '0', // 诚信采
    isSupportRetailcontrolstore: '0', // 货押采
    isSupportRetaildirect: '0', // 直营采
    isSupportRetailfreestore: '0', // 电商采
    isSupportSupplier: '0',
    isSupportTray: '0', // 托盘
    isSupportwoDistribution: '0',
    isDirectMining: '0', // 直采
  },
  loanInfo: {
    // 授信额度信息
    availableLine: 0,
    balance: 0,
    balanceAvailable: 0,
    creditLine: 0,
    finalRepaymentDay: '',
    interest: 0,
    principal: 0,
    remainPrincipal: 0,
    repaymentDate: '',
    replyDeadLine: '',
    replyDeadline: '',
    supplierAvailableLine: '',
    supplierCreditLine: '',
  },
  accountInfo: [], // 账户信息
  supplier: {},
  paymentAccount: [], // 个人代付账户
  agentList: [], // 授权委托人列表
  agentStatus: 0, // 委托人状态
  memberInfo: {
    cashCreditRate: '',
    cashServiceFreeRate: '',
    creditType: '',
    exportAmount: '',
    exportQuantity: '',
    fictitiousShipmentAmount: '',
    fictitiousShipmentCount: '',
    fixedAmountCount: '',
    gmtCreated: '',
    gmtModified: '',
    id: '',
    memberFree: '',
    memberFreePay: '',
    memberFreeRenew: '',
    nextLevelExportAmount: '',
    nextLevelExportQuantity: '',
    provisionalAmountCount: '',
    silverCreditRate: '',
    silverServiceFreeRate: '',
    upgradeableLevels: '',
    validBeginTime: '',
    validEndTime: '',
    validLastThreeMonthTime: '',
    vipLevelCode: '',
    blackType: 0,
  }, // 当前会员信息
}

const company = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.GET_COMPANYINFO:
      return {
        ...state,
        customerId: action.companyInfo.customerId,
        companyId: action.companyInfo.companyId,
        regNo: action.companyInfo.regNo,
        creditStatus: action.companyInfo.creditStatus,
        isMember: action.companyInfo.isMember,
        vipLevelCode: action.companyInfo.vipLevelCode,
        corpName: action.companyInfo.corpName,
        sequence: action.companyInfo.sequence,
        sealStatus: action.companyInfo.sealStatus,
        legalPerson: action.companyInfo.legalPerson,
        legalPersonCertId: action.companyInfo.legalPersonCertId,
        memberFeeDeadLine: action.companyInfo.memberFeeDeadLine,
        step: action.companyInfo.step,
        provinceCode: action.companyInfo.provinceCode,
        cityCode: action.companyInfo.cityCode,
        areaCode: action.companyInfo.areaCode,
        address: action.companyInfo.address,
        contactName: action.companyInfo.contactName,
        phone: action.companyInfo.phone,
        legalArea: action.companyInfo.legalArea,
      }
    case actionTypes.GET_ISAUDIT:
      return {
        ...state,
        isAudit: action.isAudit,
      }
    case actionTypes.GET_COMPANYTAG:
      return {
        ...state,
        companyTag: action.companyTag,
        supplier: action.supplier,
      }
    case actionTypes.GET_LOANINFO:
      return {
        ...state,
        loanInfo: action.loanInfo,
      }
    case actionTypes.GET_ACCOUNTINFO:
      return {
        ...state,
        accountInfo: action.accountInfo,
      }
    case actionTypes.GET_PAYMENTACCOUNT:
      return {
        ...state,
        paymentAccount: action.paymentAccount,
      }
    case actionTypes.GET_AGENT_LIST: {
      const agentList = action.agentList.filter((item) => {
        return item.status === 'DO'
      })
      const agentStatus = agentList.length ? 1 : 0
      return {
        ...state,
        agentList: action.agentList,
        agentStatus,
      }
    }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore,
      }
    case actionTypes.GET_MEMBER_INFO:
      return {
        ...state,
        memberInfo: action.memberInfo,
      }
    default:
      return state
  }
}

export default company
