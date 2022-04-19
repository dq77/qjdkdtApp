/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconhuokegongjuTijiaochenggong = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0C229.6832 0 0 229.69856 0 512s229.6832 512 512 512 512-229.69856 512-512S794.3168 0 512 0z m-47.26784 752.65536l-240.73216-233.472 60.60032-50.26304 139.10528 105.96864s158.75584-181.4016 353.09568-303.54432l23.19872 28.7232s-221.08672 195.75808-335.26784 452.58752z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconhuokegongjuTijiaochenggong.defaultProps = {
  size: 18,
};

export default IconhuokegongjuTijiaochenggong;
