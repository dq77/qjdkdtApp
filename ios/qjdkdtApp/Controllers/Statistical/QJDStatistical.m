//
//  QJDStatistical.m
//  qjdkdtApp
//
//  Created by GQLEE on 2020/4/27.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "QJDStatistical.h"
#import <UMCommon/MobClick.h>

@implementation QJDStatistical

RCT_EXPORT_MODULE();

// 导出方法，桥接到js的方法返回值类型必须是void
RCT_EXPORT_METHOD(onPageStart:(NSString *)name){
  [MobClick beginEvent:name];
}
RCT_EXPORT_METHOD(onPageEnd:(NSString *)name){
  [MobClick endEvent:name];
}
RCT_EXPORT_METHOD(onEvent:(NSDictionary *)dic){
  [MobClick event:dic[@"eventID"] label:dic[@"property"]];
}

@end
