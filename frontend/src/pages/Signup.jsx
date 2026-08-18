import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { logActivity } from '../utils/activityLogger';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';


export default function Signup() {
  const navigate = useNavigate();
  const { setUserContext } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was the name of your favorite teacher?',
    securityAnswer: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const getPasswordStrength = (password) => {
    if (!password) return { text: '', color: 'bg-[#222222]' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return { text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { text: 'Medium', color: 'bg-amber-500' };
    return { text: 'Strong', color: 'bg-emerald-500' };
  };

  const isPasswordValid = validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.securityAnswer) {
      setError('Please fill in all fields');
      return;
    }

    const trimmedEmail = formData.email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must include uppercase, lowercase, number, and special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: trimmedEmail,
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.detail || 'Registration failed. Please try again.');
        return;
      }

      // Successful Registration & Auth State Initialization
      localStorage.removeItem('isDemo');
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      localStorage.setItem('activeUser', trimmedEmail);
      setUserContext(data.user || { name: formData.name, email: trimmedEmail });
      window.dispatchEvent(new Event('storage'));

      logActivity({
        type: "signup",
        title: "Account Created",
        description: "Registered new PREPRIA candidate account",
        status: "success"
      });

      navigate('/onboarding');
    } catch (err) {
      console.error("Signup network/server error:", err);
      setError(err.message || 'Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = !formData.email || !formData.name || !isPasswordValid || formData.password !== formData.confirmPassword || !formData.securityAnswer;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col lg:flex-row relative overflow-hidden font-inter selection:bg-[#FF6B3D] selection:text-white">
      
      {/* Left Visual Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="lg:w-1/2 w-full min-h-[35vh] lg:min-h-screen relative flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-gradient-to-br from-[#0B0B0D] via-[#0E0E11] to-[#111214] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden"
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.25) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF6B3D]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF7A45]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-manrope text-2xl font-extrabold tracking-wider text-white">PREPRIA</span>
            <span className="w-2 h-2 rounded-full bg-[#FF6B3D] shadow-sm shadow-[#FF6B3D]/60 animate-pulse" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8B8B8]/70 mt-1 font-medium font-inter">
            Prepare. Perform. Progress.
          </p>
        </div>

        <div className="relative z-10 my-6 lg:my-auto max-w-xl">
          <div className="w-10 h-[3px] bg-[#FF6B3D] rounded-full mb-6" />
          <h1 className="font-manrope text-3xl sm:text-5xl lg:text-[52px] font-bold leading-[1.1] text-white tracking-tight mb-5">
            Start Your Journey.<br />
            <span className="text-white">Become Career Ready.</span>
          </h1>
          <p className="font-inter text-sm sm:text-lg text-[#B8B8B8] leading-relaxed font-normal">
            Join thousands of students and engineers preparing for high-impact technical roles with real-time AI guidance.
          </p>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 hidden sm:block">
          <p className="font-inter text-[11px] sm:text-xs text-[#B8B8B8]/60 uppercase tracking-[0.18em] font-medium">
            Personalized resume ATS analysis • AI interview simulator • Skill roadmaps
          </p>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex-1 min-h-[65vh] lg:min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#111214] relative z-10 overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-6 my-auto">
          
          <div>
            <h2 className="font-manrope text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create New Account
            </h2>
            <p className="font-inter text-sm text-[#B8B8B8] mt-2 leading-normal">
              Enter your details to create your PREPRIA profile and access all features.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5 font-inter">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all text-sm disabled:opacity-50"
                  placeholder="Alex Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5 font-inter">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all text-sm disabled:opacity-50"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5 font-inter">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all text-sm disabled:opacity-50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
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

              {/* Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-[#B8B8B8]">
                    <span>Strength: {getPasswordStrength(formData.password).text}</span>
                    <div className="w-1/2 h-1.5 bg-[#0B0B0D] rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full ${getPasswordStrength(formData.password).color} transition-all duration-300`} 
                        style={{ 
                          width: getPasswordStrength(formData.password).text === 'Weak' ? '33%' : 
                                 getPasswordStrength(formData.password).text === 'Medium' ? '66%' : 
                                 getPasswordStrength(formData.password).text === 'Strong' ? '100%' : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5 font-inter">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all text-sm disabled:opacity-50"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#B8B8B8]/50 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Security Question & Answer */}
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5 font-inter">
                Security Question
              </label>
              <div className="mb-2">
                <input 
                  type="text" 
                  disabled 
                  value={formData.securityQuestion}
                  className="block w-full px-3 py-2.5 bg-[#0B0B0D]/70 border border-white/5 rounded-xl text-[#B8B8B8] text-xs font-medium cursor-not-allowed"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B8B8B8]/50">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-[#0B0B0D] border border-white/10 rounded-xl text-white placeholder-[#B8B8B8]/40 focus:outline-none focus:border-[#FF6B3D] focus:ring-2 focus:ring-[#FF6B3D]/30 transition-all text-sm disabled:opacity-50"
                  placeholder="e.g., Mr. Smith"
                  value={formData.securityAnswer}
                  onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isFormInvalid}
              className="w-full py-3.5 px-4 bg-[#FF6B3D] hover:bg-[#FF7A45] text-white font-semibold rounded-xl shadow-lg shadow-[#FF6B3D]/20 hover:shadow-xl hover:shadow-[#FF6B3D]/35 transition-all duration-200 flex justify-center items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 font-inter mt-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-[#B8B8B8] font-inter pt-2">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#FF6B3D] font-semibold hover:text-[#FF7A45] hover:underline transition-colors ml-1"
            >
              Sign in
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

