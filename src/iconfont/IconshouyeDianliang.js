/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconshouyeDianliang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M548.288 24.661333l4.949333 2.176 384 182.677334a96 96 0 0 1 54.634667 81.877333l0.128 4.8V917.333333a96 96 0 0 1-91.477333 95.893334L896 1013.333333h-181.333333V682.666667a32 32 0 0 0-32-32H341.333333a32 32 0 0 0-32 32v330.666666H128a96 96 0 0 1-95.893333-91.477333L32 917.333333V296.192a96 96 0 0 1 50.474667-84.501333l4.288-2.176 384-182.677334a96 96 0 0 1 77.525333-2.176zM650.666667 714.666667v298.666666h-277.333334v-298.666666h277.333334z"
        fill={getIconColor(color, 0, '#2A6EE7')}
      />
    </Svg>
  );
};

IconshouyeDianliang.defaultProps = {
  size: 18,
};

export default IconshouyeDianliang;
