//
//  QJDUpdateView.h
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/12.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface QJDUpdateView : UIView<UITableViewDataSource,UITableViewDelegate>

@property (nonatomic, strong) UIImageView *topImg;
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) UIButton    *querBtn;
@property (nonatomic, strong) UIView *bgView;
@property (nonatomic, strong) UIView *bgTopView;
@property (nonatomic, strong) UIView *bgBtnView;
@property (nonatomic, strong) NSString *updateStr;


@end

NS_ASSUME_NONNULL_END
