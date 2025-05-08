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
  darkMode: boolean;
  children: ReactElement; 
  title?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ darkMode, children, title }) => {
  return (
    <div
      className={`border-2 ${
        darkMode ? "border-[#111] bg-[#111]" : "border-white bg-white"
      } rounded-sm p-6 flex flex-col items-center transition-colors duration-300`}
    >
      {title && (
        <h3
          className={`text-md mb-3 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
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
  darkMode: boolean;
  title: string;
  color: string;
  margin?: { top: number; right: number; left: number; bottom: number };
}

export const VerticalBarChartComponent: React.FC<BarChartProps> = ({ 
  data, 
  darkMode, 
  title, 
  color,
  margin = { top: 10, right: 0, left: -20, bottom: 0 }
}) => {
  return (
    <ChartContainer darkMode={darkMode} title={title}>
      <BarChart
        className="tracking-normal"
        data={data}
        margin={margin}
        layout="vertical"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#444" : "#ddd"}
          horizontal={true}
        />
        <XAxis
          type="number"
          domain={[50, 70]}
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={10}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={10}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#111" : "white",
            color: darkMode ? "#ddd" : "black",
            border: darkMode ? "1px solid #444" : "1px solid #ddd",
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
  darkMode: boolean;
}

export const OpeningPopularityChart: React.FC<OpeningPopularityChartProps> = ({ data, darkMode }) => {
  return (
    <ChartContainer darkMode={darkMode}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 50, left: 0, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#444" : "#ddd"}
        />
        <XAxis
          dataKey="year"
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={10}
        />
        <YAxis
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={10}
          domain={[1.25, 3]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#111" : "white",
            color: darkMode ? "#ddd" : "black",
            border: darkMode ? "1px solid #444" : "1px solid #ddd",
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