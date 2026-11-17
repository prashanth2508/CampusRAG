import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Calendar, 
  Moon, 
  Sun, 
  Key, 
  ExternalLink, 
  Check, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Camera,
  ChevronDown,
  Phone,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PRESET_AVATARS = [
  { id: '1', name: 'Scholar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Scholar' },
  { id: '2', name: 'Coder', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Coder' },
  { id: '3', name: 'Researcher', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Researcher' },
  { id: '4', name: 'Engineer', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Engineer' },
  { id: '5', name: 'Innovator', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Innovator' },
  { id: '6', name: 'Analyst', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Analyst' },
];

const ProfilePage = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'CSE',
    semester: '5',
    bio: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('campusrag_gemini_key') || '');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'CSE',
        semester: user.semester || '5',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  if (!user) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg('New passwords do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        semester: formData.semester,
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const updated = await updateProfile(payload);
      setSuccessMsg(
        isAdmin 
          ? 'Admin username, credentials & phone number updated successfully!'
          : 'Profile updated successfully!'
      );
      setIsEditing(false);
      setShowPasswordChange(false);
      setFormData(prev => ({
        ...prev,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('campusrag_gemini_key', geminiKey.trim());
    } else {
      localStorage.removeItem('campusrag_gemini_key');
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6 animate-fade-in text-[var(--ink)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)] flex items-center gap-2">
            <span>{isAdmin ? 'Administrator Settings & Profile' : 'Account & Profile'}</span>
            {isAdmin && <Shield className="w-5 h-5 text-amber-500 shrink-0" />}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
            {isAdmin 
              ? 'Update your admin username, password, phone number, and access credentials.'
              : 'Manage your personal academic identity, syllabus preferences, and settings.'}
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 btn-moss text-xs font-semibold shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Edit Admin Details' : 'Edit Profile'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setErrorMsg('');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 btn-pill-outline text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Admin Highlight Banner */}
      {isAdmin && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold block sm:inline">Active Administrator: </span>
            Aap yahan se apna admin username, login email, mobile phone number aur password directly change kar sakte hain. Updates turant SQL database me save honge.
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/40 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="courseit-card p-6 sm:p-7 space-y-6">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#6d8434]/40 shadow-sm"
                />
              ) : (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-[var(--line)] ${
                  isAdmin 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-[var(--lime-soft)] text-[var(--pill-ink)]'
                }`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-[var(--ink)] flex items-center gap-2">
                <span>{user.name}</span>
                {isAdmin ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 uppercase">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] font-bold uppercase">
                    Student
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--ink-soft)] font-mono">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-[var(--ink-soft)] font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#6d8434]" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right text-[11px] text-[var(--ink-soft)]">
            <span className="block font-mono">System Status: Active</span>
            <span className="font-mono text-[10px]">
              {user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString()}` : 'Verified Account'}
            </span>
          </div>
        </div>

        {/* View Mode vs. Edit Mode */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Bio */}
            {user.bio && (
              <div className="p-3.5 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.05]">
                <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">About / Bio</span>
                <p className="text-xs text-[var(--ink)] leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.05] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Phone Number</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {user.phone || 'Not added'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.05] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Login Username / Email</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {user.email}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.05] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Department</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.department || 'CSE'}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/[0.05] space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Database Engine</span>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  SQL (Live)
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Editable Form */
          <form onSubmit={handleProfileSubmit} className="space-y-5 animate-fade-in">
            <div className="space-y-4">
              
              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--ink)]">
                  Choose Avatar Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                      className={`w-10 h-10 rounded-full border-2 p-0.5 shrink-0 transition-all cursor-pointer ${
                        formData.avatarUrl === av.url
                          ? 'border-[#6d8434] scale-105 shadow-sm'
                          : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full rounded-full" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border shrink-0 ${
                      !formData.avatarUrl ? 'border-[#6d8434] text-[#6d8434]' : 'border-[var(--line)] text-[var(--ink-soft)]'
                    }`}
                  >
                    Initials Only
                  </button>
                </div>
              </div>

              {/* Username / Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6d8434]" />
                    <span>{isAdmin ? 'Admin Name / Username' : 'Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter username or full name"
                    className="w-full px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                  />
                </div>

                {/* Login Email / Username */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6d8434]" />
                    <span>Login Email / Account ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@campusrag.edu"
                    className="w-full px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[var(--ink-soft)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#6d8434]" />
                  <span>Mobile Phone Number (Can be used to log in)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210 (Apna mobile number yahan dalein)"
                    className="w-full px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] outline-none focus:border-[#6d8434] font-mono"
                  />
                </div>
                <p className="text-[10px] text-[var(--ink-soft)] pl-2">
                  Aap login karte waqt email ki jagah is phone number ka use kar sakte hain.
                </p>
              </div>

              {/* Department & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="AI & DS">Artificial Intelligence & Data Science</option>
                      <option value="CSBS">Computer Science & Business Systems</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="EEE">Electrical & Electronics (EEE)</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="Civil">Civil Engineering</option>
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
                        <option key={s} value={s.toString()}>Semester {s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                  About / Bio / Designation
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={isAdmin ? "e.g. Chief Academic Administrator & Head of Evaluations" : "e.g. Undergrad student preparing for exams..."}
                  className="w-full px-3.5 py-2 bg-[var(--surface)] border border-[var(--line-strong)] rounded-2xl text-xs text-[var(--ink)] outline-none focus:border-[#6d8434] resize-none"
                />
              </div>

              {/* Password Change Toggle */}
              <div className="pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-xs text-[#6d8434] dark:text-[#b8c460] font-semibold hover:underline flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{showPasswordChange ? 'Hide Password Change' : 'Change Password / Set New Password'}</span>
                </button>

                {showPasswordChange && (
                  <div className="mt-3 p-4 bg-[var(--surface)] border border-[var(--line-strong)] rounded-2xl space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-full text-xs text-[var(--ink)] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="At least 6 characters"
                          className="w-full px-3.5 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-full text-xs text-[var(--ink)] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-full text-xs text-[var(--ink)] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-6 btn-moss text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving Changes...' : (isAdmin ? 'Save Admin Credentials' : 'Save Profile Changes')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 btn-pill-outline text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Gemini API Key Box */}
        <div className="p-4 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Custom Gemini API Key</h3>
              <p className="text-[11px] text-slate-400">
                Optional client-side key override for custom quota.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-2">
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AQ... or AIzaSy... (Saved in local storage)"
                className="w-full pl-8 pr-20 py-1.5 bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {keySaved && <Check className="w-3 h-3 text-emerald-500" />}
                <span>{keySaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Theme Settings */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Appearance</h4>
            <p className="text-[11px] text-slate-400">Toggle light or dark theme</p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200/70 dark:hover:bg-white/[0.09] text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200/60 dark:border-white/[0.08] transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
