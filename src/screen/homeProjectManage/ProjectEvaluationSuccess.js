import React, { PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  ScrollView,
  View
} from 'react-native'
import NavBar from '../../component/NavBar'
import {
  DEVICE_WIDTH,
  getRealDP as dp,
  DEVICE_HEIGHT
} from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { SolidBtn } from '../../component/CommonButton'
import { connect } from 'react-redux'
import { injectUnmount } from '../../utils/Utility'
@injectUnmount
class ProjectEvaluationSuccess extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentWillUnmount () {
  }

  componentDidMount () {

  }

  render () {
    const { navigation } = this.props
    return (
      <View >
        <NavBar title={'发起评估'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            <Iconfont style={styles.icon} name={'huokegongju-tijiaochenggong'} color={'#17CA5D'} size={dp(200)} />
            <Text style={styles.title}>{'已发起评估，请耐心等待评估结果！'}</Text>
            <View style={styles.btn}>
              <SolidBtn style={styles.btnItem} text={'关闭'} onPress={() => {
                navigation.goBack()
              }} />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  pageMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: dp(200)
  },
  title: {
    fontSize: dp(32),
    width: DEVICE_WIDTH,
    textAlign: 'center',
    marginTop: dp(50),
    marginBottom: dp(30)
  },
  btn: {
    marginTop: dp(80)
  },
  btnItem: {
    marginBottom: dp(30),
    borderRadius: dp(50),
    width: DEVICE_WIDTH * 0.5
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(ProjectEvaluationSuccess)
