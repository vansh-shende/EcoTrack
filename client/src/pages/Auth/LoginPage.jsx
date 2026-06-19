import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E1E2E',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px 32px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* BRAND */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
            gap: '12px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              display: 'inline-flex',
            }}
          >
            <Leaf size={28} style={{ color: '#4ADE80' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            Welcome to EcoTrack
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.85rem', textAlign: 'center' }}>
            Sign in to track and reduce your carbon footprint
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid #F87171',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#A1A1AA',
                }}
              />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative', marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#A1A1AA',
                }}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', display: 'flex', gap: '8px', fontSize: '0.95rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* REDIRECT */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#A1A1AA' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '500' }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
