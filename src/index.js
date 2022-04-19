import React from 'react'
import { YellowBox } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import StackViewStyleInterpolator from 'react-navigation-stack/lib/commonjs/views/StackView/StackViewStyleInterpolator'
// import {createDrawerNavigator} from 'react-navigation-drawer';
import { createBottomTabNavigator } from 'react-navigation-tabs'
import TabBarComponent from './component/BottomTabBar'
import ERPTabBarComponent from './component/ERPTabBarComponent'
import SAASTabBarComponent from './component/SAASTabBarComponent'
import Certification from './screen/certification/Certification'
import CertificationFail from './screen/certification/CertificationFail'
import EsignFaceIdentity from './screen/common/EsignFaceIdentity'
import FaceIdentity from './screen/common/FaceIdentity'
import Login from './screen/common/Login'
import PreviewPDF from './screen/common/PreviewPDF'
import Register from './screen/common/Register'
import WebView from './screen/common/WebView'
import AutoSignProcess from './screen/contract/AutoSignProcess'
import SignatoryAuth from './screen/contract/component/SignatoryAuth'
import ContractDetail from './screen/contract/ContractDetail'
import ContractList from './screen/contract/ContractList'
import ContractSign from './screen/contract/ContractSign'
import CSContractDetail from './screen/contract/CSContractDetail'
import CSContractSign from './screen/contract/CSContractSign'
import CSSigning from './screen/contract/CSSigning'
import CSSignPersonList from './screen/contract/CSSignPersonList'
import CSSignSuccess from './screen/contract/CSSignSuccess'
import EtcSign from './screen/contract/EtcSign'
import LegalRealName from './screen/contract/LegalRealName'
import LegalRealNameSuccess from './screen/contract/LegalRealNameSuccess'
import OtherContractDetail from './screen/contract/OtherContractDetail'
import OtherContractSign from './screen/contract/OtherContractSign'
import OtherSigning from './screen/contract/OtherSigning'
import OtherSignPersonList from './screen/contract/OtherSignPersonList'
import OtherSignSuccess from './screen/contract/OtherSignSuccess'
import PayMemberFee from './screen/contract/PayMemberFee'
import Signing from './screen/contract/Signing'
import SignPersonList from './screen/contract/SignPersonList'
import SignSuccess from './screen/contract/SignSuccess'
import AddSupplier from './screen/credit/AddSupplier'
import BusinessTypeCompare from './screen/credit/BusinessTypeCompare'
import BusinessTypeSelect from './screen/credit/BusinessTypeSelect'
import CreditByPC from './screen/credit/CreditByPC'
import CreditFail from './screen/credit/CreditFail'
import Crediting from './screen/credit/Crediting'
import CreditOther from './screen/credit/CreditOther'
import CreditSummary from './screen/credit/CreditSummary'
import GuaranteelUpload from './screen/credit/GuaranteelUpload'
import HouseUpload from './screen/credit/HouseUpload'
import IDCardBackResult from './screen/credit/IDCardBackResult'
import IDCardFrontResult from './screen/credit/IDCardFrontResult'
import IdcardUpload from './screen/credit/IdcardUpload'
import NormalUpload from './screen/credit/NormalUpload'
import AddTrance from './screen/crm/AddTrance'
import CrmCreat from './screen/crm/CrmCreat'
import CrmDetail from './screen/crm/CrmDetail'
import CrmList from './screen/crm/CrmList'
import BuyCar from './screen/erp/BuyCar'
import ChangeOrder from './screen/erp/ChangeOrder'
import DeliverGoods from './screen/erp/DeliverGoods'
import DeliverList from './screen/erp/DeliverList'
import ERPOrderDetail from './screen/erp/ERPOrderDetail'
import ERPOrderList from './screen/erp/ERPOrderList'
import OrderCreateSuccess from './screen/erp/OrderCreateSuccess'
import ProductList from './screen/erp/ProductList'
import SupplierDetail from './screen/erp/SupplierDetail'
import SupplierEdit from './screen/erp/SupplierEdit'
import SupplierList from './screen/erp/SupplierList'
import AccountSetting from './screen/home/AccountSetting'
import Pending from './screen/home/component/Pending'
import CreditSaleDec from './screen/home/CreditSaleDec'
import CreditSaleDecInfo from './screen/home/CreditSaleDecInfo'
import DataPage from './screen/home/DataPage'
import GuestTool from './screen/home/GuestTool'
import GuestToolCreat from './screen/home/GuestToolCreat'
import GuestToolCreatSuccess from './screen/home/GuestToolCreatSuccess'
import GuestToolMapDepot from './screen/home/GuestToolMapDepot'
import Home from './screen/home/Home'
import MessageCenter from './screen/home/MessageCenter'
import MessageCenterDec from './screen/home/MessageCenterDec'
import NoticeList from './screen/home/NoticeList'
import NoticeListDec from './screen/home/NoticeListDec'
import Purchase from './screen/home/Purchase'
import QuotaManage from './screen/home/QuotaManage'
import OtherProjectManageCreate from './screen/homeProjectManage/OtherProjectManageCreate'
import OtherProjectManageDetail from './screen/homeProjectManage/OtherProjectManageDetail'
import OtherProjectManageList from './screen/homeProjectManage/OtherProjectManageList'
import ProjectEvaluationDetail from './screen/homeProjectManage/ProjectEvaluationDetail'
import ProjectEvaluationForm from './screen/homeProjectManage/ProjectEvaluationForm'
import ProjectEvaluationList from './screen/homeProjectManage/ProjectEvaluationList'
import ProjectEvaluationSuccess from './screen/homeProjectManage/ProjectEvaluationSuccess'
import ProjectInfoManage from './screen/homeProjectManage/ProjectInfoManage'
// Screen
import ProjectManage from './screen/homeProjectManage/ProjectManage'
import BatchPay from './screen/loan/BatchPay'
import ContractsByNanJing from './screen/loan/ContractsByNanJing'
import ExtractByNanJing from './screen/loan/ExtractByNanJing'
import Loan from './screen/loan/Loan'
import LoanBill from './screen/loan/LoanBill'
import LoanDetail from './screen/loan/LoanDetail'
import LoanPay from './screen/loan/LoanPay'
import LoanPaySuccess from './screen/loan/LoanPaySuccess'
import LoanRepayment from './screen/loan/LoanRepayment'
import PayHistory from './screen/loan/PayHistory'
import RechargeByNanJing from './screen/loan/RechargeByNanJing'
import AccountCreate from './screen/mine/AccountCreate'
import AccountList from './screen/mine/AccountList'
import AgentCreate from './screen/mine/AgentCreate'
import AgentList from './screen/mine/AgentList'
import EnterpriseFillInfo from './screen/mine/Auth/EnterpriseFillInfo'
import EnterpriseInfo from './screen/mine/Auth/EnterpriseInfo'
import EnterprisePlayVali from './screen/mine/Auth/EnterprisePlayVali'
import EnterpriseRealAuth from './screen/mine/Auth/EnterpriseRealAuth'
import EnterpriseRealAuthFail from './screen/mine/Auth/EnterpriseRealAuthFail'
import EnterpriseRealAuthSuccess from './screen/mine/Auth/EnterpriseRealAuthSuccess'
import NaturalPersonAuth from './screen/mine/Auth/NaturalPersonAuth'
import RealNameAuthList from './screen/mine/Auth/RealNameAuthList'
import BusinessStatement from './screen/mine/BusinessStatement'
import CompanyBaseInfo from './screen/mine/CompanyBaseInfo'
import ContactUs from './screen/mine/ContactUs'
import CouponUsageRule from './screen/mine/CouponUsageRule'
import HistoricalOpinionInfo from './screen/mine/HistoricalOpinionInfo'
import IntroducPackage from './screen/mine/IntroducPackage'
import MemberCenter from './screen/mine/MemberCenter'
import MembershipRule from './screen/mine/MembershipRule'
import RealNameAuth from './screen/mine/RealNameAuth'
import VipUpgradeRenewal from './screen/mine/VipUpgradeRenewal'
import YSBill from './screen/mine/YSBill'
import ApplyInvoice from './screen/order/ApplyInvoice'
import ApplyLoan from './screen/order/ApplyLoan'
import CreditInformationByBank from './screen/order/CreditInformationByBank'
import FourElements from './screen/order/FourElements'
import FourElementsByNanJing from './screen/order/FourElementsByNanJing'
import FourElementsProtocol from './screen/order/FourElementsProtocol'
import FourElementsResult from './screen/order/FourElementsResult'
import InvoiceInfo from './screen/order/InvoiceInfo'
import Order from './screen/order/Order'
import OrderAddGoods from './screen/order/OrderAddGoods'
import OrderCreate from './screen/order/OrderCreate'
import OrderCreateStepOne from './screen/order/OrderCreateStepOne'
import OrderCreateStepTwo from './screen/order/OrderCreateStepTwo'
import OrderDetail from './screen/order/OrderDetail'
import OrderSelectSupplier from './screen/order/OrderSelectSupplier'
import ProjectCreate from './screen/order/ProjectCreate'
import ProjectDetail from './screen/order/ProjectDetail'
import ProjectList from './screen/order/ProjectList'
import ProjectOrderCreateStepTwo from './screen/order/ProjectOrderCreateStepTwo'
import SAASProductList from './screen/saas/component/SAASProductList'
import SAASAccount from './screen/saas/SAASAccount'
import SAASAccountDetail from './screen/saas/SAASAccountDetail'
import SAASOrderCreat from './screen/saas/SAASOrderCreat'
import SAASOrderDetail from './screen/saas/SAASOrderDetail'
import SAASOrderList from './screen/saas/SAASOrderList'
import SAASProductDetail from './screen/saas/SAASProductDetail'
import SAASSelectProductList from './screen/saas/SAASSelectProductList'
import SAASSupplierEdit from './screen/saas/SAASSupplierEdit'
import AgentContact from './screen/staticPage/AgentContact'
import AuthAgent from './screen/staticPage/AuthAgent'
import RegisterContact from './screen/staticPage/RegisterContact'
import VideoRecord from './screen/videoRecord/VideoRecord'

YellowBox.ignoreWarnings([
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Module RCTImageLoader requires',
  'Warning: componentWillUpdate is deprecated',
  'Require cycle:',
])

const stackConfig = {
  // mode: 'modal',
  // 用于设置安卓卡片式跳转
  transitionConfig: () => ({
    screenInterpolator: StackViewStyleInterpolator.forHorizontal,
  }),
  navigationOptions: () => ({
    // 方向问题 default用于正常行为或inverted从右向左滑动。
    gestureDirection: 'default',
    // 从屏幕边缘开始触摸的距离以识别手势  h水平  v垂直
    // gestureResponseDistance: {
    //   horizontal: 200,
    //   vertical: 200
    // },

    // 背景透明度 不会影响文字
    headerTransparent: true,
    gesturesEnabled: true,
  }),
  // 默认导航头样式设置
  defaultNavigationOptions: {
    header: null,
  },
}

const MainTabs = createBottomTabNavigator(
  {
    Home,
    Pending,
    Purchase,
    AccountSetting,
  },
  {
    tabBarComponent: props => <TabBarComponent {...props} />,
    backBehavior: 'none',
    tabBarOptions: {
      keyboardHidesTabBar: true,
    },
  },
)
const ERPTabs = createBottomTabNavigator(
  {
    SupplierList,
    ProductList,
    ERPOrderList,
  },
  {
    tabBarComponent: props => <ERPTabBarComponent {...props} />,
    backBehavior: 'none',
    tabBarOptions: {
      keyboardHidesTabBar: true,
    },
  },
)
const SAASTabs = createBottomTabNavigator(
  {
    SAASOrderList,
    SAASProductList,
    SAASAccount,
  },
  {
    tabBarComponent: props => <SAASTabBarComponent {...props} />,
    backBehavior: 'none',
    tabBarOptions: {
      keyboardHidesTabBar: true,
    },
  },
)

const RootStack = createStackNavigator(
  {
    MainTabs,
    ERPTabs,
    SAASTabs,
    WebView,
    FaceIdentity,
    EsignFaceIdentity,
    Login,
    Register,
    RegisterContact,
    VideoRecord,
    Certification,
    CertificationFail,
    AddSupplier,
    CreditSummary,
    NormalUpload,
    IdcardUpload,
    HouseUpload,
    BusinessTypeSelect,
    BusinessTypeCompare,
    CreditByPC,
    CreditOther,
    IDCardFrontResult,
    IDCardBackResult,
    GuaranteelUpload,
    CreditFail,
    Crediting,
    PreviewPDF,
    LegalRealName,
    LegalRealNameSuccess,
    OrderDetail,
    OrderSelectSupplier,
    InvoiceInfo,
    FourElements,
    FourElementsProtocol,
    FourElementsResult,
    FourElementsByNanJing,
    OrderCreate,
    CreditInformationByBank,
    RechargeByNanJing,
    ExtractByNanJing,
    Loan,
    LoanDetail,
    LoanPay,
    LoanRepayment,
    LoanPaySuccess,
    ContractsByNanJing,
    ApplyInvoice,
    OrderAddGoods,
    EtcSign,
    PayMemberFee,
    AutoSignProcess,
    CompanyBaseInfo,
    ContactUs,
    ContractList,
    SignPersonList,
    ContractSign,
    Signing,
    SignSuccess,
    ContractDetail,
    CSSignPersonList,
    CSContractSign,
    CSSigning,
    CSSignSuccess,
    CSContractDetail,
    OtherSignPersonList,
    OtherContractSign,
    OtherSigning,
    OtherSignSuccess,
    OtherContractDetail,
    AccountCreate,
    AccountList,
    AgentList,
    AgentCreate,
    AgentContact,
    AuthAgent,
    MembershipRule,
    RealNameAuth,
    RealNameAuthList,
    EnterpriseRealAuth,
    EnterpriseFillInfo,
    EnterpriseRealAuthFail,
    EnterpriseRealAuthSuccess,
    EnterprisePlayVali,
    EnterpriseInfo,
    NaturalPersonAuth,
    SignatoryAuth,
    MemberCenter,
    OrderCreateStepOne,
    OrderCreateStepTwo,
    ProjectOrderCreateStepTwo,
    ProjectCreate,
    AccountSetting,
    ApplyLoan,
    HistoricalOpinionInfo,
    BusinessStatement,
    IntroducPackage,
    CouponUsageRule,
    VipUpgradeRenewal,
    LoanBill,
    BatchPay,
    QuotaManage,
    CreditSaleDec,
    CreditSaleDecInfo,
    PayHistory,
    MessageCenter,
    MessageCenterDec,
    YSBill,
    ProjectList,
    ProjectDetail,
    SupplierList,
    SupplierEdit,
    SupplierDetail,
    NoticeList,
    NoticeListDec,
    GuestTool,
    GuestToolCreat,
    GuestToolCreatSuccess,
    GuestToolMapDepot,
    DataPage,
    CrmList,
    CrmCreat,
    CrmDetail,
    Order,
    AddTrance,
    ProjectEvaluationList,
    ProjectEvaluationForm,
    ProjectEvaluationSuccess,
    ProjectEvaluationDetail,
    ProjectManage,
    ProjectInfoManage,
    OtherProjectManageList,
    OtherProjectManageCreate,
    OtherProjectManageDetail,
    ProductList,
    ERPOrderDetail,
    DeliverList,
    DeliverGoods,
    ChangeOrder,
    BuyCar,
    OrderCreateSuccess,
    SAASAccount,
    SAASProductList,
    SAASOrderList,
    SAASProductDetail,
    SAASAccountDetail,
    SAASOrderCreat,
    SAASSelectProductList,
    SAASOrderDetail,
    SAASSupplierEdit,
  },
  {
    ...stackConfig,
    initialRouteName: 'MainTabs',
  },
)
export default createAppContainer(RootStack)
