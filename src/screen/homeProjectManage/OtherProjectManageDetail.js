import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Image
} from 'react-native'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Touchable from '../../component/Touchable'
import Iconfont from '../../iconfont/Icon'
import ajaxStore from '../../utils/ajaxStore'
import NavBar from '../../component/NavBar'
import Color from '../../utils/Color'
import PhotoModal from '../../component/PhotoModal'
import { handleBackPress, toAmountStr, toDateStr } from '../../utils/Utility'
import { open } from '../../utils/FileReaderUtils'
import { defaultUrl, baseUrl } from '../../utils/config'

class OtherProjectManageDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalVisible: false,
      imageData: [],
      curentImage: 0,
      itemInfo: {},
      categoryName: '',
      subclassName: ''
    }
  }

  async componentDidMount () {
    await this.itemInfo()
    await this.categorySubclass()
  }

  async categorySubclass () {
    const res = await ajaxStore.company.categorySubclass()
    if (res.data && res.data.code === '0') {
      const info = res.data.data || []
      info.forEach(element => {
        if (element.enumCode === this.state.itemInfo.category) {
          element.subsets.forEach(element1 => {
            if (element1.enumCode === this.state.itemInfo.subclass) {
              this.setState({
                categoryName: element.enumName,
                subclassName: element1.enumName
              })
            }
          })
        }
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async itemInfo () {
    const params = this.props.navigation.state.params

    const res = await ajaxStore.company.itemInfo({ id: params.id })
    if (res.data && res.data.code === '0') {
      const data = res.data.data || []
      this.setState({
        itemInfo: data
      })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  async showPhoto (modalVisible, index, cateCodeIndex) {
    // this.setState({
    //   imageData,
    //   modalVisible,
    //   curentImage: index || index === 0 ? index : ''
    // })

    if (this.state.fileSuffix.toString().indexOf('image') > -1) {
      global.loading.show()
      await open(`${baseUrl}/ofs/front/file/getUploadFile.htm?filePath=${this.state.fileKey}`)
      global.loading.hide()
    } else {
      global.alert.show({
        content: '??????????????????????????????jpg???jpeg???gif???bmp???png????????????????????????????????????????????????????????????'
      })
    }
  }

  async clickLook (fileKey, fileSuffix) {
    await this.setState({
      fileKey: fileKey || '',
      fileSuffix
    })

    this.showPhoto()
  }

  render () {
    const { navigation } = this.props
    const { itemInfo, categoryName, subclassName } = this.state

    return (
      <View style={styles.container}>
        <NavBar title={'????????????'} navigation={navigation} />
        <FlatList
          data={itemInfo.itemFiles}
          renderItem={data => (
            <View style={[styles.bgBigView, { marginTop: dp(30) }]}>
              <View style={styles.bgView} >
                <Text style={styles.titleBG}>???????????????</Text>
                <Text style={styles.decBG}>{data.item.fileType === '001' ? '??????' : data.item.fileType === '002' ? '??????' : data.item.fileType === '003' ? '??????' : ''}</Text>
              </View>
              {data.item.fileName.length > 0 && <View style={styles.bgView} >
                <Text style={styles.titleBG}>???????????????</Text>
                <Text style={styles.decBG}>{data.item.fileName || ''}</Text>
              </View>}
              <View style={styles.bgView} >
                <Text style={styles.titleBG}>?????????</Text>
                <Touchable onPress={() => {
                  this.clickLook(data.item.fileKey || '', data.item.fileSuffix || '')
                }} style={[styles.decBG, { color: '#2A6EE7' }]}>
                  <Text style={[styles.decBG, { color: '#2A6EE7' }]}>{data.item.attachmentName || ''}</Text>
                </Touchable>
              </View>
            </View>)}
          keyExtractor={(item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            () => {
              return <View style={{ height: dp(100) }} />
            }
          }
          ListHeaderComponent={
            () => {
              return <View style={styles.bgBigView}>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.itemSort === '001' ? '????????????' : '???????????????'}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{toDateStr(itemInfo.gmtCreated || '', 'yyyy-MM-dd')}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.itemCode || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.evaluate || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.itemName || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.itemType === '001' ? '????????????' : itemInfo.itemType === '002' ? '????????????' : itemInfo.itemType === '003' ? '???????????????' : itemInfo.itemType === '004' ? '??????????????????' : itemInfo.itemType === '005' ? '???????????????' : itemInfo.itemType === '006' ? '??????????????????' : ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{`${itemInfo.provinceName || ''}${itemInfo.cityName || ''}${itemInfo.areaName || ''}`}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.party || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>??????????????????????????????</Text>
                  <Text style={styles.decBG}>{toAmountStr(itemInfo.amtContract, 2, true) || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>???????????????</Text>
                  <Text style={styles.decBG}>{`${categoryName || ''}-${subclassName || ''}`}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>????????????????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.cycle || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>????????????????????????</Text>
                  <Text style={styles.decBG}>{toAmountStr(itemInfo.amtBudget, 2, true) || ''}</Text>
                </View>
                <View style={styles.bgView} >
                  <Text style={styles.titleBG}>??????????????????</Text>
                  <Text style={styles.decBG}>{itemInfo.itemLeader || ''}</Text>
                </View>
              </View>
            }
          }
        />
        {this.state.imageData.length && this.state.modalVisible && this.state.curentImage !== '' ? (
          <PhotoModal imageData={this.state.imageData} modalVisible={this.state.modalVisible} curentImage={this.state.curentImage} cancel={() => this.showPhoto(false)} />
        ) : (null)
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DEFAULT_BG
  },
  bgBigView: {
    marginHorizontal: dp(30),
    paddingTop: dp(10),
    paddingBottom: dp(30),
    backgroundColor: 'white',
    borderRadius: dp(16)
  },
  bgView: {
    marginHorizontal: dp(30),
    marginTop: dp(20),
    backgroundColor: 'white',
    borderRadius: dp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconBG: {
    marginLeft: dp(36),
    marginTop: dp(45),
    marginBottom: dp(24)
  },
  titleBG: {
    fontSize: dp(28),
    color: '#91969A'
  },
  decBG: {
    flex: 1,
    fontSize: dp(28),
    color: '#2D2926',
    textAlign: 'right'
  }
})

export default OtherProjectManageDetail
