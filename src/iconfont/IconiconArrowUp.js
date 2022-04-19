/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconArrowUp = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M682.667 597.333L512 426.667 341.333 597.333z"
        fill={getIconColor(color, 0, '#353535')}
      />
    </Svg>
  );
};

IconiconArrowUp.defaultProps = {
  size: 18,
};

export default IconiconArrowUp;
