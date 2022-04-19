/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconDel = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m261.3 476H250.7c-15.5 0-28-12.5-28-28s12.5-28 28-28h522.7c15.5 0 28 12.5 28 28s-12.6 28-28.1 28z"
        fill={getIconColor(color, 0, '#F6625F')}
      />
    </Svg>
  );
};

IconiconDel.defaultProps = {
  size: 18,
};

export default IconiconDel;
