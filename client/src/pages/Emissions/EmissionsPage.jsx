import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw, Car, Zap, Utensils, ShoppingBag, Trash, Droplet, Monitor, HelpCircle } from 'lucide-react';
import useEmissions from '../../hooks/useEmissions';

const CATEGORY_META = {
  transportation: { label: 'Transportation', unit: 'km', factor: 0.18, color: '#60A5FA', icon: Car },
  energy: { label: 'Energy', unit: 'kWh', factor: 0.45, color: '#FBBF24', icon: Zap },
  food: { label: 'Diet / Food', unit: 'kg', factor: 2.5, color: '#4ADE80', icon: Utensils },
  shopping: { label: 'Shopping', unit: 'items', factor: 1.8, color: '#F472B6', icon: ShoppingBag },
  waste: { label: 'Waste', unit: 'kg', factor: 0.5, color: '#A78BFA', icon: Trash },
  water: { label: 'Water', unit: 'liters', factor: 0.003, color: '#38BDF8', icon: Droplet },
  digital: { label: 'Digital', unit: 'hours', factor: 0.05, color: '#FB7185', icon: Monitor },
  other: { label: 'Other', unit: 'units', factor: 1.0, color: '#9CA3AF', icon: HelpCircle },
};

export const EmissionsPage = () => {
  const {
    logs,
    meta,
    loading,
    error,
    page,
    setPage,
    category,
    setCategory,
    addLog,
    deleteLog,
    refresh,
  } = useEmissions(1, '', 10);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState('transportation');
  const [formInputValue, setFormInputValue] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState(null);

  // Form submission handler
  const handleAddLog = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    const value = parseFloat(formInputValue);
    if (isNaN(value) || value <= 0) {
      setFormError('Please enter a valid positive number');
      return;
    }

    setSubmitting(true);
    try {
      const factor = CATEGORY_META[formCategory].factor;
      const calculatedCo2 = parseFloat((value * factor).toFixed(4));
      
      await addLog({
        category: formCategory,
        input_value: value,
        calculated_co2: calculatedCo2,
        log_date: formDate,
      });

      // Reset form
      setFormInputValue('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to submit emission log');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler with safety confirmations
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this carbon log?')) {
      try {
        await deleteLog(id);
      } catch (err) {
        alert(err.message || 'Failed to delete carbon log');
      }
    }
  };

  const currentMeta = CATEGORY_META[formCategory] || CATEGORY_META.other;
  const calculatedCo2Preview = formInputValue ? (parseFloat(formInputValue) * currentMeta.factor).toFixed(2) : '0.00';

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '28px', fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Emissions Ledger
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '14px' }}>
            Manage, log, and filter your historical carbon activities.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => refresh()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1E1E2E',
              border: '1px solid #2D2D3F',
              borderRadius: '6px',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              color: '#A1A1AA',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={() => setShowModal(true)}
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
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              transition: 'background-color 0.2s',
            }}
          >
            <Plus size={16} /> Log Activity
          </button>
        </div>
      </div>

      {/* Filter and Content Card */}
      <div style={{ backgroundColor: '#181824', border: '1px solid #232334', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Filters bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #232334', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: '#A1A1AA' }} />
            <span style={{ color: '#E4E4E7', fontSize: '14px', fontWeight: '500' }}>Filter Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: '#11111A',
                border: '1px solid #2A2A3C',
                color: '#FFF',
                borderRadius: '6px',
                padding: '6px 12px',
                outline: 'none',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">All Categories</option>
              {Object.keys(CATEGORY_META).map((key) => (
                <option key={key} value={key}>{CATEGORY_META[key].label}</option>
              ))}
            </select>
          </div>
          
          <div style={{ color: '#A1A1AA', fontSize: '13px' }}>
            Showing {logs.length} logs of {meta.total} total
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#A1A1AA' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '12px' }} />
            <p>Loading activities...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
            <p style={{ fontWeight: '500', marginBottom: '8px' }}>Error Loading Logs</p>
            <p style={{ fontSize: '13px' }}>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: '#A1A1AA' }}>
            <Calendar size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
            <h3 style={{ color: '#FFF', fontWeight: '500', marginBottom: '6px' }}>No Activity Records Found</h3>
            <p style={{ fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
              Add a new carbon record to start tracking your footprint history.
            </p>
          </div>
        ) : (
          /* Table Ledger */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #232334', backgroundColor: '#13131F' }}>
                  <th style={{ padding: '14px 16px', color: '#8E8E93', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '14px 16px', color: '#8E8E93', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Log Date</th>
                  <th style={{ padding: '14px 16px', color: '#8E8E93', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Logged Value</th>
                  <th style={{ padding: '14px 16px', color: '#8E8E93', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Calculated CO₂e</th>
                  <th style={{ padding: '14px 16px', color: '#8E8E93', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const metaInfo = CATEGORY_META[log.category] || CATEGORY_META.other;
                  const IconComponent = metaInfo.icon;
                  return (
                    <tr 
                      key={log.log_id} 
                      style={{ 
                        borderBottom: '1px solid #1D1D2B', 
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C1C2B'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '6px', 
                            backgroundColor: `rgba(${parseInt(metaInfo.color.slice(1,3),16)}, ${parseInt(metaInfo.color.slice(3,5),16)}, ${parseInt(metaInfo.color.slice(5,7),16)}, 0.1)`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: `1px solid ${metaInfo.color}33`,
                          }}>
                            <IconComponent size={16} style={{ color: metaInfo.color }} />
                          </div>
                          <span style={{ color: '#FFF', fontWeight: '500', fontSize: '14px' }}>{metaInfo.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#E4E4E7', fontSize: '14px' }}>
                        {new Date(log.log_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#FFF', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                        {parseFloat(log.input_value).toLocaleString()} <span style={{ color: '#8E8E93', fontSize: '12px', fontWeight: '400' }}>{metaInfo.unit}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#EF4444', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>
                        {parseFloat(log.calculated_co2).toFixed(2)} <span style={{ fontSize: '11px', fontWeight: '400', color: '#8E8E93' }}>kg</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(log.log_id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#A1A1AA',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#A1A1AA';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {meta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid #232334', backgroundColor: '#13131F' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: page <= 1 ? 'transparent' : '#181824',
                border: '1px solid #2D2D3F',
                borderRadius: '6px',
                color: page <= 1 ? '#4E4E5E' : '#FFF',
                padding: '6px 12px',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <span style={{ color: '#A1A1AA', fontSize: '13px' }}>
              Page {page} of {meta.totalPages}
            </span>
            
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: page >= meta.totalPages ? 'transparent' : '#181824',
                border: '1px solid #2D2D3F',
                borderRadius: '6px',
                color: page >= meta.totalPages ? '#4E4E5E' : '#FFF',
                padding: '6px 12px',
                cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#1E1E2F',
            border: '1px solid #2E2E42',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '460px',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2E2E42', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#FFF', fontSize: '18px', fontWeight: '600' }}>Log Carbon Activity</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setFormInputValue('');
                }}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body / Form */}
            <form onSubmit={handleAddLog} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#EF4444', fontSize: '13px' }}>
                  {formError}
                </div>
              )}

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: '500' }}>Activity Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    backgroundColor: '#11111A',
                    border: '1px solid #2D2D42',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                >
                  {Object.keys(CATEGORY_META).map((key) => (
                    <option key={key} value={key}>{CATEGORY_META[key].label}</option>
                  ))}
                </select>
              </div>

              {/* Input Value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: '500' }}>
                  Logged Amount ({currentMeta.unit})
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={`e.g. 15`}
                    value={formInputValue}
                    onChange={(e) => setFormInputValue(e.target.value)}
                    style={{
                      backgroundColor: '#11111A',
                      border: '1px solid #2D2D42',
                      borderRadius: '6px',
                      color: '#FFF',
                      padding: '10px 60px 10px 10px',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#A1A1AA', fontSize: '13px' }}>
                    {currentMeta.unit}
                  </span>
                </div>
              </div>

              {/* Log Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#A1A1AA', fontSize: '13px', fontWeight: '500' }}>Activity Date</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{
                    backgroundColor: '#11111A',
                    border: '1px solid #2D2D42',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Real-time Calculation Panel */}
              <div style={{ 
                backgroundColor: '#13131F', 
                border: '1px dashed #2A2A3E', 
                borderRadius: '6px', 
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#8E8E93', fontSize: '13px' }}>Estimated CO₂e Output:</span>
                <span style={{ color: '#EF4444', fontSize: '16px', fontWeight: '700' }}>
                  {calculatedCo2Preview} kg
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormInputValue('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid #2D2D42',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    backgroundColor: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFF',
                    padding: '10px 0',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Log Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionsPage;
