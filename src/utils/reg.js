/*
 * @Date: 2021-01-26 13:04:58
 * @LastEditors: 掉漆
 * @LastEditTime: 2021-02-01 18:03:36
 */
export const vPassword = /^[0-9a-zA-Z]{6,16}$/

export const vSmsVerifyCode = /^\d{6}$/

export const vCompanyName = /^[\u4e00-\u9fa5_a-zA-Z0-9_（）_()]{3,30}$/

export const vPhone = /^1(3|4|5|6|7|8|9)\d{9}$/

export const vEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

// export const vChineseName = /^[\u4E00-\u9FA5]{1,5}$/
export const vChineseName = /^[\u4e00-\u9fa5_a-zA-Z0-9_]{1,10}$/

export const vIdcardNumber = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

export const vAmount = /^\d+(\.\d+)?$/

export const vPrice = /^\d+(\.\d{1,2})?$/

export const vNumber = /^[1-9]\d*$/

export const vSpecialChar = /#|\?|=|&/
