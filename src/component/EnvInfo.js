
import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../utils/screenUtil'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'
import PropTypes from 'prop-types'
import Color from '../utils/Color'
import { defaultEnv } from '../utils/config'

class EnvInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      env: defaultEnv
    }
  }

  componentDidMount () {

  }

  render () {
    return (
      <View style={this.props.style}>
        {
          this.state.env
            ? <Text style={styles.text}>{`env：${this.state.env}`}</Text>
            : null
        }
      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
  },
  text: {
    textAlign: 'center',
    color: '#666666'
  }
})

export default EnvInfo
