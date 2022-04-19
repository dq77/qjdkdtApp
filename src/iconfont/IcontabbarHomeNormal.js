/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcontabbarHomeNormal = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M984.177778 432.355556l-455.111111-360.296297c-9.481481-7.585185-24.651852-7.585185-36.02963 0l-455.111111 360.296297c-13.274074 9.481481-15.17037 28.444444-3.792593 39.822222 9.481481 11.377778 28.444444 15.17037 39.822223 3.792592l49.303703-37.925926V929.185185c0 15.17037 13.274074 28.444444 28.444445 28.444445h720.592592c15.17037 0 28.444444-13.274074 28.444445-28.444445V438.044444l49.303703 37.925926c5.688889 3.792593 11.377778 5.688889 17.066667 5.688889 7.585185 0 17.066667-3.792593 22.755556-11.377778 9.481481-9.481481 7.585185-28.444444-5.688889-37.925925zM597.333333 900.740741h-170.666666v-322.370371h170.666666v322.370371z m246.518519-502.518519v502.518519h-189.62963V549.925926c0-15.17037-13.274074-28.444444-28.444444-28.444445H398.222222c-15.17037 0-28.444444 13.274074-28.444444 28.444445v350.814815h-189.62963V398.222222v-3.792592L512 130.844444l331.851852 263.585186v3.792592z"
        fill={getIconColor(color, 0, '#464678')}
      />
    </Svg>
  );
};

IcontabbarHomeNormal.defaultProps = {
  size: 18,
};

export default IcontabbarHomeNormal;
