//
//  QJDUpdateView.m
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/12.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "QJDUpdateView.h"
#import "QJDUpdateViewTableViewCell.h"

@implementation QJDUpdateView

- (instancetype)initWithFrame:(CGRect)frame
{
  self = [super initWithFrame:frame];
  if (self) {
    [self addSubview:self.bgView];
    [self addSubview:self.bgTopView];
    [self.bgTopView addSubview:self.topImg];
    [self.bgTopView addSubview:self.tableView];
    [self.bgTopView addSubview:self.bgBtnView];
    [self.bgTopView addSubview:self.querBtn];
    
  }
  return self;
}
-(UIView *)bgBtnView {
  if (!_bgBtnView) {
    _bgBtnView = [[UIView alloc] initWithFrame:CGRectMake(0, pixelValue(505), pixelValue(690), pixelValue(170))];
    _bgBtnView.backgroundColor = [UIColor whiteColor];
    _bgBtnView.layer.cornerRadius = pixelValue(10);
    _bgBtnView.layer.masksToBounds = YES;
  }
  return _bgBtnView;
}
-(UIView *)bgView {
  if (!_bgView) {
    _bgView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, screenW, screenH)];
    _bgView.backgroundColor = [UIColor blackColor];
    _bgView.alpha = 0.3;
  }
  return _bgView;
}
-(UIView *)bgTopView {
  if (!_bgTopView) {
    _bgTopView = [[UIView alloc] initWithFrame:CGRectMake(pixelValue(30), (screenH - pixelValue(700)) / 2, screenW - pixelValue(60), pixelValue(700))];
  }
  return _bgTopView;
}
- (UIImageView *)topImg {
    if (!_topImg) {
        _topImg = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, pixelValue(690), pixelValue(335))];
        _topImg.image = [UIImage imageNamed:@"top_8"];
    }
    return _topImg;
}
- (UIButton *)querBtn {
  if (!_querBtn) {
    _querBtn = [[UIButton alloc] initWithFrame:CGRectMake(pixelValue(30), pixelValue(535), pixelValue(630), pixelValue(90))];
    [_querBtn setTitle:@"去更新" forState:UIControlStateNormal];
    [_querBtn setBackgroundColor:[UIColor colorWithHexString:@"#3B3C5A"]];
    _querBtn.layer.cornerRadius = pixelValue(10);
    _querBtn.layer.masksToBounds = YES;
  }
  return _querBtn;
}
#pragma mark ---UITableViewDelegate--UITableViewDataSource---
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *cellstr = @"QJDUpdateViewTableViewCell";
    QJDUpdateViewTableViewCell *cell = (QJDUpdateViewTableViewCell*)[tableView dequeueReusableCellWithIdentifier:cellstr];
    if (cell == nil) {
        cell = [[QJDUpdateViewTableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellstr];
    }
    cell.selectionStyle = UITableViewCellSelectionStyleNone;
    cell.nameLab.text = _updateStr;
    return cell;
}
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    
    return 1;
}
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}
#pragma mark ------初始化------
-(UITableView *)tableView {
    if (!_tableView) {
        _tableView = [[UITableView alloc] initWithFrame:CGRectMake(0, pixelValue(335), screenW - pixelValue(60), pixelValue(200)) style:UITableViewStylePlain];
        _tableView.delegate = self;
        _tableView.dataSource = self;
        _tableView.showsVerticalScrollIndicator = NO;
        _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
//        _tableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, screenW - pixelValue(120), CGFLOAT_MIN)];
        _tableView.rowHeight = UITableViewAutomaticDimension;
        _tableView.estimatedRowHeight = pixelValue(88);
    }
    return _tableView;
}




@end
