/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconliuchengyindaoWeikaishi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
      <Path
        d="M613 635.2V673H401c-0.3-9.5 1.2-18.6 4.6-27.3 5.4-14.4 14-28.7 25.9-42.7s29-30.2 51.5-48.6c34.8-28.6 58.4-51.2 70.7-67.9s18.4-32.5 18.4-47.4c0-15.6-5.6-28.8-16.7-39.5s-25.7-16.1-43.6-16.1c-19 0-34.1 5.7-45.5 17.1s-17.1 27.1-17.3 47.2l-40.5-4.2c2.8-30.2 13.2-53.2 31.3-69s42.4-23.7 72.8-23.7c30.8 0 55.1 8.5 73.1 25.6s26.9 38.2 26.9 63.4c0 12.8-2.6 25.4-7.9 37.8s-14 25.4-26.1 39.2-32.4 32.5-60.7 56.4c-23.6 19.8-38.8 33.3-45.5 40.4s-12.2 14.2-16.6 21.3H613z"
        fill={getIconColor(color, 1, '#AFAFC4')}
      />
    </Svg>
  );
};

IconliuchengyindaoWeikaishi.defaultProps = {
  size: 18,
};

export default IconliuchengyindaoWeikaishi;
