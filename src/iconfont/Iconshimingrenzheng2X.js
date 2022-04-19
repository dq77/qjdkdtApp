/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconshimingrenzheng2X = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M113.777778 0h796.444444a28.444444 28.444444 0 0 1 28.444445 28.444444v680.96a28.444444 28.444444 0 0 1-12.088889 23.239112l-398.222222 279.864888a28.444444 28.444444 0 0 1-32.711112 0l-398.222222-279.864888A28.444444 28.444444 0 0 1 85.333333 709.404444V28.444444a28.444444 28.444444 0 0 1 28.444445-28.444444z"
        fill={getIconColor(color, 0, '#B3D6FF')}
      />
      <Path
        d="M512 0v1017.685333a28.416 28.416 0 0 1-16.355556-5.176889l-398.222222-279.864888A28.444444 28.444444 0 0 1 85.333333 709.404444V28.444444a28.444444 28.444444 0 0 1 28.444445-28.444444h398.222222z"
        fill={getIconColor(color, 1, '#2A6EE7')}
      />
      <Path
        d="M664.632889 235.804444l75.207111 40.391112-229.916444 428.544L302.876444 274.488889l76.913778-36.977778 134.257778 279.011556z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconshimingrenzheng2X.defaultProps = {
  size: 18,
};

export default Iconshimingrenzheng2X;
