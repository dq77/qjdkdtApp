/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcontabbarChuangjiandingdan = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M352 480h320c18.133333 0 32 13.866667 32 32s-13.866667 32-32 32H352c-18.133333 0-32-13.866667-32-32s13.866667-32 32-32z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M544 352v320c0 18.133333-13.866667 32-32 32s-32-13.866667-32-32V352c0-18.133333 13.866667-32 32-32s32 13.866667 32 32z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IcontabbarChuangjiandingdan.defaultProps = {
  size: 18,
};

export default IcontabbarChuangjiandingdan;
