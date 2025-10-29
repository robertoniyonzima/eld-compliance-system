// src/components/auth/LoginForm.jsx - VERSION AVEC REDIRECTION INTELLIGENTE
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState({ email: false, password: false });
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 FONCTION POUR DÉTERMINER LA BONNE REDIRECTION
  const getDashboardRoute = (userType) => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'driver':
      default:
        return '/driver';
    }
  };

  // 🔥 REDIRECTION INTELLIGENTE APRÈS LOGIN
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User authenticated, redirecting...', user);
      
      const from = location.state?.from?.pathname || getDashboardRoute(user.user_type);
      console.log('🎯 Redirecting to:', from);
      
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    console.log('🔐 Attempting login with:', credentials.email);

    try {
      await login(credentials.email, credentials.password);
      console.log('✅ Login successful!');
      // 🔥 LA REDIRECTION EST MAINTENANT GÉRÉE DANS LE useEffect CI-DESSUS
      
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      let errorMessage = 'Authentication failed. Please check your credentials.';
      
      if (err.response?.data) {
        errorMessage = err.response.data.detail || err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCredentials(prev => ({ ...prev, password: '' }));
      
    } finally {
      setLoading(false);
    }
  };

  // Test credentials - CORRIGEZ L'EMAIL DU DRIVER
  const fillTestCredentials = (type) => {
    const testUsers = {
      driver: { email: 'driver2@test.com', password: 'TestPass123!' },
      manager: { email: 'manager1@test.com', password: 'TestPass123!' },
      admin: { email: 'admin@test.com', password: 'password123' }
    };
    
    const testUser = testUsers[type];
    if (testUser) {
      setCredentials(testUser);2
      setError('');
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6" 
      noValidate
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Authentication Error</h3>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Email Address
        </label>
        <div className={`relative group/input transition-all duration-300 ${focused.email ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover/input:opacity-10 blur-xl transition-opacity duration-500"></div>
          <input
            type="email"
            required
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onFocus={() => setFocused({...focused, email: true})}
            onBlur={() => setFocused({...focused, email: false})}
            className="relative w-full px-5 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                   transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400
                   hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-50"
            placeholder="your@email.com"
            disabled={loading}
            autoComplete="email"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Password
        </label>
        <div className={`relative group/input transition-all duration-300 ${focused.password ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl opacity-0 group-hover/input:opacity-10 blur-xl transition-opacity duration-500"></div>
          <input
            type="password"
            required
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => setFocused({...focused, password: true})}
            onBlur={() => setFocused({...focused, password: false})}
            className="relative w-full px-5 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                   transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400
                   hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 disabled:opacity-50"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer group/check">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-blue-600 
                     focus:ring-2 focus:ring-blue-500/20 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          />
          <span className={`text-slate-600 dark:text-slate-400 group-hover/check:text-slate-700 dark:group-hover/check:text-slate-300 transition-colors ${loading ? 'opacity-50' : ''}`}>
            Remember me
          </span>
        </label>
        <a 
          href="/forgot-password"
          className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Forgot password?
        </a>
      </div>
      
      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading || !credentials.email || !credentials.password}
        className="relative w-full py-4 rounded-2xl font-bold text-base overflow-hidden group/btn
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 
                    group-hover/btn:from-blue-700 group-hover/btn:to-indigo-800
                    transition-all duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 
                    group-hover/btn:opacity-100 blur-xl transition-opacity duration-500"></div>
        <span className="relative flex items-center justify-center gap-2 text-white">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </>
          )}
        </span>
      </button>

      {/* Quick Test Buttons */}
      {process.env.NODE_ENV === 'development' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 
                    border border-slate-200 dark:border-slate-700 backdrop-blur-xl p-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
          <h4 className="relative text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Access (Development Mode)
          </h4>
          <div className="relative grid grid-cols-3 gap-2">
            {['driver', 'manager', 'admin'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => fillTestCredentials(type)}
                disabled={loading}
                className="px-3 py-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-xl 
                       border border-slate-200 dark:border-slate-700 hover:border-blue-500/30
                       rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium
                       transition-all duration-300 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       capitalize"
              >
                {type}
              </button>
            ))}
          </div>
          <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            Fill credentials for testing
          </p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;