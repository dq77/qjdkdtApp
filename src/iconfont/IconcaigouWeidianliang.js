/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconcaigouWeidianliang = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M422.956522 11.130435H44.521739A33.391304 33.391304 0 0 0 11.130435 44.521739v934.956522A33.391304 33.391304 0 0 0 44.521739 1012.869565h378.434783a33.391304 33.391304 0 0 0 33.391304-33.391304V44.521739A33.391304 33.391304 0 0 0 422.956522 11.130435z m-33.391305 66.782608v868.173914h-311.652174v-868.173914h311.652174zM979.478261 411.826087H556.521739a33.391304 33.391304 0 0 0-33.391304 33.391304v534.26087a33.391304 33.391304 0 0 0 33.391304 33.391304h422.956522a33.391304 33.391304 0 0 0 33.391304-33.391304V445.217391a33.391304 33.391304 0 0 0-33.391304-33.391304z m-33.391304 66.782609v467.478261h-356.173914v-467.478261h356.173914zM979.478261 11.130435H556.521739A33.391304 33.391304 0 0 0 523.130435 44.521739v267.130435a33.391304 33.391304 0 0 0 33.391304 33.391304h422.956522a33.391304 33.391304 0 0 0 33.391304-33.391304V44.521739A33.391304 33.391304 0 0 0 979.478261 11.130435z m-33.391304 66.782608v200.347827h-356.173914v-200.347827h356.173914z"
        fill={getIconColor(color, 0, '#C7C7D6')}
      />
    </Svg>
  );
};

IconcaigouWeidianliang.defaultProps = {
  size: 18,
};

export default IconcaigouWeidianliang;
