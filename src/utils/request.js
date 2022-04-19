import axios from 'axios'
import CookieManager from 'react-native-cookies'
import { setSessionId, setSsoCookie } from '../actions'
import store from '../store/index'
import { baseUrl, defaultError, shenheBaseUrl } from './config'
// import {
//   NetInfo
// } from 'react-native'
import StorageUtil from './storageUtil'
import { logout } from './UserUtils'

axios.defaults.withCredentials = true
const baseConfig = {
  baseURL: baseUrl,
  withCredentials: true,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
}

let requestDone = 0

function validAllRequest() {
  if (requestDone - 1 === 0) {
    global.loading.hide()
  }
  if (requestDone > 0) {
    requestDone -= 1
  }
}

function countRequest() {
  requestDone += 1
}

function setRequestHeader(request) {
  const state = store.getState()
  const saasInfo = state.user.saas.saasList[state.user.saas.currentIndex]
  const sessionInfo = state.user.sessionInfo
  if (state && state.user && state.user.saas) {
    if (state.user.saas.saasList.length) {
      request.headers[saasInfo.cookieName] = saasInfo.cookieValue
    }
  }
  if (state && sessionInfo) {
    request.headers[sessionInfo.cookieName] = sessionInfo.cookieValue
  }
  return request
}

function showError(msg, code) {
  if (code !== '100000026' && code !== 'U10012') {
    if (global.showError) {
      // showToast(msg || defaultError)
      global.alert.show({
        content: msg || defaultError,
      })
    } else {
      global.showError = true
    }
  } else {
    global.showError = true
  }
}

async function handleSetCookie() {
  const res = await CookieManager.get(baseUrl)
  for (const key in res) {
    if (key === 'JSESSIONID') {
      // console.log('sessionId:' + res.JSESSIONID)
      setSessionId({
        sessionId: res.JSESSIONID,
      })
    }
    if (key === 'sso_cookie') {
      // console.log('sso_cookie:' + res.sso_cookie)
      setSsoCookie({
        ssoCookie: res.sso_cookie,
      })
    }
    // if (key === 'x-captcha-pic-key') {
    //   await StorageUtil.save('x_captcha_pic_key', res['x-captcha-pic-key']).then(res => {
    //     if (!res) {
    //       console.log('x_captcha_pic_key save success')
    //     }
    //   })
    // }
  }
}

function validErrorCode(err) {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '请求错误(400)'
        break
      case 401:
        err.message = '未授权，请重新登录(401)'
        break
      case 403:
        err.message = '拒绝访问(403)'
        break
      case 404:
        err.message = '请求出错(404)'
        break
      case 408:
        err.message = '请求超时(408)'
        break
      case 500:
        err.message = '服务器错误(500)'
        break
      case 501:
        err.message = '服务未实现(501)'
        break
      case 502:
        err.message = '网络错误(502)'
        break
      case 503:
        err.message = '服务不可用(503)'
        break
      case 504:
        err.message = '网络超时(504)'
        break
      case 505:
        err.message = 'HTTP版本不受支持(505)'
        break
      default:
        err.message = defaultError
    }
  } else {
    if (err.toString().indexOf('Network Error') > -1) {
      err.message = '网络连接异常，请检查网络'
    } else {
      err.message = defaultError
    }
  }
  return err
}

// ie对设置的 responseType = json 无效，需要单独转换
function toJSON(str) {
  let res = str
  try {
    if (typeof str === 'string' && /^{.*?}$/.test(str)) {
      res = JSON.parse(str)
    }
  } catch (error) {
    console.error(error)
  }
  return res
}

// 默认，有全屏loading，数据为json格式
const instance = axios.create(
  Object.assign({}, baseConfig, {
    transformRequest: [
      function (data, headers) {
        const loadingText = data ? data.loadingText : ''
        countRequest()
        global.loading.show(loadingText)
        if (data) {
          data.loadingText = undefined
        }
        return JSON.stringify(data)
      },
    ],
    transformResponse: [
      function (data) {
        validAllRequest()
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          showError(data.message, data.code)
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 静默，没有有全屏loading，数据为json格式
const instanceQuiet = axios.create(
  Object.assign({}, baseConfig, {
    transformRequest: [
      function (data, headers) {
        return JSON.stringify(data)
      },
    ],
    transformResponse: [
      function (data) {
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          showError(data.message, data.code)
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 静默，没有全屏loading，数据为form-data格式
const instanceQuietForm = axios.create(
  Object.assign({}, baseConfig, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    transformRequest: [
      function (data, headers) {
        let ret = ''
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        if (ret.length > 0) {
          ret = ret.substr(0, ret.length - 1)
        }
        return ret
      },
    ],
    transformResponse: [
      function (data) {
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          showError(data.message, data.code)
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 非静默，有全屏loading，数据为form-data格式
const instanceForm = axios.create(
  Object.assign({}, baseConfig, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    transformRequest: [
      function (data, headers) {
        countRequest()
        const loadingText = data ? data.loadingText : ''
        global.loading.show(loadingText)
        if (data) {
          data.loadingText = undefined
        }
        let ret = ''
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      },
    ],
    transformResponse: [
      function (data) {
        validAllRequest()
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          showError(data.message, data.code)
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 静默，没有有全屏loading，数据为json格式，上传文件
const instanceQuietFile = axios.create(
  Object.assign({}, baseConfig, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: [
      function (data, headers) {
        const param = new FormData()
        for (const key in data) {
          data[key] !== undefined && param.append(key, data[key])
          if (key === 'file') {
          }
        }
        return param
      },
    ],
    transformResponse: [
      function (data) {
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 静默，没有有全屏loading，没有错误提示，数据为json格式
const instanceQuietNoError = axios.create(
  Object.assign({}, baseConfig, {
    transformRequest: [
      function (data, headers) {
        return JSON.stringify(data)
      },
    ],
    transformResponse: [
      function (data) {
        // 如果返回的结果没有code，将被直接返回
        data = toJSON(data)
        if (data && data.code && data.code !== '0') {
          if (
            data.code === '100000004' ||
            data.message === '用户或用户注册公司不存在' ||
            data.message === '用户没有登录'
          ) {
            logout()
          }
        }
        return data
      },
    ],
  }),
)

// 检测网络是否连接
// function validNetWork (cancel) {
//   console.log(NetInfo)
//   NetInfo.isConnected.fetch().done((isConnected) => {
//     console.log(isConnected, '============>isConnected')
//     if (!isConnected) {
//       global.alert({
//         content: '网络异常，请检查网络连接'
//       })
//       return cancel('网络异常，请检查网络连接')
//     }
//   })
// }

instance.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    // return request
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)

instanceQuiet.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    // return request
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)

instanceForm.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    const isShenHe = (await StorageUtil.get('isShenHe')) || ''
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    // console.log('user/SSOlogin' + request.url + request.data)
    if (request.data && request.data.code) {
      const xCaptchaPicKey = (await StorageUtil.get('x_captcha_pic_key')) || ''
      request.headers['x-captcha-pic-code'] = request.data.code || ''
      request.headers['x-captcha-pic-key'] = xCaptchaPicKey || ''
    }
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)
instanceQuietForm.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    // return request
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)

instanceQuietFile.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    // return request
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)

instanceQuietNoError.interceptors.request.use(
  async function (request) {
    // let cancel
    // // 设置cancelToken对象
    // request.cancelToken = new axios.CancelToken(function (c) {
    //   cancel = c
    // })
    // // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    // validNetWork(cancel)
    // return request
    const isShenHe = await StorageUtil.get('isShenHe')
    const defaultUrl = isShenHe === '1' ? shenheBaseUrl : baseUrl
    request.url = request.url.indexOf('http') > -1 ? request.url : defaultUrl + request.url
    request = setRequestHeader(request)
    return request
  },
  function (error) {
    return Promise.reject(error)
  },
)

function showLog(response) {
  if (response) {
    console.log(response.config.url, response, '==========>ajax')
  }
}

instance.interceptors.response.use(
  function (response) {
    handleSetCookie()
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    validAllRequest()
    error = validErrorCode(error)
    showError(error.message)
    return Promise.reject(error)
  },
)

instanceQuiet.interceptors.response.use(
  function (response) {
    handleSetCookie()
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    error = validErrorCode(error)
    showError(error.message)
    return Promise.reject(error)
  },
)

instanceForm.interceptors.response.use(
  function (response) {
    handleSetCookie()
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    validAllRequest()
    error = validErrorCode(error)
    showError(error.message)
    return Promise.reject(error)
  },
)

instanceQuietForm.interceptors.response.use(
  function (response) {
    handleSetCookie()
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    error = validErrorCode(error)
    showError(error.message)
    return Promise.reject(error)
  },
)

instanceQuietFile.interceptors.response.use(
  function (response) {
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    error = validErrorCode(error)
    return Promise.reject(error)
  },
)

instanceQuietNoError.interceptors.response.use(
  function (response) {
    handleSetCookie()
    showLog(response)
    return response
  },
  function (error) {
    showLog(error.response)
    error = validErrorCode(error)
    return Promise.reject(error)
  },
)

export { instance, instanceQuiet, instanceForm, instanceQuietForm, instanceQuietFile, instanceQuietNoError }
