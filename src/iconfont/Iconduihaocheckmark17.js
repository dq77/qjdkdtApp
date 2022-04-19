/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconduihaocheckmark17 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M730.688 329.12 432 627.808l-138.656-138.688c-12.192-12.192-32-12.192-44.192 0-12.192 12.192-12.192 32 0 44.192l156.96 156.96c1.056 1.504 1.696 3.232 3.04 4.576 6.304 6.304 14.592 9.216 22.848 8.992 8.256 0.192 16.576-2.688 22.88-8.992 1.344-1.344 1.984-3.072 3.04-4.576l316.96-316.96c12.192-12.192 12.192-32 0-44.192C762.656 316.928 742.88 316.928 730.688 329.12zM512 0C229.216 0 0 229.216 0 512c0 282.784 229.216 512 512 512 282.752 0 512-229.216 512-512C1024 229.216 794.784 0 512 0zM512 960C264.576 960 64 759.424 64 512 64 264.576 264.576 64 512 64c247.424 0 448 200.576 448 448C960 759.424 759.424 960 512 960z"
        fill={getIconColor(color, 0, '#ffffff')}
      />
    </Svg>
  );
};

Iconduihaocheckmark17.defaultProps = {
  size: 18,
};

export default Iconduihaocheckmark17;
