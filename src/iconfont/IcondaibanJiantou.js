/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcondaibanJiantou = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#D8DDE2')}
      />
      <Path
        d="M362.728727 269.637818a46.545455 46.545455 0 0 1 62.859637-2.722909l2.955636 2.722909 232.727273 232.727273a46.545455 46.545455 0 0 1 2.722909 62.859636l-2.722909 2.955637-232.727273 232.727272a46.545455 46.545455 0 0 1-68.538182-62.859636l2.722909-2.955636L562.501818 535.272727l-199.796363-199.819636a46.545455 46.545455 0 0 1-2.72291-62.859636l2.72291-2.955637z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IcondaibanJiantou.defaultProps = {
  size: 18,
};

export default IcondaibanJiantou;
