/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconxuanzhong = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M505.664 0C794.784 0 1024 229.216 1024 518.336 1024 794.784 794.784 1024 505.664 1024 229.216 1024 0 794.784 0 518.336 0 229.216 229.216 0 505.664 0z m265.888 318.624a36.416 36.416 0 0 0-37.76 4.832l-295.52 244.896c-13.76 11.392-36.32 11.84-50.464 1.056L291.936 496.32a31.68 31.68 0 0 0-39.232 0.512l-0.8 0.704-0.416 0.928c-5.312 12.48-3.52 27.904 4.704 38.72l2.656 3.104 132.16 136.032a31.936 31.936 0 0 0 45.312 0.672l329.28-322.336a31.04 31.04 0 0 0 6.72-35.328l-0.256-0.448z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconxuanzhong.defaultProps = {
  size: 18,
};

export default Iconxuanzhong;
