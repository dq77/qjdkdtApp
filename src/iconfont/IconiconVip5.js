/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconVip5 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M856.4 63.9H167.8C110.5 63.9 64 110.5 64 167.8v688.4c0 57.4 46.5 103.9 103.8 103.9h688.4c57.3 0 103.8-46.5 103.8-103.8V167.8c0.1-57.3-46.4-103.9-103.6-103.9zM154.2 277.5v-60.7h180.5v221.9l216.7-221.9h144.3L214.3 732.5v-455h-60.1z m635.7 401.1H596.1l-29 90.8h194.2L735.6 849H461.4l79.7-250.1h194.3l29.3-89.4H570.8l25.7-79.6h274.6l-81.2 248.7z"
        fill={getIconColor(color, 0, '#F68530')}
      />
    </Svg>
  );
};

IconiconVip5.defaultProps = {
  size: 18,
};

export default IconiconVip5;
