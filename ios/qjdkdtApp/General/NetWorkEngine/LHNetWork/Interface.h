//
//  Interface.h
//  MeiChe
//
//  Created by mac on 2017/5/29.
//  Copyright © 2017年 上海翡鹿信息技术服务有限公司. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "AFHTTPSessionManager.h"

/**
 请求方法的类型
 */
typedef NS_ENUM(NSUInteger, HTTPMethod) {
    GET,
    POST,
};


/**
 平台类型
 */
typedef NS_ENUM(NSUInteger,PlatformType) {
    PlatformTypeNone,         //访问自己
    PlatformTypeMessage,      //需要message数据
};

@interface Interface : NSObject
  

@property(nonatomic, strong)AFHTTPSessionManager *shareManger;



+ (Interface *)shareInstance;

/**
 异步POST请求:以body方式,支持数组   只是在 聚信立请求接口中用过

 @param url 请求的  url
 @param parameters 请求的参数
 @param success 成功的回调
 @param failure 失败的回调
 */

- (void)requestWithUrl:(NSString *)url parameters:(NSDictionary *)parameters success:(void(^)(NSDictionary *response))success failure:(void(^)(NSError *error))failure;

//- (void)requestWithUrl:(NSString *)url parameters:(NSDictionary *)parameters finished:(void (^)(id responseObject, NSError *error))finished;


/**
 method:请求的方式
 baseUrl:请求的基地址
 urlString:请求的资源路径
 parameters:请求参数
 platformType:平台类型
 isEncrypted:是否需要加密
 finished:成功后的回调
 */

- (void)request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters platformType:(PlatformType)type isEncrypted:(BOOL)isEncrypted finished:(void (^)(id responseObject, NSError *error))finished;



/**
 appDelegate 中的必须请求完成的接口 调用这个方法

 method:请求的方式
 baseUrl:请求的基地址
 urlString:请求的资源路径
 parameters:请求参数
 platformType:平台类型
 isEncrypted:是否需要加密
 finished:成功后的回调
 */
//-(void)appDelegateRequest:(HTTPMethod)method baseUrl:(NSString *)baseUrl urlString:(NSString *)urlStirng parameters:(id)parameters platformType:(PlatformType)type isEncrypted:(BOOL)isEncrypted finished:(void (^)(id, NSError *))finished;

//==============face++人脸识别和身份证识别application/json网络请求方式======
/**
 method:请求的方式  字符串"POST"--"GET"
 baseUrl:请求的基地址
 urlString:请求的资源路径
 parameters:请求参数
 finished:成功后的回调
 */
//- (void)faceRequestMethod:(NSString *)method baseUrl:(NSString *)baseUrl urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished;

/**
 K线,直播等模块
 不需要依赖交易所登录后的操作
 请求此方法
 平台类型传 PlatformTypeNone
 */
- (void)customer_request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished;


//绑银行卡专用
- (void)loginMessage_request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished;
//用于通讯录body，上传
- (void)login111Message_request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished;
//上传文件
- (void)uploadFileWithUrlStr:(NSString *)urlStirng Data:(NSData *)fileData fileName:(NSString *)fileName keyName:(NSString *)name parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished;



@end










