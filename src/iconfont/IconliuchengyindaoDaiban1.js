/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconliuchengyindaoDaiban1 = ({ size, color, ...rest }) => {
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
        d="M436.5 564.5l28.1-3.8c3.2 15.9 8.7 27.4 16.5 34.5s17.2 10.5 28.4 10.5c13.2 0 24.4-4.6 33.5-13.8s13.7-20.5 13.7-34.1c0-12.9-4.2-23.6-12.7-32s-19.2-12.6-32.2-12.6c-5.3 0-11.9 1-19.8 3.1l3.1-24.7c1.9 0.2 3.4 0.3 4.5 0.3 12 0 22.8-3.1 32.3-9.4s14.4-15.9 14.4-28.9c0-10.3-3.5-18.9-10.5-25.6s-16-10.2-27-10.2c-10.9 0-20 3.4-27.3 10.3s-12 17.2-14.1 30.9l-28.1-5c3.4-18.9 11.2-33.5 23.4-43.8S490 395 508.2 395c12.5 0 24 2.7 34.5 8s18.6 12.7 24.1 22 8.4 19.1 8.4 29.5c0 9.9-2.7 18.9-8 27s-13.2 14.6-23.6 19.4c13.5 3.1 24.1 9.6 31.6 19.5s11.2 22.2 11.2 37c0 20-7.3 37-21.9 50.9s-33 20.9-55.3 20.9c-20.1 0-36.8-6-50.1-18s-20.8-27.6-22.6-46.7z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconliuchengyindaoDaiban1.defaultProps = {
  size: 18,
};

export default IconliuchengyindaoDaiban1;
