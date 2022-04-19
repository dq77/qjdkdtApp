/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconManager = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512.2 512m-437.6 0a437.6 437.6 0 1 0 875.2 0 437.6 437.6 0 1 0-875.2 0Z"
        fill={getIconColor(color, 0, '#FDBF5E')}
      />
      <Path
        d="M88.4 348l423.8 557.8L936.1 348H88.4z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M512.2 919.5h-6.9l-4.1-5.4L71.8 350.7l8.2-16.4h864.2l8.2 15-5.4 6.9-427.9 563.3h-6.9zM115.7 361.6l396.5 520.9 396.5-520.9h-793z"
        fill={getIconColor(color, 2, '#193651')}
      />
      <Path
        d="M516.4 183.8L672.2 348h9.6l134-164.2z"
        fill={getIconColor(color, 3, '#E1E6E9')}
      />
      <Path
        d="M936.1 348l-119-164.2-134 164.2h253zM207.3 183.8L88.4 348h257.1L211.4 183.8h-4.1z"
        fill={getIconColor(color, 4, '#FFFFFF')}
      />
      <Path
        d="M211.4 183.8L345.3 348h9.6l154.6-164.2z"
        fill={getIconColor(color, 5, '#E1E6E9')}
      />
      <Path
        d="M509.5 183.8L354.9 348h317.3L516.4 183.8zM681.8 348H88.4l423.8 557.8L936.1 348z"
        fill={getIconColor(color, 6, '#FFFFFF')}
      />
      <Path
        d="M498.5 450.5h26v27.3h-26zM498.5 514.7h26V542h-26zM498.5 580.4h26v27.3h-26z"
        fill={getIconColor(color, 7, '#3B3C5A')}
      />
      <Path
        d="M948.4 342.4c0-1.4-1.4-1.4-1.4-1.4L824 170.1H204.5L77.4 339.7s-1.4 1.4-1.4 2.7c-2.7 4.1-1.4 10.9 1.4 15l423.8 557.8c1.4 1.4 2.7 2.7 4.1 2.7 0 0 1.4 0 2.7 1.4h9.6c1.4 0 1.4-1.4 1.4-1.4 1.4 0 1.4-1.4 2.7-1.4l423.8-558c4.3-6.5 5.7-11.9 2.9-16.1z m-832.7 19.2h216.1l145 474.5-361.1-474.5z m396.5 497.7L360.5 361.6h303.6L512.2 859.3z m35.6-21.8l145-475.9h216.1L547.8 837.5zM115.7 334.3l102.5-136.7h592.1l98.5 136.7H115.7z"
        fill={getIconColor(color, 8, '#3B3C5A')}
      />
      <Path
        d="M192.2 397.2h108.1l72.5 239.2zM724.1 397.2h108.1L651.6 636.4z"
        fill={getIconColor(color, 9, '#E1E6E9')}
      />
    </Svg>
  );
};

IconiconManager.defaultProps = {
  size: 18,
};

export default IconiconManager;
