import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from './Touchable'
import Iconfont from '../iconfont/Icon'
import { toAmountStr } from '../utils/Utility'
import Color from '../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../utils/screenUtil'

export default class FormItem2Component extends PureComponent {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    placeholderTextColor: PropTypes.string,
    keyboardType: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    onPress: PropTypes.func,
    editable: PropTypes.bool,
    showArrow: PropTypes.bool,
    leftIcon: PropTypes.string,
    maxLength: PropTypes.number
  }

  static defaultProps = {
    placeholder: '',
    placeholderTextColor: '#A7ADB0',
    keyboardType: 'default',
    leftIcon: null,
    editable: true,
    showArrow: false,
    maxLength: 100
  }

  constructor (props) {
    super(props)
    this.state = {
      value: this.props.value
    }
  }

  // static getDerivedStateFromProps (props, state) {
  //   if (props.value !== state.value) {
  //     return { value: props.value }
  //   }
  //   return null
  // }

  render () {
    return (
      <View style={[styles.line, this.props.style]}>
        {this.props.leftIcon &&
        <Iconfont style={{ marginRight: dp(10) }} name={this.props.leftIcon} size={dp(32)} color={'#A7ADB0'} />
        }
        <TextInput
          style={styles.input}
          onChangeText={text => {
            if (this.props.onChangeText) {
              this.props.onChangeText(text)
            }
          }}
          editable={this.props.editable}
          value={this.props.value}
          multiline={true}
          maxLength={this.props.maxLength}
          keyboardType={this.props.keyboardType}
          placeholder={this.props.placeholder}
          placeholderTextColor={this.props.placeholderTextColor} />
        {this.props.editable ? null : <Touchable onPress={this.props.onPress} style={styles.touchItem}></Touchable>}
        {
          this.props.showArrow
            ? <Iconfont name={'arrow2x'} size={dp(24)} />
            : null
        }
      </View >
    )
  }
}

const styles = StyleSheet.create({
  touchItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(90),
    paddingHorizontal: dp(30),
    backgroundColor: 'white',
    borderColor: '#D8DDE2',
    borderWidth: dp(2),
    borderRadius: dp(16)
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_MAIN,
    padding: 0,
    margin: 0
  },
  name: {
    width: DEVICE_WIDTH * 0.28,
    paddingRight: dp(30),
    fontWeight: 'bold',
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  }
})
