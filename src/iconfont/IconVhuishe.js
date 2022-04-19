/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconVhuishe = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 512A512 512 0 1 1 512 0a512 512 0 0 1 512 512"
        fill={getIconColor(color, 0, '#C79F5F')}
      />
      <Path
        d="M1024 512A512 512 0 1 1 512 0a512 512 0 0 1 512 512"
        fill={getIconColor(color, 1, '#D3D3D3')}
      />
      <Path
        d="M955.733333 512A443.733333 443.733333 0 1 1 512 68.266667a443.733333 443.733333 0 0 1 443.733333 443.733333"
        fill={getIconColor(color, 2, '#E0E0E0')}
      />
      <Path
        d="M733.525333 360.106667l-78.165333 56.661333a10.581333 10.581333 0 0 0-3.413333 5.12L641.024 477.866667a8.533333 8.533333 0 0 0 13.653333 8.192l42.666667-31.402667a8.533333 8.533333 0 0 1 13.312 8.533333l-51.2 255.317334a8.874667 8.874667 0 0 0 8.533333 10.24H716.8a8.533333 8.533333 0 0 0 8.192-6.826667L795.306667 368.64a8.533333 8.533333 0 0 0-8.533334-10.24h-48.128a8.533333 8.533333 0 0 0-5.12 1.706667M558.08 358.4a8.192 8.192 0 0 0-7.168 4.096L477.866667 491.178667l-53.930667 93.184a8.192 8.192 0 0 1-14.677333 0L324.266667 439.637333a8.533333 8.533333 0 0 1 7.168-12.970666h98.645333a9.216 9.216 0 0 0 7.509333-4.096l29.354667-51.2a8.533333 8.533333 0 0 0-7.509333-12.970667H213.333333a8.874667 8.874667 0 0 0-7.509333 12.970667L409.6 720.896a8.192 8.192 0 0 0 14.677333 0l200.362667-349.525333a8.533333 8.533333 0 0 0-7.509333-12.970667z"
        fill={getIconColor(color, 3, '#FFFFFF')}
      />
    </Svg>
  );
};

IconVhuishe.defaultProps = {
  size: 18,
};

export default IconVhuishe;