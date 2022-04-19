//
//  Header.h
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/12.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef Header_h
#define Header_h


#endif /* Header_h */
#pragma mark - 常用类
#import "UIColor+HZ.h"

#pragma mark - pod第三方
#import "Masonry.h"
#import "AFNetworking.h"
#import "MJExtension.h"
#import "MBProgressHUD+JDragon.h"
#pragma mark - 基类
#import "Interface.h"//网络请求类


//URL
//#define BASE_URL      @""  // 生产服务器
#define BASE_URL      @""  // 测试服务器
#define BASE_URL_img      @""  // 测试服务器
//#define BASE_URL_img      @""  // 测试服务器


#define iPhoneX \
({BOOL isPhoneX = NO;\
if (@available(iOS 11.0, *)) {\
isPhoneX = [[UIApplication sharedApplication] delegate].window.safeAreaInsets.bottom > 0.0;\
}\
(isPhoneX);})

#pragma mark - 屏幕尺寸
#define screenW [[UIScreen mainScreen] bounds].size.width
#define screenH [[UIScreen mainScreen] bounds].size.height

#define navHeight (iPhoneX ? 88.f : 64.f)
#define tarBarHeight (iPhoneX ? (49.f+34.f) : 49.f)
#define iPhoneXFluityHeight (iPhoneX ? 34.f : 0)
// 状态栏高度
#define STATUS_BAR_HEIGHT (iPhoneX ? 44.f : 20.f)

#pragma mark - 常用方法
#define pixelValue(number) (number) / 750.0 * [[UIScreen mainScreen] bounds].size.width

#define pixelValuePad(number) (number) / 2048.0 * [[UIScreen mainScreen] bounds].size.width

#define WS(weakSelf)  __weak __typeof(&*self)weakSelf = self;
#define IS_IPHONE (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone)
#define IS_PAD (UI_USER_INTERFACE_IDIOM()== UIUserInterfaceIdiomPad)
#define ApplicationShare [UIApplication sharedApplication].delegate.window

//存储
#define DEFAULTS_INFO(_OBJECT, _NAME) [[NSUserDefaults standardUserDefaults] setObject:_OBJECT forKey:_NAME]; \
[[NSUserDefaults standardUserDefaults] synchronize];
//获取
#define UserDefaults_InfoForKEY(_KEY) [[NSUserDefaults standardUserDefaults] objectForKey:_KEY]

#define UIColorFromRGB(rgbValue) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]

#if defined(DEBUG)||defined(_DEBUG)
#define DebugLog(...) NSLog(@"\n****************************只会在DEBUG模式下打印**************************** \n%s %d \n %@\n\n",__func__,__LINE__,[NSString stringWithFormat:__VA_ARGS__])
#else
#define DebugLog(...) {}
#endif

#define MCAlertView(_OBJECT) UIAlertView * alertView = [[UIAlertView alloc] initWithTitle:@"提示" message:_OBJECT delegate:nil cancelButtonTitle:nil otherButtonTitles:@"确定", nil];\
[alertView show];

//宏定义NSlog
#ifdef DEBUG
#define NSLog(format, ...) printf("\n[%s] %s [第%d行] %s\n", __TIME__, __FUNCTION__, __LINE__, [[NSString stringWithFormat:format, ## __VA_ARGS__] UTF8String]);
#else
#define NSLog(format, ...)
#endif

#define NSStringFormat(format,...) [NSString stringWithFormat:format,##__VA_ARGS__]

#define NUM      @"0123456789"//判断特殊字符
#define IDNUM    @"0123456789Xx"//判断身份证字符
#define ALPHA    @"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"//判断特殊字符
#define ALPHANUM @"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"//判断特殊字符

#define key_app_isReviewing            @"MeiCheapps_key_app_isReviewing"    // 判断是否是沈河中，如果是就是1，否则是0

