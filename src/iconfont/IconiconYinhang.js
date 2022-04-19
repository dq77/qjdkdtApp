/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconYinhang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M721.664 626.048h48.896v55.552h-48.896z m-73.984 55.552v-55.552h-48.896v55.552z m11.008-55.552h48.768v55.552h-48.64z"
        fill={getIconColor(color, 0, '#9CA7D0')}
      />
      <Path
        d="M512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z m328.96 713.344a59.392 59.392 0 0 1-59.392 59.136H241.92a59.392 59.392 0 0 1-59.392-59.136V465.152H840.96v248.192z m0-336.896H182.528v-65.92a59.392 59.392 0 0 1 59.392-59.136h539.648a59.392 59.392 0 0 1 59.776 59.136v65.92z"
        fill={getIconColor(color, 1, '#9CA7D0')}
      />
    </Svg>
  );
};

IconiconYinhang.defaultProps = {
  size: 18,
};

export default IconiconYinhang;
