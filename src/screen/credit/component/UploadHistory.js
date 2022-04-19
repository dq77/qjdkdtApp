import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount } from '../../../utils/Utility'
import PhotoModal from '../../../component/PhotoModal'
import { connect } from 'react-redux'
import { getAuthFile } from '../../../actions'
import Iconfont from '../../../iconfont/Icon'
import { imgUrl } from '../../../utils/config'

/**
 * 上传历史
 */
@injectUnmount
class UploadHistory extends PureComponent {
  static defaultProps = {
    creditItem: {}
  }

  static propTypes = {
    creditItem: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      currentItem: [],
      imageData: [],
      modalVisible: false,
      curentImage: '',
      checkVisible: false,
      done: false,
      deleted: [],
      showHisTory: false
    }
    this.showPhoto = this.showPhoto.bind(this)
    this.setCheckVisible = this.setCheckVisible.bind(this)
    this.deletePhoto = this.deletePhoto.bind(this)
  }

  showPhoto (modalVisible, index, cateCodeIndex) {
    const imageData = []
    this.state.currentItem.map((item, i) => {
      if (i === cateCodeIndex) {
        item.historyItem.map((item2, j) => {
          imageData.push(`${imgUrl}${item2.filePath}`)
        })
      }
    })
    this.setState({
      imageData,
      modalVisible,
      curentImage: index || index === 0 ? index : ''
    })
  }

  async getFilesById () {
    const authFileId = this.props.creditItem.authFileId
    const cateCode = this.props.creditItem.cateCode
    const historyItem = []
    const authFileItems = []
    const currentItem = []
    let showHisTory = false
    global.loading.show()
    authFileId.map(async (item, index) => {
      // global.loading.show()
      await getAuthFile({
        authFileId: item,
        cateCode: cateCode[index]
      })
      this.props.authFileItems.map(async (item2, key) => {
        if (item2.authFileId === item) {
          currentItem.push(item2)
        }
        // 由于异步原因可能导致顺序错乱，固按cateCode从小到大排序以对应页面顺序
        currentItem.sort((a, b) => {
          const x = parseInt(a.cateCode.slice(1))
          const y = parseInt(b.cateCode.slice(1))
          return x - y
        })
        await this.setState({
          currentItem,
          done: true
        })
        this.props.onLoad(currentItem)
        if (currentItem.length) {
          currentItem.map((list, i) => {
            const normalItems = list.historyItem.filter((item, j) => {
              return !item.idCardNo
            })
            if (normalItems.length && !list.isIdcard) {
              showHisTory = true
            }
          })
          if (this.state.currentItem.length === authFileId.length) {
            await this.setState({
              showHisTory
            })
            global.loading.hide()
          }
        }
      })
    })
  }

  setCheckVisible () {
    this.setState({
      checkVisible: !this.state.checkVisible
    })
  }

  async deletePhoto (uploadId, currentItemIndex, historyItemIndex) {
    const deleted = this.state.deleted
    let currentItem = []
    currentItem = currentItem.concat(this.state.currentItem)
    deleted.push(uploadId)
    currentItem.map((item, i) => {
      if (i === currentItemIndex) {
        item.historyItem.map((item2, j) => {
          if (j === historyItemIndex) {
            currentItem[i].historyItem.splice(j, 1)
          }
        })
      }
    })
    await this.setState({
      currentItem,
      deleted
    })
    this.props.onChange(this.state.deleted)
  }

  componentDidMount () {
    this.getFilesById()
  }

  componentWillUnmount () {
  }

  render () {
    return (
      <View>
        {this.state.showHisTory ? (
          <View style={styles.historyWrap}>
            <View style={styles.historyTitle}>
              <Text style={styles.historyTitleText}>{'历史资料'}</Text>
            </View>
            {!this.state.checkVisible ? (
              <Touchable style={styles.historyCheckBtn} onPress={() => this.setCheckVisible()}>
                <Text style={styles.historyCheckText}>{'展开查看'}</Text>
                <Iconfont style={styles.arrowIcon} name={'icon-arrow-down'} size={dp(70)} />
              </Touchable>
            ) : (
              <Touchable style={styles.historyCheckBtn} onPress={() => this.setCheckVisible()}>
                <Text style={styles.historyCheckText}>{'收起'}</Text>
                <Iconfont style={styles.arrowIcon} name={'icon-arrow-up'} size={dp(70)} />
              </Touchable>
            )}
            {this.state.checkVisible ? (
              <View>
                {
                  this.state.currentItem.map((currentItem, i) => {
                    const history = currentItem.historyItem.map((historyItem, j) => {
                      return (
                        <View key={j}>
                          { !historyItem.idCardNo ? (
                            <Touchable onPress={() => this.showPhoto(true, j, i)}>
                              <Image style={styles.historyImg} source={{ uri: `${imgUrl}${historyItem.filePath}` }}></Image>
                            </Touchable>
                          ) : (null)}
                          {!historyItem.idCardNo && j < currentItem.historyItem.length - currentItem.minImgs ? (
                            <Touchable style={styles.historyDetleteBtn} onPress={() => this.deletePhoto(historyItem.id, i, j)}>
                              <Iconfont name={'icon-del-fork1'} size={dp(50)} />
                            </Touchable>
                          ) : (null)}
                        </View>
                      )
                    })
                    return (
                      <View style={styles.historyDetailWarp} key={i}>
                        {
                          currentItem.title ? (
                            <Text style={styles.historyDetailTitle}>{currentItem.title}</Text>
                          ) : (
                            null
                          )
                        }
                        <View style={styles.historyImgWarp}>{history}</View>
                      </View>
                    )
                  })
                }
              </View>
            ) : (null)
            }
            {this.state.imageData.length && this.state.modalVisible && this.state.curentImage !== '' ? (
              <PhotoModal imageData={this.state.imageData} modalVisible={this.state.modalVisible} curentImage={this.state.curentImage} cancel={() => this.showPhoto(false)} />
            ) : (null)
            }
          </View>
        ) : (null)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  historyWrap: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.WHITE
  },
  historyTitle: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.DEFAULT_BG,
    paddingHorizontal: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(15)
  },
  historyTitleText: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(32)
  },
  historyCheckBtn: {
    paddingVertical: dp(15),
    paddingHorizontal: dp(30),
    flexDirection: 'row',
    alignItems: 'center'
  },
  historyCheckText: {
    fontSize: dp(30)
  },
  historyDetailWarp: {
    paddingVertical: dp(15),
    paddingHorizontal: dp(30),
    borderTopWidth: dp(1),
    borderTopColor: Color.SPLIT_LINE
  },
  historyDetailTitle: {
    fontSize: dp(30),
    color: Color.TEXT_LIGHT,
    marginBottom: dp(15)
  },
  historyImg: {
    width: DEVICE_WIDTH * 0.2,
    height: DEVICE_WIDTH * 0.2,
    marginRight: dp(30),
    marginVertical: dp(15)
  },
  historyImgWarp: {
    width: DEVICE_WIDTH,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  historyDetleteBtn: {
    position: 'absolute',
    right: dp(5),
    top: dp(-10)
  }
})

const mapStateToProps = state => {
  return {
    authFileItems: state.credit.authFileItems
  }
}

export default connect(mapStateToProps)(UploadHistory)
