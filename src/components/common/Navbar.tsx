import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  ShieldCheck,
  User,
  Database,
  RotateCcw,
  FileText,
  CreditCard,
  Layers,
  BarChart3,
  Users
} from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenFileClaimModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenFileClaimModal }) => {
  const {
    currentRole,
    setRole,
    resetDatabase,
    setActiveSection,
  } = useDatabase();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0B2559] text-white flex items-center justify-center font-bold">
            🛡️
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">ClaimVault</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setRole('admin')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                currentRole === 'admin' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Admin Mode
            </button>
            <button
              onClick={() => setRole('customer')}
              className={`px-3 py-1 rounded-lg font-semibold ${
                currentRole === 'customer' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Customer View
            </button>
          </div>

          <button
            onClick={() => resetDatabase()}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>
    </header>
  );
};
