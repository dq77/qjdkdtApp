/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconyouhuiquanShiyongguizebiaoshi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M500.650667 0C225.28 0 0 225.28 0 500.650667s225.28 500.608 500.650667 500.608 500.693333-225.237333 500.693333-500.608C1001.386667 225.28 776.106667 0 500.650667 0z m0 938.709333c-240.426667 1.536-436.565333-192.128-438.058667-432.554666v-5.504c0-244.053333 194.005333-438.058667 438.058667-438.058667s438.058667 194.005333 438.058666 438.058667c1.536 240.426667-192.128 436.565333-432.554666 438.058666h-5.504z"
        fill={getIconColor(color, 0, '#AFACAC')}
      />
      <Path
        d="M500.650667 688.384c-18.773333 0-31.274667 6.229333-43.776 18.773333-12.586667 12.501333-18.858667 25.045333-18.858667 43.861334 0 18.688 6.272 31.274667 18.858667 43.861333 12.501333 12.458667 24.917333 18.688 43.776 18.688 18.773333 0 31.274667-6.229333 43.861333-18.688 12.501333-12.586667 18.773333-25.130667 18.773333-43.861333 0-18.773333-6.272-31.36-18.773333-43.818667-12.586667-12.586667-25.130667-18.773333-43.861333-18.773333zM444.330667 187.733333l18.773333 450.602667h68.821333l25.045334-450.56h-112.64z"
        fill={getIconColor(color, 1, '#AFACAC')}
      />
    </Svg>
  );
};

IconyouhuiquanShiyongguizebiaoshi.defaultProps = {
  size: 18,
};

export default IconyouhuiquanShiyongguizebiaoshi;
