/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconcha = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1023.600998 91.107232 933.290773 0.797007 512 422.130673 90.709227 0.797007 0.399002 91.107232 421.732668 512.399002 0.399002 933.731671l90.310224 90.267332L512 602.709227l421.290773 421.290773 90.310224-90.267332L602.267332 512.399002 1023.600998 91.107232z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

Iconcha.defaultProps = {
  size: 18,
};

export default Iconcha;
