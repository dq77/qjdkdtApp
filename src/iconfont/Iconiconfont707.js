/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconiconfont707 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M914.817322 537.311479 109.182678 537.311479c-13.482059 0-24.413016-11.06501-24.413016-24.559349s10.930957-24.559349 24.413016-24.559349l805.634644 0c13.482059 0 24.413016 11.06501 24.413016 24.559349S928.299381 537.311479 914.817322 537.311479z"
        fill={getIconColor(color, 0, '#e6e6e6')}
      />
      <Path
        d="M536.440645 109.935832l0 805.634644c0 13.482059-11.06501 24.413016-24.559349 24.413016s-24.559349-10.930957-24.559349-24.413016l0-805.634644c0-13.482059 11.06501-24.413016 24.559349-24.413016S536.440645 96.453772 536.440645 109.935832z"
        fill={getIconColor(color, 1, '#e6e6e6')}
      />
    </Svg>
  );
};

Iconiconfont707.defaultProps = {
  size: 18,
};

export default Iconiconfont707;
