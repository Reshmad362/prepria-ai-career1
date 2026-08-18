import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import LoadingButton from '../components/LoadingButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';


export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      const response = await fetch(`${API_URL}/auth/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, purpose: 'PASSWORD_RESET' })
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate('/otp-verification', { state: { email: trimmedEmail, purpose: 'PASSWORD_RESET' } });
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
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a secure verification code.">
      <AuthCard>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF7A00] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
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

        <form onSubmit={handleReset} className="space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <LoadingButton type="submit" isLoading={isLoading}>
            Send OTP
          </LoadingButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
