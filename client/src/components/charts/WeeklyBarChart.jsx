import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const WeeklyBarChart = ({ logs = [] }) => {
  // Days of the week in standard abbreviation
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Initialize aggregation object for each day
  // current: this week (0-6 days ago)
  // previous: last week (7-13 days ago)
  const weeklyData = daysOfWeek.map((day) => ({
    name: day,
    currentWeek: 0,
    previousWeek: 0,
  }));

  const now = new Date();
  // Get start of today (local time)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  logs.forEach((log) => {
    const logDate = new Date(log.log_date);
    const co2 = parseFloat(log.calculated_co2) || 0;
    
    // Calculate difference in days
    const diffTime = todayStart - logDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const dayIndex = logDate.getDay(); // 0 (Sun) to 6 (Sat)
    
    if (diffDays >= 0 && diffDays < 7) {
      weeklyData[dayIndex].currentWeek += co2;
    } else if (diffDays >= 7 && diffDays < 14) {
      weeklyData[dayIndex].previousWeek += co2;
    }
  });

  // Reorder days so Monday is first
  const mondayFirstData = [...weeklyData.slice(1), weeklyData[0]];

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
          <p style={{ color: '#E4E4E7', fontWeight: 'bold', marginBottom: '6px' }}>
            {payload[0].payload.name}day
          </p>
          <p style={{ color: '#4ADE80' }}>
            This Week: {payload[0].value.toFixed(2)} kg CO₂
          </p>
          {payload[1] && (
            <p style={{ color: '#60A5FA' }}>
              Last Week: {payload[1].value.toFixed(2)} kg CO₂
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const hasData = mondayFirstData.some(d => d.currentWeek > 0 || d.previousWeek > 0);

  return (
    <div style={{ width: '100%', height: 260 }}>
      {!hasData ? (
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
          No activity logs in the last 14 days to compare.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mondayFirstData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D44" />
            <XAxis
              dataKey="name"
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
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: '0.8rem', color: '#A1A1AA' }}
            />
            <Bar
              name="This Week"
              dataKey="currentWeek"
              fill="#4ADE80"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="Last Week"
              dataKey="previousWeek"
              fill="#60A5FA"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeeklyBarChart;
