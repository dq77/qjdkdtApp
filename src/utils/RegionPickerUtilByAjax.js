import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, Keyboard } from 'react-native'
import { DEVICE_WIDTH, DEVICE_HEIGHT, getRealDP as dp } from './screenUtil'
import Touchable from '../component/Touchable'
import Color from './Color'
import { deepCopy, showToast } from './Utility'
import { localAreaData } from './RegionByAjax'
import PropTypes from 'prop-types'
import Picker from 'react-native-picker'
import store from '../store/index'

export default class RegionPickerUtilByAjax {
  static init () {
    const state = store.getState()
    const AreaData = state.cache.areaData.length ? state.cache.areaData : localAreaData
    this.areaData = AreaData
    console.log(this.areaData)
    this.newAreaData = deepCopy(AreaData)
    this.createAreaData(this.newAreaData)
    return this
  }

  static setConfirm (onPickerConfirm) {
    this.onPickerConfirm = onPickerConfirm
    return this
  }

  static setOnOpen (onOpen) {
    this.onOpen = onOpen
    return this
  }

  static setOnClose (onClose) {
    this.onClose = onClose
    return this
  }

  static show (selectedValue) {
    console.log(this.areaData, 'this.areaData')
    if (!this.areaData || this.areaData.length <= 0) {
      console.log('数据未初始化')
      return
    }
    Keyboard.dismiss()
    Picker.init({
      pickerData: this.areaData,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择省市区',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: selectedValue,
      onPickerConfirm: (data, pickedIndex) => {
        const result = {
          provinceCode: this.newAreaData[pickedIndex[0]].id,
          cityCode: this.newAreaData[pickedIndex[0]].child[pickedIndex[1]].id,
          areaCode: this.newAreaData[pickedIndex[0]].child[pickedIndex[1]].child[pickedIndex[2]].id,
          label: `${data[0]} ${data[1]} ${data[2]}`
        }
        if (this.onPickerConfirm) { this.onPickerConfirm(result) }
        if (this.onClose) { this.onClose() }
      },
      onPickerCancel: (data, pickedIndex) => { if (this.onClose) { this.onClose() } },
      onPickerSelect: (data, pickedIndex) => { }
    })

    Picker.show()
    if (this.onOpen) { this.onOpen() }
  }

  static hide () {
    Picker.hide()
    if (this.onClose) { this.onClose() }
  }

  /**
     * 根据AreaData生成picker所需的数据
     */
  static createAreaData (chinaData) {
    const data = []
    let child
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
    this.areaData = data
  }
}
