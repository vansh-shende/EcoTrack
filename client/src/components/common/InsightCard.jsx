import React from 'react';
import { AlertTriangle, Lightbulb, Trophy, ArrowRight, Car, Zap, Leaf, Shield } from 'lucide-react';

/**
 * Reusable Insight Card Component for EcoTrack
 * 
 * Props:
 * @param {string} type - 'warning' | 'recommendation' | 'achievement'
 * @param {string} category - 'transportation' | 'energy' | 'food' | 'general'
 * @param {string} title - Heading text for the card
 * @param {string} message - Body description text
 * @param {string|number} savings - Estimated savings percentage or value (e.g. "-20%" or "15 kg")
 * @param {string} impact - 'high' | 'medium' | 'low' (optional, mainly for warnings/recommendations)
 * @param {function} onAction - Optional callback for call-to-action button
 * @param {string} actionLabel - Text for action button (defaults to 'Take Action')
 */
export const InsightCard = ({
  type = 'recommendation',
  category = 'general',
  title,
  message,
  savings,
  impact,
  onAction,
  actionLabel = 'Take Action',
}) => {
  
  // ── THEME CONFIGURATIONS ────────────────────────────────────
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bg: '#1E1418',
          border: '#3D1C24',
          accent: '#EF4444',
          iconBg: 'rgba(239, 68, 68, 0.1)',
          icon: <AlertTriangle size={18} style={{ color: '#EF4444' }} />,
        };
      case 'achievement':
        return {
          bg: '#141E18',
          border: '#1C3D24',
          accent: '#4ADE80',
          iconBg: 'rgba(74, 222, 128, 0.1)',
          icon: <Trophy size={18} style={{ color: '#4ADE80' }} />,
        };
      case 'recommendation':
      default:
        return {
          bg: '#141824',
          border: '#1C243D',
          accent: '#60A5FA',
          iconBg: 'rgba(96, 165, 250, 0.1)',
          icon: <Lightbulb size={18} style={{ color: '#60A5FA' }} />,
        };
    }
  };

  // ── CATEGORY ICON CONFIGURATIONS ─────────────────────────────
  const getCategoryIcon = () => {
    switch (category?.toLowerCase()) {
      case 'transportation':
        return <Car size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />;
      case 'energy':
        return <Zap size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />;
      case 'food':
        return <Leaf size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />;
      default:
        return <Shield size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />;
    }
  };

  // ── IMPACT BADGE STYLES ──────────────────────────────────────
  const getImpactStyle = () => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.2)' };
      default:
        return { bg: 'rgba(96, 165, 250, 0.1)', text: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.2)' };
    }
  };

  const config = getTypeConfig();
  const impactStyle = getImpactStyle();

  return (
    <div
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderLeft: `4px solid ${config.accent}`,
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
      className="insight-card-hover"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              textTransform: 'capitalize',
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#1E1E2E',
              color: '#A1A1AA',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {getCategoryIcon()} {category}
          </span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {impact && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: impactStyle.bg,
                  color: impactStyle.text,
                  border: impactStyle.border,
                }}
              >
                {impact} Impact
              </span>
            )}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: config.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {config.icon}
            </div>
          </div>
        </div>

        {/* Title & Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {title && (
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
              {title}
            </h4>
          )}
          <p style={{ color: '#D1D1D6', fontSize: '0.8rem', lineHeight: '1.5', margin: 0 }}>
            {message}
          </p>
        </div>
      </div>

      {/* Bottom Footer Details */}
      {(savings || onAction) && (
        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {savings ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#8E8E93' }}>Potential saving:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#4ADE80' }}>
                {savings}
              </span>
            </div>
          ) : (
            <div />
          )}

          {onAction && (
            <button
              onClick={onAction}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: config.accent,
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {actionLabel} <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightCard;
