/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icondaifuzhanghu2X = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1094 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0m34.694929 0l728.5935 0q34.694929 0 34.694928 34.694929l0 208.169571q0 34.694929-34.694928 34.694929l-728.5935 0q-34.694929 0-34.694929-34.694929l0-208.169571q0-34.694929 34.694929-34.694929Z"
        fill={getIconColor(color, 0, '#B3D6FF')}
      />
      <Path
        d="M0 208.169571m34.694929 0l1006.152928 0q34.694929 0 34.694929 34.694929l0 728.5935q0 34.694929-34.694929 34.694929l-1006.152928 0q-34.694929 0-34.694929-34.694929l0-728.5935q0-34.694929 34.694929-34.694929Z"
        fill={getIconColor(color, 1, '#2A6EE7')}
      />
      <Path
        d="M728.5935 381.644214h208.169572v104.084786h-208.169572z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

Icondaifuzhanghu2X.defaultProps = {
  size: 18,
};

export default Icondaifuzhanghu2X;
