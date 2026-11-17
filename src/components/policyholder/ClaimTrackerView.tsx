import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  Search,
  PlusCircle,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ClaimTrackerViewProps {
  onFileClaim?: () => void;
}

export const ClaimTrackerView: React.FC<ClaimTrackerViewProps> = ({ onFileClaim }) => {
  const { detailedClaims, activeCustomer, setSelectedClaimForDetail, setIsFileClaimOpen } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const customerClaims = detailedClaims.filter(
    (c) => c.customer.Customer_ID === activeCustomer?.Customer_ID
  );

  const filtered = customerClaims.filter((c) =>
    String(c.Claim_ID).includes(searchTerm) ||
    c.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.policy.Policy_Type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Claims &amp; Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Real-time status updates for claims filed under policyholder {activeCustomer?.Name}.
          </p>
        </div>

        <button
          onClick={() => {
            if (onFileClaim) onFileClaim();
            else setIsFileClaimOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#15529E] text-white rounded-xl text-xs font-bold"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>File Claim</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card p-4">
        <input
          type="text"
          placeholder="Search claims..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        />

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No claims found for this customer.
            </div>
          ) : (
            filtered.map((clm) => (
              <div key={clm.Claim_ID} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Claim #{clm.Claim_ID} — {clm.policy.Policy_Type} Insurance
                  </div>
                  <div className="text-[11px] text-slate-400">{clm.Description}</div>
                  <div className="font-mono text-slate-500 mt-1">₹{clm.Claim_Amount.toLocaleString()} • Filed on {clm.Claim_Date}</div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={clm.Claim_Status} size="sm" />
                  <button
                    onClick={() => setSelectedClaimForDetail(clm)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#15529E] hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
