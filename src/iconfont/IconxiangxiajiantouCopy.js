/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconxiangxiajiantouCopy = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M57.6 355.2l435.2 432c9.6 9.6 25.6 9.6 35.2 0l441.6-432c9.6-9.6 9.6-25.6 0-35.2-9.6-9.6-25.6-9.6-35.2 0l-425.6 416.00000001-416-416.00000001c-9.6-9.6-25.6-9.6-35.2 0s-9.6 25.6 0 35.2z"
        fill={getIconColor(color, 0, '#A7ADB0')}
      />
    </Svg>
  );
};

IconxiangxiajiantouCopy.defaultProps = {
  size: 18,
};

export default IconxiangxiajiantouCopy;
