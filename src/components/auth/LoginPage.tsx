import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ShieldCheck, User, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

// ── Credential reference data (displayed as hints, NOT real auth) ─────────────
const ADMIN_ACCOUNTS = [
  { name: 'Vikram Malhotra', email: 'admin@claimvault.in', password: 'admin123', role: 'Chief Claims Adjudicator', avatar: 'VM' },
  { name: 'Priya Sundaram',  email: 'priya@claimvault.in', password: 'priya123',  role: 'Senior Verification Officer', avatar: 'PS' },
  { name: 'Anand Verma',     email: 'anand@claimvault.in', password: 'anand123',  role: 'Settlement & Audit Manager', avatar: 'AV' },
];

const CUSTOMER_ACCOUNTS = [
  { name: 'Rahul Patil',     email: 'rahul@mail.com',  password: 'rahul123',  customerId: 101, phone: '9876501234' },
  { name: 'Sneha Kulkarni',  email: 'sneha@mail.com',  password: 'sneha123',  customerId: 102, phone: '9822012345' },
  { name: 'Amit Deshmukh',   email: 'amit@mail.com',   password: 'amit123',   customerId: 103, phone: '9890123456' },
];

interface LoginPageProps {
  onAdminLogin:    (email: string) => boolean;
  onCustomerLogin: (email: string, customerId: number) => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAdminLogin, onCustomerLogin }) => {
  const [mode, setMode]           = useState<'admin' | 'customer'>('admin');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // UX delay

    if (mode === 'admin') {
      const account = ADMIN_ACCOUNTS.find(
        a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
      );
      if (account) {
        onAdminLogin(account.email);
      } else {
        setError('Invalid admin credentials. Check the demo accounts below.');
      }
    } else {
      const account = CUSTOMER_ACCOUNTS.find(
        a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
      );
      if (account) {
        onCustomerLogin(account.email, account.customerId);
      } else {
        setError('Invalid customer credentials. Check the demo accounts below.');
      }
    }

    setLoading(false);
  };

  const fillCredentials = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4 font-sans relative selection:bg-black selection:text-white">
      {/* Monochrome ambient background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-gradient-to-b from-zinc-100 to-transparent blur-2xl opacity-60 pointer-events-none" />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center lg:items-start my-auto py-8">

        {/* ── Left branding panel ── */}
        <div className="lg:flex-1 text-black space-y-6 text-center lg:text-left pt-2 lg:pt-8">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
              <Shield className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-black">ClaimVault</span>
              </div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Insurance Platform</div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-black">
              Insurance Claim Management System <br />
              <span className="text-zinc-600">and AI Fraud Detection</span>
            </h1>
            <p className="mt-3 text-zinc-600 text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
              Role-based sign in for Administrators and Policyholders with real-time heuristic risk scoring and claim automation.
            </p>
          </div>

          <div className="hidden lg:block space-y-3 text-sm pt-2">
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-black" />, text: 'Role-Based Access Control (Admin & Policyholder)' },
              { icon: <Shield className="w-4 h-4 text-black" />, text: 'AI Heuristic Fraud & Anomaly Detection' },
              { icon: <CheckCircle2 className="w-4 h-4 text-black" />, text: 'End-to-End Verification & Payout Tracking' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-zinc-800 font-medium">
                <div className="w-6 h-6 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Login card ── */}
        <div className="w-full max-w-md space-y-5">

          {/* Mode toggle */}
          <div className="flex p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
            {(['admin', 'customer'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setEmail(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {m === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {m === 'admin' ? 'Admin Login' : 'User Login'}
              </button>
            ))}
          </div>

          {/* Login form card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-7 space-y-5 border border-zinc-200">
            <div>
              <h2 className="text-xl font-extrabold text-black">
                {mode === 'admin' ? 'Administrator Sign In' : 'User Sign In'}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {mode === 'admin'
                  ? 'Access full claims adjudication, customer management, and fraud controls.'
                  : 'View your policies, file claims, and track your claim status.'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  {mode === 'admin' ? 'Admin Email' : 'User Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder={mode === 'admin' ? 'admin@claimvault.in' : 'rahul@mail.com'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-zinc-300 text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white border border-zinc-300 text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black cursor-pointer"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-100 border border-zinc-300 text-black text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-black" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In as {mode === 'admin' ? 'Administrator' : 'User'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Demo {mode === 'admin' ? 'Admin' : 'User'} Accounts — click to auto-fill
            </div>

            <div className="space-y-2">
              {(mode === 'admin' ? ADMIN_ACCOUNTS : CUSTOMER_ACCOUNTS).map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillCredentials(acc.email, acc.password)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold bg-zinc-900 text-white shrink-0 group-hover:bg-black transition-colors">
                    {'avatar' in acc ? acc.avatar : acc.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-black truncate">{acc.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{acc.email}</div>
                    {'role' in acc && <div className="text-[10px] text-zinc-400 truncate">{acc.role}</div>}
                    {'phone' in acc && <div className="text-[10px] text-zinc-400">ID: {acc.customerId} · {acc.phone}</div>}
                  </div>
                  <div className="text-[10px] font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-1 rounded border border-zinc-200 group-hover:bg-zinc-200 transition-colors shrink-0">
                    pw: {acc.password}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
