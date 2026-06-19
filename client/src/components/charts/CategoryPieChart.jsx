import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  transportation: '#4ADE80', // Green
  energy:         '#60A5FA', // Blue
  food:           '#FBBF24', // Yellow
  shopping:       '#A78BFA', // Purple
  waste:          '#F87171', // Red
  water:          '#2DD4BF', // Teal
  digital:        '#FB923C', // Orange
  other:          '#94A3B8', // Slate
};

const CATEGORY_LABELS = {
  transportation: 'Transport',
  energy:         'Energy',
  food:           'Food',
  shopping:       'Shopping',
  waste:          'Waste',
  water:          'Water',
  digital:        'Digital',
  other:          'Other',
};

export const CategoryPieChart = ({ data = [] }) => {
  const chartData = data.filter((item) => item.total_co2_kg > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: '#1E1E2E',
            border: '1px solid #303046',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <p style={{ color: dataPoint.color, fontWeight: '600', marginBottom: '2px' }}>
            {dataPoint.name}
          </p>
          <p style={{ color: '#E4E4E7' }}>
            {dataPoint.value.toFixed(2)} kg CO₂e
          </p>
          <p style={{ color: '#A1A1AA', fontSize: '0.75rem' }}>
            {dataPoint.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const formattedData = chartData.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total_co2_kg,
    percentage: item.percentage,
    color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other,
  }));

  const totalCo2 = formattedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {formattedData.length === 0 ? (
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
          No activity logs to categorize.
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div style={{ width: '50%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label for Donut */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total
              </p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFFFFF', marginTop: '2px' }}>
                {totalCo2.toFixed(1)}
              </p>
              <p style={{ fontSize: '0.65rem', color: '#A1A1AA' }}>
                kg CO₂
              </p>
            </div>
          </div>

          {/* Custom Side Legend */}
          <div
            style={{
              width: '50%',
              maxHeight: '100%',
              overflowY: 'auto',
              paddingLeft: '10px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {formattedData.slice(0, 5).map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '20%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#E4E4E7', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '65px' }}>
                  {item.name}
                </span>
                <span style={{ marginLeft: 'auto', color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.percentage}%
                </span>
              </div>
            ))}
            {formattedData.length > 5 && (
              <div style={{ color: '#A1A1AA', fontStyle: 'italic', paddingLeft: '18px', fontSize: '0.75rem' }}>
                + {formattedData.length - 5} more categories
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
