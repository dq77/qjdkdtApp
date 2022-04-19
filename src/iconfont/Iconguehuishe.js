/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconguehuishe = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0h1024v1024H0z"
        fill={getIconColor(color, 0, '#F0EFF6')}
      />
      <Path
        d="M614.4 801.792h-204.8a17.066667 17.066667 0 0 1-17.066667-17.066667V512H260.437333a17.066667 17.066667 0 0 1-15.701333-10.581333 16.725333 16.725333 0 0 1 3.413333-18.432l251.562667-256a18.090667 18.090667 0 0 1 24.576 0l251.562667 256a16.725333 16.725333 0 0 1 3.413333 18.432 17.066667 17.066667 0 0 1-15.701333 10.581333H631.466667v273.066667a17.066667 17.066667 0 0 1-17.066667 16.725333z m-187.733333-34.133333h170.666666v-273.066667A17.066667 17.066667 0 0 1 614.4 477.866667h108.544L512 263.168 301.056 477.866667H409.6a17.066667 17.066667 0 0 1 17.066667 17.066666z"
        fill={getIconColor(color, 1, '#DFDFE7')}
      />
    </Svg>
  );
};

Iconguehuishe.defaultProps = {
  size: 18,
};

export default Iconguehuishe;
