/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconnavibarWanjie = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M715.2 257.6h-57.6v-24c0-12.8-11.2-24-24-24s-24 11.2-24 24v24H414.4v-24c0-12.8-11.2-24-24-24s-24 11.2-24 24v24h-57.6c-43.2 0-76.8 35.2-76.8 76.8v406.4c0 43.2 35.2 76.8 76.8 76.8h406.4c43.2 0 76.8-35.2 76.8-76.8V334.4c0-43.2-33.6-76.8-76.8-76.8z m-406.4 49.6h57.6V336c0 12.8 11.2 24 24 24s24-11.2 24-24v-28.8h196.8V336c0 12.8 11.2 24 24 24s24-11.2 24-24v-28.8h57.6c16 0 27.2 12.8 27.2 27.2v67.2h-464v-67.2c0-16 12.8-27.2 28.8-27.2z m406.4 462.4H308.8c-16 0-27.2-12.8-27.2-27.2V451.2h462.4v291.2c0 14.4-12.8 27.2-28.8 27.2z"
        fill={getIconColor(color, 0, '#2D2926')}
      />
      <Path
        d="M614.4 520l-112 112-67.2-67.2c-9.6-9.6-24-9.6-33.6 0s-9.6 24 0 33.6l84.8 84.8c4.8 4.8 11.2 6.4 17.6 6.4s12.8-3.2 17.6-6.4l128-128c9.6-9.6 9.6-24 0-33.6s-25.6-11.2-35.2-1.6z"
        fill={getIconColor(color, 1, '#2D2926')}
      />
    </Svg>
  );
};

IconnavibarWanjie.defaultProps = {
  size: 18,
};

export default IconnavibarWanjie;
