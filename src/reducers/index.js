import { combineReducers } from 'redux'
import home from './home'
import user from './user'
import credit from './credit'
import company from './company'
import contract from './contract'
import cache from './cache'
import order from './order'

export default combineReducers({
  home,
  user,
  credit,
  company,
  contract,
  cache,
  order
})
