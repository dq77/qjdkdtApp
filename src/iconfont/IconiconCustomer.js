/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconCustomer = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 541.1m-437.6 0a437.6 437.6 0 1 0 875.2 0 437.6 437.6 0 1 0-875.2 0Z"
        fill={getIconColor(color, 0, '#F16051')}
      />
      <Path
        d="M546.2 509.7l15.6 66.2-49.8 97.8-47.8-93.8 16.3-66.1-23.1-43.9 54.6-61.5 54.8 61.5z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M512 203.4m-146.3 0a146.3 146.3 0 1 0 292.6 0 146.3 146.3 0 1 0-292.6 0Z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
      <Path
        d="M512 363.4c-87.5 0-160-71.1-160-160s72.5-160 160-160 160 71.1 160 160-72.5 160-160 160z m0-292.7c-72.5 0-132.7 58.8-132.7 132.7 0 72.5 58.8 132.7 132.7 132.7s132.7-58.8 132.7-132.7S584.5 70.7 512 70.7z"
        fill={getIconColor(color, 3, '#3B3C5A')}
      />
      <Path
        d="M629.5 442.6L512 673.7 394.5 442.6c-112.1 0-203.8 91.7-203.8 203.8v244.8c0 8.2 6.9 13.7 13.7 13.7h615.3c8.2 0 13.7-6.9 13.7-13.7V647.8c-0.1-113.5-91.7-205.2-203.9-205.2z"
        fill={getIconColor(color, 4, '#D3D7DA')}
      />
      <Path
        d="M819.7 918.5H204.3c-15 0-27.3-12.3-27.3-27.3V647.8c0-120.4 97.1-217.4 217.4-217.4h8.2L512 643.7 620 429h8.2c120.3 0 217.4 97.1 217.4 217.4v244.8c1.4 15-10.9 27.3-25.9 27.3zM386.2 457.6c-101.2 4.1-181.9 87.5-181.9 190V891h615.3V647.8c0-102.5-80.7-186-181.9-190L511.9 703.9 386.2 457.6z"
        fill={getIconColor(color, 5, '#3B3C5A')}
      />
      <Path
        d="M425.9 802.2h27.3v27.3h-27.3zM498.3 802.2h27.3v27.3h-27.3zM570.8 802.2h27.3v27.3h-27.3z"
        fill={getIconColor(color, 6, '#3B3C5A')}
      />
    </Svg>
  );
};

IconiconCustomer.defaultProps = {
  size: 18,
};

export default IconiconCustomer;
