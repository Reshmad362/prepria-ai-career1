import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import { logActivity } from '../utils/activityLogger';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import LoadingButton from '../components/LoadingButton';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      let foundUser = null;
      let tokenToUse = "local-token-" + Date.now();

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: formData.password })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
           tokenToUse = data.access_token || tokenToUse;
           const users = JSON.parse(localStorage.getItem("users")) || [];
           foundUser = users.find((u) => u.email.trim().toLowerCase() === trimmedEmail) || {
              email: trimmedEmail,
              name: data.name || "User",
              profile: { email: trimmedEmail, name: data.name || "User" }
           };
        } else {
           throw new Error(data.detail || "Backend login failed");
        }
      } catch (backendErr) {
        console.warn("Backend login failed, falling back to local storage:", backendErr.message);
        const users = JSON.parse(localStorage.getItem("users")) || [];
        foundUser = users.find(
          (u) => u.email.trim().toLowerCase() === trimmedEmail && u.password === formData.password
        );
      }

      if (!foundUser) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Clear previous user data BEFORE setting new user
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userInsights");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("profile");

      localStorage.setItem("activeUser", foundUser.email);
      handleLoginSuccess(foundUser, tokenToUse);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
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
    <AuthLayout>
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#111111] mb-1">
            {isOtpFlow ? "Login with OTP" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isOtpFlow ? "Enter your email to receive a verification code." : "Continue your interview journey."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={isOtpFlow ? handleOtpLoginRequest : handlePasswordLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-[#111111] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all disabled:opacity-50"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>

          <AnimatePresence>
            {!isOtpFlow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-[#111111]">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-[#FF7A00] hover:text-[#E66D00] transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 text-[#111111] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all disabled:opacity-50"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-300 rounded cursor-pointer"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4">
            <LoadingButton type="submit" isLoading={isLoading}>
              {isOtpFlow ? 'Continue with OTP' : 'Login'}
            </LoadingButton>
          </div>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
          </div>
        </div>

        <div>
          <LoadingButton 
            variant="outline" 
            type="button" 
            onClick={() => setIsOtpFlow(!isOtpFlow)}
            disabled={isLoading}
          >
            {isOtpFlow ? 'Login with Password' : 'Login using OTP'}
          </LoadingButton>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#FF7A00] font-semibold hover:underline">
            Sign up here
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
