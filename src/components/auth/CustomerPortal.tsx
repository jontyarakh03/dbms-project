import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Shield, FileText, ShieldCheck, CreditCard, LayoutDashboard,
  LogOut, Menu, X, Bell, ChevronRight, Sun, Moon,
  Clock, CheckCircle2, AlertTriangle, XCircle, Banknote
} from 'lucide-react';
import { MyPoliciesView } from '../policyholder/MyPoliciesView';
import { ClaimTrackerView } from '../policyholder/ClaimTrackerView';

// ── Mini stat cards for the customer dashboard ────────────────────────────────
const CustomerDashboard: React.FC = () => {
  const { detailedClaims, policies, payments, activeCustomer, setActiveSection } = useDatabase();

  const myPolicies = policies.filter(p => p.Customer_ID === activeCustomer?.Customer_ID);
  const myClaimIds = myPolicies.map(p => p.Policy_ID);
  const myClaims   = detailedClaims.filter(c => myClaimIds.includes(c.Policy_ID));
  const myPayments = payments.filter(p => myClaims.some(c => c.Claim_ID === p.Claim_ID));

  const totalPaid = myPayments
    .filter(p => p.Payment_Status === 'Completed')
    .reduce((s, p) => s + p.Amount, 0);

  const stats = [
    { label: 'Active Policies',   val: myPolicies.length,  icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Total Claims',      val: myClaims.length,    icon: <FileText    className="w-5 h-5" />, color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Pending Review',    val: myClaims.filter(c => c.Claim_Status === 'Pending' || c.Claim_Status === 'Under Verification').length,
      icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    { label: 'Amount Received',   val: `₹${totalPaid.toLocaleString()}`, icon: <Banknote className="w-5 h-5" />, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome back, {activeCustomer?.Name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here's a quick overview of your insurance portfolio.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{s.val}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent claims */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Your Recent Claims
          </h2>
          <button
            onClick={() => setActiveSection('claims')}
            className="text-xs text-[#15529E] dark:text-blue-400 font-semibold hover:underline"
          >
            View all →
          </button>
        </div>

        {myClaims.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No claims filed yet. Use "File a Claim" to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myClaims.slice(0, 5).map(claim => {
              const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
                Pending:            { icon: <Clock className="w-3.5 h-3.5" />,        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200' },
                'Under Verification': { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200' },
                Approved:           { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200' },
                Paid:               { icon: <Banknote className="w-3.5 h-3.5" />,     color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200' },
                Rejected:           { icon: <XCircle className="w-3.5 h-3.5" />,      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200' },
              };
              const cfg = statusConfig[claim.Claim_Status] || statusConfig['Pending'];

              return (
                <div key={claim.Claim_ID} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      Claim #{claim.Claim_ID} — {claim.policy.Policy_Type}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{claim.Description.slice(0, 60)}…</div>
                    <div className="text-xs text-slate-400 mt-0.5">{claim.Claim_Date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{claim.Claim_Amount.toLocaleString()}
                    </div>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                      {cfg.icon} {claim.Claim_Status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveSection('policies')}
          className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-[#15529E] hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">My Policies</div>
            <div className="text-xs text-slate-500 mt-0.5">View coverage, dates & premium details</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
        </button>

        <button
          onClick={() => setActiveSection('claims')}
          className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-[#15529E] hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Track My Claims</div>
            <div className="text-xs text-slate-500 mt-0.5">Check status, timeline & decisions</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
        </button>
      </div>
    </div>
  );
};

// ── Main Customer Portal ───────────────────────────────────────────────────────
interface CustomerPortalProps {
  onLogout: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onLogout }) => {
  const {
    activeSection, setActiveSection,
    activeCustomer,
    isDarkMode, toggleDarkMode,
    setIsFileClaimOpen,
    isFileClaimOpen,
    detailedClaims, policies,
  } = useDatabase();

  const [mobileOpen, setMobileOpen] = useState(false);

  const myPolicies = policies.filter(p => p.Customer_ID === activeCustomer?.Customer_ID);
  const myClaimIds = myPolicies.map(p => p.Policy_ID);
  const pendingCount = detailedClaims.filter(
    c => myClaimIds.includes(c.Policy_ID) &&
      (c.Claim_Status === 'Pending' || c.Claim_Status === 'Under Verification')
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'My Dashboard',   icon: <LayoutDashboard className="w-5 h-5" />,        badge: null },
    { id: 'policies',  label: 'My Policies',    icon: <ShieldCheck className="w-5 h-5" />,             badge: myPolicies.length },
    { id: 'claims',    label: 'My Claims',       icon: <FileText className="w-5 h-5" />,               badge: pendingCount > 0 ? pendingCount : null, badgePulse: true },
  ];

  const handleNav = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B2559] text-white">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#15529E]/40 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#15529E] to-[#008B9E] flex items-center justify-center shadow-md shrink-0">
          <Shield className="w-5 h-5 text-teal-200" />
        </div>
        <div>
          <div className="font-extrabold text-sm tracking-tight">ClaimVault</div>
          <div className="text-[10px] text-slate-400">Customer Portal</div>
        </div>
      </div>

      {/* Customer info */}
      <div className="px-4 py-4 border-b border-[#15529E]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
            {activeCustomer?.Name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{activeCustomer?.Name}</div>
            <div className="text-[10px] text-slate-400 truncate">ID #{activeCustomer?.Customer_ID}</div>
            <div className="text-[10px] text-slate-400 truncate">{activeCustomer?.Email}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu</div>

        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#15529E] to-[#10377e] text-white shadow-md border border-blue-400/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  item.badgePulse
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400/40 animate-pulse'
                    : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* File a claim CTA */}
        <div className="pt-3">
          <button
            onClick={() => { setIsFileClaimOpen(true); setMobileOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-lg cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            File a New Claim
          </button>
        </div>
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-[#15529E]/40 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F6F9FC] dark:bg-[#071630] text-slate-900 dark:text-slate-100 flex font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {activeSection === 'dashboard' ? 'My Dashboard' : activeSection === 'policies' ? 'My Policies' : 'My Claims'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'dashboard' && <CustomerDashboard />}
          {activeSection === 'policies'  && <MyPoliciesView />}
          {activeSection === 'claims'    && <ClaimTrackerView />}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-400 text-center">
          ClaimVault Customer Portal · Secure & ACID-Compliant · v2.4
        </footer>
      </div>
    </div>
  );
};
