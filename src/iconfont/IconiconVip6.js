/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const IconiconVip6 = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M674.816 769.536l83.968-260.096H645.12l-83.968 260.096h113.664z"
        fill={getIconColor(color, 0, '#CCCCCC')}
      />
      <Path
        d="M856.576 64h-688.64C110.592 64 64 110.592 64 167.936v688.64c0 57.344 46.592 103.936 103.936 103.936h688.64c57.344 0 103.936-46.592 103.936-103.936v-688.64C960 110.592 913.408 64 856.576 64zM154.112 277.504v-60.928h180.736v221.696l216.576-221.696h144.384L214.528 732.16V277.504h-60.416zM729.6 848.896H455.168l135.168-419.328h274.432L729.6 848.896z"
        fill={getIconColor(color, 1, '#CCCCCC')}
      />
    </Svg>
  );
};

IconiconVip6.defaultProps = {
  size: 18,
};

export default IconiconVip6;
