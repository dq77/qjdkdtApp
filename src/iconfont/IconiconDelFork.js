/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconDelFork = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z"
        fill={getIconColor(color, 0, '#F16051')}
      />
      <Path
        d="M718 671.8c12.8 12.8 12.8 33.4 0 46.2-6.4 6.4-14.7 9.6-23.1 9.6s-16.7-3.2-23.1-9.6L510.1 556.3 348.4 718c-6.4 6.4-14.7 9.6-23.1 9.6s-16.7-3.2-23.1-9.6a32.592 32.592 0 0 1 0-46.2l161.7-161.7-161.7-161.7a32.592 32.592 0 0 1 0-46.2c12.8-12.8 33.4-12.8 46.2 0l161.7 161.7 161.7-161.7c12.8-12.8 33.4-12.8 46.2 0s12.8 33.4 0 46.2L556.3 510.1 718 671.8z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

IconiconDelFork.defaultProps = {
  size: 18,
};

export default IconiconDelFork;
