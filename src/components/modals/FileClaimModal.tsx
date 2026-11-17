import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Policy, Customer } from '../../types/database';
import {
  FileText,
  X,
  DollarSign,
  Calendar,
  User,
  ShieldCheck,
  Upload,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface FileClaimModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultPolicyId?: number;
  onClaimSuccess?: (claimId: number) => void;
}

export const FileClaimModal: React.FC<FileClaimModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  defaultPolicyId,
  onClaimSuccess,
}) => {
  const {
    isFileClaimOpen,
    setIsFileClaimOpen,
    customers,
    policies,
    fileClaim,
    selectedCustomerId,
    setSelectedClaimForDetail,
    detailedClaims,
  } = useDatabase();

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : isFileClaimOpen;
  const handleClose = propOnClose || (() => setIsFileClaimOpen(false));

  const [customerId, setCustomerId] = useState<number>(selectedCustomerId || customers[0]?.Customer_ID || 101);
  const [policyId, setPolicyId] = useState<number>(defaultPolicyId || 0);
  const [claimAmount, setClaimAmount] = useState<string>('25000');
  const [claimDate, setClaimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [docName, setDocName] = useState<string>('Hospital_Discharge_Summary.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter policies belonging to chosen customer
  const customerPolicies = policies.filter((p) => p.Customer_ID === customerId);

  useEffect(() => {
    if (defaultPolicyId) {
      setPolicyId(defaultPolicyId);
      const matchedPol = policies.find((p) => p.Policy_ID === defaultPolicyId);
      if (matchedPol) setCustomerId(matchedPol.Customer_ID);
    } else if (customerPolicies.length > 0 && (!policyId || !customerPolicies.some((p) => p.Policy_ID === policyId))) {
      setPolicyId(customerPolicies[0].Policy_ID);
    }
  }, [customerId, defaultPolicyId, policies]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyId) return;

    setIsSubmitting(true);
    try {
      const created = await fileClaim({
        policyId: Number(policyId),
        amount: Number(claimAmount),
        date: claimDate,
        description: description.trim(),
        supportingDocName: docName.trim() || 'Claim_Supporting_Document.pdf',
      });

      handleClose();
      if (onClaimSuccess) {
        onClaimSuccess(created.Claim_ID);
      }
    } catch {
      // Toast handles error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                File Insurance Claim
              </h2>
              <p className="text-xs text-slate-500">
                Inserts into <code>Claim</code> entity (referencing <code>Policy.Policy_ID</code>).
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Policyholder (Customer) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={customerId}
                onChange={(e) => {
                  const newCustId = Number(e.target.value);
                  setCustomerId(newCustId);
                  const firstPol = policies.find((p) => p.Customer_ID === newCustId);
                  if (firstPol) setPolicyId(firstPol.Policy_ID);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#15529E]"
              >
                {customers.map((c) => (
                  <option key={c.Customer_ID} value={c.Customer_ID}>
                    #{c.Customer_ID} — {c.Name} ({c.Phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bound Policy Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Bound Policy (Foreign Key: <code>Policy_ID</code>) <span className="text-rose-500">*</span>
            </label>
            {customerPolicies.length === 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                This customer has no active policies registered. Please issue a policy first before filing a claim.
              </div>
            ) : (
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#15529E]"
                >
                  {customerPolicies.map((p) => (
                    <option key={p.Policy_ID} value={p.Policy_ID}>
                      Policy #{p.Policy_ID} — {p.Policy_Type} Insurance (Coverage until {p.End_Date})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Claim Amount & Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Claim Amount (₹) <span className="text-rose-500">* (CHECK &gt; 0)</span>
              </label>
              <div className="relative">
                <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="500"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incident Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
                />
              </div>
            </div>
          </div>

          {/* Incident Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Incident Description &amp; Loss Particulars <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Emergency hospitalization expenses for acute gastroenteritis treatment and intravenous fluid therapy."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
            />
          </div>

          {/* Supporting Document Upload Preview */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supporting Verification Evidence (Document Upload)
            </label>
            <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-slate-400" />
                <div>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Document filename (e.g. Hospital_Invoice_309.pdf)"
                    className="text-xs bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-hidden font-mono text-slate-800 dark:text-slate-200 w-52 sm:w-64"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">Mock document preview mapped to Claim record</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                PDF Attached
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || customerPolicies.length === 0}
              className="px-5 py-2 rounded-xl bg-[#15529E] hover:bg-[#114280] text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Filing...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
