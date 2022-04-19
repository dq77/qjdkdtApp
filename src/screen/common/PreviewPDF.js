import React, { PureComponent } from 'react'
import { StyleSheet, Dimensions, View, Text } from 'react-native'
import { baseUrl } from '../../utils/config'
import NavBar from '../../component/NavBar'
import { getRealDP as dp, DEVICE_WIDTH } from '../../utils/screenUtil'

import Pdf from 'react-native-pdf'
let time = new Date().getTime()
export default class PreviewPDF extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      page: 0, // 当前第几页
      numberOfPages: 0 // pdf 共有几页
    }
  }

  componentDidMount () {
    time = new Date().getTime()
  }

  render () {
    const params = this.props.navigation.state.params
    const buzKey = params && params.buzKey
    const version = params && params.version
    const contractCode = params && params.contractCode

    let uri
    switch (version) {
      case '2': // 新版 pdf 路径
        uri = `${baseUrl}/proof/file/rawFile?fileKey=${buzKey}`
        break
      case '3': // 代理人合同
        uri = `${baseUrl}/ofs/front/contract/previewContract?contractCode=${contractCode}&time=${time}`
        break
      default: // pdf 路径
        uri = `${baseUrl}/ofs/weixin/project/loadFile?buzKey=${buzKey}`
        break
    }
    const source = {
      uri,
      cache: true, // 是否需要缓存，默认 false
      expiration: 0, // 缓存文件过期秒数，默认 0 为未过期
      method: 'GET', // 默认 'GET'，请求 url 的方式
      headers: {} // 当 uri 是网址时的请求标头
    }
    // const source = require('./test.pdf');  // ios only
    // const source = {uri:'bundle-assets://test.pdf'};

    // const source = {uri:'file:///sdcard/test.pdf'};
    // const source = {uri:"data:application/pdf;base64,..."};
    console.log(source)
    return (
      <View style={styles.container}>
        <NavBar title={'查看文件'} navigation={this.props.navigation} />
        <Pdf
          source={source}
          fitWidth={true} // 默认 false，若为 true 则不能将 fitWidth = true 与 scale 一起使用
          fitPolicy={2} // 0:宽度对齐，1：高度对齐，2：适合两者（默认）
          page={1} // 初始化第几页，1 开始
          scale={1} // 页面加载出来 pdf 时的比例
          minScale={1} // 最小模块
          maxScale={3} // 最大模块
          onLoadComplete={(numberOfPages, filePath, width, height, tableContents) => {
            console.log(`number of pages: ${numberOfPages}`) // 总页数
            console.log(`number of filePath: ${filePath}`) // 本地返回的路径
            console.log('number of width: ', JSON.stringify(width))
            console.log(`number of height: ${JSON.stringify(height)}`)
            console.log(`number of tableContents: ${tableContents}`)
          }}
          onPageChanged={(page, numberOfPages) => {
            this.setState({
              page: page,
              numberOfPages: numberOfPages
            })
            console.log(`current page: ${page}`) // 返回当前页
            console.log(`current numberOfPages: ${numberOfPages}`) // 返回总页面，其实在 onLoadComplete() 可以获取到
            // 所以不建议在这里获取总页数，因为页面滑动就会触发
          }}
          onError={(error) => {
            console.log(error)
          }}
          password='' // pdf 密码，如果密码错误，会触发 onError() 并显示密码不正确或需要密码
          spacing={10} // 页面之间的间隔大小，默认为 10
          horizontal={false} // 横向
          activityIndicator={null}
          // activityIndi​​catorProps={{backgroundColor:'red'}} 文档里有这个属性，但是我看源码里面没有
          enablePaging={false} // 在屏幕上只能显示一页
          enableAntialiasing={true} // 在低分辨率屏幕上改进渲染，针对 Android 4.4 上可能会出现的一些问题
          enableRTL={false} // 倒序滑动
          enableAnnotationRendering={true} // 启用渲染注视，iOS 仅支持初始设置，不支持实时更改
          onLoadProgress={(number) => console.log(number)} // 加载时回调，返回加载进度（0-1）
          onPageSingleTap={() => {
            console.log('页面被点击的时候回调')
          }}
          onScaleChanged={() => {
            console.log('页面缩放的时候回调')
          }}
          style={styles.pdf} />
        <Text style={styles.textAlign}>
          当前第 {this.state.page} 页，共 {this.state.numberOfPages} 页
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textAlign: {
    textAlign: 'center',
    paddingVertical: dp(20)
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
})
