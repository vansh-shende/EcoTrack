import React from 'react';
import { Leaf, Clock, Plus, Trash2 } from 'lucide-react';

const CATEGORY_COLORS = {
  transportation: { bg: '#1B3B2B', text: '#4ADE80', label: 'Transport' },
  energy:         { bg: '#1D2D44', text: '#60A5FA', label: 'Energy' },
  food:           { bg: '#3C3014', text: '#FBBF24', label: 'Food' },
  shopping:       { bg: '#2E1E3C', text: '#A78BFA', label: 'Shopping' },
  waste:          { bg: '#3C1F1F', text: '#F87171', label: 'Waste' },
  water:          { bg: '#133535', text: '#2DD4BF', label: 'Water' },
  digital:        { bg: '#3C2613', text: '#FB923C', label: 'Digital' },
  other:          { bg: '#2D3540', text: '#94A3B8', label: 'Other' },
};

export const RecentActivity = ({ activities = [], onAddLog, onDeleteLog }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>
          <Clock size={18} style={{ color: '#60A5FA' }} />
          <span>Recent Activity logs</span>
        </div>
        <button
          onClick={onAddLog}
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
        >
          <Plus size={14} /> Log Entry
        </button>
      </div>

      <div style={{ flex: 1, overflowX: 'auto' }}>
        {activities.length === 0 ? (
          <div
            style={{
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A1A1AA',
              gap: '8px',
            }}
          >
            <Leaf size={32} style={{ color: '#2D2D44' }} />
            <p style={{ fontSize: '0.9rem' }}>No carbon footprint logs found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #303046', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: '#A1A1AA', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '10px 8px', color: '#A1A1AA', fontWeight: '500' }}>Category</th>
                <th style={{ padding: '10px 8px', color: '#A1A1AA', fontWeight: '500' }}>Input</th>
                <th style={{ padding: '10px 8px', color: '#A1A1AA', fontWeight: '500', textAlign: 'right' }}>CO₂e</th>
                {onDeleteLog && <th style={{ padding: '10px 8px', width: '40px' }}></th>}
              </tr>
            </thead>
            <tbody>
              {activities.map((log) => {
                const badge = CATEGORY_COLORS[log.category] || CATEGORY_COLORS.other;
                return (
                  <tr
                    key={log.log_id}
                    style={{
                      borderBottom: '1px solid #252538',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2D2D44')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '10px 8px', color: '#E4E4E7' }}>
                      {formatDate(log.log_date)}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'inline-block',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#A1A1AA', fontFamily: "'JetBrains Mono', monospace" }}>
                      {parseFloat(log.input_value)}
                    </td>
                    <td
                      style={{
                        padding: '10px 8px',
                        color: '#FFF',
                        fontWeight: '600',
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {parseFloat(log.calculated_co2).toFixed(1)} kg
                    </td>
                    {onDeleteLog && (
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => onDeleteLog(log.log_id)}
                          style={{
                            background: 'none',
                            color: '#A1A1AA',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#F87171';
                            e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#A1A1AA';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
