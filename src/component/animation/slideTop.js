import { Animated } from 'react-native'
import { Animation } from 'react-native-modals'

export class SlideTop extends Animation {
  in(onFinished) {
    Animated.spring(this.animate, {
      toValue: 1,
      useNativeDriver: this.useNativeDriver,
    }).start(onFinished)
  }

  out(onFinished) {
    Animated.spring(this.animate, {
      toValue: 0,
      useNativeDriver: this.useNativeDriver,
    }).start(onFinished)
  }

  getAnimations() {
    return {
      transform: [
        {
          translateY: this.animate.interpolate({
            inputRange: [0, 1],
            outputRange: [800, 1],
          }),
        },
      ],
    }
  }
}
