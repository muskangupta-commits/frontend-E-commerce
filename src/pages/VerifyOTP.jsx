import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, UserPlus, Sparkles } from 'lucide-react';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyAndLogin } = useAuth();

  const identifier = location.state?.identifier || '';
  const from = location.state?.from || '/';
  const isNewUser = location.state?.isNewUser || false;
  const signupData = location.state?.signupData || null;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);

  // If accessed directly without an identifier, return to login
  useEffect(() => {
    if (!identifier) {
      navigate('/login', { replace: true });
    }
  }, [identifier, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedInUser = await verifyAndLogin(identifier, otp);

      // If this is a new user sign-up, save their profile data
      if (isNewUser && signupData) {
        try {
          const profileUpdate = {};

          // Update name if provided
          if (signupData.name) {
            profileUpdate.name = signupData.name;
          }

          // Update email if provided
          if (signupData.email) {
            profileUpdate.email = signupData.email;
          }

          // Build saved_address from signup data
          const hasAddress = signupData.address || signupData.city || signupData.state || signupData.postal_code;
          if (hasAddress) {
            profileUpdate.saved_address = {
              name: signupData.name || loggedInUser?.name || '',
              email: signupData.email || '',
              phone: identifier.length === 10 ? identifier : '',
              address: signupData.address || '',
              city: signupData.city || '',
              state: signupData.state || '',
              postal_code: signupData.postal_code || '',
            };

            // Also save to per-user localStorage
            const userId = loggedInUser?.id || identifier;
            try {
              localStorage.setItem(
                `cartify_saved_address_${userId}`,
                JSON.stringify(profileUpdate.saved_address)
              );
            } catch (e) {}
          }

          if (Object.keys(profileUpdate).length > 0) {
            await api.updateProfile(profileUpdate);
          }
        } catch (profileErr) {
          console.warn('Could not save signup profile data:', profileErr);
          // Non-blocking — user is still logged in
        }
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.sendOtp(identifier);
      setResendCooldown(30);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const handleAutoFill = () => {
    setOtp('123456');
    setError('');
  };

  return (
    <div className="container section">
      <div className="auth-wrapper">
        <button
          onClick={() => navigate('/login')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={14} /> Change Number / Email
        </button>

        <div className="auth-header">
          <div
            className="brand-logo-icon"
            style={{ width: '44px', height: '44px', margin: '0 auto 1rem' }}
          >
            <KeyRound size={24} />
          </div>
          <h2>Enter Verification Code</h2>
          <p>
            We sent a 6-digit verification code to <br />
            <strong>{identifier}</strong>
          </p>
        </div>

        {/* NEW USER SIGN-UP BANNER */}
        {isNewUser && signupData?.name && (
          <div
            style={{
              backgroundColor: 'var(--success-light)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#14532d',
            }}
          >
            <UserPlus size={16} color="var(--success)" />
            <span>
              Creating account for <strong>{signupData.name}</strong>. Verify OTP to complete sign-up.
            </span>
          </div>
        )}

        <div className="demo-otp-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', background: 'var(--primary-light)', borderColor: 'rgba(37, 99, 235, 0.2)', color: 'var(--text-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--primary)" />
            <span><strong>Verification Code:</strong> <code>123456</code></span>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            style={{
              fontSize: '0.8rem',
              color: 'var(--primary)',
              textDecoration: 'underline',
              fontWeight: 600,
              padding: 0,
            }}
          >
            Click here to auto-fill 123456
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <input
              type="text"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setOtp(val);
                if (error) setError('');
              }}
              style={{
                fontSize: '1.8rem',
                letterSpacing: '0.5rem',
                textAlign: 'center',
                fontWeight: 700,
                width: '100%',
                maxWidth: '240px',
                padding: '0.6rem 0',
              }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading
              ? 'Verifying...'
              : isNewUser
              ? 'Verify & Create Account'
              : 'Verify & Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Didn't receive code? </span>
          {resendCooldown > 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>Resend in {resendCooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
