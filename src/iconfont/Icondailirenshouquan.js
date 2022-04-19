/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icondailirenshouquan = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M39.614645 0m30.117647 0l843.294117 0q30.117647 0 30.117647 30.117647l0 963.764706q0 30.117647-30.117647 30.117647l-843.294117 0q-30.117647 0-30.117647-30.117647l0-963.764706q0-30.117647 30.117647-30.117647Z"
        fill={getIconColor(color, 0, '#2A6EE7')}
      />
      <Path
        d="M491.379351 0h421.647058a30.117647 30.117647 0 0 1 30.117647 30.117647v963.764706a30.117647 30.117647 0 0 1-30.117647 30.117647H491.379351V0z"
        fill={getIconColor(color, 1, '#B3D6FF')}
      />
      <Path
        d="M280.555821 602.352941h421.647059v210.82353H280.555821z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
      <Path
        d="M491.379351 361.411765m-180.705883 0a180.705882 180.705882 0 1 0 361.411765 0 180.705882 180.705882 0 1 0-361.411765 0Z"
        fill={getIconColor(color, 3, '#FFFFFF')}
      />
    </Svg>
  );
};

Icondailirenshouquan.defaultProps = {
  size: 18,
};

export default Icondailirenshouquan;
