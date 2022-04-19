/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconselectWeixuanzhong = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M505.677913 0C226.593391 0 0 231.891478 0 518.322087 0 794.779826 229.220174 1024 505.677913 1024 792.108522 1024 1024 797.384348 1024 518.322087 1024 229.220174 794.779826 0 505.677913 0z m0 44.521739C770.181565 44.521739 979.478261 253.818435 979.478261 518.322087 979.478261 772.585739 767.73287 979.478261 505.677913 979.478261 253.818435 979.478261 44.521739 770.181565 44.521739 518.322087 44.521739 256.26713 251.414261 44.521739 505.677913 44.521739z"
        fill={getIconColor(color, 0, '#C9C9C9')}
      />
    </Svg>
  );
};

IconselectWeixuanzhong.defaultProps = {
  size: 18,
};

export default IconselectWeixuanzhong;
