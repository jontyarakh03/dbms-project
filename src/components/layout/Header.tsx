import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Menu,
  Search,
  Plus,
  Bell,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Layers,
  FileText,
  UserPlus,
  Shield,
  CreditCard,
  X,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isCollapsed: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, isCollapsed, onLogout }) => {
  const {
    activeAdmin,
    setActiveAdmin,
    admins,
    auditLog,
    globalSearchQuery,
    setGlobalSearchQuery,
    customers,
    policies,
    claims,
    setIsRegisterCustomerOpen,
    setIsIssuePolicyOpen,
    setIsFileClaimOpen,
    setActiveSection,
    setSelectedClaimForDetail,
    currentRole,
    setRole,
  } = useDatabase();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const q = globalSearchQuery.trim().toLowerCase();
  const searchResults = q
    ? {
        matchedCustomers: customers.filter(
          (c) =>
            c.Name.toLowerCase().includes(q) ||
            c.Email.toLowerCase().includes(q) ||
            c.Phone.includes(q) ||
            String(c.Customer_ID).includes(q)
        ),
        matchedPolicies: policies.filter(
          (p) =>
            p.Policy_Type.toLowerCase().includes(q) ||
            String(p.Policy_ID).includes(q) ||
            String(p.Customer_ID).includes(q)
        ),
        matchedClaims: claims.filter(
          (cl) =>
            String(cl.Claim_ID).includes(q) ||
            cl.Claim_Status.toLowerCase().includes(q) ||
            cl.Description.toLowerCase().includes(q)
        ),
      }
    : null;

  const totalMatches = searchResults
    ? searchResults.matchedCustomers.length +
      searchResults.matchedPolicies.length +
      searchResults.matchedClaims.length
    : 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#071630] border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Customers, Policies, Claims, IDs... (⌘K)"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#15529E] focus:border-transparent transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Quick Results Dropdown */}
            {isSearchFocused && q && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50 max-h-96 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex justify-between">
                  <span>Results for "{globalSearchQuery}"</span>
                  <span>{totalMatches} Found</span>
                </div>

                {totalMatches === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No matching records found in Customer, Policy, or Claim tables.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Customers */}
                    {searchResults?.matchedCustomers.length! > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Customers ({searchResults?.matchedCustomers.length})
                        </div>
                        {searchResults?.matchedCustomers.slice(0, 3).map((c) => (
                          <div
                            key={c.Customer_ID}
                            onClick={() => {
                              setActiveSection('customers');
                              setIsSearchFocused(false);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                #{c.Customer_ID} {c.Name}
                              </span>
                              <div className="text-[11px] text-slate-400">{c.Email} • {c.Phone}</div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Customer</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Policies */}
                    {searchResults?.matchedPolicies.length! > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> Policies ({searchResults?.matchedPolicies.length})
                        </div>
                        {searchResults?.matchedPolicies.slice(0, 3).map((p) => (
                          <div
                            key={p.Policy_ID}
                            onClick={() => {
                              setActiveSection('policies');
                              setIsSearchFocused(false);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                Policy #{p.Policy_ID} • {p.Policy_Type}
                              </span>
                              <div className="text-[11px] text-slate-400 font-mono">Premium: ₹{p.Premium.toLocaleString()}</div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Cust #{p.Customer_ID}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Claims */}
                    {searchResults?.matchedClaims.length! > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 px-2 py-1 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                          <FileText className="w-3.5 h-3.5" /> Claims ({searchResults?.matchedClaims.length})
                        </div>
                        {searchResults?.matchedClaims.slice(0, 3).map((cl) => (
                          <div
                            key={cl.Claim_ID}
                            onClick={() => {
                              setActiveSection('claims');
                              setIsSearchFocused(false);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                Claim #{cl.Claim_ID} • ₹{cl.Claim_Amount.toLocaleString()}
                              </span>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{cl.Description}</div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {cl.Claim_Status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action, Notification Bell, Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button */}
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#15529E] hover:bg-[#114280] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Create
                </div>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    setIsRegisterCustomerOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Register Customer</span>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    setIsIssuePolicyOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Issue Policy</span>
                </button>

                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    setIsFileClaimOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>File Claim</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell (ACID Transactions & Audit) */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="DBMS Transaction Log & Notifications"
            >
              <Bell className="w-5 h-5" />
              {auditLog.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Activity Log
                  </span>
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {auditLog.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-teal-600 dark:text-teal-400">
                          {log.transactionId}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            log.operation === 'COMMIT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.operation === 'ROLLBACK'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {log.operation} • {log.tableName}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                        {log.details}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono text-right">
                        {log.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile & Role Switcher */}
          <div ref={adminRef} className="relative">
            <button
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B2559] to-[#15529E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {activeAdmin.Avatar || activeAdmin.Name.slice(0, 2).toUpperCase()}
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {activeAdmin.Name}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-32">
                  {activeAdmin.Role}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isAdminDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Signed in Admin</div>
                  <div className="text-xs text-slate-500 truncate">{activeAdmin.Email}</div>
                  <div className="mt-1">
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                      PK: Admin_ID #{activeAdmin.Admin_ID}
                    </span>
                  </div>
                </div>

                {/* Switch Admin Persona (Backed by Admin table) */}
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Officer Account
                  </div>
                  {admins.map((adm) => (
                    <button
                      key={adm.Admin_ID}
                      onClick={() => {
                        setActiveAdmin(adm);
                        setIsAdminDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between cursor-pointer ${
                        activeAdmin.Admin_ID === adm.Admin_ID
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center font-bold">
                          {adm.Avatar}
                        </span>
                        <span>{adm.Name}</span>
                      </div>
                      {activeAdmin.Admin_ID === adm.Admin_ID && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* View Switcher: Admin Mode vs Policyholder Mode */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                    Role Persona
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                    <button
                      onClick={() => {
                        setRole('admin');
                        setIsAdminDropdownOpen(false);
                      }}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all ${
                        currentRole === 'admin'
                          ? 'bg-white dark:bg-slate-700 text-[#15529E] dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        setRole('customer');
                        setActiveSection('claims');
                        setIsAdminDropdownOpen(false);
                      }}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all ${
                        currentRole === 'customer'
                          ? 'bg-white dark:bg-slate-700 text-[#15529E] dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Customer View
                    </button>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 px-3">
                  <button
                    onClick={() => { setIsAdminDropdownOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
