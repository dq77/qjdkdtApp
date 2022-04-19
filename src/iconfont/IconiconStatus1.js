/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconStatus1 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 346.7c-91.2 0-165.3 74.2-165.3 165.3S420.8 677.3 512 677.3 677.3 603.2 677.3 512 603.2 346.7 512 346.7z"
        fill={getIconColor(color, 0, '#5F5F87')}
      />
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m169.7 617.7C636.4 727 576.1 752 512 752s-124.4-25-169.7-70.3S272 576.1 272 512s25-124.4 70.3-169.7S447.9 272 512 272s124.4 25 169.7 70.3S752 447.9 752 512s-25 124.4-70.3 169.7z"
        fill={getIconColor(color, 1, '#5F5F87')}
      />
    </Svg>
  );
};

IconiconStatus1.defaultProps = {
  size: 18,
};

export default IconiconStatus1;
