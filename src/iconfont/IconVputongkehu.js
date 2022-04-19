/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconVputongkehu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 512A512 512 0 1 1 512 0a512 512 0 0 1 512 512"
        fill={getIconColor(color, 0, '#D3D3D3')}
      />
      <Path
        d="M955.733333 512A443.733333 443.733333 0 1 1 512 68.266667a443.733333 443.733333 0 0 1 443.733333 443.733333"
        fill={getIconColor(color, 1, '#E0E0E0')}
      />
      <Path
        d="M689.834667 750.933333a259.072 259.072 0 0 1-23.893334-48.810666H546.133333v-163.498667h164.522667A785.066667 785.066667 0 0 1 750.933333 273.066667h-63.146666a662.869333 662.869333 0 0 0-29.696 216.746666H546.133333v-30.72h93.184l4.096-49.493333h-245.76l3.072 48.810667h92.842667v30.72h-110.592A662.869333 662.869333 0 0 0 353.28 273.066667H290.133333a775.168 775.168 0 0 1 39.253334 265.216h164.181333v163.498666H375.466667a259.072 259.072 0 0 1-23.893334 48.810667z m-47.445334-358.4l6.144-44.373333A128 128 0 0 1 549.888 273.066667h-58.709333a128 128 0 0 1-98.645334 75.093333l6.144 44.373333a307.2 307.2 0 0 0 121.856-51.2 307.2 307.2 0 0 0 121.856 51.2z m82.261334 170.666667H597.333333v110.933333h53.248V614.4h26.282667a370.005333 370.005333 0 0 0 47.104 136.533333H785.066667a417.450667 417.450667 0 0 1-60.416-186.368z m-389.461334 0h125.610667v110.933333h-53.248V614.4h-26.282667a370.005333 370.005333 0 0 1-47.104 136.533333H273.066667a419.498667 419.498667 0 0 0 62.122666-187.733333z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconVputongkehu.defaultProps = {
  size: 18,
};

export default IconVputongkehu;
