import React, { PureComponent } from 'react'
import {
  View, StyleSheet, FlatList, Text, ActivityIndicator,
  TextInput, RefreshControl, Alert, TouchableWithoutFeedback, Keyboard
} from 'react-native'
import NavBar from '../../component/NavBar'
import EventTypes from '../../utils/EventTypes'
import { getRealDP as dp, DEVICE_WIDTH, DEVICE_HEIGHT, getStatusBarHeight } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import Touchable from '../../component/Touchable'
import ComfirmModal from '../../component/ComfirmModal'
import { ScrollView } from 'react-native-gesture-handler'
import ajaxStore from '../../utils/ajaxStore'
import FormItemComponent from '../../component/FormItemComponent'
import Picker from 'react-native-picker'
import AuthUtil from '../../utils/AuthUtil'
import { setGoodsItems, setOrderSubmitData, setDefaultBaseInfo } from '../../actions/index'
import { formatTime, toAmountStr, formValid, showToast } from '../../utils/Utility'
import AlertModal from '../../component/AlertModal'
import { connect } from 'react-redux'
import { onEvent } from '../../utils/AnalyticsUtil'
import CheckBox from 'react-native-check-box'
import GoodsListComponent from './component/GoodsListComponent'
import { StrokeBtn, SolidBtn } from '../../component/CommonButton'
import {
  vAmount, vPhone
} from '../../utils/reg'
import Modal, {
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalButton,
  ScaleAnimation
} from 'react-native-modals'

class FourElementsByNanJing extends PureComponent {
  constructor (props) {
    super(props)

    this.rule = [
      { id: 'orderName', required: true, name: '订单名称' },
      { id: 'productCode', required: true, name: '产品' },
      { id: 'receiptPerson', required: true, name: '收货人' },
      { id: 'receiptPhone', required: true, reg: vPhone, name: '联系电话' },
      { id: 'provinceCode', required: true, name: '省市区' },
      { id: 'receiptAddress', required: true, name: '详细地址' },
      { id: 'items', required: true, name: '货物' }
    ]

    this.dialog = {
      title: {
        1: '南京银行个人征信授权书',
        2: '南京银行电子账户服务协议',
        3: '南京银行个人信息查询使用授权书',
        4: '四要素服务协议'
      },
      content: {
        1: '重要提示：尊敬的客户，为了维护您的权益，请在签署本授权书前仔细阅读本授权书各条款（特别是黑体字条款），关注您在授权书中的权利、义务。\n南京银行股份有限公司：\n        因本人在南京银行股份有限公司办理业务的需要，本人不可撤销地授权贵行在下述两项涉及到本人时，可以向金融信用信息基础数据库查询、打印、保存、使用本人信用报告，同时本人不可撤销地授权贵行将包括本人基本信息、信贷信息等信用信息向金融信用信息基础数据库报送：\n        （1）审核个人授信额度/信贷业务申请；\n        （2）对已授信额度或已发放的贷款进行贷后风险管理。\n        本授权书的有效期为：自本人签署本授权书之日起至上述所 有授信、业务失效/结清之日止。\n        本人同意本授权书以数字电文形式订立，授权人一旦在线确认本授权书，本授权书即生效。\n        本人知悉并理解本授权书中所有条款的声明，愿意承担授权贵行查询信用信息的法律后果，无论信贷业务是否获批准，本人的授权书、信用报告等资料一律不退回。\n        特此授权。',
        2: '        《南京银行电子账户服务协议》是用户（以下亦称“您”）正式注册成为南京银行股份有限公司（以下简称南京银行）电子账户用户（以下简称用户）时，就使用南京银行电子账户、移动收单及相关支付服务在内的互联网服务与南京银行订立的有效合约。为了保障您的权益，请您务必详细阅读本服务协议所有内容。当您点击同意本协议并完成用户注册，或使用南京银行手机银行、直销银行相关服务后，即表示您已充分阅读、理解并接受本协议的全部内容，并同意遵守本协议的所有条款。\n\n        一、 声明与承诺\n        （一） 您保证，在您同意接受本协议并注册成为用户时，您已年满 18 周岁 且具有完全民事行为能力，或者是在中华人民共和国境内（香港、澳门、台湾地 区除外）合法开展经营活动或其他业务的法人或其他组织；本协议内容不受您所属国家或地区法律的排斥。不具备前述条件的，您应立即终止注册或停止使用本 服务。\n        （二）您注册并使用南京银行电子账户及接受南京银行为您提供的使用电子账户支付、转账、充值、提现、代收代扣或其他互联网相关服务后，即代表您对您的注册信息的真实性及相关结果可以承担全部责任。如不具备本条件，您应立即停止申请、拒绝接受本服务。\n        （三） 南京银行有权根据需要修改本协议；如本协议有任何变更，经修订 的协议一经在南京银行网站或南京银行客户端发布，立即自动生效。您登录或 继续使用南京银行手机银行、直销银行客户端即表示您接受经修订的协议。如您不同意本协议修订的内容，您应当立即停止使用南京银行电子账户及相关服务。\n\n        二、 定义与解释\n        （一） 电子账户用户：指通过南京银行手机银行、直销银行、移动收单以及其他第三方机构使用南京银行电子账户的用户。\n        （二） 电子账户：指南京银行通过电子渠道为您开立的Ⅱ类户或Ⅲ类户。您在申请电子账户开立时，应绑定您本人同名开立且真实持有的银行卡。为保障您的安全，您仅可通过绑定的银行卡账户向您的电子账户转入资金。\n        （三） 南京银行手机银行、直销银行服务：指南京银行通过其手机银行、直销银行（又称你好银行、HiBank）为开立电子账户的用户提供的综合性互联网金融服务，服务渠道包括但不限于南京银行手机银行、直销银行网上银行、直销银行网站、直销银行手机银行、直销银行微信银行及其他渠道。\n        （四） 南京银行移动收单服务：指南京银行为开立电子账户的用户提供的互联网支付服务，包括但不限于移动互联网支付、转账、银行卡管理、代收付、交易查询以及其他第三方商业机构提供的相关金融服务。\n        三、 电子账户\n        （一）账户申请\n        除本协议另有约定或相关产品另有规则外，您须在南京银行网站、互联网客户端或与南京银行合作的第三方机构的网站或客户端注册并取得南京银行提供的电子账户，并且按照南京银行要求提供相关信息完成认证后方可使用南京银行电子账户服务。您同意：\n        1. 您应按照用户注册页面的提示，准确提供真实、完整的个人信息，并在 成功取得电子账户后及时更新您的最新完整资料，您授权南京银行向其他银行或 第三方合作机构提交您的个人信息以审核您的身份和资格，当南京银行有合理理 由怀疑您提供的资料有误、不实、陈旧或不完善时，南京银行有权暂停或终止向 您提供部分或全部服务，您将承担因此而产生的全部损失与责任。若因国家法律 法规、部门规章或监管机构的要求，南京银行需要您补充提供任何相关资料时， 如您不能及时配合提供，南京银行有权暂停或终止向您提供部分或全部电子账户用户服务。\n        2. 您正常完成电子账户注册后，只有您本人可以使用电子账户，该账户不 可转让、不可借用、不可赠与、不可继承。在您决定不再使用该账户时，您应将 该账户下所对应的可用款项全部提现或者向南京银行发出支付指令将可用款项 全部支付后，向南京银行申请注销该账户。\n        3. 您应当准确提供并及时更新您提供的电子邮件地址、联系电话、联系地 址、邮政编码等联系方式，以便南京银行与您进行及时、有效联系。您应完全独 自承担因通过这些联系方式无法与您取得联系而导致的您在使用本服务过程中 遭受的任何损失或增加任何费用等不利后果。您理解并同意，您有义务保持您提 供的联系方式的有效性，如有变更需要更新的，您应按南京银行的要求进行操作。\n        4. 您有义务在相关资料实际变更时及时更新有关注册资料（包括但不限于 身份证、户口本、护照等证件或其他身份证明文件、联系方式、作为电子账户登 录名的手机号码、与电子账户绑定的邮箱、手机号码等），导致本服务无法提供 或提供时发生任何错误、账户及账户内资金被别人盗用，您不得将此作为取消交 易、拒绝付款的理由，您将承担因此产生的一切后果，南京银行不承担任何责任。\n        5. 用户授权\n        除法律法规及监管规定另有规定外，您同意并不可撤销地授权南京银行：\n        (1)收集您提供的任何信息，包括但不限于您的基本信息、电子账户信息、银行信息、您与南京银行之间存在的任何协议及您在该等协议项下的履约情况、您的行为数据等，无论该等信息获取行为发生在过去、现在还是将来；为确保您信息的安全，南京银行对上述信息负有保密义务，并采取各种措施保证信息安全；\n        (2) 将您的信息用于创建数据分析模型，向您的联系方式（包括但不限于 手机、邮箱、微信、微博）发送产品信息，为您提供适合的产品及服务，以及 基于为您提供的产品与服务，将您的信息提供给南京银行合作机构。\n        （3）将您的个人信息和交易信息披露给与您交易的另一方或您登录的网站，该信息包括但不限于：您的真实姓名、身份信息、联系方式、信用状况、电子账户。\n        （二） 账户安全\n        1. 除相关产品另有规则外,南京银行通过您的电子账户用户名、密码、手机 校验等安全产品生产出的校验码（下文简称“校验码”）来识别您的身份，您应 当妥善保管您的电子账户用户名、密码、校验码和其他注册信息，对于因密码或 校验码泄露所致的损失，由您自行承担。您保证不向其他任何人泄露该账户登录 名、密码、校验码以及身份信息等，亦不使用其他任何人的电子账户、密码及校 验码。南京银行亦可能通过应用您使用的其他产品或设备识别您的指示，您应当 妥善保管处于您或应当处于您掌控下的这些产品或设备，对于这些产品或设备遗 失所致的任何损失，由您自行承担。\n        2. 基于互联网、移动互联网客户端以及使用其他电子设备的用户使用习惯， 我们可能在您使用具体产品时设置不同的账户登录模式及采取不同的措施识别 您的身份。\n        3. 如您发现有他人冒用或盗用您的电子账户及密码或任何其他未经合法授 权之情形时，应立即以有效方式通知南京银行，要求南京银行暂停相关服务、采 取应急措施。同时，您理解南京银行对您的请求采取行动需要合理期限。在南京 银行采取行动之前，南京银行对已执行的指令及(或)所导致的您的损失不承担任何责任。\n        4. 交易异常处理\n        (1) 您使用电子账户用户服务时，可能由于银行本身系统问题、银行相关作 业网络连线问题或其他不可抗拒因素，造成电子账户服务无法提供。您应确保您 所输入的资料无误，如果因资料错误造成上述异常状况发生时，无法及时通知您 相关交易后续处理方式的，南京银行不承担任何责任。\n        (2) 南京银行有权了解您使用电子账户用户服务的真实交易背景及目的，您 应如实提供南京银行所需的真实、全面、准确的信息；如果南京银行有合理理由 怀疑您提供虚假交易信息的，南京银行有权暂时或永久限制您所使用的电子账户 用户服务部分或全部功能。\n        (3) 南京银行在发现您的电子账户可能存在异常交易，或可能存在违反法律 或本协议约定情况时，有权不经通知先行暂停或终止该账户的使用（包括但不限 于对该账户名下的款项和在途交易采取取消交易、调账等限制措施），并拒绝您 使用电子账户用户服务之部分或全部功能。\n        5. 您同意，基于运行和交易安全的需要，南京银行有权暂时停止提供或者 限制本服务部分功能或提供新的功能，在任何功能减少、增加或者变化时，只要 您仍然使用本服务，表示您仍然同意本协议或者变更后的协议。\n        6. 您同意，南京银行有权按照包括但不限于国家行政机关、监察机关、司 法机关、公安机关、海关、税务机关等国家有权机关要求对您的个人信息及在电 子账户的资金、交易及账户等进行查询、冻结或扣划。\n        四、 账户服务使用规则\n        为有效保障您使用电子账户用户服务进行交易时的合法权益，您理解并同意接受以下规则：\n        (一) 一旦您使用本服务，您即不可撤销地授权南京银行在您及（或）您指 定人符合指定条件或状态时，支付款项给您指定人，或收取您指定人支付给您的 款项。\n        (二) 南京银行通过以下方式接受来自您的指令：其一，您在南京银行网站、 客户端或其他可使用本服务的网站或软件上通过以您的电子账户名及密码或数 字证书等安全产品登录电子账户并依照本服务预设流程所修改或确认的交易状 态或指令；其二，您通过您注册时的电子账户用户名或者与该账户绑定的手机或 其他专属于您的通讯工具（以下合称“该手机”）号码向本系统发送的信息（短 信或电话等）回复；其三，您通过您注册时的电子账户用户名或者与该用户名绑 定的其他硬件、终端、软件、代号、编码、代码、其他账户等有形体或无形体向 本系统发送的信息；其四，南京银行与您约定或南京银行认可的其他方式。无论 您通过以上何种方式向南京银行发出指令，都不可撤回或撤销，且成为南京银行 代理您支付或收取款项或进行其他账户操作的唯一指令，视为您本人的指令，您 应当自己对南京银行忠实执行上述指令产生的任何结果承担责任。本协议所称绑 定，指您的电子账户与本条上述所称有形体或无形体存在对应的关联关系，这种 关联关系使得电子账户用户服务的某些服务功能得以实现，且这种关联关系有时 使得这些有形体或无形体能够作为本系统对您的电子账户的识别和认定依据。除 本协议另有规定外，您与第三方发生交易纠纷时，您不可撤销地授权南京银行自 行判断并决定将争议资金的全部或部分支付给交易一方或双方，南京银行无须为 此承担责任。\n        (三) 您在使用本服务过程中，本协议内容、网页上出现的关于交易操作的 提示或南京银行发送到该手机的信息（短信或电话等）内容是您使用本服务的相 关规则，您使用本服务即表示您同意接受本服务的相关规则。您了解并同意南京 银行有权单方修改服务的相关规则，而无须征得您的同意，服务规则应以您使用 服务时的页面提示（或发送到该手机的短信或电话等）为准，您同意并遵照服务 规则是您使用本服务的前提。\n        (四) 南京银行会以发送手机短信或电子邮件或站内信或客户端通知等方式 通知您交易进展情况以及提示您进行下一步的操作，但南京银行不保证您能够收 到或者及时收到该等通知，且不对此承担任何后果，因此，您应当及时查看该等 通知并进行相关操作。因您没有及时查看和对交易状态进行修改或确认或未能提 交相关申请而导致的任何纠纷或损失，南京银行不负任何责任。\n        （五）您须定期与南京银行进行核对账务。您知悉，对于在一年之内未发生账务交易且余额为零的电子账户，南京银行有权对该电子账户进行注销；对于在一年之内未发生账务交易且账户余额低于南京银行相关规定的，南京银行有权对该电子账户设置暂停使用。\n        (六) 互联网支付服务\n        1. 南京银行将按照本协议及相关服务所需遵循的业务规程，通过包括但不 限于南京银行手机银行、直销银行、移动收单等渠道向您提供相应的支付结算服务。\n        2. 互联网订单是您与商品、服务供应商达成的交易确认信息，在支付流程 中，南京银行以此订单信息为准为您的付款账户进行账务处理，付款结果不代表 商品质量、物流结果、权益落实等相关信息，有关商品及服务请与订单显示的商 户进行联系沟通，南京银行对此不负有责任。\n        3. 在正式进行支付前，您必须确认您支付订单的相关信息，包括但不限于 支付订单中显示的商户信息、交易金额、交易日期、时间等信息，如存在可疑信 息或出现其他可能影响交易安全的情形，您应通过多种方式联系商户或服务提供 方确认您的订单的相关信息后，再进行支付，如因您个人原因未能确认订单信息 导致的风险与损失，由您承担全部责任。\n        4. 您自愿承担在互联网支付（包含但不限于移动支付）过程中，您在信息 输入终端中输入的个人信息、付款账户信息、密码、验证码等信息在输入及互联 网传送过程中的风险，包括但不限于信息被他人截取等。\n        5. 在确认订单并进行支付时，您需确认支付账户信息输入页面是否为南京 银行提供，如存在可疑信息或出现其他可能影响交易安全的情形，您应及时联系 南京银行进行确认。如您在非南京银行提供的支付页面输入银行账户相关信息， 导致银行账户信息泄露引发的损失，由您承担全部责任。\n        6. 您的付款账户信息，包括但不限于账（卡）号、交易密码，信用卡有效 期、信用卡背面签名栏后三位安全码，以及与付款账户相关的银行预留联系方式 （包含但不限于手机号、电子邮箱、地址）、短信一次性动态密码（有效时间内） 等信息为您的个人机密信息，您必须妥善保管，如使用上述信息进行登录及支付 相关操作，南京银行视同您本人所为，您需对所有操作承担全部责任。\n        7. 南京银行未经您的授权，不会向第三方泄露您的个人信息及银行账户信 息（屏蔽卡号需在交易中使用的除外）。在任何情况下，南京银行不会以任何形 式向您征询包含银行账户交易密码在内的账户相关信息。\n        8. 您在南京银行各互联网渠道进行支付操作，或根据业务运行预设流程进 行交易确认，南京银行将根据您的指令向您指定的银行付款账户发出支付请求， 您发出的指令不可撤回或撤销。\n        9. 您使用南京银行互联网金融渠道相关服务时，在交易过程中及完成支付 后，您应当及时登录南京银行相关互联网渠道或联系南京银行核实、查询相关交 易的状态、结果。因您未能及时查看或核实交易状态，导致的任何损失，南京银 行不承担任何责任。\n        10. 您在互联网支付交易过程中发生的电子凭证、交易记录，以及包含但不 限于南京银行系统、跨行交易转接机构的后台系统、第三方商户中关于您相关交 易的信息，是确定交易效力的真实和有效的依据，为保障您的权益，您须对相关 的页面进行截图以证明交易的真实性与有效性。如您未能截图，请提供其他可有 效证明交易的凭据或凭证，否则您的权益可能会受到损失。\n        11. 南京银行对您所交易的标的物不提供任何形式的鉴定、证明的服务。如 您使用支付服务时对商品质量有疑义，由您与商户自行协商解决。\n        12. 为控制可能存在的风险，南京银行对使用互联网支付交易付款账户的一 定时期支付最高限额进行了限制，您可登录相关网站或客户端查询您支付账户的 限额使用情况，南京银行有权根据业务发展需要对上述限额进行调整。\n        13. 南京银行互联网跨行支付限额同时受您付款账户发卡行及相关跨行交 易转接清算机构的支付限额规则限制，因发卡行或跨行交易转接清算机构支付限 额引发的纠纷，南京银行不承担任何责任。\n        14. 为保障交易安全及方便您使用，南京银行对部分实名制或风险较低的互 联网交易，最终的交易金额可不受制于您或南京银行单独设置的支付限额控制， 南京银行负责审核商户的准入资质。但由于您主动凭借付款账户交易密码或您在 付款账户开户银行预留手机号接收的动态验证密码完成交易，视同为您本人主动 授权操作，南京银行将不承担任何责任。\n        15. 本协议项下相关服务通过互联网实现，资金于途中流转的时间，受制于 跨行清算系统（包括但不限于人民银行跨行支付清算系统、中国银联跨行支付清 算系统、非金融支付机构跨行支付清算系统）、金融机构的支付、入账处理效率， 还受制于退款业务人工操作时效，以及互联网网速及您的设备进行数据处理的效率等。\n        (七) 实名认证\n        1. 若您未通过实名认证，相应款项将无法使用或提现，您授权南京银行暂 时代为保管该款项，直到您完成实名认证。\n        2. 您理解针对不同等级的实名认证用户，本服务提供之支付产品及交易限 额有所差异。\n        3. 在申请注册以及注册成功后申请变更相应信息，进行实名认证过程中时， 您同意和授权南京银行将您所填写的个人信息或银行卡相关信息交至权威机构 或第三方合作机构处进行核查校验。若校验结果显示信息有误的，南京银行有权 拒绝您的实名认证请求，并拒绝向您开放部分或全部的电子账户服务。\n        （八） 代收代付\n        1. 南京银行会将您委托南京银行代收或代付的款项，严格按照法律法规或 有权机关的监管要求进行管理；除本协议另有规定外，不作任何其他非您指示的用途。\n        2. 本协议项下的资金移转均通过银行来实现，你理解并同意您的资金于流 转途中的合理时间。\n        3. 您确认并同意，您应自行承担您使用本服务期间由南京银行保管或代收 或代付款项的货币贬值风险，并且南京银行无须就此等款项向您支付任何孳息或 其他对价。\n        4.您有义务配合南京银行进行套现、虚假交易、洗钱等行为调查，一旦您拒绝配合进行相关调查或由南京银行认定存在或涉嫌虚假交易、洗钱、套现或任何其他非法活动、欺诈或违反诚信原则的行为，南京银行有权暂停或终止提供代收代付服务。\n        5. 您授权南京银行在本协议约定业务范围内向第三方机构提供在第三方机 构进行代收代付业务时所需的个人信息，包括但不限于您的姓名、证件类型及号 码、银行卡号、联系方式等 , 您愿意承担由此产生的一切后果。\n        6. 南京银行有权根据自身业务调整代收代付服务的内容；南京银行有对代 收代付业务系统进行升级、改造的权利。\n        7. 南京银行未按照协议内容进行付款并造成您损失的，南京银行应承担相 应责任。但因以下情况造成付款请求未能支付，所造成的经济损失及相应责任由 您承担：\n        （ 1 ）南京银行接收到的支付指令信息不明确或不完整；\n        （ 2 ）您账户可用余额或信用额度不足；\n        （ 3 ）支付金额高于南京银行或您设置的限额；\n        （ 4 ）您的账户状态不正常，包括但不限于账户挂失、冻结、止付等；\n        （ 5 ）有权机关依法对账户执行冻结或扣划等措施；\n        （ 6 ）您的行为出于欺诈或其他非法目的；\n        （ 7 ）南京银行与第三方合作机构因故终止合作的；\n        （ 8 ）在南京银行、第三方合作机构公告的非正常交易时间内提交的交易指令；\n        （ 9 ）由于不可抗力因素、计算机黑客袭击、系统故障、通讯故障、网络 拥堵、供电系统故障、电脑病毒、恶意程序攻击及其他不可归因于南京银行的非 人为因素造成系统无法受理的情况；\n        （ 10 ）法律、法规或监管部门规定的其他情况。\n        (九)您使用本服务时，请严格遵守相关信息发布规则，不发布虚假信息及违法信息，南京银行有权利（但无义务）对您发布的信息进行审核，同时对于您发布的信息引起的任何纠纷，南京银行将不承担任何责任。\n        (十) 交易风险\n        1. 在使用电子账户服务时，若您或交易对方未遵从电子账户服务条款或规 则，则南京银行有权拒绝为您与交易对方提供相关服务，且南京银行不承担违约 和损害赔偿责任。若发生上述状况，而款项已先行划付至您或他人的电子账户名 下，您同意南京银行有权直接自相关电子账户余额中扣回款项及（或）禁止您要 求支付此笔款项之权利。此款项若已汇入您的银行账户，您同意南京银行拥有向 您追索的权利。因您的原因导致南京银行进行款项追索的，您应当承担南京银行 合理的追索费用（包括但不限于律师费、公证费、诉讼费等费用）。\n        2. 因您的原因导致的任何损失由您自行承担，该原因包括但不限于：未按 照交易提示操作，未及时进行交易操作，遗忘或泄漏电子账户密码，电子账户密 码被他人破解，泄露个人信息或交易信息、手机校验码，您使用的计算机或连网 设备被他人侵入等。\n        (十一) 服务费用\n        1. 南京银行保留当您使用南京银行服务时向您收取相关服务费用及对服务 费进行调整的权利。届时南京银行将通过互联网客户端及相关网站告知您收费事 宜，如您未在南京银行规定的时间内向南京银行支付相关费用，则视为您自动退 出本协议。如您同意支付服务费用，除非另有说明，对于上述服务费用，南京银 行有权从为您代收的款项中先行扣除。\n        2. 除非另有说明或约定，您同意南京银行有权自您委托代管、代收或代付 的款项或您任一电子账户余额或者其他资产中中直接扣除上述服务费用。\n        五、 电子账户服务使用限制\n        (一) 您在使用本服务时应遵守中华人民共和国相关法律法规、您所在国家 或地区之法令及相关国际惯例，不将本服务用于任何非法目的（包括用于禁止或 限制交易物品的交易），也不以任何非法方式使用本服务。\n        (二) 您在使用本服务时应对交易真实性负责，并配合南京银行对交易真实 合法性的调查工作。若您将本服务用于虚假交易，南京银行有权单方面冻结您的 账户并拒绝向您提供电子账户服务，因此导致南京银行或南京银行雇员受损的， 您应承担赔偿责任。\n        (三) 您不得利用本服务从事侵害他人合法权益之行为，不得将本服务用于 非南京银行许可的其他用途，否则南京银行有权拒绝提供本服务，且您应承担所 有相关法律责任，因此导致南京银行或南京银行雇员或其他方受损的，您应承担 赔偿责任。上述行为包括但不限于：\n        1. 侵害他人名誉权、隐私权、商业秘密、商标权、著作权、专利权等合法 权益；\n        2. 违反依法定或约定之保密义务；\n        3. 冒用他人名义使用本服务；\n        4. 从事不法交易行为，如洗钱、恐怖融资、贩卖枪支、毒品、禁药、盗版 软件、黄色淫秽物品、其他南京银行认为不得使用本服务进行交易的物品等；\n        5. 提供赌博资讯或以任何方式引诱他人参与赌博；\n        6. 非法使用他人银行账户（包括信用卡账户）或无效银行账号（包括信用 卡账户）交易；\n        7. 违反《银行卡业务管理办法》使用银行卡，或利用信用卡套取现金（以 下简称“套现”）；\n        8. 进行与您或交易对方宣称的交易内容不符的交易，或不真实的交易；\n        9. 从事任何可能含有电脑病毒或是可能侵害本服务系统、资料之行为；\n        10. 其他南京银行有正当理由认为不适当之行为。\n        六、 系统中断或故障\n        电子账户服务相关系统（包括但不限于南京银行的系统）因下列状况无法正常运作，使您无法使用各项服务时，南京银行不承担损害赔偿责任，该状况包括但不限于：\n        （一） 南京银行在互联网渠道公告的系统停机、维护、升级期间。\n        （二） 电信设备出现故障不能进行数据传输的。\n        （三） 因台风、地震、海啸、洪水、停电、战争、恐怖袭击等不可抗力之 因素，造成南京银行系统障碍不能执行业务的。\n        （四） 由于黑客攻击、电信部门技术调整或故障、系统升级等原因而造成 的服务中断或者延迟。\n        （五） 您的互联网信息终端（包含但不限于个人 PC、移动终端等）因您个 人使用不当或被黑客攻击导致的信息泄露。\n        七、 责任范围及限制\n        (一) 南京银行仅对本协议中列明的责任承担范围负责。\n        (二) 您明确因交易所产生的任何风险应由您自行评估和承担。\n        (三) 电子账户用户信息是由用户本人自行提供的，南京银行无法保证该信 息之准确、及时和完整，您应对您的判断承担全部责任。\n        (四) 南京银行不对交易标的及本服务提供任何形式的保证，包括但不限于以下事项：\n        1. 本服务符合您的需求。\n        2. 本服务不受干扰、及时提供或免于出错。\n        3. 您经由本服务购买或取得之任何产品、服务或其他资料符合您的期望。\n        (五) 您经由本服务之使用下载或取得任何资料，应由您自行考量且自负风 险，因资料之下载而导致您电脑系统之任何损坏或资料流失，您应负完全责任。\n        (六) 您自南京银行及南京银行工作人员或经由本服务取得之建议和资讯， 无论其为书面或口头形式，均不构成南京银行对本服务之保证。\n        (七) 在法律允许的情况下，南京银行对于与本协议有关或由本协议引起的 任何间接的、惩罚性的、特殊的、派生的损失（包括业务损失、收益损失、利润 损失、使用数据或其他经济利益的损失），不论是如何产生的，也不论是由对本 协议的违约（包括违反保证）还是由侵权造成的，均不负有任何责任，即使事先 已被告知此等损失的可能性。\n        (八) 鉴于目前互联网安全保护技术和措施在其本身不断得到改进和完善的 同时，也在不断面临新的挑战，因此，您使用电子账户服务将存在一定的风险， 该等风险包括但不限于：您的电子账户和密码被他人冒用、盗用、侵入、或有其 他任何未经合法授权之情形发生，或不法分子盗用您的银行卡，或交易对方拒绝 付款等。这些风险均会给您造成经济损失，除非可证明南京银行对损失的形成存 在故意或重大过失，南京银行将不承担任何责任；另外，在任何情况下，南京银 行就本协议向您承担的违约或赔偿责任（如有）的上限额度为不超过向您收取的 当次服务费的总额。\n        八、 隐私保护\n        (一) 电子账户用户名和密码\n        在您注册成为南京银行电子账户用户时，我们会通过您的用户名和密码来识别您的身份。为了您的账户和账户财产安全，请妥善保管用户名及密码，如果您泄漏了密码，您可能会丢失您的个人识别信息，并可能导致对您不利的法律后果。该账户和密码因任何原因受到潜在或现实危险时，您应该立即和南京银行取得联系，在南京银行采取行动前，南京银行对此不负任何责任。\n        (二) 注册信息\n        您注册电子账户时应向南京银行提供您的真实姓名、地址、国籍、电话号码和电子邮件地址等国家法律法规要求的信息，您还可以选择来填写相关附加信息（包括但不限于单位名称、家庭月收入、个人月收入等）。为有针对性地向您提供新的服务和机会，您了解并同意，南京银行或您登录的其他网站，将通过包括但不限于您的电子邮件地址、手机号码、微信公众号或南京银行客户端及其他合作的第三方商业机构网页或软件向您发送包括业务推介在内的相关通知。\n        (三) 银行账户信息\n        南京银行所提供的服务将需要您提供您的银行账户信息，在您提供相应信息后，南京银行将严格履行相关保密约定。\n        (四) 交易及操作行为\n        为了保障您使用本服务的安全以及不断改进服务质量，南京银行将记录并保存您登录和使用本服务的相关信息，但南京银行承诺不将此类信息提供给除南京银行关联企业和合作单位之外的其他第三方（但双方另有约定、法律另有规定的除外）。\n        （五）数据分析和发布\n        您同意，南京银行有权收集电子账户用户身份、交易行为、联系方式、用户偏好、操作设备等信息，并出于科研、商业、销售或奖励等需要使用或披露有关统计分析信息。\n        （六）Cookie 的使用及设备软硬件配置信息的收集\n        您了解并同意，南京银行使用 cookie 来使电子账户用户服务对用户更友好 （它可以跟踪您的浏览器的状态，帮您省去为使用本服务而重复输入注册信息的 繁琐），同时，南京银行可以收集由您设备的软硬件配置信息生成的特征信息， 用于标识您的设备，以便更好地为您服务。\n        (七) 为更有效地向您提供服务，您同意，南京银行有权将您注册及使用本 服务过程中所提供、所形成的信息提供给南京银行关联企业或辅助合作单位。 同时，为更安全有效地向您提供服务，根据法律法规的规定，或南京银行认为 需识别您的身份，或南京银行认为您的电子账户存在风险时，南京银行有权要 求您提交身份信息（包括但不限于身份证、户口本、护照等证件或其他文件）。\n        除本协议另有规定外，南京银行不对外公开或向第三方提供您的信息，但以下情况除外：\n        1. 事先获得您的明确授权；\n        2. 只有披露您的个人资料，才能提供您需要的产品和（或）服务；\n        3. 按照本协议的要求进行的披露；\n        4. 根据法律法规的规定；\n        5. 按照政府主管部门或其他有权机关的要求；\n        6. 为维护南京银行及其关联企业的合法权益；\n        7. 您使用电子账户成功登录过的其他网站合理要求；\n        8. 对您或您所代表公司的身份真实性进行验证。\n        (八) 外部链接\n        电子账户用户客户端或网站系统含有到其他网站的链接，但南京银行对其他网站的隐私保护措施不负任何责任。南京银行可能在任何需要的时候增加商业伙伴或共用品牌的网站。\n        (九) 安全\n        南京银行仅按现有技术提供相应的安全措施来使南京银行掌握的信息不丢失，不被滥用和变造。这些安全措施包括向其它服务器备份数据和对用户密码加密。尽管有这些安全措施，但南京银行不保证这些信息的绝对安全。\n        九、 知识产权\n        (一) 南京银行及关联企业所有系统及本网站上所有内容，包括但不限于著 作、图片、档案、资讯、资料、网站架构、网站画面的安排、网页设计，均由南 京银行或关联企业依法拥有其各项知识产权（包括但不限于商标权、专利权、著 作权、商业秘密与专有技术等）；南京银行依法拥有“南京银行你好银行”中文 及图形、LOGO 的商标权、著作权、软件系统中涉及的著作权以及相关专利权、 域名权，并已授权南京银行合法使用。\n        (二) 非经南京银行书面同意，任何人不得擅自使用、修改、复制、公开传 播、改变、散布、发行或公开发表或者进行还原工程解编或反向编译南京银行互 联网客户端及网站程序或内容。\n        (三) 尊重知识产权是您应尽的义务，如有违反，您应承担损害赔偿责任(包 括但不限于诉讼费用及律师费用等)。\n        十、 管辖法院及法律适用\n        (一) 本协议的成立、生效、履行和解释，均适用中华人民共和国法律。除 您与南京银行另有约定外，均依据南京银行有关业务规定、金融业务惯例和网上 交易惯例办理。\n        (二) 本协议相关条款及后续南京银行对协议的解释，应充分考虑互联网金 融业务及服务的特点、性质。\n        (三) 您同意遵守《中华人民共和国保守国家秘密法》、《中华人民共和国 计算机信息系统安全保护条例》、《计算机软件保护条例(2001)》、《互联网电 子公告服务管理规定》、《互联网信息服务管理办法》等有关计算机及互联网的 法律法规。\n        (四) 在南京银行合理地认为您的行为可能违反法律、法规或本协议的约定， 南京银行有权不事先通知而终止向您提供服务，并且不因此对您和任何第三人承 担责任。\n        (五) 执行本协议发生争议，由当事人双方协商解决。协商不成，双方同意 向南京银行股份有限公司所在地人民法院起诉。\n        十一、 协议关系\n本协议内容包括协议正文及所有南京银行已经发布的或将来可能发布的电子账户用户服务规则，及南京银行不时发布的其他明示属于本协议组成部分的合同或协议。\n        十二、 个人税收居民身份声明\n本人声明：\n✓ 1.仅为中国税收居民\n2.仅为非居民\n3.既是中国税收居民又是其他国家（地区）税收居民\n如在以上选项中勾选第 2 项或者第 3 项，请填写下列信息：\n姓（英文或拼音）： / 名（英文或拼 音）： /\n出生日期： /\n现居地址（中文）： / （国 家） / （省） / （市） （境外地址可不填此项）\n（英文或拼音）： / （国 家） / （省） / （市）\n出生地（中文）： / （国 家） / （省） / （市） （境外地 址可不填此项）\n（英文或拼音）： / （国 家） / （省） / （市）\n税收居民国（地区）及纳税人识别号：\n1. /\n2.（如有） /\n3.（如有） /\n如不能提供居民国（地区）纳税人识别号，请选择原因：\n居民国（地区）不发放纳税人识别号\n账户持有人未能取得纳税人识别号，如选此项，请解释具体原 因： /\n本人确认上述信息的真实、准确和完整，且当这些信息发生变更时，将在 30 日 内通知贵机构，否则本人承担由此造成的不利后果。',
        3: '南京银行股份有限公司：\n        本人不可撤销地授权贵行办理以下涉及到本人的授信业务时，通过金融信用信息基础数据库、工商、司法、公安、公积金、税务、社保、相关政府业务管理部门、信贷征信业监督管理部门批准建立的征信信息数据库以及其他经授权的第三方合法渠道符合法律法规规定调查、核实、获取、使用、保存有关本人个人信息（包括但不限于身份信息、婚姻信息、工作信息、收入信息、财产信息、行为信息、通讯信息、设备信息、公共服务信息等）及包括信贷信息在内的信用信息,可以根据司法机关、金融监管机关或其他行政机关要求处理上述信息及资料，或依照法定程序，将上述资料提供给司法机关、行政机关、金融行业工会、第三方征信机构或其他监管机构，可以将上述资料用于贵行自行或委托的合法第三方进行案件调查、债务追索等情况：\n        1.审核个人信贷业务申请；\n        2.受理自然人的信贷业务申请，审核本人作为担保人或关联人等，需要查询其信用状况；\n        3.对已授信业务和已发放的个人贷款进行贷后风险管理，涉及到本人作为其借款人、担保人或关联人等，需要查询其信用状况；\n        4.受理法人或其他组织的信贷业务申请或贷后管理，审核本人作为其法定代表人、出资人、担保人或关联人等，需要查询其信用状况；\n        本授权书的有效期为：自本人签署本授权书之日起至上述所有业务结清/办结之日止。\n        本人已经完全知悉并充分理解本授权书条款的内容及相应的法律后果，已经充分理解并知晓该等信息被提供和使用的风险，愿意接受本授权书条款的约定，并同意本授权书以数字电文形式订立，授权人一旦在线确认本授权书，本授权书即生效。无论信贷业务是否获批准，本人的基础资料、授权书、信用报告等资料一律不退回。',
        4: '        一、您保证提供给本行的银行卡资料（包括：卡号、姓名、证件号码、手机号码等）为您本人持有的真实、完整、准确、合法、有效的银行卡信息，并同意本行将以上信息送至发卡银行进行核验。\n        二、您同意并授权本行根据您所购买产品和服务的金额，通过支付清算机构以及发卡银行，从您提供的银行卡中扣款。您承诺前述委托扣款视同您本人作出，不得向本行、支付清算机构以及发卡银行提出异议。\n        三、因您提供他人银行卡资料或虚假信息、您提供的银行卡账户余额不足或被挂失、冻结、销户等原因而引起的一切法律责任，由您自行承担，与本行无关。\n        四、因支付清算机构或发卡银行原因导致扣款错误或延迟，给您造成损失的，由过错方承担责任，本行将协助您向其追究相应责任。\n        五、如发生不属于您的款项已先行拨入您账户的情况，您认可并同意本行以及与本行合作的第三方支付公司具有向您事后索回的权利。'
      }
    }

    this.state = {
      certType: [
        { name: '身份证', type: 1 }
      ],
      certTypeIndex: 0,
      legalPersonName: '',
      legalPersonCertId: '',
      cardNo: '',
      bankReservedMobile: '',
      count: '',
      codeSending: false,
      protocolChecked: false,
      dialogShow: false,
      dialogId: '',
      showShadow: false,
      protocolModal: false,
      modalTitile: '',
      modalContent: '',
      hasReadNanJing: false
    }
  }

  componentDidMount () {
    this.lodaData()
  }

  async lodaData () {
    const res = await ajaxStore.order.getNJFourElements({ bank: '4' })
    if (res.data && res.data.code === '0') {
      this.setState({
        legalPersonName: res.data.data.legalPersonName,
        legalPersonCertId: res.data.data.legalPersonCertId,
        cardNo: res.data.data.cardNo,
        bankReservedMobile: res.data.data.bankReservedMobile
      })
    }
  }

  bindSubmit = async () => {
    const data = {
      legalPersonName: this.state.legalPersonName,
      legalPersonCertId: this.state.legalPersonCertId,
      cardNo: this.state.cardNo,
      bankReservePhone: this.state.bankReservedMobile,
      bank: '4'
    }
    global.showError = false
    const res = await ajaxStore.order.updateNJFourElements(data)
    global.showError = true
    if (res.data && res.data.code === '0') {
      if (this.props.navigation.state.params.from === 'orderCreate') {
        this.createOrder(this.props.erjiOrderSubmitData, () => {
          this.props.navigation.navigate('FourElementsResult', { result: true })
        })
      }
    } else if (res.data && res.data.code === '1') {
      this.props.navigation.navigate('FourElementsResult',
        { result: false, reason: res.data.message, fundSource: '4' })
    } else {
      global.alert.show({
        content: res.data.message
      })
    }
  }

  // 订单创建
  async createOrder (data, cb) {
    const res = await ajaxStore.order.createWkaOrder(data)
    if (res.data && res.data.code === '0') {
      onEvent('提交订单', 'FourElementsByNanJing', '/ofs/front/wkaOrder/createWkaOrder', { orderNo: res.data.data })
      await AuthUtil.removeTempOrderInfo()
      await setDefaultBaseInfo({})
      await setGoodsItems([])
      cb && cb()
    }
  }

  disabled () {
    return !(this.state.certType[this.state.certTypeIndex].type && this.state.legalPersonName && this.state.legalPersonCertId && this.state.cardNo && this.state.bankReservedMobile && this.state.protocolChecked && this.state.bankReservedMobile.length === 11)
  }

  showTypeDialog = () => {
    const array = this.state.certType.map((item, index) => {
      return item.name
    })
    Keyboard.dismiss()
    Picker.init({
      pickerData: array,
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '请选择证件类型',
      pickerBg: [255, 255, 255, 1],
      pickerConfirmBtnColor: [89, 192, 56, 1],
      pickerCancelBtnColor: [102, 102, 102, 1],
      pickerTitleColor: [153, 153, 153, 1],
      pickerFontSize: 18,
      pickerTextEllipsisLen: 20,
      selectedValue: [this.state.certType[this.state.certTypeIndex].name],
      onPickerConfirm: (data, pickedIndex) => {
        this.hideShadow()
      },
      onPickerCancel: (data, pickedIndex) => {
        this.hideShadow()
      }
    })
    Picker.show()
    this.showShadow()
  }

  showShadow = () => {
    this.setState({ showShadow: true })
  }

  hideShadow = () => {
    this.setState({ showShadow: false })
  }

  tapProtocol = (id) => {
    this.setState({
      modalTitile: this.dialog.title[id],
      modalContent: this.dialog.content[id],
      protocolModal: true
    })
  }

  renderProtocolModal () {
    return (
      <Modal
        onTouchOutside={() => {
          this.setState({ protocolModal: false })
        }}
        width={0.9}
        visible={this.state.protocolModal}
        onSwipeOut={() => this.setState({ protocolModal: false })}
        modalAnimation={new ScaleAnimation({ initialValue: 0.5, useNativeDriver: true })}
        onHardwareBackPress={() => {
          this.setState({ protocolModal: false })
          return true
        }}
        footer={
          <ModalFooter>
            <ModalButton
              text="我已阅读"
              onPress={() => {
                this.setState({ protocolModal: false })
              }}
              key="button-2"
              textStyle={{ color: Color.GREEN_BTN, fontWeight: 'bold' }}
            />
          </ModalFooter>
        }
      >
        <ModalContent style={{ alignItems: 'stretch' }}>
          <Text style={{
            fontSize: dp(40),
            textAlign: 'center',
            marginBottom: dp(30)
          }}>{this.state.modalTitile}</Text>
          <ScrollView style={styles.scrollView} >
            <Text>{this.state.modalContent}</Text>
          </ScrollView>
        </ModalContent>
      </Modal>
    )
  }

  render () {
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <NavBar title={'四要素鉴权'} navigation={navigation} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            {/* 身份信息 */}
            <Text style={styles.title}>信息已安全加密，仅用于银行验证</Text>
            {/* 开户人姓名 */}
            <FormItemComponent
              title={'开户人姓名'}
              placeholder={'请输入开户人姓名'}
              value={this.state.legalPersonName}
              editable={false}
            />
            <View style={styles.splitLine} />
            {/* 证件类型 */}
            <FormItemComponent
              title={'证件类型'}
              placeholder={'请选择证件类型'}
              editable={false}
              showArrow={true}
              value={this.state.certType[this.state.certTypeIndex]
                ? this.state.certType[this.state.certTypeIndex].name
                : '请选择证件类型'}
              onPress={() => {
                this.showTypeDialog()
              }}
            />
            <View style={styles.splitLine} />
            {/* 证件号码 */}
            <FormItemComponent
              title={'证件号码'}
              placeholder={'请输入证件号码'}
              maxLength={30}
              keyboardType={'numeric'}
              value={this.state.legalPersonCertId}
              editable={false}
            />
            <View style={styles.splitLine} />
            {/* 银行卡号 */}
            <FormItemComponent
              title={'银行卡号'}
              placeholder={'请输入银行卡号'}
              maxLength={50}
              keyboardType={'numeric'}
              value={this.state.cardNo}
              onChangeText={text => {
                this.setState({ cardNo: text })
              }}
            />
            <View style={styles.splitLine} />
            {/* 手机号码 */}
            <FormItemComponent
              title={'手机号码'}
              placeholder={'请输入银行预留手机号码'}
              maxLength={11}
              keyboardType={'numeric'}
              value={this.state.bankReservedMobile}
              onChangeText={text => {
                this.setState({ bankReservedMobile: text })
              }}
            />
            <View style={styles.checkline}>
              <CheckBox
                style={styles.checkbox}
                checkBoxColor={'red'}
                uncheckedCheckBoxColor={'#999'}
                checkedCheckBoxColor={'#00b2a9'}
                onClick={() => {
                  this.setState({
                    protocolChecked: !this.state.protocolChecked
                  })
                  if (!this.state.hasReadNanJing) {
                    this.tapProtocol(1)
                    this.setState({ hasReadNanJing: true })
                  }
                }}
                isChecked={this.state.protocolChecked}
                checkedImage={<Iconfont style={styles.checkboxIcon} name={'yigouxuan'} size={dp(32)} color={Color.WX_GREEN} />}
                unCheckedImage={<Iconfont style={styles.checkboxIcon} name={'weigouxuan'} size={dp(32)} color={Color.WX_GREEN} />}
                rightText={'我已阅读并同意'}
                rightTextStyle={{ color: Color.TEXT_MAIN }}
              />
              <Text onPress={() => this.tapProtocol(1)} style={styles.protocol}>《个人征信授权协议》</Text>
              <Text onPress={() => this.tapProtocol(2)} style={styles.protocol}>《电子账户服务协议》</Text>
              <Text onPress={() => this.tapProtocol(3)} style={styles.protocol}>《个人信息查询使用授权协议》</Text>
              <Text onPress={() => this.tapProtocol(4)} style={styles.protocol}>《服务协议》</Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: dp(60) }}>
              <SolidBtn onPress={this.bindSubmit} text={'提交'} disabled={this.disabled()} />
            </View>
          </View>
        </ScrollView>
        {this.renderProtocolModal()}
        {this.state.showShadow
          ? <TouchableWithoutFeedback onPress={() => {
            Picker.hide()
            this.hideShadow()
          }}>
            <View style={styles.shadow}></View>
          </TouchableWithoutFeedback> : null}
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    erjiOrderSubmitData: state.order.erjiOrderSubmitData
  }
}

export default connect(mapStateToProps)(FourElementsByNanJing)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4'
  },
  splitLine: {
    height: 1,
    marginHorizontal: dp(30),
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: dp(30),
    color: Color.TEXT_DARK,
    paddingLeft: dp(30),
    paddingTop: dp(40),
    paddingBottom: dp(20)
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: dp(120),
    paddingHorizontal: dp(30),
    backgroundColor: 'white'
  },
  name: {
    width: DEVICE_WIDTH * 0.28,
    paddingRight: dp(30),
    fontWeight: 'bold'
  },
  input: {
    flex: 1,
    fontSize: dp(28),
    color: Color.TEXT_MAIN
  },
  code: {
    fontSize: dp(28),
    color: '#3DC2B8',
    padding: dp(12)
  },
  checkbox: {
    width: DEVICE_WIDTH * 0.37
  },
  checkline: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: Color.TEXT_LIGHT,
    paddingTop: dp(30),
    paddingHorizontal: dp(30),
    paddingRight: dp(10),
    flexWrap: 'wrap'
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    right: 0,
    top: 0,
    bottom: 0,
    left: 0
  },
  protocol: {
    color: '#5C94D6',
    fontSize: dp(29),
    marginBottom: dp(10)
  },
  scrollView: {
    maxHeight: DEVICE_HEIGHT * 0.65
  }
})
