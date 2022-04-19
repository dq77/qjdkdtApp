//
//  Interface.m
//  MeiChe
//
//  Created by mac on 2017/5/29.
//  Copyright © 2017年 上海翡鹿信息技术服务有限公司. All rights reserved.
//

#import "Interface.h"
#import "UserAgent.h"

@interface Interface ()

@property (nonatomic, strong) NSMutableArray *arrayOfTasks;//请求队列

@end


@implementation Interface

+(Interface *)shareInstance{
    static Interface *_interface = nil;
    static dispatch_once_t onceInterfaceInitialize;
    dispatch_once(&onceInterfaceInitialize, ^{
        _interface = [[Interface alloc]init];
    });
    return _interface;
}


- (instancetype)init {
    self = [super init];
    if (self) {
        _shareManger = [AFHTTPSessionManager manager];
        _shareManger.responseSerializer = [AFJSONResponseSerializer serializer];
        _shareManger.requestSerializer= [AFHTTPRequestSerializer serializer];
        _shareManger.securityPolicy = [AFSecurityPolicy defaultPolicy];
        _shareManger.securityPolicy.allowInvalidCertificates = YES;
        _shareManger.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/html",@"text/json",@"text/javascript",@"text/plain",nil];

        NSString *appVersion = [[NSBundle mainBundle] infoDictionary][@"CFBundleShortVersionString"];
        appVersion = [appVersion stringByReplacingOccurrencesOfString:@" " withString:@""];
        self.arrayOfTasks = [NSMutableArray new];
//        [_shareManger.requestSerializer setValue:[NSString stringWithFormat:@"%@;%@;%@",[ _shareManger.requestSerializer valueForKey:@"User-Agent"],@"服装产供销",appVersion] forHTTPHeaderField:@"User-Agent"];
        //此处统一设置body,响应的数据格式
//        [_shareManger.requestSerializer setValue:[[UserAgent shardInstnce] getUserAgent] forHTTPHeaderField:@"XData"];

        // 检测网络状况。。。。该写在这里吗？
//        [GLobalRealReachability startNotifier];
        
        // 1.初始化单例类
        // 2.设置证书模式
//        NSString * cerPath = [[NSBundle mainBundle] pathForResource:@"21437689" ofType:@"cer"];
//        NSData * cerData = [NSData dataWithContentsOfFile:cerPath];
//        // 客户端是否信任非法证书
//        policy.allowInvalidCertificates = YES;
//        // 是否在证书域字段中验证域名
//        [policy setValidatesDomainName:YES];
//        AFSecurityPolicy *policy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
        _shareManger.securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
    }
    return self;
}


#pragma mark --- Action


#pragma mark --- public method

-(void)request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters platformType:(PlatformType)type isEncrypted:(BOOL)isEncrypted finished:(void (^)(id, NSError *))finished{
    _shareManger.requestSerializer.timeoutInterval = 60.0;
    DebugLog(@"url = %@",urlStirng);

    NSDictionary *finaldic = parameters;
//    [self settingParameters:parameters];
    switch (type) {
            case PlatformTypeNone:
//            [self customer_request:method urlString:urlStirng parameters:finaldic finished:finished];
            break;
            case PlatformTypeMessage:
            [self message_request:method urlString:urlStirng parameters:finaldic finished:finished];
            break;
    }
}


- (void)message_request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished {

    void(^successCallback)(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) = ^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
        DebugLog(@"%@ === parameters = %@  \n 返回值 = %@",urlStirng,parameters,responseObject);
        if ([responseObject isKindOfClass:[NSDictionary class]]) {
            finished(responseObject,nil);
        }else{
            DebugLog(@"返回数据格式错误");
            finished(nil,nil);
        }
    };
    
    void(^failureCallBack)(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) = ^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
        DebugLog(@"%@",error);
        NSDictionary * errorInfo = error.userInfo;
        NSHTTPURLResponse *res = errorInfo[@"com.alamofire.serialization.response.error.response"];
        if (res.statusCode == -1001) {
            //未登陆 / token失效/ token错误  ，弹出登录界面，z重新登录
            [self userSingleSignOn];
        }else {
            //错误的统一输出
            finished(nil,error);
        }
    };
    
    if (method == GET) {
      NSURLSessionDataTask *task = [self.shareManger GET:urlStirng parameters:parameters headers:nil progress:nil success:successCallback failure:failureCallBack];
        [self.arrayOfTasks addObject:task];
    }else {
        NSURLSessionDataTask *task = [self.shareManger POST:urlStirng parameters:parameters headers:nil progress:nil success:successCallback failure:failureCallBack];
        [self.arrayOfTasks addObject:task];
    }

}


- (void)loginMessage_request:(HTTPMethod)method urlString:(NSString *)urlStirng parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished {
    NSDictionary *finaldic = parameters;
    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    manager.securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
    NSMutableURLRequest *request = [[AFJSONRequestSerializer serializer] requestWithMethod:@"POST" URLString:urlStirng parameters:finaldic error:nil];
    request.timeoutInterval = 120.f;
    AFHTTPResponseSerializer *responseSerializer = [AFHTTPResponseSerializer serializer];
    responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/html",@"text/json",@"text/javascript",@"text/plain",nil];
    manager.responseSerializer = responseSerializer;
    manager.responseSerializer = [AFJSONResponseSerializer serializer];

    
    // 这个是鉴权版本号
  NSURLSessionDataTask *task = [manager dataTaskWithRequest:request uploadProgress:nil downloadProgress:nil completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
    if (!error) {
        DebugLog(@"%@ === parameters = %@  \n 返回值 = %@",urlStirng,parameters,responseObject);
        if ([responseObject isKindOfClass:[NSDictionary class]]) {
            finished(responseObject,nil);
        }else{
            DebugLog(@"返回数据格式错误");
            finished(nil,nil);
        }
    } else {
        DebugLog(@"%@",error);
        NSDictionary * errorInfo = error.userInfo;
        NSHTTPURLResponse *res = errorInfo[@"com.alamofire.serialization.response.error.response"];
        if (res.statusCode == 30001) {
            //未登陆 / token失效/ token错误  ，弹出登录界面，z重新登录
            [self userSingleSignOn];
        }else {
            //错误的统一输出
            finished(nil,error);
        }
    }
  }];
    
    [task resume];
    [self.arrayOfTasks addObject:task];
    
}
- (void)userSingleSignOn {
    [self.arrayOfTasks enumerateObjectsUsingBlock:^(NSURLSessionDataTask *taskObj, NSUInteger idx, BOOL *stop) {
        [taskObj cancel]; /// when sending cancel to the task failure: block is going to be called
    }];
    /// empty the arraOfTasks
    [self.arrayOfTasks removeAllObjects];
//    for (id subview in ApplicationShare.subviews) {
//        [subview removeFromSuperview];
//    }
    
//    [_UserInfo logout];   //删除用户数据
    
}


/**
 *  异步POST请求:以body方式,支持数组
 *
 *  @param url     请求的url
 *
 *  @param success 成功回调
 *  @param failure 失败回调
 */
- (void)requestWithUrl:(NSString *)url parameters:(NSDictionary *)parameters success:(void(^)(NSDictionary *response))success failure:(void(^)(NSError *error))failure{
    
    NSData *body = [NSJSONSerialization dataWithJSONObject:parameters options:NSJSONWritingPrettyPrinted error:nil];
    
    NSString *requestUrl = [NSString stringWithFormat:@"%@%@", @"https://www.juxinli.com/", url];
    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    
    NSMutableURLRequest *request = [[AFHTTPRequestSerializer serializer] requestWithMethod:@"POST" URLString:requestUrl parameters:nil error:nil];
    request.timeoutInterval= 120;
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    // 设置body
    [request setHTTPBody:body];
    
    AFHTTPResponseSerializer *responseSerializer = [AFHTTPResponseSerializer serializer];
    responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/html",@"text/json",@"text/javascript",@"text/plain",nil];
    manager.responseSerializer = responseSerializer;
  
  [[manager dataTaskWithRequest:request uploadProgress:nil downloadProgress:nil completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
    if (!error) {
//            NSString *receiveStr = [[NSString alloc]initWithData:responseObject encoding:NSUTF8StringEncoding];
//            NSData * data = [receiveStr dataUsingEncoding:NSUTF8StringEncoding];
        NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:responseObject options:NSJSONReadingMutableLeaves error:nil];
        success(jsonDict);
    } else {
        failure(error);
    }
  }] resume];
}


#pragma mark ----

- (NSString*)dictionaryToJson:(NSDictionary *)dic{
    NSError *parseError = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dic options:NSJSONWritingPrettyPrinted error:&parseError];
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}


-(NSString *)ret32bitString{
    char data[32];
    for (int x=0;x<32;data[x++] = (char)('A' + (arc4random_uniform(26))));
    return [[NSString alloc] initWithBytes:data length:32 encoding:NSUTF8StringEncoding];
}


- (void)uploadFileWithUrlStr:(NSString *)urlStirng Data:(NSData *)fileData fileName:(NSString *)fileName keyName:(NSString *)name parameters:(id)parameters finished:(void (^)(id responseObject, NSError *error))finished {
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/html",@"text/json",@"text/javascript",@"text/plain",nil];
  [manager POST:urlStirng parameters:parameters headers:nil constructingBodyWithBlock:^(id<AFMultipartFormData>  _Nonnull formData) {
    if ([fileName isEqualToString:@"1"]) {
        [formData appendPartWithFileData:fileData name:name fileName:@"image.png" mimeType:@"multipart/form-data; boundary=WebKitFormBoundaryG7RlZFECIbSGDHZZ"];
    }else if ([fileName isEqualToString:@"2"]){
        [formData appendPartWithFileData:fileData name:name fileName:@"image.mp4" mimeType:@"multipart/form-data; boundary=WebKitFormBoundaryT6sXeyTBrKEc2PIq"];
    }else if ([fileName isEqualToString:@"3"]){
        [formData appendPartWithFileData:fileData name:name fileName:@"image.mp3" mimeType:@"multipart/form-data; boundary=WebKitFormBoundaryT6sXeyTBrKEc2PIq"];
    }
  } progress:^(NSProgress * _Nonnull uploadProgress) {
    
  } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
    DebugLog(@"%@",responseObject);
    if ([responseObject isKindOfClass:[NSDictionary class]]) {
        finished(responseObject,nil);
    }else{
        DebugLog(@"返回数据格式错误");
        finished(nil,nil);
    }
  } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
    DebugLog(@"%@",error);
    NSDictionary * errorInfo = error.userInfo;
    NSHTTPURLResponse *res = errorInfo[@"com.alamofire.serialization.response.error.response"];
    if (res.statusCode == -1001) {
        //未登陆 / token失效/ token错误  ，弹出登录界面，z重新登录
//            [self userSingleSignOn];
    }else {
        //错误的统一输出
        finished(nil,error);
    }
  }];
    
}


@end




