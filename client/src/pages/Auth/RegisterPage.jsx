import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { Leaf, User, Mail, Lock, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register(username, email, password, confirmPassword);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
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
          maxWidth: '440px',
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
            marginBottom: '32px',
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
            Create your account
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
            Join EcoTrack to start monitoring your emissions
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                required
                placeholder="earth_keeper"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '40px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Email Address</label>
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
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '40px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Password</label>
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
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '40px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Confirm Password</label>
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
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  backgroundColor: '#0F0F14',
                  borderColor: '#1C1C28',
                  height: '40px',
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
              height: '40px',
              borderRadius: '8px',
              marginTop: '10px',
            }}
          >
            {submitting ? 'Registering...' : 'Register'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* REDIRECT */}
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.875rem', color: '#A1A1AA' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#10B981', fontWeight: '600', textDecoration: 'none' }}>
            Sign in instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
