import React from 'react';
import { ClaimDetailedView } from '../../types/database';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Download,
  Building2,
  Calendar,
  CreditCard,
  Hash
} from 'lucide-react';

interface PaymentReceiptModalProps {
  claim: ClaimDetailedView | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !claim) return null;

  const payment = claim.payment;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Control Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Electronic Payment Voucher
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Area */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:m-0" id="printable-receipt">
          {/* Header of Voucher */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">SureShield General Insurance</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Claims Settlement & Disbursement Office • IRDAI Reg No: DBMS-CS304-2026
              </p>
              <p className="text-[11px] text-slate-400">Shivajinagar, Pune, Maharashtra 411005</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                SETTLEMENT PAID
              </span>
              <div className="text-xs font-mono text-slate-500 mt-2">
                Voucher #: <strong>REC-{payment?.Payment_ID || '401'}-2026</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Date: {payment?.Payment_Date || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Key Reference Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Payment ID (PK)</div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                #{payment?.Payment_ID || '401'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Claim ID (FK)</div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                #{claim.Claim_ID}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Policy Number</div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                POL-{claim.Policy_ID} ({claim.policy.Policy_Type})
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Transaction Ref</div>
              <div className="text-xs font-bold font-mono text-blue-700 mt-0.5 truncate">
                {payment?.Transaction_Ref || 'TXN-HDFC-991204'}
              </div>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Policyholder (Beneficiary)
              </h4>
              <div>
                <span className="text-slate-400">Name:</span> <strong className="text-slate-800">{claim.customer.Name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Customer ID:</span> <span className="font-mono text-slate-700">#{claim.customer.Customer_ID}</span>
              </div>
              <div>
                <span className="text-slate-400">Address:</span> <span className="text-slate-700">{claim.customer.Address}</span>
              </div>
              <div>
                <span className="text-slate-400">Phone / Email:</span> <span className="text-slate-700">{claim.customer.Phone} • {claim.customer.Email}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Settlement & Banking Details
              </h4>
              <div>
                <span className="text-slate-400">Settlement Status:</span>{' '}
                <span className="text-emerald-700 font-bold">Completed & Disbursed</span>
              </div>
              <div>
                <span className="text-slate-400">Payment Mode:</span>{' '}
                <span className="text-slate-700 font-medium">NEFT / RTGS Bank Transfer</span>
              </div>
              <div>
                <span className="text-slate-400">Incident Description:</span>{' '}
                <p className="text-slate-700 text-[11px] mt-0.5 italic line-clamp-2">
                  "{claim.Description}"
                </p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Line Item & Description</th>
                  <th className="py-2.5 px-4 font-bold text-right">Admitted Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <div>Gross Assessed Claim Loss</div>
                    <div className="text-[11px] text-slate-400 font-normal">Claim #{claim.Claim_ID} filed on {claim.Claim_Date}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    ₹{claim.Claim_Amount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div>Policy Deductible & Adjustments</div>
                    <div className="text-[11px] text-slate-400 font-normal">Zero-deductible comprehensive academic policy tier</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    ₹0.00
                  </td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                  <td className="py-3.5 px-4 text-sm">
                    Net Settlement Disbursed (Payment.Amount)
                  </td>
                  <td className="py-3.5 px-4 text-right text-base font-mono text-emerald-700">
                    ₹{(payment?.Amount || claim.Claim_Amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic DBMS Certification Seal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified under 3NF Referential Integrity constraints.</span>
            </div>
            <div className="font-mono text-slate-400">
              DBMS Project: Abhishek Patil & Jonty Arakh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

