import React, { useState } from 'react';
import { Mail, Key, Shield, Smartphone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function AccountSecurityCard({ user }) {
  const email = user?.email || '';

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState(null); // { success, message }
  const [pwLoading, setPwLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);

    if (newPassword.length < 8) {
      setPwStatus({ success: false, message: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ success: false, message: 'Passwords do not match.' });
      return;
    }

    setPwLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwStatus({ success: true, message: 'Password set successfully. You can now log in with your email and password.' });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPwStatus({ success: false, message: data.detail || 'Failed to set password.' });
      }
    } catch {
      setPwStatus({ success: false, message: 'Unable to connect. Please try again.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface mb-1">Email Address</h4>
            <p className="text-sm text-on-surface-variant">{email}</p>
          </div>
        </div>
        <button className="btn-secondary !py-2 !px-4 !text-sm whitespace-nowrap">Change Email</button>
      </div>

      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface mb-1">Password</h4>
              <p className="text-sm text-on-surface-variant">Set or update your login password</p>
            </div>
          </div>
          <button
            onClick={() => { setShowPasswordForm(v => !v); setPwStatus(null); }}
            className="btn-secondary !py-2 !px-4 !text-sm whitespace-nowrap"
          >
            {showPasswordForm ? 'Cancel' : 'Set / Update Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleSetPassword} className="space-y-3 pt-2 border-t border-outline-variant/15">
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New password (min. 8 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-surface-container border border-outline-variant/30 rounded-xl text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-surface-container border border-outline-variant/30 rounded-xl text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pwStatus && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${pwStatus.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {pwStatus.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pwStatus.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {pwLoading ? 'Saving…' : 'Save Password'}
            </button>
          </form>
        )}
      </div>

      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface mb-1">Connected Accounts</h4>
            <p className="text-sm text-on-surface-variant mb-3">Sign in faster with social accounts</p>
            <div className="flex items-center gap-3 bg-surface-container p-3 rounded-lg border border-outline-variant/20 inline-flex">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-on-surface">Connected to Google</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h4 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" /> Active Sessions
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-surface-container rounded-xl border border-outline-variant/10">
            <div>
              <p className="text-sm font-medium text-on-surface">Windows PC • Chrome</p>
              <p className="text-xs text-primary font-medium mt-1">Current Session</p>
            </div>
            <p className="text-xs text-on-surface-variant">Current device</p>
          </div>
        </div>
      </div>
    </div>
  );
}
