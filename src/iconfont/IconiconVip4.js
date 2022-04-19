/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconVip4 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M856.4 63.9H167.8C110.5 63.9 64 110.5 64 167.8v688.4c0 57.4 46.5 103.9 103.8 103.9h688.4c57.3 0 103.8-46.5 103.8-103.8V167.8c0.1-57.3-46.4-103.9-103.6-103.9zM154.2 277.5v-60.7h180.5v221.9l216.7-221.9h144.3L214.3 732.5v-455h-60.1z m604.5 491.9L733 849H501.7l25.7-79.6h75.4l83.9-259.9h-67.4l25.7-79.6h147.7L683.2 769.4h75.5z"
        fill={getIconColor(color, 0, '#FBB03B')}
      />
    </Svg>
  );
};

IconiconVip4.defaultProps = {
  size: 18,
};

export default IconiconVip4;
