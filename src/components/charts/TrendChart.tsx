import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: { time: string; value: number }[];
  label: string;
  unit: string;
  color?: string;
  warningHigh?: number;
  criticalHigh?: number;
  height?: number;
}

export function TrendChart({
  data,
  label,
  unit,
  color = '#1fa88a',
  warningHigh,
  criticalHigh,
  height = 180,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-neutral-400" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-navy-600 mb-2">
        {label} <span className="text-navy-400">({unit})</span>
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#737373' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e5e5' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#737373' }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              border: '1px solid #e5e5e5',
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
            formatter={(value: any) => [`${Number(value || 0).toFixed(1)} ${unit}`, label]}
          />
          {warningHigh !== undefined && (
            <Line
              type="monotone"
              dataKey={() => warningHigh}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth={1}
              dot={false}
              name="Warning"
            />
          )}
          {criticalHigh !== undefined && (
            <Line
              type="monotone"
              dataKey={() => criticalHigh}
              stroke="#dc2626"
              strokeDasharray="4 4"
              strokeWidth={1}
              dot={false}
              name="Critical"
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
