/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <RNSplashScreen.h>
#import "IQKeyboardManager.h"
#import "Interface.h"
#import <UMCommon/UMCommon.h>
#import <UMCommonLog/UMCommonLogHeaders.h>
#import <UserNotifications/UserNotifications.h>
#import <UMCommon/MobClick.h>
#import <CodePush/CodePush.h>
#import <UMPush/UMessage.h>
#include <arpa/inet.h>
//#import <UMShare/UMShare.h>
//#ifdef FB_SONARKIT_ENABLED
//#import <FlipperKit/FlipperClient.h>
//#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
//#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
//#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
//#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
//#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
//static void InitializeFlipper(UIApplication *application) {
//  FlipperClient *client = [FlipperClient sharedClient];
//  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
//  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
//  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
//  [client addPlugin:[FlipperKitReactPlugin new]];
//  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
//  [client start];
//}
//#endif

@interface AppDelegate ()<UNUserNotificationCenterDelegate>

@end


@implementation AppDelegate {
  NSString *_updateURL;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//  #ifdef FB_SONARKIT_ENABLED
//  InitializeFlipper(application);
//  #endif

  [UMCommonLogManager setUpUMCommonLogManager];
  [UMConfigure setLogEnabled:YES];
  [UMConfigure initWithAppkey:@"5e5c7582895ccada980002d5" channel:@"App Store"];
  
//// Push组件基本功能配置
//  UMessageRegisterEntity * entity = [[UMessageRegisterEntity alloc] init];
//  entity.types = UMessageAuthorizationOptionBadge|UMessageAuthorizationOptionAlert|UMessageAuthorizationOptionSound;
//
//      //如果要在iOS10显示交互式的通知，必须注意实现以下代码
//      if ([[[UIDevice currentDevice] systemVersion]intValue]>=10) {
//          UNNotificationAction *action1_ios10 = [UNNotificationAction actionWithIdentifier:@"action1_identifier" title:@"打开应用" options:UNNotificationActionOptionForeground];
//          UNNotificationAction *action2_ios10 = [UNNotificationAction actionWithIdentifier:@"action2_identifier" title:@"忽略" options:UNNotificationActionOptionForeground];
//
//          //UNNotificationCategoryOptionNone
//          //UNNotificationCategoryOptionCustomDismissAction  清除通知被触发会走通知的代理方法
//          //UNNotificationCategoryOptionAllowInCarPlay       适用于行车模式
//          UNNotificationCategory *category1_ios10 = [UNNotificationCategory categoryWithIdentifier:@"category1" actions:@[action1_ios10,action2_ios10]   intentIdentifiers:@[] options:UNNotificationCategoryOptionCustomDismissAction];
//          NSSet *categories = [NSSet setWithObjects:category1_ios10, nil];
//          entity.categories=categories;
//      }
//  [UNUserNotificationCenter currentNotificationCenter].delegate=self;
//  [UMessage registerForRemoteNotificationsWithLaunchOptions:launchOptions Entity:entity completionHandler:^(BOOL granted, NSError * _Nullable error) {
//      if (granted) {
//      }else{
//      }
//  }];
  
  
  [WXApi registerApp:@"wx2eef03b8d9694197" universalLink:@"https://www.qjdchina.com/"];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"qjdkdtApp"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [UMessage openDebugMode:YES];
  [UMessage setWebViewClassString:@"UMWebViewController"];
  [UMessage addLaunchMessage];
  [IQKeyboardManager sharedManager].enable = YES;
  [IQKeyboardManager sharedManager].shouldResignOnTouchOutside = YES;
  
  
  [self updateUI];
  [RNSplashScreen show];   //add② 启动后进入启动页
  return YES;
}
- (void)updateUI {
  
  _updateURL =  [@"https://apps.apple.com/cn/app/仟金顶/id1498867269" stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
  [[Interface shareInstance] request:GET urlString:@"https://webtools.qjdchina.com/api/getVersion?type=2" parameters:nil platformType:PlatformTypeMessage isEncrypted:NO finished:^(id responseObject, NSError *error) {
    if (error) {
      
      return;
    }
    if([responseObject[@"code"] integerValue] == 0){
      if ([responseObject[@"data"] count] > 0) {
        NSString *appVersion = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];
        appVersion = [appVersion stringByReplacingOccurrencesOfString:@" " withString:@""];
        DebugLog(@"aaaaaaaaaaa============%ld",[self compareVersion:responseObject[@"data"][0][@"version"] toVersion:appVersion])
        if ([self compareVersion:responseObject[@"data"][0][@"version"] toVersion:appVersion]  == 1) {
          if ([responseObject[@"data"][0][@"url"] length] > 0) {
            _updateURL = responseObject[@"data"][0][@"url"];
          }
          [[UIApplication sharedApplication].delegate.window addSubview:self.updateView];
          self.updateView.updateStr = [NSString stringWithFormat:@"%@",responseObject[@"data"][0][@"content"]];
        }
      }
    }else {
    }
  }];
}
- (void)click_querBtn {
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:_updateURL]];

}
- (NSInteger)compareVersion:(NSString *)version1 toVersion:(NSString *)version2
{
    NSArray *list1 = [version1 componentsSeparatedByString:@"."];
    NSArray *list2 = [version2 componentsSeparatedByString:@"."];
    for (int i = 0; i < list1.count || i < list2.count; i++)
    {
        NSInteger a = 0, b = 0;
        if (i < list1.count) {
            a = [list1[i] integerValue];
        }
        if (i < list2.count) {
            b = [list2[i] integerValue];
        }
        if (a > b) {
            return 1;//version1大于version2
        } else if (a < b) {
            return -1;//version1小于version2
        }
    }
    return 0;//version1等于version2
    
}
- (QJDUpdateView *)updateView {
  if (!_updateView) {
    _updateView = [[QJDUpdateView alloc] initWithFrame:CGRectMake(0, 0, [[UIScreen mainScreen] bounds].size.width, [[UIScreen mainScreen] bounds].size.height)];
    [_updateView.querBtn addTarget:self action:@selector(click_querBtn) forControlEvents:UIControlEventTouchUpInside];
    
  }
  return _updateView;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
//  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  return [CodePush bundleURL];
#endif
}
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *))restorationHandler
{
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        NSURL *webpageURL = userActivity.webpageURL;
        NSString *host = webpageURL.host;
        if ([host isEqualToString:@"www.qjdchina.com"]) {
            //进行我们需要的处理
          DebugLog(@"我们是微信返回的方法")
          BOOL ret = [WXApi handleOpenUniversalLink:userActivity delegate:self];
          DebugLog(@"处理微信通过Universal Link启动App时传递的数据:%d",ret);
          [[NSNotificationCenter defaultCenter] postNotificationName:@"returnRNDataShare" object:self];
        }
        else {
          DebugLog(@"其它网站%@",webpageURL)
            [[UIApplication sharedApplication] openURL:webpageURL];
        }
    }
    return YES;
}
////iOS10新增：处理前台收到通知的代理方法
//-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler{
//    NSDictionary * userInfo = notification.request.content.userInfo;
//    if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
//        [UMessage setAutoAlert:NO];
//        //应用处于前台时的远程推送接受
//        //必须加这句代码
//        [UMessage didReceiveRemoteNotification:userInfo];
//    }else{
//        //应用处于前台时的本地推送接受
//    }
//    completionHandler(UNNotificationPresentationOptionSound|UNNotificationPresentationOptionBadge|UNNotificationPresentationOptionAlert);
//}

////iOS10新增：处理后台点击通知的代理方法
//-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)())completionHandler{
//    NSDictionary * userInfo = response.notification.request.content.userInfo;
//    if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
//        //应用处于后台时的远程推送接受
//        //必须加这句代码
//        [UMessage didReceiveRemoteNotification:userInfo];
//    }else{
//        //应用处于后台时的本地推送接受
//    }
//}
//+ (void)didReceiveRemoteNotification:(nullable NSDictionary *)userInfo {
//  DebugLog(@"userInfo:%@",userInfo)
//}
//- (void)application:(UIApplication *)application
//didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
//{
//    if (![deviceToken isKindOfClass:[NSData class]]) return;
//    const unsigned *tokenBytes = (const unsigned *)[deviceToken bytes];
//    NSString *hexToken = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
//                          ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
//                          ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
//                          ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
//  DebugLog(@"deviceToken:%@",hexToken);
//    //1.2.7版本开始不需要用户再手动注册devicetoken，SDK会自动注册
//    //传入的devicetoken是系统回调didRegisterForRemoteNotificationsWithDeviceToken的入参，切记
//    //[UMessage registerDeviceToken:deviceToken];
//}

@end
