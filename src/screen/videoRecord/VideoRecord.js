import React, { PureComponent } from 'react'
import { StyleSheet, Button, View, Text } from 'react-native'
import CameraView from '../../component/camera/CameraView'
import { RNCamera } from 'react-native-camera'

export default class VideoRecord extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          ref={cam => (this.camera = cam)}
          isVideo={true}
          closePreview={true}
          recordingOptions={{
            quality: RNCamera.Constants.VideoQuality['480p'],
            maxFileSize: 10 * 1024 * 1024
          }}
          navigation={navigation}
          sideType={RNCamera.Constants.Type.front}
          callback={data => {
            console.log(data.uri)
            navigation.goBack()
            navigation.state.params.callback(data)
          }}
        />
      </View>
    )
  }

  componentDidMount () { }
}
const styles = StyleSheet.create({})
