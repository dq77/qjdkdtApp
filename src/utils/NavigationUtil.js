import { onPageStart, onPageEnd } from './AnalyticsUtil'

function getCurrentRouteName (navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  if (route.routes) {
    return getCurrentRouteName(route)
  }
  return route.routeName
}

export function onNavigationStateChange (prevState, currentState) {
  const currentScreen = getCurrentRouteName(currentState)
  const prevScreen = getCurrentRouteName(prevState)
  // console.log('-----------')
  // console.log(prevScreen)
  // console.log(currentScreen)

  if (prevScreen !== currentScreen) {
    global.currentScreen = currentScreen
    onPageEnd(prevScreen)
    onPageStart(currentScreen)
  }
}
