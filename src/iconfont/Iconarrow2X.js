/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconarrow2X = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 682.666667c-12.8 0-21.333333-4.266667-29.866667-12.8l-256-256c-17.066667-17.066667-17.066667-42.666667 0-59.733334s42.666667-17.066667 59.733334 0l226.133333 226.133334 226.133333-226.133334c17.066667-17.066667 42.666667-17.066667 59.733334 0s17.066667 42.666667 0 59.733334l-256 256c-8.533333 8.533333-17.066667 12.8-29.866667 12.8z"
        fill={getIconColor(color, 0, '#A7ADB0')}
      />
    </Svg>
  );
};

Iconarrow2X.defaultProps = {
  size: 18,
};

export default Iconarrow2X;
