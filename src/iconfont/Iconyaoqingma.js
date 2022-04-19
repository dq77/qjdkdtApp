/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconyaoqingma = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M771.1 811.6H252.9c-30.8 0-55.9-25.1-55.9-55.9V437.5c0-30.8 25.1-55.9 55.9-55.9h82.2v30h-82.2c-14.3 0-25.9 11.6-25.9 25.9v318.2c0 14.3 11.6 25.9 25.9 25.9h518.2c14.3 0 25.9-11.6 25.9-25.9V437.5c0-14.3-11.6-25.9-25.9-25.9h-75.9v-30h75.9c30.8 0 55.9 25.1 55.9 55.9v318.2c0 30.8-25.1 55.9-55.9 55.9z"
        fill={getIconColor(color, 0, '#888888')}
      />
      <Path
        d="M512.2 630.2l-306.5-143 12.6-27.2 293.8 137 293.6-137 12.6 27.1z"
        fill={getIconColor(color, 1, '#888888')}
      />
      <Path
        d="M696.7 530.3h-30V242.4H356.3v287.9h-30V212.4h370.4z"
        fill={getIconColor(color, 2, '#888888')}
      />
      <Path
        d="M496.6 311.1h30v176.5h-30z"
        fill={getIconColor(color, 3, '#888888')}
      />
      <Path
        d="M439.486 347.171l21.213-21.213 124.803 124.803-21.213 21.213z"
        fill={getIconColor(color, 4, '#888888')}
      />
      <Path
        d="M424.6 383h176.5v30H424.6z"
        fill={getIconColor(color, 5, '#888888')}
      />
      <Path
        d="M439.54 448.868l124.803-124.803 21.213 21.213L460.753 470.08z"
        fill={getIconColor(color, 6, '#888888')}
      />
    </Svg>
  );
};

Iconyaoqingma.defaultProps = {
  size: 18,
};

export default Iconyaoqingma;
