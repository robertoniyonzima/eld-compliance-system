// src/components/auth/RegisterForm.jsx - VERSION MODERNE CORRIGÉE
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    userType: 'driver',
    phoneNumber: '',
    licenseNumber: '',
    licenseState: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focused, setFocused] = useState({});
  const { register } = useAuth();

  const userTypes = [
    { 
      value: 'driver', 
      label: 'Driver', 
      description: 'Drive and manage logs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'manager', 
      label: 'Manager', 
      description: 'Fleet management & reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      value: 'admin', 
      label: 'Administrator', 
      description: 'Full system access',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess('Account created successfully! Pending administrator approval.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        userType: 'driver',
        phoneNumber: '',
        licenseNumber: '',
        licenseState: ''
      });
    } catch (err) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-xl animate-shake">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-300 text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* First Name and Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            First Name <span className="text-red-400">*</span>
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.firstName ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, firstName: true})}
              onBlur={() => setFocused({...focused, firstName: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="John"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            Last Name <span className="text-red-400">*</span>
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.lastName ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, lastName: true})}
              onBlur={() => setFocused({...focused, lastName: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="Doe"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            Email <span className="text-red-400">*</span>
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.email ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, email: true})}
              onBlur={() => setFocused({...focused, email: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="john@example.com"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
       
       {formData.userType === 'driver' && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300 ml-1">
              Home Terminal Address
            </label>
            <input
              type="text"
              name="homeTerminalAddress"
              value={formData.homeTerminalAddress}
              onChange={handleChange}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                      focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                      transition-all duration-300 text-white placeholder-gray-500
                      hover:bg-white/10 focus:bg-white/10"
              placeholder="123 Main St, Los Angeles, CA 90001"
              disabled={loading}
            />
          </div>
        )}


        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            Phone Number
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.phoneNumber ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, phoneNumber: true})}
              onBlur={() => setFocused({...focused, phoneNumber: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="+1 234 567 8900"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-300 ml-1">
          Account Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {userTypes.map((type) => (
            <label
              key={type.value}
              className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105
                ${formData.userType === type.value 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20' 
                  : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <input
                type="radio"
                name="userType"
                value={type.value}
                checked={formData.userType === type.value}
                onChange={handleChange}
                className="sr-only"
                disabled={loading}
              />
              <div className="flex items-center gap-3 mb-2">
                <div className={`${formData.userType === type.value ? 'text-indigo-400' : 'text-gray-400'}`}>
                  {type.icon}
                </div>
                <span className={`font-semibold ${formData.userType === type.value ? 'text-white' : 'text-gray-300'}`}>
                  {type.label}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {type.description}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* License Info (only for drivers) */}
      {formData.userType === 'driver' && (
        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300 ml-1">
              License Number
            </label>
            <div className={`relative group/input transition-all duration-300 ${focused.licenseNumber ? 'scale-[1.01]' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                onFocus={() => setFocused({...focused, licenseNumber: true})}
                onBlur={() => setFocused({...focused, licenseNumber: false})}
                className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                         focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                         transition-all duration-300 text-white placeholder-gray-500
                         hover:bg-white/10 focus:bg-white/10"
                placeholder="ABC123456"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300 ml-1">
              License State
            </label>
            <div className={`relative group/input transition-all duration-300 ${focused.licenseState ? 'scale-[1.01]' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
              <input
                type="text"
                name="licenseState"
                value={formData.licenseState}
                onChange={handleChange}
                onFocus={() => setFocused({...focused, licenseState: true})}
                onBlur={() => setFocused({...focused, licenseState: false})}
                className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                         focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 
                         transition-all duration-300 text-white placeholder-gray-500
                         hover:bg-white/10 focus:bg-white/10"
                placeholder="CA"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            Password <span className="text-red-400">*</span>
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.password ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, password: true})}
              onBlur={() => setFocused({...focused, password: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="Min. 8 characters"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300 ml-1">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <div className={`relative group/input transition-all duration-300 ${focused.passwordConfirm ? 'scale-[1.01]' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover/input:opacity-15 blur-xl transition-opacity duration-500"></div>
            <input
              type="password"
              name="passwordConfirm"
              required
              value={formData.passwordConfirm}
              onChange={handleChange}
              onFocus={() => setFocused({...focused, passwordConfirm: true})}
              onBlur={() => setFocused({...focused, passwordConfirm: false})}
              className="relative w-full px-5 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl 
                       focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 
                       transition-all duration-300 text-white placeholder-gray-500
                       hover:bg-white/10 focus:bg-white/10"
              placeholder="Repeat password"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="relative w-full py-4 rounded-2xl font-bold text-base overflow-hidden group/btn
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                 hover:scale-[1.02] active:scale-[0.98] mt-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-cyan-600 to-blue-600 
                    group-hover/btn:from-indigo-500 group-hover/btn:via-cyan-500 group-hover/btn:to-blue-500
                    transition-all duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-0 
                    group-hover/btn:opacity-100 blur-xl transition-opacity duration-500"></div>
        <span className="relative flex items-center justify-center gap-2 text-white">
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Create Account</span>
            </>
          )}
        </span>
      </button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </form>
  );
};

export default RegisterForm;