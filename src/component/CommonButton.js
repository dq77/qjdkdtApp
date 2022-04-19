import { PropTypes } from 'prop-types'
import React, { PureComponent } from 'react'
import { Text } from 'react-native'
import Touchable from '../component/Touchable'
import Color from '../utils/Color'
import { DEVICE_WIDTH, getRealDP as dp } from '../utils/screenUtil'

export class SolidBtn extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    fontStyle: PropTypes.object,
  }

  static defaultProps = {
    disabled: false,
    fontStyle: {},
  }

  render() {
    return (
      <Touchable
        style={{
          backgroundColor: !this.props.disabled ? Color.THEME : Color.BTN_DISABLE,
          width: DEVICE_WIDTH * 0.9,
          paddingVertical: dp(28),
          borderRadius: dp(10),
          ...this.props.style,
        }}
        disabled={this.props.disabled}
        onPress={this.props.onPress}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: dp(35),
            ...this.props.fontStyle,
          }}
        >
          {this.props.text}
        </Text>
      </Touchable>
    )
  }
}

export class StrokeBtn extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    color: PropTypes.string,
  }

  static defaultProps = {
    disabled: false,
  }

  render() {
    return (
      <Touchable
        style={
          !this.props.disabled
            ? {
                width: DEVICE_WIDTH * 0.9,
                paddingVertical: dp(28),
                borderRadius: dp(10),
                borderColor: Color.THEME,
                borderWidth: 1,
                ...this.props.style,
              }
            : {
                width: DEVICE_WIDTH * 0.9,
                paddingVertical: dp(28),
                borderRadius: dp(10),
                borderColor: '#a0a0a0',
                borderWidth: 1,
                ...this.props.style,
              }
        }
        disabled={this.props.disabled}
        onPress={this.props.onPress}
      >
        <Text
          style={
            !this.props.disabled
              ? {
                  color: this.props.color || Color.THEME,
                  textAlign: 'center',
                  fontSize: dp(35),
                  ...this.props.fontStyle,
                }
              : {
                  color: '#a0a0a0',
                  textAlign: 'center',
                  fontSize: dp(35),
                }
          }
        >
          {this.props.text}
        </Text>
      </Touchable>
    )
  }
}
