import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Bell, Shield, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="glass sticky top-0 z-40 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Settings</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="glass rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm text-text-muted font-mono">{user?.code}</p>
            {user?.isAdmin && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>}
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 text-left">
            <Bell className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-text-muted">Push notification settings</p>
            </div>
          </button>

          <button className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 text-left">
            <Shield className="w-5 h-5 text-secondary" />
            <div className="flex-1">
              <p className="font-semibold">Privacy</p>
              <p className="text-xs text-text-muted">Security settings</p>
            </div>
          </button>

          <button className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 text-left">
            <Info className="w-5 h-5 text-gold" />
            <div className="flex-1">
              <p className="font-semibold">About</p>
              <p className="text-xs text-text-muted">Talking to Tom v1.0</p>
            </div>
          </button>
        </div>

        <button onClick={logout}
                className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 text-error text-left mt-8">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;