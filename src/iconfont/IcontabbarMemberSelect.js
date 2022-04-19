/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IcontabbarMemberSelect = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M750.933333 430.459259L532.859259 688.355556c-5.688889 5.688889-13.274074 9.481481-20.859259 9.481481s-17.066667-3.792593-20.859259-9.481481L273.066667 430.459259c-9.481481-11.377778-9.481481-30.340741 3.792592-39.822222 11.377778-9.481481 30.340741-9.481481 39.822222 3.792593L512 625.777778l195.318519-233.244445c9.481481-11.377778 28.444444-13.274074 39.822222-3.792592 13.274074 11.377778 15.17037 30.340741 3.792592 41.718518m231.348148-58.785185l-174.459259-246.518518c-11.377778-17.066667-37.925926-30.340741-58.785185-30.340741h-474.074074c-20.859259 0-47.407407 13.274074-60.681482 30.340741l-172.562962 246.518518c-11.377778 17.066667-11.377778 43.614815 3.792592 58.785185l441.837037 504.414815c13.274074 15.17037 36.02963 15.17037 49.303704 0l441.837037-504.414815c13.274074-15.17037 15.17037-41.718519 3.792592-58.785185"
        fill={getIconColor(color, 0, '#464678')}
      />
    </Svg>
  );
};

IcontabbarMemberSelect.defaultProps = {
  size: 18,
};

export default IcontabbarMemberSelect;
