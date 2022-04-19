//
//  QJDShareFunction.h
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/24.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>


NS_ASSUME_NONNULL_BEGIN

@interface QJDShareFunction : NSObject<RCTBridgeModule>

@property (nonatomic, copy)  void(^shareBlock) (NSDictionary* result);

@end

NS_ASSUME_NONNULL_END
