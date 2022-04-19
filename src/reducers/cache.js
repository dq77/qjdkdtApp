import actionTypes from '../actions/actionType'

const initialStore = {
  faceExtraData: {}, // 人脸识别相关业务参数
  njTime: '', // 南京银行人脸识别时间
  areaData: [] // 省市区数据源
}

const cache = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.SET_FACE_EXTRA_DATA:
      return {
        ...state,
        faceExtraData: action.faceExtraData
      }
    case actionTypes.SET_NJ_TIME:
      return {
        ...state,
        njTime: action.njTime
      }
    case actionTypes.GET_AREA_DATA:
      return {
        ...state,
        areaData: action.areaData
      }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore
      }
    default:
      return state
  }
}

export default cache
