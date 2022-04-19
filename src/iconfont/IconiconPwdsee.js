/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconPwdsee = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M244.4 492.1c-2.9 0-5.8-0.8-8.3-2.6-6.8-4.6-8.6-13.9-4-20.7C271.1 411 359.3 314 512 314s240.9 97 280 154.8c4.6 6.8 2.8 16.1-4 20.7-6.9 4.6-16.1 2.8-20.7-4-35.8-52.9-116.4-141.6-255.3-141.6s-219.5 88.7-255.2 141.6c-2.9 4.3-7.6 6.6-12.4 6.6zM512 710c-152.7 0-240.9-97-280-154.8-4.6-6.8-2.8-16.1 4-20.7 6.9-4.6 16.1-2.8 20.7 4 35.7 52.9 116.3 141.6 255.2 141.6 138.9 0 219.5-88.7 255.2-141.6 4.6-6.8 13.9-8.6 20.7-4 6.8 4.6 8.6 13.9 4 20.7C752.9 613 664.7 710 512 710z"
        fill={getIconColor(color, 0, '#596C94')}
      />
      <Path
        d="M512 512m-103.7 0a103.7 103.7 0 1 0 207.4 0 103.7 103.7 0 1 0-207.4 0Z"
        fill={getIconColor(color, 1, '#596C94')}
        opacity=".6"
      />
      <Path
        d="M512 630.7c-65.4 0-118.6-53.2-118.6-118.7S446.6 393.4 512 393.4 630.7 446.6 630.7 512 577.4 630.7 512 630.7z m0-207.5c-49 0-88.8 39.8-88.8 88.8s39.8 88.8 88.8 88.8 88.8-39.8 88.8-88.8-39.8-88.8-88.8-88.8z"
        fill={getIconColor(color, 2, '#596C94')}
      />
    </Svg>
  );
};

IconiconPwdsee.defaultProps = {
  size: 18,
};

export default IconiconPwdsee;
