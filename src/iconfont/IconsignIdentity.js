/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconsignIdentity = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-479.9 0a479.9 479.9 0 1 0 959.8 0 479.9 479.9 0 1 0-959.8 0Z"
        fill={getIconColor(color, 0, '#E1E6E9')}
      />
      <Path
        d="M122.9 235.3h778.4v553.5H122.9z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M916.2 803.7H107.8V220.3h808.4v583.4z m-778.4-29.9h748.4V250.2H137.8v523.6z"
        fill={getIconColor(color, 2, '#3B3C5A')}
      />
      <Path
        d="M679.4 385.3m-70.4 0a70.4 70.4 0 1 0 140.8 0 70.4 70.4 0 1 0-140.8 0Z"
        fill={getIconColor(color, 3, '#FFFFFF')}
      />
      <Path
        d="M679.4 470.8c-46.4 0-85.5-37.5-85.5-85.5 0-46.4 37.5-85.5 85.5-85.5 46.4 0 85.5 37.5 85.5 85.5 0 46.6-39 85.5-85.5 85.5z m0-139.5c-30 0-55.5 24-55.5 55.5s24 55.5 55.5 55.5 55.5-24 55.5-55.5c-0.1-31.5-25.5-55.5-55.5-55.5z"
        fill={getIconColor(color, 4, '#3B3C5A')}
      />
      <Path
        d="M811.3 635.7c0-64.5-52.5-118.4-118.4-118.4h-27c-64.5 0-118.4 52.5-118.4 118.4h263.8z"
        fill={getIconColor(color, 5, '#FDBF5E')}
      />
      <Path
        d="M826.4 650.8H533.9v-15.1c0-73.6 60.1-133.5 133.5-133.5h27c73.6 0 133.5 60.1 133.5 133.5v15.1h-1.5z m-262.5-30.1h231c-7.5-49.6-49.6-88.5-101.9-88.5h-27c-51.2 1.6-94.6 39.1-102.1 88.5z"
        fill={getIconColor(color, 6, '#3B3C5A')}
      />
      <Path
        d="M199.4 316.3h261v114h-261z"
        fill={getIconColor(color, 7, '#F16051')}
      />
      <Path
        d="M202.5 509.8h256.4v30H202.5zM202.5 601.2h256.4v30H202.5zM202.2 694.2h616.4v30H202.2z"
        fill={getIconColor(color, 8, '#3B3C5A')}
      />
      <Path
        d="M240 358.3h30v30h-30zM315 358.3h30v30h-30zM388.4 358.3h30v30h-30z"
        fill={getIconColor(color, 9, '#FFFFFF')}
      />
    </Svg>
  );
};

IconsignIdentity.defaultProps = {
  size: 18,
};

export default IconsignIdentity;
