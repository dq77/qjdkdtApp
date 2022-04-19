/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconxinyongbiao = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 0a512 512 0 0 1 512 512 512 512 0 0 1-512 512A512 512 0 0 1 0 512 512 512 0 0 1 512 0z"
        fill={getIconColor(color, 0, '#5494D6')}
      />
      <Path
        d="M763.904 326.314667a20.138667 20.138667 0 0 0 16.725333-6.485334 27.648 27.648 0 0 0 4.437334-16.725333 28.330667 28.330667 0 0 0-4.437334-16.725333 20.138667 20.138667 0 0 0-16.725333-6.144h-159.061333c-7.168-12.629333-13.994667-24.234667-21.162667-34.133334s-13.994667-20.48-20.821333-29.013333A30.72 30.72 0 0 0 546.133333 204.8a20.821333 20.821333 0 0 0-16.384 5.461333 20.821333 20.821333 0 0 0-3.072 34.133334l13.653334 18.773333c4.437333 5.802667 8.192 11.264 11.946666 17.066667h-166.912a20.821333 20.821333 0 0 0-17.749333 6.144 28.672 28.672 0 0 0-4.778667 16.725333 27.648 27.648 0 0 0 4.778667 16.725333 20.821333 20.821333 0 0 0 17.408 6.485334h378.88zM311.296 785.066667c15.36 0 23.210667-8.192 23.210667-24.917334V357.034667a959.146667 959.146667 0 0 0 36.864-109.568A54.613333 54.613333 0 0 0 375.466667 218.453333a19.114667 19.114667 0 0 0-17.408-13.653333 20.138667 20.138667 0 0 0-19.456 3.072 56.661333 56.661333 0 0 0-11.946667 27.306667 767.317333 767.317333 0 0 1-41.984 120.832 821.248 821.248 0 0 1-68.266667 122.88 55.296 55.296 0 0 0-11.264 25.941333 18.773333 18.773333 0 0 0 9.898667 17.066667 20.48 20.48 0 0 0 20.138667 3.072 61.44 61.44 0 0 0 21.162666-22.528L273.066667 477.866667c5.461333-8.533333 10.922667-17.408 16.042666-26.624v307.2c-0.341333 18.432 7.168 26.624 22.186667 26.624z m414.72-364.885334a20.48 20.48 0 0 0 17.066667-6.144 24.576 24.576 0 0 0 4.778666-16.384 30.037333 30.037333 0 0 0-4.437333-17.408 19.797333 19.797333 0 0 0-17.408-6.826666h-311.296a18.090667 18.090667 0 0 0-16.725333 6.826666 34.133333 34.133333 0 0 0-4.096 17.408 26.624 26.624 0 0 0 4.437333 16.384 18.432 18.432 0 0 0 16.384 6.144h311.296z m0 90.794667a19.114667 19.114667 0 0 0 16.725333-6.485333 27.306667 27.306667 0 0 0 5.12-17.066667 30.037333 30.037333 0 0 0-4.778666-17.408 19.797333 19.797333 0 0 0-17.066667-6.144h-311.978667a18.773333 18.773333 0 0 0-16.725333 6.144 34.133333 34.133333 0 0 0-4.096 17.408 34.133333 34.133333 0 0 0 4.437333 17.066667 17.749333 17.749333 0 0 0 16.384 6.485333h311.637334z m-24.917333 257.024a46.08 46.08 0 0 0 37.546666-12.288 64.512 64.512 0 0 0 9.216-38.912v-108.885333a61.44 61.44 0 0 0-9.557333-38.912 47.445333 47.445333 0 0 0-37.546667-11.946667h-255.317333a47.445333 47.445333 0 0 0-37.546667 11.946667 61.44 61.44 0 0 0-9.557333 38.912V716.8a64.512 64.512 0 0 0 11.264 38.912 46.08 46.08 0 0 0 37.546667 12.288h255.317333z m0-46.421333h-251.221334c-3.754667 0-5.461333-2.389333-5.461333-6.826667v-105.472c0-3.072 1.706667-4.778667 5.461333-4.778667h249.514667c1.706667 0 2.389333 1.706667 2.389333 4.778667v105.472c0 4.437333 0 6.826667-2.389333 6.826667z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconxinyongbiao.defaultProps = {
  size: 18,
};

export default Iconxinyongbiao;
