/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconshujuDianliang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M489.244444 0v511.499378l0.159289 3.299555a34.133333 34.133333 0 0 0 30.697245 30.674489l3.2768 0.159289h499.484444c-17.544533 266.8544-239.570489 477.866667-510.862222 477.866667-282.760533 0-512-229.216711-512-512C0 236.361956 217.042489 11.901156 489.244444 0z"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M557.511111 1.501867c250.242844 22.050133 448.807822 224.119467 465.351111 475.886933H557.511111V1.479111z"
        fill={getIconColor(color, 1, '#464678')}
      />
    </Svg>
  );
};

IconshujuDianliang.defaultProps = {
  size: 18,
};

export default IconshujuDianliang;
