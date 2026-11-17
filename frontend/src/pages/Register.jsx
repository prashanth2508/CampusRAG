import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Key, ArrowRight, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'CSE',
    semester: '5',
    role: 'student',
    admin_secret: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, register } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department,
        semester: formData.semester,
        role: formData.role,
        admin_secret: formData.admin_secret
      });
      setSuccessMsg(`Account created! Welcome, ${user.name}!`);
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 pb-12 bg-[var(--paper)] text-[var(--ink)] animate-fade-in">
      <div className="w-full max-w-sm courseit-card p-7 sm:p-8 space-y-4 shadow-[0_20px_50px_-20px_rgba(22,49,92,0.3)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-[#b8c460] dark:text-[#576b27]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            Create an Account
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            Join Campus<span className="text-[#6d8434] dark:text-[#b8c460]">RAG</span> for verified academic solutions
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
          <GoogleLoginButton onError={(msg) => setError(msg)} label="Sign up with Google" />
          
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[var(--line)] w-full" />
            <span className="bg-[var(--surface)] px-2.5 text-[10px] uppercase font-mono tracking-wider text-[var(--ink-soft)] absolute">
              or register with details
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Full Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@college.edu"
                className="w-full pl-10 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                Department
              </label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none cursor-pointer"
                >
                  <option value="CSE">CSE</option>
                  <option value="AI & DS">AI & DS</option>
                  <option value="CSBS">CSBS</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                Semester
              </label>
              <div className="relative">
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s.toString()}>Sem {s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Account Role
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full appearance-none px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="admin">College Administrator</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {formData.role === 'admin' && (
            <div className="p-3 bg-[var(--lime-soft)]/40 border border-[#6d8434]/20 rounded-2xl space-y-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--pill-ink)]">
                Admin Secret Key
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-[#6d8434] absolute left-3 top-3" />
                <input
                  type="password"
                  value={formData.admin_secret}
                  onChange={(e) => setFormData({ ...formData, admin_secret: e.target.value })}
                  placeholder="campusrag-admin-key-9988"
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 btn-moss text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-[var(--ink-soft)]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#6d8434] dark:text-[#b8c460] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
