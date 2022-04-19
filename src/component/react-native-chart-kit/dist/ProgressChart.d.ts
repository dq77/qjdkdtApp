/// <reference types="react" />
import { ViewStyle } from "react-native";
import AbstractChart, { AbstractChartConfig, AbstractChartProps } from "./AbstractChart";
export declare type ProgressChartData = Array<number> | {
    labels?: Array<string>;
    colors?: Array<string>;
    data: Array<number>;
};
export interface ProgressChartProps extends AbstractChartProps {
    data: ProgressChartData;
    width: number;
    height: number;
    center?: Array<number>;
    absolute?: boolean;
    hasLegend?: boolean;
    style?: Partial<ViewStyle>;
    chartConfig?: AbstractChartConfig;
    hideLegend?: boolean;
    hideCircle?: boolean;
    strokeWidth?: number;
    selectStrokeWidth?: number;
    radius?: number;
    withCustomBarColorFromData?: boolean;
    isShowText?: boolean;
    hidePointer?: boolean;
    textTopFont?: number;
    textBottomFont?: number;
    isShowOneText?: boolean;//只显示一个文字
    isRotate?: boolean;//是否开启旋转角度，在圆不满的时候可以使用
}
declare type ProgressChartState = {};
declare class ProgressChart extends AbstractChart<ProgressChartProps, ProgressChartState> {
    static defaultProps: {
        style: {};
        strokeWidth: number;
        radius: number;
    };
    render(): JSX.Element;
}
export default ProgressChart;
//# sourceMappingURL=ProgressChart.d.ts.map