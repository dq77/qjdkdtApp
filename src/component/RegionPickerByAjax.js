import React, { Component } from 'react'
import { StyleSheet, Text, View, TextInput, Keyboard } from 'react-native'
import { DEVICE_WIDTH, DEVICE_HEIGHT, getRealDP as dp } from '../utils/screenUtil'
import Touchable from './Touchable'
import Color from '../utils/Color'
import { deepCopy } from '../utils/Utility'
import PropTypes from 'prop-types'
import Picker from 'react-native-picker'
import store from '../store/index'
import ajaxStore from '../utils/ajaxStore'
export default class RegionPickerByAjax extends Component {
    static defaultProps = {
      fontSize: 32,
      monitorChange: false,
      selectedValue: [],
      hint: '请选择省市区',
      onPickerConfirm: () => {},
      onOpen: () => {},
      onClose: () => {}
    }

    static propTypes = {
      fontSize: PropTypes.number,
      hint: PropTypes.string,
      monitorChange: PropTypes.bool,
      selectedValue: PropTypes.node,
      onPickerConfirm: PropTypes.func,
      onOpen: PropTypes.func,
      onClose: PropTypes.func
    }

    static getDerivedStateFromProps (nextProps, prevProps) {
      if (nextProps.monitorChange && nextProps.selectedValue && nextProps.selectedValue.length) {
        return {
          selectedValue: nextProps.selectedValue,
          label: nextProps.selectedValue.join(' ')
        }
      } else {
        return {}
      }
    }

    constructor (props) {
      super(props)
      this.state = {
        ajaxData: [],
        areaData: [],
        label: '',
        selectedValue: []
      }
      this.showCityDialog = this.showCityDialog.bind(this)
    }

    showCityDialog () {
      Keyboard.dismiss()
      Picker.init({
        pickerData: this.state.areaData,
        pickerConfirmBtnText: '确定',
        pickerCancelBtnText: '取消',
        pickerTitleText: '请选择省市区',
        pickerBg: [255, 255, 255, 1],
        pickerConfirmBtnColor: [89, 192, 56, 1],
        pickerCancelBtnColor: [102, 102, 102, 1],
        pickerTitleColor: [153, 153, 153, 1],
        pickerFontSize: 18,
        pickerTextEllipsisLen: 20,
        selectedValue: this.state.selectedValue,
        onPickerConfirm: (data, pickedIndex) => {
          const result = {
            provinceCode: this.state.newAreaData[pickedIndex[0]].id,
            cityCode: this.state.newAreaData[pickedIndex[0]].child[pickedIndex[1]].id,
            areaCode: this.state.newAreaData[pickedIndex[0]].child[pickedIndex[1]].child[pickedIndex[2]].id,
            label: `${data[0]} ${data[1]} ${data[2]}`,
            provinceName: this.state.newAreaData[pickedIndex[0]].name,
            cityName: this.state.newAreaData[pickedIndex[0]].child[pickedIndex[1]].name,
            areaName: this.state.newAreaData[pickedIndex[0]].child[pickedIndex[1]].child[pickedIndex[2]].name
          }
          this.setState({
            label: result.label,
            selectedValue: data
          })
          this.props.onPickerConfirm(result)
          this.props.onClose()
        },
        onPickerCancel: (data, pickedIndex) => { this.props.onClose() },
        onPickerSelect: (data, pickedIndex) => { }
      })
      this.props.onOpen()
      Picker.show()
    }

    hide () {
      Picker.hide()
    }

    /**
     * 根据AreaData生成picker所需的数据
     */
    createAreaData (chinaData) {
      const data = []
      for (let i = 0; i < chinaData.length; i++) {
        const city = []
        if (chinaData[i].child) {
          for (let j = 0; j < chinaData[i].child.length; j++) {
            const area = []
            if (chinaData[i].child[j].child) {
              for (let k = 0; k < chinaData[i].child[j].child.length; k++) {
                area[k] = chinaData[i].child[j].child[k].name
              }
              const cityJson = {}
              cityJson[chinaData[i].child[j].name] = area
              city.push(cityJson)
            }
          }
          const dataJson = {}
          dataJson[chinaData[i].name] = city
          data.push(dataJson)
        }
      }
      this.setState({ areaData: data })
    }

    async getAreaData () {
      const state = store.getState()
      const data = state.cache.areaData
      // console.log(data, 'areaData')
      // const areas = []
      // // const res = await ajaxStore.common.getAreaData()
      // // if (res.data && res.data.code === '0') {
      // data.map((pItem, pKey) => {
      //   areas.push({
      //     id: pItem.code,
      //     name: pItem.name,
      //     child: []
      //   })
      //   if (pItem.citys.length) {
      //     pItem.citys.map((cItem, cKey) => {
      //       areas[pKey].child.push({
      //         id: cItem.code,
      //         name: cItem.name,
      //         child: []
      //       })
      //       if (cItem.areas.length) {
      //         cItem.areas.map((aItem, aKey) => {
      //           areas[pKey].child[cKey].child.push({
      //             id: aItem.code,
      //             name: aItem.name
      //           })
      //         })
      //       }
      //     })
      //   }
      // })
      await this.setState({
        ajaxData: data
      })
      // }
    }

    async componentDidMount () {
      if (this.props.selectedValue && this.props.selectedValue.length) {
        this.setState({
          selectedValue: this.props.selectedValue,
          label: this.props.selectedValue.join(' ')
        })
      }
      await this.getAreaData()
      const newAreaData = deepCopy(this.state.ajaxData)
      // const newAreaData = deepCopy(AreaData)
      // console.log(newAreaData, 'newAreaData')
      this.setState({
        newAreaData
      })
      this.createAreaData(newAreaData)
    }

    // static getDerivedStateFromProps (nextProps, prevState) {
    //   console.log('-------------------------')
    //   console.log(prevState.selectedValue)
    //   console.log(nextProps.selectedValue)
    //   const selectedValue = nextProps.selectedValue
    //   if (prevState.selectedValue !== selectedValue) {
    //     return {
    //       selectedValue: selectedValue
    //     }
    //   }
    //   return null
    // }

    render () {
      return (
        <View>
          <TextInput
            placeholder={this.props.hint || '请选择省市区'}
            placeholderTextColor={'#ddd'}
            style={[styles.textInput, this.props.style, { fontSize: this.props.fontSize ? dp(this.props.fontSize) : dp(32) }]}
            editable={false}
            value={this.state.label}
          />
          <Touchable style={styles.touchItem} onPress={this.showCityDialog}></Touchable>
        </View>
      )
    }
}

const styles = StyleSheet.create({
  textInputWrapper: {
    paddingHorizontal: dp(25),
    marginTop: dp(60),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: dp(10)
  },
  textInput: {
    width: DEVICE_WIDTH * 0.65,
    height: dp(80),
    marginVertical: dp(10),
    backgroundColor: 'white',
    paddingRight: dp(60),
    color: Color.TEXT_MAIN,
    textAlign: 'left',
    fontSize: dp(32)
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: dp(35)
  },
  touchItem: {
    position: 'absolute',
    top: dp(8),
    left: dp(-15),
    width: DEVICE_WIDTH * 0.84,
    height: '100%'
  }
})
