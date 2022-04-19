/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconsignBusiness1 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-479.9 0a479.9 479.9 0 1 0 959.8 0 479.9 479.9 0 1 0-959.8 0Z"
        fill={getIconColor(color, 0, '#E1E6E9')}
      />
      <Path
        d="M152.1 79.7h721.5v857.9H152.1z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M137.1 68.1V956H887V68.1H137.1z m720 29.9l-0.1 828H167.2V98h689.9z"
        fill={getIconColor(color, 2, '#3B3C5A')}
      />
      <Path
        d="M273.2 339.3H616v31.9H273.2zM273.2 436.7H616v31.9H273.2zM272.9 535.9h477.3v31.9H272.9zM272.9 220.9h76v31.9h-76zM407.1 220.9h76v31.9h-76zM541.2 220.9h76v31.9h-76zM675.4 220.9h76v31.9h-76z"
        fill={getIconColor(color, 3, '#193651')}
      />
      <Path
        d="M674.7 743.2m-75.1 0a75.1 75.1 0 1 0 150.2 0 75.1 75.1 0 1 0-150.2 0Z"
        fill={getIconColor(color, 4, '#F16051')}
      />
      <Path
        d="M674.7 834.3c-49.5 0-91.1-40-91.1-91.1 0-49.5 40-91.1 91.1-91.1 49.5 0 91.1 40 91.1 91.1 0 49.6-41.6 91.1-91.1 91.1z m0-148.6c-31.9 0-59.2 25.6-59.2 59.2s25.6 59.2 59.2 59.2 59.2-25.6 59.2-59.2c-0.2-33.7-27.3-59.2-59.2-59.2z"
        fill={getIconColor(color, 5, '#3B3C5A')}
      />
    </Svg>
  );
};

IconsignBusiness1.defaultProps = {
  size: 18,
};

export default IconsignBusiness1;
