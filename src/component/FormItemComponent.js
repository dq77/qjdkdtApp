import React, { PureComponent } from 'react'
import { View, StyleSheet, Text, TextInput } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from '../component/Touchable'
import Iconfont from '../iconfont/Icon'
import { toAmountStr } from '../utils/Utility'
import Color from '../utils/Color'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../utils/screenUtil'

export default class FormItemComponent extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    keyboardType: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    onPress: PropTypes.func,
    editable: PropTypes.bool,
    showArrow: PropTypes.bool,
    showStar: PropTypes.bool,
    maxLength: PropTypes.number
  }

  static defaultProps = {
    title: '',
    placeholder: '',
    keyboardType: 'default',
    editable: true,
    showArrow: false,
    showStar: false,
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
        <Text style={[styles.name, this.props.titleStyle]}>
          {this.props.title}
          {this.props.showStar
            ? <Text style={{ color: 'red' }}> *</Text>
            : null}

        </Text>
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
          placeholderTextColor={Color.TEXT_LIGHT} />
        {this.props.editable ? null : <Touchable onPress={this.props.onPress} style={styles.touchItem}></Touchable>}
        {
          this.props.showArrow
            ? <Iconfont name={'arrow-right'} size={dp(24)} />
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
    height: dp(120),
    paddingHorizontal: dp(30),
    backgroundColor: 'white'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  },
  name: {
    width: DEVICE_WIDTH * 0.28,
    paddingRight: dp(30),
    fontWeight: 'bold',
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  }
})
