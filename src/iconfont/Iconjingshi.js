/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconjingshi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0c282.760533 0 512 229.239467 512 512 0 282.760533-229.239467 512-512 512-282.760533 0-512-229.239467-512-512C0 229.239467 229.239467 0 512 0z m0 682.666667a85.333333 85.333333 0 1 0 0 170.666666 85.333333 85.333333 0 0 0 0-170.666666z m42.666667-514.6624h-85.333334v426.666666h85.333334v-426.666666z"
        fill={getIconColor(color, 0, '#F55849')}
      />
    </Svg>
  );
};

Iconjingshi.defaultProps = {
  size: 18,
};

export default Iconjingshi;
