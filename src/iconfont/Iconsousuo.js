/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconsousuo = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M1024 932.795766l-89.602393 91.204234-244.809775-246.401543c-72.022431 55.99394-161.594601 89.602393-259.186053 89.602393C191.99937 865.599008 0 671.967573 0 433.595388 0 193.601212 191.99937 0 428.799937 0s428.799937 193.601212 428.799937 433.595388c0 94.397843-30.40477 180.806627-81.603258 252.798835z m-595.200063-827.195105c-179.204785 0-324.801118 147.198174-324.801118 327.994727S249.595152 761.630412 428.799937 761.630412 753.570831 614.402015 753.570831 433.595388c0-182.398394-145.576183-327.994727-324.770894-327.994727z"
        fill={getIconColor(color, 0, '#C4C4C4')}
      />
    </Svg>
  );
};

Iconsousuo.defaultProps = {
  size: 18,
};

export default Iconsousuo;
