import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { UserContext } from '../contexts/UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserContext } = useContext(UserContext);

  const handleLoginSuccess = (userData, token) => {
    localStorage.removeItem('isDemo');
    
    localStorage.setItem('token', token);
    
    // Pass the full user object to the context
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

  const handleSubmit = async (e) => {
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
      console.log("Entered email:", trimmedEmail);

      let foundUser = null;
      let tokenToUse = "local-token-" + Date.now();

      // Attempt Backend Login First
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: formData.password
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
           tokenToUse = data.access_token || tokenToUse;
           // The backend doesn't return full profile in /login currently (just token details).
           // But we need the profile for Context. Let's still look it up locally if we need to,
           // or construct it. For now, we will fallback to the local storage search to get the full profile object, 
           // since the backend /login just validates.
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
        console.warn("Backend login failed or unreachable, falling back to local storage:", backendErr.message);
        
        // Fallback to local storage
        const users = JSON.parse(localStorage.getItem("users")) || [];
        console.log("Stored users:", users);

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
      console.log("Logged in user:", foundUser.email);
      
      handleLoginSuccess(foundUser, tokenToUse);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-primary" animate={false}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to access your intelligence dashboard</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium animate-pulse">{error}</div>}


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-card text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-lg bg-card text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 mt-6 py-2.5">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Sign up here
          </Link>
        </div>
      </Card>
    </div>
  );
}
