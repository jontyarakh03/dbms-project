import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDatabase();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-white text-slate-800 shadow-emerald-500/10';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-white text-slate-800 shadow-rose-500/10';
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-white text-slate-800 shadow-amber-500/10';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${borderClass} transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

