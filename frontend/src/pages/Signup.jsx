import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { sendEmailNotification } from '../utils/emailApi';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', securityQuestion: 'What was the name of your favorite teacher?', securityAnswer: '' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData({...formData, email: val});
    validateEmail(val);
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
    if (!password) return { text: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 2) return { text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { text: 'Medium', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };

  const isPasswordValid = validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.securityAnswer) {
      setError('Please fill in all fields');
      return;
    }
    
    // Final Email Validation Catch Before Submit
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
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
      const trimmedEmail = formData.email.trim().toLowerCase();

      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: trimmedEmail,
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Backend Errors
        if (data.detail && data.detail.includes('Email already exists') || data.detail.includes('Email already registered')) {
            setError('Account already exists. Please login.');
        } else {
            setError(data.detail || 'Signup failed');
        }
        return;
      }

      // Send Email Notification
      const emailSent = await sendEmailNotification(
        "signup",
        "New User Registration - AI Career Platform",
        {
          name: formData.name,
          email: trimmedEmail,
          role: "User", // Can be dynamic if role selection exists later
          timestamp: new Date().toLocaleString()
        }
      );

      if (!emailSent) {
        setError('Account created, but email notification failed. Please contact support.');
        setLoading(false);
        return;
      }

      // Success
      let localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (!localUsers.some(u => u.email.trim().toLowerCase() === trimmedEmail)) {
        localUsers.push({
          name: formData.name,
          email: trimmedEmail,
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer.trim().toLowerCase(),
          profile: {
            name: formData.name,
            email: trimmedEmail
          }
        });
        localStorage.setItem('users', JSON.stringify(localUsers));
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(trimmedEmail));
      
      localStorage.removeItem('isDemo');
      window.dispatchEvent(new Event('storage'));
      navigate('/onboarding');

    } catch (err) {
      console.error("Signup error:", err);
      // Fallback if backend is not running, we also do the localstorage way as fallback to keep demo working
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email.trim().toLowerCase() === trimmedEmail)) {
        setError('Account already exists. Please login.');
        return;
      }

      const newUserRecord = {
        name: formData.name,
        email: trimmedEmail,
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer.trim().toLowerCase(),
        profile: {
          name: formData.name,
          email: trimmedEmail
        }
      };
      users.push(newUserRecord);
      localStorage.setItem('users', JSON.stringify(users));

      localStorage.setItem('token', 'simulated_jwt_token_123');
      localStorage.setItem('currentUser', JSON.stringify(trimmedEmail));
      
      localStorage.removeItem('isDemo');
      window.dispatchEvent(new Event('storage')); 
      navigate('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = !!emailError || !formData.email || !formData.name || !isPasswordValid || formData.password !== formData.confirmPassword || !formData.securityAnswer;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-primary" animate={false}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-gray-500">Join the AI Career Intelligence Platform</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium animate-pulse">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                placeholder="Alex Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${emailError ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="email"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-400 transition-all ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={(e) => validateEmail(e.target.value)}
              />
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1 font-medium">{emailError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            {/* Password Validation Feedback */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">Strength: {getPasswordStrength(formData.password).text}</span>
                  <div className="flex-1 max-w-[50%] h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full ml-2 overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs mt-2">
                  <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <ShieldCheck className="w-3 h-3" /> At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <ShieldCheck className="w-3 h-3" /> One uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <ShieldCheck className="w-3 h-3" /> One lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <ShieldCheck className="w-3 h-3" /> One number
                  </div>
                  <div className={`flex items-center gap-1 col-span-1 md:col-span-2 ${/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <ShieldCheck className="w-3 h-3" /> One special character (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Security Question</label>
            <div className="relative mb-2">
              <select
                className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                value={formData.securityQuestion}
                disabled
              >
                <option value="What was the name of your favorite teacher?">What was the name of your favorite teacher?</option>
              </select>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all"
                placeholder="e.g., Mr. Smith"
                value={formData.securityAnswer}
                onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || isFormInvalid}
            className={`w-full flex justify-center items-center gap-2 mt-6 py-2.5 ${(loading || isFormInvalid) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Account...' : (
              <>Create Account <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
