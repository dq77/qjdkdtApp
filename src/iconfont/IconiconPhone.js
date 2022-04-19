/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconPhone = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M627.1 214.5c23.4 0 42.4 19 42.4 42.4v510.2c0 23.4-19 42.4-42.4 42.4H396.9c-23.4 0-42.4-19-42.4-42.4V256.9c0-23.4 19-42.4 42.4-42.4h230.2m0-29.9H396.9c-39.8 0-72.3 32.4-72.3 72.3v510.2c0 39.8 32.4 72.3 72.3 72.3h230.2c39.8 0 72.3-32.4 72.3-72.3V256.9c-0.1-39.8-32.5-72.3-72.3-72.3z"
        fill={getIconColor(color, 0, '#888888')}
      />
      <Path
        d="M480.5 252.1h63c7.3 0 13.3 9.2 13.3 14.9 0 5.7-6 14.9-13.3 14.9h-63c-7.3 0-13.3-9.2-13.3-14.9 0-5.7 6-14.9 13.3-14.9z"
        fill={getIconColor(color, 1, '#888888')}
      />
      <Path
        d="M512 758.7m-29.9 0a29.9 29.9 0 1 0 59.8 0 29.9 29.9 0 1 0-59.8 0Z"
        fill={getIconColor(color, 2, '#888888')}
      />
      <Path
        d="M619.5 334.4v355.1H404.7V334.4h214.8m15-14.9H389.8v385h244.7v-385z"
        fill={getIconColor(color, 3, '#888888')}
      />
    </Svg>
  );
};

IconiconPhone.defaultProps = {
  size: 18,
};

export default IconiconPhone;
