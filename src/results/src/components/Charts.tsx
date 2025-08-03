import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { openingPopularityData } from "../data/chessData";

const COLORS = {
  grid: "hsl(220,15%,50%)",
  axis: "hsl(220,20%,80%)",
  tooltipBg: "hsl(225,20%,15%)",
  tooltipText: "hsl(0,0%,95%)",
  tooltipBorder: "hsl(220,25%,65%)",
  lines: [
    "hsl(200,80%,60%)",
    "hsl(160,70%,55%)",
    "hsl(50,85%,60%)",
    "hsl(280,60%,60%)",
    "hsl(20,80%,60%)",
  ],
  primary: "hsl(200,70%,30%)",
  primaryLight: "hsl(200,70%,35%)",
  primaryDark: "hsl(200,70%,25%)",
};

export { COLORS as CHART_COLORS };

const VerticalLabel = ({ title }: { title: string }) => (
  <div
    className="flex items-center justify-center mr-6"
    style={{ width: 60, height: 256 }}
  >
    <h3
      className="text-md text-text-gray font-bold"
      style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
    >
      {title}
    </h3>
  </div>
);

const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1" style={{ height: 256 }}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

const BarLabel = ({ x, y, width, height, name, value, color }: any) =>
  name && value ? (
    <g>
      <text
        x={x + 20}
        y={y + height / 2}
        fill="hsl(218, 10.80%, 85.50%)"
        fontSize={14}
        fontWeight="bold"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {name}
      </text>
      <line
        x1={x}
        y1={y + height}
        x2={x + width}
        y2={y + height}
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={x + width - 10}
        y={y + height / 2}
        fill="hsl(218, 10.80%, 85.50%)"
        fontSize={14}
        fontWeight="bold"
        textAnchor="end"
        dominantBaseline="middle"
      >
        {value.toFixed(1)}%
      </text>
    </g>
  ) : null;

export const VerticalBarChartComponent = ({
  data,
  title,
  color,
}: {
  data: any[];
  title: string;
  color: string;
}) => (
  <div className="rounded-lg flex items-center">
    <VerticalLabel title={title} />
    <ChartWrapper>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        barCategoryGap={0}
        maxBarSize={32}
      >
        <XAxis type="number" domain={[50, 60]} hide />
        <YAxis dataKey="name" type="category" width={0} hide />
        <Bar
          dataKey="value"
          fill="transparent"
          stroke="transparent"
          radius={[6, 6, 6, 6]}
          label={(props: any) => <BarLabel {...props} color={color} />}
        />
      </BarChart>
    </ChartWrapper>
  </div>
);

export const OpeningPopularityChart = ({ data }: { data: any[] }) => {
  const keys = Object.keys(openingPopularityData[0]).filter(
    (k) => k !== "year"
  );
  return (
    <div className="rounded-lg flex flex-col items-center">
      <div className="w-full" style={{ height: 384 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 50, left: 0, bottom: 10 }}
          >
            <XAxis dataKey="year" stroke={COLORS.axis} fontSize={14} />
            <YAxis
              stroke={COLORS.axis}
              fontSize={14}
              domain={[1.25, 3]}
              ticks={[1.5, 2, 2.5, 3]}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: COLORS.tooltipBg,
                color: COLORS.tooltipText,
                border: `1px solid ${COLORS.tooltipBorder}`,
                borderRadius: 0,
                fontSize: 14,
              }}
            />
            <Legend />
            {keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS.lines[i % 5]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
