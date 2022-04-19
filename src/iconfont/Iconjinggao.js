/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconjinggao = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.58 64 64 264.58 64 512s200.58 448 448 448 448-200.58 448-448S759.42 64 512 64z m0 752a36 36 0 1 1 36-36 36 36 0 0 1-36 36z m51.83-551.95L548 636a36 36 0 0 1-72 0l-15.83-371.95c-0.1-1.33-0.17-2.68-0.17-4.05a52 52 0 0 1 104 0c0 1.37-0.07 2.72-0.17 4.05z"
        fill={getIconColor(color, 0, '#f2a133')}
      />
    </Svg>
  );
};

Iconjinggao.defaultProps = {
  size: 18,
};

export default Iconjinggao;
