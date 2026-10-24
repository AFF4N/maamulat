import React from 'react';
import {
  BellRing,
  Database,
  Sliders,
  ChevronRight,
  ArrowLeft,
  LogOut,
  X
} from 'lucide-react';
import type { AdminModule } from './types';

interface AdminSidebarProps {
  activeModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onBackToApp: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeModule,
  onSelectModule,
  isMobileOpen,
  onCloseMobile,
  onBackToApp,
  onLogout
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-ink-900 border-r border-paper-300 dark:border-ink-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-paper-200 dark:border-ink-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sage-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                🌿
              </div>
              <div>
                <h2 className="text-xs font-bold text-ink-900 dark:text-white leading-tight">
                  Maamulat Admin
                </h2>
                <span className="arabic-text text-[11px] text-sage-700 dark:text-ink-400 block leading-tight">
                  مرکزِ کنٹرول
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg text-ink-400 hover:text-ink-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module Navigation List */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 px-2 block mb-1">
              Modules
            </span>

            {/* 1. Notifications Module */}
            <button
              type="button"
              onClick={() => {
                onSelectModule('notifications');
                onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeModule === 'notifications'
                  ? 'bg-sage-600 text-white shadow-soft-sm'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BellRing className="w-4 h-4 shrink-0" />
                <span>Notifications & Push</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeModule === 'notifications' ? 'rotate-90' : 'opacity-40'
                }`}
              />
            </button>

            {/* 2. Database Module */}
            <button
              type="button"
              onClick={() => {
                onSelectModule('storage');
                onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeModule === 'storage'
                  ? 'bg-sage-600 text-white shadow-soft-sm'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 shrink-0" />
                <span>Database & Redis</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeModule === 'storage' ? 'rotate-90' : 'opacity-40'
                }`}
              />
            </button>

            {/* 3. System & Security Module */}
            <button
              type="button"
              onClick={() => {
                onSelectModule('system');
                onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeModule === 'system'
                  ? 'bg-sage-600 text-white shadow-soft-sm'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 shrink-0" />
                <span>System & Security</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeModule === 'system' ? 'rotate-90' : 'opacity-40'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-paper-200 dark:border-ink-800 space-y-2 shrink-0 bg-white dark:bg-ink-900">
          <button
            onClick={onBackToApp}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-ink-600 dark:text-ink-400 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Return to App</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Lock Admin Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
