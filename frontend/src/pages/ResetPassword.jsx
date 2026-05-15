import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, ShieldX } from 'lucide-react';
import Button from '../components/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const emailParam = params.get("email");

    if (!token || !emailParam) {
      setTokenError("Link expired or invalid.");
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(`reset_${emailParam.toLowerCase()}`));
      
      if (!stored || stored.token !== token || stored.used || Date.now() > stored.expiry) {
        setTokenError("Link expired or invalid.");
        return;
      }
      
      setResetEmail(stored.email);
    } catch (e) {
      setTokenError("Link expired or invalid.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const token = new URLSearchParams(location.search).get("token");
      
      try {
        const response = await fetch("http://localhost:8000/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
           throw new Error(data.detail || "Backend reset failed.");
        }
      } catch (backendErr) {
        console.warn("Backend reset failed or unreachable:", backendErr.message);
        
        // Fallback for demo mode
        const users = JSON.parse(localStorage.getItem("users")) || [];
        
        const updatedUsers = users.map(u => {
          if (u.email.trim().toLowerCase() === resetEmail.trim().toLowerCase()) {
            return { ...u, password: newPassword };
          }
          return u;
        });

        localStorage.setItem("users", JSON.stringify(updatedUsers));
      }

      // Always invalidate the local token fallback to ensure single use
      const storedToken = JSON.parse(localStorage.getItem(`reset_${resetEmail.toLowerCase()}`));
      if (storedToken) {
        localStorage.removeItem(`reset_${resetEmail.toLowerCase()}`);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md p-8 shadow-xl bg-card rounded-2xl border-t-4 border-t-red-500 relative z-10 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">Invalid Link</h2>
          <p className="text-gray-500 mb-8">{tokenError}</p>
          <Link to="/forgot-password" className="block w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition text-center">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/20 w-full max-w-md p-8 shadow-2xl rounded-2xl border border-white/60 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        {!success && (
          <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        )}
        
        {success ? (
          <div className="text-center py-6">
             <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <ShieldX className="w-8 h-8 text-green-600 dark:text-green-400 opacity-0 hidden" />
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Updated</h2>
             <p className="text-gray-500 dark:text-gray-400 mb-6">Password updated successfully. Redirecting to login...</p>
             <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Password</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your new password for <span className="font-bold text-gray-900 dark:text-white">{resetEmail}</span>.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if(error) setError(''); }}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all disabled:opacity-50" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if(error) setError(''); }}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all disabled:opacity-50" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 text-center font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
