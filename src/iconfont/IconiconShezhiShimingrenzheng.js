/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconShezhiShimingrenzheng = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 504m-112 0a112 112 0 1 0 224 0 112 112 0 1 0-224 0Z"
        fill={getIconColor(color, 0, '#FFCD00')}
      />
      <Path
        d="M457.6 430.4c0 33.6 24 59.2 54.4 59.2s54.4-27.2 54.4-59.2-24-59.2-54.4-59.2-54.4 25.6-54.4 59.2z m92.8 0c0 24-17.6 43.2-38.4 43.2s-38.4-19.2-38.4-43.2c0-24 17.6-43.2 38.4-43.2s38.4 19.2 38.4 43.2zM614.4 635.2c4.8 0 8-3.2 8-8v-56c0-38.4-48-67.2-110.4-67.2s-110.4 28.8-110.4 67.2v56c0 4.8 3.2 8 8 8h204.8z m-196.8-64c0-27.2 43.2-51.2 94.4-51.2s94.4 24 94.4 51.2v48h-35.2v-25.6c0-4.8-3.2-8-8-8s-8 3.2-8 8v25.6h-88v-25.6c0-4.8-3.2-8-8-8s-8 3.2-8 8v25.6h-32v-48z"
        fill={getIconColor(color, 1, '#333333')}
      />
      <Path
        d="M512 595.2c4.8 0 8-3.2 8-8V544c0-4.8-3.2-8-8-8s-8 3.2-8 8v43.2c0 4.8 3.2 8 8 8zM798.4 502.4h-54.4c-3.2-96-65.6-179.2-156.8-209.6-4.8-1.6-8 0-9.6 4.8-1.6 4.8 0 8 4.8 9.6 84.8 28.8 142.4 107.2 145.6 195.2h-28.8c-4.8 0-8 3.2-8 8s3.2 8 8 8h99.2c4.8 0 8-3.2 8-8s-3.2-8-8-8zM240 448h1.6c3.2 0 6.4-3.2 8-6.4 25.6-94.4 99.2-168 193.6-193.6 4.8-1.6 6.4-4.8 4.8-9.6-1.6-4.8-4.8-6.4-9.6-6.4-99.2 27.2-177.6 105.6-204.8 204.8-1.6 4.8 1.6 9.6 6.4 11.2zM441.6 774.4c-94.4-25.6-168-99.2-193.6-193.6 0-3.2-4.8-4.8-8-4.8-4.8 1.6-6.4 4.8-6.4 9.6 27.2 99.2 105.6 177.6 204.8 204.8h1.6c3.2 0 6.4-3.2 8-6.4 0-3.2-1.6-8-6.4-9.6zM784 576c-4.8-1.6-8 1.6-9.6 6.4-25.6 94.4-99.2 168-193.6 193.6-3.2 0-4.8 4.8-4.8 8 1.6 3.2 4.8 6.4 8 6.4h1.6c99.2-25.6 177.6-104 204.8-204.8 1.6-3.2-1.6-8-6.4-9.6z"
        fill={getIconColor(color, 2, '#333333')}
      />
      <Path
        d="M582.4 249.6c94.4 25.6 168 99.2 193.6 193.6 1.6 3.2 4.8 6.4 8 6.4h1.6c4.8-1.6 6.4-4.8 4.8-9.6-25.6-99.2-104-177.6-204.8-204.8-4.8-1.6-8 1.6-9.6 6.4 0 1.6 1.6 6.4 6.4 8zM443.2 716.8c-84.8-28.8-144-107.2-145.6-196.8h25.6c4.8 0 8-3.2 8-8s-3.2-8-8-8h-96c-4.8 0-8 3.2-8 8s3.2 8 8 8h54.4c3.2 96 65.6 180.8 156.8 212.8h3.2c3.2 0 6.4-1.6 8-4.8 0-4.8-3.2-9.6-6.4-11.2zM731.2 587.2c1.6-4.8 0-8-4.8-9.6-4.8-1.6-8 0-9.6 4.8-28.8 84.8-107.2 142.4-196.8 145.6v-25.6c0-4.8-3.2-8-8-8s-8 3.2-8 8v96c0 4.8 3.2 8 8 8s8-3.2 8-8v-54.4c96-3.2 180.8-65.6 211.2-156.8zM292.8 436.8c-1.6 4.8 0 8 4.8 9.6h3.2c3.2 0 6.4-1.6 8-4.8 28.8-84.8 107.2-142.4 196.8-145.6v28.8c0 4.8 3.2 8 8 8s8-3.2 8-8v-99.2c0-4.8-3.2-8-8-8s-8 3.2-8 8v54.4c-97.6 3.2-182.4 65.6-212.8 156.8z"
        fill={getIconColor(color, 3, '#333333')}
      />
    </Svg>
  );
};

IconiconShezhiShimingrenzheng.defaultProps = {
  size: 18,
};

export default IconiconShezhiShimingrenzheng;
