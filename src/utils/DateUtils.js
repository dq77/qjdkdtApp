/**
 * 创建日期时间
 */
export function createDateData (startYear, endYear) {
  const date = []
  for (let i = startYear; i < endYear; i++) {
    const month = []
    for (let j = 1; j < 13; j++) {
      const day = []
      if (j === 2) {
        for (let k = 1; k < 29; k++) {
          day.push(k + '')
        }
        if (i % 4 === 0) {
          day.push(29 + '')
        }
      } else if (j in { 1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1 }) {
        for (let k = 1; k < 32; k++) {
          day.push(k + '')
        }
      } else {
        for (let k = 1; k < 31; k++) {
          day.push(k + '')
        }
      }
      const _month = {}
      _month[j + ''] = day
      month.push(_month)
    }
    const _date = {}
    _date[i + ''] = month
    date.push(_date)
  }
  // console.log(JSON.stringify(date))
  return date
}
export function getTimeDifference (date) {
  if (date) {
    // 转换时间
    const regEx = new RegExp('\\-', 'gi')
    const validDateStr = date.replace(regEx, '/')
    const milliseconds = Date.parse(validDateStr)
    var sendTime = new Date(milliseconds)
    // 当前时间
    var nowTime = new Date()
    // 差值
    var date3 = sendTime - nowTime

    // 天
    var days = Math.floor(date3 / (24 * 3600 * 1000))
  } else {
    days = 1
  }

  return days
}

// 获取上月日期
export function getFullDate (targetDate) {
  var nowDate = new Date()
  var fullYear = nowDate.getFullYear()
  var month = nowDate.getMonth() // getMonth 方法返回 0-11，代表1-12月
  var endOfMonth = new Date(fullYear, month + 1, 0).getDate() // 获取本月最后一天

  var D, y, m, d

  y = fullYear
  m = month + 1
  if (targetDate === 1) {
    d = 1
  } else {
    d = endOfMonth
  }

  m = m > 9 ? m : '0' + m
  d = d > 9 ? d : '0' + d
  return y + '-' + m + '-' + d
}

// 获取本月日期
export function getThisFullDate () {
  var nowDate = new Date()
  var fullYear = nowDate.getFullYear()
  var month = nowDate.getMonth() // getMonth 方法返回 0-11，代表1-12月
  var day = nowDate.getDate() // getMonth 方法返回 0-11，代表1-12月

  var D, y, m, d

  y = fullYear
  m = month + 1
  d = day

  m = m > 9 ? m : '0' + m
  d = d > 9 ? d : '0' + d

  console.log(y + '-' + m + '-' + d, 'daasdads')

  return y + '-' + m + '-' + d
}
// 比较时间大小
export function CompareDate (date1, date2) {
  var oDate1 = new Date(date1)
  var oDate2 = new Date(date2)
  console.log(oDate1, oDate2, '3')
  if (oDate1.getTime() > oDate2.getTime()) {
    return true // 第一个大
  } else {
    return false // 第二个大
  }
}

// 格式化日期
export function formatDate (date) {
  var myyear = date.getFullYear()
  var mymonth = date.getMonth() + 1
  var myweekday = date.getDate()

  // if (mymonth < 10) {
  //   mymonth = '0' + mymonth
  // }
  // if (myweekday < 10) {
  //   myweekday = '0' + myweekday
  // }
  return (myyear + '-' + mymonth + '-' + myweekday)
}

// export function transformTime (timestamp = +new Date()) {
//   if (timestamp) {
//     var time = new Date(timestamp)
//     var y = time.getFullYear() // getFullYear方法以四位数字返回年份
//     var M = time.getMonth() + 1 // getMonth方法从 Date 对象返回月份 (0 ~ 11)，返回结果需要手动加一
//     // var M = (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) // getMonth方法从 Date 对象返回月份 (0 ~ 11)，返回结果需要手动加一
//     var d = time.getDate() // getDate方法从 Date 对象返回一个月中的某一天 (1 ~ 31)
//     var h = time.getHours() // getHours方法返回 Date 对象的小时 (0 ~ 23)
//     var m = time.getMinutes() // getMinutes方法返回 Date 对象的分钟 (0 ~ 59)
//     var s = time.getSeconds() // getSeconds方法返回 Date 对象的秒数 (0 ~ 59)
//     return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s
//   } else {
//     return ''
//   }
// }

// 时间戳转时间
export function transformTime (timestamp) {
  // var timestamp = parseInt(timestamp) * 1000
  var D = new Date(timestamp)
  var year = D.getFullYear()// 四位数年份

  var month = D.getMonth() + 1// 月份(0-11),0为一月份
  month = month < 10 ? ('0' + month) : month

  var day = D.getDate()// 月的某一天(1-31)
  day = day < 10 ? ('0' + day) : day

  var hours = D.getHours()// 小时(0-23)
  hours = hours < 10 ? ('0' + hours) : hours

  var minutes = D.getMinutes()// 分钟(0-59)
  minutes = minutes < 10 ? ('0' + minutes) : minutes

  var seconds = D.getSeconds()// 秒(0-59)
  seconds = seconds < 10 ? ('0' + seconds) : seconds
  // var week = D.getDay();//周几(0-6),0为周日
  // var weekArr = ['周日','周一','周二','周三','周四','周五','周六'];

  var now_time = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
  return now_time
}
