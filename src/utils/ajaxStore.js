import {
  instance,
  instanceForm,
  instanceQuiet,
  instanceQuietFile,
  instanceQuietForm,
  instanceQuietNoError,
} from './request'

export default {
  common: {
    getSmscodeForRegister: params => instance.get('/ofs/front/verify/wechatFetchSmsCode', { params }),
    newSendSmsCode: data => instanceForm.post('/ofs/weixin/activity/newSendSmsCode', data),
    getInviteCodeValid: params => instanceQuiet.get('/ofs/weixin/activity/checkInviteCode', { params }),
    saveInviteCode: data => instanceQuiet.post('/ofs/weixin/activity/recordActivity', data),
    goToRegister: data => instanceForm.post('/ofs/weixin/user/register', data),
    login: data => instanceForm.post('/ofs/front/user/SSOlogin', data),
    getLipNumber: data =>
      instanceForm.post(`/ofs/weixin/face/livegetfour?sessionId=${data.sessionId}`, { loadingText: data.loadingText }),
    faceIdentity: data =>
      instanceQuietFile.post(`/ofs/weixin/face/idcardlivedetectfour?sessionId=${data.sessionId}`, data),
    refreshVerifyCode: params => instanceForm.get('/ofs/front/verify/refreshVerifyCode', { params }),
    sendEvent: data => instanceQuietNoError.post('/weblogs/api/collect/trackUser', data),
    isMock: () => instanceQuiet.get('/webtools/api/mock/getAll'),
    getAreaData: params => instanceQuiet.get('/leads/common/getCountryList', { params }),
    uploadFile: data => instanceQuietFile.post('/ofs/front/file/off/batchUpload.htm', data),
    getCustomerId: data => instanceQuiet.post('/ofs/front/customer/getCustomerInfo', data),
    getSaasInfo: data => instanceQuiet.post('/ofs/front/user/getJWTByCustomer', data),
  },
  company: {
    ocrBusinessLicense: data => instanceQuietFile.post('/user/ocr/ocrBusinessLicense', data), // 真实性认证营业执照ocr识别
    ocrIdCard: data => instanceQuietFile.post('/user/ocr/ocrIdCard', data), // 真实性认证身份证正反面ocr识别
    certification: data => instanceQuietFile.post('/ofs/weixin/authFile/ocrBusinessLicense', data),
    postCertification: data => instanceForm.post('/ofs/weixin/member/apply', data),
    updateCertification: data => instanceForm.post('/ofs/weixin/member/update', data),
    postProcess: data => instance.post('/process/task/submit', data),
    getCompanyTag: data => instanceQuietForm.post('/ofs/front/user/switchUser', data),
    getCompanyInfo: data => instanceQuietForm.post('/ofs/weixin/user/getCompanyInfo', data),
    getLicenseInfo: data => instanceQuietForm.post('/ofs/weixin/member/memView', data),
    getIsAudit: () => instanceQuiet.get('/ofs/front/member/isaudit'),
    toBeAudit: () => instanceQuiet.get('/ofs/front/member/audit'),
    getLoanInfo: () => instanceQuiet.get('/ofs/front/company/loanInfo'),
    clearAccount: data => instanceQuiet.post('/ofs/front/company/clearAccount', data),
    legalRealName: data => instanceQuietForm.post('/ofs/weixin/face/legalRealName', data),
    // payMemberFee: (data) => instanceForm.post('/ofs/weixin/member/payMemberFee', data),
    payMemberFee: data => instance.post('/ofs/front/memberVip/pushMemberLevelUpgrade', data),
    getAccountInfo: () => instanceQuiet.get('/ofs/weixin/makeLoan/information'),
    getCompanyInfoById: params => instance.get('/ofs/weixin/contractAgent/getByCompanyId', { params }),
    getSupplierInfoById: params => instance.get('/ofs/weixin/supplier/info', { params }),
    addIndividualAccount: data => instance.post('/ofs/weixin/company/addIndividualAccount', data),
    editIndividualAccount: data => instance.post('/ofs/weixin/company/updateIndividualAccount', data),
    checkPaymentAccount: data => instance.post('/ofs/weixin/company/findIndividualAccount', data),
    getAgentList: params => instance.get('/customer/list/agent', { params }),
    getMemberVipInfo: params => instance.get('/ofs/front/memberVip/getMemberVipInfo', { params }),
    checkProcessStatus: params => instance.get('/ofs/front/memberVip/getMemberLevelOrder', { params }),
    processVariables: params => instance.get('/process/process/variables', { params }),
    getMemberVipFree: params => instanceQuiet.get('/ofs/front/memberVip/getMemberVipFree', { params }), // 查询会员VIP对应的费率字典表
    customerGetTrendVo: params => instanceQuietForm.get('/ofs/front/customer/getTrendVo', { params }), // 趋势查询信息
    customerGetCustomerManageWarnVo: params =>
      instanceQuietForm.get('/ofs/front/customer/getCustomerManageWarnVo', { params }), // 会员中心的数据总览接口
    customerSaveCustomerManageWarn: data => instance.post('/ofs/front/customer/saveCustomerManageWarn', data), // 客户经营预警勾选/取消勾选
    billPag: params => instanceForm.get('/ai/crm/bill/page', { params }), // 企业对账单分页查询
    billExport: params => instanceForm.get('/ai/crm/bill/export', { params }), // 企业对账单导出
    couponFind: params => instanceQuiet.get('/ofs/front/coupon/find', { params }), // 优惠券列表
    marketFind: params => instanceQuiet.get('/ofs/front/market/find', { params }), // 查询可用优惠券列表
    marketJoin: data => instance.post('/ofs/front/market/join', data),
    opinionList: data => instanceQuiet.post('/ai/crm/opinion/list', data), // 会员已读未读的舆情列表
    opinionRead: data => instance.post('/ai/crm/opinion/read', data), // 修改舆情信息状态变为已读
    newInformation: params => instanceQuiet.get('/ofs/weixin/makeLoan/newInformation', { params }), // 首页数据总览
    listPageForEntity: data => instanceQuiet.post('/ofs/front/customerEnterpriseAuth/listPageForEntity', data), // 根据条件分页获取企业-企业实名认证list记录
    getEntity: params => instance.get('/ofs/front/customerEnterpriseAuth/getEntity', { params }),
    messageList: data => instanceQuietForm.post('/message/inner/message/list', data), // 消息列表
    messageRead: params => instanceQuietForm.get('/message/inner/message/read', { params }), // 读一条消息
    messageReadAll: params => instanceQuietForm.get('/message/inner/message/readAll', { params }), // 读所有消息
    confirm: data => instance.post('/ofs/front/statements/confirm', data),
    getProcessId: params => instance.get('/proof/contract/detail', { params }),
    isCooperationWithYashi: params => instance.get('/ofs/front/company/isCooperationWithYashi', { params }),
    getBillList: params => instanceQuiet.get('/ofs/weixin/company/statement/page', { params }),
    downloadBill: params => instanceQuiet.get('/ofs/weixin/company/statement/asia/details/download', { params }),
    visitorMyImages: params => instanceQuiet.get('/erp/visitor/myAllImages', { params }), // 销售工具图库列表
    visitorDefaultImages: params => instanceQuiet.get('/erp/visitor/defaultImages', { params }), // 销售工具图库列表默认图片
    visitorDeleteImage: params => instance.get('/erp/visitor/deleteImage', { params }), // 销售工具图库列表图片删除
    visitorAddImages: data => instance.post('/erp/visitor/addImages', data), // 销售工具图库列表新增我的图库保存
    offBatchUpload: data => instanceQuietFile.post('/ofs/front/file/off/batchUpload.htm', data), // 销售工具图库列表新增我的图库上传
    visitorInfoPoster: params => instance.get('/erp/visitor/infoPoster', { params }), // 销售工具活动详情
    visitorInvalidPoster: params => instance.get('/erp/visitor/invalidPoster', { params }), // 销售工具活动失效
    visitorPosterList: data => instanceQuiet.post('/erp/visitor/posterList', data), // 销售工具活动列表
    visitorAddPoster: data => instance.post('/erp/visitor/addPoster', data), // 销售工具新增活动--创建链接
    visitorPotentialList: data => instance.post('/erp/visitor/potentialList', data), // 销售工具新增活动--潜在客户
    bulletinList: data => instanceQuiet.post('/erp/bulletin/list', data), // 公告列表
    bulletinCarousel: params => instanceQuiet.get('/erp/bulletin/carousel', { params }), // 公告列表
    visitorInvalidPotential: params => instance.get('/erp/visitor/invalidPotential', { params }), // 销售工具删除潜在客户
    categorySubclass: params => instance.get('/erp/item/categorySubclass', { params }), // 分类
    itemEdit: data => instance.post('/erp/item/edit', data), // 编辑
    itemCreate: data => instance.post('/erp/item/create', data), // 编辑
    itemInfo: params => instance.get('/erp/item/info', { params }), // 编辑
    itemAppPage: data => instance.post('/erp/item/appPage', data), // 编辑
    qccQuery: params => instance.get('/bjx/v1/bjx/whitelist/queryCompany', { params }),
    getProjectList: params => instance.get('/saas-ofc/biz/project/getProjectList', { params }),
    qccQymh: params => instance.get('/partner/common/qcc/qymh', { params }),
  },
  process: {
    getProcessDetail: params => instance.get('/process/process/info', { params }),
    getTaskDetail: params => instance.get('/process/task/info', { params }),
    taskSubmit: data => instanceQuiet.post('/process/task/submit', data),
    getTaskList: params => instance.get('/process/task/stack', { params }),
    entrust: data => instanceQuiet.post('/process/contractSign/entrust', data),
    transferProcess: params => instance.get('/process/customerIdentity/transferProcess', { params }), // 获取企业打款进度
    processDelete: (processId, data) => instanceForm.post(`/process/process/delete/${processId}`, data), //  取消实名认证流程
  },
  contract: {
    getSecondContractInfo: params => instanceQuiet.get('/contract/queryContractList', { params }),
    getMemberTemplate: params => instance.get('/ofs/weixin/contract/getMemberTemplate', { params }),
    getTwoTemplate: params => instance.get('/ofs/weixin/contract/getTwoTemplate', { params }),
    getInfoServiceTemplate: params => instance.get('/ofs/weixin/contract/getInfoTemplate', { params }),
    getServiceFeeTemplate: params => instance.get('/ofs/weixin/contract/getServiceFeeTemplate', { params }),
    getNJServiceFeeTemplate: params => instance.get('/ofs/weixin/contract/getNJCBServiceFeeTemplate', { params }),
    previewContract: data => instanceForm.post('/ofs/weixin/contract/previewContract', data),
    addOrganizeTemplateSeal: data => instanceForm.post('/ofs/weixin/sign/addOrganizeTemplateSeal', data),
    getContract: params => instance.get('/ofs/weixin/contract/getContract', { params }),
    getOtherContractList: data => instanceQuietForm.post('/ofs/weixin/project/queryElectronicContractByTable', data),
    getCSContractList: data => instanceQuiet.post('/proof/contract/list', data),
    getGrarantorList: () => instance.get('/ofs/weixin/guarantor/getGuarantors'),
    getGuarantorTemplate: params => instance.get('/ofs/weixin/contract/getGuarantorTemplate', { params }),
    getGuarantorTemplateFromShare: params => instance.get('/ofs/weixin/contract/getGuarantorTemplate2', { params }),
    guarantorValid: data => instanceQuietForm.post('/ofs/weixin/sign/personSign', data),
    eSignGuarantorValid: data => instanceQuietForm.post('/ofs/weixin/sign/esign', data),
    contractSign: data => instanceQuietForm.post('/ofs/weixin/sign/organizeSign', data),
    getProductContractsList: params => instanceQuiet.get('/contract/productContractsList', { params }),
    getContractDetail: params => instance.get('/proof/contract/detail', { params }),
    getOtherContractDetail: data => instanceForm.post('/ofs/weixin/contract/contractDetail', data),
    getGuarantorsByContractCode: params =>
      instance.get('/ofs/weixin/guarantor/getGuarantorsByContractCode', { params }),
    updateContract: data => instanceForm.post('/ofs/weixin/contract/updateContract', data),
    getContractInfoAndFile: params => instanceForm.get('/ofs/weixin/contract/getContractInfoAndFile', { params }),
    agentAllSign: data => instanceQuietForm.post('/ofs/weixin/sign/agentAllSign', data),
    allSign: data => instanceQuietForm.post('/ofs/weixin/sign/allSign', data),
    getAgentTemplate: params => instance.get('/ofs/weixin/contract/getAgent', { params }),
    checkAgent: data => instance.post('/ofs/weixin/contractAgent/duplicate', data),
    agentSign: data => instanceQuietForm.post('/ofs/weixin/sign/agentSign', data),
    previewContractAgent: data => instanceForm.post('/ofs/weixin/contract/previewContractAgent', data),
    getContractTemplate: params => instanceForm.get('/contract/getTemplateNew', { params }),
    createContract: data => instance.post('/contract/saveOnLineNew', data),
    createSecondContract: data => instance.post('/contract/createContract', data),
    startProcess: data => instance.post('/contract/startProcess', data),
    getContractCode: params => instanceForm.get('/contract/detail', { params }),
    checkProcessId: params => instanceForm.get('/contract/findContract', { params }),
    getContractView: params => instance.get('/proof/contract/view', { params }),
    getFileType: params => instance.get('/ofs/front/contract/contractFileType', { params }),
  },
  credit: {
    getAllCreditInfo: params => instance.get('/ofs/weixin/authFile/findMemAuthFileByMemAppId', { params }),
    getAuthStatus: params => instance.get('/ofs/weixin/authFile/isAuthorization', { params }),
    findAuthFilesByAuthFileId: params =>
      instanceQuiet.get('/ofs/weixin/authFile/findAuthFilesByAuthFileId', { params }),
    deleteSupplier: data => instanceForm.post('/ofs/weixin/supplier/delete', data),
    searchSupplier: params => instance.get('/ofs/weixin/factoryProduct/findByName', { params }),
    addSupplier: data => instanceForm.post('/ofs/weixin/supplier/add', data),
    getSupplier: () => instance.get('/ofs/weixin/supplier/getPartnerList'),
    uploadAuthFile: data => instanceQuietFile.post('/ofs/weixin/authFile/upload.htm', data),
    uploadAuthFile2: data => instanceQuietFile.post('/ofs/front/authFile/upload.htm', data),
    saveAuthFile: data => instanceForm.post('/ofs/weixin/authFile/uploadAuthFile', data),
    getOtherInfo: data => instanceForm.post('/ofs/weixin/authFile/getInformation', data),
    idcardUpload: data => instanceQuietFile.post('/ofs/weixin/authFile/idcardUpload', data),
    idCardUploadForFront: data => instanceQuietFile.post('/ofs/front/idCard/idCardUploadForFront', data),
    saveOtherInfo: data => instance.post('/ofs/weixin/authFile/informationEntry', data),
    saveIdcard: data => instanceForm.post('/ofs/weixin/authFile/saveIdcard', data),
    assetsUpload: data => instanceQuietFile.post('/ofs/weixin/authFile/assetsUpload', data),
    saveGuarantee: data => instance.post('/ofs/weixin/authFile/uploadGuarantorPhone', data),
    creditApply: data => instanceForm.post('/ofs/weixin/creditApply/creditApplication', data),
    creditResult: () => instance.get('/ofs/front/credit/result'),
    creditFailReason: () => instanceForm.post('/ofs/weixin/user/getCreditRejectReason'),
    customerList: params => instanceQuiet.get('/customer/list', { params }),
    startPersonAuth: data => instanceForm.post('/customer/startPersonAuth', data), // 自然人实名提交表单，开始流程
    startCorpAuth: data => instanceForm.post('/customer/startCorpAuth', data), // 企业实名提交表单.开始流程
    taskSubmit: data => instance.post('/process/task/submit', data), // 自然人认证-四要素验证
    faceSubbranch: params => instance.get('/proof/face/subbranch', { params }), // 银行查询
    taskStack: params => instance.get('/process/task/stack', { params }), // 企业实名认证/自然人实名认证-查询当前任务进程
    telecom3Factors: data => instance.post('/proof/face/telecom3Factors', data), // 获取四要素校验段要验证码
    bankCard4Factors: data => instance.post('/proof/face/bankCard4Factors', data), // 银行卡四要素
    threeFactors: data => instance.post('/proof/face/threeFactors', data), // 企业三要素核身,用于查询开户银行列表获取flowId
    faceFace: data => instance.post('/proof/face/face', data), // 实名认证里面法人 人脸识别
    faceAuthResult: params => instance.get('/proof/face/authResult', { params }), // 人脸识别实名认证结果查询
    setVariablesLocal: (taskId, data) => instance.post(`/process/task/setVariablesLocal?taskId=${taskId}`, data), // 人脸识别任务-保存任务变量
    creditAll: params => instanceQuiet.get('/credits/credit/all', { params }), // 查询授信额度
    detailAll: data => instanceForm.post('/credits/detail/all', data), // 授信明细额度接口
    detailSupplier: data => instanceForm.post('/credits/detail/supplier', data), // 厂家额度明细查询
    detailProject: data => instanceForm.post('/credits/detail/project', data), // 项目临时额度明细查询
    detailqjd: data => instanceForm.post('/credits/detail/qjd', data), // 仟金顶额度明细查询
    detailProjectDetail: params => instance.get('/credits/detail/projectDetail', { params }), // 临时额度明细查询详情
    detailQjdUsing: data => instanceForm.post('/credits/detail/qjdUsing', data), // 仟金顶使用清单
    detailQjdFreezing: data => instanceForm.post('/credits/detail/qjdFreezing', data), // 仟金顶冻结清单
    detailSupplierFreezing: data => instanceForm.post('/credits/detail/supplierFreezing', data), // 厂家冻结清单
    detailSupplierUsing: data => instanceForm.post('/credits/detail/supplierUsing', data), // 厂家使用清单
    creditProject: data => instanceQuietForm.post('/credits/credit/project', data), // 临额清单项目分页
    creditSupplier: data => instanceQuietForm.post('/credits/credit/supplier', data), // 厂家分页
    processTask: params => instance.get('/process/register/process/task', { params }), // 登录成功之后判断当前真实性认证是成功还是失败还是未认证
  },

  order: {
    companyStageRateContrast: params =>
      instance.get('/ofs/front/companyStageRate/companyStageRateContrast', { params }),
    getOrderInfoByPC: params => instance.get('/ofs/front/order/info', { params }),
    getOrderInfo: params => instance.get('/ofs/front/wkaOrder/orderInfo', { params }),
    getInvoiceInfo: params => instance.get('/ofs/front/invoiceApply/findApplyInfo', { params }),
    getHaierContracts: data => instanceForm.post('/ofs/weixin/contract/getHaierContract', data),
    getProductInfo: params => instanceQuiet.get('/ofs/front/QJDProduct/getDetail', { params }),
    getProductInfo2: params => instance.get('/ofs/front/project/productInfo', { params }),
    getSupplier: params => instance.get('/ofs/front/supplier/getAll?plantType=DEALERS&isRelSupplier=true', { params }),
    confirmContract: params => instance.get('/ofs/front/wkaOrder/confirmContract', { params }),
    getCompanyInfo: params => instance.get('/ofs/front/company/getCompanyInfo', { params }),
    getDefaultReceiveInfo: params => instance.get('/ofs/front/wkaOrder/getDefaultReceiveInfo', { params }),
    getAll: params => instance.get('/ofs/front/supplier/getAll', { params }),
    getBySupplier: params => instance.get('/ofs/front/QJDProduct/getBySupplier', { params }),
    checkUsableOrderMoney: params => instance.get('/ofs/front/wkaOrder/checkUsableOrderMoney', { params }),
    verifyRiskUpload: params => instance.get('/ofs/weixin/user/verifyRiskUpload', { params }),
    checkInvoiceApplicable: params => instance.get('/ofs/front/invoiceApply/checkInvoiceApplicable', { params }),
    defaultApplyInfo: params => instance.get('/ofs/front/invoiceApply/defaultApplyInfo', { params }),
    querySupplierCode: params => instance.get('/ofs/front/general/querySupplierCode', { params }),
    itemInfo: params => instance.get('/ofs/front/invoiceApply/itemInfo', { params }),
    checkInvoiceInfo: params => instance.get('/ofs/front/invoiceInfo/checkInvoiceInfo', { params }),
    queryInvoiceInfo: params => instance.get('/ofs/front/invoiceInfo/queryInvoiceInfo', { params }),
    updateInvoiceInfo: data => instance.post('/ofs/front/invoiceInfo/updateInvoiceInfo', data),
    checkContract: data => instanceQuietForm.post('/ofs/weixin/contract/checkContract', data),
    createWkaOrder: data => instance.post('/ofs/front/wkaOrder/createWkaOrder', data),
    invoiceApply: data => instance.post('/ofs/front/invoiceApply/apply', data),
    getFourElements: data => instanceForm.post('/ofs/weixin/user/getFourElements', data),
    sendSmsCode: data => instanceForm.post('/ofs/weixin/activity/sendSmsCode', data),
    getNJFourElements: data => instanceForm.post('/ofs/weixin/njbc/getFourElements', data),
    updateNJFourElements: data => instance.post('/ofs/weixin/njbc/updateFourElements', data),
    memberAuthFileRequired: data => instanceQuiet.post('/ofs/weixin/authFile/memberAuthFileRequired'),
    orderAllList: data => instanceQuiet.post('/ofs/front/aquamanOrder/orderAllList', data),
    authFourElements: (verifyCode, data) =>
      instance.post('/ofs/weixin/user/authFourElements?verifyCode=' + verifyCode, data),
    getContractList: params => instanceQuiet.get('/process/newContractSign/todoPage', { params }),
    getContractListCxcNoPage: params => instanceQuiet.get('/process/contractSign/task/todoList', { params }),
    getOrderToDoList: params => instanceQuiet.get('/ofs/front/aquamanOrder/todoList', { params }),
    getLoanTypes: params => instanceQuiet.get('/ofs/front/loan/initLoanTypes', { params }),
    getSkuItem: params => instance.get('/ofs/front/supplier/getSkuItem', { params }),
    applyMoney: params => instance.get('/ofs/front/loan/applyMoney', { params }),
    createOrder: data => instanceForm.post('/ofs/front/order/createRetailOrder', data),
    createProjectOrder: data => instanceForm.post('/ofs/front/order/create', data),
    loanApply: data => instanceForm.post('/ofs/front/loan/loanApply', data),
    batchUpload: data => instanceQuietFile.post('/ofs/front/orderFile/batchUpload.htm', data),
    getInvalidProjectList: params => instanceForm.get('/ofs/front/project/queryUsableProjectList', { params }),
    defaultReceiverInfo: params => instance.get('/ofs/front/order/defaultReceiverInfo', { params }),
    getProjectLists: params => instanceQuiet.get('/ofs/front/project/queryProjectListPage', { params }),
    getSupplierLists: data => instanceQuiet.post('/erp/supplier/page', data),
    getSupplierInfo: params => instanceQuiet.get('/erp/supplier/findById', { params }),
    addSupplierItem: data => instanceQuiet.post('/erp/supplier/add', data),
    delSupplierItem: params => instanceQuiet.get('/erp/supplier/deleteById', { params }),
    updateSupplierItem: data => instanceQuiet.post('/erp/supplier/update', data),
    comfirmProduct: params => instance.get('/ofs/front/project/projectConfirm', { params }),
    initCompanyManage: params => instanceForm.get('/ofs/front/company/initCompanyManage', { params }),
    getProjectInfo: params => instanceForm.get('/ofs/front/project/info', { params }),
    getProjectInfoAll: params => instanceForm.get('/ofs/front/project/projectInfoAll', { params }),
    createProject: data => instanceForm.post('/ofs/front/project/create', data),
    updateProject: data => instanceForm.post('/ofs/front/project/updateProject', data),
  },
  loan: {
    loadLoanList: params => instanceQuiet.get('/ofs/weixin/makeLoan/makeLoanList', { params }),
    getLoanDetail: params => instanceQuiet.get('/ofs/front/loanBill/info', { params }),
    getAccountInfoByNanJing: params => instanceQuiet.get('/ofs/weixin/njbc/accountQuery', { params }),
    getLoanInfoByNanJing: data => instanceForm.post('/ofs/weixin/njbc/loanTermTrlNew', data),
    getLoanListByNanJing: data => instanceForm.post('/ofs/weixin/njbc/repaymentPlan', data),
    getRepaymentDetail: params => instanceQuiet.get('/ofs/weixin/repayment/detail', { params }),
    findNanJingLoansStatusByMakeLoansId: params =>
      instance.get('/ofs/weixin/nanJingLoansStatus/findNanJingLoansStatusByMakeLoansId', { params }),
    yiPrepayJudge: params => instance.get(`/ofs/weixin/repayment/yiPrepayJudge?loanInfoId=${params}`, { params }),
    getRepayCoupon: data => instance.post('/ofs/front/repayment/repayCoupon', data),
    applyRefund: data => instance.post('/ofs/weixin/repayment/repayPreview', data),
    doRefund: data => instance.post('/ofs/weixin/repayment/repayReg', data),
    repayCheck: data => instance.post('/ofs/weixin/njbc/repayCheck', data),
    promptlyRepay: data => instance.post('/ofs/weixin/njbc/promptlyRepay', data),
    accountRecharge: data => instance.post('/ofs/weixin/njbc/accountRecharge', data),
    accountWithdraw: data => instance.post('/ofs/weixin/njbc/accountWithdraw', data),
    yiPrepay: data => instance.post('/ofs/weixin/repayment/yiPrepay', data),
    njcbSign: data => instanceForm.post('/ofs/weixin/sign/njcbSign', data),
    njcbContract: data => instanceForm.post('/ofs/weixin/sign/njcbContract', data),
    getLoanTodoList: params => instanceQuiet.get('/ofs/front/factory/queryLoanPlan', { params }),
    getRepaymentDetailList: data => instanceQuietForm.post('/ofs/front/repayment/repaymentDetailList', data),
    getHistoryList: data => instanceQuiet.post('/ofs/front/loanBill/repaymentDetail', data),
    getLoanDetailInfo: data => instanceQuiet.post('/ofs/front/loanBill/getLoanDetailInfo', data),
    getSyLoanBillInfo: params => instanceQuiet.get('/ofs/front/factory/getLoanDetail', { params }),
    getXyRepayDetail: params => instanceQuiet.get('/ofs/front/repayment/detail', { params }),
    getHistoryLoanInfo: params => instanceQuiet.get('/ofs/front/loan/initLoanApplyList', { params }),
    getLoanInfo: data => instanceQuiet.get('/ofs/front/company/loanInfo', data),
    getLoanList: data => instanceQuietForm.post('/ofs/front/loanBill/repayLoanList', data),
    getXyRepayLoans: params => instanceQuiet.get('/ofs/front/repayment/repayLoans', { params }),
    batchRepay: data => instance.post('/ofs/front/repayment/batchRepay', data),
    findOrderByCode: params => instance.get('/ofs/front/order/findOrderByCode', { params }), // 查询订单详情
    getProductOrderSignProcessId: params =>
      instanceQuiet.get('/ofs/weixin/makeLoan/getProductOrderSignProcessId', { params }),
  },
  home: {
    getBanner: params => instanceQuiet.get('/erp/bulletin/carousel', { params }),
  },
  crm: {
    getList: data => instanceQuiet.post('/erp/leads/commerceList', data),
    crmAdd: data => instance.post('/erp/leads/addCommerce', data),
    crmEdit: data => instance.post('/erp/leads/editCommerce', data),
    checkName: params => instance.get('/erp/leads/efficacyCommerceName', { params }),
    getCrmDetail: params => instanceQuiet.get('/erp/leads/commerceDetail', { params }),
    getTraceList: params => instanceQuiet.get('/erp/leads/traceList', { params }),
    addTrace: params => instance.post('/erp/leads/addTrace', params),
    qccQuery: params => instance.get('/erp/leads/qccQuery', { params }),
  },
  erp: {
    getProductList: data => instanceQuiet.post('/erp/goods/page', data),
    getOrderList: data => instanceQuiet.post('/erp/order/page', data),
    getByCode: params => instanceQuietForm.get('/erp/order/getByCode', { params }),
    getOrderGoods: data => instanceQuiet.post('/erp/order/item/page', data),
    cancelOrder: data => instanceQuiet.post('/erp/order/cancel', data),
    getDeliverList: params => instanceQuietForm.get('/erp/deliver/details', { params }),
    createDeliver: data => instance.post('/erp/deliver/create', data),
    updateOrder: data => instance.post('/erp/order/update', data),
    updateProductList: data => instance.post('/erp/goods/listByIds?returnEmptyObj=true', data),
    listByCodes: data => instance.post('/erp/goods/listByCodes?returnEmptyObj=true', data),
    createOrder: data => instance.post('/erp/order/create', data),
  },
  project: {
    getProjectEvaluationList: data => instanceQuiet.post('/erp/evaluation/project/appPage', data),
    getProjectEvaluationDetail: params => instanceQuietForm.get('/erp/evaluation/project/getProjectById', { params }),
    cancelProjectEvaluation: params => instanceQuietForm.get('/erp/evaluation/project/cancel', { params }),
    submitProjectEvalutaion: data => instanceQuiet.post('/erp/evaluation/project/save', data),
    editProjectEvalutaion: data => instanceQuiet.post('/erp/evaluation/project/edit', data),
  },
  saas: {
    spuList: params => instanceQuiet.get('/saas-ofc/biz/goods/pageList', { params }), // 商品列表
    // spuList: params => instanceQuiet.get('/saas-ofc/biz/spu/list', { params }), // 商品列表
    spuGet: params => instanceQuiet.get('/saas-ofc/biz/goods/getDetailById', { params }), // spu详情
    // spuGet: params => instanceQuiet.get('/saas-ofc/biz/spu/get', { params }), // spu详情
    getAttributeValueBySpell: params => instance.get('/saas-ofc/biz/attribute/getAttributeValueBySpell', { params }), // 根据属性简拼查询对应的值列表
    allCategory: params => instanceQuiet.get('/saas-ofc/biz/category/allCategory', { params }), // 所有分类
    orderPage: data => instanceQuiet.post('/saas-ofc/biz/order/page', data), // 分页查询订单
    orderAdvice: params => instanceQuiet.get('/saas-ofc/biz/order/advice', { params }), // 同步信息
    getOrderOptions: params => instanceQuiet.get('/saas-ofc/biz/orderOptions/getByOrderId', { params }), // 根据订单id获取订单附属字段
    orderGetById: params => instanceQuiet.get('/saas-ofc/biz/order/findInfoById', { params }), // 根据订单明细id获取费项明细
    getByOrderId: params => instanceQuiet.get('/saas-ofc/biz/orderItem/getByOrderId', { params }), // 根据订单id获取订单明细
    getByParentId: params => instance.get('/saas-ofc/biz/purchaseOptions/getByParentId', { params }), // 根据父id获取附属自动
    orderCreate: data => instance.post('/saas-ofc/biz/order/create', data), // 订单创建
    batchPayCompute: data => instance.post('/saas-ofc/biz/payCompute/batchPayCompute', data), // 批量支付价格计算
    getAccountList: data => instanceQuiet.post('/saas-boss/member/list', data), // 获取联系人列表
  },
}
