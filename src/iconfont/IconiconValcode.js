/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconValcode = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M690.2 328.7c21.3 0 38.7 17.4 38.7 38.7v199.4c0 21.3-17.4 38.7-38.7 38.7h-91.7L424 715.3V605.6h-90.2c-21.3 0-38.7-17.4-38.7-38.7V367.5c0-21.3 17.4-38.7 38.7-38.7h356.4m0-29.9H333.8c-37.8 0-68.6 30.8-68.6 68.6v199.4c0 37.8 30.8 68.6 68.6 68.6h60.3v79.8c0 10.9 5.9 20.9 15.4 26.1 4.5 2.5 9.5 3.7 14.4 3.7 5.5 0 11-1.5 15.9-4.6L607 635.4h83.1c37.8 0 68.6-30.8 68.6-68.6V367.5c0.1-37.9-30.7-68.6-68.5-68.6z"
        fill={getIconColor(color, 0, '#888888')}
      />
      <Path
        d="M393.8 463.4m-29.9 0a29.9 29.9 0 1 0 59.8 0 29.9 29.9 0 1 0-59.8 0Z"
        fill={getIconColor(color, 1, '#888888')}
      />
      <Path
        d="M512 463.4m-29.9 0a29.9 29.9 0 1 0 59.8 0 29.9 29.9 0 1 0-59.8 0Z"
        fill={getIconColor(color, 2, '#888888')}
      />
      <Path
        d="M630.2 463.4m-29.9 0a29.9 29.9 0 1 0 59.8 0 29.9 29.9 0 1 0-59.8 0Z"
        fill={getIconColor(color, 3, '#888888')}
      />
    </Svg>
  );
};

IconiconValcode.defaultProps = {
  size: 18,
};

export default IconiconValcode;
