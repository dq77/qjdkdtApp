/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconliuchengyindaoDaiban = ({ size, color, ...rest }) => {
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
        d="M584.1 600v27H432.7c-0.2-6.8 0.9-13.3 3.3-19.5 3.9-10.3 10-20.5 18.5-30.5s20.8-21.6 36.8-34.7c24.9-20.4 41.7-36.6 50.5-48.5s13.1-23.2 13.1-33.8c0-11.1-4-20.5-12-28.2s-18.4-11.5-31.2-11.5c-13.5 0-24.4 4.1-32.5 12.2s-12.2 19.4-12.3 33.8l-28.9-3c2-21.6 9.4-38 22.3-49.3s30.3-17 52-17c22 0 39.4 6.1 52.2 18.3s19.2 27.3 19.2 45.3c0 9.2-1.9 18.2-5.6 27s-10 18.2-18.7 28-23.2 23.2-43.4 40.3c-16.9 14.2-27.7 23.8-32.5 28.8s-8.8 10.1-11.9 15.2h112.5z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconliuchengyindaoDaiban.defaultProps = {
  size: 18,
};

export default IconliuchengyindaoDaiban;
