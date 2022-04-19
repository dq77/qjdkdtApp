//
//  UserAgent.h
//  MasterDuoBao
//
//  Created by 汤丹峰 on 16/3/25.
//  Copyright © 2016年 wenzhan. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface UserAgent : NSObject


+ (UserAgent *)shardInstnce;

- (NSString *)getUserAgent;


@end



