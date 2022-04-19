/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconshouyeWeidianliang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M470.762667 26.837333l-384 182.677334A96 96 0 0 0 32 296.192V917.333333A96 96 0 0 0 128 1013.333333h768a96 96 0 0 0 96-96V296.192a96 96 0 0 0-54.762667-86.677333l-384-182.677334a96 96 0 0 0-82.474666 0z m54.976 57.813334l384 182.656a32 32 0 0 1 18.261333 28.885333V917.333333a32 32 0 0 1-32 32H128A32 32 0 0 1 96 917.333333V296.192a32 32 0 0 1 18.261333-28.885333l384-182.656a32 32 0 0 1 27.477334 0z"
        fill={getIconColor(color, 0, '#C7C7D6')}
      />
      <Path
        d="M682.666667 650.666667H341.333333a32 32 0 0 0-32 32v298.666666a32 32 0 0 0 32 32h341.333334a32 32 0 0 0 32-32V682.666667a32 32 0 0 0-32-32z m-32 64v234.666666h-277.333334v-234.666666h277.333334z"
        fill={getIconColor(color, 1, '#C7C7D6')}
      />
    </Svg>
  );
};

IconshouyeWeidianliang.defaultProps = {
  size: 18,
};

export default IconshouyeWeidianliang;
