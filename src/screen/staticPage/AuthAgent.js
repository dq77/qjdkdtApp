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
        <NavBar title={'用户授权协议'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.list}>
              <View style={styles.item}>
                <View style={styles.content}>
                  <Text style={styles.text}>《用户授权协议》(以下简称“本协议”)是<Text style={{ ...styles.text, ...styles.underline }}>仟金顶网络科技有限公司</Text>（以下简称“仟金顶公司”，运营平台“仟金顶”、“仟金顶服务网站”）与用户（以下简称“您”）所订立的有效合约。您通过网络页面点击确认或以其他方式选择接受本协议，即表示您与仟金顶网络科技有限公司已达成协议并同意接受本协议的全部约定内容。</Text>
                  <Text style={styles.text}>在接受本协议之前，请您仔细阅读本协议的全部内容（特别是以粗体下划线标注的内容）。如您不同意本协议的内容，或无法准确理解本协议任何条款的含义，请不要进行确认及后续操作，一旦确认即视为您同意本协议全部内容。如果您对本协议有疑问的，请通过400-612-1666进行询问，其将向您解释。</Text>
                </View>
                <View style={styles.content}>
                  <Text style={styles.text}><Text style={{ ...styles.text, ...styles.bold }}>1、 您授权本网站采用电子合同的方式在本网站平台与您签订您与本网站平台进行交易需订立的协议，该协议可以有一份或者多份并且每一份具有同等法律效力。</Text>您或您的代理人根据有关协议及本网站的相关规则在本网站确认签署的电子合同即视为您本人真实意愿并以您本人名义签署的合同，具有法律效力。<Text style={{ ...styles.text, ...styles.bold }}>您应妥善保管自己的账户密码等账户信息，</Text>1、您通过前述方式订立的电子合同对合同各方具有法律约束力，您不得以账户密码等账户信息被盗用或其他理由否认已订立的合同的效力或不按照该等合同履行相关义务。</Text>
                  <Text style={styles.text}><Text style={{ ...styles.text, ...styles.bold }}>2、 您确认在签署文件之前已经仔细阅读过文件的相关内容并予以理解和接受，您认可您通过本网站签署的电子合同条款的相关内容。</Text></Text>
                  <Text style={styles.text}><Text style={{ ...styles.text, ...styles.bold }}>3、 您根据本协议以及本网站的相关规则签署电子合同后，不得擅自修改该合同。</Text>3、本网站向您提供电子合同的保管查询、核对等服务，如对电子合同真伪或电子合同的内容有任何疑问，您可通过本网站的相关系统板块查阅有关合同并进行核对。如对此有任何争议，应以本网站记录的合同为准。</Text>
                  <Text style={styles.text}><Text style={{ ...styles.text, ...styles.bold }}>4、 您认可您在签订电子合同过程中提交的实名认证资料，并同意通过短信验证码的方式进行意愿认证，以及认可因上述操作产生的电子证据；若因合同履行产生纠纷，就合同签订过程中产生的电子证据您不得提出异议，该证据可直接作为纠纷处理依据。</Text></Text>
                  <Text style={styles.text}>5、 数字证书服务</Text>
                  <Text style={styles.text}>5.1、 本协议中数字证书是指：由第三方CA认证机构签发的用以在交易中识别您身份的电子文件；“e签宝”是指：杭州天谷信息科技有限公司运营的平台，是仟金顶公司或仟金顶服务网站平台的电子签名技术服务提供商。</Text>
                  <Text style={styles.text}>5.2、您同意接受仟金顶公司或仟金顶服务网站平台提供本协议约定的服务，并同意在使用电子签名时，授权仟金顶公司或仟金顶服务网站平台将本人的身份信息资料提交给e签宝和第三方CA认证机构，由<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>协助您向 “e 签宝”平台申请由ＣＡ认证机构生成、“e 签宝”代发的数字证书。如因您提供的申请数字证书的资料有误导致不利后果，由您承担因此产生的全部法律责任。</Text>
                  <Text style={styles.text}>5.3、您的数字证书只能在数字证书有效期限内、在仟金顶服务网站使用。您的证书信息在证书有效期限内变更的，应当及时书面告知<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>，并终止使用该证书。您停止使用<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>提供服务时，应及时向<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>申请吊销数字证书，仟金顶公司收到您提交的申请后应协助您向 “e 签宝”平台申请吊销您的数字证书。证书有效期限届满，您需要继续使用的，应当及时办理证书更新手续。</Text>
                  <Text style={styles.text}>5.4、若您为企业用户，用户分立、合并、解散、注销、宣告破产或倒闭，或被撤销营业执照等主体资格终止的，应于上述情况发生时的5个工作日内通过书面形式告知<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>或仟金顶服务网站平台及e签宝申请撤销数字证书，并终止使用该证书，否则，因未尽该通知义务给<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>或仟金顶服务网站平台及e签宝造成损失的，由您全部赔偿。</Text>
                  <Text style={styles.text}>5.5、您在本站进行注册，接受<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>协助向 “e 签宝”申请由ＣＡ认证机构生成、“e  签宝”代发的数字证书的行为，视为您已经明确同意使用数字证书对本网站上的电子合同进行签署。您使用数字证书在本网站签署的电子合同，无论您本人签署或您授权他人签署，均代表您本人真实意愿，由您承担完全责任。</Text>
                  <Text style={styles.text}>5.6、您对数字证书享有独立的使用权。您使用证书产生的权利，由您享有；您使用证书产生的义务、责任，由您承担。您有下列情形之一，<Text style={{ ...styles.text, ...styles.underline }}>仟金顶公司</Text>有权协助“e 签宝”向第三方认证机构申请吊销证书并不承担任何责任，因此给“e 签宝”和<Text style={{ ...styles.text, ...styles.underline }}>仟金顶网络科技有限公司</Text>造成损失，您应全部赔偿。</Text>
                  <Text style={styles.text}>（1）、您向<Text style={{ ...styles.text, ...styles.underline }}>仟金顶服务网站</Text>提供的资料或者信息不真实、不完整或者不准确的。</Text>
                  <Text style={styles.text}>（2）、您证书的信息有变更，未终止使用该证书并通知<Text style={{ ...styles.text, ...styles.underline }}>仟金顶服务网站</Text>及e签宝的。</Text>
                  <Text style={styles.text}>（3）、您超过证书的有效期限及应用范围使用证书的。</Text>
                  <Text style={styles.text}>（4）、甲方公司分立、合并、解散、注销、宣告破产或倒闭，被撤销营业执照等主体资格终止的。</Text>
                  <Text style={styles.text}>（5）、您使用证书用于违法、犯罪活动的。</Text>
                  <Text style={styles.text}>5.7、您有义务审慎管理其注册账户ID及数字证书，自行负责账户的保密和安全。非因<Text style={{ ...styles.text, ...styles.underline }}>仟金顶网络科技有限公司</Text>原因导致会员账户遭他人非法使用的，<Text style={{ ...styles.text, ...styles.underline }}>仟金顶网络科技有限公司</Text>不承担任何责任。</Text>
                  <Text style={styles.text}>6、本协议未尽事宜，参照《仟金顶用户协议》执行；《仟金顶用户协议》与本协议有冲突的，以本协议为准。</Text>
                  <Text style={styles.text}>7、双方在履行本协议的过程中，如发生争议，应协商解决。协商不成的，任何一方均可向仟金顶公司住所地有管辖权的人民法院提起诉讼。</Text>
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
  },
  bold: {
    fontWeight: 'bold'
  }
})

const mapStateToProps = state => {
  return {
    companyInfo: state.company
  }
}

export default connect(mapStateToProps)(AgentContact)
