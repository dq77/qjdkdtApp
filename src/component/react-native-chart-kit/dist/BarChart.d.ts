/// <reference types="react" />
import { ViewStyle } from "react-native";
import AbstractChart, { AbstractChartConfig, AbstractChartProps } from "./AbstractChart";
import { ChartData } from "./HelperTypes";
export interface BarChartProps extends AbstractChartProps {
    data: ChartData;
    width: number;
    height: number;
    fromZero?: boolean;
    withInnerLines?: boolean;
    yAxisLabel: string;
    yAxisSuffix: string;
    chartConfig: AbstractChartConfig;
    style?: Partial<ViewStyle>;
    horizontalLabelRotation?: number;
    verticalLabelRotation?: number;
    /**
     * Show vertical labels - default: True.
     */
    withVerticalLabels?: boolean;
    /**
     * Show horizontal labels - default: True.
     */
    withHorizontalLabels?: boolean;
    /**
     * The number of horizontal lines
     */
    segments?: number;
    showBarTops?: boolean;
    showValuesOnTopOfBars?: boolean;
    withCustomBarColorFromData?: boolean;
    flatColor?: boolean;
    /**
     * This function takes a [whole bunch](https://github.com/indiespirit/react-native-chart-kit/blob/master/src/line-chart.js#L266)
     * of stuff and can render extra elements,
     * such as data point info or additional markup.
     */
    decorator?: Function;
    /**
     * Renders additional content for dots in a line chart.
     * Takes `({x, y, index})` as arguments.
     */
    renderDotContent?: (params: {
        x: number;
        y: number;
        index: number;
        indexData: number;
    }) => React.ReactNode;
}
declare type BarChartState = {};
declare class BarChart extends AbstractChart<BarChartProps, BarChartState> {
    getBarPercentage: () => number;
    renderBars: ({ data, width, height, paddingTop, paddingRight, barRadius, withCustomBarColorFromData }: Pick<Pick<AbstractChartConfig, "color" | "style" | "height" | "width" | "propsForBackgroundLines" | "propsForLabels" | "labelColor" | "propsForVerticalLabels" | "propsForHorizontalLabels" | "count" | "paddingTop" | "paddingRight" | "horizontalLabelRotation" | "formatYLabel" | "labels" | "horizontalOffset" | "stackedBar" | "verticalLabelRotation" | "formatXLabel" | "backgroundColor" | "backgroundGradientFrom" | "backgroundGradientFromOpacity" | "backgroundGradientTo" | "backgroundGradientToOpacity" | "fillShadowGradient" | "fillShadowGradientOpacity" | "useShadowColorFromDataset" | "strokeWidth" | "barPercentage" | "barRadius" | "propsForDots" | "decimalPlaces" | "linejoinType" | "scrollableDotFill" | "scrollableDotStrokeColor" | "scrollableDotStrokeWidth" | "scrollableDotRadius" | "scrollableInfoViewStyle" | "scrollableInfoTextStyle" | "scrollableInfoTextDecorator" | "scrollableInfoOffset" | "scrollableInfoSize">, "height" | "width" | "paddingTop" | "paddingRight" | "barRadius"> & {
        data: number[];
        withCustomBarColorFromData: boolean;
    }) => JSX.Element[];
    renderBarTops: ({ data, width, height, paddingTop, paddingRight }: Pick<Pick<AbstractChartConfig, "color" | "style" | "height" | "width" | "propsForBackgroundLines" | "propsForLabels" | "labelColor" | "propsForVerticalLabels" | "propsForHorizontalLabels" | "count" | "paddingTop" | "paddingRight" | "horizontalLabelRotation" | "formatYLabel" | "labels" | "horizontalOffset" | "stackedBar" | "verticalLabelRotation" | "formatXLabel" | "backgroundColor" | "backgroundGradientFrom" | "backgroundGradientFromOpacity" | "backgroundGradientTo" | "backgroundGradientToOpacity" | "fillShadowGradient" | "fillShadowGradientOpacity" | "useShadowColorFromDataset" | "strokeWidth" | "barPercentage" | "barRadius" | "propsForDots" | "decimalPlaces" | "linejoinType" | "scrollableDotFill" | "scrollableDotStrokeColor" | "scrollableDotStrokeWidth" | "scrollableDotRadius" | "scrollableInfoViewStyle" | "scrollableInfoTextStyle" | "scrollableInfoTextDecorator" | "scrollableInfoOffset" | "scrollableInfoSize">, "height" | "width" | "paddingTop" | "paddingRight"> & {
        data: number[];
    }) => JSX.Element[];
    renderColors: ({ data, flatColor }: Pick<AbstractChartConfig, "data"> & {
        flatColor: boolean;
    }) => JSX.Element[];
    renderValuesOnTopOfBars: ({ data, width, height, paddingTop, paddingRight }: Pick<Pick<AbstractChartConfig, "color" | "style" | "height" | "width" | "propsForBackgroundLines" | "propsForLabels" | "labelColor" | "propsForVerticalLabels" | "propsForHorizontalLabels" | "count" | "paddingTop" | "paddingRight" | "horizontalLabelRotation" | "formatYLabel" | "labels" | "horizontalOffset" | "stackedBar" | "verticalLabelRotation" | "formatXLabel" | "backgroundColor" | "backgroundGradientFrom" | "backgroundGradientFromOpacity" | "backgroundGradientTo" | "backgroundGradientToOpacity" | "fillShadowGradient" | "fillShadowGradientOpacity" | "useShadowColorFromDataset" | "strokeWidth" | "barPercentage" | "barRadius" | "propsForDots" | "decimalPlaces" | "linejoinType" | "scrollableDotFill" | "scrollableDotStrokeColor" | "scrollableDotStrokeWidth" | "scrollableDotRadius" | "scrollableInfoViewStyle" | "scrollableInfoTextStyle" | "scrollableInfoTextDecorator" | "scrollableInfoOffset" | "scrollableInfoSize">, "height" | "width" | "paddingTop" | "paddingRight"> & {
        data: number[];
    }) => JSX.Element[];
    render(): JSX.Element;
}
export default BarChart;
//# sourceMappingURL=BarChart.d.ts.map