/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconrili = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M128 358.8h768.1v50H128zM320.1 256c-13.8 0-25-11.2-25-25V123.2c0-13.8 11.2-25 25-25s25 11.2 25 25V231c0 13.8-11.2 25-25 25zM703.3 256c-13.8 0-25-11.2-25-25V123.2c0-13.8 11.2-25 25-25s25 11.2 25 25V231c0 13.8-11.2 25-25 25zM359.1 576.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM551.1 576.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM744.1 576.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM359.1 753.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM551.1 753.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM744.1 753.8h-78c-13.8 0-25-11.2-25-25s11.2-25 25-25h78c13.8 0 25 11.2 25 25s-11.2 25-25 25zM384.1 155h257v50h-257z"
        fill={getIconColor(color, 0, '#999999')}
      />
      <Path
        d="M876.8 155H769v50h107.7c0.6 0 1.2 0.7 1.2 1.2V877c0 0.6-0.7 1.2-1.2 1.2H149.2c-0.6 0-1.2-0.7-1.2-1.2V206.2c0-0.6 0.7-1.2 1.2-1.2H256v-50H149.2C121 155 98 178.1 98 206.2V877c0 28.2 23.1 51.2 51.2 51.2h727.5c28.2 0 51.2-23.1 51.2-51.2V206.2c0.1-28.1-23-51.2-51.1-51.2z"
        fill={getIconColor(color, 1, '#999999')}
      />
    </Svg>
  );
};

Iconrili.defaultProps = {
  size: 18,
};

export default Iconrili;
