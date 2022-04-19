/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconqiyexinxi2X = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M614.4 263.314286l363.812571 175.835428a29.257143 29.257143 0 0 1 16.530286 26.331429v527.594057a29.257143 29.257143 0 0 1-29.257143 29.257143H614.4V263.314286z"
        fill={getIconColor(color, 0, '#B3D6FF')}
      />
      <Path
        d="M789.942857 555.885714h87.771429v87.771429h-87.771429z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M58.514286 0h585.142857a29.257143 29.257143 0 0 1 29.257143 29.257143v994.742857H58.514286a29.257143 29.257143 0 0 1-29.257143-29.257143V29.257143a29.257143 29.257143 0 0 1 29.257143-29.257143z"
        fill={getIconColor(color, 2, '#2A6EE7')}
      />
      <Path
        d="M204.8 263.314286h292.571429v87.771428H204.8zM204.8 555.885714h292.571429v87.771429H204.8z"
        fill={getIconColor(color, 3, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconqiyexinxi2X.defaultProps = {
  size: 18,
};

export default Iconqiyexinxi2X;
