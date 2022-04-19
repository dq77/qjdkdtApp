/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconnavibarXijie = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 456c-14.4 0-24 11.2-24 24v192c0 12.8 11.2 24 24 24s24-11.2 24-24V480c0-12.8-9.6-24-24-24z"
        fill={getIconColor(color, 0, '#2D2926')}
      />
      <Path
        d="M512 200c-172.8 0-312 140.8-312 312 0 172.8 140.8 312 312 312 172.8 0 312-140.8 312-312 0-172.8-139.2-312-312-312z m0 576c-145.6 0-264-118.4-264-264S366.4 248 512 248 776 366.4 776 512 657.6 776 512 776z"
        fill={getIconColor(color, 1, '#2D2926')}
      />
      <Path
        d="M512 334.4c-14.4 0-24 11.2-24 24v16c0 14.4 11.2 24 24 24s24-11.2 24-24v-16c0-12.8-9.6-24-24-24z"
        fill={getIconColor(color, 2, '#2D2926')}
      />
    </Svg>
  );
};

IconnavibarXijie.defaultProps = {
  size: 18,
};

export default IconnavibarXijie;
