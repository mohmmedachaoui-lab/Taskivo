"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeeklyActivityProps {
  data?: { day: string; tasks: number }[];
}

export default function WeeklyActivity({ data }: WeeklyActivityProps) {
  const chartData =
    data && data.length > 0
      ? data
      : DAYS.map((day) => ({ day, tasks: 0 }));

  const hasData = data && data.some((d) => d.tasks > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="text-xs text-blue-500">
            {payload[0].value} tasks completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Weekly Activity
      </h3>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No activity yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Complete tasks to see your weekly progress
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              opacity={0.3}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar
              dataKey="tasks"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
