import React from 'react';
import { Activity, Calendar, Award, Zap } from 'lucide-react';
import KPICard from '../../components/common/KPICard';

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

export const SummaryCards = ({ summary, loading = false }) => {
  // If summary is null/undefined during initial load, we fallback to empty object
  const {
    total_co2_kg = 0,
    log_count = 0,
    daily_average_kg = 0,
    top_category,
    comparison,
  } = summary || {};

  const changePercent = comparison?.change_percent ?? 0;
  const trendDirection = comparison?.trend || 'stable';

  // Format Total Emissions value and unit dynamically
  const isTon = total_co2_kg >= 1000;
  const totalEmissionsVal = isTon ? total_co2_kg / 1000 : total_co2_kg;
  const emissionsSuffix = isTon ? ' t' : ' kg CO₂e';
  const emissionsDecimals = isTon ? 2 : 1;

  // Map trend type for KPICard
  const trendType = trendDirection === 'decreasing' ? 'down' : trendDirection === 'increasing' ? 'up' : 'neutral';
  const trendLabel = trendDirection === 'new' ? 'Initial Period' : 'vs last period';

  // Determine if cards should render in skeleton state
  const isCardLoading = loading || !summary;

  return (
    <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
      
      {/* CARD 1: Total Emissions */}
      <KPICard
        title="Total Emissions"
        value={totalEmissionsVal}
        decimals={emissionsDecimals}
        suffix={emissionsSuffix}
        icon={<Zap size={18} />}
        iconBg="rgba(74, 222, 128, 0.1)"
        iconColor="#4ADE80"
        loading={isCardLoading}
        trend={{
          value: Math.abs(changePercent),
          type: trendType,
          label: trendLabel
        }}
      />

      {/* CARD 2: Daily Average */}
      <KPICard
        title="Daily Average"
        value={daily_average_kg}
        decimals={2}
        suffix=" kg/day"
        icon={<Calendar size={18} />}
        iconBg="rgba(96, 165, 250, 0.1)"
        iconColor="#60A5FA"
        loading={isCardLoading}
        footerText="Calculated for selected period"
      />

      {/* CARD 3: Activity Logs */}
      <KPICard
        title="Activity Logs"
        value={log_count}
        decimals={0}
        suffix=" entries"
        icon={<Activity size={18} />}
        iconBg="rgba(167, 139, 250, 0.1)"
        iconColor="#A78BFA"
        loading={isCardLoading}
        footerText="Total logged carbon activities"
      />

      {/* CARD 4: Top Category */}
      <KPICard
        title="Top Category"
        value={top_category ? CATEGORY_LABELS[top_category.category] || top_category.category : 'None'}
        icon={<Award size={18} />}
        iconBg="rgba(251, 191, 36, 0.1)"
        iconColor="#FBBF24"
        loading={isCardLoading}
        footerText={top_category ? `${parseFloat(top_category.total_co2_kg).toFixed(1)} kg CO₂e accumulated` : 'No carbon logs yet'}
      />

    </div>
  );
};

export default SummaryCards;
