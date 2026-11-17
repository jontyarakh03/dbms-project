import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { db, PREBUILT_QUERIES, PrebuiltQuery, QueryResult } from '../../database/dbEngine';
import { Admin, Customer, Policy, Claim, Payment } from '../../types/database';
import {
  Database,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Copy,
  Clock,
  Check,
  UserCheck,
  Shield,
  Table,
  BookOpen,
  History,
  Lock,
  XCircle,
  Sparkles
} from 'lucide-react';

export const DbmsExplorerView: React.FC = () => {
  const {
    auditLog,
    resetDatabase,
    addToast,
    admins,
    activeAdmin,
    setActiveAdmin,
    currentRole,
    setRole,
    customers,
    policies,
    claims,
    payments,
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'er-diagram' | 'sql-sandbox' | '3nf-proof' | 'admin-roles' | 'acid-transactions'>('er-diagram');

  // SQL Sandbox State
  const [selectedQueryId, setSelectedQueryId] = useState<string>(PREBUILT_QUERIES[0].id);
  const [customSql, setCustomSql] = useState<string>(PREBUILT_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(() => db.executeSQL(PREBUILT_QUERIES[0].sql));
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // ER Diagram selection
  const [selectedEntity, setSelectedEntity] = useState<'Customer' | 'Policy' | 'Claim' | 'Payment' | 'Admin'>('Claim');

  const handleSelectPrebuiltQuery = (q: PrebuiltQuery) => {
    setSelectedQueryId(q.id);
    setCustomSql(q.sql);
    const res = db.executeSQL(q.sql);
    setQueryResult(res);
  };

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = db.executeSQL(customSql);
      setQueryResult(res);
      setIsExecuting(false);
    }, 100);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(customSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B2559] via-[#10377e] to-[#15529E] rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#008B9E]/30 text-teal-300 border border-teal-400/30">
              ClaimVault DBMS Architecture
            </span>
            <span className="text-slate-300 text-xs">3NF Normalized Relational Store</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black mt-1.5 tracking-tight flex items-center gap-2">
            Relational DBMS, SQL Console &amp; ER Inspector
          </h1>
          <p className="text-xs text-slate-200 mt-1 max-w-2xl">
            Live interactive inspector for Entity Relationships, 3NF normalization proofs, live SQL execution sandbox, and role-based administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset database to original seed state (3 customers, 3 policies, 5 claims, 2 payments)?')) {
                resetDatabase();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed DB</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('er-diagram')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'er-diagram'
              ? 'bg-[#15529E] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Interactive ER Diagram</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql-sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'sql-sandbox'
              ? 'bg-[#15529E] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live SQL Query Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('3nf-proof')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === '3nf-proof'
              ? 'bg-[#15529E] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3NF Normalization Proof</span>
        </button>

        <button
          onClick={() => setActiveSubTab('admin-roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'admin-roles'
              ? 'bg-[#15529E] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Admin Entity &amp; Role Switcher</span>
        </button>

        <button
          onClick={() => setActiveSubTab('acid-transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'acid-transactions'
              ? 'bg-[#15529E] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>ACID Transaction Audit Log</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* TAB 1: INTERACTIVE ER DIAGRAM */}
      {/* ---------------------------------------------------------------- */}
      {activeSubTab === 'er-diagram' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Entity-Relationship (ER) Architecture
                </h2>
                <p className="text-xs text-slate-500">
                  Visual mapping of Primary Keys (PK), Foreign Keys (FK), and Cardinality linkages
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <strong>PK</strong> Primary Key
                </span>
                <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <strong>FK</strong> Foreign Key
                </span>
                <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <strong>UQ</strong> Unique
                </span>
              </div>
            </div>

            {/* Visual Cardinality Pipeline Flow */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0B2559] to-[#071630] text-white overflow-x-auto shadow-inner border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 mb-4 flex items-center justify-between">
                <span>// 3NF RELATIONAL CARDINALITY PIPELINE</span>
                <span className="text-emerald-400">● REFERENTIAL INTEGRITY CONSTRAINTS: ENFORCED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* 1. Customer */}
                <div
                  onClick={() => setSelectedEntity('Customer')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedEntity === 'Customer'
                      ? 'border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-blue-300">Customer</span>
                    <span className="text-[10px] font-mono text-slate-400">Parent (1)</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>🔑 Customer_ID</span>
                      <span className="text-slate-500">INT (PK)</span>
                    </div>
                    <div className="text-slate-300">Name: VARCHAR(100)</div>
                    <div className="text-slate-300">Address: VARCHAR(255)</div>
                    <div className="text-teal-300">Phone: VARCHAR(15) (UQ)</div>
                    <div className="text-teal-300">Email: VARCHAR(100) (UQ)</div>
                  </div>
                </div>

                {/* Arrow 1:N */}
                <div className="flex flex-col items-center justify-center text-center py-2">
                  <div className="text-[11px] font-mono font-bold text-blue-400">1 : N</div>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-0.5 bg-blue-500/60 flex-1 hidden md:block" />
                    <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">holds policies</div>
                </div>

                {/* 2. Policy */}
                <div
                  onClick={() => setSelectedEntity('Policy')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedEntity === 'Policy'
                      ? 'border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-blue-300">Policy</span>
                    <span className="text-[10px] font-mono text-slate-400">Child/Parent</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>🔑 Policy_ID</span>
                      <span className="text-slate-500">INT (PK)</span>
                    </div>
                    <div className="text-sky-300 flex items-center justify-between">
                      <span>🔗 Customer_ID</span>
                      <span className="text-slate-500">INT (FK)</span>
                    </div>
                    <div className="text-slate-300">Policy_Type: CHECK</div>
                    <div className="text-slate-300">Premium: CHECK &gt; 0</div>
                    <div className="text-slate-300">Start / End: DATE</div>
                  </div>
                </div>

                {/* Arrow 1:N */}
                <div className="flex flex-col items-center justify-center text-center py-2">
                  <div className="text-[11px] font-mono font-bold text-emerald-400">1 : N</div>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-0.5 bg-emerald-500/60 flex-1 hidden md:block" />
                    <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">files claims</div>
                </div>
              </div>

              {/* Second row: Claim and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mt-6">
                {/* Blank space for alignment */}
                <div className="hidden md:block" />
                <div className="hidden md:block" />

                {/* 3. Claim */}
                <div
                  onClick={() => setSelectedEntity('Claim')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedEntity === 'Claim'
                      ? 'border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-blue-300">Claim</span>
                    <span className="text-[10px] font-mono text-slate-400">Child/Parent</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>🔑 Claim_ID</span>
                      <span className="text-slate-500">INT (PK)</span>
                    </div>
                    <div className="text-sky-300 flex items-center justify-between">
                      <span>🔗 Policy_ID</span>
                      <span className="text-slate-500">INT (FK)</span>
                    </div>
                    <div className="text-slate-300">Claim_Date: DATE</div>
                    <div className="text-slate-300">Claim_Amount: &gt; 0</div>
                    <div className="text-slate-300">Claim_Status: CHECK</div>
                  </div>
                </div>

                {/* Arrow 1:1 settlement */}
                <div className="flex flex-col items-center justify-center text-center py-2">
                  <div className="text-[11px] font-mono font-bold text-teal-400">1 : 1</div>
                  <div className="w-full flex items-center justify-center">
                    <div className="h-0.5 bg-teal-500/60 flex-1 hidden md:block" />
                    <ArrowRight className="w-5 h-5 text-teal-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">settled via</div>
                </div>
              </div>

              {/* Third row: Payment and Admin */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mt-6">
                {/* 5. Admin */}
                <div
                  onClick={() => setSelectedEntity('Admin')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedEntity === 'Admin'
                      ? 'border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-blue-300">Admin</span>
                    <span className="text-[10px] font-mono text-slate-400">Adjudicator</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>🔑 Admin_ID</span>
                      <span className="text-slate-500">INT (PK)</span>
                    </div>
                    <div className="text-slate-300">Name: VARCHAR</div>
                    <div className="text-teal-300">Email: VARCHAR (UQ)</div>
                    <div className="text-slate-300">Password: VARCHAR</div>
                    <div className="text-slate-300">Role: VARCHAR</div>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center text-slate-500 font-mono text-[10px]">
                  <span>adjudicates claims</span>
                  <div className="h-0.5 w-16 bg-slate-700 my-1" />
                  <span>1 : N audit</span>
                </div>

                <div className="hidden md:block" />

                {/* 4. Payment */}
                <div
                  onClick={() => setSelectedEntity('Payment')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedEntity === 'Payment'
                      ? 'border-blue-400 bg-blue-950/80 shadow-lg shadow-blue-500/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                    <span className="font-bold text-sm text-blue-300">Payment</span>
                    <span className="text-[10px] font-mono text-slate-400">Settlement</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>🔑 Payment_ID</span>
                      <span className="text-slate-500">INT (PK)</span>
                    </div>
                    <div className="text-sky-300 flex items-center justify-between">
                      <span>🔗 Claim_ID</span>
                      <span className="text-slate-500">INT (FK, UQ)</span>
                    </div>
                    <div className="text-slate-300">Payment_Date: DATE</div>
                    <div className="text-slate-300">Amount: &gt; 0</div>
                    <div className="text-slate-300">Payment_Status: CHECK</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Entity Inspector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Table Inspector: <strong className="text-slate-900 dark:text-white">{selectedEntity}</strong>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Total Rows: {
                    selectedEntity === 'Customer' ? customers.length :
                    selectedEntity === 'Policy' ? policies.length :
                    selectedEntity === 'Claim' ? claims.length :
                    selectedEntity === 'Payment' ? payments.length :
                    admins.length
                  }
                </span>
              </div>

              {/* Sample Rows Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {selectedEntity === 'Customer' && (
                        <>
                          <th className="py-2 px-3">Customer_ID (PK)</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Phone (UQ)</th>
                          <th className="py-2 px-3">Email (UQ)</th>
                          <th className="py-2 px-3">Address</th>
                        </>
                      )}
                      {selectedEntity === 'Policy' && (
                        <>
                          <th className="py-2 px-3">Policy_ID (PK)</th>
                          <th className="py-2 px-3">Customer_ID (FK)</th>
                          <th className="py-2 px-3">Policy_Type</th>
                          <th className="py-2 px-3">Premium</th>
                          <th className="py-2 px-3">End_Date</th>
                        </>
                      )}
                      {selectedEntity === 'Claim' && (
                        <>
                          <th className="py-2 px-3">Claim_ID (PK)</th>
                          <th className="py-2 px-3">Policy_ID (FK)</th>
                          <th className="py-2 px-3">Claim_Date</th>
                          <th className="py-2 px-3">Claim_Amount</th>
                          <th className="py-2 px-3">Claim_Status</th>
                        </>
                      )}
                      {selectedEntity === 'Payment' && (
                        <>
                          <th className="py-2 px-3">Payment_ID (PK)</th>
                          <th className="py-2 px-3">Claim_ID (FK)</th>
                          <th className="py-2 px-3">Payment_Date</th>
                          <th className="py-2 px-3">Amount</th>
                          <th className="py-2 px-3">Payment_Status</th>
                        </>
                      )}
                      {selectedEntity === 'Admin' && (
                        <>
                          <th className="py-2 px-3">Admin_ID (PK)</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Email (UQ)</th>
                          <th className="py-2 px-3">Role</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                    {selectedEntity === 'Customer' &&
                      customers.slice(0, 3).map((c) => (
                        <tr key={c.Customer_ID}>
                          <td className="py-2 px-3 text-blue-600 font-bold">#{c.Customer_ID}</td>
                          <td className="py-2 px-3">{c.Name}</td>
                          <td className="py-2 px-3">{c.Phone}</td>
                          <td className="py-2 px-3">{c.Email}</td>
                          <td className="py-2 px-3 truncate max-w-xs">{c.Address}</td>
                        </tr>
                      ))}
                    {selectedEntity === 'Policy' &&
                      policies.slice(0, 3).map((p) => (
                        <tr key={p.Policy_ID}>
                          <td className="py-2 px-3 text-blue-600 font-bold">#{p.Policy_ID}</td>
                          <td className="py-2 px-3 text-sky-600">Cust #{p.Customer_ID}</td>
                          <td className="py-2 px-3">{p.Policy_Type}</td>
                          <td className="py-2 px-3">₹{p.Premium.toLocaleString()}</td>
                          <td className="py-2 px-3">{p.End_Date}</td>
                        </tr>
                      ))}
                    {selectedEntity === 'Claim' &&
                      claims.slice(0, 4).map((cl) => (
                        <tr key={cl.Claim_ID}>
                          <td className="py-2 px-3 text-blue-600 font-bold">#{cl.Claim_ID}</td>
                          <td className="py-2 px-3 text-sky-600">Pol #{cl.Policy_ID}</td>
                          <td className="py-2 px-3">{cl.Claim_Date}</td>
                          <td className="py-2 px-3">₹{cl.Claim_Amount.toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold">{cl.Claim_Status}</td>
                        </tr>
                      ))}
                    {selectedEntity === 'Payment' &&
                      payments.slice(0, 3).map((py) => (
                        <tr key={py.Payment_ID}>
                          <td className="py-2 px-3 text-blue-600 font-bold">#{py.Payment_ID}</td>
                          <td className="py-2 px-3 text-sky-600">Claim #{py.Claim_ID}</td>
                          <td className="py-2 px-3">{py.Payment_Date}</td>
                          <td className="py-2 px-3">₹{py.Amount.toLocaleString()}</td>
                          <td className="py-2 px-3 font-semibold">{py.Payment_Status}</td>
                        </tr>
                      ))}
                    {selectedEntity === 'Admin' &&
                      admins.slice(0, 3).map((ad) => (
                        <tr key={ad.Admin_ID}>
                          <td className="py-2 px-3 text-blue-600 font-bold">#{ad.Admin_ID}</td>
                          <td className="py-2 px-3">{ad.Name}</td>
                          <td className="py-2 px-3">{ad.Email}</td>
                          <td className="py-2 px-3">{ad.Role}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 2: LIVE SQL QUERY CONSOLE */}
      {/* ---------------------------------------------------------------- */}
      {activeSubTab === 'sql-sandbox' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Pre-loaded SQL Presets */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Prebuilt SQL Presets
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {PREBUILT_QUERIES.length} Queries
                </span>
              </div>

              <div className="space-y-2">
                {PREBUILT_QUERIES.map((q) => {
                  const isSelected = selectedQueryId === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectPrebuiltQuery(q)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-2xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {q.title}
                        </span>
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                        {q.concept}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {q.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Live SQL Editor & Results */}
            <div className="lg:col-span-8 space-y-4">
              {/* Code Editor Box */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-card">
                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Live SQL Query Runner (SQLite / PostgreSQL Engine)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySql}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleRunQuery}
                      disabled={isExecuting}
                      className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isExecuting ? 'Running...' : 'Execute SQL'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <textarea
                    rows={6}
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs sm:text-sm text-emerald-300 focus:outline-hidden resize-y leading-relaxed"
                    placeholder="Enter SQL SELECT, JOIN, INSERT, UPDATE, or TRANSACTION query..."
                  />
                </div>

                {queryResult && (
                  <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      {queryResult.queryPlan && (
                        <span>
                          Plan: <strong className="text-teal-400">{queryResult.queryPlan}</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Rows: <strong className="text-white">{queryResult.rowCount}</strong></span>
                      <span>Execution: <strong className="text-white">{queryResult.executionTimeMs} ms</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Formatted Query Results Display */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-blue-600" />
                    Query Result Matrix
                  </h3>
                  {queryResult?.transactionRef && (
                    <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                      Ref: {queryResult.transactionRef}
                    </span>
                  )}
                </div>

                {queryResult?.error ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-mono space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      DBMS Execution Error
                    </div>
                    <p>{queryResult.error}</p>
                  </div>
                ) : !queryResult || queryResult.rows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Query executed successfully with 0 rows returned.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          {queryResult.columns.map((col) => (
                            <th key={col} className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                            {queryResult.columns.map((col) => (
                              <td key={col} className="py-2 px-3 whitespace-nowrap">
                                {String(row[col] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 3: 3NF NORMALIZATION PROOF */}
      {/* ---------------------------------------------------------------- */}
      {activeSubTab === '3nf-proof' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Relational Database Normalization Proof (1NF ➔ 2NF ➔ 3NF)
            </h2>
            <p className="text-xs text-slate-500">
              Rigorous mathematical verification showing elimination of update anomalies, partial functional dependencies, and transitive dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1NF */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">1st Normal Form (1NF)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Rule:</strong> Each column must contain atomic (indivisible) values. No repeating groups or comma-separated lists.
              </p>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Proof in ClaimVault:</div>
                <div>• Customer addresses, phones, and emails are single-valued atomic attributes.</div>
                <div>• Multiple policies for one customer are stored in separate rows in the <code>Policy</code> relation, never in comma-separated strings.</div>
              </div>
            </div>

            {/* 2NF */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">2nd Normal Form (2NF)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Rule:</strong> Must be in 1NF, and every non-prime attribute must be fully functionally dependent on the entire Primary Key (no partial dependencies).
              </p>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Proof in ClaimVault:</div>
                <div>• All 5 entities (Customer, Policy, Claim, Payment, Admin) utilize single-attribute surrogate Primary Keys (e.g. <code>Customer_ID</code>, <code>Policy_ID</code>).</div>
                <div>• Since no composite primary keys exist, partial functional dependencies are mathematically impossible!</div>
              </div>
            </div>

            {/* 3NF */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">3rd Normal Form (3NF)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Rule:</strong> Must be in 2NF, and no non-prime attribute may be transitively dependent on the Primary Key ($X \rightarrow Y \rightarrow Z$).
              </p>
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">Proof in ClaimVault:</div>
                <div>• Customer details (Name, Address) do NOT reside in the <code>Claim</code> table; only <code>Policy_ID</code> is referenced.</div>
                <div>• Settlement disbursement amounts are strictly stored in <code>Payment</code> and joined when needed, preventing update anomalies.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 4: ADMIN ENTITY & ROLE SWITCHER */}
      {/* ---------------------------------------------------------------- */}
      {activeSubTab === 'admin-roles' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Admin Entity Accounts &amp; Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Backed by the <code>Admin</code> relation (Admin_ID PK, Name, Email UQ, Password Hash, Role).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Role Mode:</span>
              <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200">
                {currentRole}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {admins.map((adm) => {
              const isActive = activeAdmin.Admin_ID === adm.Admin_ID;
              return (
                <div
                  key={adm.Admin_ID}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                    isActive
                      ? 'border-[#15529E] bg-blue-50/50 dark:bg-blue-950/40 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2559] to-[#15529E] text-white flex items-center justify-center font-bold text-sm">
                      {adm.Avatar || adm.Name.slice(0, 2).toUpperCase()}
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">Admin_ID #{adm.Admin_ID}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{adm.Name}</h3>
                    <div className="text-xs text-slate-500 font-mono">{adm.Email}</div>
                    <div className="text-xs font-semibold text-[#15529E] dark:text-blue-400 mt-1">{adm.Role}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 truncate">
                    Hash: {adm.Password.slice(0, 18)}...
                  </div>

                  <button
                    onClick={() => {
                      setActiveAdmin(adm);
                      setRole('admin');
                      addToast('Admin Persona Switched', `Logged in as ${adm.Name} (${adm.Role}).`, 'info');
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#15529E] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#15529E] hover:text-white'
                    }`}
                  >
                    {isActive ? 'Current Officer' : 'Switch to this Officer'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 5: ACID TRANSACTIONS & AUDIT LOG */}
      {/* ---------------------------------------------------------------- */}
      {activeSubTab === 'acid-transactions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                ACID Transactions &amp; Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Write-Ahead Logging (WAL) record of atomic operations, commits, and rollbacks.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Log Entries: {auditLog.length}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLog.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#15529E] dark:text-blue-400">
                      {log.transactionId}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        log.operation === 'COMMIT'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.operation === 'ROLLBACK'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {log.operation} • {log.tableName}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    {log.details}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-slate-400 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
