/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconnavibarXiaoxi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M784 684.8h-16v-176c0-140.8-113.6-254.4-254.4-254.4C371.2 254.4 256 368 256 508.8v176h-16c-12.8 0-24 11.2-24 24s11.2 24 24 24h155.2c12.8 46.4 59.2 81.6 115.2 81.6s104-35.2 115.2-81.6H784c12.8 0 24-11.2 24-24s-11.2-24-24-24z m-480-176c0-113.6 92.8-206.4 206.4-206.4 113.6 0 206.4 92.8 206.4 206.4v176H304v-176z m208 257.6c-28.8 0-52.8-14.4-64-33.6h128c-11.2 19.2-35.2 33.6-64 33.6z"
        fill={getIconColor(color, 0, '#2D2926')}
      />
      <Path
        d="M539.2 382.4c46.4 9.6 84.8 44.8 97.6 91.2 3.2 11.2 12.8 17.6 22.4 17.6 1.6 0 4.8 0 6.4-1.6 12.8-3.2 20.8-17.6 16-30.4-17.6-62.4-68.8-110.4-132.8-124.8-12.8-3.2-25.6 4.8-28.8 17.6-1.6 14.4 6.4 27.2 19.2 30.4zM462.4 224h94.4c12.8 0 24-11.2 24-24s-9.6-24-24-24h-94.4c-12.8 0-24 11.2-24 24s11.2 24 24 24z"
        fill={getIconColor(color, 1, '#2D2926')}
      />
    </Svg>
  );
};

IconnavibarXiaoxi.defaultProps = {
  size: 18,
};

export default IconnavibarXiaoxi;
