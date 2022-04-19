/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icontupianqueshi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0h1024v1024H0z"
        fill={getIconColor(color, 0, '#EAEBEE')}
      />
      <Path
        d="M136.533 170.667v682.666h750.934V170.667H136.533z m675.84 606.822L399.36 436.156l-187.733 189.61V246.528h600.746v530.978z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M580.267 401.067a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 0 0-153.6 0z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

Icontupianqueshi.defaultProps = {
  size: 18,
};

export default Icontupianqueshi;
