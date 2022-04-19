/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconResultSuccess = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M886.1 192.6C651.2 192.6 512 64 512 64S372.8 192.6 137.9 192.6c0 169.1-0.2 324.7-0.2 367.8 0 198 254.1 399.6 374.3 399.6 120.2 0 374.3-201.6 374.3-399.6 0-43.1-0.2-198.7-0.2-367.8z m-432.9 495L298.9 523.9l26.5-33.2 132.4 95.6 300.5-249.8 26 27.6-331.1 323.5z"
        fill={getIconColor(color, 0, '#4FBF9F')}
      />
    </Svg>
  );
};

IconiconResultSuccess.defaultProps = {
  size: 18,
};

export default IconiconResultSuccess;
