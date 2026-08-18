import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import { logActivity } from '../utils/activityLogger';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';


export default function Login() {
  const navigate = useNavigate();
  const { setUserContext } = useContext(UserContext);
  
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpFlow, setIsOtpFlow] = useState(false);

  const handleLoginSuccess = (userData, token) => {
    localStorage.removeItem('isDemo');
    localStorage.setItem('token', token);
    setUserContext(userData);
    window.dispatchEvent(new Event('storage'));
    
    logActivity({
      type: "login",
      title: "Logged In",
      description: "Successfully authenticated to the platform",
      status: "success"
    });

    const hasPhone = userData.profile?.phone && userData.profile.phone.trim() !== '' && userData.profile.phone !== 'Not found';
    const hasTargetRole = userData.preferences?.targetRole && userData.preferences.targetRole.trim() !== '';

    if (!hasPhone || !hasTargetRole) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const trimmedEmail = formData.email.trim().toLowerCase();

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: formData.password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.access_token) {
        handleLoginSuccess(data.user, data.access_token);
      } else {
        setError(data.detail || 'Invalid email or password');
      }
    } catch (err) {
      console.error("Login network/server error:", err);
      setError(err.message || 'Unable to connect to the authentication server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLoginRequest = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address to login with OTP');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const trimmedEmail = formData.email.trim().toLowerCase();
      
      const response = await fetch(`${API_URL}/auth/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, purpose: 'LOGIN' })
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate('/otp-verification', { state: { email: trimmedEmail, purpose: 'LOGIN' } });
      } else {
        throw new Error(data.detail || "Failed to generate OTP");
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col lg:flex-row relative overflow-hidden font-inter selection:bg-[#FF6B3D] selection:text-white">
      
      {/* Left Panel: Main Visual / Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="lg:w-1/2 w-full min-h-[38vh] lg:min-h-screen relative flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-gradient-to-br from-[#0B0B0D] via-[#0E0E11] to-[#111214] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden"
      >
        
        {/* Subtle Background Grid & Soft Orange Ambient Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.25) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Soft Ambient Glow Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF6B3D]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF7A45]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-manrope text-2xl font-extrabold tracking-wider text-white">PREPRIA</span>
            <span className="w-2 h-2 rounded-full bg-[#FF6B3D] shadow-sm shadow-[#FF6B3D]/60 animate-pulse" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8B8B8]/70 mt-1 font-medium font-inter">
            Prepare. Perform. Progress.
          </p>
        </div>

        {/* Hero Headline & Supporting Copy */}
        <div className="relative z-10 my-6 lg:my-auto max-w-xl">
          <div className="w-10 h-[3px] bg-[#FF6B3D] rounded-full mb-6" />
          <h1 className="font-manrope text-3xl sm:text-5xl lg:text-[54px] font-bold leading-[1.1] text-white tracking-tight mb-5">
            Your Career.<br />
            <span className="text-white">Prepared Better.</span>
          </h1>
          <p className="font-inter text-sm sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
            Build the skills, confidence, and interview readiness you need to step into your next opportunity.
          </p>
        </div>

        {/* Product Statement Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 hidden sm:block">
          <p className="font-inter text-[11px] sm:text-xs text-[#B8B8B8]/60 uppercase tracking-[0.18em] font-medium">
            AI-powered career preparation for students and future professionals.
          </p>
        </div>
      </motion.div>

      {/* Right Panel: Authentication Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex-1 min-h-[62vh] lg:min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#111214] relative z-10"
      >
        <div className="w-full max-w-md space-y-7">
          
          {/* Form Heading */}
          <div>
            <h2 className="font-manrope text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {isOtpFlow ? "Login with OTP" : "Welcome Back"}
            </h2>
            <p className="font-inter text-sm text-[#B8B8B8] mt-2 leading-normal">
              {isOtpFlow 
                ? "Enter your email address to receive a secure verification code." 
                : "Enter your credentials to access your PREPRIA account."}
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium flex items-center gap-2"
              >
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Authentication Form */}
          <form onSubmit={isOtpFlow ? handleOtpLoginRequest : handlePasswordLogin} className="space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-2 font-inter">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all duration-200 text-sm disabled:opacity-50"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input (Hidden in OTP mode) */}
            <AnimatePresence mode="wait">
              {!isOtpFlow && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider font-inter">
                        Password
                      </label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs font-semibold text-[#FF6B3D] hover:text-[#FF7A45] transition-colors font-inter"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!isOtpFlow}
                        className="block w-full pl-11 pr-11 py-3.5 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all duration-200 text-sm disabled:opacity-50"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#B8B8B8]/50 hover:text-white transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 bg-[#0B0B0D] border-white/20 rounded text-[#FF6B3D] focus:ring-[#FF6B3D] cursor-pointer accent-[#FF6B3D]"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                      disabled={isLoading}
                    />
                    <label htmlFor="remember-me" className="ml-2.5 text-xs text-[#B8B8B8] cursor-pointer select-none font-inter">
                      Remember me for 30 days
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Orange Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#FF6B3D] hover:bg-[#FF7A45] text-white font-semibold rounded-xl shadow-lg shadow-[#FF6B3D]/20 hover:shadow-xl hover:shadow-[#FF6B3D]/35 transition-all duration-200 flex justify-center items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 font-inter mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isOtpFlow ? 'Continue with OTP' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#111214] text-[#B8B8B8]/60 font-semibold uppercase tracking-wider font-inter">
                OR
              </span>
            </div>
          </div>

          {/* Secondary OTP Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsOtpFlow(!isOtpFlow);
              setError('');
            }}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-transparent border border-white/10 hover:border-[#FF6B3D]/40 text-white hover:bg-white/[0.03] font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 font-inter"
          >
            {isOtpFlow ? 'Login with Password' : 'Continue with OTP'}
          </button>

          {/* Sign Up Navigation */}
          <div className="text-center text-sm text-[#B8B8B8] font-inter pt-2">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-[#FF6B3D] font-semibold hover:text-[#FF7A45] hover:underline transition-colors ml-1"
            >
              Create Account
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
