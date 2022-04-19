/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconfanhuicopy = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M651.5703125 132.04882812L305.45703125 478.6015625c-18.54492188 18.54492188-18.54492188 48.42773438 0 66.53320313l346.20117188 346.64062499c18.54492188 18.54492188 48.42773438 18.54492188 66.97265624 1e-8s18.54492188-48.42773438 0-66.97265625l-312.89062499-312.89062501 312.89062499-312.89062499c18.54492188-18.54492188 18.54492188-48.42773438 1e-8-66.97265626C709.05078125 122.99609375 697.44921875 118.25 685.23242188 118.25c-12.04101563-0.08789063-24.16992188 4.74609375-33.66210938 13.79882813z"
        fill={getIconColor(color, 0, '#ffffff')}
      />
    </Svg>
  );
};

Iconfanhuicopy.defaultProps = {
  size: 18,
};

export default Iconfanhuicopy;
