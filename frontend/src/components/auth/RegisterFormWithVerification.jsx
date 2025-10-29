// src/components/auth/RegisterFormWithVerification.jsx - WITH EMAIL VERIFICATION
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmailVerification from './EmailVerification';

const API_BASE = 'http://localhost:8000/api';

const RegisterFormWithVerification = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Email Verification, 3: Success
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    userType: 'driver',
    phoneNumber: '',
    licenseNumber: '',
    licenseState: '',
    homeTerminalAddress: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userTypes = [
    { value: 'driver', label: 'Driver', icon: '🚛', description: 'Drive and manage logs' },
    { value: 'manager', label: 'Manager', icon: '👔', description: 'Fleet management' },
    { value: 'admin', label: 'Admin', icon: '⚙️', description: 'Full system access' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Send verification code
      await axios.post(`${API_BASE}/auth/send-verification-code/`, {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`
      });

      setStep(2); // Move to verification step
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    try {
      // Verify code
      await axios.post(`${API_BASE}/auth/verify-email-code/`, {
        email: formData.email,
        code
      });

      // Register user
      const registerData = {
        username: formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType,
        phone_number: formData.phoneNumber,
        license_number: formData.licenseNumber,
        license_state: formData.licenseState,
        home_terminal_address: formData.homeTerminalAddress,
        company_name: formData.companyName
      };

      await axios.post(`${API_BASE}/auth/register-verified/`, registerData);

      setStep(3); // Success
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post(`${API_BASE}/auth/send-verification-code/`, {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`
      });
    } catch (err) {
      console.error('Failed to resend code');
    }
  };

  if (step === 2) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
        <EmailVerification
          email={formData.email}
          onVerified={handleVerifyCode}
          onResend={handleResendCode}
        />
        <div className="text-center mt-6">
          <button
            onClick={() => setStep(1)}
            className="text-slate-600 dark:text-slate-400 hover:underline text-sm"
          >
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Registration Successful!
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your account has been created and is pending approval by an administrator.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You'll receive an email notification once your account is approved. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Account Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {userTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, userType: type.value })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.userType === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{type.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Driver-specific fields */}
      {formData.userType === 'driver' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                placeholder="TX-12345678"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                License State *
              </label>
              <input
                type="text"
                name="licenseState"
                value={formData.licenseState}
                onChange={handleChange}
                required
                maxLength={2}
                placeholder="TX"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
              />
            </div>
          </div>
          
          {/* Home Terminal Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Home Terminal Address *
            </label>
            <textarea
              name="homeTerminalAddress"
              value={formData.homeTerminalAddress}
              onChange={handleChange}
              required
              rows={3}
              placeholder="123 Main St, Los Angeles, CA 90001"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your home terminal or base location address
            </p>
          </div>
        </>
      )}

      {/* Company Name */}
      {(formData.userType === 'manager' || formData.userType === 'admin') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Sending verification code...' : 'Continue to Verification'}
      </button>

      <div className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterFormWithVerification;
