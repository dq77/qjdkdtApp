/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconPwdhide = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M787.9 389.5c-6.8-4.6-16.1-2.8-20.7 4-35.7 53-116.3 141.7-255.2 141.7-138.8 0-219.5-88.7-255.2-141.6-4.6-6.8-13.9-8.6-20.7-4-6.8 4.6-8.6 13.9-4 20.7 24.2 35.8 67.2 86.5 132.7 120l-24.4 42.5c-4.1 7.2-1.6 16.3 5.5 20.4 2.3 1.3 4.9 2 7.4 2 5.2 0 10.2-2.7 13-7.5l25.8-45.1c30.7 12.1 65.6 20.2 104.9 21.9v57.6c0 8.2 6.7 14.9 14.9 14.9 8.3 0 14.9-6.7 14.9-14.9v-57.6c39.4-1.7 74.3-9.7 104.9-21.9l25.8 45.1c2.8 4.8 7.8 7.5 13 7.5 2.5 0 5.1-0.6 7.4-2 7.2-4.1 9.6-13.2 5.5-20.4L659 530.3c65.5-33.5 108.6-84.2 132.7-120 4.9-6.9 3.1-16.1-3.8-20.8z"
        fill={getIconColor(color, 0, '#596C94')}
      />
    </Svg>
  );
};

IconiconPwdhide.defaultProps = {
  size: 18,
};

export default IconiconPwdhide;
