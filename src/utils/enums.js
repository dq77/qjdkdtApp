// 单位类型
export const organType = {
  0: '普通企业',
  1: '社会团体',
  2: '事业单位',
  3: '民办非企业单位',
  4: '党政及国家机构'
}
// 注册类型
export const userType = {
  1: '代理人注册',
  2: '法人注册'
}
// 身份证归属地
export const legalArea = {
  0: '大陆',
  1: '香港',
  2: '澳门',
  3: '台湾',
  4: '外籍'
}
// 担保人身份
export const signerIdentityMap = {
  LEGAL: '法人',
  SHAREHOLDER: '股东',
  SHAREHOLDER_SPOUSES: '股东配偶',
  REAL_SPOUSES: '实控人配偶',
  REAL_CONTROLLER: '实控人',
  OTHER: '其他'
}
// 其他合同担保人身份
export const guarantorType = {
  REAL_CONTROLLER: '实控人',
  REAL_SPOUSES: '实控人配偶',
  SHAREHOLDER: '40%以上股东',
  SHAREHOLDER_SPOUSES: '40%以上股东配偶',
  OTHER: '其他'
}
// 合同类型
export const contractType = {
  0: '法人实名认证',
  1: '担保合同',
  2: '两方合同',
  3: '三方合同',
  4: '质押合同',
  5: '最高额质押合同',
  6: '最高额担保合同',
  7: '四方合同',
  9: '补充协议',
  10: '会员费协议',
  11: '分销两方合同(一级)',
  12: '分销两方合同(二级)',
  13: '最高额保证合同(二级)',
  14: '两方-亚士DE类',
  15: '三方-亚士DE类',
  16: '分销两方合同（宜宾）',
  17: '居间服务协议（宜宾）',
  18: '个人征信授权书',
  20: '分销两方合同（海尔）',
  21: '最高额担保合同（个人版）',
  22: '最高额担保合同（企业版）',
  23: '信息系统服务协议',
  24: '分销两方合同（南京）',
  25: '居间服务协议（南京）',
  27: '货款提前支取合作协议（两方版）',
  28: '诚信销-三方合同',
  29: '授权委托协议',
  30: '货款提前支取合作协议（三方版)',
  31: '债权转让协议',
  34: '担保函',
  35: '采购两方合同'
}
// 资金来源
export const fundSource = {
  1: '16', // 宜宾
  2: '20', // 海尔
  4: '24' // 南京
}
// 签署人身份
export const signerTypeObj = {
  1: '经销商',
  8: '经销商委托人',
  4: '担保人1',
  6: '担保人2',
  7: '担保企业',
  3: '厂家',
  5: '厂家代理人',
  0: '仟金顶网络公司',
  2: '仟金顶信息公司'
}
// 签署人身份排序 （顺序等同于签署人列表排序，按优先级排列）
export const signerTypeSort = [
  '经销商',
  '经销商委托人',
  '担保人1',
  '担保人2',
  '担保企业',
  '厂家',
  '厂家代理人',
  '仟金顶网络公司',
  '仟金顶信息公司'
]
// 会员费升级流程状态枚举值
export const processStatus = {
  0: '流程发起',
  1: '冻结成功',
  2: '合同签署成功',
  3: '合同签署失败',
  4: '订单结束',
  5: '人工终止',
  6: '冻结失败',
  7: '订单失败'
}
// 项目评估状态
export const projectEvaluationStatus = {
  1: '待评估',
  2: '已关闭',
  3: '已完成'
}
export const undertakeMode = {
  1: '直签项目',
  2: '总包项目',
  3: '挂靠项目'
}
// 支付方式
export const payType = {
  0: '微信',
  1: '支付宝',
  2: '现金',
  3: '银行转账'
}

// 支持金融产品
export const supportProducts = [
  {
    value: '4',
    label: '分销采',
    summary: '全品类小额经销商',
    tag: 'isSupportwoDistribution',
    name: 'isSupportDistribution'
  },
  {
    value: '1',
    label: '直营采',
    summary: '仟金顶品牌评分4分以上直营经销商',
    tag: 'isSupportRetaildirect',
    name: 'isSupportRetailDirect'
  },
  {
    value: '3',
    label: '电商采',
    summary: '各大电商平台的商户',
    tag: 'isSupportRetailfreestore',
    name: 'isSupportRetailFreeStore'
  },
  {
    value: '2',
    label: '货押采',
    summary: '囤货于第三方仓库/工厂仓库的囤货商',
    tag: 'isSupportRetailcontrolstore',
    name: 'isSupportRetailControlStore'
  },
  {
    value: '5',
    label: '工程采',
    summary: '承接工程项目的经销商',
    tag: 'isSupportProject',
    name: 'isSupportProject'
  }

  // {
  //   value: '4',
  //   label: '诚信销',
  //   summary: '对下游有赊销账期的供货商',
  //   tag: 'isSupportPurchaser',
  //   name: 'isSupportPurchaser'
  // },

  // {
  //   value: '7',
  //   label: '托盘',
  //   summary: '主板上市企业',
  //   tag: 'isSupportTray',
  //   name: 'isSupportTray'
  // }
]
