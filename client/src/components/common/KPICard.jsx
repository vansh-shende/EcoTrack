import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * 💡 KPICard Component — A premium, dark-themed, animated KPI indicator
 * 
 * Props Interface:
 * @param {string} title - Label for the KPI card (e.g. "Total Emissions")
 * @param {number} value - Target value to count up/animate to
 * @param {React.ReactNode} icon - Lucide or React element to render as indicator
 * @param {string} [iconBg] - Background color of the icon circle (e.g. "rgba(74, 222, 128, 0.1)")
 * @param {string} [iconColor] - Color of the icon element itself (e.g. "#4ADE80")
 * @param {number} [decimals=0] - Decimal places to display for the animated value
 * @param {string} [prefix=""] - String to prepend to the number (e.g. "$")
 * @param {string} [suffix=""] - String to append to the number (e.g. " kg")
 * @param {boolean} [loading=false] - If true, renders a pulsing custom skeleton screen
 * @param {Object} [trend] - Performance comparison metadata
 * @param {number} trend.value - Percentage value of the trend (e.g. 15.2)
 * @param {'up'|'down'|'neutral'} trend.type - Direction of trend indicator
 * @param {string} [trend.label] - Subtext following the trend badge (e.g. "vs last month")
 * @param {string} [footerText] - Alternative static subtext instead of a trend badge
 * @param {number} [duration=800] - Duration of the count-up animation in milliseconds
 */
export const KPICard = ({
  title,
  value,
  icon,
  iconBg = 'rgba(96, 165, 250, 0.1)',
  iconColor = '#60A5FA',
  decimals = 0,
  prefix = '',
  suffix = '',
  loading = false,
  trend,
  footerText,
  duration = 800,
}) => {
  // Count-up animation state
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(null);

  // Trigger animation when value changes
  useEffect(() => {
    if (loading) return;

    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const startValue = startValueRef.current;
    const endValue = value;
    
    // Don't animate if value hasn't changed
    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Cubic ease-out formula for buttery smooth deceleration
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedPercentage = easeOutCubic(percentage);

      const currentValue = startValue + (endValue - startValue) * easedPercentage;
      setDisplayValue(currentValue);

      if (percentage < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        startValueRef.current = endValue; // Save last endValue for next transition
        startTimeRef.current = null;
      }
    };

    // Kick off animation
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, loading, duration]);

  // Format value output
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Render trend indicator badge
  const renderTrendBadge = () => {
    if (!trend) return null;

    let badgeColor = '#94A3B8';
    let badgeBg = 'rgba(148, 163, 184, 0.1)';
    let TrendIcon = Minus;

    if (trend.type === 'down') {
      badgeColor = '#4ADE80'; // Green is good in carbon context
      badgeBg = 'rgba(74, 222, 128, 0.1)';
      TrendIcon = ArrowDownRight;
    } else if (trend.type === 'up') {
      badgeColor = '#F87171'; // Red is bad in carbon context
      badgeBg = 'rgba(248, 113, 113, 0.1)';
      TrendIcon = ArrowUpRight;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: badgeBg,
            color: badgeColor,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <TrendIcon size={12} style={{ strokeWidth: 3 }} />
          {trend.value}%
        </span>
        {trend.label && (
          <span style={{ color: '#A1A1AA', fontSize: '0.75rem' }}>{trend.label}</span>
        )}
      </div>
    );
  };

  // ── LOADING SKELETON STATE ──────────────────────────────────
  if (loading) {
    return (
      <div className="kpi-card skeleton-active" style={styles.card}>
        <div style={styles.skeletonHeader}>
          <div style={styles.skeletonTitle} className="pulse" />
          <div style={styles.skeletonIcon} className="pulse" />
        </div>
        <div style={styles.skeletonValue} className="pulse" />
        <div style={styles.skeletonFooter} className="pulse" />
        
        {/* Inject CSS styling for Pulse animation */}
        <style>{skeletonStyles}</style>
      </div>
    );
  }

  // ── DEFAULT RENDER ──────────────────────────────────────────
  return (
    <div className="kpi-card" style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <div style={{ ...styles.iconWrapper, backgroundColor: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      
      <div style={styles.valueContainer}>
        <h2 style={styles.value}>
          {prefix}
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatNumber(displayValue)}
          </span>
          {suffix && <span style={styles.suffix}>{suffix}</span>}
        </h2>
      </div>

      {trend ? renderTrendBadge() : footerText && (
        <div style={styles.footerTextContainer}>
          <span style={styles.footerText}>{footerText}</span>
        </div>
      )}
      
      <style>{skeletonStyles}</style>
    </div>
  );
};

// ── CUSTOM INLINE STYLES ──────────────────────────────────────
const styles = {
  card: {
    backgroundColor: '#252538',
    border: '1px solid #303046',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    color: '#A1A1AA',
    fontSize: '0.85rem',
    fontWeight: '500',
    letterSpacing: '0.2px',
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueContainer: {
    marginTop: '14px',
  },
  value: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#FFF',
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'baseline',
  },
  suffix: {
    fontSize: '0.9rem',
    color: '#A1A1AA',
    fontWeight: 'normal',
    marginLeft: '4px',
  },
  footerTextContainer: {
    marginTop: '12px',
    borderTop: '1px solid #2D2D44',
    paddingTop: '8px',
  },
  footerText: {
    color: '#8E8E9F',
    fontSize: '0.75rem',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // Skeleton placeholders
  skeletonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  skeletonTitle: {
    width: '50%',
    height: '14px',
    borderRadius: '4px',
  },
  skeletonIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
  },
  skeletonValue: {
    width: '70%',
    height: '36px',
    borderRadius: '6px',
    margin: '8px 0 16px 0',
  },
  skeletonFooter: {
    width: '90%',
    height: '12px',
    borderRadius: '4px',
  },
};

// CSS Styles for Skeleton animations and interactive hover properties
const skeletonStyles = `
  .kpi-card:hover {
    transform: translateY(-2px);
    border-color: #3F3F56;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
  }
  .kpi-card.skeleton-active:hover {
    transform: none;
    border-color: #303046;
    box-shadow: none;
  }
  .pulse {
    background-color: #2D2D44;
    position: relative;
    overflow: hidden;
  }
  .pulse::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 20%,
      rgba(255, 255, 255, 0.07) 60%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 1.5s infinite;
    content: '';
  }
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export default KPICard;
