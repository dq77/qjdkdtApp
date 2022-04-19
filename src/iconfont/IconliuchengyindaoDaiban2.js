/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconliuchengyindaoDaiban2 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
        fill={getIconColor(color, 0, '#D7D7E2')}
      />
      <Path
        d="M512 512m-320 0a320 320 0 1 0 640 0 320 320 0 1 0-640 0Z"
        fill={getIconColor(color, 1, '#5F5F87')}
      />
      <Path
        d="M542.2 627h-28.1V447.8c-6.8 6.5-15.7 12.9-26.6 19.4s-20.9 11.3-29.6 14.5v-27.2c15.7-7.4 29.5-16.4 41.2-26.9s20.1-20.7 25-30.6h18.1v230z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconliuchengyindaoDaiban2.defaultProps = {
  size: 18,
};

export default IconliuchengyindaoDaiban2;
