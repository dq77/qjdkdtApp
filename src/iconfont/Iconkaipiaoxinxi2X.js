/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconkaipiaoxinxi2X = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1088 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0m32 0l1024 0q32 0 32 32l0 288q0 32-32 32l-1024 0q-32 0-32-32l0-288q0-32 32-32Z"
        fill={getIconColor(color, 0, '#B3D6FF')}
      />
      <Path
        d="M160 128h768a32 32 0 0 1 32 32v864a337.728 337.728 0 0 0-195.648-60.8c-107.296 0-181.312 60.8-218.88 60.8-37.536 0-114.048-60.8-215.52-60.8-67.648 0-134.944 20.288-201.952 60.8V160a32 32 0 0 1 32-32z"
        fill={getIconColor(color, 1, '#2A6EE7')}
      />
      <Path
        d="M320 576h448v96H320zM320 352h448v96H320z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconkaipiaoxinxi2X.defaultProps = {
  size: 18,
};

export default Iconkaipiaoxinxi2X;
