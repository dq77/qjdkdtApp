/* eslint-disable */

import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { getIconColor } from './helper';

export const Iconhuodongbiaoshi = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1920 1024" width={size} height={size} {...rest}>
      <Path
        d="M0 0m63.069022 0l1292.914959 0q63.069022 0 63.069023 63.069022l0 630.690224q0 63.069022-63.069023 63.069023l-1292.914959 0q-63.069022 0-63.069022-63.069023l0-630.690224q0-63.069022 63.069022-63.069022Z"
        fill={getIconColor(color, 0, '#FF6666')}
      />
      <Path
        d="M379.297101 624.950943v-31.219166h212.85795v30.083923h40.301106v-227.616101h-127.714771v-87.981287h163.474906V269.05245h-163.474906V174.82733c51.653529-7.379076 97.063225-18.163878 136.79671-32.354408l-19.866742-35.192515c-81.737453 27.813439-185.044512 42.003969-308.785934 42.003969l12.487667 36.895378c48.815423 0 94.792741-2.270485 137.931952-6.243833v89.116529H300.965375v39.165862h162.339664v87.981287H338.995995v228.751344h40.301106zM266.908103 214.560814l27.813439-27.813439c-26.110575-24.975333-58.464984-49.950666-96.495605-74.925998l-27.813438 26.678196c40.868727 27.245818 73.223135 52.221151 96.495604 76.061241z m-12.487667 145.311028l28.38106-28.38106c-26.110575-28.38106-59.032605-56.194499-97.630846-84.007938l-28.38106 27.813439c41.436348 29.516302 73.790756 57.897363 97.630846 84.575559z m-47.112559 257.700025a2139.805792 2139.805792 0 0 0 81.737453-204.911253l-36.895378-14.190531a1689.902921 1689.902921 0 0 1-85.710802 201.505527l40.868727 17.596257z m384.847174-62.438332h-212.85795v-120.335695h212.85795v120.335695z m387.11766 70.385029c77.196483-75.49362 116.929968-195.261693 118.632831-358.736599v-6.811455h84.007938c-1.135242 152.690103-3.405727 244.077117-6.811455 274.161041-4.54097 32.354408-21.001984 48.815423-48.815423 48.815423-15.325772 0-33.489651-1.135242-53.924014-2.270485l9.081939 36.327757c23.84009 1.135242 40.301105 1.702864 49.950666 1.702864 48.815423 0 76.628862-23.272469 82.305074-69.249787 5.108591-42.003969 7.946697-151.554861 7.946697-329.220297h-123.741422V105.577543H1057.036815v114.659483h-76.628862v39.733484h76.628862v6.811455c-1.135242 152.690103-37.462999 263.376238-108.415649 332.058403l30.651545 26.678196z m-28.948682-442.744537V143.608164H744.845154v39.165863h205.478875z m-216.263677 385.414796c70.385029-12.487666 136.229088-29.516302 196.396935-51.085908 5.676212 13.055288 11.352424 26.678196 17.028636 41.436347l35.192515-18.163878a1534.059366 1534.059366 0 0 0-76.628862-158.933937l-34.624894 17.028636c14.758151 26.110575 28.948681 53.924014 43.706833 84.57556a895.138635 895.138635 0 0 1-133.958604 38.598241c17.028636-37.462999 36.895378-98.766089 59.600227-185.044511h131.120497v-39.733485h-249.185707v39.733485h78.899347c-28.38106 103.307059-51.085908 166.313012-68.114545 189.585481a51.779667 51.779667 0 0 1-9.081939 3.405727l9.649561 38.598242z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </Svg>
  );
};

Iconhuodongbiaoshi.defaultProps = {
  size: 18,
};

export default Iconhuodongbiaoshi;