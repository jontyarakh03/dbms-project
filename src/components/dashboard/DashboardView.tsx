import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PlusCircle,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  ArrowRight
} from 'lucide-react';
import { ClaimDetailedView, PolicyType } from '../../types/database';

export const DashboardView: React.FC = () => {
  const {
    customers,
    policies,
    claims,
    payments,
    detailedClaims,
    categoryAnalytics,
    setIsRegisterCustomerOpen,
    setIsIssuePolicyOpen,
    setIsFileClaimOpen,
    setSelectedClaimForDetail,
    setActiveSection,
  } = useDatabase();

  // Metrics
  const totalCustomers = customers.length;
  const totalPolicies = policies.length;
  const pendingClaims = claims.filter(
    (c) => c.Claim_Status === 'Pending' || c.Claim_Status === 'Under Verification'
  );
  const pendingCount = pendingClaims.length;
  const pendingExposure = pendingClaims.reduce((sum, c) => sum + c.Claim_Amount, 0);

  const completedPayments = payments.filter((p) => p.Payment_Status === 'Completed');
  const totalDisbursed = completedPayments.reduce((sum, p) => sum + p.Amount, 0);

  // Status breakdown for Donut / distribution
  const statusCounts = {
    Pending: claims.filter((c) => c.Claim_Status === 'Pending').length,
    'Under Verification': claims.filter((c) => c.Claim_Status === 'Under Verification').length,
    Approved: claims.filter((c) => c.Claim_Status === 'Approved').length,
    Rejected: claims.filter((c) => c.Claim_Status === 'Rejected').length,
    Paid: claims.filter((c) => c.Claim_Status === 'Paid').length,
  };

  const totalClaimsCount = claims.length || 1;

  // Recent Claims joined with Customer & Policy
  const recentClaims = [...detailedClaims]
    .sort((a, b) => new Date(b.Claim_Date).getTime() - new Date(a.Claim_Date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Insurance Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time fintech telemetry, 3NF claim verification queue &amp; payout metrics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRegisterCustomerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Register Customer</span>
          </button>

          <button
            onClick={() => setIsIssuePolicyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Issue Policy</span>
          </button>

          <button
            onClick={() => setIsFileClaimOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#15529E] hover:bg-[#114280] text-white shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ File Claim</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalCustomers}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Unique Email/Phone constraints verified</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Policies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Policies
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalPolicies}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Across 5 categories (Health, Vehicle, etc.)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending/In-Review Claims */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending / In-Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {pendingCount}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Exposure: <strong className="font-mono text-slate-800 dark:text-slate-200">₹{pendingExposure.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 4: Total Disbursed Payouts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Disbursed Payouts
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-300 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#008B9E] dark:text-teal-400 font-mono">
              ₹{totalDisbursed.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedPayments.length} Completed Settlements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts: Claims by Status & Claims by Policy Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Claims by Status (Distribution Bars + Proportions) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#15529E]" />
                Claims by Lifecycle Status
              </h2>
              <p className="text-[11px] text-slate-400">Total volume: {claims.length} registered claims</p>
            </div>
            <button
              onClick={() => setActiveSection('claims')}
              className="text-xs font-semibold text-[#15529E] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Queue <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Horizontal multi-color stacked bar */}
          <div className="mt-5">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(statusCounts['Pending'] / totalClaimsCount) * 100}%` }}
                className="bg-amber-400 hover:opacity-90 transition-all"
                title={`Pending: ${statusCounts['Pending']}`}
              />
              <div
                style={{ width: `${(statusCounts['Under Verification'] / totalClaimsCount) * 100}%` }}
                className="bg-indigo-500 hover:opacity-90 transition-all"
                title={`Under Verification: ${statusCounts['Under Verification']}`}
              />
              <div
                style={{ width: `${(statusCounts['Approved'] / totalClaimsCount) * 100}%` }}
                className="bg-emerald-500 hover:opacity-90 transition-all"
                title={`Approved: ${statusCounts['Approved']}`}
              />
              <div
                style={{ width: `${(statusCounts['Paid'] / totalClaimsCount) * 100}%` }}
                className="bg-teal-500 hover:opacity-90 transition-all"
                title={`Paid: ${statusCounts['Paid']}`}
              />
              <div
                style={{ width: `${(statusCounts['Rejected'] / totalClaimsCount) * 100}%` }}
                className="bg-rose-500 hover:opacity-90 transition-all"
                title={`Rejected: ${statusCounts['Rejected']}`}
              />
            </div>

            {/* Status Breakdown Legend & Counts */}
            <div className="mt-5 space-y-2.5">
              {[
                { status: 'Pending', count: statusCounts['Pending'], color: 'bg-amber-400', textColor: 'text-amber-700 dark:text-amber-400' },
                { status: 'Under Verification', count: statusCounts['Under Verification'], color: 'bg-indigo-500', textColor: 'text-indigo-700 dark:text-indigo-400' },
                { status: 'Approved', count: statusCounts['Approved'], color: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400' },
                { status: 'Paid', count: statusCounts['Paid'], color: 'bg-teal-500', textColor: 'text-teal-700 dark:text-teal-400' },
                { status: 'Rejected', count: statusCounts['Rejected'], color: 'bg-rose-500', textColor: 'text-rose-700 dark:text-rose-400' },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{item.count}</span>
                    <span className="text-[10px] text-slate-400 font-mono w-10 text-right">
                      {Math.round((item.count / totalClaimsCount) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chart: Claims by Policy Type */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#008B9E]" />
                Claims by Insurance Category
              </h2>
              <p className="text-[11px] text-slate-400">Claim volume and financial disbursement breakdown</p>
            </div>
            <button
              onClick={() => setActiveSection('reports')}
              className="text-xs font-semibold text-[#15529E] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Detailed Reports <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Category Bar Visualizations */}
          <div className="mt-4 space-y-4">
            {categoryAnalytics.map((cat) => {
              const maxAmount = Math.max(...categoryAnalytics.map((c) => c.totalClaimedAmount), 1);
              const percentage = Math.round((cat.totalClaimedAmount / maxAmount) * 100);

              return (
                <div key={cat.policyType} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{cat.policyType}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {cat.totalClaimsCount} claims ({cat.totalPolicies} policies)
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      ₹{cat.totalClaimedAmount.toLocaleString()}
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                      className="bg-gradient-to-r from-[#15529E] to-[#008B9E] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity: Joined 3NF Table (Customer + Policy + Claim) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#15529E]" />
              Recent Claims Activity Ledger
            </h2>
            <p className="text-xs text-slate-400">
              Live joined view of Customer ➔ Policy ➔ Claim ➔ Payment
            </p>
          </div>

          <button
            onClick={() => setActiveSection('claims')}
            className="text-xs font-bold text-[#15529E] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Claims</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Policy</th>
                <th className="py-3 px-4">Claim Date</th>
                <th className="py-3 px-4">Claim Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentClaims.map((item) => (
                <tr
                  key={item.Claim_ID}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                    #{item.Claim_ID}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {item.customer.Name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ID: #{item.customer.Customer_ID} • {item.customer.Phone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.policy.Policy_Type} (#{item.policy.Policy_ID})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {item.Claim_Date}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{item.Claim_Amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.Claim_Status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedClaimForDetail(item);
                        setActiveSection('claims');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#15529E] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect / Verify</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
