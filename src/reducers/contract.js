import actionTypes from '../actions/actionType'
import { blurIdCard } from '../utils/Utility'

const initialStore = {
  memberFeeContractList: [], // 会员费协议
  newMemberFeeContractList: [], // 新会员费协议
  twoPartyContractList: [], // 两方合同
  infoContractList: [], // 信息服务协议
  guarantorContractList: [], // 最高额保证合同
  serviceFeeContractList: [], // 居间服务协议
  secondContractList: [], // 二级合同列表总览
  otherContractList: [], // 其他合同列表
  CSContractList: [], // 贸易合同合同列表
  guarantorList: [], // 担保人列表
  guarantorPaperList: [], // 最高额保证纸质合同列表
  guarantorContractsNoTicket: [], // 无票业务担保函
}

const contract = (state = initialStore, action) => {
  switch (action.type) {
    case actionTypes.GET_SECOND_CONTRACT_INFO:
      const secondContractList = []
      console.log(action.contractInfo, 'action.contractInfo')
      for (const key in action.contractInfo.productContracts) {
        action.contractInfo.productContracts[key] &&
          action.contractInfo.productContracts[key].map((contractItem, contractKey) => {
            action.contractInfo.productContracts[key][contractKey].signStatus =
              contractItem.status === 'SIGN_SUCCESS' ? '1' : '0'
          })
        secondContractList.push({
          supplierName: key,
          contractList: action.contractInfo.productContracts[key],
        })
      }

      action.contractInfo.noTicketGuarantorcontracts &&
        action.contractInfo.noTicketGuarantorcontracts.map((item, key) => {
          action.contractInfo.noTicketGuarantorcontracts[key].guarantor = {
            code: item.code,
            processInstanceId: item.processInstanceId,
            signStatus: item.status === 'SIGN_SUCCESS' ? '1' : '0',
          }
        })
      const noTicketGuarantorcontracts = action.contractInfo.noTicketGuarantorcontracts

      // 首先找到household相同的夫妻，合并成一条数据，然后遍历两个人的合同，只要有一份状态已签署，则该条数据即为已签署状态。合并数据后进行二次遍历，找合同中是否有type=13的合同，如果有，判断是否有code，如果没有则生成合同；如果没有type=13的合同，也生成合同，生成合同后拿到13的合同，并且processInstanceId跳转至签署人列表页。如果有type=13的合同，并且processInstanceId!==null，则跳转签署人列表页
      let guarantorContractsList = action.contractInfo.guarantorContracts
      guarantorContractsList &&
        guarantorContractsList.map((item, key) => {
          if (item.guarantor.household) {
            guarantorContractsList.map((item2, key2) => {
              console.log(item.guarantor.household, item2.guarantor.household)
              if (
                item2.guarantor.household === item.guarantor.household &&
                item2.guarantor.id !== item.guarantor.id &&
                !item.guarantor.delete &&
                !item2.guarantor.delete
              ) {
                guarantorContractsList.push({
                  contracts: item.contracts.concat(item2.contracts),
                  guarantor: {
                    name: `${item.guarantor.name}，${item2.guarantor.name}`,
                  },
                  guarantorList: [item.guarantor, item2.guarantor],
                })
                guarantorContractsList[key].guarantor.delete = true
                guarantorContractsList[key2].guarantor.delete = true
              }
            })
          }
        })
      guarantorContractsList =
        guarantorContractsList &&
        guarantorContractsList.filter((item, key) => {
          return !item.guarantor.delete
        })
      guarantorContractsList &&
        guarantorContractsList.map((item, key) => {
          if (!item.guarantorList) {
            guarantorContractsList[key].guarantorList = [guarantorContractsList[key].guarantor]
          }
          let code = ''
          let processInstanceId = ''
          let hasSuccess = false
          guarantorContractsList[key].contracts.map((contractItem, contractKey) => {
            if (contractItem.status === 'SIGN_SUCCESS') {
              guarantorContractsList[key].guarantor.signStatus = '1'
              hasSuccess = true
            }
            if (!hasSuccess) {
              guarantorContractsList[key].guarantor.signStatus = '0'
            }
            if (contractItem.type === '13' && contractItem.code) {
              code = contractItem.code
              if (contractItem.processInstanceId) {
                processInstanceId = contractItem.processInstanceId
              }
            }
            if (contractItem.type === '6' && contractItem.status === 'SIGN_SUCCESS') {
              code = contractItem.code
              processInstanceId = contractItem.processInstanceId
            }
          })
          guarantorContractsList[key].guarantor.code = code
          guarantorContractsList[key].guarantor.processInstanceId = processInstanceId
        })
      console.log(secondContractList, 'secondContractList')
      return {
        ...state,
        guarantorContractList: guarantorContractsList,
        secondContractList,
        guarantorContractsNoTicket: noTicketGuarantorcontracts,
      }
    case actionTypes.GET_OTHER_CONTRACT_LIST:
      let projectSignedNum = 0
      let projectNoSignNum = 0
      let orderSignedNum = 0
      let orderNoSignNum = 0
      action.contractList.companyContractVOList &&
        action.contractList.companyContractVOList.map((item, index) => {
          if (item.electronSchedule === 'SIGN_SUCCESS') {
            action.contractList.companyContractVOList[index].status = '1'
          } else {
            action.contractList.companyContractVOList[index].status = '0'
          }
        })
      action.contractList.projectContractVOList &&
        action.contractList.projectContractVOList.map((projectItem, index) => {
          projectSignedNum = 0
          projectNoSignNum = 0
          orderSignedNum = 0
          orderNoSignNum = 0
          projectItem.projectVOList &&
            projectItem.projectVOList.map((item, key) => {
              if (item.electronSchedule === 'SIGN_SUCCESS') {
                action.contractList.projectContractVOList[index].projectVOList[key].status = '1'
                projectSignedNum++
              } else {
                action.contractList.projectContractVOList[index].projectVOList[key].status = '0'
                projectNoSignNum++
              }
            })
          projectItem.orderContractVOList &&
            projectItem.orderContractVOList.map((orderItem, j) => {
              if (orderItem.electronSchedule === 'SIGN_SUCCESS') {
                action.contractList.projectContractVOList[index].orderContractVOList[j].status = '1'
                orderSignedNum++
              } else {
                action.contractList.projectContractVOList[index].orderContractVOList[j].status = '0'
                orderNoSignNum++
              }
            })
          action.contractList.projectContractVOList[index].signedNum = projectSignedNum
          action.contractList.projectContractVOList[index].noSignNum = projectNoSignNum
          action.contractList.projectContractVOList[index].orderSignedNum = orderSignedNum
          action.contractList.projectContractVOList[index].orderNoSignNum = orderNoSignNum
        })
      return {
        ...state,
        otherContractList: {
          companyContractList: action.contractList.companyContractVOList || [],
          projectContractList: action.contractList.projectContractVOList || [],
        },
      }
    case actionTypes.GET_CS_CONTRACT_LIST:
      action.contractList = action.contractList.filter((item, key) => {
        return item.type !== '29'
      })
      action.contractList.map((item, key) => {
        if (item.status === 'SIGN_SUCCESS') {
          action.contractList[key].status = '1'
        } else if (item.status === 'SIGN_FAILURE' || item.status === 'SIGN') {
          action.contractList[key].status = '0'
        } else {
          action.contractList[key].status = '-1'
        }
      })
      const newMemberFeeContractList = action.contractList.filter(item => {
        return item.type === '10'
      })
      return {
        ...state,
        newMemberFeeContractList,
        CSContractList: action.contractList,
      }
    case actionTypes.GET_GUARANTOR_LIST:
      action.guarantorList.forEach((item, index) => {
        item.guarantorType = item.identityCard === action.legalPersonCertId ? 'LEGAL' : item.guarantorType
        item.identityCardBlured = blurIdCard(item.identityCard || '')
        const hasErjiMax = item.contractVOS.filter(e => {
          return e.type === '13'
        })
        if (hasErjiMax.length > 0) {
          item.clmsGuarantorContractVOS.forEach(e => {
            if (e.contractCode === hasErjiMax[0].code) {
              item.signStatus = e.signStatus
              item.goNewEsign = '1'
              item.contractCode = hasErjiMax[0].code
            }
          })
        } else {
          item.signStatus = '0'
          item.goNewEsign = '0'
        }
      })
      action.guarantorList.forEach((item, index) => {
        if (['REAL_SPOUSES', 'SHAREHOLDER_SPOUSES'].includes(item.guarantorType)) {
          action.guarantorList.forEach((e, i) => {
            if (e.household === item.household && index !== i) {
              item.isShare = e.signStatus !== '0'
            }
          })
        } else {
          item.isShare = true
        }
      })
      return {
        ...state,
        guarantorList: action.guarantorList,
        guarantorPaperList: action.paperList,
      }
    case actionTypes.GET_PRODUCT_CONTRACT_LIST:
      const { guarantorContracts, productContracts } = action.contractInfo
      const guarantorContractsNoTicket = []
      const supplierContracts = {}
      // 担保函无票
      if (guarantorContracts && guarantorContracts.length > 0) {
        guarantorContracts.forEach(item => {
          if (item.guarantor) {
            guarantorContractsNoTicket.push({
              guarantor: item.guarantor || {},
              contract: item.contract || {},
              signStatus: item.contract.status === 'SIGN_SUCCESS' ? '1' : '0',
            })
          }
        })
      }
      // 合同无票
      if (productContracts && productContracts.length > 0) {
        productContracts.forEach(item => {
          item.signStatus = item.status === 'SIGN_SUCCESS' ? '1' : '0'
          if (item.supplierId) {
            if (supplierContracts[item.supplierId]) supplierContracts[item.supplierId].push(item)
            else supplierContracts[item.supplierId] = [item]
          }
        })
      }
      return {
        ...state,
        guarantorContractsNoTicket,
        // supplierContracts,
        secondContractList: {
          ...state.secondContractList,
          supplierList: validContractStatus(mergeContracts(supplierContracts, state.secondContractList.supplierList)),
        },
      }
    case actionTypes.CLEAR_LOGININFO:
      return {
        ...initialStore,
      }
    default:
      return state
  }
}

export default contract

// 合并新老合同列表接口
function mergeContracts(supplierContracts, supplierList) {
  supplierList.forEach(item => {
    if (supplierContracts[item.supplierId] && supplierContracts[item.supplierId].length > 0) {
      item.noTickets = supplierContracts[item.supplierId]
    }
  })
  // 有无票产品的情况下，过滤老接口生成的两方合同、居间服务协议、信息服务协议（好像没有）
  supplierList.forEach((item, i) => {
    item.noTickets &&
      item.noTickets.forEach(item2 => {
        // 过滤两方合同
        item.twoPartyContractList =
          item.twoPartyContractList &&
          item.twoPartyContractList.filter(item3 => item2.productCode !== item3.productCode)
        // 过滤居间服务协议
        item.serviceFeeContractList =
          item.serviceFeeContractList &&
          item.serviceFeeContractList.filter(item3 => item2.productCode !== item3.productCode)
        // 过滤信息服务协议
        item.infoContractList =
          item.infoContractList && item.infoContractList.filter(item3 => item2.productCode !== item3.productCode)
      })
  })

  return supplierList
}

// 计算合同状态
function validContractStatus(supplierList) {
  let noSignNum = 0
  let signedNum = 0
  supplierList.map((item, key) => {
    noSignNum = 0
    signedNum = 0
    item.twoPartyContractList.map((contractItem, index) => {
      if (contractItem.status === '1') {
        signedNum++
      } else {
        noSignNum++
      }
    })
    item.serviceFeeContractList.map((contractItem, index) => {
      if (contractItem.status === '1') {
        signedNum++
      } else {
        noSignNum++
      }
    })
    item.infoContractList.map((contractItem, index) => {
      if (contractItem.status === '1') {
        signedNum++
      } else {
        noSignNum++
      }
    })
    item.noTickets &&
      item.noTickets.map((contractItem, index) => {
        if (contractItem.signStatus === '1') {
          signedNum++
        } else {
          noSignNum++
        }
      })
    supplierList[key].signedNum = signedNum
    supplierList[key].noSignNum = noSignNum
  })
  return supplierList
}
