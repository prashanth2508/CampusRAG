import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  BookMarked, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  User,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Floating Pill Header - CourseIt signature style */}
      <header className="fixed inset-x-0 top-2.5 sm:top-4 z-50 flex justify-center px-2.5 sm:px-4 pointer-events-none">
        <div className="flex w-full max-w-[880px] items-center justify-between gap-1.5 sm:gap-3 rounded-full courseit-nav-pill py-1.5 pr-1.5 pl-3 sm:pl-4 transition-all duration-300 pointer-events-auto">
          
          {/* Logo with CourseIt styling */}
          <Link to="/" className="inline-flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b8c460] dark:text-[#576b27]" />
            </div>
            <span className="font-semibold text-sm sm:text-[1.12rem] tracking-tight text-[var(--ink)]">
              Campus<span className="text-[#6d8434] dark:text-[#b8c460] font-bold">RAG</span>
              <span className="text-[10px] ml-1.5 font-mono px-2 py-0.5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] uppercase font-semibold hidden md:inline">
                Academic
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-6 text-[0.88rem] text-[var(--ink-soft)] font-medium">
            <Link 
              to="/" 
              className={`transition-colors hover:text-[var(--ink)] ${isActive('/') ? 'text-[var(--ink)] font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/chat" 
              className={`transition-colors hover:text-[var(--ink)] flex items-center gap-1.5 ${isActive('/chat') ? 'text-[var(--ink)] font-semibold' : ''}`}
            >
              <span>AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6d8434] dark:bg-[#b8c460] animate-pulse" />
            </Link>
            <Link 
              to="/search" 
              className={`transition-colors hover:text-[var(--ink)] ${isActive('/search') ? 'text-[var(--ink)] font-semibold' : ''}`}
            >
              Repository
            </Link>
            <Link 
              to="/saved-answers" 
              className={`transition-colors hover:text-[var(--ink)] ${isActive('/saved-answers') ? 'text-[var(--ink)] font-semibold' : ''}`}
            >
              Saved Answers
            </Link>
            <Link 
              to="/admin/dashboard" 
              className={`transition-colors font-semibold ${
                isAdmin 
                  ? 'text-amber-600 dark:text-amber-400 hover:opacity-80' 
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              } ${isActive('/admin') ? 'underline underline-offset-4' : ''}`}
            >
              Admin
            </Link>
          </nav>

          {/* Right Controls: Theme Toggle & User Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            
            {/* Theme Toggle Button - CourseIt round pill style */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--muted)] transition-all cursor-pointer shadow-[inset_0_0_0_1px_var(--line)]"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-[#b8c460]" />
              ) : (
                <Moon className="w-4 h-4 text-[#6d8434]" />
              )}
            </button>

            {/* User State */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-[var(--surface)] hover:bg-[var(--muted)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)] transition-all cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] flex items-center justify-center text-[10px] font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline text-[0.82rem]">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[var(--surface)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3),0_0_0_1px_var(--line)] py-2 text-xs z-50 animate-fade-in">
                    <div className="px-3.5 py-2 border-b border-[var(--line)]">
                      <p className="font-semibold text-[var(--ink)] truncate">{user.name}</p>
                      <p className="text-[11px] text-[var(--ink-soft)] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] uppercase font-semibold">
                        {user.role} {user.department ? `· ${user.department}` : ''}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3.5 py-2 text-[var(--ink)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/saved-answers"
                      className="flex items-center gap-2 px-3.5 py-2 text-[var(--ink)] hover:bg-[var(--muted)] transition-colors"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                      <span>Saved Answers</span>
                    </Link>

                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-[var(--muted)] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Dashboard {isAdmin ? '' : '(Switch)'}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-[var(--muted)] transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-moss px-3.5 sm:px-4 py-1.5 text-xs font-medium inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3 hidden sm:inline" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--muted)] shadow-[inset_0_0_0_1px_var(--line)]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-3 top-16 z-50 md:hidden rounded-3xl bg-[var(--surface)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_var(--line)] p-4 space-y-3 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="space-y-1 text-xs font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${isActive('/') ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)]' : 'text-[var(--ink)] hover:bg-[var(--muted)]'}`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${isActive('/chat') ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)]' : 'text-[var(--ink)] hover:bg-[var(--muted)]'}`}
              >
                <MessageSquare className="w-4 h-4 text-[#6d8434]" />
                <span>AI Assistant</span>
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${isActive('/search') ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)]' : 'text-[var(--ink)] hover:bg-[var(--muted)]'}`}
              >
                <Search className="w-4 h-4" />
                <span>Repository</span>
              </Link>
              <Link
                to="/saved-answers"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${isActive('/saved-answers') ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)]' : 'text-[var(--ink)] hover:bg-[var(--muted)]'}`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Saved Answers</span>
              </Link>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl flex items-center gap-2 text-amber-600 dark:text-amber-400 ${isActive('/admin') ? 'bg-amber-500/10' : 'hover:bg-[var(--muted)]'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard {isAdmin ? '' : '(Switch)'}</span>
              </Link>
            </div>

            {!user && (
              <div className="pt-2 border-t border-[var(--line)] flex gap-2">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium rounded-full btn-pill-outline"
                >
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium rounded-full btn-moss"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
