/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconIndex = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 253.9L241 471.6v387.6h203.3V611.8h135.4v247.4H783V471.6z"
        fill={getIconColor(color, 0, '#EFEFF4')}
      />
      <Path
        d="M512 253.9L241 471.6v91.9l271-217.7 271 217.7v-91.9zM579.7 786.2H783v73H579.7zM241 786.2h203.3v73H241z"
        fill={getIconColor(color, 1, '#CCCCDB')}
      />
      <Path
        d="M842.7 519.6L512 254 181.3 519.6l-59.7-74.4L512 131.6l390.4 313.6z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
      <Path
        d="M913.8 431L523.4 117.4c-6.7-5.4-16.2-5.4-22.9 0L110.2 431c-7.9 6.3-9.1 17.8-2.8 25.7l59.7 74.4c3 3.8 7.4 6.2 12.3 6.7 4.8 0.5 9.6-0.9 13.4-3.9l30-24.1v349.5c0 10.1 8.2 18.3 18.3 18.3h203.3c10.1 0 18.3-8.2 18.3-18.3V630.1h98.9v229.1c0 10.1 8.2 18.3 18.3 18.3H783c10.1 0 18.3-8.2 18.3-18.3V509.7l30 24.1c3.3 2.6 7.3 4 11.4 4 0.7 0 1.3 0 2-0.1 4.8-0.5 9.2-2.9 12.3-6.7l59.7-74.4c6.2-7.8 5-19.3-2.9-25.6zM764.7 840.9H598V611.8c0-10.1-8.2-18.3-18.3-18.3H444.3c-10.1 0-18.3 8.2-18.3 18.3v229.1H259.3V480.4l252.7-203 252.7 203v360.5z m75.2-347l-44.6-35.8c-0.3-0.3-0.6-0.5-0.9-0.8l-271-217.7c-6.7-5.4-16.2-5.4-22.9 0l-271 217.7c-0.3 0.2-0.6 0.5-0.9 0.8L184 493.9 147.3 448 512 155l364.7 293-36.8 45.9z"
        fill={getIconColor(color, 3, '#3B3C5A')}
      />
    </Svg>
  );
};

IconiconIndex.defaultProps = {
  size: 18,
};

export default IconiconIndex;
