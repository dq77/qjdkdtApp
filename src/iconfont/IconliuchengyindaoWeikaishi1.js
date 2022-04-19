/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconliuchengyindaoWeikaishi1 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <Path
        d="M406.2 585.5l39.4-5.2c4.5 22.3 12.2 38.4 23.1 48.2s24.1 14.8 39.7 14.8c18.5 0 34.2-6.4 46.9-19.2 12.8-12.8 19.1-28.7 19.1-47.7 0-18.1-5.9-33-17.7-44.7s-26.8-17.7-45-17.7c-7.4 0-16.7 1.5-27.8 4.4l4.4-34.6c2.6 0.3 4.7 0.4 6.3 0.4 16.8 0 31.9-4.4 45.3-13.1 13.4-8.8 20.1-22.2 20.1-40.5 0-14.4-4.9-26.4-14.7-35.9s-22.4-14.2-37.8-14.2c-15.3 0-28.1 4.8-38.3 14.4-10.2 9.6-16.8 24.1-19.7 43.3l-39.4-7c4.8-26.4 15.8-46.9 32.8-61.4s38.3-21.8 63.7-21.8c17.5 0 33.6 3.8 48.3 11.3s26 17.8 33.8 30.7c7.8 13 11.7 26.8 11.7 41.3 0 13.8-3.7 26.5-11.2 37.8s-18.4 20.4-33 27.1c19 4.4 33.7 13.5 44.2 27.2s15.8 31 15.8 51.7c0 28-10.2 51.7-30.6 71.2-20.4 19.5-46.2 29.2-77.4 29.2-28.2 0-51.5-8.4-70.1-25.2s-29.2-38.1-31.9-64.8z"
        fill={getIconColor(color, 1, '#AFAFC4')}
      />
    </Svg>
  );
};

IconliuchengyindaoWeikaishi1.defaultProps = {
  size: 18,
};

export default IconliuchengyindaoWeikaishi1;
