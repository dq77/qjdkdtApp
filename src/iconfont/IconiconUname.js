/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconUname = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M702.9 611.2c-31.9-31.9-70.3-54.8-112.2-67.5 58.6-29.1 99-89.5 99-159.3 0-98-79.7-177.7-177.7-177.7s-177.7 79.7-177.7 177.7c0 69.7 40.4 130.2 99 159.3-41.9 12.7-80.4 35.6-112.2 67.5-51 51-79.1 118.8-79.1 190.9 0 8.3 6.7 15 15 15h510c8.3 0 15-6.7 15-15 0-72-28.1-139.9-79.1-190.9zM364.3 384.5c0-81.4 66.2-147.7 147.7-147.7S659.7 303 659.7 384.5c0 81.4-66.2 147.7-147.7 147.7s-147.7-66.3-147.7-147.7z m-91.9 402.7c3.6-58.5 28.1-112.9 69.8-154.7 45.3-45.3 105.6-70.3 169.7-70.3s124.4 25 169.7 70.3c41.8 41.8 66.3 96.3 69.8 154.7h-479z"
        fill={getIconColor(color, 0, '#888888')}
      />
    </Svg>
  );
};

IconiconUname.defaultProps = {
  size: 18,
};

export default IconiconUname;
