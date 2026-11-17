import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ClaimDetailedView, ClaimStatus } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  DollarSign,
  Calendar,
  FileText,
  FileCheck,
  Check,
  XCircle,
  CreditCard,
  Building,
  Terminal,
  ExternalLink,
  Download,
  AlertCircle,
  ShieldAlert,
  Radar,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClaimVerificationDrawerProps {
  claim: ClaimDetailedView;
  onClose: () => void;
}

export const ClaimVerificationDrawer: React.FC<ClaimVerificationDrawerProps> = ({
  claim,
  onClose,
}) => {
  const {
    startVerification,
    approveAndCreatePayment,
    rejectClaim,
    completePayment,
    activeAdmin,
    setActiveSection,
    setSelectedReceiptPayment,
    runDeepFraudScan,
    updateFraudStatus,
  } = useDatabase();

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTxLogs, setActiveTxLogs] = useState<string[] | null>(null);

  // Workflow steps definition
  // 1. Customer Registration
  // 2. Policy Creation
  // 3. Claim Filed
  // 4. Under Verification
  // 5. Approved / Rejected
  // 6. Payment Processing
  // 7. Paid
  const currentStatus = claim.Claim_Status;
  const isRejected = currentStatus === 'Rejected';
  const isApprovedOrBeyond = currentStatus === 'Approved' || currentStatus === 'Paid';
  const isPaid = currentStatus === 'Paid';
  const hasProcessingPayment = claim.payment && claim.payment.Payment_Status === 'Processing';

  // Calculate active step index (0-based)
  // Step 0: Customer Registration (always completed)
  // Step 1: Policy Creation (always completed)
  // Step 2: Claim Filed (always completed)
  // Step 3: Under Verification (active if Under Verification, done if Approved/Rejected/Paid)
  // Step 4: Approved/Rejected (active if Approved/Rejected, done if Paid)
  // Step 5: Payment Processing (active if payment is processing, done if Paid)
  // Step 6: Paid (done if Paid)
  let activeStep = 2; // Claim Filed
  if (currentStatus === 'Under Verification') activeStep = 3;
  if (currentStatus === 'Approved' && !claim.payment) activeStep = 4;
  if (currentStatus === 'Approved' && claim.payment?.Payment_Status === 'Processing') activeStep = 5;
  if (currentStatus === 'Paid') activeStep = 6;
  if (isRejected) activeStep = 4;

  const steps = [
    {
      num: 1,
      title: 'Customer Reg.',
      sub: `#${claim.customer.Customer_ID} ${claim.customer.Name}`,
      isDone: true,
    },
    {
      num: 2,
      title: 'Policy Creation',
      sub: `Policy #${claim.policy.Policy_ID} (${claim.policy.Policy_Type})`,
      isDone: true,
    },
    {
      num: 3,
      title: 'Claim Filed',
      sub: `${claim.Claim_Date} • ₹${claim.Claim_Amount.toLocaleString()}`,
      isDone: true,
    },
    {
      num: 4,
      title: 'Under Verification',
      sub: currentStatus === 'Pending' ? 'Awaiting Officer' : 'Investigation Done',
      isDone: activeStep > 3 || currentStatus === 'Under Verification' || isApprovedOrBeyond || isRejected,
      isCurrent: currentStatus === 'Under Verification',
    },
    {
      num: 5,
      title: isRejected ? 'Claim Rejected' : 'Adjudication',
      sub: isRejected ? 'Disapproved' : isApprovedOrBeyond ? 'Approved by Admin' : 'Pending Review',
      isDone: isApprovedOrBeyond || isRejected,
      isCurrent: currentStatus === 'Approved' && !claim.payment,
      isError: isRejected,
    },
    {
      num: 6,
      title: 'Payment Processing',
      sub: claim.payment ? `#${claim.payment.Payment_ID} (${claim.payment.Payment_Status})` : 'Awaiting Voucher',
      isDone: (claim.payment && claim.payment.Payment_Status === 'Completed') || isPaid,
      isCurrent: Boolean(claim.payment && claim.payment.Payment_Status === 'Processing'),
    },
    {
      num: 7,
      title: 'Paid / Disbursed',
      sub: isPaid ? (claim.payment?.Transaction_Ref || 'Settled') : 'Settlement Pending',
      isDone: isPaid,
      isCurrent: isPaid,
    },
  ];

  // Actions
  const handleStartVerification = () => {
    startVerification(claim.Claim_ID);
  };

  const handleApprove = () => {
    const res = approveAndCreatePayment(claim.Claim_ID);
    setActiveTxLogs(res.txLog);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rejectClaim(claim.Claim_ID, rejectReason);
    setRejectionModalOpen(false);
  };

  const handleMarkPaymentCompleted = () => {
    if (claim.payment) {
      const res = completePayment(claim.payment.Payment_ID);
      setActiveTxLogs(res.txLog);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-16">
        <div className="w-screen max-w-3xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2559] to-[#15529E] text-white flex items-center justify-center font-bold shadow-xs">
                <FileCheck className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Claim #{claim.Claim_ID} Verification Workflow
                  </h2>
                  <StatusBadge status={claim.Claim_Status} size="sm" />
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Policy #{claim.policy.Policy_ID} ({claim.policy.Policy_Type}) • Customer #{claim.customer.Customer_ID} ({claim.customer.Name})
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 7-STEP HORIZONTAL WORKFLOW PROGRESS BAR */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#15529E]" />
                  7-Step End-to-End Claim Adjudication Lifecycle
                </span>
                <span className="text-[11px] font-mono font-bold text-[#15529E] dark:text-blue-400">
                  Step {activeStep + 1} of 7
                </span>
              </div>

              {/* Steps Progress Row */}
              <div className="relative">
                {/* Horizontal progress bar line behind circles */}
                <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
                  {steps.map((st, idx) => {
                    const isPassed = st.isDone;
                    const isCurr = st.isCurrent;
                    const isErr = st.isError;

                    return (
                      <div key={st.num} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs
                            ${
                              isErr
                                ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950'
                                : isCurr
                                ? 'bg-[#15529E] text-white ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                            }
                          `}
                        >
                          {isErr ? (
                            <X className="w-4 h-4" />
                          ) : isPassed ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            st.num
                          )}
                        </div>

                        <span
                          className={`text-[11px] font-bold mt-2 leading-tight ${
                            isCurr
                              ? 'text-[#15529E] dark:text-blue-400'
                              : isPassed
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-400'
                          }`}
                        >
                          {st.title}
                        </span>

                        <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[90px]">
                          {st.sub}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI FRAUD RISK ASSESSMENT & HEURISTICS CARD */}
            {claim.fraudAssessment && (
              <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      AI Fraud Risk Score &amp; Anomaly Assessment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runDeepFraudScan(claim.Claim_ID)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-teal-600" />
                      <span>Re-Run Scan</span>
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        claim.fraudAssessment.Risk_Level === 'Critical'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                          : claim.fraudAssessment.Risk_Level === 'High'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                          : claim.fraudAssessment.Risk_Level === 'Medium'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {claim.fraudAssessment.Risk_Level} Risk ({claim.fraudAssessment.Risk_Score}/100)
                    </span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Recommendation: <strong className="text-slate-900 dark:text-white">{claim.fraudAssessment.Recommendation}</strong>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Status: <strong className="text-slate-700 dark:text-slate-300">{claim.fraudAssessment.Status}</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${claim.fraudAssessment.Risk_Score}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        claim.fraudAssessment.Risk_Score >= 75 ? 'bg-rose-500' :
                        claim.fraudAssessment.Risk_Score >= 55 ? 'bg-amber-500' :
                        claim.fraudAssessment.Risk_Score >= 35 ? 'bg-blue-500' :
                        'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Triggered heuristic flags */}
                {claim.fraudAssessment.Triggered_Rules.length > 0 ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Triggered AI Risk Flags ({claim.fraudAssessment.Triggered_Rules.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {claim.fraudAssessment.Triggered_Rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-[11px]">
                            <span>{rule.name}</span>
                            <span className="font-mono text-rose-600 dark:text-rose-400">+{rule.scoreImpact}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {rule.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No anomaly flags detected. Claim conforms to normal behavioral pattern.</span>
                  </div>
                )}
              </div>
            )}

            {/* Admin Workflow Action Controls */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Adjudicator Actions (Acting as: {activeAdmin.Name})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Role: {activeAdmin.Role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Start Verification */}
                {currentStatus === 'Pending' && (
                  <button
                    onClick={handleStartVerification}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Start Verification Queue</span>
                  </button>
                )}

                {/* 2. Approve & Create Payment (Atomic ACID Transaction) */}
                {(currentStatus === 'Pending' || currentStatus === 'Under Verification') && (
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Create Payment (ACID)</span>
                  </button>
                )}

                {/* 3. Reject Claim */}
                {(currentStatus === 'Pending' || currentStatus === 'Under Verification') && (
                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Claim</span>
                  </button>
                )}

                {/* 4. Complete Payment if currently Processing */}
                {hasProcessingPayment && (
                  <button
                    onClick={handleMarkPaymentCompleted}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mark Payment Completed (Disburse ₹{claim.payment?.Amount.toLocaleString()})</span>
                  </button>
                )}

                {/* 5. View Receipt if Completed */}
                {isPaid && claim.payment && (
                  <button
                    onClick={() => {
                      setSelectedReceiptPayment({ payment: claim.payment!, claim });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#15529E] dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Settlement Voucher</span>
                  </button>
                )}
              </div>

              {/* Status Notice if Rejected or Paid */}
              {isRejected && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Rejection Reason Logged:
                  </div>
                  <p className="font-mono text-[11px]">{claim.Rejection_Reason}</p>
                </div>
              )}
            </div>

            {/* Live ACID Transaction Feedback Log if just executed */}
            {activeTxLogs && (
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-teal-400" />
                    DBMS Write-Ahead Log (WAL) Execution Output
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

            {/* 3NF Relational Data Grid: Customer + Policy + Claim */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Details Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Customer Entity (1)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">PK: #{claim.customer.Customer_ID}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {claim.customer.Name}
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Phone: <strong className="font-mono text-slate-800 dark:text-slate-200">{claim.customer.Phone}</strong></div>
                  <div>Email: <strong className="font-mono text-slate-800 dark:text-slate-200">{claim.customer.Email}</strong></div>
                  <div>Address: {claim.customer.Address}</div>
                </div>
              </div>

              {/* Policy Details Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Policy Entity (N)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">PK: #{claim.policy.Policy_ID}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {claim.policy.Policy_Type} Insurance Policy
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Annual Premium: <strong className="font-mono text-slate-800 dark:text-slate-200">₹{claim.policy.Premium.toLocaleString()}</strong></div>
                  <div>Coverage Period: <span className="font-mono text-slate-800 dark:text-slate-200">{claim.policy.Start_Date} to {claim.policy.End_Date}</span></div>
                  <div>Foreign Key: <code className="text-blue-600 dark:text-blue-400">Customer_ID = {claim.customer.Customer_ID}</code></div>
                </div>
              </div>
            </div>

            {/* Incident Details & Supporting Document Preview */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Claim Entity &amp; Evidence</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">PK: #{claim.Claim_ID}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs">Claimed Amount:</span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    ₹{claim.Claim_Amount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-xs">Incident / Claim Date:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {claim.Claim_Date}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Incident Description &amp; Summary
                </label>
                <p className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {claim.Description}
                </p>
              </div>

              {/* Supporting Document Preview Card */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Attached Verification Evidence
                </label>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {claim.Supporting_Doc_Name || `Claim_Evidence_${claim.Claim_ID}.pdf`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Uploaded during claim filing • SHA-256 Verified
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Document Preview: ${claim.Supporting_Doc_Name || 'Claim_Evidence.pdf'} (Authenticity verified by Insurance Adjudication System)`)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#15529E] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reject Claim #{claim.Claim_ID}
                </h3>
                <p className="text-xs text-slate-500">Provide official justification note</p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason / Policy Clause Violation
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Policy Clause 4.2 Violation: Incident occurred during uninsured grace period."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
