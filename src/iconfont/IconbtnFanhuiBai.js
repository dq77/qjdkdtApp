/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconbtnFanhuiBai = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M680.228571 21.942857C709.485714-7.314286 755.809524-7.314286 782.628571 21.942857c26.819048 26.819048 29.257143 70.704762 4.876191 99.961905l-2.438095 2.438095L394.971429 512l387.657142 387.657143c26.819048 26.819048 29.257143 70.704762 2.438096 99.961905l-2.438096 2.438095c-26.819048 26.819048-70.704762 29.257143-99.961904 2.438095l-2.438096-2.438095-438.857142-438.857143C214.552381 536.380952 212.114286 492.495238 236.495238 463.238095l2.438095-2.438095L680.228571 21.942857z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
    </Svg>
  );
};

IconbtnFanhuiBai.defaultProps = {
  size: 18,
};

export default IconbtnFanhuiBai;
