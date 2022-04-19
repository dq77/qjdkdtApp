/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconhuokegongjuShanchutupian = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#F55849')}
      />
      <Path
        d="M731.694545 297.239273a34.909091 34.909091 0 0 1 0 49.384727l-165.399272 165.352727 165.399272 165.399273a34.909091 34.909091 0 0 1 0 49.384727l-4.933818 4.933818a34.909091 34.909091 0 0 1-49.384727 0L512 566.295273l-165.352727 165.399272a34.909091 34.909091 0 0 1-49.384728 0l-4.933818-4.933818a34.909091 34.909091 0 0 1 0-49.384727L457.681455 512l-165.376-165.352727a34.909091 34.909091 0 0 1 0-49.384728l4.933818-4.933818a34.909091 34.909091 0 0 1 49.384727 0l165.352727 165.376 165.399273-165.376a34.909091 34.909091 0 0 1 49.384727 0l4.933818 4.933818z"
        fill={getIconColor(color, 1, '#ffffff')}
      />
    </Svg>
  );
};

IconhuokegongjuShanchutupian.defaultProps = {
  size: 18,
};

export default IconhuokegongjuShanchutupian;
