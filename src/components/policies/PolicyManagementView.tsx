import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Policy, PolicyType } from '../../types/database';
import {
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Shield,
  FileText,
  AlertTriangle,
  Heart,
  Car,
  Home,
  Plane,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

export const PolicyManagementView: React.FC = () => {
  const {
    policies,
    customers,
    claims,
    setIsIssuePolicyOpen,
    setIsFileClaimOpen,
    deletePolicy,
    setActiveSection,
    setSelectedClaimForDetail,
    detailedClaims,
  } = useDatabase();

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const policyTypes: PolicyType[] = ['Health', 'Vehicle', 'Life', 'Property', 'Travel'];

  const getCategoryIcon = (type: PolicyType) => {
    switch (type) {
      case 'Health':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Vehicle':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'Life':
        return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'Property':
        return <Home className="w-4 h-4 text-amber-500" />;
      case 'Travel':
        return <Plane className="w-4 h-4 text-teal-500" />;
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    try {
      deletePolicy(deleteTarget.Policy_ID);
      setDeleteTarget(null);
      setDeleteErrorMsg(null);
    } catch (err: any) {
      setDeleteErrorMsg(err.message);
    }
  };

  // Filter policies
  const filteredPolicies = policies.filter((p) => {
    const matchesType = selectedTypeFilter === 'ALL' || p.Policy_Type === selectedTypeFilter;
    const cust = customers.find((c) => c.Customer_ID === p.Customer_ID);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      String(p.Policy_ID).includes(q) ||
      p.Policy_Type.toLowerCase().includes(q) ||
      (cust && cust.Name.toLowerCase().includes(q)) ||
      String(p.Customer_ID).includes(q);
    return matchesType && matchesSearch;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Policy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            3NF Policy Registry with Foreign Key binding to Customer and active duration validation.
          </p>
        </div>

        <button
          onClick={() => setIsIssuePolicyOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#15529E] hover:bg-[#114280] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Issue New Policy</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-[#15529E] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Types ({policies.length})
            </button>

            {policyTypes.map((type) => {
              const count = policies.filter((p) => p.Policy_Type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
                    selectedTypeFilter === type
                      ? 'bg-[#15529E] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(type)}
                  <span>{type}</span>
                  <span className="font-mono text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by policy ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15529E]"
            />
          </div>
        </div>
      </div>

      {/* Policies Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Policy ID (PK)</th>
                <th className="py-3 px-4">Customer (FK)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Annual Premium</th>
                <th className="py-3 px-4">Coverage Period</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4 text-center">Linked Claims</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPolicies.map((pol) => {
                const customer = customers.find((c) => c.Customer_ID === pol.Customer_ID);
                const isExpired = new Date(pol.End_Date) < new Date(today);
                const linkedClaims = claims.filter((c) => c.Policy_ID === pol.Policy_ID);

                return (
                  <tr
                    key={pol.Policy_ID}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                      #{pol.Policy_ID}
                    </td>

                    <td className="py-3.5 px-4">
                      {customer ? (
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {customer.Name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            FK: Customer_ID #{customer.Customer_ID}
                          </div>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-mono">FK Orphaned #{pol.Customer_ID}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {getCategoryIcon(pol.Policy_Type)}
                        <span>{pol.Policy_Type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{pol.Premium.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      <div className="text-xs">{pol.Start_Date}</div>
                      <div className="text-[11px] text-slate-400">to {pol.End_Date}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Active Coverage
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                        {linkedClaims.length} Claims
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setIsFileClaimOpen(true)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#15529E] dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                          title="File claim under this policy"
                        >
                          + Claim
                        </button>

                        <button
                          onClick={() => {
                            setDeleteTarget(pol);
                            setDeleteErrorMsg(null);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete Policy (referential integrity enforced)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Referential Integrity Protection Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Policy #{deleteTarget.Policy_ID}?
                </h3>
                <p className="text-xs text-slate-500">Referential Integrity Pre-Check</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are about to delete <strong>Policy #{deleteTarget.Policy_ID} ({deleteTarget.Policy_Type})</strong>. If any claims exist in the <code>Claim</code> table referencing this policy, the DBMS will enforce <strong>ON DELETE RESTRICT</strong> to maintain referential integrity.
            </p>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-mono">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteErrorMsg(null);
                }}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Execute DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
