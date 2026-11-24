import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  UserPlus,
  LogIn,
  User,
  MapPin,
} from 'lucide-react';

const Login = () => {
  // 'signin' | 'signup'
  const [authTab, setAuthTab] = useState('signin');
  const [authMode, setAuthMode] = useState('phone'); // 'phone' | 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Sign-up extra fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupState, setSignupState] = useState('');
  const [signupPincode, setSignupPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedExisting, setDetectedExisting] = useState(null); // null | true | false
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (error) setError('');
    setDetectedExisting(null);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    setDetectedExisting(null);
  };

  // Auto-detect if user exists when phone reaches 10 digits or email is valid
  const handleAutoDetect = async (identifier) => {
    try {
      const res = await api.checkUserExists(identifier);
      if (res.exists) {
        setDetectedExisting(true);
        // Auto switch to sign-in tab if user exists
        setAuthTab('signin');
      } else {
        setDetectedExisting(false);
        // Auto switch to sign-up tab for new user
        setAuthTab('signup');
      }
    } catch (err) {
      // Silently fail — detection is a nice-to-have
      setDetectedExisting(null);
    }
  };

  const handlePhoneBlurOrComplete = (val) => {
    const clean = val.trim();
    if (clean.length === 10) {
      handleAutoDetect(clean);
    }
  };

  const handleEmailBlur = () => {
    const clean = email.trim();
    if (/^[\w.-]+@[\w.-]+\.\w+$/.test(clean)) {
      handleAutoDetect(clean);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let identifier = '';

    if (authMode === 'phone') {
      const cleanPhone = phone.trim();
      if (!cleanPhone || cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      identifier = cleanPhone;
    } else {
      const cleanEmail = email.trim();
      if (!cleanEmail || !/^[\w.-]+@[\w.-]+\.\w+$/.test(cleanEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      identifier = cleanEmail;
    }

    // For sign-up, validate extra fields
    if (authTab === 'signup') {
      if (!signupName.trim()) {
        setError('Please enter your full name.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.sendOtp(identifier);

      // Prepare signup data to pass to verify page
      const signupData = authTab === 'signup'
        ? {
            name: signupName.trim(),
            email: signupEmail.trim() || (authMode === 'email' ? email.trim() : ''),
            address: signupAddress.trim(),
            city: signupCity.trim(),
            state: signupState.trim(),
            postal_code: signupPincode.trim(),
          }
        : null;

      navigate('/verify-otp', {
        state: {
          identifier,
          from,
          isNewUser: authTab === 'signup' || res.is_existing_user === false,
          signupData,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeTabStyle = {
    flex: 1,
    padding: '0.7rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div className="container section">
      <div className="auth-wrapper">
        <div className="auth-header">
          <img src="/cartify-icon.png" alt="Cartify" className="brand-auth-logo" />
          <h2>Welcome to Cartify</h2>
          <p>Sign in to your account or create a new one</p>
        </div>

        {/* SIGN IN / SIGN UP TABS */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthTab('signin');
              setError('');
            }}
            style={{
              ...activeTabStyle,
              backgroundColor: authTab === 'signin' ? 'var(--bg-surface)' : 'transparent',
              color: authTab === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: authTab === 'signin' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('signup');
              setError('');
            }}
            style={{
              ...activeTabStyle,
              backgroundColor: authTab === 'signup' ? 'var(--bg-surface)' : 'transparent',
              color: authTab === 'signup' ? 'var(--success)' : 'var(--text-secondary)',
              boxShadow: authTab === 'signup' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <UserPlus size={16} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* AUTO-DETECT BANNER */}
        {detectedExisting === true && authTab === 'signin' && (
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--primary)',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Welcome back! We found your account. Sign in to continue.</span>
          </div>
        )}

        {detectedExisting === false && authTab === 'signup' && (
          <div
            style={{
              backgroundColor: 'var(--success-light)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#14532d',
              fontWeight: 600,
            }}
          >
            <UserPlus size={16} color="var(--success)" />
            <span>New here! Please fill in your details to create an account.</span>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* PHONE / EMAIL TOGGLE */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setError('');
              setDetectedExisting(null);
            }}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: authMode === 'phone' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'phone' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: authMode === 'phone' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Phone size={13} />
            <span>Mobile Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError('');
              setDetectedExisting(null);
            }}
            style={{
              flex: 1,
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: authMode === 'email' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: authMode === 'email' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Mail size={13} />
            <span>Email Address</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PHONE / EMAIL INPUT */}
          {authMode === 'phone' ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Mobile Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => {
                    handlePhoneChange(e);
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    if (val.length === 10) {
                      handlePhoneBlurOrComplete(val);
                    }
                  }}
                  onBlur={() => handlePhoneBlurOrComplete(phone)}
                  style={{ width: '100%', fontSize: '1.05rem', letterSpacing: '0.05em' }}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com (or admin@cartify.com)"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                style={{ width: '100%' }}
                autoFocus
              />
            </div>
          )}

          {/* SIGN UP EXTRA FIELDS */}
          {authTab === 'signup' && (
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Your Details</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(required for new account)</span>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => { setSignupName(e.target.value); if (error) setError(''); }}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {authMode === 'phone' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address (optional)"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Enter house/street address"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={signupState}
                    onChange={(e) => setSignupState(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN"
                    value={signupPincode}
                    onChange={(e) => setSignupPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (authMode === 'phone' && phone.length !== 10)}
            className="btn btn-primary btn-block btn-lg"
          >
            <span>
              {loading
                ? 'Sending Code...'
                : authTab === 'signin'
                ? 'Sign In →'
                : 'Create Account →'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* SWITCH HINT */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {authTab === 'signin' ? (
            <span>
              New to Cartify?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', padding: 0 }}
              >
                Create an Account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', padding: 0 }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--success)" />
            <span>Secure Passwordless Authentication</span>
          </div>
          <p>
            By continuing, you agree to Cartify's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
