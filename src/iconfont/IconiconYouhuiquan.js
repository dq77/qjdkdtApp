/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconYouhuiquan = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0h1024v1024H0z"
        fill-opacity="0"
        fill={getIconColor(color, 0, '#333333')}
      />
      <Path
        d="M710.4 400l44.8 46.4c8 9.6 12.8 20.8 12.8 33.6s-4.8 24-14.4 33.6L508.8 755.2c-8 8-20.8 12.8-32 12.8-12.8 0-24-4.8-32-12.8L400 708.8c-6.4-6.4-6.4-17.6 0-25.6 16-16 16-43.2 0-59.2s-43.2-16-59.2 0c-3.2 3.2-8 4.8-12.8 4.8-4.8 0-9.6-1.6-12.8-4.8l-38.4-38.4c-8-11.2-20.8-28.8-20.8-41.6s4.8-24 14.4-33.6l244.8-243.2c17.6-17.6 48-17.6 65.6 0l46.4 44.8c6.4 6.4 6.4 19.2 0 25.6-16 16-16 41.6 0 59.2 16 16 43.2 16 59.2 0 3.2-3.2 8-4.8 12.8-4.8 3.2 1.6 8 4.8 11.2 8z m-299.2 120c-4.8 4.8-4.8 12.8 0 19.2 3.2 3.2 6.4 3.2 9.6 3.2 3.2 0 6.4-1.6 9.6-3.2l110.4-112c3.2-3.2 4.8-8 3.2-12.8-1.6-4.8-4.8-8-9.6-9.6-4.8-1.6-9.6 0-12.8 3.2l-110.4 112z m73.6 75.2c-3.2 3.2-4.8 8-3.2 12.8 1.6 4.8 4.8 8 9.6 9.6 4.8 1.6 9.6 0 12.8-3.2l110.4-112c4.8-4.8 4.8-12.8 0-19.2-4.8-4.8-12.8-4.8-19.2 0l-110.4 112z"
        fill={getIconColor(color, 1, '#FE4C56')}
      />
    </Svg>
  );
};

IconiconYouhuiquan.defaultProps = {
  size: 18,
};

export default IconiconYouhuiquan;
