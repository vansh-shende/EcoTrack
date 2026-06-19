import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, ShieldAlert, Award, ArrowUpRight, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import useDashboard from '../../hooks/useDashboard';

export const ReportsPage = () => {
  const { summary, breakdown, loading, error, refresh } = useDashboard('month');
  const [exporting, setExporting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currency, setCurrency] = useState('USD');

  // Fetch all user logs for CSV export
  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const response = await api.get('/emissions?page=1&limit=100&sort=log_date:desc');
        setLogs(response.data || []);
      } catch (err) {
        console.error('Failed to load logs for reports:', err);
      }
    };
    fetchAllLogs();
  }, []);

  // CSV Export Trigger
  const handleCSVExport = () => {
    if (logs.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Log ID', 'Category', 'Date', 'Value', 'CO2 (kg)'];
    const rows = logs.map(log => [
      log.log_id,
      log.category,
      new Date(log.log_date).toISOString().split('T')[0],
      log.input_value,
      log.calculated_co2
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecotrack_carbon_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF / Window Print Trigger
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#A1A1AA' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '12px' }} />
        <p>Loading audit report...</p>
      </div>
    );
  }

  // Extract data from the API wrapper: { success, message, data: { total_co2_kg, ... } }
  const summaryData = summary?.data || summary || {};
  const totalCo2 = summaryData.total_co2_kg || 0;
  const dailyAvg = summaryData.daily_average_kg || (totalCo2 / 30);
  const logCount = summaryData.log_count || 0;

  // Compute grade locally based on weekly projection (Paris 1.5°C target = 38.5 kg/week)
  const weeklyProjection = (totalCo2 / 30) * 7;
  const grade = weeklyProjection <= 20 ? 'A' : weeklyProjection <= 38.5 ? 'B' : weeklyProjection <= 60 ? 'C' : 'D';

  const offsetEstimate = ((totalCo2 / 1000) * 12).toFixed(2); // $12 per ton

  // Extract categories from breakdown wrapper: { success, message, data: { categories: [...] } }
  const breakdownData = breakdown?.data || breakdown || {};
  const categories = breakdownData.categories || [];

  return (
    <div className="page-container print-container">
      {/* Print-specific style overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: #FFF !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #DDD !important;
            background-color: #FFF !important;
            box-shadow: none !important;
            color: #000 !important;
          }
          .print-title {
            color: #000 !important;
          }
          .print-sub {
            color: #444 !important;
          }
        }
      `}} />

      {/* Header bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '28px', fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Reports & Audits
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '14px' }}>
            Export and analyze carbon footprint audits for your records.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCSVExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1E1E2E',
              border: '1px solid #2D2D3F',
              borderRadius: '6px',
              color: '#FFF',
              padding: '0 16px',
              height: '38px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Download size={16} /> Export CSV
          </button>
          
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10B981',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0 16px',
              height: '38px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Report Page Content */}
      <div className="print-card" style={{ backgroundColor: '#181824', border: '1px solid #232334', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Report Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #232334', paddingBottom: '20px' }}>
          <div>
            <h2 className="print-title" style={{ color: '#FFF', fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>
              EcoTrack Carbon Audit Report
            </h2>
            <p className="print-sub" style={{ color: '#A1A1AA', fontSize: '13px' }}>
              Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: grade === 'A' ? '#10B981' : grade === 'B' ? '#3B82F6' : grade === 'C' ? '#F59E0B' : '#EF4444',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #232334'
            }}>
              Grade {grade}
            </span>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="print-card" style={{ padding: '20px', backgroundColor: '#13131F', border: '1px solid #232334', borderRadius: '8px' }}>
            <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '6px' }}>Total Monthly Footprint</p>
            <h3 style={{ color: '#FFF', fontSize: '24px', fontWeight: '700' }}>
              {totalCo2.toFixed(1)} <span style={{ fontSize: '14px', color: '#8E8E93' }}>kg CO₂e</span>
            </h3>
          </div>
          
          <div className="print-card" style={{ padding: '20px', backgroundColor: '#13131F', border: '1px solid #232334', borderRadius: '8px' }}>
            <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '6px' }}>Daily Footprint Average</p>
            <h3 style={{ color: '#FFF', fontSize: '24px', fontWeight: '700' }}>
              {dailyAvg.toFixed(2)} <span style={{ fontSize: '14px', color: '#8E8E93' }}>kg/day</span>
            </h3>
          </div>

          <div className="print-card" style={{ padding: '20px', backgroundColor: '#13131F', border: '1px solid #232334', borderRadius: '8px' }}>
            <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '6px' }}>Total Log Records</p>
            <h3 style={{ color: '#FFF', fontSize: '24px', fontWeight: '700' }}>
              {logCount || logs.length} <span style={{ fontSize: '14px', color: '#8E8E93' }}>entries</span>
            </h3>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div>
          <h4 className="print-title" style={{ color: '#FFF', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Emission Share Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((item) => {
              const percentage = parseFloat(item.percentage) || 0;
              const co2Value = parseFloat(item.total_co2_kg) || 0;
              return (
                <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#E4E4E7', textTransform: 'capitalize' }}>{item.category}</span>
                    <span style={{ color: '#FFF', fontWeight: '600' }}>
                      {co2Value.toFixed(1)} kg ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#11111A', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      backgroundColor: item.category === 'food' ? '#4ADE80' : item.category === 'transportation' ? '#60A5FA' : item.category === 'energy' ? '#FBBF24' : '#818CF8', 
                      borderRadius: '4px' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Offsetting Recommendations Panel */}
        <div style={{ 
          backgroundColor: 'rgba(16,185,129,0.05)', 
          border: '1px dashed rgba(16,185,129,0.2)', 
          borderRadius: '8px', 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <CheckCircle size={32} style={{ color: '#10B981', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h5 className="print-title" style={{ color: '#FFF', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
              Offset Your Remaining Emissions
            </h5>
            <p className="print-sub" style={{ color: '#A1A1AA', fontSize: '13px' }}>
              Your net carbon impact can be set to zero by contributing to certified Gold Standard projects.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#11111A',
                border: '1px solid #2D2D42',
                borderRadius: '20px',
                padding: '3px',
                cursor: 'pointer',
                width: '100px',
                position: 'relative',
                height: '28px',
              }}
            >
              <div style={{
                position: 'absolute',
                width: '48px',
                height: '22px',
                backgroundColor: '#10B981',
                borderRadius: '16px',
                transition: 'transform 0.25s ease',
                transform: currency === 'USD' ? 'translateX(0px)' : 'translateX(46px)',
              }} />
              <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '700',
                color: currency === 'USD' ? '#FFF' : '#8E8E93',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s',
              }}>USD</span>
              <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '700',
                color: currency === 'INR' ? '#FFF' : '#8E8E93',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s',
              }}>INR</span>
            </button>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#8E8E93', fontSize: '12px' }}>Estimate Offset Cost</p>
              <p style={{ color: '#10B981', fontSize: '20px', fontWeight: '700' }}>
                {currency === 'USD'
                  ? `$${offsetEstimate} USD`
                  : `₹${(parseFloat(offsetEstimate) * 83.5).toFixed(2)} INR`
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
