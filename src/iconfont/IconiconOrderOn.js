/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconOrderOn = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M681.8 156.5H342.2L201.7 345.6v488.7h620.6V345.6z"
        fill={getIconColor(color, 0, '#F16051')}
      />
      <Path
        d="M201.7 761.3h620.6v73H201.7zM434.4 601.1v73l73-59 73 59v-73l-73-59z"
        fill={getIconColor(color, 1, '#D74439')}
      />
      <Path
        d="M547.4 156.5h-79.9l-33.1 189.1v255.5l73-59 73 59V345.6z"
        fill={getIconColor(color, 2, '#FFFFFF')}
      />
      <Path
        d="M836.9 334.7L696.5 145.6c-3.4-4.6-8.9-7.4-14.7-7.4H342.2c-5.8 0-11.2 2.7-14.7 7.4L187.1 334.7c-2.3 3.1-3.6 7-3.6 10.9v488.7c0 10.1 8.2 18.3 18.3 18.3h620.6c10.1 0 18.3-8.2 18.3-18.3V345.6c-0.2-3.9-1.4-7.8-3.8-10.9z m-46.8-1.9H591.2l-27.6-158h109.1l117.4 158z m-342.9 25.6h120.5v216l-52.2-42.2c-2.3-1.9-5.2-2.8-8-2.8s-5.7 0.9-8 2.8l-52.2 42.2v-216z m90.4-183.6l27.6 158H449.6l27.6-158h60.4z m-186.3 0h100l-27.6 158H233.9l117.4-158zM220 816V358.4h201.7v242.7c0 4.9 2.8 9.4 7.3 11.5 4.4 2.1 9.7 1.5 13.5-1.6l65-52.5 65 52.5c2.3 1.9 5.2 2.8 8 2.8 1.9 0 3.8-0.4 5.5-1.2 4.4-2.1 7.3-6.6 7.3-11.5V358.4H804V816H220z"
        fill={getIconColor(color, 3, '#3B3C5A')}
      />
    </Svg>
  );
};

IconiconOrderOn.defaultProps = {
  size: 18,
};

export default IconiconOrderOn;
