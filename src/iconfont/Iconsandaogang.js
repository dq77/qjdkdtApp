/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconsandaogang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M50 203.7h924.1c27.6 0 50-22.3 50-50 0-27.6-22.3-50-50-50H50c-27.6 0-50 22.3-50 50 0.1 27.7 22.4 50 50 50z m924.1 257.9H50c-27.6 0-50 22.3-50 50 0 27.6 22.3 50 50 50h924.1c27.6 0 50-22.3 50-50s-22.4-50-50-50z m0 357.8H50c-27.6 0-50 22.3-50 50 0 27.6 22.3 50 50 50h924.1c27.6 0 50-22.3 50-50s-22.4-50-50-50z m0 0"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

Iconsandaogang.defaultProps = {
  size: 18,
};

export default Iconsandaogang;
