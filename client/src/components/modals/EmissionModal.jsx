import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';

const EMISSION_FACTORS = {
  transportation: { factor: 0.18, unit: 'km driven', desc: 'Average passenger vehicle' },
  energy:         { factor: 0.45, unit: 'kWh electricity', desc: 'Household electricity use' },
  food:           { factor: 2.5,  unit: 'kg food consumed', desc: 'General dietary footprint' },
  shopping:       { factor: 1.8,  unit: 'kg goods purchased', desc: 'Manufacturing & shipping footprint' },
  waste:          { factor: 0.5,  unit: 'kg waste generated', desc: 'Landfill disposal footprint' },
  water:          { factor: 0.003,unit: 'liters water used', desc: 'Water treatment & supply' },
  digital:        { factor: 0.05, unit: 'GB data transferred', desc: 'Cloud server electricity' },
  other:          { factor: 1.0,  unit: 'units consumed', desc: 'Custom activity category' },
};

export const EmissionModal = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState('transportation');
  const [inputValue, setInputValue] = useState('');
  const [calculatedCo2, setCalculatedCo2] = useState(0);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update real-time calculation whenever category or input value changes
  useEffect(() => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val > 0) {
      const factor = EMISSION_FACTORS[category].factor;
      setCalculatedCo2(parseFloat((val * factor).toFixed(4)));
    } else {
      setCalculatedCo2(0);
    }
  }, [category, inputValue]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const val = parseFloat(inputValue);

    if (isNaN(val) || val <= 0) {
      setError('Please enter a positive value.');
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit({
        category,
        input_value: val,
        calculated_co2: calculatedCo2,
        log_date: new Date(logDate).toISOString(),
      });
      if (success) {
        setInputValue('');
        onClose();
      } else {
        setError('Failed to record emission log.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const selectedConfig = EMISSION_FACTORS[category];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            color: '#A1A1AA',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Calculator size={20} style={{ color: '#4ADE80' }} />
          Record Carbon Activity
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid #F87171',
              color: '#F87171',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              {Object.keys(EMISSION_FACTORS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity ({selectedConfig.unit})</label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g., 45.2"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
            />
            <span style={{ fontSize: '0.75rem', color: '#A1A1AA', marginTop: '2px' }}>
              {selectedConfig.desc}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Date</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Real-time Calculation Display */}
          <div
            style={{
              backgroundColor: '#1E1E2E',
              border: '1px solid #303046',
              borderRadius: '8px',
              padding: '12px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estimated Carbon Footprint
              </p>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ADE80', marginTop: '2px', fontFamily: "'JetBrains Mono', monospace" }}>
                {calculatedCo2.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#A1A1AA' }}>kg CO₂e</span>
              </p>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#A1A1AA', textAlign: 'right' }}>
              <p>Factor: {selectedConfig.factor}</p>
              <p>kg / {selectedConfig.unit.split(' ')[0]}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || calculatedCo2 === 0}
            >
              {loading ? 'Submitting...' : 'Record Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmissionModal;
