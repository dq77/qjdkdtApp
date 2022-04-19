/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcontabbarPayNormal = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 938.666667c-229.451852 0-417.185185-187.733333-417.185185-417.185186s187.733333-417.185185 417.185185-417.185185 417.185185 187.733333 417.185185 417.185185-187.733333 417.185185-417.185185 417.185186m0-891.25926c-261.688889 0-474.074074 212.385185-474.074074 474.074074s212.385185 474.074074 474.074074 474.074075 474.074074-212.385185 474.074074-474.074075-212.385185-474.074074-474.074074-474.074074"
        fill={getIconColor(color, 0, '#464678')}
      />
      <Path
        d="M682.666667 512c15.17037 0 28.444444-13.274074 28.444444-28.444444S697.837037 455.111111 682.666667 455.111111h-142.222223v-22.755555l153.6-117.570371c13.274074-9.481481 15.17037-26.548148 5.688889-39.822222-9.481481-13.274074-26.548148-15.17037-39.822222-5.688889L512 381.155556l-147.911111-111.881482c-13.274074-9.481481-30.340741-7.585185-39.822222 5.688889s-7.585185 30.340741 5.688889 39.822222l153.6 117.570371V455.111111H341.333333c-15.17037 0-28.444444 13.274074-28.444444 28.444445S326.162963 512 341.333333 512h142.222223v72.059259H341.333333c-15.17037 0-28.444444 13.274074-28.444444 28.444445s13.274074 28.444444 28.444444 28.444444h142.222223v108.088889c0 15.17037 13.274074 28.444444 28.444444 28.444444s28.444444-13.274074 28.444444-28.444444v-108.088889H682.666667c15.17037 0 28.444444-13.274074 28.444444-28.444444s-13.274074-28.444444-28.444444-28.444445h-142.222223V512H682.666667z"
        fill={getIconColor(color, 1, '#464678')}
      />
    </Svg>
  );
};

IcontabbarPayNormal.defaultProps = {
  size: 18,
};

export default IcontabbarPayNormal;
