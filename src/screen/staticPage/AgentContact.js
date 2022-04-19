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
  getRealDP as dp
} from '../../utils/screenUtil'
import { connect } from 'react-redux'
import moment from 'moment'

class AgentContact extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      account: ''
    }
  }

  componentDidMount () {
    this.setState({
      name: this.props.navigation.state.params ? this.props.navigation.state.params.name : '',
      account: this.props.navigation.state.params ? this.props.navigation.state.params.account : ''
    })
  }

  render () {
    const { navigation, companyInfo } = this.props
    return (
      <View >
        <NavBar title={'个人代付授权协议'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>单位承诺书</Text>
            <View style={styles.list}>
              <View style={styles.item}>
                <View style={styles.content}>
                  <Text style={styles.text}>仟金顶网络科技科技有限公司：</Text>
                </View>
                <View style={styles.content}>
                  <Text style={styles.text}>&emsp;&emsp;我司（公司名称）<Text style={{ ...styles.text, ...styles.underline }}>{companyInfo.corpName}</Text>允许本司员工<Text style={{ ...styles.text, ...styles.underline }}>{this.state.name}</Text>，代表我司与贵司交易往来中的应付款，对我司员工在办理上述事项过程中
所签署的有关文件,我司均予以认可,并承担相应的法律责任。</Text>
                  <Text style={styles.text}>&emsp;&emsp;代理人：{this.state.name}</Text>
                  <Text style={styles.text}>&emsp;&emsp;代理账户：{this.state.account}</Text>
                  <Text style={{ ...styles.text, ...styles.textRight }}>{moment().format('YYYY年MM月DD日')}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: dp(30),
    paddingBottom: dp(200)
  },
  title: {
    fontSize: dp(38),
    marginBottom: dp(35),
    color: '#3b3c5a'
  },
  list: {

  },
  item: {
    marginBottom: dp(40)
  },
  caption: {
    fontSize: dp(34),
    color: '#3b3c5a',
    marginBottom: dp(30)
  },
  content: {

  },
  text: {
    fontSize: dp(30),
    color: '#596c94',
    marginBottom: dp(10),
    lineHeight: dp(46)
  },
  underline: {
    textDecorationLine: 'underline'
  },
  textRight: {
    textAlign: 'right'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AgentContact)
