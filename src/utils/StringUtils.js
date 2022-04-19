// 判断字符是否为空的方法
export function isEmpty (obj) {
  if (typeof obj === 'undefined' || obj === 'undefined' || obj === null || obj === '') {
    return true
  } else {
    return false
  }
}
