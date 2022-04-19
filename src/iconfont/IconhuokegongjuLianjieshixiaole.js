/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconhuokegongjuLianjieshixiaole = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1254 1024" width={size} height={size} {...rest}>
      <Path
        d="M884.1344 620.6592a34.7904 34.7904 0 0 1-17.4336-64.9216L1089.792 426.9312a166.3232 166.3232 0 0 0 77.7344-101.3504 166.4384 166.4384 0 0 0-16.7168-126.72 166.4512 166.4512 0 0 0-101.376-77.824 166.4256 166.4256 0 0 0-63.8464-4.48c-22.144 2.752-43.264 9.856-62.7968 21.12L699.712 266.496a34.7904 34.7904 0 0 1-34.7904-60.2624L887.9872 77.4272a235.6864 235.6864 0 0 1 179.456-23.5904 235.712 235.712 0 0 1 81.472 39.7952 235.2384 235.2384 0 0 1 62.144 70.4512 235.2384 235.2384 0 0 1 29.952 89.0496c3.776 30.3616 1.664 60.7872-6.272 90.4448a235.6224 235.6224 0 0 1-110.1696 143.6288L901.504 615.9872c-5.2736 3.072-11.264 4.672-17.3696 4.672zM248.2688 964.352a236.16 236.16 0 0 1-61.312-8.128 235.712 235.712 0 0 1-81.472-39.7824 235.2512 235.2512 0 0 1-62.144-70.464 235.2128 235.2128 0 0 1-29.952-89.0496 235.7248 235.7248 0 0 1 6.272-90.4448 235.6224 235.6224 0 0 1 110.1696-143.616L352.896 394.0992a34.7904 34.7904 0 1 1 34.7904 60.2496L164.6208 583.1424a166.3872 166.3872 0 0 0-77.7344 101.3504 166.5024 166.5024 0 0 0 16.7168 126.72 166.464 166.464 0 0 0 101.376 77.824 166.3104 166.3104 0 0 0 126.6432-16.64l223.0656-128.7936a34.7904 34.7904 0 0 1 34.7904 60.2624L366.4128 932.6464A234.88 234.88 0 0 1 277.376 962.56c-9.6512 1.2032-19.3792 1.8048-29.1072 1.8048z m187.6096-732.1216c-12.032 0-23.7184-6.2336-30.1568-17.408L343.0912 106.368a34.7904 34.7904 0 1 1 60.2624-34.7904l62.6304 108.4672c9.6 16.64 3.904 37.9264-12.736 47.5264-5.2864 3.072-11.264 4.672-17.3696 4.672z m96.9728-29.44a34.7904 34.7904 0 0 1-33.6256-43.8016l35.6608-133.0816a34.8032 34.8032 0 0 1 67.2 18.0096l-35.648 133.0688a34.816 34.816 0 0 1-33.5872 25.8048z m-180.0448 104.3712c-2.9824 0-6.016-0.384-9.024-1.1904L210.688 270.3232a34.7904 34.7904 0 0 1 18.0096-67.2128l133.0816 35.6608a34.7904 34.7904 0 0 1-8.9856 68.4032z m514.4832 662.656c-12.032 0-23.7184-6.2464-30.1568-17.408l-62.6304-108.48a34.7904 34.7904 0 1 1 60.2624-34.7904l62.6304 108.48c9.6 16.64 3.904 37.9136-12.736 47.5136-5.2736 3.072-11.264 4.672-17.3696 4.672zM658.0992 1023.872a34.7904 34.7904 0 0 1-33.6256-43.8016l35.6608-133.0688a34.8032 34.8032 0 0 1 67.2 18.0096l-35.648 133.0688a34.816 34.816 0 0 1-33.5872 25.792zM1020.8 822.08c-2.9824 0-6.016-0.384-9.024-1.1904l-133.0816-35.6608a34.7904 34.7904 0 0 1 18.0096-67.2l133.0816 35.648a34.7904 34.7904 0 0 1-8.9856 68.4032z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconhuokegongjuLianjieshixiaole.defaultProps = {
  size: 18,
};

export default IconhuokegongjuLianjieshixiaole;
