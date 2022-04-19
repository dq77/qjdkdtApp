/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconWarn = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m37.3 672c0 20.6-16.7 37.3-37.3 37.3-20.6 0-37.3-16.7-37.3-37.3v-18.7c0-20.6 16.7-37.3 37.3-37.3 20.6 0 37.3 16.7 37.3 37.3V736z m0-149.3c0 20.6-16.7 37.3-37.3 37.3-20.6 0-37.3-16.7-37.3-37.3V269.3c0-20.6 16.7-37.3 37.3-37.3 20.6 0 37.3 16.7 37.3 37.3v317.4z"
        fill={getIconColor(color, 0, '#F16051')}
      />
    </Svg>
  );
};

IconiconWarn.defaultProps = {
  size: 18,
};

export default IconiconWarn;
