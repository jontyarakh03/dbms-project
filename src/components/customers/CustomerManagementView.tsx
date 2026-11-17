import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Customer, Policy, ClaimDetailedView } from '../../types/database';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  X,
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  Shield
} from 'lucide-react';

export const CustomerManagementView: React.FC = () => {
  const {
    customers,
    policies,
    detailedClaims,
    setIsRegisterCustomerOpen,
    setIsIssuePolicyOpen,
    setIsFileClaimOpen,
    updateCustomer,
    deleteCustomer,
    setSelectedClaimForDetail,
    setActiveSection,
  } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'Customer_ID' | 'Name' | 'Phone' | 'Email'>('Customer_ID');
  const [sortAsc, setSortAsc] = useState(true);

  // Slide-over detail drawer state
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);

  // Edit customer modal state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Delete protection modal state
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setEditName(c.Name);
    setEditAddress(c.Address);
    setEditPhone(c.Phone);
    setEditEmail(c.Email);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      updateCustomer(editingCustomer.Customer_ID, {
        Name: editName.trim(),
        Address: editAddress.trim(),
        Phone: editPhone.trim(),
        Email: editEmail.trim(),
      });
      setEditingCustomer(null);
      if (drawerCustomer && drawerCustomer.Customer_ID === editingCustomer.Customer_ID) {
        setDrawerCustomer({
          ...drawerCustomer,
          Name: editName.trim(),
          Address: editAddress.trim(),
          Phone: editPhone.trim(),
          Email: editEmail.trim(),
        });
      }
    } catch {
      // Error is alerted through toast
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    try {
      deleteCustomer(deleteTarget.Customer_ID);
      if (drawerCustomer && drawerCustomer.Customer_ID === deleteTarget.Customer_ID) {
        setDrawerCustomer(null);
      }
      setDeleteTarget(null);
      setDeleteErrorMsg(null);
    } catch (err: any) {
      setDeleteErrorMsg(err.message);
    }
  };

  // Filter & sort
  const filteredCustomers = customers
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.Name.toLowerCase().includes(q) ||
        c.Email.toLowerCase().includes(q) ||
        c.Phone.includes(q) ||
        c.Address.toLowerCase().includes(q) ||
        String(c.Customer_ID).includes(q)
      );
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Drawer helper: linked policies & claims
  const drawerPolicies = drawerCustomer
    ? policies.filter((p) => p.Customer_ID === drawerCustomer.Customer_ID)
    : [];

  const drawerClaims = drawerCustomer
    ? detailedClaims.filter((c) => c.customer.Customer_ID === drawerCustomer.Customer_ID)
    : [];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#15529E]" />
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            3NF Customer Registry with duplicate phone/email integrity validation and 1:N relational drawer.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterCustomerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#15529E] hover:bg-[#114280] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register Customer</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#15529E]"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>Showing <strong className="text-slate-900 dark:text-white">{filteredCustomers.length}</strong> of {customers.length} registered customers</span>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('Customer_ID')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer ID (PK)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Address</th>
                <th
                  onClick={() => handleSort('Phone')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Phone (Unique)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Email')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Email (Unique)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Policies (1:N)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((cust) => {
                const linkedPols = policies.filter((p) => p.Customer_ID === cust.Customer_ID);
                const linkedClms = detailedClaims.filter((c) => c.customer.Customer_ID === cust.Customer_ID);

                return (
                  <tr
                    key={cust.Customer_ID}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                      #{cust.Customer_ID}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {cust.Name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.Address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cust.Phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cust.Email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <ShieldCheck className="w-3 h-3" />
                        {linkedPols.length} {linkedPols.length === 1 ? 'Policy' : 'Policies'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDrawerCustomer(cust)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#15529E] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          title="View linked policies and claims"
                        >
                          Details (1:N)
                        </button>

                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteTarget(cust);
                            setDeleteErrorMsg(null);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete Customer (referential integrity enforced)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer (1:N View) */}
      {drawerCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerCustomer(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base">
                    {drawerCustomer.Name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {drawerCustomer.Name}
                    </h2>
                    <span className="font-mono text-xs text-slate-400">
                      PK: Customer_ID #{drawerCustomer.Customer_ID}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerCustomer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Contact Information */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                    Customer Profile &amp; Contact
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drawerCustomer.Email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drawerCustomer.Phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{drawerCustomer.Address}</span>
                  </div>
                </div>

                {/* Linked Policies (1:N) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Linked Policies ({drawerPolicies.length})
                    </h3>
                    <button
                      onClick={() => {
                        setDrawerCustomer(null);
                        setIsIssuePolicyOpen(true);
                      }}
                      className="text-xs font-semibold text-[#15529E] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Issue Policy
                    </button>
                  </div>

                  {drawerPolicies.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No policies issued to this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {drawerPolicies.map((pol) => (
                        <div
                          key={pol.Policy_ID}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 transition-colors text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {pol.Policy_Type} Insurance
                            </span>
                            <span className="font-mono text-[11px] font-bold text-[#15529E] dark:text-blue-400">
                              Policy #{pol.Policy_ID}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>Premium: <strong className="font-mono text-slate-800 dark:text-slate-200">₹{pol.Premium.toLocaleString()}</strong></span>
                            <span className="text-[11px] font-mono">Until {pol.End_Date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Linked Claims (1:N) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      Linked Claims ({drawerClaims.length})
                    </h3>
                    <button
                      onClick={() => {
                        setDrawerCustomer(null);
                        setIsFileClaimOpen(true);
                      }}
                      className="text-xs font-semibold text-[#15529E] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> File Claim
                    </button>
                  </div>

                  {drawerClaims.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No claims filed by this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {drawerClaims.map((clm) => (
                        <div
                          key={clm.Claim_ID}
                          onClick={() => {
                            setSelectedClaimForDetail(clm);
                            setActiveSection('claims');
                            setDrawerCustomer(null);
                          }}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-amber-400 cursor-pointer transition-colors text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              Claim #{clm.Claim_ID}
                            </span>
                            <StatusBadge status={clm.Claim_Status} size="sm" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-1">
                            {clm.Description}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              ₹{clm.Claim_Amount.toLocaleString()}
                            </span>
                            <span className="font-mono">{clm.Claim_Date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Customer #{editingCustomer.Customer_ID}
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone (Must be Unique)
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Must be Unique)
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#15529E] hover:bg-[#114280] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Referential Integrity Protection Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Customer #{deleteTarget.Customer_ID}?
                </h3>
                <p className="text-xs text-slate-500">Referential Integrity Pre-Check</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are about to delete <strong>{deleteTarget.Name}</strong>. If this customer has active policies bound in the <code>Policy</code> table, the DBMS will trigger an <strong>ON DELETE RESTRICT</strong> foreign key violation.
            </p>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-mono">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteErrorMsg(null);
                }}
                className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Execute DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
