/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconMemberOn1 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M856.4 63.9H167.8C110.5 63.9 64 110.5 64 167.8v688.4c0 57.4 46.5 103.9 103.8 103.9h688.4c57.3 0 103.8-46.5 103.8-103.8V167.8c0.1-57.3-46.4-103.9-103.6-103.9zM843 597.6H455.4c-27.5 36.6-54.9 71.4-81.4 103.7-27.2 33.3-55.8 66.5-84.7 98.7-1.9 2.1-4.6 5.4-4.6 5.4 2.9 0 6.2-0.1 9.9-0.3L722.1 783c-11-19.3-22.7-38.5-34.8-57.4-15.5-24.1-32.3-48.5-49.9-72.3-4.3-4-7.5-9.7-8.4-15.6-0.9-6 0-11.6 2.8-16.7 2.4-4.6 5.9-8.3 10.4-10.9 3.5-2.1 6.8-3.6 10.1-4.4 0.8 0 1.6-0.1 2.4-0.1 6.2 0 10.2 1.3 14.1 3.6 2.8 1.4 6.8 5 17.4 18.6 7 9.1 20 28.2 41 60.2 10.1 15.4 19.7 30.4 28.7 45 9.2 14.7 17.4 29.1 24.9 43 15.4 27.5 26.3 47.9 32.7 61 9.3 19.2 10.6 25.7 10.6 29.9 0 5-1.8 10-5.5 15.5-3.4 5-7.6 8.7-12.5 11.2-3 1.5-6.2 2.3-9.6 2.3-3.6 0-7.2-0.9-10.7-2.6-6.3-3.2-11.4-9.5-16.3-20l-18-36.7L299 862.3c-6.5 0.4-12.7 0.6-18.5 0.6-56.1 0-67.9-21.5-67.9-39.6 0-16.5 9.9-34.4 30.2-54.7 53.1-55.5 101.5-113 143.8-171.2h-204c-17.9 0-28.6-10.4-28.6-27.9 0-17.9 10.7-28.6 28.6-28.6H843c18.4 0 29.4 10.7 29.4 28.6 0 17.4-11.2 28.1-29.4 28.1zM261 394.5c0-17.7 11-28.6 28.7-28.6h451.9c18.4 0 29.4 10.7 29.4 28.6 0 17.4-11 27.9-29.4 27.9h-452c-17.7 0-28.6-10.7-28.6-27.9z m629.8 6c-5.3 7.1-12.5 10.8-20.9 10.8-10.7 0-35-7.3-128.7-64.3C672.4 305.2 606 257.4 544 204.9c-21.4-17.7-32-20.4-36.4-20.4-4.3 0-14.6 2.8-35.3 21.7-29.1 26.9-60 52.9-91.9 77.1-31.9 24.2-65.9 47.2-100.9 68.5-94.4 57.6-119.2 65-130.2 65-8.4 0-15.2-3.9-19-11-2.8-5.2-4.1-10.5-4.1-16 0-12.6 8.3-22.9 24.6-30.7 23.1-10.5 47.1-23 71.4-37.2 24.5-14.3 50.4-30.9 77-49.1 54.7-37.5 99.8-73.4 134.1-106.6 25.8-25.2 50.8-38 74.4-38 23.7 0 48.4 11.8 75.7 36.1 36.9 33.3 85 69.2 142.9 106.8 29.9 19.4 57.2 36.1 81.1 49.6 23.7 13.4 45.6 24.8 64.9 33.7 6.3 2.9 25.6 11.7 25.6 28.4-0.1 5.5-2.4 11.4-7.1 17.7z"
        fill={getIconColor(color, 0, '#CF8AA2')}
      />
    </Svg>
  );
};

IconiconMemberOn1.defaultProps = {
  size: 18,
};

export default IconiconMemberOn1;
