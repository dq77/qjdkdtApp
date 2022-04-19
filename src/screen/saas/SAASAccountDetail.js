import React, { PureComponent } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp } from '../../utils/screenUtil'

class SAASAccount extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      person: {
        memberName: '',
        mobile: '',
        departmentTreeName: '',
        remark: '',
      },
    }
  }

  componentDidMount() {
    console.log(this.props.navigation.state)
    this.setState({
      person: this.props.navigation.state.params.detail,
    })
  }

  delete = () => {}

  render() {
    const { navigation } = this.props
    const { memberName, mobile, departmentTreeName, remark } = this.state.person
    return (
      <View style={styles.container}>
        <NavBar title={memberName} navigation={navigation} rightIcon={null} />
        <View style={styles.personItem}>
          <View style={styles.title}>
            <Text style={styles.name}>{memberName}</Text>
            {/* <Text style={styles.editText}>编辑</Text> */}
          </View>
          <Text style={styles.summary}>电话：{mobile}</Text>
          <Text style={styles.summary}>职位：{departmentTreeName || '管理员'}</Text>
          <Text style={styles.summary}>备注：{remark}</Text>
        </View>
        {/* <StrokeBtn
          text="删除"
          style={styles.deleteButton}
          onPress={this.delete}
          fontStyle={{ color: '#F55849', fontSize: dp(30) }}
        /> */}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(SAASAccount)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  personItem: {
    backgroundColor: '#fff',
    paddingVertical: dp(40),
    paddingHorizontal: dp(30),
    margin: dp(40),
    borderRadius: dp(16),
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  name: {
    color: '#2D2926',
    fontSize: dp(32),
  },
  summary: {
    color: '#91969A',
    fontSize: dp(28),
    marginBottom: dp(20),
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dp(25),
  },
  editText: {
    color: '#1A97F6',
    fontSize: dp(30),
  },
  deleteButton: {
    borderRadius: dp(48),
    borderColor: '#A7ADB0',
    marginLeft: DEVICE_WIDTH * 0.05,
  },
})
