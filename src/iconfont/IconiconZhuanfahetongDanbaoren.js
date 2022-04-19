/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconZhuanfahetongDanbaoren = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m352 790.4v-32H400v51.2h444.8C764.8 902.4 643.2 960 512 960c-121.6 0-230.4-48-310.4-128h67.2c44.8 0 67.2-25.6 67.2-73.6v-211.2c35.2-12.8 67.2-28.8 102.4-44.8V448c-32 19.2-67.2 35.2-102.4 48v-163.2h96V281.6h-96V140.8H281.6v137.6H172.8v54.4h105.6v182.4c-38.4 12.8-80 25.6-121.6 35.2l12.8 54.4c38.4-9.6 73.6-22.4 108.8-35.2v176c0 25.6-12.8 38.4-35.2 38.4-22.4 0-41.6 0-67.2-3.2l16 44.8c-80-80-128-192-128-313.6C64 265.6 265.6 64 512 64s448 201.6 448 448c0 105.6-35.2 201.6-96 278.4z"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M473.6 659.2h332.8V192H473.6v467.2z m54.4-416h227.2v160h-227.2v-160z m0 208h227.2V608h-227.2v-156.8z"
        fill={getIconColor(color, 1, '#464678')}
      />
    </Svg>
  );
};

IconiconZhuanfahetongDanbaoren.defaultProps = {
  size: 18,
};

export default IconiconZhuanfahetongDanbaoren;
