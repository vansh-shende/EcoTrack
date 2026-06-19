import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const TrendLineChart = ({ data = [] }) => {
  // Format dates for display
  const chartData = data.map((item) => {
    const dateObj = new Date(item.date);
    return {
      ...item,
      // E.g., "Jun 19"
      formattedDate: dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#1E1E2E',
            border: '1px solid #303046',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <p style={{ color: '#A1A1AA', marginBottom: '4px' }}>
            {payload[0].payload.formattedDate}
          </p>
          <p style={{ color: '#4ADE80', fontWeight: 'bold' }}>
            {payload[0].value.toFixed(2)} kg CO₂e
          </p>
          <p style={{ color: '#60A5FA', fontSize: '0.75rem' }}>
            {payload[0].payload.log_count} log(s)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      {chartData.length === 0 ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A1A1AA',
            fontSize: '0.9rem',
          }}
        >
          No emission data recorded in this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D44" />
            <XAxis
              dataKey="formattedDate"
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#A1A1AA"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total_co2_kg"
              stroke="#4ADE80"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCo2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendLineChart;
