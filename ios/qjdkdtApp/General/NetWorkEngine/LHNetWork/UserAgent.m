//
//  UserAgent.m
//  MasterDuoBao
//
//  Created by 汤丹峰 on 16/3/25.
//  Copyright © 2016年 wenzhan. All rights reserved.
//

#import "UserAgent.h"
#import <AdSupport/AdSupport.h>


@implementation UserAgent


static UserAgent *userAgent = nil;

+ (UserAgent *)shardInstnce{
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        userAgent = [[UserAgent alloc] init];
    });
    return userAgent;
}


- (NSString *)getUserAgent{

//    //1 设备的唯一标识
//    NSString *deviceId = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
//    deviceId = [deviceId stringByReplacingOccurrencesOfString:@"-" withString:@""];
//
//    //2 这个是手机系统号
//    NSString *sdkVersion = [[UIDevice currentDevice] systemVersion];
//
//    //3 app市场来源
//    NSString *market = BASE_channel;
//
//    //4 手机系统1：android 2：ios: 3：h5
//    NSString *osVersion = @"2";
//
//    //5 产品名称
////    NSString *appName = BASE_appName;
//
//    //6 这个是版本号
//    NSString *appVersion = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];
//    appVersion = [appVersion stringByReplacingOccurrencesOfString:@" " withString:@""];
    
    NSMutableArray *attributeArray = [[NSMutableArray alloc]init];
//    [attributeArray addObject:deviceId];
//    [attributeArray addObject:sdkVersion];
//    [attributeArray addObject:market];
//    [attributeArray addObject:osVersion];
////    [attributeArray addObject:appName];
//    [attributeArray addObject:appVersion];
    
    
    // 这个是  userid
    //    NSString *uid = _UserInfo.uid ? _UserInfo.uid : @"0";
    
    
    
    // 这一步是手机号
    //    NSString *phoneNumber = _UserInfo.uphone ? _UserInfo.uphone : @"0";
    
    
    
    // 这是最终结果
    NSString *customUserAgent = [attributeArray componentsJoinedByString:@"|"];
    
    return customUserAgent;
}


#pragma mark ----  idfa

-(NSString *)p_idfa{
    NSString *idfaStr;
    Class theClass=NSClassFromString(@"ASIdentifierManager");
    if (theClass)
    {
        idfaStr = [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
    }else{
        idfaStr = @"";
    }
    return idfaStr;
}




@end







