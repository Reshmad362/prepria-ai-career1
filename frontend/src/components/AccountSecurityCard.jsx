import React from 'react';
import { Mail, Key, Shield, Smartphone } from 'lucide-react';

export default function AccountSecurityCard({ user }) {
  const email = user?.email || "engineer@example.com";

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

      <div className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-on-surface-variant" />
          </div>
          <div>
            <h4 className="font-semibold text-on-surface mb-1">Password</h4>
            <p className="text-sm text-on-surface-variant">Last changed 3 months ago</p>
          </div>
        </div>
        <button className="btn-secondary !py-2 !px-4 !text-sm whitespace-nowrap">Update Password</button>
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
            <p className="text-xs text-on-surface-variant">San Francisco, USA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
