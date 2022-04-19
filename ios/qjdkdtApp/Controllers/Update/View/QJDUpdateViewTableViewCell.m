//
//  QJDUpdateViewTableViewCell.m
//  qjdkdtApp
//
//  Created by GQLEE on 2020/3/12.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "QJDUpdateViewTableViewCell.h"

@implementation QJDUpdateViewTableViewCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
        // cell 的一些设置 布局
        [self setUpSubViews];
    }
    return self;
}
-(void)setUpSubViews {
    [self.contentView addSubview:self.nameLab];
    
    [self.nameLab mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(15);
        make.right.mas_equalTo(-15);
        make.top.mas_equalTo(15);
        make.bottom.mas_equalTo(-15);
    }];
}
- (UILabel *)nameLab {
    if (!_nameLab) {
        _nameLab = [[UILabel alloc] init];
        _nameLab.textColor = [UIColor colorWithHexString:@"#535D72"];
        _nameLab.font = [UIFont systemFontOfSize:16];
        _nameLab.numberOfLines = 0;
    }
    return _nameLab;
}

@end
