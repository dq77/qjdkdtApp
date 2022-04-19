/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconVdianliang6 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 512A512 512 0 1 1 512 0a512 512 0 0 1 512 512"
        fill={getIconColor(color, 0, '#DEB83E')}
      />
      <Path
        d="M952.32 565.930667A443.733333 443.733333 0 1 1 565.930667 71.68 443.733333 443.733333 0 0 1 952.32 565.930667"
        fill={getIconColor(color, 1, '#F0CF23')}
      />
      <Path
        d="M619.52 364.885333l-18.773333 96.597334a8.192 8.192 0 0 0 8.192 10.24h46.421333a8.533333 8.533333 0 0 0 8.192-6.826667l7.850667-39.936a8.533333 8.533333 0 0 1 8.533333-6.826667h61.44a8.192 8.192 0 0 1 7.168 12.629334L590.506667 716.8a8.533333 8.533333 0 0 0 7.509333 12.629333h53.248a8.533333 8.533333 0 0 0 7.509333-4.437333l170.666667-310.272a6.485333 6.485333 0 0 0 0-2.389333l9.216-44.032a8.874667 8.874667 0 0 0-8.533333-10.24h-204.8a8.874667 8.874667 0 0 0-8.533334 6.826666M531.456 358.058667a8.533333 8.533333 0 0 0-7.509333 4.437333l-74.069334 128.341333-53.930666 93.184a8.192 8.192 0 0 1-14.677334 0l-83.968-144.725333a8.874667 8.874667 0 0 1 7.509334-12.970667h98.304a8.874667 8.874667 0 0 0 7.509333-4.096l29.696-51.2a8.874667 8.874667 0 0 0-7.509333-12.970666H186.709333a8.533333 8.533333 0 0 0-7.509333 12.970666l202.069333 349.525334a8.192 8.192 0 0 0 14.677334 0l202.069333-349.525334a8.874667 8.874667 0 0 0-7.509333-12.970666z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconVdianliang6.defaultProps = {
  size: 18,
};

export default IconVdianliang6;
