/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconCrmXiugaixinxi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M321.675895 687.477033h-0.15999a21.822636 21.822636 0 0 1-15.071058-5.823636l-141.079182-131.447785a18.814824 18.814824 0 0 1 0.191988-28.062246L724.498719 5.887632c3.935754-3.775764 9.91938-4.95969 15.263046-5.823636 5.631648 0 11.103306 2.047872 15.03906 5.823636l141.079182 131.447785a18.814824 18.814824 0 0 1-0.15999 28.062246L336.586963 681.653397a21.406662 21.406662 0 0 1-14.911068 5.823636z m-279.022561 120.664458a21.822636 21.822636 0 0 1-15.103056-5.791638 19.03881 19.03881 0 0 1-5.791638-18.334854l40.733454-169.781389a20.606712 20.606712 0 0 1 14.87907-14.71908 22.302606 22.302606 0 0 1 21.054684 4.95969l142.807075 131.799763a18.87882 18.87882 0 0 1 5.43966 19.51878 20.670708 20.670708 0 0 1-15.903006 13.855134l-183.348541 37.981626a21.662646 21.662646 0 0 1-4.7997 0.511968zM959.68402 1024H64.219986C28.7982 1024 0 997.28167 0 964.611712c0-32.861946 28.766202-59.388288 64.187988-59.388288h895.560028c35.421786 0 64.187988 26.686332 64.187988 59.388288C1023.936004 997.28167 995.169802 1024 959.748016 1024z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconCrmXiugaixinxi.defaultProps = {
  size: 18,
};

export default IconCrmXiugaixinxi;