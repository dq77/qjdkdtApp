/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconyiqianshu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#4FBF9F')}
      />
      <Path
        d="M448 712.533333c-12.8 0-21.333333-4.266667-29.866667-12.8l-192-192c-17.066667-17.066667-17.066667-42.666667 0-59.733333s42.666667-17.066667 59.733334 0l162.133333 162.133333 294.4-260.266666c17.066667-17.066667 42.666667-12.8 59.733333 4.266666 17.066667 17.066667 12.8 42.666667-4.266666 59.733334l-324.266667 285.866666c-4.266667 8.533333-17.066667 12.8-25.6 12.8z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconyiqianshu.defaultProps = {
  size: 18,
};

export default Iconyiqianshu;
