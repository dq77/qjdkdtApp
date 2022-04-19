/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconArrowDown = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M341.333 426.667L512 597.333l170.667-170.666z"
        fill={getIconColor(color, 0, '#353535')}
      />
    </Svg>
  );
};

IconiconArrowDown.defaultProps = {
  size: 18,
};

export default IconiconArrowDown;
