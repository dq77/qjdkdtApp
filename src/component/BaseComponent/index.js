/* eslint-disable */
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, NavigationEvents } from 'react-navigation';
import navigator from '../../navigation/navigator';
import NavBar from '../NavBar';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import ErrorPage from '../DefaultPage/ErrorPage';
import LoadingPage from '../DefaultPage/LoadingPage';

import { Provider } from '@ant-design/react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});


export default class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    const parentNavigation = this.props.navigation.dangerouslyGetParent();
    navigator.setRouters(parentNavigation.state.routes, parentNavigation);
    this.navigator = navigator;
    this.navParams = this.props.navigation.state.params;
    this.state = {
      pageState: 'success',
      errorMsg: '',
    }
  }

  _headerProps() {
    return {};
  }

  _renderHeader() {
    return <NavBar isTranslucent {...this._headerProps()} />;
  }

  _containerStyle() {
    return { backgroundColor: '#F8F8F9' };
  }

  _render() {
    return null;
  }

  _renderBase() {
    return null;
  }

  _renderLoading() {
    return <LoadingPage />;
  }

  _renderError() {
    const { errorMsg } = this.state;
    const netErrorMsg = ['连接到服务器失败'];
    return netErrorMsg.includes(errorMsg) ? (
      <ErrorPage
        title="暂无网络连接"
        type="error"
        onPress={() => this._reload()}
      />
    ) : (
        <ErrorPage
          title={errorMsg || '连接服务器出错'}
          type="error"
          onPress={() => this._reload()}
        />
      );
  }

  _reload() {
    return null;
  }

  onWillFocus() {
    StatusBar.setBarStyle('dark-content');
  }

  onWillBlur() {

  }

  _forceInset() {
    return {}
  }


  render() {
    const { pageState } = this.state;
    return (
      <Provider>
        <SafeAreaView
          style={[styles.container, this._containerStyle()]}
          forceInset={{
            top: 'never',
            ...this._forceInset()
          }}
        >

          {this._renderHeader()}
          {pageState === 'error' ? this._renderError() : null}
          {pageState === 'loading' ? this._renderLoading() : null}
          {(pageState === 'success' || !pageState) && (
            this._renderBase() || <KeyboardAwareScrollView>{this._render()}</KeyboardAwareScrollView>
          )}
          <NavigationEvents onWillFocus={this.onWillFocus} onWillBlur={this.onWillBlur} />
        </SafeAreaView>
      </Provider>
    );
  }
}
