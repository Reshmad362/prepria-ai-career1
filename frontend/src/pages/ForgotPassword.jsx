import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldAlert, Lock, ShieldCheck } from 'lucide-react';
import emailjs from "emailjs-com";

const sendResetEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const templateParams = {
    to_email: email,
    reset_link: resetLink,
  };

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

  try {
    console.log("Sending reset email to:", email);
    console.log("Reset link:", resetLink); // Debug mode as requested
    
    // If placeholders are used, simulate a failure to trigger the secure fallback
    if (serviceId === "YOUR_SERVICE_ID" || serviceId === "your-emailjs-service-id") {
        console.warn("Using EmailJS placeholders. Simulating email failure to trigger fallback.");
        return false;
    }

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("EmailJS Error:", error);
    return false;
  }
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  
  // Fallback states
  const [fallbackMode, setFallbackMode] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [fallbackError, setFallbackError] = useState('');
  const [tokenStore, setTokenStore] = useState('');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError('');
    setFallbackMode(false);
    setFallbackError('');

    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Rate limit (30s)
      const rlKey = `rl_${trimmedEmail}`;
      const last = Number(localStorage.getItem(rlKey) || 0);
      if (Date.now() - last < 30000) {
        setError("Please wait 30 seconds before requesting again.");
        setLoading(false);
        return;
      }
      localStorage.setItem(rlKey, String(Date.now()));

      // 1. Generate Secure Token on the frontend
      const generatedToken = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      setTokenStore(generatedToken);

      // 2. Store it securely with expiry (15 mins)
      const expiry = Date.now() + 15 * 60 * 1000;
      localStorage.setItem(`reset_${trimmedEmail}`, JSON.stringify({
        email: trimmedEmail,
        token: generatedToken,
        expiry,
        used: false
      }));

      // 3. Call backend (fire and forget for this mockup, as backend always returns success)
      try {
        await fetch("http://localhost:8000/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: trimmedEmail })
        });
      } catch (backendErr) {
        console.warn("Backend ignored for forgot-password:", backendErr.message);
      }

      // 4. Send EmailJS
      const emailSent = await sendResetEmail(trimmedEmail, generatedToken);
      
      if (!emailSent) {
        // TRIGGER FALLBACK MODE
        setFallbackMode(true);
        setLoading(false);
        return;
      }

      // 5. Success
      setSuccess(true);
      setTimer(30);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackSubmit = (e) => {
    e.preventDefault();
    setFallbackError('');
    
    const trimmedEmail = email.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);
    
    // Check if user exists AND answer matches
    if (!user || !user.securityAnswer) {
      setFallbackError("Invalid answer or account not found.");
      return;
    }

    if (user.securityAnswer.toLowerCase().trim() === securityAnswer.toLowerCase().trim()) {
      // Validate success: redirect to reset password
      navigate(`/reset-password?token=${tokenStore}&email=${encodeURIComponent(trimmedEmail)}`);
    } else {
      setFallbackError("Invalid answer.");
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      handleReset({ preventDefault: () => {} });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/20 w-full max-w-md p-8 shadow-2xl rounded-2xl border border-white/60 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">We'll send a secure reset link to your email.</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
             <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Sent</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">If an account exists for <span className="font-bold text-gray-900 dark:text-white">{email}</span>, a reset link has been sent.</p>
             <button 
                onClick={handleResend}
                disabled={timer > 0}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline disabled:opacity-50 disabled:no-underline transition"
              >
                {timer > 0 ? `Didn't receive email? Resend in ${timer}s` : "Resend Link"}
             </button>
          </div>
        ) : fallbackMode ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex gap-3">
               <ShieldAlert className="w-5 h-5 shrink-0" />
               <p>We couldn't send the email right now. Please answer your security question to continue.</p>
             </div>
             
             <form onSubmit={handleFallbackSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Question: What was the name of your favorite teacher?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheck className="w-5 h-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={securityAnswer}
                      onChange={(e) => {
                        setSecurityAnswer(e.target.value);
                        if (fallbackError) setFallbackError('');
                      }}
                      required
                      className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${fallbackError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30'}`} 
                      placeholder="Your answer" 
                    />
                  </div>
                </div>

                {fallbackError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> {fallbackError}
                  </div>
                )}

                <button type="submit" className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all">
                  Verify Answer
                </button>
             </form>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className={`block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30'}`} 
                  placeholder="name@company.com" 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
