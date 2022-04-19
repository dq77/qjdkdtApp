import actionTypes from '../actions/actionType'

const initialStore = {
  erjiAddGoodsItems: [], // 缓存二级订单添加的货物
  erjiOrderSubmitData: {},
  erjiDefaultBaseInfo: {}
}

const order = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.SET_GOODSITEMS:
      return {
        ...state,
        erjiAddGoodsItems: action.erjiAddGoodsItems
      }
    case actionTypes.SET_SUBMITDATA:
      return {
        ...state,
        erjiOrderSubmitData: action.erjiOrderSubmitData
      }
    case actionTypes.SET_DEFAULTBASEINFO:
      return {
        ...state,
        erjiDefaultBaseInfo: action.erjiDefaultBaseInfo
      }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore
      }
    default:
      return state
  }
}

export default order
