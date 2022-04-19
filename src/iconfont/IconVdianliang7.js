/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconVdianliang7 = ({ size, color, ...rest }) => {
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
        d="M698.368 571.050667a37.205333 37.205333 0 0 1 38.229333 40.96 58.368 58.368 0 0 1-58.026666 63.488 37.205333 37.205333 0 0 1-38.229334-40.618667 59.050667 59.050667 0 0 1 58.026667-63.829333m30.378667-152.917334a31.744 31.744 0 0 1 34.133333 34.133334A55.637333 55.637333 0 0 1 710.314667 512a31.744 31.744 0 0 1-34.133334-34.133333 55.637333 55.637333 0 0 1 51.882667-59.050667m98.986667 34.133333a91.136 91.136 0 0 0-95.914667-94.549333 117.077333 117.077333 0 0 0-119.466667 119.466667 83.968 83.968 0 0 0 21.845334 58.709333 113.322667 113.322667 0 0 0-58.709334 102.4 92.501333 92.501333 0 0 0 100.693334 96.938667 119.466667 119.466667 0 0 0 126.976-122.88 87.381333 87.381333 0 0 0-25.941334-68.266667 110.250667 110.250667 0 0 0 51.2-93.184M548.522667 358.058667a8.533333 8.533333 0 0 0-7.509334 4.437333l-74.069333 128.341333-53.930667 93.184a8.192 8.192 0 0 1-14.677333 0l-83.968-144.725333a8.874667 8.874667 0 0 1 7.509333-12.970667h98.304a8.874667 8.874667 0 0 0 7.509334-4.096l29.696-51.2a8.874667 8.874667 0 0 0-7.509334-12.970666H204.8a8.533333 8.533333 0 0 0-7.509333 12.970666l202.069333 349.525334a8.192 8.192 0 0 0 14.677333 0L614.4 371.029333a8.874667 8.874667 0 0 0-7.509333-12.970666z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
    </Svg>
  );
};

IconVdianliang7.defaultProps = {
  size: 18,
};

export default IconVdianliang7;
