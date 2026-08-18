import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import OTPInput from '../components/OTPInput';
import LoadingButton from '../components/LoadingButton';
import { UserContext } from '../contexts/UserContext';
import { logActivity } from '../utils/activityLogger';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';


export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserContext } = useContext(UserContext);
  
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('LOGIN');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const [shake, setShake] = useState(0); // Trigger for shake animation

  useEffect(() => {
    // Get email and purpose from router state
    if (location.state?.email) {
      setEmail(location.state.email);
      if (location.state.purpose) setPurpose(location.state.purpose);
    } else {
      // If no email in state, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter all 6 digits');
      setShake((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);

        if (purpose === 'PASSWORD_RESET') {
          // Navigate to reset password page with token
          setTimeout(() => {
            navigate('/reset-password', { state: { token: data.reset_token, email } });
          }, 1500);
        } else {
          // Default LOGIN flow
          localStorage.removeItem('isDemo');
          localStorage.setItem('token', data.access_token);
          
          const userData = data.user || {
            email,
            name: data.name || "User",
            profile: { email, name: data.name || "User" }
          };
          
          setUserContext(userData);
          localStorage.setItem("activeUser", email);
          
          logActivity({
            type: "login",
            title: "Logged In via OTP",
            description: "Successfully authenticated to the platform using OTP",
            status: "success"
          });

          // Redirect after 1.5 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } else {
        throw new Error(data.detail || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
      setShake((prev) => prev + 1);
      setOtp(''); // Clear OTP on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      
      if (response.ok) {
        setTimer(30);
      } else {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Verify Your Identity" subtitle={`We've sent a 6-digit verification code to ${email}`}>
        <AuthCard className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-[#111111] mb-2"
          >
            {purpose === 'PASSWORD_RESET' ? 'OTP Verified' : 'Authentication Successful'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500"
          >
            {purpose === 'PASSWORD_RESET' ? 'Redirecting to reset password...' : 'Redirecting to your dashboard...'}
          </motion.p>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify Your Identity" subtitle={
      <span className="flex items-center justify-center gap-2 mt-2">
        <Mail className="w-4 h-4 text-[#FF7A00]" />
        We've sent a 6-digit verification code to <strong className="text-[#111111] ml-1">{email}</strong>
      </span>
    }>
      <motion.div animate={shake > 0 ? shakeAnimation : {}} key={shake}>
        <AuthCard>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center mb-8">
              <OTPInput 
                value={otp} 
                onChange={setOtp} 
                disabled={isLoading} 
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm font-medium overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <LoadingButton 
              type="submit" 
              isLoading={isLoading} 
              disabled={otp.length !== 6}
            >
              {purpose === 'PASSWORD_RESET' ? 'Verify OTP' : 'Verify & Login'}
            </LoadingButton>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isLoading}
                className="text-sm font-medium transition-colors disabled:text-gray-400 text-[#FF7A00] hover:text-[#E66D00]"
              >
                {timer > 0 ? `Resend available in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
            
            <div className="text-center mt-4">
               <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
               >
                 Back to Login
               </button>
            </div>
          </form>
        </AuthCard>
      </motion.div>
    </AuthLayout>
  );
}
