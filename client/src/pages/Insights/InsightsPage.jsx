import React from 'react';
import { RefreshCw, Leaf, Zap, ShieldAlert, Award, TrendingDown, ArrowRight, Car } from 'lucide-react';
import useInsights from '../../hooks/useInsights';
import InsightCard from '../../components/common/InsightCard';

export const InsightsPage = () => {
  const { report, loading, error, refresh } = useInsights();

  // Helper: map impact scores to colors
  const getImpactColor = (score) => {
    switch (score?.toLowerCase()) {
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' };
      default:
        return { bg: 'rgba(96, 165, 250, 0.1)', text: '#60A5FA', border: 'rgba(96, 165, 250, 0.2)' };
    }
  };

  // Helper: category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'transportation':
        return <Car size={16} style={{ color: '#60A5FA' }} />;
      case 'energy':
        return <Zap size={16} style={{ color: '#FBBF24' }} />;
      default:
        return <Leaf size={16} style={{ color: '#4ADE80' }} />;
    }
  };

  // CSS for Keyframe Animations (pulsing loader)
  const pulseStyle = {
    animation: 'pulse 1.5s infinite ease-in-out',
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Inject dynamic styles for animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
          }
        `}} />
        
        {/* Header Shimmer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ height: '32px', width: '220px', backgroundColor: '#252538', borderRadius: '4px', ...pulseStyle }}></div>
          <div style={{ height: '36px', width: '120px', backgroundColor: '#252538', borderRadius: '6px', ...pulseStyle }}></div>
        </div>

        {/* Dashboard Grid Shimmer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ height: '280px', backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', ...pulseStyle }}></div>
          <div style={{ height: '280px', backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', gridColumn: 'span 2', ...pulseStyle }}></div>
        </div>

        {/* Panel Shimmer */}
        <div style={{ height: '120px', backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', ...pulseStyle }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <ShieldAlert size={48} style={{ color: '#EF4444' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF', margin: 0 }}>Calculation Error</h3>
        <p style={{ color: '#A1A1AA', textAlign: 'center', maxWidth: '400px', margin: 0, fontSize: '0.9rem' }}>{error}</p>
        <button
          onClick={refresh}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563EB',
            border: 'none',
            color: '#white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
          }}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  const { score, recommendations, analysis, weeklySummary } = report || {};
  const targetBudgetWeekly = 38.5; // Paris limit
  const carbonWeeklyValue = weeklySummary?.total_co2_kg || 0;
  const budgetRatio = Math.min(100, (carbonWeeklyValue / targetBudgetWeekly) * 100);

  // SVG Circular Gauge calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score?.score || 0) / 100) * circumference;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', color: '#FFF' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            AI Sustainability Insights
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
            IPCC aligned carbon footprints & recommendations
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            backgroundColor: '#252538',
            border: '1px solid #303046',
            color: '#FFF',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          <RefreshCw size={14} /> Refresh Heuristics
        </button>
      </div>

      {/* CORE STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* ECO SCORE CARD */}
        <div style={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ color: '#A1A1AA', fontSize: '0.75rem', fontWeight: '600', uppercase: 'true', letterSpacing: '1px', margin: 0, width: '100%', textAlign: 'left' }}>
            CARBON SCORE RATING
          </h3>
          
          {/* CIRCULAR GAUGE */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '150px', height: '150px' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke="#252538"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="75"
                cy="75"
                r={radius}
                stroke={score?.color || '#60A5FA'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#FFF' }}>{score?.score || 0}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', marginTop: '4px', backgroundColor: (score?.color || '#60A5FA') + '20', color: score?.color || '#60A5FA' }}>
                Grade {score?.rating || 'C'}
              </span>
            </div>
          </div>

          <div style={{ textCenter: 'true', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFF', margin: 0 }}>{score?.label}</h4>
            <p style={{ color: '#A1A1AA', fontSize: '0.75rem', lineHeight: '1.4', margin: 0, textAlign: 'center' }}>{score?.description}</p>
          </div>
        </div>

        {/* CARBON BUDGET TARGETS */}
        <div style={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: '#A1A1AA', fontSize: '0.75rem', fontWeight: '600', uppercase: 'true', letterSpacing: '1px', margin: 0 }}>
                PARIS GOAL ALIGNMENT
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#FFF', margin: '4px 0 0 0', fontWeight: '500' }}>Weekly footprint vs target budget limit</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', fontFamily: 'monospace', color: '#FFF' }}>{carbonWeeklyValue.toFixed(1)}</span>
              <span style={{ color: '#A1A1AA', fontSize: '0.75rem' }}> / {targetBudgetWeekly} kg CO₂e</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ width: '100%', backgroundColor: '#252538', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${budgetRatio}%`,
                  borderRadius: '6px',
                  backgroundColor: budgetRatio > 100 ? '#EF4444' : budgetRatio > 70 ? '#FBBF24' : '#4ADE80',
                  transition: 'width 1s ease-out',
                }}
              ></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888899' }}>
              <span>Sustainable Limit (0 kg)</span>
              <span style={{ color: budgetRatio > 100 ? '#EF4444' : '#4ADE80', fontWeight: 'bold' }}>
                Paris Target ({targetBudgetWeekly} kg)
              </span>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid #2A2A3C', marginTop: '8px' }}>
            {score?.breakdown && Object.entries(score.breakdown).map(([key, data]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ textTransform: 'capitalize', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getCategoryIcon(key)} {key}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: '#FFF', fontWeight: 'bold' }}>{data.score}/100</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#252538', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${data.score}%`,
                      height: '100%',
                      backgroundColor: data.score > 80 ? '#4ADE80' : data.score > 50 ? '#60A5FA' : '#FBBF24',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REDUCTION OPPORTUNITIES BLOCK */}
      <div style={{ backgroundColor: '#1A1A26', border: '1px solid #2A2A3C', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFF', margin: 0 }}>Carbon Reduction Action Opportunities</h3>
            <p style={{ fontSize: '0.75rem', color: '#A1A1AA', margin: '2px 0 0 0' }}>Optimize your footprint by acting on recommendations below</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace', color: '#4ADE80' }}>
              -{analysis?.potentialSavingsPercent || 0}%
            </span>
            <p style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '2px 0 0 0' }}>Potential Savings</p>
          </div>
          <div style={{ height: '36px', width: '1px', backgroundColor: '#2A2A3C' }}></div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#FFF' }}>
              {analysis?.potentialWeeklySavingsKg || 0} kg
            </span>
            <p style={{ fontSize: '10px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '2px 0 0 0' }}>CO₂e / week saved</p>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF', margin: 0 }}>Personalized Recommendations</h3>
        
        {recommendations?.length === 0 ? (
          <div style={{ backgroundColor: '#1A1A26', border: '1px border-dashed #2A2A3C', borderRadius: '8px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Leaf size={32} style={{ color: '#4ADE80', opacity: 0.6 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#FFF', margin: 0 }}>Clean Carbon Footprint!</h4>
            <p style={{ color: '#A1A1AA', fontSize: '0.8rem', margin: 0 }}>No active alerts triggered for your transport, energy, or diet logs. Keep up the excellent work.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {recommendations?.map((rec, index) => (
              <InsightCard
                key={index}
                type="recommendation"
                category={rec.category}
                title={`${rec.category.toUpperCase()} MITIGATION`}
                message={rec.message}
                savings={`-${rec.estimatedReductionPercent}%`}
                impact={rec.impactScore}
                onAction={() => console.log(`Applying action for ${rec.ruleId}`)}
                actionLabel="Optimize Habit"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
