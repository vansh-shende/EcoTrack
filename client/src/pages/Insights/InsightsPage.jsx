import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Leaf, Zap, ShieldAlert, Award, TrendingDown, ArrowRight, Car } from 'lucide-react';
import useInsights from '../../hooks/useInsights';
import InsightCard from '../../components/common/InsightCard';

export const InsightsPage = () => {
  const { report, loading, error, refresh } = useInsights();

  // Helper: map impact scores to colors
  const getImpactColor = (score) => {
    switch (score?.toLowerCase()) {
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.08)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.15)' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.08)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.15)' };
    }
  };

  // Helper: category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'transportation':
        return <Car size={16} style={{ color: '#3B82F6' }} />;
      case 'energy':
        return <Zap size={16} style={{ color: '#F59E0B' }} />;
      default:
        return <Leaf size={16} style={{ color: '#10B981' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Shimmer CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, #16161E 25%, #242435 50%, #16161E 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}} />
        
        {/* Header Shimmer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="skeleton" style={{ height: '32px', width: '280px', borderRadius: '8px' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '180px', borderRadius: '4px', marginTop: '8px' }}></div>
          </div>
          <div className="skeleton" style={{ height: '38px', width: '160px', borderRadius: '8px' }}></div>
        </div>

        {/* Core Stats Grid Shimmer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="skeleton" style={{ height: '280px', borderRadius: '16px' }}></div>
          <div className="skeleton" style={{ height: '280px', borderRadius: '16px', gridColumn: 'span 2' }}></div>
        </div>

        {/* Panel Shimmer */}
        <div className="skeleton" style={{ height: '100px', borderRadius: '16px' }}></div>
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
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px', marginTop: '12px' }}
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', color: '#FFF' }}>
      
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            AI Sustainability Insights
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
            IPCC aligned carbon footprints & recommendations
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            backgroundColor: '#16161E',
            border: '1px solid #1C1C28',
            color: '#FFF',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C1C28'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16161E'}
        >
          <RefreshCw size={14} /> Refresh Heuristics
        </button>
      </motion.div>

      {/* CORE STATS GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
      >
        
        {/* ECO SCORE CARD */}
        <motion.div
          variants={itemVariants}
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
        >
          <h3 style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, width: '100%', textAlign: 'left' }}>
            CARBON SCORE RATING
          </h3>
          
          {/* CIRCULAR GAUGE */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', height: '160px' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#16161E"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                stroke={score?.color || '#3B82F6'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#FFF', letterSpacing: '-1px' }}>
                {score?.score || 0}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                padding: '3px 10px', 
                borderRadius: '12px', 
                marginTop: '4px', 
                backgroundColor: (score?.color || '#3B82F6') + '15', 
                color: score?.color || '#3B82F6',
                border: `1px solid ${(score?.color || '#3B82F6')}25`
              }}>
                Grade {score?.rating || 'C'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', margin: 0 }}>{score?.label}</h4>
            <p style={{ color: '#A1A1AA', fontSize: '0.8rem', lineHeight: '1.5', margin: 0, textAlign: 'center', maxWidth: '280px' }}>
              {score?.description}
            </p>
          </div>
        </motion.div>

        {/* CARBON BUDGET TARGETS */}
        <motion.div
          variants={itemVariants}
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2', padding: '32px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                PARIS GOAL ALIGNMENT
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#FFF', margin: '6px 0 0 0', fontWeight: '500' }}>Weekly footprint vs target budget limit</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#FFF' }}>{carbonWeeklyValue.toFixed(1)}</span>
              <span style={{ color: '#71717A', fontSize: '0.8rem' }}> / {targetBudgetWeekly} kg CO₂e</span>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '100%', backgroundColor: '#16161E', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #242435' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetRatio}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: '6px',
                  backgroundColor: budgetRatio > 100 ? '#EF4444' : budgetRatio > 70 ? '#F59E0B' : '#10B981',
                }}
              ></motion.div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#71717A' }}>
              <span>Sustainable Limit (0 kg)</span>
              <span style={{ color: budgetRatio > 100 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
                Paris Target ({targetBudgetWeekly} kg)
              </span>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', paddingTop: '20px', borderTop: '1px solid #1C1C28', marginTop: '12px' }}>
            {score?.breakdown && Object.entries(score.breakdown).map(([key, data]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ textTransform: 'capitalize', color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getCategoryIcon(key)} {key}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF', fontWeight: 'bold' }}>{data.score}/100</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#16161E', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${data.score}%`,
                      height: '100%',
                      backgroundColor: data.score > 80 ? '#10B981' : data.score > 50 ? '#3B82F6' : '#F59E0B',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* REDUCTION OPPORTUNITIES BLOCK */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card"
        style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF', margin: 0 }}>Carbon Reduction Action Opportunities</h3>
            <p style={{ fontSize: '0.8rem', color: '#A1A1AA', margin: '4px 0 0 0' }}>Optimize your footprint by acting on recommendations below</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#10B981' }}>
              -{analysis?.potentialSavingsPercent || 0}%
            </span>
            <p style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '2px 0 0 0', fontWeight: '600' }}>Potential Savings</p>
          </div>
          <div style={{ height: '40px', width: '1px', backgroundColor: '#1C1C28' }}></div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#FFF' }}>
              {analysis?.potentialWeeklySavingsKg || 0} kg
            </span>
            <p style={{ fontSize: '10px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '2px 0 0 0', fontWeight: '600' }}>CO₂e / week saved</p>
          </div>
        </div>
      </motion.div>

      {/* RECOMMENDATIONS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFF', margin: 0 }}>Personalized Recommendations</h3>
        
        {recommendations?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderStyle: 'dashed' }}
          >
            <Leaf size={36} style={{ color: '#10B981', opacity: 0.7 }} />
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#FFF', margin: 0 }}>Clean Carbon Footprint!</h4>
              <p style={{ color: '#A1A1AA', fontSize: '0.85rem', margin: '6px 0 0 0', maxWidth: '320px' }}>No active alerts triggered for your transport, energy, or diet logs. Keep up the excellent work.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}
          >
            {recommendations?.map((rec, index) => (
              <motion.div variants={itemVariants} key={index}>
                <InsightCard
                  type="recommendation"
                  category={rec.category}
                  title={`${rec.category.toUpperCase()} MITIGATION`}
                  message={rec.message}
                  savings={`-${rec.estimatedReductionPercent}%`}
                  impact={rec.impactScore}
                  onAction={() => console.log(`Applying action for ${rec.ruleId}`)}
                  actionLabel="Optimize Habit"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
