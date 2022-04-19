import React, { PureComponent } from 'react'
import { StyleSheet, Text, ScrollView, View } from 'react-native'
import NavBar from '../../component/NavBar'
import { DEVICE_WIDTH, getRealDP as dp, DEVICE_HEIGHT } from '../../utils/screenUtil'
import Color from '../../utils/Color'
import Iconfont from '../../iconfont/Icon'
import { SolidBtn, StrokeBtn } from '../../component/CommonButton'
import { connect } from 'react-redux'
import { injectUnmount, toDateStr } from '../../utils/Utility'
import ProgressChartTwoAngle from '../../component/ProgressChartTwoAngle'
import ajaxStore from '../../utils/ajaxStore'
import { projectEvaluationStatus, undertakeMode } from '../../utils/enums'
import { open } from '../../utils/FileReaderUtils'
import { baseUrl } from '../../utils/config'
import Touchable from '../../component/Touchable'
import { onEvent, onClickEvent } from '../../utils/AnalyticsUtil'

@injectUnmount
class ProjectEvaluationDetail extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      id: '',
      detail: {},
    }
  }

  getChartColor(resultScore) {
    let color
    if (resultScore < 60) {
      color = '#F55849'
    } else {
      color = '#2A6EE7'
    }
    return color
  }

  async getProjectEvaluationDetail() {
    const res = await ajaxStore.project.getProjectEvaluationDetail({ id: this.state.id })
    if (res.data && res.data.code === '0') {
      res.data.data.gmtModified = toDateStr(res.data.data.gmtModified, 'yyyy年MM月dd日')
      this.setState({
        detail: res.data.data,
      })
    }
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state
    await this.setState({
      id: params.id || '',
    })
    this.getProjectEvaluationDetail()
    this.didFocusListener = this.props.navigation.addListener('didFocus', (obj) => {
      this.getProjectEvaluationDetail()
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  async checkFile(fileKey) {
    console.log(fileKey)
    global.loading.show()
    await open(`${baseUrl}/ofs/front/file/preview?fileKey=${fileKey}`)
    global.loading.hide()
  }

  async cancel() {
    global.confirm.show({
      title: '确认取消评估',
      content: '取消评估后，可以再评估列表重新发起',
      confirmText: '确认',
      confirm: async () => {
        global.loading.show()
        const res = await ajaxStore.project.cancelProjectEvaluation({ id: this.state.id })
        global.loading.hide()
        if (res.data && res.data.code === '0') {
          onEvent('项目评估-评估详情页-取消评估', 'ProjectEvaluationDetail', '/erp/evaluation/project/cancel')
          this.getProjectEvaluationDetail()
          global.alert.show({
            content: '取消成功',
          })
        }
      },
    })
  }

  render() {
    const { navigation } = this.props
    const {
      name,
      status,
      resultScore,
      gmtModified,
      provinceName,
      cityName,
      areaName,
      address,
      partyA,
      tenderAttachmentList,
      bidsAttachmentList,
      contractAttachmentList,
    } = this.state.detail
    const undertakeModeName = this.state.detail.undertakeMode
    return (
      <View>
        <NavBar title={'项目评估详情'} navigation={navigation} />
        <ScrollView style={styles.scrollMain} keyboardShouldPersistTaps="handled">
          <View style={styles.pageMain}>
            {JSON.stringify(this.state.detail) !== '{}' ? (
              <View>
                <View style={styles.itemBlock}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.normalFont}>{projectEvaluationStatus[status]}</Text>
                    <Text style={styles.normalFont}>{gmtModified}</Text>
                  </View>
                  <View style={styles.progressMain}>
                    {status === 1 || status === 2 ? (
                      <ProgressChartTwoAngle
                        style={styles.progress}
                        colorsEndTop={['#EAEAF1', '#EAEAF1']}
                        colorsEndBottom={['#EAEAF1', '#EAEAF1']}
                        showOneTextFont={dp(60)}
                        showOneTextColor={'#EAEAF1'}
                        text={'--'}
                        strokeWidths={[dp(20), dp(20), dp(20), dp(20)]}
                        openAngle={120}
                        rotate={-30}
                        openAngleData={0}
                        radius={dp(DEVICE_WIDTH / 3)}
                        widthBG={dp(DEVICE_WIDTH * 0.75)}
                        heightBG={dp(DEVICE_WIDTH * 0.75)}
                      />
                    ) : (
                      <ProgressChartTwoAngle
                        style={styles.progress}
                        colorsEndTop={[this.getChartColor(resultScore), this.getChartColor(resultScore)]}
                        colorsEndBottom={['#EAEAF1', '#EAEAF1']}
                        showOneTextFont={dp(36)}
                        showOneTextColor={this.getChartColor(resultScore)}
                        text={resultScore}
                        strokeWidths={[dp(20), dp(20), dp(20), dp(20)]}
                        openAngle={120}
                        rotate={-30}
                        openAngleData={(resultScore / 100).toFixed(2)}
                        radius={dp(DEVICE_WIDTH / 3)}
                        widthBG={dp(DEVICE_WIDTH * 0.75)}
                        heightBG={dp(DEVICE_WIDTH * 0.75)}
                      />
                    )}
                  </View>
                  <Text style={styles.title}>{name}</Text>
                </View>
                <View style={styles.itemBlock}>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>项目地址：</Text>
                    <Text style={styles.itemValue}>{provinceName + cityName + areaName + address}</Text>
                  </View>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>甲方公司：</Text>
                    <Text style={styles.itemValue}>{partyA}</Text>
                  </View>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>招标文件：</Text>
                    <View style={styles.fileMain}>
                      {tenderAttachmentList.map((item, key) => {
                        return (
                          <Touchable style={styles.fileItem} onPress={() => this.checkFile(item.fileKey)}>
                            <Text style={styles.fileName}>{item.name}</Text>
                          </Touchable>
                        )
                      })}
                    </View>
                  </View>
                </View>
                <View style={styles.itemBlock}>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>项目承接方：</Text>
                    <Text style={styles.itemValue}>{undertakeMode[undertakeModeName]}</Text>
                  </View>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>投标文件：</Text>
                    <View style={styles.fileMain}>
                      {bidsAttachmentList.map((item, key) => {
                        return (
                          <Touchable style={styles.fileItem} onPress={() => this.checkFile(item.fileKey)}>
                            <Text style={styles.fileName}>{item.name}</Text>
                          </Touchable>
                        )
                      })}
                    </View>
                  </View>
                </View>
                <View style={styles.itemBlock}>
                  <View style={styles.itemLine}>
                    <Text style={styles.normalFont}>合同文件：</Text>
                    <View style={styles.fileMain}>
                      {contractAttachmentList.map((item, key) => {
                        return (
                          <Touchable style={styles.fileItem} onPress={() => this.checkFile(item.fileKey)}>
                            <Text style={styles.fileName}>{item.name}</Text>
                          </Touchable>
                        )
                      })}
                    </View>
                  </View>
                </View>
                <View style={styles.btn}>
                  {status === 2 ? (
                    <SolidBtn
                      style={styles.btnItem}
                      text={'修改'}
                      onPress={() => {
                        onClickEvent('项目评估-评估详情页-重新发起评估', 'ProjectEvaluationDetail')
                        this.props.navigation.navigate('ProjectEvaluationForm', {
                          detail: this.state.detail,
                        })
                      }}
                    />
                  ) : status === 1 ? (
                    <StrokeBtn
                      style={styles.cancelBtn}
                      text={'取消评估'}
                      color="#91969A"
                      onPress={() => {
                        this.cancel()
                      }}
                    />
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  scrollMain: {
    height: DEVICE_HEIGHT,
    backgroundColor: '#F7F7F9',
  },
  pageMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingBottom: dp(300),
  },
  itemBlock: {
    padding: dp(30),
    borderRadius: dp(16),
    backgroundColor: '#fff',
    width: DEVICE_WIDTH * 0.9,
    marginBottom: dp(30),
  },
  detailHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  normalFont: {
    color: '#91969A',
    fontSize: dp(28),
  },
  btn: {
    marginTop: dp(80),
  },
  cancelBtn: {
    borderColor: '#91969A',
    borderRadius: dp(50),
  },
  btnItem: {
    marginBottom: dp(30),
    borderRadius: dp(50),
  },
  progress: {
    // marginTop: dp(20)
  },
  progressMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: dp(20),
  },
  title: {
    fontSize: dp(28),
    color: '#2D2926',
    textAlign: 'center',
    marginTop: dp(-30),
  },
  itemLine: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(20),
  },
  itemValue: {
    maxWidth: DEVICE_WIDTH * 0.65,
    fontSize: dp(28),
    textAlign: 'right',
  },
  fileItem: {
    marginBottom: dp(20),
  },
  fileMain: {
    maxWidth: DEVICE_WIDTH * 0.65,
  },
  fileName: {
    textAlign: 'right',
    color: '#2A6EE7',
  },
})

const mapStateToProps = (state) => {
  return {
    companyInfo: state.company,
  }
}

export default connect(mapStateToProps)(ProjectEvaluationDetail)
