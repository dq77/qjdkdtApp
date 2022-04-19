export const defaultEnv = ''
export const version = '3.1.0.1'

let defaultUrl
let mobileUrl
let creditUrl
switch (defaultEnv) {
  case 'dev':
    defaultUrl = 'https://dev.qjdchina.com'
    mobileUrl = 'https://mobile-dev.qjdchina.com'
    creditUrl = 'https://dev-credit.qjdchina.com'
    break
  case 'dev193':
    defaultUrl = 'https://dev193.qjdchina.com'
    mobileUrl = 'https://dev193mobile.qjdchina.com'
    break
  case 'test':
    defaultUrl = 'https://test.qjdchina.com'
    mobileUrl = 'https://mobile-test.qjdchina.com'
    creditUrl = 'https://test-credit.qjdchina.com'
    break
  case 'proxy':
    defaultUrl = 'https://proxy.qjdchina.com'
    mobileUrl = 'https://proxy-mobile.qjdchina.com'
    break
  case 'pres':
    defaultUrl = 'https://pres.qjdchina.com'
    mobileUrl = 'https://presmobile.qjdchina.com'
    creditUrl = 'https://prescredit.qjdchina.com'
    break
  case 'qa5':
    defaultUrl = 'https://qa5.qjdchina.com'
    break
  case 'saas':
    defaultUrl = 'https://test-project-factory.qjdidc.com'
    break
  default:
    defaultUrl = 'https://www.qjdchina.com'
    // defaultUrl = 'https://wx.zhuozhuwang.com'
    mobileUrl = 'https://mobile.qjdchina.com'
    creditUrl = 'https://credit.qjdchina.com'
    break
}

// mobileUrl = 'http://10.1.61.27:3000'

export const baseUrl = defaultUrl
// shenghe 中的固定地址
export const shenheBaseUrl = 'https://pres.qjdchina.com'

export const webUrl = mobileUrl

export const creditMobileUrl = creditUrl

export const imgUrl = `${defaultUrl}/ofs/weixin/project/loadFile?buzKey=`

// 商品
export const goodsImgUrl = `${defaultUrl}/fs/file/download?fileKey=`

// 默认错误消息
export const defaultError = '系统繁忙，请稍后重试'

// 在线客服
export const customerServiceUrl =
  'https://imxcx1.7x24cc.com/phone_webChat.html?accountId=N000000015742&chatId=9f786243-297b-45cc-b209-85bb49e0cfff&nickName='

// 转发合同末尾文案
export const endText =
  '€请复制该文字内容后，打开仟金顶app，完成合同签署。app下载地址：https://www.qjdchina.com/download'

// 转发合同开始文案
export function startText(contractName) {
  return `【${contractName}】请及时处理您的委托，以下为加密内容€`
}

// 加密混淆库
// export const pwd = '叆唵圙堽夑奊媁孧寷尌尠尲屪敳匘巭巼幑廗彘'
// export const pwd = '!·`.,;|[]'
export const pwd = '∝·²º¹³'

// 默认经纬度
export const lng = '120.200617'
export const lat = '30.188496'
