import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Layers,
  PieChart,
  Heart,
  Car,
  Home,
  Plane,
  Shield
} from 'lucide-react';
import { PolicyType } from '../../types/database';

export const ReportsAnalyticsView: React.FC = () => {
  const {
    customers,
    policies,
    claims,
    payments,
    detailedClaims,
    categoryAnalytics,
    addToast,
  } = useDatabase();

  const [selectedCategory, setSelectedCategory] = useState<PolicyType | 'ALL'>('ALL');

  // Overall financial summary
  const totalPremiums = policies.reduce((sum, p) => sum + p.Premium, 0);
  const totalClaimed = claims.reduce((sum, c) => sum + c.Claim_Amount, 0);
  const totalPaid = payments
    .filter((p) => p.Payment_Status === 'Completed')
    .reduce((sum, p) => sum + p.Amount, 0);

  const overallLossRatio = totalPremiums > 0 ? Math.round((totalPaid / totalPremiums) * 100) : 0;

  const totalResolved = claims.filter(
    (c) => c.Claim_Status === 'Approved' || c.Claim_Status === 'Paid' || c.Claim_Status === 'Rejected'
  ).length;

  const overallApprovalRate = totalResolved > 0
    ? Math.round(
        (claims.filter((c) => c.Claim_Status === 'Approved' || c.Claim_Status === 'Paid').length /
          totalResolved) *
          100
      )
    : 0;

  // CSV Export functions
  const exportCustomersCSV = () => {
    const headers = ['Customer_ID', 'Name', 'Phone', 'Email', 'Address'];
    const rows = customers.map((c) => [
      c.Customer_ID,
      `"${c.Name}"`,
      c.Phone,
      c.Email,
      `"${c.Address}"`,
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), 'claimvault_customers_3nf.csv');
    addToast('CSV Exported', 'Downloaded claimvault_customers_3nf.csv successfully.', 'success');
  };

  const exportClaimsCSV = () => {
    const headers = ['Claim_ID', 'Policy_ID', 'Customer_Name', 'Policy_Type', 'Claim_Date', 'Claim_Amount', 'Claim_Status', 'Description'];
    const rows = detailedClaims.map((c) => [
      c.Claim_ID,
      c.Policy_ID,
      `"${c.customer.Name}"`,
      c.policy.Policy_Type,
      c.Claim_Date,
      c.Claim_Amount,
      c.Claim_Status,
      `"${c.Description.replace(/"/g, '""')}"`,
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), 'claimvault_claims_ledger.csv');
    addToast('CSV Exported', 'Downloaded claimvault_claims_ledger.csv successfully.', 'success');
  };

  const exportPaymentsCSV = () => {
    const headers = ['Payment_ID', 'Claim_ID', 'Payment_Date', 'Amount', 'Payment_Status', 'Transaction_Ref'];
    const rows = payments.map((p) => [
      p.Payment_ID,
      p.Claim_ID,
      p.Payment_Date,
      p.Amount,
      p.Payment_Status,
      p.Transaction_Ref || 'N/A',
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), 'claimvault_payments_payouts.csv');
    addToast('CSV Exported', 'Downloaded claimvault_payments_payouts.csv successfully.', 'success');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="space-y-6">
      {/* Title & One-Click CSV Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#15529E]" />
            Reports, Analytics &amp; Data Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-dimensional risk telemetry, loss ratios, and instant 1-click relational data exports.
          </p>
        </div>

        {/* 1-Click CSV Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCustomersCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Customers CSV</span>
          </button>

          <button
            onClick={exportClaimsCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Export Claims CSV</span>
          </button>

          <button
            onClick={exportPaymentsCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#15529E] hover:bg-[#114280] text-white shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Premiums Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            ₹{totalPremiums.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            From {policies.length} active policy bindings
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Disbursed Claims</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#008B9E] dark:text-teal-400 font-mono">
            ₹{totalPaid.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Atomic settlement transactions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Overall Loss Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {overallLossRatio}%
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Formula: Disbursed Payouts / Premiums
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Claim Approval Rate</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {overallApprovalRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Based on {totalResolved} adjudicated claims
          </div>
        </div>
      </div>

      {/* Insurance Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#15529E]" />
              Breakdown by Insurance Category (3NF Aggregation)
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated across Health, Vehicle, Life, Property, and Travel policy lines.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Policies Bound</th>
                <th className="py-3 px-4 text-center">Claims Volume</th>
                <th className="py-3 px-4">Approved / Paid</th>
                <th className="py-3 px-4">Rejected</th>
                <th className="py-3 px-4">Approval Rate</th>
                <th className="py-3 px-4">Total Claimed</th>
                <th className="py-3 px-4">Total Disbursed</th>
                <th className="py-3 px-4">Category Loss Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {categoryAnalytics.map((cat) => (
                <tr
                  key={cat.policyType}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(cat.policyType)}
                      <span>{cat.policyType}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    {cat.totalPolicies}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {cat.totalClaimsCount}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {cat.approvedCount + cat.paidCount} ({cat.paidCount} Settled)
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono text-rose-600 dark:text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {cat.rejectedCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span>{cat.approvalRate}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${cat.approvalRate}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    ₹{cat.totalClaimedAmount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-[#008B9E] dark:text-teal-400">
                    ₹{cat.totalPaidAmount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        cat.lossRatio > 100
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {cat.lossRatio}%
                    </span>
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
