/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcontabbarPaySelect = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M682.666667 584.059259c15.17037 0 28.444444 13.274074 28.444444 28.444445s-13.274074 28.444444-28.444444 28.444444h-142.222223v108.088889c0 15.17037-13.274074 28.444444-28.444444 28.444444s-28.444444-13.274074-28.444444-28.444444v-108.088889H341.333333c-15.17037 0-28.444444-13.274074-28.444444-28.444444s13.274074-28.444444 28.444444-28.444445h142.222223V512H341.333333c-15.17037 0-28.444444-13.274074-28.444444-28.444444S326.162963 455.111111 341.333333 455.111111h142.222223v-22.755555l-153.6-117.570371c-13.274074-9.481481-15.17037-26.548148-5.688889-39.822222 9.481481-13.274074 26.548148-15.17037 39.822222-5.688889l147.911111 111.881482 147.911111-111.881482c13.274074-9.481481 30.340741-7.585185 39.822222 5.688889s7.585185 30.340741-5.688889 39.822222l-153.6 117.570371V455.111111H682.666667c15.17037 0 28.444444 13.274074 28.444444 28.444445S697.837037 512 682.666667 512h-142.222223v72.059259H682.666667zM512 47.407407c-261.688889 0-474.074074 212.385185-474.074074 474.074074s212.385185 474.074074 474.074074 474.074075 474.074074-212.385185 474.074074-474.074075-212.385185-474.074074-474.074074-474.074074z"
        fill={getIconColor(color, 0, '#464678')}
      />
    </Svg>
  );
};

IcontabbarPaySelect.defaultProps = {
  size: 18,
};

export default IcontabbarPaySelect;
