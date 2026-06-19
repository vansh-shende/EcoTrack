import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        background: 'radial-gradient(circle at top, #161624 0%, #09090B 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Gradient Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(50% 50% at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '48px 40px',
          zIndex: 1,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          background: 'rgba(22, 22, 30, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
        }}
      >
        {/* BRAND */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '36px',
            gap: '14px',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              padding: '12px',
              borderRadius: '12px',
              display: 'inline-flex',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <Leaf size={28} style={{ color: '#10B981' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#FFF', letterSpacing: '-0.5px', margin: 0 }}>
            Sign in to EcoTrack
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
            Enter your credentials to access your carbon analytics
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#F87171',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#71717A',
                }}
              />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '42px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#71717A',
                }}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '42px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              height: '42px',
              borderRadius: '8px',
              marginTop: '10px',
            }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* REDIRECT */}
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: '#A1A1AA' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#10B981', fontWeight: '600', textDecoration: 'none' }}>
            Sign up for free
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
