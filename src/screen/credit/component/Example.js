import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import Swiper from 'react-native-swiper'
import Touchable from '../../../component/Touchable'
import { DEVICE_WIDTH, getRealDP as dp } from '../../../utils/screenUtil'
import Color from '../../../utils/Color'
import { assign, injectUnmount } from '../../../utils/Utility'
import PhotoModal from '../../../component/PhotoModal'
/**
 * 资料示例
 */
@injectUnmount
class Example extends PureComponent {
  static defaultProps = {
    creditIteId: '',
    exampleList: []
  }

  static propTypes = {
    creditIteId: PropTypes.node.isRequired,
    exampleList: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      currentExample: {},
      imageData: [],
      modalVisible: false,
      curentImage: ''
    }
    this.showPhoto = this.showPhoto.bind(this)
  }

  showPhoto (modalVisible, index) {
    this.setState({
      modalVisible,
      curentImage: index || index === 0 ? index : ''
    })
  }

  componentDidMount () {
    // global.loading.show()
    const { exampleList, creditIteId } = this.props
    let done = 0
    const imageData = []
    creditIteId && exampleList.map((item) => {
      if (item.id === creditIteId) {
        if (item.templateList) {
          item.templateList && item.templateList.map(async (templateList, index) => {
            imageData.push(templateList.url)
            if (index === item.templateList.length - 1) {
              this.setState({
                imageData
              })
            }
            Image.getSize(templateList.url, async (width, height) => {
              const ratio = width / height
              const pWidth = DEVICE_WIDTH * 0.20
              item.templateList[index].width = pWidth
              item.templateList[index].height = pWidth / ratio
              done++
              if (done === item.templateList.length) {
                await this.setState({
                  currentExample: item
                })
                // global.loading.hide()
              }
            })
          })
        } else {
          this.setState({
            currentExample: item
          })
        }
      }
    })
  }

  render () {
    const { navigation } = this.props
    return (
      <View>
        {JSON.stringify(this.state.currentExample) !== '{}' ? (
          <View style={styles.exampleWarp}>
            <View style={styles.exampleTitle}>
              <Text style={styles.exampleTitleText}>{`资料说明：${this.state.currentExample.text}`}</Text>
            </View>
            {this.state.currentExample.templateList ? (
              <View style={styles.exampleContent}>
                {this.state.currentExample.templateList.map((exampleItem, i) => {
                  return (
                    <View style={styles.exampleItem} key={i}>
                      {this.state.currentExample.templateList.length > 1 ? (
                        <Text style={styles.exampleName}>{exampleItem.title}</Text>
                      ) : (
                        null
                      )
                      }
                      <View style={styles.exampleContentDetail}>
                        <Touchable style={{ ...styles.exampleContentDetailImg, width: exampleItem.width, height: exampleItem.height }} onPress={() => this.showPhoto(true, i)}>
                          <Image style={{ ...styles.exampleContentDetailImg, width: exampleItem.width, height: exampleItem.height }} source={{ uri: exampleItem.url }}></Image>
                          <View style={{ ...styles.exampleTextWarp, width: exampleItem.width, height: exampleItem.height }}>
                            <Text style={styles.exampleText}>{'示例'}</Text>
                          </View>
                        </Touchable>
                        <Text style={styles.exampleContentDetailText}>{`照片要求：${exampleItem.text}`}</Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            ) : (
              null
            )
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
  exampleWarp: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.WHITE
  },
  exampleItem: {
    borderBottomWidth: dp(1),
    borderColor: Color.SPLIT_LINE
  },
  exampleTitle: {
    width: DEVICE_WIDTH,
    backgroundColor: Color.DEFAULT_BG,
    paddingHorizontal: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(15)
  },
  exampleTitleText: {
    color: Color.TEXT_LIGHT,
    fontSize: dp(32)
  },
  exampleContent: {
    paddingLeft: dp(30),
    paddingBottom: dp(30),
    paddingRight: dp(15)
  },
  exampleName: {
    fontSize: dp(30),
    marginTop: dp(30)
  },
  exampleContentDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: dp(30)
  },
  exampleContentDetailImg: {
    flex: 1,
    width: DEVICE_WIDTH * 0.2,
    height: dp(100)
  },
  exampleContentDetailText: {
    fontSize: dp(30),
    width: DEVICE_WIDTH * 0.7
  },
  exampleTextWarp: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: DEVICE_WIDTH * 0.2,
    position: 'absolute',
    left: 0,
    top: 0
  },
  exampleText: {
    fontSize: dp(30),
    color: Color.WHITE,
    textAlign: 'center'
  }
})

export default Example
