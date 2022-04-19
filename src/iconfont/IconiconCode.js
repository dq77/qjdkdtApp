/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconCode = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M699.143 255.982H324.857c-37.976 0-68.871 30.179-68.871 67.274v377.488c0 37.095 30.896 67.273 68.871 67.273h374.285c37.976 0 68.871-30.179 68.871-67.273V323.256c0.001-37.095-30.895-67.274-68.87-67.274z m38.211 444.762c0 20.188-17.142 36.613-38.211 36.613H324.857c-21.069 0-38.211-16.425-38.211-36.613V323.256c0-20.189 17.142-36.614 38.211-36.614h374.285c21.069 0 38.211 16.425 38.211 36.614v377.488z"
        fill={getIconColor(color, 0, '#A2AFCC')}
      />
      <Path
        d="M444.164 396.492a9.198 9.198 0 0 0-17.096 0L340.65 613.946a9.198 9.198 0 0 0 5.151 11.945c4.721 1.879 10.068-0.431 11.945-5.151l31.71-79.793a9.186 9.186 0 0 0 2.8 0.437h86.72c0.977 0 1.917-0.155 2.8-0.437l31.71 79.793a9.202 9.202 0 0 0 8.551 5.804 9.197 9.197 0 0 0 8.545-12.596l-86.418-217.456z m-47.571 126.496l39.023-98.194 39.023 98.194h-78.046zM606.827 472.241c-11.832 0-23.29 2.328-33.823 6.798v-79.15c0-5.08-4.118-9.198-9.198-9.198s-9.198 4.118-9.198 9.198v94.186a9.18 9.18 0 0 0 0 0.846v105.866a9.193 9.193 0 0 0 0 2.367v14.191a9.198 9.198 0 0 0 9.198 9.198c5.037 0 9.123-4.05 9.192-9.07 10.534 4.472 21.994 6.801 33.83 6.801 45.04 0 81.684-34.101 81.684-76.016-0.001-41.917-36.645-76.017-81.685-76.017z m0 133.635c-12.126 0-23.719-3.071-33.823-8.916v-97.405c10.105-5.846 21.699-8.918 33.823-8.918 34.896 0 63.287 25.848 63.287 57.62s-28.39 57.619-63.287 57.619z"
        fill={getIconColor(color, 1, '#A2AFCC')}
      />
    </Svg>
  );
};

IconiconCode.defaultProps = {
  size: 18,
};

export default IconiconCode;
