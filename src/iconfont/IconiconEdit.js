/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconEdit = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m223.4 219.6c12.8 12.8 12.8 33.4 0 46.2L497.8 567.4c-6.4 6.4-14.7 9.6-23.1 9.6s-16.7-3.2-23.1-9.6a32.592 32.592 0 0 1 0-46.2l237.6-237.6c12.7-12.8 33.4-12.8 46.2 0zM750 642.7c0 59.2-48.1 107.3-107.3 107.3H381.3C322.1 750 274 701.9 274 642.7V381.3c0-59.2 48.1-107.3 107.3-107.3H512c18 0 32.7 14.6 32.7 32.7S530 339.3 512 339.3H381.3c-23.2 0-42 18.8-42 42v261.3c0 23.2 18.8 42 42 42h261.3c23.2 0 42-18.8 42-42V512c0-18 14.6-32.7 32.7-32.7S750 494 750 512v130.7z"
        fill={getIconColor(color, 0, '#FBB03B')}
      />
    </Svg>
  );
};

IconiconEdit.defaultProps = {
  size: 18,
};

export default IconiconEdit;
