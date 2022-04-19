/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Icondangqianwuxiangmu = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1153 1024" width={size} height={size} {...rest}>
      <Path
        d="M885.014369 355.78532c0.835107 0 1.65033 0 2.50532 0.059651 6.382602 0.407612 39.568155 3.211184 65.257631 17.895146 24.51635 14.017864 44.270602 38.544155 47.958991 43.29631 0.755573 0.974291 1.471379 1.98835 2.127534 3.032233l120.871767 191.358757c0.526913 0.845049 1.033942 1.719922 1.511145 2.624622 2.316427 4.443961 14.266408 27.926369 20.320932 50.752621 5.97499 22.597592 7.416544 47.571262 7.635262 52.333359l0.029826 1.630447v202.58299c0.129243 10.707262-1.849165 47.451961-32.37033 74.771884-28.90066 25.848544-67.81266 27.846835-79.046835 27.846835L107.967379 1024l-1.352078-0.029825c-7.774447-0.248544-48.177709-2.833398-75.099961-28.04567C3.907107 970.066019 0.616388 932.873942 0.22866 925.676117a35.571573 35.571573 0 0 1-0.049709-2.028117V721.104777a152.078913 152.078913 0 0 1-0.178951-7.257476v-1.441553c0.049709-12.765204 1.401786-35.024777 8.689087-59.123573 9.056932-30.024078 20.241398-49.708738 23.462525-55.027573L133.91534 418.348738a42.15301 42.15301 0 0 1 1.630446-2.61468c3.181359-4.712388 20.231456-28.930485 43.624389-43.445437 24.357282-15.171107 53.804738-16.483417 62.69266-16.503301h643.161476z m190.841786 362.446292l-318.195572 0.188893-1.690098 6.660971c-20.977087 82.516505-95.579961 140.158757-181.486602 140.158757-86.055767 0-160.837592-57.652194-181.814679-140.158757l-1.690097-6.660971-313.582602-0.188893c0.029825 0.526913 0.039767 1.043883 0.049709 1.560854v202.513398l0.05965 0.556738c0.477204 3.648621 2.714097 12.466951 6.54167 16.44365l0.516971 0.556738 0.596505 0.437437c5.378485 3.956816 18.690485 6.223534 23.333281 6.511845l933.400855 0.009942c7.73468-0.099417 21.27534-2.67433 27.409398-8.152233 5.487845-4.921165 6.720621-13.351767 6.720621-14.703845l-0.05965-2.336311V719.981359a155.956194 155.956194 0 0 0-0.10936-1.749747zM883.125437 432.963107H242.260505c-6.004816 0.049709-17.139573 1.630447-22.289398 4.851573-7.257476 4.513553-15.837204 14.833087-19.366524 19.644893l-0.308195 0.417553-101.147339 178.752622-1.093593 1.839223 0.019884-0.039767a102.747961 102.747961 0 0 0-1.431612 2.624621l329.04202 0.218719a38.673398 38.673398 0 0 1 38.613747 38.603806c0 60.664544 48.396427 108.166214 110.204272 108.166213 61.569243 0 109.816544-47.50167 109.816544-108.166213a38.713165 38.713165 0 0 1 38.633631-38.603806l328.107495-0.218719-112.41134-177.987107-0.367845-0.437436c-4.503612-5.418252-15.280466-16.970563-23.880077-21.90167-7.466252-4.26501-22.647301-6.99899-30.471457-7.724738l-0.805281-0.039767zM573.012505 0a38.673398 38.673398 0 0 1 38.643573 38.593864v221.999223a38.653515 38.653515 0 0 1-38.633631 38.593864 38.653515 38.653515 0 0 1-38.633631-38.593864V38.593864A38.643573 38.643573 0 0 1 573.012505 0z m347.334835 111.715417c8.927689 0 17.328466 2.982524 24.277747 8.619496a38.295612 38.295612 0 0 1 14.117282 25.967844 38.245903 38.245903 0 0 1-8.410719 28.314097l-88.302601 108.802486a38.365204 38.365204 0 0 1-29.964428 14.286291l-0.05965 0.019884a38.663456 38.663456 0 0 1-38.623689-38.593865c0-8.858097 3.042175-17.437825 8.619495-24.327456l88.302602-108.802485a38.573981 38.573981 0 0 1 30.053903-14.286292z m-688.784156-2.922873c11.83068 0 22.866019 5.298951 30.222913 14.534835l86.821282 108.792543a38.593864 38.593864 0 0 1-6.104233 54.222292 38.772816 38.772816 0 0 1-24.078913 8.430602h-0.05965a38.444738 38.444738 0 0 1-30.193088-14.534835l-86.791456-108.802486a38.603806 38.603806 0 0 1 6.124116-54.232233c6.820039-5.477903 15.310291-8.450485 24.059029-8.410718z"
        fill={getIconColor(color, 0, '#C7C7D6')}
      />
    </Svg>
  );
};

Icondangqianwuxiangmu.defaultProps = {
  size: 18,
};

export default Icondangqianwuxiangmu;