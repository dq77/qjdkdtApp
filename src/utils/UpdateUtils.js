import { NativeModules, Platform } from 'react-native'
import CodePush from 'react-native-code-push'
import { showToast } from './Utility'
import { defaultEnv } from './config'
export async function update () {
  if (Platform.OS === 'android') {
    NativeModules.UpdateModule.update()
  } else {

  }
}

export function hotUpdate (loading) {
  // console.log(getKey())
  CodePush.checkForUpdate().then((update) => {
    // console.log(update)
    if (update && update.isMandatory) { // 需要强更
      CodePush.sync(
        {
          deploymentKey: getKey()
        },
        (status) => { codePushStatusDidChange(status, loading) },
        (progress) => { codePushDownloadDidProgress(progress, loading) }
      )
    } else { // 无更新 或 无感更新
      CodePush.sync(
        {
          deploymentKey: getKey(),
          installMode: CodePush.InstallMode.ON_NEXT_RESUME,
          minimumBackgroundDuration: 15
        }
      )
    }
  })
  // {
  //   updateDialog: {
  //     appendReleaseDescription: true,
  //     descriptionPrefix: '更新内容：\n',
  //     title: '发现新版本',
  //     mandatoryUpdateMessage: '',
  //     mandatoryContinueButtonLabel: '确定'
  //   }
  // },
  // (status) => { codePushStatusDidChange(status, loading) },
  // (progress) => {
  //   codePushDownloadDidProgress(progress, loading)
  // }
}

function codePushStatusDidChange (status, loading) {
  switch (status) {
    case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
      break
    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
      loading.show('更新中')
      break
    case CodePush.SyncStatus.INSTALLING_UPDATE:
      loading.show('安装中')
      break
    case CodePush.SyncStatus.UP_TO_DATE:
      break
    case CodePush.SyncStatus.UPDATE_INSTALLED:
      loading.hide()
      break
  }
}

function codePushDownloadDidProgress (progress, loading) {
  const curPercent = (progress.receivedBytes / progress.totalBytes * 100).toFixed(0)
  loading.show(`更新中(${curPercent}%)`)
}

function getKey () {
  let deploymentKey = ''
  if (Platform.OS === 'android') {
    deploymentKey = defaultEnv
      ? 'EKow-TMqRAwfShZ-Fvn8W5RDtIuLERFkRUBSM' // 测试
      : '9MgdbC_2WElKDSxWejSzRid7nEHzMS95L9C2q-' // 正式
  } else {
    deploymentKey = defaultEnv
      ? 'D-pZFrlUjmHcxvYMm_CTH18h46G5Bt5X_uZgu' // 测试
      : 'xtQwLpDBXmyUFniiauERAgeaYDCUfR50an3PH' // 正式
  }
  return deploymentKey
}
