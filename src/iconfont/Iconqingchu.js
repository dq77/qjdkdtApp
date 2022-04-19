/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconqingchu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512.8 511.8m-501.3 0a501.3 501.3 0 1 0 1002.6 0 501.3 501.3 0 1 0-1002.6 0Z"
        fill={getIconColor(color, 0, '#A0A1A7')}
      />
      <Path
        d="M513.6 464.6L682 301.9c13.2-12.7 34.2-12.4 47.1 1 12.8 13.3 12.5 34.4-0.7 47.1L560 512.7l162.7 168.4c12.7 13.2 12.4 34.2-1 47.1-13.3 12.8-34.4 12.5-47.1-0.7L511.9 559.1 343.5 721.7c-13.2 12.7-34.2 12.4-47.1-1-12.8-13.3-12.5-34.4 0.7-47.1L465.5 511 302.9 342.6c-12.7-13.2-12.4-34.2 1-47.1 13.3-12.8 34.4-12.5 47.1 0.7l162.6 168.4z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconqingchu.defaultProps = {
  size: 18,
};

export default Iconqingchu;
