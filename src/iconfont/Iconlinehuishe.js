/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconlinehuishe = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0h1024v1024H0z"
        fill={getIconColor(color, 0, '#F0EFF6')}
      />
      <Path
        d="M512 856.746667A344.746667 344.746667 0 1 1 856.746667 512 345.088 345.088 0 0 1 512 856.746667z m0-655.36a310.613333 310.613333 0 1 0 310.613333 310.613333A310.954667 310.954667 0 0 0 512 201.386667z"
        fill={getIconColor(color, 1, '#DFDFE7')}
      />
      <Path
        d="M676.181333 506.538667h-146.773333v-187.733334a17.408 17.408 0 0 0-17.066667-17.066666 17.066667 17.066667 0 0 0-17.066666 17.066666v204.8a17.066667 17.066667 0 0 0 17.066666 17.066667h163.84a17.066667 17.066667 0 0 0 17.066667-17.066667 17.408 17.408 0 0 0-17.066667-17.066666z"
        fill={getIconColor(color, 2, '#DFDFE7')}
      />
    </Svg>
  );
};

Iconlinehuishe.defaultProps = {
  size: 18,
};

export default Iconlinehuishe;
