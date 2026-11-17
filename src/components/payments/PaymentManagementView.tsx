import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Payment, ClaimDetailedView } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentReceiptModal } from '../policyholder/PaymentReceiptModal';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Printer,
  Sparkles,
  ArrowUpDown,
  Terminal,
  Receipt,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentManagementView: React.FC = () => {
  const {
    payments,
    detailedClaims,
    completePayment,
    selectedReceiptPayment,
    setSelectedReceiptPayment,
  } = useDatabase();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Processing' | 'Completed'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'Payment_ID' | 'Amount' | 'Payment_Date'>('Payment_ID');
  const [sortAsc, setSortAsc] = useState(false); // newest first

  // Transaction Log popover / state
  const [activeTxLogs, setActiveTxLogs] = useState<string[] | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Join payments with detailed claims
  const joinedPayments = payments.map((p) => {
    const matchedClaim = detailedClaims.find((c) => c.Claim_ID === p.Claim_ID);
    return {
      payment: p,
      claim: matchedClaim,
    };
  });

  // Filter & sort
  const filtered = joinedPayments
    .filter((item) => {
      const p = item.payment;
      const c = item.claim;
      const matchesStatus = statusFilter === 'ALL' || p.Payment_Status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        String(p.Payment_ID).includes(q) ||
        String(p.Claim_ID).includes(q) ||
        (p.Transaction_Ref && p.Transaction_Ref.toLowerCase().includes(q)) ||
        (c && c.customer.Name.toLowerCase().includes(q)) ||
        (c && c.policy.Policy_Type.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA: any = a.payment[sortField];
      let valB: any = b.payment[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  // KPIs
  const totalCompletedAmount = payments
    .filter((p) => p.Payment_Status === 'Completed')
    .reduce((sum, p) => sum + p.Amount, 0);

  const totalProcessingAmount = payments
    .filter((p) => p.Payment_Status === 'Processing')
    .reduce((sum, p) => sum + p.Amount, 0);

  const completedCount = payments.filter((p) => p.Payment_Status === 'Completed').length;
  const processingCount = payments.filter((p) => p.Payment_Status === 'Processing').length;

  const handleMarkCompleted = (paymentId: number) => {
    try {
      setProcessingId(paymentId);
      const res = completePayment(paymentId);
      setActiveTxLogs(res.txLog);

      confetti({
        particleCount: 85,
        spread: 65,
        origin: { y: 0.65 },
      });
    } catch {
      // Toast notification handles error
    } finally {
      setProcessingId(null);
    }
  };

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
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#008B9E]" />
            Payment Management &amp; Payout Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Relational 1:1 settlement ledger with one-click atomic ACID transactions (updating Payment + Claim atomically).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Disbursed Payouts (Settled)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[#008B9E] dark:text-teal-400 font-mono">
            ₹{totalCompletedAmount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {completedCount} Completed EFT Transfers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Pending Disbursement (Queue)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            ₹{totalProcessingAmount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {processingCount} Processing Vouchers Awaiting Settlement
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Payout Vouchers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {payments.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Strict 1:1 foreign key binding to Claim table
          </div>
        </div>
      </div>

      {/* Live Transaction WAL Output if recently run */}
      {activeTxLogs && (
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-1.5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              DBMS Write-Ahead Log (WAL) — Payment Settlement Transaction
            </span>
            <span className="text-emerald-400 font-bold">COMMITTED</span>
          </div>
          {activeTxLogs.map((line, idx) => (
            <div key={idx} className="leading-relaxed">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-[#15529E] text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Settlements ({payments.length})
            </button>

            <button
              onClick={() => setStatusFilter('Processing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
                statusFilter === 'Processing'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>Processing ({processingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>Completed ({completedCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Payment ID, Claim ID, Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15529E]"
            />
          </div>
        </div>
      </div>

      {/* Payments Joined Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('Payment_ID')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Payment ID (PK)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Claim ID (FK)</th>
                <th className="py-3 px-4">Beneficiary (Customer)</th>
                <th className="py-3 px-4">Policy Type</th>
                <th
                  onClick={() => handleSort('Payment_Date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Payment Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Amount')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Disbursed Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(({ payment: pay, claim }) => (
                <tr
                  key={pay.Payment_ID}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                    #{pay.Payment_ID}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    Claim #{pay.Claim_ID}
                  </td>

                  <td className="py-3.5 px-4">
                    {claim ? (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {claim.customer.Name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{claim.customer.Customer_ID} • {claim.customer.Phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Orphaned Claim #{pay.Claim_ID}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {claim ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {claim.policy.Policy_Type}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {pay.Payment_Date}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                    ₹{pay.Amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs text-blue-600 dark:text-blue-400 truncate max-w-32">
                    {pay.Transaction_Ref || '—'}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={pay.Payment_Status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {pay.Payment_Status === 'Processing' ? (
                      <button
                        onClick={() => handleMarkCompleted(pay.Payment_ID)}
                        disabled={processingId === pay.Payment_ID}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        title="Atomically update Payment=Completed and Claim=Paid"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                        <span>{processingId === pay.Payment_ID ? 'Processing...' : 'Mark Completed'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (claim) {
                            setSelectedReceiptPayment({ payment: pay, claim });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#15529E] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        title="View & Print Payment Settlement Voucher"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Voucher</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {selectedReceiptPayment && (
        <PaymentReceiptModal
          claim={selectedReceiptPayment.claim}
          isOpen={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}
    </div>
  );
};
