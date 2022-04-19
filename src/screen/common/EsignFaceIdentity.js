import React, { PureComponent } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import Color from '../../utils/Color'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'
import { showToast, formValid, assign } from '../../utils/Utility'
import { connect } from 'react-redux'
import ajaxStore from '../../utils/ajaxStore'
import {
  setFaceExtraData
} from '../../actions'

class EsignFaceIdentity extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'身份认证'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">

        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.WHITE
  }
})

const mapStateToProps = state => {
  return {
    userInfo: state.user.userInfo,
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(EsignFaceIdentity)
