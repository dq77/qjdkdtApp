/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconxiangshangjiantou = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M966.4 668.8l-435.2-432c-9.6-9.6-25.6-9.6-35.2 0l-441.6 432c-9.6 9.6-9.6 25.6 0 35.2 9.6 9.6 25.6 9.6 35.2 0l425.6-416 416 416c9.6 9.6 25.6 9.6 35.2 0s9.6-25.6 0-35.2z"
        fill={getIconColor(color, 0, '#A7ADB0')}
      />
    </Svg>
  );
};

Iconxiangshangjiantou.defaultProps = {
  size: 18,
};

export default Iconxiangshangjiantou;
