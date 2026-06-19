import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Filter, ChevronLeft, ChevronRight, RefreshCw, Car, Zap, Utensils, ShoppingBag, Trash, Droplet, Monitor, HelpCircle } from 'lucide-react';
import useEmissions from '../../hooks/useEmissions';

const CATEGORY_META = {
  transportation: { label: 'Transportation', unit: 'km', factor: 0.18, color: '#3B82F6', icon: Car },
  energy: { label: 'Energy', unit: 'kWh', factor: 0.45, color: '#F59E0B', icon: Zap },
  food: { label: 'Diet / Food', unit: 'kg', factor: 2.5, color: '#10B981', icon: Utensils },
  shopping: { label: 'Shopping', unit: 'items', factor: 1.8, color: '#EC4899', icon: ShoppingBag },
  waste: { label: 'Waste', unit: 'kg', factor: 0.5, color: '#8B5CF6', icon: Trash },
  water: { label: 'Water', unit: 'liters', factor: 0.003, color: '#06B6D4', icon: Droplet },
  digital: { label: 'Digital', unit: 'hours', factor: 0.05, color: '#EF4444', icon: Monitor },
  other: { label: 'Other', unit: 'units', factor: 1.0, color: '#64748B', icon: HelpCircle },
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
  const [deleteId, setDeleteId] = useState(null);

  const currentMeta = CATEGORY_META[formCategory] || CATEGORY_META.other;
  const calculatedCo2Preview = formInputValue ? (parseFloat(formInputValue) * currentMeta.factor).toFixed(2) : '0.00';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="page-container">
      {/* Header Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h1 style={{ color: '#FFF', fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Emissions Ledger
          </h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>
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
              backgroundColor: '#16161E',
              border: '1px solid #1C1C28',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              color: '#A1A1AA',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C1C28'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16161E'}
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px',
              padding: '0 18px',
              height: '38px',
            }}
          >
            <Plus size={16} /> Log Activity
          </button>
        </div>
      </motion.div>

      {/* Filter and Content Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: 'rgba(22, 22, 30, 0.3)' }}>
        
        {/* Filters bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1C1C28', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={16} style={{ color: '#71717A' }} />
            <span style={{ color: '#A1A1AA', fontSize: '0.85rem', fontWeight: '500' }}>Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: '#16161E',
                border: '1px solid #1C1C28',
                color: '#FFF',
                borderRadius: '8px',
                padding: '6px 14px',
                outline: 'none',
                fontSize: '0.85rem',
                cursor: 'pointer',
                height: '34px',
              }}
            >
              <option value="">All Categories</option>
              {Object.keys(CATEGORY_META).map((key) => (
                <option key={key} value={key}>{CATEGORY_META[key].label}</option>
              ))}
            </select>
          </div>
          
          <div style={{ color: '#71717A', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            Showing {logs.length} logs of {meta.total} total
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && logs.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#A1A1AA' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '16px', color: '#10B981' }} />
            <p style={{ fontSize: '0.9rem' }}>Loading activities...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#EF4444' }}>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>Error Loading Logs</p>
            <p style={{ fontSize: '0.85rem' }}>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '100px 24px', textAlign: 'center', color: '#71717A' }}>
            <Calendar size={48} style={{ opacity: 0.15, marginBottom: '20px' }} />
            <h3 style={{ color: '#FFF', fontWeight: '600', marginBottom: '8px', fontSize: '1.1rem' }}>No Activity Records Found</h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
              Add a new carbon record to start tracking your footprint history.
            </p>
          </div>
        ) : (
          /* Table Ledger */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1C1C28', backgroundColor: '#0F0F14' }}>
                  <th style={{ padding: '16px 24px', color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '16px 24px', color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Log Date</th>
                  <th style={{ padding: '16px 24px', color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Logged Value</th>
                  <th style={{ padding: '16px 24px', color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Calculated CO₂e</th>
                  <th style={{ padding: '16px 24px', color: '#71717A', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {logs.map((log) => {
                  const metaInfo = CATEGORY_META[log.category] || CATEGORY_META.other;
                  const IconComponent = metaInfo.icon;
                  return (
                    <motion.tr 
                      variants={rowVariants}
                      key={log.log_id} 
                      style={{ 
                        borderBottom: '1px solid #16161E', 
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '34px', 
                            height: '34px', 
                            borderRadius: '8px', 
                            backgroundColor: `${metaInfo.color}15`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: `1px solid ${metaInfo.color}25`,
                          }}>
                            <IconComponent size={16} style={{ color: metaInfo.color }} />
                          </div>
                          <span style={{ color: '#FFF', fontWeight: '600', fontSize: '0.9rem' }}>{metaInfo.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#A1A1AA', fontSize: '0.85rem' }}>
                        {new Date(log.log_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#FFF', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right' }}>
                        {parseFloat(log.input_value).toLocaleString()} <span style={{ color: '#71717A', fontSize: '0.8rem', fontWeight: '400' }}>{metaInfo.unit}</span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#EF4444', fontSize: '0.9rem', fontWeight: '700', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {parseFloat(log.calculated_co2).toFixed(2)} <span style={{ fontSize: '11px', fontWeight: '400', color: '#71717A' }}>kg</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button
                          onClick={() => setDeleteId(log.log_id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#71717A',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#71717A';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {meta.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #1C1C28', backgroundColor: '#0F0F14' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: page <= 1 ? 'transparent' : '#16161E',
                border: '1px solid #1C1C28',
                borderRadius: '8px',
                color: page <= 1 ? '#4E4E5E' : '#FFF',
                padding: '8px 16px',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (page > 1) e.target.style.backgroundColor = '#1C1C28'; }}
              onMouseLeave={(e) => { if (page > 1) e.target.style.backgroundColor = '#16161E'; }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <span style={{ color: '#71717A', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              Page {page} of {meta.totalPages}
            </span>
            
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: page >= meta.totalPages ? 'transparent' : '#16161E',
                border: '1px solid #1C1C28',
                borderRadius: '8px',
                color: page >= meta.totalPages ? '#4E4E5E' : '#FFF',
                padding: '8px 16px',
                cursor: page >= meta.totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (page < meta.totalPages) e.target.style.backgroundColor = '#1C1C28'; }}
              onMouseLeave={(e) => { if (page < meta.totalPages) e.target.style.backgroundColor = '#16161E'; }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog (Framer Motion) */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(9, 9, 11, 0.8)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card"
              style={{
                width: '100%',
                maxWidth: '480px',
                overflow: 'hidden',
                padding: '32px',
                background: '#0F0F14',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Log Carbon Activity</h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setFormInputValue('');
                  }}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '24px', padding: 0 }}
                  onMouseEnter={(e) => e.target.style.color = '#FFF'}
                  onMouseLeave={(e) => e.target.style.color = '#71717A'}
                >
                  &times;
                </button>
              </div>
              
              {/* Modal Body / Form */}
              <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {formError && (
                  <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#EF4444', fontSize: '13px' }}>
                    {formError}
                  </div>
                )}

                {/* Category */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Activity Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      backgroundColor: '#16161E',
                      border: '1px solid #1C1C28',
                      borderRadius: '8px',
                      color: '#FFF',
                      padding: '10px 12px',
                      outline: 'none',
                      fontSize: '14px',
                      width: '100%',
                      height: '42px',
                    }}
                  >
                    {Object.keys(CATEGORY_META).map((key) => (
                      <option key={key} value={key}>{CATEGORY_META[key].label}</option>
                    ))}
                  </select>
                </div>

                {/* Input Value */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
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
                        backgroundColor: '#16161E',
                        border: '1px solid #1C1C28',
                        borderRadius: '8px',
                        color: '#FFF',
                        padding: '10px 60px 10px 14px',
                        width: '100%',
                        boxSizing: 'border-box',
                        fontSize: '14px',
                        outline: 'none',
                        height: '42px',
                      }}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '11px', color: '#71717A', fontSize: '13px', fontWeight: '600' }}>
                      {currentMeta.unit}
                    </span>
                  </div>
                </div>

                {/* Log Date */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Activity Date</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      backgroundColor: '#16161E',
                      border: '1px solid #1C1C28',
                      borderRadius: '8px',
                      color: '#FFF',
                      padding: '10px 12px',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '42px',
                    }}
                  />
                </div>

                {/* Real-time Calculation Panel */}
                <div style={{ 
                  backgroundColor: '#16161E', 
                  border: '1px dashed #242435', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ color: '#A1A1AA', fontSize: '0.85rem' }}>Estimated CO₂e Output:</span>
                  <span style={{ color: '#EF4444', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
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
                      backgroundColor: '#16161E',
                      border: '1px solid #1C1C28',
                      borderRadius: '8px',
                      color: '#A1A1AA',
                      padding: '10px 0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#1C1C28'; e.target.style.color = '#FFF'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#16161E'; e.target.style.color = '#A1A1AA'; }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      borderRadius: '8px',
                      padding: '10px 0',
                      height: '42px',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Log Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(9, 9, 11, 0.8)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card"
              style={{
                width: '90%',
                maxWidth: '420px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                padding: '32px',
                background: '#0F0F14',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', color: '#EF4444', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Delete Activity Log
              </h3>
              <p style={{ margin: '0 0 28px 0', color: '#A1A1AA', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete this emission log entry? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{
                    backgroundColor: '#1C1C28',
                    border: '1px solid #242435',
                    color: '#A1A1AA',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#242435'; e.target.style.color = '#FFF'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#1C1C28'; e.target.style.color = '#A1A1AA'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteLog(deleteId);
                    } catch (err) {
                      console.error('Failed to delete carbon log:', err);
                      alert(err.message || 'Failed to delete log entry.');
                    } finally {
                      setDeleteId(null);
                    }
                  }}
                  style={{
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFF',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
                >
                  Delete Log
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmissionsPage;
