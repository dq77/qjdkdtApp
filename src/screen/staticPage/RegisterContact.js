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
import Color from '../../utils/Color'

class RegisterContact extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    const { navigation, userInfo } = this.props
    return (
      <View >
        <NavBar title={'仟金顶用户协议'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Text style={styles.title}>法律条款</Text>
            <View style={styles.list}>
              <View style={styles.item}>
                <Text style={styles.caption}>一、知识产权说明</Text>
                <View style={styles.content}>
                  <Text style={styles.text}>1. 仟金顶网站拥有或已获授权使用仟金顶网站（网址）内所有信息内容（除仟金顶网站会员提交的信息外，包括但不限于文字、图片、软件、音频、视频）的版权。</Text>
                  <Text style={styles.text}>2. 任何被授权的浏览、复制、打印和传播的仟金顶网站内的信息内容都不得被会员用于商业目的且所有信息内容及其任何部分的使用都必须包括此版权声明；</Text>
                  <Text style={styles.text}>3. 仟金顶网站所有的产品、技术与所有程序均属于【仟金顶网络科技有限公司】知识产权。"仟金顶"、“QIANJINDING”以及仟金顶网站其他产品服务名称及相关图形、标识等为仟金顶网站/网筑集团的注册商标。未经仟金顶网站/网筑集团许可，任何人不得擅自（包括但不限于：以非法的方式复制、传播、展示、镜像、上载、下载）使用。否则，仟金顶网站/网筑集团将依法追究法律责任。</Text>
                </View>
              </View>
              <View style={styles.item}>
                <Text style={styles.caption}>二、隐私权保护及授权</Text>
                <View style={styles.content}>
                  <Text style={styles.text}>1. 仟金顶网站对于会员提供的、仟金顶网站自行收集的、经认证的信息将按照本协议予以保护、使用或者披露。会员签署本用户协议即表示同意并授权仟金顶网站可向仟金顶网站关联实体转让会员与仟金顶网站有关的全部或部分权利和义务。未经仟金顶网站事先书面同意，会员不得转让其在本协议项下的任何权利和义务。</Text>
                  <Text style={styles.text}>2. 会员授权仟金顶网站可自其他第三方资料来源收集会员的额外资料，以更好地掌握会员情况，并为会员度身订造仟金顶网站服务、解决争议并有助确保在仟金顶网站进行安全交易。</Text>
                  <Text style={styles.text}>3. 仟金顶网站按照会员在仟金顶网站上的行为自动追踪关于会员的某些资料。在不透露会员的隐私资料的前提下，仟金顶网站有权对整个会员数据库进行分析并对会员数据库进行商业上的利用。</Text>
                  <Text style={styles.text}>4. 会员同意，仟金顶网站可在仟金顶网站的某些网页上使用诸如“Cookies”的资料收集装置。</Text>
                  <Text style={styles.text}>5. 会员同意仟金顶网站可使用关于会员的相关资料（包括但不限于仟金顶网站持有的有关会员的档案中的资料，仟金顶网站从会员目前及以前在仟金顶网站上的活动所获取的其他资料以及仟金顶网站通过其他方式自行收集的资料）以解决争议、对纠纷进行调停。会员同意仟金顶网站可通过人工或自动程序对会员的资料进行评价。</Text>
                  <Text style={styles.text}>6. 仟金顶网站采用行业标准惯例以保护会员的资料。会员因履行本协议提供给仟金顶网站的信息，仟金顶网站不会恶意出售或免费共享给任何第三方，以下情况除外：</Text>
                  <Text style={styles.text}>a、提供独立服务且仅要求服务相关的必要信息的供应商，如印刷厂、邮递公司等；</Text>
                  <Text style={styles.text}>b、具有合法调阅信息权限并从合法渠道调阅信息的政府部门或其他机构，如公安机关、法院；</Text>
                  <Text style={styles.text}>c、仟金顶网站的关联实体；</Text>
                  <Text style={styles.text}>d、经会员或会员授权代表同意的第三方。</Text>
                  <Text style={styles.text}>7.仟金顶网站有义务根据有关法律要求向司法机关和政府部门提供会员的资料。在会员未能按照与仟金顶网站签订的服务协议或者与仟金顶网站其他会员签订的协议等其他法律文本的约定履行自己应尽的义务时，仟金顶网站有权根据自己的判断，或者与该笔交易有关的其他会员的请求披露会员的信息和资料，并做出评论。会员严重违反仟金顶网站的相关规则（包括但不限于会员的付款逾期超过[5]天等）的，仟金顶网站有权对会员提供的及仟金顶网站自行收集的会员的信息和资料编辑入网站黑名单，并将该黑名单对第三方披露，且仟金顶网站有权将会员提交或仟金顶网站自行收集的会员的资料和信息与任何第三方进行数据共享，以便网站和第三方催收逾期款项及对会员的其他申请进行审核之用，由此可能造成的会员的任何损失，仟金顶网站不承担法律责任。</Text>
                </View>
              </View>
              <View style={styles.item}>
                <Text style={styles.caption}>三、会员的守法义务及承诺</Text>
                <View style={styles.content}>
                  <Text style={styles.text}>1. 会员承诺绝不为任何非法目的或以任何非法方式使用仟金顶网站服务，并承诺遵守中国相关法律、法规及一切使用互联网之国际惯例，遵守所有与仟金顶网站服务有关的网络协议、规则和程序。</Text>
                  <Text style={styles.text}>2. 会员同意并保证不得利用仟金顶网站服务从事侵害他人权益或违法之行为，若有违反者应负所有法律责任。上述行为包括但不限于：</Text>
                  <Text style={styles.text}>a、反对宪法所确定的基本原则，危害国家安全、泄漏国家秘密、颠覆国家政权、破坏国家统一的。</Text>
                  <Text style={styles.text}>b、侵害他人名誉、隐私权、商业秘密、商标权、著作权、专利权、其他知识产权及其他权益。</Text>
                  <Text style={styles.text}>c、违反依法律或合约所应负之保密义务。</Text>
                  <Text style={styles.text}>d、冒用他人名义使用仟金顶网站服务。</Text>
                  <Text style={styles.text}>e、从事任何不法交易行为，如贩卖枪支、毒品、禁药、盗版软件或其他违禁物。</Text>
                  <Text style={styles.text}>f、提供赌博资讯或以任何方式引诱他人参与赌博。</Text>
                  <Text style={styles.text}>g、涉嫌洗钱、套现或进行传销活动的。</Text>
                  <Text style={styles.text}>h、从事任何可能含有电脑病毒或是可能侵害仟金顶网站服务系統、资料等行为。</Text>
                  <Text style={styles.text}>i、利用仟金顶网站服务系统进行可能对互联网或移动网正常运转造成不利影响之行为。</Text>
                  <Text style={styles.text}>j、其他仟金顶网站有正当理由认为不适当之行为。</Text>
                  <Text style={styles.text}>3. 仟金顶网站保有依其单独判断删除仟金顶网站内各类不符合法律政策或不真实或不适当的信息内容而无须通知会员的权利，并无需承担任何责任。若会员未遵守以上规定的，仟金顶网站有权作出独立判断并采取暂停或关闭会员账户等措施，而无需承担任何责任。</Text>
                  <Text style={styles.text}>3. 仟金顶网站保有依其单独判断删除仟金顶网站内各类不符合法律政策或不真实或不适当的信息内容而无须通知会员的权利，并无需承担任何责任。若会员未遵守以上规定的，仟金顶网站有权作出独立判断并采取暂停或关闭会员账户等措施，而无需承担任何责任。</Text>
                  <Text style={styles.text}>4. 会员同意，由于会员违反本协议，或违反通过援引并入本协议并成为本协议一部分的文件，或由于会员使用仟金顶网站服务违反了任何法律或第三方的权利而造成任何第三方进行或发起的任何补偿申请或要求（包括律师费用），会员会对仟金顶网站及其关联方、合作伙伴、董事以及雇员给予全额补偿并使之不受损害。</Text>
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
  }
})

export default RegisterContact
