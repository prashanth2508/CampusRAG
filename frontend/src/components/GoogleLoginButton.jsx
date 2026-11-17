import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GoogleLoginButton = ({ onError, label = "Continue with Google", role = "student", adminSecret = null }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isGsiRendered, setIsGsiRendered] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      console.warn("No Google credential returned");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await googleLogin({
        credential: response.credential,
        role,
        adminSecret
      });
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Google authentication failed";
      if (onError) onError(msg);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let checkInterval = null;

    const setupGoogle = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          const isDark = document.documentElement.classList.contains('dark');
          
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
          });

          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(
            googleBtnContainerRef.current,
            {
              theme: isDark ? 'filled_black' : 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'center',
            }
          );

          // Verify if iframe was inserted by GSI
          setTimeout(() => {
            if (googleBtnContainerRef.current?.querySelector('iframe')) {
              setIsGsiRendered(true);
            }
          }, 250);

        } catch (err) {
          console.warn("GSI initialization notice:", err);
          setIsGsiRendered(false);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          setupGoogle();
        } else if (attempts > 15) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [role, adminSecret]);

  // Fallback explicit Google Account Chooser via OAuth2 Popup
  const handleCustomButtonClick = () => {
    setErrorMsg('');
    if (window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const user = await googleLogin({
                  accessToken: tokenResponse.access_token,
                  role,
                  adminSecret
                });
                if (user.role === 'admin') {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/');
                }
              } catch (e) {
                const msg = e.response?.data?.detail || "Google authentication failed.";
                if (onError) onError(msg);
                setErrorMsg(msg);
              } finally {
                setLoading(false);
              }
            } else if (tokenResponse?.error) {
              setLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setErrorMsg(`Google sign-in error: ${tokenResponse.error}`);
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: (err) => {
            setLoading(false);
            console.warn("Google OAuth2 error:", err);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        setLoading(false);
        console.warn("OAuth2 client error:", e);
      }
    }

    // If Google GSI library is still loading
    setErrorMsg("Google Sign-In is initializing. Please check your internet connection.");
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Container where official Google GSI Button renders */}
      <div 
        ref={googleBtnContainerRef} 
        className={`w-full flex justify-center min-h-[44px] ${isGsiRendered ? 'block' : 'hidden'}`}
      />

      {/* Branded Google Sign-In button fallback (shown when GSI is loading or offline) */}
      {!isGsiRendered && (
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white dark:bg-[#121620] hover:bg-slate-50 dark:hover:bg-[#181d2a] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-white/[0.1] rounded-full text-xs font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{loading ? 'Connecting to Google...' : label}</span>
        </button>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 w-full animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
