import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  ShieldCheck,
  PlusCircle,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

interface MyPoliciesViewProps {
  onFileClaim?: (policyId: number) => void;
  onTrackClaims?: () => void;
}

export const MyPoliciesView: React.FC<MyPoliciesViewProps> = ({ onFileClaim, onTrackClaims }) => {
  const { policies, activeCustomer, setIsFileClaimOpen } = useDatabase();

  const customerPolicies = policies.filter(
    (p) => p.Customer_ID === activeCustomer?.Customer_ID
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Registered Policies
          </h2>
          <p className="text-xs text-slate-500">
            Active policies bound to {activeCustomer?.Name} (#{activeCustomer?.Customer_ID}).
          </p>
        </div>

        <button
          onClick={() => {
            if (onTrackClaims) onTrackClaims();
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Track Claims</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerPolicies.map((pol) => (
          <div
            key={pol.Policy_ID}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {pol.Policy_Type} Insurance
              </span>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                #{pol.Policy_ID}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <div>Premium: <strong className="font-mono text-slate-800 dark:text-slate-200">₹{pol.Premium.toLocaleString()}</strong> / year</div>
              <div>Coverage: <span className="font-mono text-slate-700 dark:text-slate-300">{pol.Start_Date} to {pol.End_Date}</span></div>
            </div>

            <button
              onClick={() => {
                if (onFileClaim) onFileClaim(pol.Policy_ID);
                else setIsFileClaimOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-[#15529E] text-white text-xs font-bold hover:bg-[#114280] transition-colors"
            >
              + File Claim on this Policy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
