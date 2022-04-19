const actionTypes = {
  // USER
  INITIAL_AUTH_INFO: 'INITIAL_AUTH_INFO', // 初始化个人设置信息
  SET_SESSION_ID: 'SET_SESSION_ID', // 设置用户登录凭证
  SET_ACCESS_TOKEN: 'SET_ACCESS_TOKEN', // 设置header请求头中的token
  SET_SSO_COOKIE: 'SET_SSO_COOKIE', // 设置h5登录凭证
  SET_USERINFO: 'SET_USERINFO', // 设置用户信息
  CLEAR_LOGININFO: 'CLEAR_LOGININFO', // 清空登录信息
  SET_CONTRACT_NUM: 'SET_CONTRACT_NUM', // 设置合同待办数
  SET_LOAN_NUM: 'SET_LOAN_NUM', // 设置还款待办数
  SET_SESSION_INFO: 'SET_SESSION_INFO', // 设置新的用户登录凭证
  SET_SAAS_INFO: 'SET_SAAS_INFO', // 设置SAAS用户信息
  SET_SAAS_CURRENT_INDEX: 'SET_SAAS_CURRENT_INDEX', // 设置SAAS选择序号
  // CREDIT
  SET_CREDIT_SUMMARY: 'SET_CREDIT_SUMMARY', // 保存授信资料信息
  SET_MARRY_STATUS: 'SET_MARRY_STATUS', // 保存婚姻状况
  SET_HASAUTHED: 'SET_HASAUTHED', // 保存第三方流水授权情况
  GET_AUTHFILE: 'GET_AUTHFILE', // 根据authFileId获取图片上传历史记录
  SET_OTHERINFO: 'SET_OTHERINFO', // 保存其他信息
  SET_CREDIT_STATUS: 'SET_CREDIT_STATUS', // 保存授信状态
  SET_FAILREASON: 'SET_FAILREASON', // 保存授信失败原因
  // COMPANY
  GET_COMPANYINFO: 'GET_COMPANYINFO', // 获取公司基本信息
  GET_ISAUDIT: 'GET_ISAUDIT', // 公司申请销售方状态
  GET_COMPANYTAG: 'GET_COMPANYTAG', // 获取公司打标信息
  GET_LOANINFO: 'GET_LOANINFO', // 获取公司授信额度信息
  GET_PAYMENTACCOUNT: 'GET_PAYMENTACCOUNT', // 获取公司代付账户信息
  GET_AGENT_LIST: 'GET_AGENT_LIST', // 获取代理人列表
  GET_MEMBER_INFO: 'GET_MEMBER_INFO', // 获取当前会员信息
  // CONTRACT
  GET_SECOND_CONTRACT_INFO: 'GET_SECOND_CONTRACT_INFO', // 获取合同信息
  GET_ACCOUNTINFO: 'GET_ACCOUNTINFO', // 获取账户信息
  GET_OTHER_CONTRACT_LIST: 'GET_OTHER_CONTRACT_LIST', // 获取其他合同列表
  GET_CS_CONTRACT_LIST: 'GET_CS_CONTRACT_LIST', // 诚信销/采合同列表
  GET_GUARANTOR_LIST: 'GET_GUARANTOR_LIST', // 获取担保人列表
  GET_PRODUCT_CONTRACT_LIST: 'GET_PRODUCT_CONTRACT_LIST', // 获取二级合同（新，暂时只获取宜宾无票业务）
  // CACHE
  SET_FACE_EXTRA_DATA: 'SET_FACE_EXTRA_DATA', // 存储人脸识别相关业务参数
  SET_NJ_TIME: 'SET_NJ_TIME', // 存储南京银行人脸识别时间
  GET_SECOND_CONTRACTLIST: 'GET_SECOND_CONTRACTLIST', // 获取二级合同列表总览
  GET_AREA_DATA: 'GET_AREA_DATA', // 获取省市区数据
  // ORDER
  SET_GOODSITEMS: 'SET_GOODSITEMS', // 缓存二级订单添加的货物
  SET_SUBMITDATA: 'SET_SUBMITDATA', // 缓存订单提交的数据
  SET_DEFAULTBASEINFO: 'SET_DEFAULTBASEINFO', //
}

export default actionTypes