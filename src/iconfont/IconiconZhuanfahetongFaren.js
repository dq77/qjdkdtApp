/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconZhuanfahetongFaren = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m339.2 803.2c-32-80-70.4-156.8-112-227.2l-54.4 19.2c22.4 38.4 44.8 80 67.2 128-96 19.2-188.8 32-284.8 41.6 38.4-48 80-131.2 128-249.6h252.8v-54.4h-217.6V316.8h198.4V265.6h-198.4V140.8H576v124.8h-182.4V320H576v144h-217.6v54.4h182.4C480 652.8 432 736 396.8 768c-3.2 0-6.4 3.2-12.8 6.4l12.8 48c134.4-12.8 262.4-32 377.6-51.2 9.6 25.6 19.2 51.2 32 76.8h3.2C729.6 915.2 627.2 960 512 960c-131.2 0-246.4-54.4-326.4-144l51.2 22.4c41.6-86.4 76.8-176 112-272L297.6 544c-32 92.8-70.4 182.4-115.2 268.8C108.8 732.8 64 627.2 64 512c0-124.8 51.2-233.6 131.2-316.8 51.2 38.4 89.6 73.6 118.4 108.8L352 265.6C320 230.4 281.6 195.2 236.8 160c76.8-60.8 172.8-96 275.2-96 246.4 0 448 201.6 448 448 0 112-41.6 214.4-108.8 291.2z"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M208 332.8l-38.4 38.4c48 41.6 86.4 80 115.2 115.2l38.4-38.4c-32-38.4-70.4-76.8-115.2-115.2z"
        fill={getIconColor(color, 1, '#464678')}
      />
    </Svg>
  );
};

IconiconZhuanfahetongFaren.defaultProps = {
  size: 18,
};

export default IconiconZhuanfahetongFaren;