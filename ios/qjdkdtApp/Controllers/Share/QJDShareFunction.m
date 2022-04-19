//
//  QJDShareFunction.m
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/24.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "QJDShareFunction.h"
//#import <UMShare/UMShare.h>
#import "WXApi.h"

@implementation QJDShareFunction

//发起通知事件
- (void)startObserving {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(returnRNData)
                                               name:@"returnRNDataShare"
                                             object:nil];
}
//结束通知事件
- (void)stopObserving {
  [[NSNotificationCenter defaultCenter] removeObserver:self name:@"returnRNDataShare" object:nil];
}

- (void)returnRNData{
  
  self.shareBlock(@{});
  [self stopObserving];
}

// 导出模块，不添加参数即默认为这个类名
RCT_EXPORT_MODULE();

// 导出方法，桥接到js的方法返回值类型必须是void
RCT_EXPORT_METHOD(shareFunction:(NSDictionary *)dic callback:(RCTResponseSenderBlock)callback) {
  DebugLog(@"%@ ===> shareFunction",dic);
  
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![WXApi isWXAppInstalled]) {
      [MBProgressHUD showInfoMessage:@"请先安装微信"];
      return ;
    }
    [self startObserving];

    self.shareBlock = ^(NSDictionary *result) {
      callback(@[@{}]);
    };
    NSString *weburl =  [dic[@"weburl"] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    WXWebpageObject *webpageObject = [WXWebpageObject object];
    webpageObject.webpageUrl = weburl;
    WXMediaMessage *message = [WXMediaMessage message];
    message.title = dic[@"title"];
    message.description = dic[@"text"];
    [message setThumbImage:[UIImage imageNamed:@"icon-60"]];
    message.mediaObject = webpageObject;
    SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
    req.bText = NO;
    req.message = message;
    req.scene = WXSceneSession;
//    [WXApi sendReq:req];
    [WXApi sendReq:req completion:^(BOOL success) {

    }];
//      //创建分享消息对象
//      UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
//          //创建网页内容对象
//
//      UIImage *img = [[UIImage alloc]init];
//          //        if(self.webpic){
//          //             img = [UIImage imageWithData:[self imageWithImage:[UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:self.nameImg]]] scaledToSize:CGSizeMake(300, 300)]];
//          //        }else{
//          //            img = [UIImage imageNamed:self.nameImg];
//          //        }
//      img = [UIImage imageNamed:@"icon-60"];
//
//      UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:dic[@"title"] descr:dic[@"text"] thumImage:UIImagePNGRepresentation(img)];
//          //设置网页地址
//         NSString *weburl =  [dic[@"weburl"] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
//      shareObject.webpageUrl = weburl;
//          //分享消息对象设置分享内容对象
//      messageObject.shareObject = shareObject;
//      if (![[UMSocialManager defaultManager] isInstall:UMSocialPlatformType_WechatSession]) {
//          [MBProgressHUD showTipMessageInWindow:@"请先安装微信"];
//          return;
//      }
//          //调用分享接口
//      [[UMSocialManager defaultManager] shareToPlatform:UMSocialPlatformType_WechatSession messageObject:messageObject currentViewController:nil completion:^(id data, NSError *error) {
//          if (error) {
//              UMSocialLogInfo(@"************Share fail with error %@*********",error);
//          }else{
//              if ([data isKindOfClass:[UMSocialShareResponse class]]) {
//                  UMSocialShareResponse *resp = data;
//                      //分享结果消息
//                  UMSocialLogInfo(@"response message is %@",resp.message);
//                      //第三方原始返回的数据
//                  UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
//              }else{
//                  UMSocialLogInfo(@"response data is %@",data);
//              }
//          }
//      }];
    });
  
  
}

@end
