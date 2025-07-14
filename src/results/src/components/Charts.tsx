import React, { ReactElement } from 'react';
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
import { openingPopularityData } from '../data/chessData';

// Get the opening names from the data itself
const lineDataKeys = Object.keys(openingPopularityData[0])
  .filter(key => key !== 'year'); // Filter out the 'year' property

// Define a set of colors to use for the lines
const lineColors = ["#FF6B6B", "#1A535C", "#F9C74F", "#6A0572", "#4ECDC4"];

interface ChartContainerProps {
  children: ReactElement; 
  title?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ children, title }) => {
  return (
    <div className="border-2 border-primary rounded-sm p-6 flex flex-col items-center">
      {title && (
        <h3 className="text-md mb-3 text-gray">
          {title}
        </h3>
      )}
      <div className="h-64 w-full">
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
}

export const VerticalBarChartComponent: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  color,
  margin = { top: 10, right: 0, left: -20, bottom: 0 }
}) => {
  return (
    <ChartContainer title={title}>
      <BarChart
        className="tracking-normal"
        data={data}
        margin={margin}
        layout="vertical"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(218, 10.80%, 85.50%)"
          horizontal={true}
        />
        <XAxis
          type="number"
          domain={[50, 70]}
          stroke="hsl(218, 10.80%, 85.50%)"
          fontSize={10}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          stroke="hsl(218, 10.80%, 85.50%)"
          fontSize={10}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(227, 13.20%, 20.80%)",
            color: "hsl(0, 0.00%, 100.00%)",
            border: "1px solid hsl(200, 59.80%, 64.90%)",
            borderRadius: "0px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ChartContainer>
  );
};

interface OpeningPopularityChartProps {
  data: any[];
}

export const OpeningPopularityChart: React.FC<OpeningPopularityChartProps> = ({ data }) => {
  return (
    <ChartContainer>
      <LineChart
        data={data}
        margin={{ top: 10, right: 50, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(218, 10.80%, 85.50%)"
        />
        <XAxis
          dataKey="year"
          stroke="hsl(218, 10.80%, 85.50%)"
          fontSize={10}
        />
        <YAxis
          stroke="hsl(218, 10.80%, 85.50%)"
          fontSize={10}
          domain={[1.25, 3]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(227, 13.20%, 20.80%)",
            color: "hsl(0, 0.00%, 100.00%)",
            border: "1px solid hsl(200, 59.80%, 64.90%)",
            borderRadius: "0px",
            fontSize: "12px",
          }}
        />
        <Legend />
        {lineDataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={lineColors[index % lineColors.length]}
            strokeWidth={2}
            dot={{ r: 1 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};