import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ClaimDetailedView, ClaimStatus } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { ClaimVerificationDrawer } from './ClaimVerificationDrawer';
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Shield,
  CreditCard,
  User,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';

export const ClaimsManagementView: React.FC = () => {
  const {
    detailedClaims,
    setIsFileClaimOpen,
    selectedClaimForDetail,
    setSelectedClaimForDetail,
    currentRole,
    activeCustomer,
  } = useDatabase();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'Claim_ID' | 'Claim_Amount' | 'Claim_Date'>('Claim_ID');
  const [sortAsc, setSortAsc] = useState(false); // default newest/highest first

  const statusOptions: { label: string; value: string; color: string }[] = [
    { label: 'All', value: 'ALL', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    { label: 'Pending', value: 'Pending', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200' },
    { label: 'Under Verification', value: 'Under Verification', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200' },
    { label: 'Approved', value: 'Approved', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200' },
    { label: 'Rejected', value: 'Rejected', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200' },
    { label: 'Paid', value: 'Paid', color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200' },
  ];

  // If in customer role, filter to that customer's claims
  const baseClaims = currentRole === 'customer'
    ? detailedClaims.filter((c) => c.customer.Customer_ID === activeCustomer?.Customer_ID)
    : detailedClaims;

  const filtered = baseClaims
    .filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.Claim_Status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        String(c.Claim_ID).includes(q) ||
        String(c.Policy_ID).includes(q) ||
        c.customer.Name.toLowerCase().includes(q) ||
        c.policy.Policy_Type.toLowerCase().includes(q) ||
        c.Description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#15529E]" />
            Claim Adjudication &amp; 7-Step Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {currentRole === 'customer'
              ? `Viewing claims filed by ${activeCustomer?.Name} (#${activeCustomer?.Customer_ID}).`
              : 'Interactive 7-step horizontal verification drawer with atomic SQL transaction payment settlement.'}
          </p>
        </div>

        <button
          onClick={() => setIsFileClaimOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#15529E] hover:bg-[#114280] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ File New Claim</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {statusOptions.map((opt) => {
              const count = opt.value === 'ALL'
                ? baseClaims.length
                : baseClaims.filter((c) => c.Claim_Status === opt.value).length;

              const isSelected = statusFilter === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#15529E] text-white shadow-xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by claim ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15529E]"
            />
          </div>
        </div>
      </div>

      {/* Main Claims Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('Claim_ID')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Claim ID (PK)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Customer Entity</th>
                <th className="py-3 px-4">Policy Bound</th>
                <th
                  onClick={() => handleSort('Claim_Date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Filing Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Claim_Amount')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Claim Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Fraud Risk Score</th>
                <th className="py-3 px-4">Payment Voucher</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((clm) => (
                <tr
                  key={clm.Claim_ID}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                    #{clm.Claim_ID}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {clm.customer.Name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      #{clm.customer.Customer_ID} • {clm.customer.Phone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {clm.policy.Policy_Type} (#{clm.policy.Policy_ID})
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {clm.Claim_Date}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{clm.Claim_Amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={clm.Claim_Status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        clm.fraudAssessment?.Risk_Level === 'Critical'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                          : clm.fraudAssessment?.Risk_Level === 'High'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                          : clm.fraudAssessment?.Risk_Level === 'Medium'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {clm.fraudAssessment?.Risk_Score || 10}/100 ({clm.fraudAssessment?.Risk_Level || 'Low'})
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    {clm.payment ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        clm.payment.Payment_Status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        #{clm.payment.Payment_ID} ({clm.payment.Payment_Status})
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedClaimForDetail(clm)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#15529E] hover:bg-[#114280] text-white shadow-2xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>7-Step Workflow</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Verification Slide-over Drawer */}
      {selectedClaimForDetail && (
        <ClaimVerificationDrawer
          claim={selectedClaimForDetail}
          onClose={() => setSelectedClaimForDetail(null)}
        />
      )}
    </div>
  );
};
