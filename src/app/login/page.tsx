'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to connect to server');
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Background Ambience */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(51,145,255,0.08) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)'
        }} />
      </div>

      {/* Left Panel - Hospital Branding (Hidden on mobile/tablet) */}
      <div className="login-left-panel">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #3391ff, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(51,145,255,0.35)'
          }}>
            <Icon name="local_hospital" size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            MediCore
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 400 }}>
            Hospital Management System
          </p>
          <div style={{ width: '48px', height: '3px', background: 'linear-gradient(90deg, #3391ff, #10b981)', borderRadius: '2px', margin: '1.5rem 0' }} />
          <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem' }}>
            Streamline your hospital operations with our comprehensive management platform. From patient care to pharmacy and billing — everything in one place.
          </p>
          <div className="login-features">
            {[
              { icon: 'person', text: 'Patient Registration & EMR' },
              { icon: 'calendar_month', text: 'Smart Appointment Scheduling' },
              { icon: 'medication', text: 'Pharmacy Inventory & Dispensing' },
              { icon: 'analytics', text: 'Financial & Operational Analytics' },
            ].map((f, i) => (
              <div key={i} className="login-feature-item">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(51,145,255,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#3391ff'
                }}>
                  <Icon name={f.icon} size={18} color="#3391ff" />
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form (Responsive) */}
      <div className="login-right-panel">
        <div className="login-form-wrapper animate-fadeInUp">
          <div style={{ marginBottom: '2rem' }}>
            <div className="login-mobile-logo">
              <Icon name="local_hospital" size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
              Sign in to your hospital account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                background: 'var(--danger-light)', color: 'var(--danger)',
                fontSize: '0.875rem', fontWeight: 500
              }}>
                <Icon name="error" size={18} color="var(--danger)" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username or Email</label>
              <div style={{ position: 'relative', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '0.875rem', pointerEvents: 'none', color: 'var(--text-tertiary)', display: 'flex' }}>
                  <Icon name="person" size={18} color="var(--text-tertiary)" />
                </span>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignContent: 'center', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '0.875rem', pointerEvents: 'none', color: 'var(--text-tertiary)', display: 'flex' }}>
                  <Icon name="lock" size={18} color="var(--text-tertiary)" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.5rem', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                    padding: '0.25rem', display: 'flex'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} color="var(--text-tertiary)" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
                  Signing in...
                </>
              ) : (
                <>
                  <Icon name="login" size={18} color="white" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Demo Login
            </p>
            <div className="login-demo-grid">
              {[
                { role: 'Administrator', user: 'admin', pass: 'admin123', color: '#7c3aed' },
                { role: 'Doctor', user: 'dr.silva', pass: 'doctor123', color: '#059669' },
                { role: 'Nurse', user: 'nurse.perera', pass: 'nurse123', color: '#ec4899' },
                { role: 'Receptionist', user: 'reception', pass: 'reception123', color: '#d97706' },
                { role: 'Pharmacist', user: 'pharmacist', pass: 'pharmacy123', color: '#dc2626' },
                { role: 'Accountant', user: 'accountant', pass: 'accounts123', color: '#2563eb' },
              ].map((cred, i) => (
                <button
                  key={i}
                  type="button"
                  className="login-demo-btn"
                  onClick={() => {
                    setUsername(cred.user);
                    setPassword(cred.pass);
                    setError('');
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cred.color, flexShrink: 0 }} />
                  <span>{cred.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
