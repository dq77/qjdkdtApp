/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconpdf = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M364.544 630.101333c-1.365333-24.576-17.066667-37.546667-47.104-38.229333h-48.469333v78.506667h48.469333c30.72-0.682667 46.421333-14.336 47.104-40.277334z"
        fill={getIconColor(color, 0, '#EFEFF4')}
      />
      <Path
        d="M905.898667 446.464V287.402667L661.504 0h-512c-19.797333 0-31.402667 14.336-31.402667 31.402667v417.792H52.565333v446.464h65.536v96.938666c0 8.192 2.730667 17.066667 8.192 22.528s14.336 8.192 22.528 8.192H873.813333c8.874667 0 17.066667-2.730667 22.528-11.605333 5.461333-5.461333 8.192-14.336 8.192-22.528v-96.938667h65.536V446.464h-64.170666z m-65.536 514.730667H180.906667v-65.536h660.138666v65.536z m-604.16-187.733334V566.613333h87.381333c46.421333 2.048 70.997333 22.528 73.728 62.805334-0.682667 43.690667-25.941333 65.536-76.458667 66.218666h-52.565333v77.824h-32.085333z m195.925333 0V566.613333h68.266667c68.949333 1.365333 104.448 35.498667 105.813333 103.082667 1.365333 70.314667-33.450667 105.130667-105.130667 103.765333H432.128z m341.333333-116.053333v25.258667H675.84v90.794666h-32.085333V566.613333h144.042666v25.941334H675.84v64.170666h97.621333z m66.901334-208.213333H180.906667V65.536h477.866666v224.597333h182.272v159.061334z"
        fill={getIconColor(color, 1, '#EFEFF4')}
      />
      <Path
        d="M499.712 592.554667h-36.181333v156.330666h36.181333c49.152 0 73.728-26.624 73.728-79.872-2.048-49.152-26.624-75.093333-73.728-76.458666z"
        fill={getIconColor(color, 2, '#EFEFF4')}
      />
    </Svg>
  );
};

Iconpdf.defaultProps = {
  size: 18,
};

export default Iconpdf;