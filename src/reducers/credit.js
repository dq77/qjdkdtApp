import actionTypes from '../actions/actionType'
import Color from '../utils/Color'
import { assign } from '../utils/Utility'

const initialStore = {
  exampleList: [
    {
      id: '1',
      text: '三证正副本',
      templateList: [{
        title: '三证正副本示例',
        text: '白色纯底，照片四角对齐，文字清晰，无反光遮挡。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=cf8f4d5b-1218-4ea7-9a3f-9d11329c09dd'
      }]
    },
    {
      id: '2',
      text: '实际控制人夫妇身份证',
      info: '',
      templateList: [
        {
          title: '身份证人像面示例',
          text: '文字、头像清晰完整；',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=538cf1c5-c54d-4b31-8f52-52389308b04a'
        },
        {
          title: '身份证国徽面示例',
          text: '文字、国徽清晰完整；',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=06aaa07d-abb1-481a-a0c9-1dfe5e26b9be'
        }
      ]
    },
    {
      id: '3',
      text: '法定代表人身份证',
      info: '',
      templateList: [
        {
          title: '身份证人像面示例',
          text: '文字、头像清晰完整；',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=538cf1c5-c54d-4b31-8f52-52389308b04a'
        },
        {
          title: '身份证国徽面示例',
          text: '文字、国徽清晰完整；',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=06aaa07d-abb1-481a-a0c9-1dfe5e26b9be'
        }
      ]
    },
    {
      id: '4',
      text: '实控人简版个人征信报告',
      templateList: [{
        title: '简版个人征信报告示例',
        text: '最近1个月内打印版，照片四角对齐，文字清晰，无反光遮挡，时间、姓名、内容完整。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=6ff1b598-d7d2-48d3-8f5e-30f188740fc1'
      }]
    },
    {
      id: '5',
      text: '房产必须上传，车辆证明可选填',
      templateList: [
        {
          title: '房产示例',
          text: '照片四角对齐，文字清晰，无反光遮挡，房产编号、位置、面积完整。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=4c13304d-0873-4880-bcfb-3d2eca5f2847'
        },
        {
          title: '车辆证明示例',
          text: '照片四角对齐，文字清晰，无反光遮挡。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=dbb4b891-c817-426d-8b73-0d8b08fcdcea'
        }
      ]
    },
    {
      id: '6',
      text: '近6个月走业务账户流水（企业对公流水、实际控制人夫妇账户流水）',
      maxImgs: 200,
      templateList: [{
        title: '结算流水示例',
        text: '文字清晰，银行柜台章、户名、账号、开户行信息齐全，完整。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=bb69eb58-1909-4754-bb8f-7d063d1fdaa4'
      }]
    },
    {
      id: '7',
      text: '经营地照片(实控人入镜）',
      templateList: [
        {
          title: '实控人入境示例',
          text: '实控人入境的经营地照片',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=d5de86cf-4408-4bcf-87b9-85063ac94547'
        }
      ]
    },
    {
      id: '8',
      text: '一级经销商出具的证明函',
      templateList: [{
        title: '一级证明函示例',
        text: '文字清晰，一级公章、合作年限、金额完整，填空内容需机打，非手写。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=bb898491-f6bb-42c4-a560-c33369a05823'
      }]
    },
    {
      id: '9',
      text: '租赁合同或产权证明'
      // templateList: [
      //   {
      //     title: '租赁合同或产权证明示例',
      //     text: '租赁合同或产权证明照片',
      //     url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=d5de86cf-4408-4bcf-87b9-85063ac94547'
      //   }
      // ]
    },
    {
      id: '10',
      text: '结婚证(离异的，需同时提供离婚证和离婚协议)',
      templateList: [
        {
          title: '结婚证示例',
          text: '照片四角对齐，文字清晰，无反光遮挡。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=1becc9b9-c72c-4812-99aa-4566a4c6392a'
        },
        {
          title: '离婚证示例',
          text: '照片四角对齐，文字清晰，无反光遮挡。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=8ec5d0b7-7b2e-427b-ab8f-644ec1445c82'
        },
        {
          title: '离婚协议示例1',
          text: '离婚协议需民政局盖章。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=24bffe2b-ccef-4fb9-a545-3d802bc0fb42'
        },
        {
          title: '离婚协议示例2',
          text: '离婚协议需民政局盖章。',
          url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=8bb8fcf5-41d9-40fc-9b43-ad440af425cd'
        }
      ]
    },
    {
      id: '11',
      text: '实控人单身请提供亲友（非配偶）身份证、房产证照片；如有40%以上股东，请提供股东身份证、房产证照片；'
    },
    {
      id: '12',
      text: '担保人简版个人征信报告',
      templateList: [{
        title: '简版个人征信报告示例',
        text: '最近1个月内打印版，照片四角对齐，文字清晰，无反光遮挡，时间、姓名、内容完整。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=6ff1b598-d7d2-48d3-8f5e-30f188740fc1'
      }]
    },
    {
      id: '13',
      text: '实控人配偶个人征信报告',
      templateList: [{
        title: '简版个人征信报告示例',
        text: '最近1个月内打印版，照片四角对齐，文字清晰，无反光遮挡，时间、姓名、内容完整。',
        url: 'https://wx.zhuozhuwang.com/ofs/weixin/project/loadFile?buzKey=6ff1b598-d7d2-48d3-8f5e-30f188740fc1'
      }]
    }
  ],
  allItems: [
    { id: '1', name: '三证正副本', cateCode: ['C10001'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '2', name: '实控人身份信息', cateCode: ['C10012', 'C10026'], authFileId: [], count: 0, isRequired: true, url: 'IdcardUpload' },
    { id: '3', name: '法定代表人身份证', cateCode: ['C10021'], authFileId: [], count: 0, isRequired: true, url: 'IdcardUpload' },
    { id: '4', name: '实控人征信报告', cateCode: ['C10017'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '5', name: '家庭资产', cateCode: ['C10014', 'C10015'], authFileId: [], count: 0, isRequired: true, url: 'HouseUpload' },
    { id: '6', name: '结算流水', cateCode: ['C10018'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '7', name: '经营地信息', cateCode: ['C10023'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '8', name: '一级经销商证明函', cateCode: ['C10025'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '9', name: '租赁合同或产权证明照', cateCode: ['C10088'], authFileId: [], count: 0, isRequired: false, url: 'NormalUpload' },
    { id: '10', name: '婚姻状况', cateCode: ['C10013'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '11', name: '担保人信息', cateCode: ['C10024'], authFileId: [], count: 0, isRequired: false, url: 'GuaranteelUpload' },
    { id: '12', name: '担保人个人征信报告', cateCode: ['C10045'], authFileId: [], count: 0, isRequired: false, url: 'NormalUpload' },
    { id: '13', name: '实控人配偶个人征信报告', cateCode: ['C10044'], authFileId: [], count: 0, isRequired: true, url: 'NormalUpload' },
    { id: '14', name: '其他', authFileId: '', count: 0, isRequired: true, successMsg: '已填写', failMsg: '未完成', url: 'CreditOther' }
  ],
  authFileMap: [
    { cateCode: 'C10001', title: '', maxImgs: 50, minImgs: 1 },
    { cateCode: 'C10021', title: '', maxImgs: 2, minImgs: 0, isIdcard: true },
    { cateCode: 'C10012', title: '实控人身份证', maxImgs: 2, minImgs: 0, isIdcard: true, isRequired: true },
    { cateCode: 'C10026', title: '实控人配偶身份证', maxImgs: 2, minImgs: 0, isIdcard: true, isRequired: false },
    { cateCode: 'C10017', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10014', title: '房产', maxImgs: 50, minImgs: 0, isRequired: true },
    { cateCode: 'C10015', title: '车辆证明', maxImgs: 50, minImgs: 0, isRequired: false },
    { cateCode: 'C10018', title: '', maxImgs: 200, minImgs: 0 },
    { cateCode: 'C10023', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10025', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10024', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10013', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10088', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10045', title: '', maxImgs: 50, minImgs: 0 },
    { cateCode: 'C10044', title: '', maxImgs: 50, minImgs: 0 }

  ],
  marryStatus: '2',
  hasAuthed: false, // 是否通过第三方授权流水
  authFileItems: [],
  otherInfo: {},
  creditStatus: '',
  failReason: ''// 授信失败原因
}

const credit = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.SET_CREDIT_SUMMARY:
      return {
        ...state,
        allItems: action.allItems
      }
    case actionTypes.SET_MARRY_STATUS:
      return {
        ...state,
        marryStatus: action.marryStatus
      }
    case actionTypes.SET_HASAUTHED:
      return {
        ...state,
        hasAuthed: action.hasAuthed
      }
    case actionTypes.GET_AUTHFILE:
      const authFileItems = state.authFileItems
      const authFileMap = state.authFileMap
      authFileItems.map((item, index) => {
        if (item.authFileId === action.authItem.authFileId) {
          authFileItems.splice(index, 1)
        }
      })
      action.authItem.historyItem.map((item, i) => {
        authFileMap.map((item2, j) => {
          if (item2.cateCode === action.authItem.cateCode) {
            action.authItem = assign(action.authItem, item2)
          }
        })
      })
      console.log(action.authItem)
      authFileItems.push(action.authItem)
      return {
        ...state,
        authFileItems: authFileItems
      }
    case actionTypes.SET_OTHERINFO:
      return {
        ...state,
        otherInfo: action.otherInfo
      }
    case actionTypes.SET_CREDIT_STATUS:
      return {
        ...state,
        creditStatus: action.creditStatus
      }
    case actionTypes.SET_FAILREASON:
      return {
        ...state,
        failReason: action.failReason
      }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore
      }
    default:
      return state
  }
}

export default credit
