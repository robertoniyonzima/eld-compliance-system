
// src/pages/Login.jsx - PAGE COMPLÈTE MODERNE
import { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Side - Hero Image & Branding */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center space-y-8 p-8">
            <div className="relative group w-full">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 animate-pulse-slow"></div>
              
              <div className="relative rounded-3xl overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700">
                <img 
                  src="/src/assets/photo2.jpg" 
                  alt="ELD Pro Fleet Management"
                  className="w-full h-auto object-cover"
                  style={{ minHeight: '500px', maxHeight: '600px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 right-8 text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                    <span className="text-sm font-semibold text-emerald-400">Live Tracking System Active</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold mb-2">Enterprise Fleet Management</h3>
                  <p className="text-gray-300 text-base">Real-time compliance monitoring and intelligent logistics optimization</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <span className="text-xs text-gray-400">FMCSA Certified</span>
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <span className="text-xs text-gray-400">ISO 9001</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-6 max-w-2xl animate-fadeIn">
              <h2 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">
                Professional ELD Solution
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Industry-leading electronic logging device platform with comprehensive FMCSA compliance monitoring, advanced analytics, and seamless fleet coordination
              </p>
              <div className="flex items-center justify-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-400">24/7</div>
                  <div className="text-sm text-gray-500 mt-1">Support</div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400">99.9%</div>
                  <div className="text-sm text-gray-500 mt-1">Uptime</div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">100%</div>
                  <div className="text-sm text-gray-500 mt-1">Compliant</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full lg:col-span-2 max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              
              <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
                
                {/* Header */}
                <div className="text-center mb-8 space-y-4">
                  <div className="relative inline-block group/logo">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur-xl opacity-40 group-hover/logo:opacity-60 transition-opacity"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl mx-auto 
                                  flex items-center justify-center shadow-2xl transform group-hover/logo:scale-110 
                                  transition-transform duration-300 border border-white/20">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                      ELD Pro
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                      FMCSA Compliance Management System
                    </p>
                  </div>
                </div>

                {/* Login Form Component */}
                <LoginForm />

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-slate-900/60 text-gray-500 text-sm font-medium">
                      or
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    New to ELD Pro?{' '}
                    <a 
                      href="/register" 
                      className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 
                               font-bold hover:from-indigo-300 hover:to-cyan-300 transition-all duration-300"
                    >
                      Create Account
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <p className="text-gray-600 text-sm font-medium">
          © 2025 ELD Pro System. FMCSA Compliant. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.15; }
          50% { transform: translateY(-25px); opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;