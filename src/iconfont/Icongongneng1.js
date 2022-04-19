/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icongongneng1 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#D3B685')}
      />
      <Path
        d="M509.2352 487.0144c89.216 0 161.088-71.552 161.088-161.5872 0-90.0224-71.8592-161.5872-161.088-161.5872-89.216 0-161.0752 71.552-161.0752 161.5872 0 90.0352 71.872 161.5872 161.0752 161.5872z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M512 850.3808c124.416 0 262.7328-6.4512 262.7328-130.88C774.7328 595.0848 636.416 512 512 512s-253.184 83.0848-253.184 207.5008c0 124.416 128.768 130.88 253.184 130.88z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
      <Path
        d="M696.32 593.92c8.192 0 16.2816 0.4352 24.256 1.28 33.088 33.4848 54.1568 75.7504 54.1568 124.3008 0 121.8048-132.5568 130.56-254.848 130.8672h-15.8336c-10.3168-0.0256-20.6464-0.1152-30.8992-0.32A224.8576 224.8576 0 0 1 471.04 819.2c0-124.416 100.864-225.28 225.28-225.28z"
        fill={getIconColor(color, 3, '#D3B685')}
        opacity=".4"
      />
    </Svg>
  );
};

Icongongneng1.defaultProps = {
  size: 18,
};

export default Icongongneng1;
