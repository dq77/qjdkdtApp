/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icongongneng2 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#D3B685')}
      />
      <Path
        d="M716.8 184.32a51.2 51.2 0 0 1 51.2 51.2v552.96a51.2 51.2 0 0 1-51.2 51.2H327.68a51.2 51.2 0 0 1-51.2-51.2V235.52a51.2 51.2 0 0 1 51.2-51.2H716.8z m-87.04 450.56H414.72a25.6 25.6 0 0 0-25.6 25.6V691.2a25.6 25.6 0 0 0 25.6 25.6h215.04a25.6 25.6 0 0 0 25.6-25.6v-30.72a25.6 25.6 0 0 0-25.6-25.6z m-102.4-163.84h-112.64a25.6 25.6 0 0 0-25.6 25.6v30.72a25.6 25.6 0 0 0 25.6 25.6h112.64a25.6 25.6 0 0 0 25.6-25.6v-30.72a25.6 25.6 0 0 0-25.6-25.6z m102.4-163.84H414.72a25.6 25.6 0 0 0-25.6 25.6v30.72a25.6 25.6 0 0 0 25.6 25.6h215.04a25.6 25.6 0 0 0 25.6-25.6V332.8a25.6 25.6 0 0 0-25.6-25.6z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
      <Path
        d="M768 330.24v363.52c-87.168-14.6176-153.6-90.432-153.6-181.76 0-91.328 66.432-167.1424 153.6-181.76z"
        fill={getIconColor(color, 2, '#D3B685')}
        opacity=".4"
      />
    </Svg>
  );
};

Icongongneng2.defaultProps = {
  size: 18,
};

export default Icongongneng2;
