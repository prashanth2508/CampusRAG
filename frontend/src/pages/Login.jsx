import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  X, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password / OTP State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  // Redirect immediately if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      setSuccessMsg(`Welcome back, ${loggedUser.name}!`);
      setTimeout(() => {
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 400);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot Password: Request OTP to Email
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail.trim() });
      setForgotSuccess(res.data.message || 'OTP sent successfully!');
      setEmailSentNotice(Boolean(res.data.emailSent));
      if (res.data.otpCode) {
        setDevOtpHint(res.data.otpCode);
      } else {
        setDevOtpHint('');
      }
      setResendCooldown(60); // 60s cooldown
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Failed to send OTP. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password: Verify OTP & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setForgotError('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await authAPI.resetPassword({
        email: forgotEmail.trim(),
        otp: otpCode.trim(),
        newPassword
      });
      setForgotSuccess(res.data.message || 'Password reset successfully!');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword(newPassword);
        setSuccessMsg('Password reset complete! You can now log in.');
      }, 1500);
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Invalid or expired OTP code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-[var(--paper)] text-[var(--ink)] animate-fade-in">
      <div className="w-full max-w-sm courseit-card p-7 sm:p-8 space-y-5 shadow-[0_20px_50px_-20px_rgba(22,49,92,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-[#b8c460] dark:text-[#576b27]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            Welcome to Campus<span className="text-[#6d8434] dark:text-[#b8c460]">RAG</span>
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            Sign in to access official notes & AI academic insights
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[var(--err-bg)] border border-rose-300 dark:border-rose-900/40 rounded-2xl flex items-center gap-2 text-xs text-[var(--err-fg)] animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Single Sign-On Button */}
        <div className="space-y-2">
          <GoogleLoginButton onError={(msg) => setError(msg)} label="Continue with Google" />
          
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[var(--line)] w-full" />
            <span className="bg-[var(--surface)] px-2.5 text-[10px] uppercase font-mono tracking-wider text-[var(--ink-soft)] absolute">
              or sign in with email / phone
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Email, Phone, or Username
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email, phone, or username"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError('');
                  setForgotSuccess('');
                  setForgotStep(1);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-medium text-[#6d8434] dark:text-[#b8c460] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 btn-moss text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-[var(--ink-soft)] pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#6d8434] dark:text-[#b8c460] hover:underline">
            Create account
          </Link>
        </p>

      </div>

      {/* Forgot Password with OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm courseit-card p-6 sm:p-7 space-y-4 shadow-2xl relative">
            
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-9 h-9 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] flex items-center justify-center mb-1">
                <KeyRound className="w-4 h-4 text-[#6d8434]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--ink)]">
                Reset Password with OTP
              </h3>
              <p className="text-xs text-[var(--ink-soft)]">
                {forgotStep === 1 
                  ? 'Enter your registered email to receive a 6-digit verification OTP'
                  : 'Enter the verification OTP and set your new password'}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 bg-[var(--err-bg)] border border-rose-300 dark:border-rose-900/40 rounded-xl flex items-center gap-2 text-xs text-[var(--err-fg)] animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Email Dispatch Notice */}
            {emailSentNotice && forgotStep === 2 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300 animate-fade-in">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Verification Code Sent!</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300/90 leading-relaxed">
                    Check your inbox (and spam folder) for <strong>{forgotEmail}</strong>.
                  </p>
                </div>
              </div>
            )}

            {devOtpHint && forgotStep === 2 && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span>Verification OTP Code:</span>
                <span className="font-mono font-bold tracking-widest text-sm bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 rounded">
                  {devOtpHint}
                </span>
              </div>
            )}

            {/* Step 1: Send OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                    Registered Email or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@campusrag.edu"
                      className="w-full pl-9 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 btn-moss text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{forgotLoading ? 'Generating OTP...' : 'Send 6-Digit OTP'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP & Set New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                    6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className="w-full px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] font-mono tracking-widest text-center outline-none focus:border-[#6d8434]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-9 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[var(--ink-soft)]">
                    Didn't get the code?
                  </span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || forgotLoading}
                    onClick={() => handleRequestOTP()}
                    className="font-semibold text-[#6d8434] dark:text-[#b8c460] hover:underline cursor-pointer disabled:opacity-50 disabled:hover:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend OTP to Email'}
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-2 px-3.5 btn-pill-outline text-xs font-medium cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 btn-moss text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>{forgotLoading ? 'Verifying...' : 'Reset Password'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
