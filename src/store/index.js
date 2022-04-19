import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'

const logger = store => next => action => {
  if (typeof action === 'function') {
    // console.log('dispatching a function')
  } else {
    // console.log('dispatching ', action)
  }
  const result = next(action)
  // console.log('nextState ', store.getState())
  return result
}

const middlewares = [
  logger,
  thunk
]

const index = createStore(rootReducer, applyMiddleware(...middlewares))
export default index
