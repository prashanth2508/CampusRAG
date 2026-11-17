import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

// Core Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import ChatPage from './pages/ChatPage';
import SavedAnswersPage from './pages/SavedAnswersPage';
import AdminDashboard from './pages/AdminDashboard';
import DocumentManagement from './pages/DocumentManagement';
import UploadDocument from './pages/UploadDocument';
import AcademicManagement from './pages/AcademicManagement';
import DocumentSearchPage from './pages/DocumentSearchPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs text-[var(--ink-soft)] font-mono">Loading CampusRAG...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public Route wrapper (redirects to home/dashboard if user already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs text-[var(--ink-soft)] font-mono">Loading CampusRAG...</div>;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin, login } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs text-[var(--ink-soft)] font-mono">Loading CampusRAG...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-[var(--paper)] text-[var(--ink)] animate-fade-in">
        <div className="max-w-md w-full courseit-card p-6 sm:p-8 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Admin Authorization Required</h2>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              You are currently signed in as <span className="font-semibold text-[var(--ink)]">{user.email}</span> ({user.role || 'student'}). Uploading and managing college documents requires an Administrator account.
            </p>
          </div>

          {switchError && (
            <p className="text-xs text-rose-500">{switchError}</p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={async () => {
                setSwitching(true);
                setSwitchError('');
                try {
                  await login('admin@campusrag.edu', 'admin123');
                } catch (e) {
                  setSwitchError('Failed to sign in as admin. Check credentials or backend.');
                } finally {
                  setSwitching(false);
                }
              }}
              disabled={switching}
              className="btn-moss px-5 py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{switching ? 'Signing in as Admin...' : '1-Click Switch to Admin'}</span>
            </button>
            <Link
              to="/"
              className="btn-pill-outline px-5 py-2.5 text-xs font-semibold inline-flex items-center justify-center text-center cursor-pointer"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans antialiased selection:bg-[#6d8434]/20 selection:text-[#6d8434]">
      <Navbar />
      <main>
        <Routes>
          {/* Public Authentication Routes (redirects away if already logged in) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Student Protected Routes */}
          <Route path="/" element={<ProtectedRoute><StudentHome /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/saved-answers" element={<ProtectedRoute><SavedAnswersPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><DocumentSearchPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/documents" element={<AdminRoute><DocumentManagement /></AdminRoute>} />
          <Route path="/admin/upload" element={<AdminRoute><UploadDocument /></AdminRoute>} />
          <Route path="/admin/academic" element={<AdminRoute><AcademicManagement /></AdminRoute>} />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
