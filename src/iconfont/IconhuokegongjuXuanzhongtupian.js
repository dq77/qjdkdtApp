/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconhuokegongjuXuanzhongtupian = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 518.330182C1024 229.213091 794.763636 0 505.669818 0 229.236364 0 0 229.236364 0 518.330182 0 794.763636 229.236364 1024 505.669818 1024 794.786909 1024 1024 794.763636 1024 518.330182z"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M252.741818 534.016c-9.006545-9.285818-10.123636-25.181091-2.420363-35.607273l2.094545-2.839272a22.970182 22.970182 0 0 1 32.512-4.584728l109.870545 83.735273c10.286545 7.866182 26.507636 7.703273 36.701091-0.768l309.061819-256.069818a26.600727 26.600727 0 0 1 34.769454 1.396363l-3.490909-3.42109a22.807273 22.807273 0 0 1 0.069818 32.628363l-341.876363 334.661818a23.086545 23.086545 0 0 1-32.93091-0.558545l-144.337454-148.573091z"
        fill={getIconColor(color, 1, '#333333')}
      />
    </Svg>
  );
};

IconhuokegongjuXuanzhongtupian.defaultProps = {
  size: 18,
};

export default IconhuokegongjuXuanzhongtupian;
