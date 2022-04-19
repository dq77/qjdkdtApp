/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icongongneng4 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#D3B685')}
      />
      <Path
        d="M706.56 184.32a51.2 51.2 0 0 1 51.2 51.2v552.96a51.2 51.2 0 0 1-51.2 51.2H317.44a51.2 51.2 0 0 1-51.2-51.2V235.52a51.2 51.2 0 0 1 51.2-51.2h389.12z m-112.64 416.6656A152.8832 152.8832 0 0 1 512 624.64c-30.1184 0-58.2016-8.6656-81.92-23.6416v66.9824a12.8 12.8 0 0 0 21.2608 9.6l52.1984-46.0032a12.8 12.8 0 0 1 16.9216 0l52.1984 46.0032a12.8 12.8 0 0 0 21.2608-9.6zM512 327.68c-79.1808 0-143.36 64.1792-143.36 143.36C368.64 550.2208 432.8192 614.4 512 614.4c79.1808 0 143.36-64.1792 143.36-143.36 0-79.1808-64.1792-143.36-143.36-143.36z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M696.32 634.88c21.7216 0 42.4704 4.224 61.44 11.904V788.48a51.2 51.2 0 0 1-51.2 51.2H537.6384a164.1344 164.1344 0 0 1-5.1584-40.96c0-90.496 73.344-163.84 163.84-163.84z"
        fill={getIconColor(color, 2, '#D3B685')}
        opacity=".4"
      />
    </Svg>
  );
};

Icongongneng4.defaultProps = {
  size: 18,
};

export default Icongongneng4;
