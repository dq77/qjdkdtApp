/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconshujuWeidianliang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0C794.760533 0 1024 229.239467 1024 512S794.760533 1024 512 1024 0 794.760533 0 512 229.239467 0 512 0z m0 68.266667C266.922667 68.266667 68.266667 266.922667 68.266667 512S266.922667 955.733333 512 955.733333 955.733333 757.077333 955.733333 512 757.077333 68.266667 512 68.266667z"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M523.377778 4.141511a34.133333 34.133333 0 0 1 33.974044 30.833778l0.159289 3.299555-0.022755 439.569067L977.169067 477.866667a34.133333 34.133333 0 0 1 33.974044 30.856533l0.159289 3.2768a34.133333 34.133333 0 0 1-30.833778 33.974044l-3.299555 0.159289H523.377778a34.133333 34.133333 0 0 1-33.974045-30.856533L489.244444 512V38.274844a34.133333 34.133333 0 0 1 34.133334-34.133333z"
        fill={getIconColor(color, 1, '#464678')}
      />
    </Svg>
  );
};

IconshujuWeidianliang.defaultProps = {
  size: 18,
};

export default IconshujuWeidianliang;
