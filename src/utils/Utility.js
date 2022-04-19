import { BackHandler, Platform, ToastAndroid } from 'react-native'
import CookieManager from 'react-native-cookies'
import { NavigationActions, StackActions } from 'react-navigation'
import ajaxStore from './ajaxStore'
import { onKillProcess } from './AnalyticsUtil'
import Color from './Color'
import { baseUrl } from './config'
import { getRealDP as dp, getStatusBarHeight, isAndroid } from './screenUtil'
import StorageUtil from './storageUtil'
/**
 * 吐司方法
 * @param info 吐司文案信息
 * @return
 */
export function showToast(info) {
  if (isAndroid) {
    return ToastAndroid.show(info, ToastAndroid.SHORT)
  }
  if (!global.toast) {
    return
  }
  global.toast.show(info)
}
/**
 * 切换根tab到登录页面
 * @param navigation
 */
export function resetLoginPage(navigation) {
  if (global.currentScreen !== 'Home') {
    const resetAction = {
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'MainTabs',
        }),
        // NavigationActions.navigate({ routeName: 'Login' })
      ],
    }
    navigation.dispatch(StackActions.reset(resetAction))
  }
}

/**
 * 获取默认"react-navigation"导航样式
 * @param navigation
 * @param backgroundColor
 * @return 导航样式
 */
export function getNavBarStyles(navigation, backgroundColor = Color.THEME) {
  return {
    title: navigation.getParam('title', ''),
    headerStyle: Platform.select({
      ios: {
        backgroundColor: backgroundColor,
        height: dp(110),
      },
      android: {
        backgroundColor: backgroundColor,
        height: dp(110) + getStatusBarHeight(),
        paddingTop: getStatusBarHeight(),
      },
    }),
  }
}

/**
 * 表单验证方法
 */
export function formValid(rule, data) {
  var result = true
  var msg = ''
  rule.every(n => {
    if (n.required) {
      if (Array.isArray(data[n.id])) {
        if (!data[n.id].length) {
          msg = n.requiredErrorMsg || '请上传' + n.name
          result = false
          return false
        } else {
          return true
        }
      } else if (!data[n.id]) {
        msg = n.requiredErrorMsg || '请填写' + n.name
        result = false
        return false
      } else if (n.reg) {
        if (n.reg.test(data[n.id])) {
          return true
        } else {
          msg = n.regErrorMsg || '请填写正确' + n.name
          result = false
          return false
        }
      } else {
        return true
      }
    } else {
      if (data[n.id] && n.reg) {
        if (n.reg.test(data[n.id])) {
          return true
        } else {
          msg = n.regErrorMsg || '请填写正确' + n.name
          result = false
          return false
        }
      } else {
        return true
      }
    }
  })
  return { result: result, msg: msg }
}
/**
 * 合并对象
 */
export function assign(form, obj) {
  const data = Object.assign({}, form, obj)
  return data
}

export async function handleSetCookie() {
  const res = await CookieManager.get(baseUrl)
  console.log('1111111 save success')
  for (const key in res) {
    if (key === 'x-captcha-pic-key') {
      await StorageUtil.save('x_captcha_pic_key', res['x-captcha-pic-key']).then(res => {
        if (!res) {
          console.log('x_captcha_pic_key save success')
        }
      })
    }
  }
}

/**
 * 深度拷贝
 */
// export function deepCopy (p, c) {
//   c = c || {}
//   for (var i in p) {
//     if (typeof p[i] === 'object') {
//       c[i] = (p[i].constructor === Array) ? [] : {}
//       deepCopy(p[i], c[i])
//     } else {
//       c[i] = p[i]
//     }
//   }
//   return c
// }

export function deepCopy(obj) {
  // 只拷贝对象
  if (typeof obj !== 'object') return
  // 根据obj的类型判断是新建一个数组还是一个对象
  var newObj = obj instanceof Array ? [] : {}
  for (var key in obj) {
    // 遍历obj,并且判断是obj的属性才拷贝
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      // 判断属性值的类型，如果是对象递归调用深拷贝
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key]
    }
  }
  return newObj
}

// 可将数字字符串转换为带逗号的数字字符串，并可指定要保留的小数位
export function toAmountStr(v, deci, withThousand) {
  const _withThousand = deci === true || withThousand === true
  if (v !== undefined && v !== null) {
    v = Number(v)
    if (deci > 0) {
      const str = v.toFixed(deci)
      const arr = str.split('.')
      if (_withThousand) {
        const a = arr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
          return s + ','
        })
        return `${a}.${arr[1]}`
      } else {
        return str
      }
    } else {
      const a = v.toString().replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
        return s + ','
      })
      return _withThousand ? a : v.toString()
    }
  } else {
    return ''
  }
}
// 简单加密
export function enc(str, key) {
  var length = key.length
  var keyList = key.split('')
  var s = ''
  var bit
  var bit1
  var bit2
  var bit3
  var bit4
  for (var i = 0; i < str.length; i++) {
    bit = str.charCodeAt(i)
    bit1 = bit % length
    bit = (bit - bit1) / length
    bit2 = bit % length
    bit = (bit - bit2) / length
    bit3 = bit % length
    bit = (bit - bit3) / length
    bit4 = bit % length
    s += keyList[bit4] + keyList[bit3] + keyList[bit2] + keyList[bit1]
  }
  return s
}

// 简单解密
export function dec(str, key) {
  var length = key.length
  var bit
  var bit1
  var bit2
  var bit3
  var bit4
  var j = 0
  var s = new Array(Math.floor(str.length / 4))
  var result = []
  bit = s.length
  for (var i = 0; i < bit; i++) {
    bit1 = key.indexOf(str.charAt(j))
    j++
    bit2 = key.indexOf(str.charAt(j))
    j++
    bit3 = key.indexOf(str.charAt(j))
    j++
    bit4 = key.indexOf(str.charAt(j))
    j++
    s[i] = bit1 * length * length * length + bit2 * length * length + bit3 * length + bit4
    result.push(String.fromCharCode(s[i]))
  }
  return result.join('')
}

// 隐藏身份证号
export function blurIdCard(idcard) {
  if (!idcard) {
    return ''
  }
  var xxx = ''
  for (var i = 0; i < idcard.length - 10; i++) {
    xxx = xxx + '*'
  }
  idcard = idcard.toString().split('')
  idcard.splice(6, idcard.length - 10, xxx)
  return idcard.join('')
}
// 隐藏银行卡号
export function bankIdCard(idcard) {
  if (!idcard) {
    return ''
  }
  var xxx = ''
  for (var i = 0; i < idcard.length - 8; i++) {
    xxx = xxx + '*'
  }
  idcard = idcard.toString().split('')
  idcard.splice(4, idcard.length - 8, xxx)
  return idcard.join('')
}
// 隐藏手机号
export function iphoneNo(idcard) {
  if (!idcard) {
    return ''
  }
  var xxx = ''
  for (var i = 0; i < idcard.length - 6; i++) {
    xxx = xxx + '*'
  }
  idcard = idcard.toString().split('')
  idcard.splice(3, idcard.length - 6, xxx)
  return idcard.join('')
}

// 解析url
export function getQuery(url, name) {
  const domain = url.split('?')[0] || ''
  const params = url.split('?')[1] || ''
  const names = params.split('&')
  const data = []
  names.map((item, key) => {
    if (item.split('=')[0]) {
      data[item.split('=')[0]] = item.split('=')[1]
    }
  })
  return name ? data[name] : data
}

export function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/ // 非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/ // 负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true
  } else {
    return false
  }
}

export function handleBackPress(navigation) {
  if (navigation.isFocused()) {
    // 判断   该页面是否处于聚焦状态
    // console.log('hxl', navigation)
    if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
      // 最近2秒内按过back键，可以退出应用。
      // return false;
      onKillProcess()
      BackHandler.exitApp() // 直接退出APP
    } else {
      this.lastBackPressed = Date.now()
      showToast('再按一次退出应用') // 提示
      return true
    }
  }
}
export function updateUrlParams(uri, key, value) {
  if (!value) {
    return uri
  }
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  var separator = uri.indexOf('?') !== -1 ? '&' : '?'
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2')
  } else {
    return uri + separator + key + '=' + value
  }
}

// 将数字金额转换为繁体
export function convertCurrency(n) {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['圆', '万', '亿', '万亿'],
    ['', '拾', '佰', '仟'],
  ]
  const head = n < 0 ? '负' : ''
  let n2 = n
  n2 = Math.abs(n)
  if (n2.toString() === 'NaN') return false
  let s = ''
  fraction.forEach((item, i) => {
    s += (digit[Math.floor(n2 * 10 * 10 ** i) % 10] + fraction[i]).replace(/零./, '')
  })
  s = s || '整'
  n2 = Math.floor(n2)
  unit[0].forEach(frist => {
    if (n2 > 0) {
      let p = ''
      unit[1].forEach(second => {
        if (n2 > 0) {
          p = digit[n2 % 10] + second + p
          n2 = Math.floor(n2 / 10)
        }
      })
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + frist + s
    }
  })
  let result =
    head +
    s
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整') // (零.)匹配零后边任意字符 如：零佰零千
  if (/(万亿)\S*(亿)/.test(result)) {
    result = result.replace(/万亿/, '万')
  }
  return result
}

// 加法
export function addNum(num1, num2) {
  var sq1, sq2, m
  try {
    sq1 = num1.toString().split('.')[1].length
  } catch (e) {
    sq1 = 0
  }
  try {
    sq2 = num2.toString().split('.')[1].length
  } catch (e) {
    sq2 = 0
  }
  var maxLen = Math.max(sq1, sq2)
  m = Math.pow(10, maxLen)
  return Number(((num1 * m + num2 * m) / m).toFixed(maxLen))
}

// 减法
export function delNum(num1, num2) {
  var sq1, sq2, m
  try {
    sq1 = num1.toString().split('.')[1].length
  } catch (e) {
    sq1 = 0
  }
  try {
    sq2 = num2.toString().split('.')[1].length
  } catch (e) {
    sq2 = 0
  }
  m = Math.pow(10, Math.max(sq1, sq2))
  return (num1 * m - num2 * m) / m
}

/**
 * 防止异步操作导致的内存泄漏修饰器
 */
export function injectUnmount(target) {
  // 改装componentWillUnmount，销毁的时候记录一下
  const next = target.prototype.componentWillUnmount
  target.prototype.componentWillUnmount = function () {
    if (next) next.call(this, ...arguments)
    this.unmount = true
    global.loading.hide()
    // this.time && clearTimeout(this.time)
  }
  // 对setState的改装，setState查看目前是否已经销毁
  const setState = target.prototype.setState
  target.prototype.setState = function () {
    if (this.unmount) return
    setState.call(this, ...arguments)
  }
}

// 判断是否含有emoji图标

export function isEmojiCharacterInString(substring) {
  for (let i = 0; i < substring.length; i++) {
    const hs = substring.charCodeAt(i)
    if (hs >= 0xd800 && hs <= 0xdbff) {
      if (substring.length > 1) {
        const ls = substring.charCodeAt(i + 1)
        const uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000
        if (uc >= 0x1d000 && uc <= 0x1f77f) {
          return true
        }
      }
    } else if (substring.length > 1) {
      const ls = substring.charCodeAt(i + 1)
      if (ls === 0x20e3) {
        return true
      }
    } else {
      if (hs >= 0x2100 && hs <= 0x27ff) {
        return true
      } else if (hs >= 0x2b05 && hs <= 0x2b07) {
        return true
      } else if (hs >= 0x2934 && hs <= 0x2935) {
        return true
      } else if (hs >= 0x3297 && hs <= 0x3299) {
        return true
      } else if (
        hs === 0xa9 ||
        hs === 0xae ||
        hs === 0x303d ||
        hs === 0x3030 ||
        hs === 0x2b55 ||
        hs === 0x2b1c ||
        hs === 0x2b1b ||
        hs === 0x2b50
      ) {
        return true
      }
    }
  }
}
// 去除字符串所有的空格 is_global === g  代表所有的空格。不带代表首尾空格
export function trim(str, isGlobal) {
  var result
  result = str.replace(/(^\s+)|(\s+$)/g, '')
  if (isGlobal.toLowerCase() === 'g') {
    result = result.replace(/\s/g, '')
  }
  return result
}
// 时间格式化
export function toDateStr(str, fmt) {
  function compatibleTime(str) {
    str = str.replace(/-/gi, '/')
    if (str.substr(str.length - 1).toUpperCase() === 'Z' || str.indexOf('.000+0000') > -1) {
      var h
      str.replace(/z/gi, '').replace(/(.*).000+0000/, '')
      var regH = /(T| )(\d\d:\d\d:\d\d)(\.\d+)?/
      h = str.match(regH)
      h = h && h[2]
      str = new Date(Date.parse(str.slice(0, str.indexOf('T')) + ' ' + h)).getTime() + 8 * 60 * 60 * 1000
      return str
    }
    return str.replace(/T/g, ' ')
  }
  var o, d
  if (str instanceof Date) {
    d = str
  } else if (str > 0) {
    // 兼容后端返回 字符串 的 数字时间戳
    d = new Date(Number(str))
  } else {
    if (str === '' || str == null || str === undefined) {
      return ''
    }
    // debugger
    str = compatibleTime(str)
    d = new Date(str)
  }
  o = {
    'M+': d.getMonth() + 1, // 月份
    'd+': d.getDate(), // 日
    'h+': d.getHours(), // 小时
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
    'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds(), // 毫秒
  }
  if (fmt) {
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
      }
    }
  }
  return fmt
}
// 过滤只能输入小数点和数字
export function numberAndPoint(str) {
  const val =
    str
      .toString()
      // eslint-disable-next-line no-useless-escape
      .replace(/[^\d^\.?]+/g, '')
      .replace(/^0+(\d)/, '$1')
      .replace(/^\./, '0.')
      .match(/^\d*(\.?\d{0,2})/g)[0] || ''
  return val
}

export function clearNoNum(obj) {
  obj = obj.replace(/[^\d.]/g, '') // 清除“数字”和“.”以外的字符
  obj = obj.replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
  obj = obj.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
  obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') // 只能输入两个小数
  if (obj.indexOf('.') < 0 && obj !== '') {
    // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    obj = parseFloat(obj)
  }
  return obj
}

export async function getProductDetail(productCode, companyId) {
  let content = ''
  const res = await ajaxStore.order.getProductInfo({ productCode })
  if (res.data && res.data.code === '0') {
    res.data.data.interestRate = JSON.parse(res.data.data.interestRate)
    const productInfo = res.data.data
    const interestRate = productInfo.interestRate

    content = `预付货款比例：${productInfo.downPaymentRatio}%\n赊销期限：最长不超过${interestRate.cycle}天\n手续费：赊销货款 x ${productInfo.buzProcedureRatio}%\n`

    if (productInfo.fundSource === '1') {
      // 宜宾银行
      const rateVoList = productInfo.serviceStageRate ? JSON.parse(productInfo.serviceStageRate).rateVoList : []
      if (rateVoList && rateVoList.length > 0) {
        content += '仟金顶服务费率：\n'
        for (var k = 0; k < rateVoList.length; k++) {
          content += `第${k + 1}阶段：${rateVoList[k].dateFrom}天-${rateVoList[k].dateEnd}天，年化费率${
            rateVoList[k].stairRate
          }%\n`
        }
      }
    } else {
      content += `服务费率：${productInfo.serviceRate}%\n`
    }

    content += `开票主体：${
      !productInfo.makeTicketObject
        ? ''
        : productInfo.makeTicketObject === 'QJD_INFORMATION'
        ? '仟金顶信息科技有限公司'
        : '仟金顶网络科技有限公司'
    }\n开票税率：${productInfo.makeTicketRatio ? productInfo.makeTicketRatio + '%' : ''}\n`

    // 信息系统服务费率
    let rateVoList = null
    const vipRate = await ajaxStore.order.companyStageRateContrast({ productCode, companyId })
    if (vipRate.data && vipRate.data.code === '0' && vipRate.data.data.useSource !== '0') {
      // 会员比价费率
      rateVoList = JSON.parse(vipRate.data.data.useRate).rateVoList
      if (rateVoList && rateVoList.length > 0) {
        content += '信息系统服务费率：\n'
        for (var j = 0; j < rateVoList.length; j++) {
          if (vipRate.data.data.useSource === '1' || vipRate.data.data.useSource === '2') {
            content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${
              interestRate.rateVoList[j].stairRate
            }%)\n会员专享费率${rateVoList[j].stairRate}%\n综合服务费率${
              vipRate.data.data.comprehensiveServiceFreeRate
            }%`
          } else {
            // 信用认证会员费率
            content += `第${j + 1}阶段：${rateVoList[j].dateFrom}天-${rateVoList[j].dateEnd}天，(原年化费率${
              interestRate.rateVoList[j].stairRate
            }%)\n信用认证会员费率${rateVoList[j].stairRate}%\n综合服务费率${
              vipRate.data.data.comprehensiveServiceFreeRate
            }%`
          }
        }
      }
    } else {
      // 产品
      rateVoList = interestRate.rateVoList
      if (rateVoList && rateVoList.length > 0) {
        content += '信息系统服务费率：\n'
        for (var i = 0; i < rateVoList.length; i++) {
          content += `第${i + 1}阶段：${rateVoList[i].dateFrom}天-${rateVoList[i].dateEnd}天，年化费率${
            rateVoList[i].stairRate
          }%`
          if (rateVoList.length - 1 !== i) {
            content += '\n'
          }
        }
      }
    }
  }
  return content
}
