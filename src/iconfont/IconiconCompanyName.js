/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconCompanyName = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M825.7 448.4L544 240.6c-18.3-14.1-43.7-14.1-62-0.1L198 448.4c-6.7 4.9-8.1 14.3-3.2 21 2.9 4 7.5 6.1 12.1 6.1 3.1 0 6.2-0.9 8.8-2.9l59.1-43.3v353.8c0 8.3 6.7 15 15 15h444c8.3 0 15-6.7 15-15V429l59.1 43.6c6.7 4.9 16.1 3.5 21-3.2 4.9-6.7 3.5-16.1-3.2-21zM427.8 768.1V566.5h168v201.6h-168z m291-360.1v360.1h-93V551.5c0-8.3-6.7-15-15-15h-198c-8.3 0-15 6.7-15 15v216.6h-93V408v-0.7l195-142.8c0.1-0.1 0.2-0.2 0.3-0.2 7.5-5.8 18.1-5.8 25.6 0 0.1 0.1 0.2 0.2 0.3 0.2l192.9 142.3c0 0.4-0.1 0.8-0.1 1.2z"
        fill={getIconColor(color, 0, '#888888')}
      />
    </Svg>
  );
};

IconiconCompanyName.defaultProps = {
  size: 18,
};

export default IconiconCompanyName;
