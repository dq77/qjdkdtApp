import React, { PureComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { PropTypes } from 'prop-types'
import Touchable from '../../../component/Touchable'
import Iconfont from '../../../iconfont/Icon'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../../utils/screenUtil'

export default class FoldComponent extends PureComponent {
    static propTypes = {
      status: PropTypes.bool.isRequired,
      title: PropTypes.string.isRequired
    }

    static defaultProps = {
      status: true,
      title: ''
    }

    constructor (props) {
      super(props)
      this.state = {
        status: this.props.status
      }
    }

    render () {
      const { children, title } = this.props
      return (
        <View>
          <Touchable isPreventDouble={false}
            onPress={() => {
              this.setState({ status: !this.state.status })
            }}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Iconfont name={this.state.status ? 'icon-arrow-up' : 'icon-arrow-down'} size={dp(60)} />
            </View>
          </Touchable>
          {this.state.status ? children : null}
          <View style={styles.separate} />
        </View>
      )
    }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dp(30),
    paddingTop: dp(40)
  },
  title: {
    fontSize: dp(33),
    fontWeight: 'bold'
  },
  separate: {
    height: dp(1.5),
    backgroundColor: '#e5e5e5'
  }
})
