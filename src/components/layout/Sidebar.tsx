import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  RotateCcw,
  Moon,
  Sun,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
}) => {
  const {
    activeSection,
    setActiveSection,
    customers,
    policies,
    claims,
    payments,
    detailedClaims,
    resetDatabase,
    isDarkMode,
    toggleDarkMode,
    activeAdmin,
  } = useDatabase();

  const pendingClaimsCount = claims.filter(
    (c) => c.Claim_Status === 'Pending' || c.Claim_Status === 'Under Verification'
  ).length;

  const processingPaymentsCount = payments.filter((p) => p.Payment_Status === 'Processing').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: customers.length,
      badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: ShieldCheck,
      badge: policies.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    },
    {
      id: 'claims',
      label: 'Claims & Verification',
      icon: FileText,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : null,
      badgeColor: 'bg-amber-500/30 text-amber-200 border-amber-400/40 animate-pulse',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      badge: processingPaymentsCount > 0 ? processingPaymentsCount : null,
      badgeColor: 'bg-teal-500/30 text-teal-200 border-teal-400/40',
    },
    {
      id: 'fraud',
      label: 'AI Fraud Detection',
      icon: ShieldAlert,
      badge: detailedClaims.filter((c) => c.fraudAssessment?.Risk_Level === 'Critical' || c.fraudAssessment?.Risk_Level === 'High').length || null,
      badgeColor: 'bg-rose-500/40 text-rose-200 border-rose-400/50 font-bold',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Persistent Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B2559] text-white transition-all duration-300 ease-in-out border-r border-[#15529E]/30 select-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Top Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#15529E]/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-[#15529E] to-[#008B9E] flex items-center justify-center text-white shadow-md shadow-blue-900/50">
              <Shield className="w-5 h-5 text-teal-300" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-sans">ClaimVault</span>
                </div>
                <span className="text-[11px] text-slate-300 truncate">Insurance Management</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Admin info pill */}
        {!isCollapsed && activeAdmin && (
          <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#15529E] to-[#008B9E] flex items-center justify-center text-white font-extrabold text-xs shrink-0">
              {activeAdmin.Avatar || activeAdmin.Name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{activeAdmin.Name}</div>
              <div className="text-[10px] text-slate-400 truncate">{activeAdmin.Role}</div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {!isCollapsed ? 'Admin Modules' : '•••'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative cursor-pointer
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[#15529E] to-[#10377e] text-white shadow-md shadow-blue-950/40 border border-blue-400/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 min-w-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== null && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-white/10 text-white border-white/20'}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Pip */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-teal-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Tools & Controls */}
        <div className="p-3 border-t border-[#15529E]/40 space-y-1.5 bg-[#081b40]">
          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
            {!isCollapsed && (
              <span className="flex-1 text-left">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* Seed Data Reset */}
          <button
            onClick={() => {
              if (window.confirm('Reset ClaimVault database to initial seed data (3 customers, 3 policies, 5 claims, 2 payments)?')) {
                resetDatabase();
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 transition-colors cursor-pointer
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title="Reset DBMS to original course seed records"
          >
            <RotateCcw className="w-4 h-4" />
            {!isCollapsed && <span className="flex-1 text-left">Reset Seed Data</span>}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="flex-1 text-left">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};