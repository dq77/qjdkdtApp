/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconlegalRealName = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
        fill={getIconColor(color, 0, '#F3F5F6')}
      />
      <Path
        d="M289.8 354h444.6v316.1H289.8z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M742.8 678.6H281.2V345.4h461.7v333.2z m-444.5-17.1h427.4v-299H298.3v299z"
        fill={getIconColor(color, 2, '#3B3C5A')}
      />
      <Path
        d="M607.6 439.6m-40.2 0a40.2 40.2 0 1 0 80.4 0 40.2 40.2 0 1 0-80.4 0Z"
        fill={getIconColor(color, 3, '#FFFFFF')}
      />
      <Path
        d="M607.6 488.4c-26.5 0-48.8-21.4-48.8-48.8 0-26.5 21.4-48.8 48.8-48.8 26.5 0 48.8 21.4 48.8 48.8 0 26.6-22.3 48.8-48.8 48.8z m0-79.6c-17.1 0-31.7 13.7-31.7 31.7s13.7 31.7 31.7 31.7 31.7-13.7 31.7-31.7c-0.1-18-14.6-31.7-31.7-31.7z"
        fill={getIconColor(color, 4, '#3B3C5A')}
      />
      <Path
        d="M683 582.7c0-36.8-30-67.6-67.6-67.6H600c-36.8 0-67.6 30-67.6 67.6H683z"
        fill={getIconColor(color, 5, '#FDBF5E')}
      />
      <Path
        d="M691.6 591.3H524.5v-8.6c0-42 34.3-76.2 76.2-76.2h15.4c42 0 76.2 34.3 76.2 76.2v8.6h-0.7z m-150-17.2h131.9c-4.3-28.3-28.3-50.5-58.2-50.5h-15.4c-29.2 0.9-54 22.3-58.3 50.5z"
        fill={getIconColor(color, 6, '#3B3C5A')}
      />
      <Path
        d="M333.5 400.2h149.1v65.1H333.5z"
        fill={getIconColor(color, 7, '#F16051')}
      />
      <Path
        d="M335.2 510.7h146.5v17.1H335.2zM335.2 563h146.5v17.1H335.2zM335.1 616.1h352v17.1h-352z"
        fill={getIconColor(color, 8, '#3B3C5A')}
      />
      <Path
        d="M356.7 424.2h17.1v17.1h-17.1zM399.5 424.2h17.1v17.1h-17.1zM441.4 424.2h17.1v17.1h-17.1z"
        fill={getIconColor(color, 9, '#FFFFFF')}
      />
    </Svg>
  );
};

IconlegalRealName.defaultProps = {
  size: 18,
};

export default IconlegalRealName;
