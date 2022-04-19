/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconOk = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m246.7 399.3L476.1 713.1c-7.1 6.3-15.9 9.4-24.7 9.4-9.6 0-19.1-3.7-26.4-10.9L256.7 543.3c-14.6-14.6-14.6-38.2 0-52.8 14.6-14.6 38.2-14.6 52.8 0l143.4 143.4 256.4-226.5c15.4-13.7 39-12.2 52.7 3.3 13.6 15.4 12.2 39-3.3 52.6z"
        fill={getIconColor(color, 0, '#5F5F87')}
      />
    </Svg>
  );
};

IconiconOk.defaultProps = {
  size: 18,
};

export default IconiconOk;
