/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import "QJDUpdateView.h"
#import "WXApi.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate,WXApiDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) QJDUpdateView *updateView;

@end
