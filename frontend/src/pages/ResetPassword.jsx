import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import LoadingButton from '../components/LoadingButton';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // We expect the token to be passed from OTPVerification via router state
    if (location.state?.token) {
      setToken(location.state.token);
      setEmail(location.state.email || '');
    } else {
      // Fallback to query params if they somehow got here via an old link
      const params = new URLSearchParams(location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        setToken(urlToken);
      } else {
        navigate('/login');
      }
    }
  }, [location, navigate]);

  const validatePassword = (pass) => {
    if (pass.length < 8) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[^A-Za-z0-9]/.test(pass)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(newPassword)) {
      setError('Password does not meet the minimum requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        navigate("/success-reset");
      } else {
         throw new Error(data.detail || "Reset failed. Your link may have expired.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create New Password" subtitle={email ? `Choose a strong password to secure ${email}` : "Choose a strong password to secure your account."}>
      <AuthCard>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 text-[#111111] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all disabled:opacity-50"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-[#111111] mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`block w-full pl-11 pr-11 py-3 border rounded-xl bg-gray-50 text-[#111111] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-all disabled:opacity-50 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <LoadingButton 
              type="submit" 
              isLoading={isLoading}
              disabled={!newPassword || newPassword !== confirmPassword || !validatePassword(newPassword)}
            >
              Reset Password
            </LoadingButton>
          </div>
          
          <div className="text-center mt-4">
             <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
             >
               Cancel & Back to Login
             </button>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
