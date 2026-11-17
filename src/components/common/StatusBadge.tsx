import React from 'react';
import { ClaimStatus, PaymentStatus } from '../../types/database';
import { Clock, Search, CheckCircle2, XCircle, DollarSign, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: ClaimStatus | PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let icon = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    case 'Pending':
      // Amber
      styleClasses = 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-400/20 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      break;

    case 'Under Verification':
      // Indigo/Purple
      styleClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-400/20 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60';
      icon = <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />;
      break;

    case 'Approved':
      // Emerald Green
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      break;

    case 'Rejected':
      // Crimson Red
      styleClasses = 'bg-rose-50 text-rose-800 border-rose-200 ring-1 ring-rose-400/20 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      break;

    case 'Paid':
      // Teal / Blue
      styleClasses = 'bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-400/20 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60';
      icon = <DollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      break;

    case 'Processing':
      // Blue / Indigo
      styleClasses = 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
      icon = <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />;
      break;

    case 'Completed':
      // Emerald / Teal
      styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${styleClasses} ${sizeClasses} transition-all shadow-2xs select-none`}>
      {showIcon && icon}
      <span className="tracking-tight">{status}</span>
    </span>
  );
};
