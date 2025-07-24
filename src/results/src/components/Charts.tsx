import React, { ReactElement } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { openingPopularityData } from "../data/chessData";

// Chart styling constants
export const CHART_COLORS = {
  grid: "hsl(220, 15%, 50%)",
  axis: "hsl(220, 20%, 80%)",
  tooltipBackground: "hsl(225, 20%, 15%)",
  tooltipText: "hsl(0, 0%, 95%)",
  tooltipBorder: "hsl(220, 25%, 65%)",
  lines: [
    "hsl(200, 80%, 80%)", // Light blue
    "hsl(160, 70%, 75%)", // Teal
    "hsl(50, 85%, 80%)",  // Yellow
    "hsl(280, 60%, 80%)", // Purple
    "hsl(20, 80%, 80%)"   // Orange
  ],
  // Primary color variations for bar charts
  primary: "hsl(200, 70%, 30%)",      // Very dark blue
  primaryLight: "hsl(200, 70%, 35%)", // Slightly lighter than primary
  primaryDark: "hsl(200, 70%, 25%)",  // Slightly darker than primary
};

// Chart dimensions and spacing
const CHART_DIMENSIONS = {
  height: 256, // h-64 in pixels
  yAxisWidth: 150,
  fontSize: 14, // Have to set the font size directly. Can't use tailwind. Sad!
  lineStrokeWidth: 2,
  lineDotRadius: 1,
  tooltipBorderRadius: 0,
};

// Chart data ranges
const CHART_RANGES = {
  winRateMin: 50,
  winRateMax: 60,
  popularityMin: 1.25,
  popularityMax: 3,
};

// Default margins
const DEFAULT_MARGINS = {
  default: { top: 10, right: 0, left: -20, bottom: 0 },
  withNegativeLeft: { top: 10, right: 0, left: -30, bottom: 10 },
  lineChart: { top: 10, right: 50, left: 0, bottom: 10 },
};

// Get the opening names from the data itself
const lineDataKeys = Object.keys(openingPopularityData[0]).filter(
  (key) => key !== "year"
);

interface ChartContainerProps {
  children: ReactElement;
  title?: string;
  verticalLabel?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  verticalLabel = false,
}) => {
  if (verticalLabel && title) {
    return (
      <div className="rounded-lg flex items-center">
        <div className="flex items-center justify-center mr-6" style={{ width: 60, height: CHART_DIMENSIONS.height }}>
          <h3 
            className="text-md text-text-gray font-bold"
            style={{ 
              transform: 'rotate(-90deg)', 
              whiteSpace: 'nowrap',
              transformOrigin: 'center'
            }}
          >
            {title}
          </h3>
        </div>
        <div className="flex-1" style={{ height: CHART_DIMENSIONS.height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 flex flex-col items-center">
      {title && <h3 className="text-md mb-3 text-text-gray">{title}</h3>}
      <div className="w-full" style={{ height: CHART_DIMENSIONS.height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: any[];
  title: string;
  color: string;
  margin?: { top: number; right: number; left: number; bottom: number };
  labelsInside?: boolean;
  verticalLabel?: boolean;
}

export const VerticalBarChartComponent: React.FC<BarChartProps> = ({
  data,
  title,
  color,
  margin = DEFAULT_MARGINS.default,
  labelsInside = false,
  verticalLabel = false,
}) => {
  return (
    <ChartContainer title={title} verticalLabel={verticalLabel}>
      <BarChart
        className="tracking-normal"
        data={data}
        margin={margin}
        layout="vertical"
        barCategoryGap={2}
      >
        <XAxis
          type="number"
          domain={[CHART_RANGES.winRateMin, CHART_RANGES.winRateMax]}
          stroke={CHART_COLORS.axis}
          fontSize={CHART_DIMENSIONS.fontSize}
          tick={labelsInside ? false : true}
          axisLine={labelsInside ? false : true}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={labelsInside ? 0 : CHART_DIMENSIONS.yAxisWidth}
          stroke={CHART_COLORS.axis}
          fontSize={CHART_DIMENSIONS.fontSize}
          tickLine={false}
          tick={labelsInside ? false : true}
        />
        {!labelsInside && (
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.tooltipBackground,
              color: CHART_COLORS.tooltipText,
              border: `1px solid ${CHART_COLORS.tooltipBorder}`,
              borderRadius: `${CHART_DIMENSIONS.tooltipBorderRadius}px`,
              fontSize: `${CHART_DIMENSIONS.fontSize}px`,
            }}
          />
        )}
        <Bar 
          dataKey="value" 
          fill={color}
          radius={[6, 6, 6, 6]}
          label={labelsInside ? (props: any) => {
            try {
              if (props && props.name && props.value) {
                return (
                  <g>
                    <text 
                      x={props.x + 20} 
                      y={props.y + props.height / 2} 
                      fill="white" 
                      fontSize={CHART_DIMENSIONS.fontSize}
                      fontWeight="bold"
                      textAnchor="start"
                      dominantBaseline="middle"
                    >
                      {props.name}
                    </text>
                    <text 
                      x={props.x + props.width - 10} 
                      y={props.y + props.height / 2} 
                      fill="white" 
                      fontSize={CHART_DIMENSIONS.fontSize}
                      fontWeight="bold"
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {props.value.toFixed(1)}%
                    </text>
                  </g>
                );
              }
              return null;
            } catch (error) {
              console.error('Custom label error:', error);
              return null;
            }
          } : false}
        />
      </BarChart>
    </ChartContainer>
  );
};

interface OpeningPopularityChartProps {
  data: any[];
}

export const OpeningPopularityChart: React.FC<OpeningPopularityChartProps> = ({
  data,
}) => {
  return (
    <ChartContainer>
      <LineChart data={data} margin={DEFAULT_MARGINS.lineChart}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="year"
          stroke={CHART_COLORS.axis}
          fontSize={CHART_DIMENSIONS.fontSize}
        />
        <YAxis
          stroke={CHART_COLORS.axis}
          fontSize={CHART_DIMENSIONS.fontSize}
          domain={[CHART_RANGES.popularityMin, CHART_RANGES.popularityMax]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_COLORS.tooltipBackground,
            color: CHART_COLORS.tooltipText,
            border: `1px solid ${CHART_COLORS.tooltipBorder}`,
            borderRadius: `${CHART_DIMENSIONS.tooltipBorderRadius}px`,
            fontSize: `${CHART_DIMENSIONS.fontSize}px`,
          }}
        />
        <Legend />
        {lineDataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={CHART_COLORS.lines[index % CHART_COLORS.lines.length]}
            strokeWidth={CHART_DIMENSIONS.lineStrokeWidth}
            dot={{ r: CHART_DIMENSIONS.lineDotRadius }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
