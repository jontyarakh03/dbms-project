import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { PolicyType } from '../../types/database';
import { ShieldCheck, X, DollarSign, Calendar, User, Shield, Layers } from 'lucide-react';

export const IssuePolicyModal: React.FC = () => {
  const { isIssuePolicyOpen, setIsIssuePolicyOpen, customers, addPolicy } = useDatabase();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.Customer_ID || 101);
  const [policyType, setPolicyType] = useState<PolicyType>('Health');
  const [premium, setPremium] = useState<string>('15000');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Default end date is 1 year from now
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const [endDate, setEndDate] = useState<string>(nextYear.toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isIssuePolicyOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      addPolicy({
        Customer_ID: Number(selectedCustomerId),
        Policy_Type: policyType,
        Premium: Number(premium),
        Start_Date: startDate,
        End_Date: endDate,
      });
      setIsIssuePolicyOpen(false);
    } catch {
      // Error handled via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const policyTypes: PolicyType[] = ['Health', 'Vehicle', 'Life', 'Property', 'Travel'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Insurance Policy
              </h2>
              <p className="text-xs text-slate-500">
                Binds <code>Policy</code> entity to existing <code>Customer</code> via Foreign Key.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsIssuePolicyOpen(false)}
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
              Select Customer (Foreign Key: <code>Customer_ID</code>) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#15529E]"
              >
                {customers.map((c) => (
                  <option key={c.Customer_ID} value={c.Customer_ID}>
                    #{c.Customer_ID} — {c.Name} ({c.Phone}, {c.Email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Policy Type Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Policy Type Category (<code>CHECK</code> Constraint) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {policyTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setPolicyType(type)}
                  className={`py-2 px-2 rounded-xl font-bold text-center border transition-all cursor-pointer ${
                    policyType === type
                      ? 'bg-[#15529E] text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Premium (₹) <span className="text-rose-500">* (CHECK &gt; 0)</span>
            </label>
            <div className="relative">
              <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="500"
                required
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Policy Start Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Policy End Date <span className="text-rose-500">* (End &gt;= Start)</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsIssuePolicyOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Issuing...' : 'Issue Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
