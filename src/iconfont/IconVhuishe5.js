/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconVhuishe5 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 512A512 512 0 1 1 512 0a512 512 0 0 1 512 512"
        fill={getIconColor(color, 0, '#D3D3D3')}
      />
      <Path
        d="M952.32 565.930667A443.733333 443.733333 0 1 1 565.930667 71.68 443.733333 443.733333 0 0 1 952.32 565.930667"
        fill={getIconColor(color, 1, '#E0E0E0')}
      />
      <Path
        d="M808.96 409.6l10.24-41.301333a8.874667 8.874667 0 0 0-8.533333-10.24h-182.272a8.533333 8.533333 0 0 0-8.192 6.826666L580.266667 557.397333a8.533333 8.533333 0 0 0 8.533333 10.24h47.786667l2.389333-4.096a53.589333 53.589333 0 0 1 49.152-28.672c20.48 0 29.013333 9.898667 29.013333 34.133334a183.978667 183.978667 0 0 1-3.413333 32.426666c-9.557333 49.834667-27.306667 70.997333-59.392 70.997334a27.648 27.648 0 0 1-30.037333-31.744 86.357333 86.357333 0 0 1 0-9.216v-9.557334h-60.416v7.168a118.784 118.784 0 0 0 0 16.725334 84.309333 84.309333 0 0 0 92.501333 87.04 111.957333 111.957333 0 0 0 83.626667-32.426667 181.248 181.248 0 0 0 42.666666-95.914667 213.674667 213.674667 0 0 0 2.389334-41.984A79.530667 79.530667 0 0 0 701.098667 477.866667a104.448 104.448 0 0 0-30.72 4.096 8.533333 8.533333 0 0 1-10.922667-9.898667l9.557333-46.421333a8.192 8.192 0 0 1 8.192-6.485334h123.562667a8.533333 8.533333 0 0 0 8.192-9.557333M531.456 358.058667a8.533333 8.533333 0 0 0-7.509333 4.437333l-74.069334 128.341333-53.930666 93.184a8.192 8.192 0 0 1-14.677334 0l-83.968-144.725333a8.874667 8.874667 0 0 1 7.509334-12.970667h98.304a8.874667 8.874667 0 0 0 7.509333-4.096l29.696-51.2a8.874667 8.874667 0 0 0-7.509333-12.970666H186.709333a8.533333 8.533333 0 0 0-7.509333 12.970666l202.069333 349.525334a8.192 8.192 0 0 0 14.677334 0l202.069333-349.525334a8.874667 8.874667 0 0 0-7.509333-12.970666z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconVhuishe5.defaultProps = {
  size: 18,
};

export default IconVhuishe5;