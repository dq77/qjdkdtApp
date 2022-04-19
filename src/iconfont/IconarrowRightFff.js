/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconarrowRightFff = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M326.892308 1024L212.676923 901.907692l382.030769-393.846154L196.923077 126.030769 319.015385 0 827.076923 512z"
        fill={getIconColor(color, 0, '#FFFFFF')}
      />
    </Svg>
  );
};

IconarrowRightFff.defaultProps = {
  size: 18,
};

export default IconarrowRightFff;
