/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconxuanze = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <Path
        d="M722.2784 332.7232a53.248 53.248 0 0 1 73.472-5.4528c20.1728 16.7936 23.8848 45.312 9.5744 66.2784l-3.9424 5.0688L519.424 717.5424a53.248 53.248 0 0 1-66.3808 10.4192l-5.248-3.4816-217.6768-164.7616a49.5872 49.5872 0 0 1-9.0368-71.0144c16.3328-20.3264 45.4912-25.2416 67.7376-12.3648l5.4016 3.584 178.432 135.04 249.6-282.24z"
        fill={getIconColor(color, 1, '#5F5F87')}
      />
    </Svg>
  );
};

Iconxuanze.defaultProps = {
  size: 18,
};

export default Iconxuanze;
