import actionTypes from '../actions/actionType'
import Color from '../utils/Color'

const initialStore = {
  sessionId: '',
  ssoCookie: '',
  isLogin: false,
  userInfo: {
    corpName: '',
    duty: '',
    memberId: '',
    ofsCompanyId: '', // 此字段慎用，后续业务会逐步使用cifCompanyId，存在company.companyId中
    profileImagePath: '',
    roleCodes: [],
    userName: '',
    userTelephone: '',
  },
  sessionInfo: {},
  saas: {
    saasList: [],
    currentIndex: '',
  },
  allUserInfo: {}, // 全部信息包括授信状态
  themeColor: Color.THEME, // 用户设置APP主题色
  contractNum: 0, // 合同待办数
  loanNum: 0, // 还款待办数
}

const user = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.INITIAL_AUTH_INFO:
      return {
        ...state,
        ...action.initialInfo,
      }
    case actionTypes.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.sessionId,
      }
    case actionTypes.SET_USERINFO:
      return {
        ...state,
        userInfo: action.userInfo.loginResult,
        allUserInfo: action.userInfo,
        isLogin: true,
      }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore,
      }
    case actionTypes.SET_SSO_COOKIE:
      return {
        ...state,
        ssoCookie: action.ssoCookie,
      }
    case actionTypes.SET_CONTRACT_NUM:
      console.log('contractNum', action.contractNum)
      return {
        ...state,
        contractNum: action.contractNum,
      }
    case actionTypes.SET_LOAN_NUM:
      return {
        ...state,
        loanNum: action.loanNum,
      }
    case actionTypes.SET_SESSION_INFO:
      return {
        ...state,
        sessionInfo: action.session,
      }
    case actionTypes.SET_SAAS_INFO:
      return {
        ...state,
        saas: {
          saasList: action.saas,
          currentIndex: state.saas.currentIndex !== '' ? state.saas.currentIndex : action.saas.length ? 0 : '',
        },
      }
    case actionTypes.SET_SAAS_CURRENT_INDEX:
      return {
        ...state,
        saas: {
          ...state.saas,
          currentIndex: action.index,
        },
      }
    default:
      return state
  }
}

export default user
