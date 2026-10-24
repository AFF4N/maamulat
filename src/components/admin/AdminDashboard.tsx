import React, { useState, useEffect } from 'react';
import { Menu, X, RotateCw, LogOut } from 'lucide-react';
import type { AdminModule, AdminState } from './types';
import { AdminAuthScreen } from './AdminAuthScreen';
import { AdminSidebar } from './AdminSidebar';
import { NotificationsModule } from './modules/NotificationsModule';
import { DatabaseModule } from './modules/DatabaseModule';
import { SystemModule } from './modules/SystemModule';
import { parseJsonResponse } from '../../utils/apiUtils';

interface AdminDashboardProps {
  onBack: () => void;
  isDark?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  // Authentication State
  const [pin, setPin] = useState(() => {
    return sessionStorage.getItem('maamulat_admin_pin') || localStorage.getItem('maamulat_admin_pin') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Management Module in Left Sidebar
  const [activeModule, setActiveModule] = useState<AdminModule>('notifications');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin Data State
  const [adminData, setAdminData] = useState<AdminState | null>(null);

  // Fetch admin dashboard stats
  const fetchAdminStats = async (adminPin: string, remember: boolean = true) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/admin?pin=${encodeURIComponent(adminPin)}`, {
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await parseJsonResponse(res, 'Authentication failed. Please verify your PIN.');

      if (!res.ok) {
        setIsAuthenticated(false);
        setAuthError(data.error || 'Authentication failed. Please verify your PIN.');
        return false;
      }

      setAdminData(data);
      setIsAuthenticated(true);
      setPin(adminPin);

      if (remember) {
        localStorage.setItem('maamulat_admin_pin', adminPin);
      }
      sessionStorage.setItem('maamulat_admin_pin', adminPin);
      return true;
    } catch (err: any) {
      setAuthError(err?.message || 'Failed connecting to admin backend.');
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Try auto-login if PIN was previously saved
  useEffect(() => {
    if (pin) {
      fetchAdminStats(pin);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('maamulat_admin_pin');
    localStorage.removeItem('maamulat_admin_pin');
    setPin('');
    setIsAuthenticated(false);
    setAdminData(null);
  };

  // 1. Unauthenticated Gate
  if (!isAuthenticated) {
    return (
      <AdminAuthScreen
        onBack={onBack}
        onLogin={(enteredPin, remember) => fetchAdminStats(enteredPin, remember)}
        loading={loading}
        authError={authError}
      />
    );
  }

  // 2. Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100 flex flex-col md:flex-row">
      {/* Mobile Top Header with PWA safe-area spacing */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border-b border-paper-300 dark:border-ink-800 px-4 pt-3.5 standalone:pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle admin sidebar"
            className="p-1.5 rounded-xl border border-paper-300 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div>
            <h1 className="text-sm font-bold text-ink-900 dark:text-white leading-tight">
              Maamulat Admin
            </h1>
            <span className="text-[10px] text-ink-400 block capitalize">
              {activeModule === 'notifications' && 'Notifications & Broadcasts'}
              {activeModule === 'storage' && 'Cloud Storage & Database'}
              {activeModule === 'system' && 'System & Security'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fetchAdminStats(pin)}
            disabled={loading}
            className="p-2 rounded-xl text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-ink-500 hover:text-red-600 transition-colors"
            title="Lock"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Left Navigation Sidebar */}
      <AdminSidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onBackToApp={onBack}
        onLogout={handleLogout}
      />

      {/* Main Content Area (Only right window scrolls) */}
      <main className="flex-1 md:h-screen md:overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 standalone:pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8 space-y-6">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-between pb-3 border-b border-paper-300 dark:border-ink-800">
          <div>
            <h1 className="text-base font-bold text-ink-900 dark:text-white capitalize">
              {activeModule === 'notifications' && 'Push Notifications & Worldwide Broadcast'}
              {activeModule === 'storage' && 'Upstash Database & Cloud Storage'}
              {activeModule === 'system' && 'System Status & Security Configuration'}
            </h1>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              {activeModule === 'notifications' && 'Manage automated reminders, dispatch instant notifications, and monitor delivery.'}
              {activeModule === 'storage' && 'Monitor Upstash Redis REST connection, tokens, and active device entries.'}
              {activeModule === 'system' && 'Verify environment keys, VAPID credentials, and admin security settings.'}
            </p>
          </div>

          <button
            onClick={() => fetchAdminStats(pin)}
            disabled={loading}
            className="p-2 rounded-xl text-ink-600 dark:text-ink-400 hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors tap-bounce"
            title="Refresh module stats"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dynamic Module Content */}
        {activeModule === 'notifications' && (
          <NotificationsModule
            adminData={adminData}
            pin={pin}
            onRefresh={() => fetchAdminStats(pin)}
          />
        )}

        {activeModule === 'storage' && (
          <DatabaseModule
            adminData={adminData}
            onRefresh={() => fetchAdminStats(pin)}
            loading={loading}
          />
        )}

        {activeModule === 'system' && (
          <SystemModule adminData={adminData} />
        )}
        </div>
      </main>
    </div>
  );
};
