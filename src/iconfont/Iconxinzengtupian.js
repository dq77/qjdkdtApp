/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconxinzengtupian = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M580.266667 0v443.733333h443.733333v136.533334H580.266667v443.733333h-136.533334l-0.017066-443.733333H0v-136.533334h443.733333V0h136.533334z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

Iconxinzengtupian.defaultProps = {
  size: 18,
};

export default Iconxinzengtupian;
