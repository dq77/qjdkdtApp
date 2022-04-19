/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconbianzu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1170 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0m217.700805 0l725.669348 0q217.700805 0 217.700805 217.700805l0 580.535478q0 217.700805-217.700805 217.700805l-725.669348 0q-217.700805 0-217.700805-217.700805l0-580.535478q0-217.700805 217.700805-217.700805Z"
        fill={getIconColor(color, 0, '#2A6EE7')}
      />
      <Path
        d="M580.535479 217.700805a54.425201 54.425201 0 0 1 54.425201 54.425201v181.417337h181.417337a54.425201 54.425201 0 0 1 0 108.850402H634.96068v181.417337a54.425201 54.425201 0 0 1-108.850402 0l-0.018142-181.417337H344.692941a54.425201 54.425201 0 0 1 0-108.850402h181.417337V272.126006a54.425201 54.425201 0 0 1 54.425201-54.425201z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconbianzu.defaultProps = {
  size: 18,
};

export default Iconbianzu;
