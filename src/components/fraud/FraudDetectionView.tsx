import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ClaimDetailedView, FraudInvestigationStatus, RiskLevel, FraudRuleTrigger } from '../../types/database';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  Radar,
  Activity,
  Sparkles,
  TrendingUp,
  Cpu,
  Shield,
  Download,
  RefreshCw,
  X,
  ChevronRight,
  Users,
  BarChart2,
  Clock,
  Info,
  Ban,
  Eye,
  FileText,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type TabId = 'queue' | 'analytics' | 'simulator' | 'rules';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRiskColor = (level?: RiskLevel) => {
  switch (level) {
    case 'Critical':
      return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    case 'High':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    case 'Medium':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800';
    default:
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
  }
};

const getRiskBarColor = (score: number) => {
  if (score >= 75) return 'bg-rose-500';
  if (score >= 55) return 'bg-amber-500';
  if (score >= 35) return 'bg-blue-500';
  return 'bg-emerald-500';
};

const getSIUStatusStyle = (status?: string) => {
  switch (status) {
    case 'Confirmed Fraud':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
    case 'Under SIU Review':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    case 'Flagged':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
    case 'False Positive':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
    default:
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline expandable evidence drawer for a single claim row */
const EvidenceDrawer: React.FC<{ claim: ClaimDetailedView; onClose: () => void }> = ({ claim, onClose }) => {
  const f = claim.fraudAssessment;
  if (!f) return null;

  return (
    <tr className="bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800">
      <td colSpan={8} className="px-6 py-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#15529E]" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                AI Risk Evidence — Claim #{claim.Claim_ID} ({claim.customer.Name})
              </span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskColor(f.Risk_Level)}`}>
                {f.Risk_Level} Risk · {f.Risk_Score}/100
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Triggered rules with evidence */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Triggered Heuristic Rules & Forensic Evidence</div>
              {f.Triggered_Rules.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  No fraud indicators triggered. Claim cleared by AI Risk Engine.
                </div>
              ) : (
                f.Triggered_Rules.map((rule: FraudRuleTrigger) => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      rule.severity === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                        : rule.severity === 'high'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                      <span>{rule.name}</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400">+{rule.scoreImpact} pts</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rule.description}</p>
                    <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">
                      Evidence: {rule.evidence}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Risk score gauge + metadata */}
            <div className="space-y-3">
              {/* Score gauge */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Composite Risk Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono">{f.Risk_Score}</span>
                  <span className="text-slate-400 font-mono text-sm">/ 100</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${f.Risk_Score}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(f.Risk_Score)}`}
                  />
                </div>
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="text-slate-500">AI Recommendation</div>
                    <div className="text-white font-semibold mt-0.5">{f.Recommendation}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">SIU Status</div>
                    <div className="text-white font-semibold mt-0.5">{f.Status}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Last Evaluated By</div>
                    <div className="text-slate-300 mt-0.5">{f.Last_Evaluated_By || '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Assessment Date</div>
                    <div className="text-slate-300 mt-0.5">
                      {f.Assessment_Date ? new Date(f.Assessment_Date).toLocaleDateString('en-IN') : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investigator notes */}
              {f.Investigator_Notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                  <div className="font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Investigator Notes
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{f.Investigator_Notes}</p>
                </div>
              )}

              {/* Claim metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Claim Amount', val: `₹${claim.Claim_Amount.toLocaleString()}` },
                  { label: 'Policy Type', val: claim.policy.Policy_Type },
                  { label: 'Claim Date', val: claim.Claim_Date },
                  { label: 'Policy Premium', val: `₹${claim.policy.Premium.toLocaleString()}` },
                  { label: 'Policy Start', val: claim.policy.Start_Date },
                  { label: 'Policy End', val: claim.policy.End_Date },
                ].map(({ label, val }) => (
                  <div key={label} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wide">{label}</div>
                    <div className="font-semibold text-slate-800 dark:text-white mt-0.5">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Analytics Panel ──────────────────────────────────────────────────────────
const AnalyticsPanel: React.FC<{ claims: ClaimDetailedView[] }> = ({ claims }) => {
  const riskCounts = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    claims.forEach(c => {
      const lvl = c.fraudAssessment?.Risk_Level;
      if (lvl) counts[lvl]++;
    });
    return counts;
  }, [claims]);

  const topRiskCustomers = useMemo(() => {
    const map: Record<number, { name: string; score: number; count: number }> = {};
    claims.forEach(c => {
      const id = c.customer.Customer_ID;
      const score = c.fraudAssessment?.Risk_Score || 0;
      if (!map[id]) map[id] = { name: c.customer.Name, score: 0, count: 0 };
      map[id].score = Math.max(map[id].score, score);
      map[id].count++;
    });
    return Object.values(map).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [claims]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    claims.forEach(c => {
      const s = c.fraudAssessment?.Status || 'Clear';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts);
  }, [claims]);

  const avgScore = claims.length > 0
    ? Math.round(claims.reduce((s, c) => s + (c.fraudAssessment?.Risk_Score || 0), 0) / claims.length)
    : 0;

  const totalFlagged = claims.filter(c =>
    c.fraudAssessment?.Risk_Level === 'Critical' || c.fraudAssessment?.Risk_Level === 'High'
  ).length;

  const totalExposure = claims
    .filter(c => c.fraudAssessment?.Risk_Level === 'Critical' || c.fraudAssessment?.Risk_Level === 'High')
    .reduce((s, c) => s + c.Claim_Amount, 0);

  const riskBars = [
    { label: 'Critical', count: riskCounts.Critical, color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'High', count: riskCounts.High, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Medium', count: riskCounts.Medium, color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Low', count: riskCounts.Low, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Portfolio Risk Score</div>
          <div className="mt-2 text-4xl font-extrabold font-mono text-slate-900 dark:text-white">{avgScore}<span className="text-base text-slate-400 font-normal"> /100</span></div>
          <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div style={{ width: `${avgScore}%` }} className={`h-full rounded-full ${getRiskBarColor(avgScore)}`} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">High/Critical Flagged</div>
          <div className="mt-2 text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{totalFlagged}</div>
          <div className="mt-1 text-xs text-slate-500">out of {claims.length} total claims</div>
          <div className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">
            {claims.length > 0 ? Math.round((totalFlagged / claims.length) * 100) : 0}% fraud exposure rate
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">At-Risk Financial Exposure</div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            ₹{totalExposure.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">from High + Critical claims</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Level Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <BarChart2 className="w-4 h-4 text-[#15529E]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Risk Level Distribution</h2>
          </div>
          <div className="space-y-3">
            {riskBars.map(({ label, count, color, text }) => {
              const pct = claims.length > 0 ? Math.round((count / claims.length) * 100) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={text}>{label} Risk</span>
                    <span className="font-mono text-slate-500">{count} claims ({pct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIU Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <Shield className="w-4 h-4 text-[#15529E]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">SIU Investigation Status</h2>
          </div>
          <div className="space-y-2">
            {statusBreakdown.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${getSIUStatusStyle(status)}`}>
                  {status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${claims.length > 0 ? (count / claims.length) * 100 : 0}%` }}
                      className="h-full rounded-full bg-[#15529E]"
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{count}</span>
                </div>
              </div>
            ))}
            {statusBreakdown.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">No assessment data yet. Run AI scan first.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Risk Customers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <Users className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top Risk Customer Profiles</h2>
          <span className="text-[10px] text-slate-400 ml-auto">Ranked by peak claim risk score</span>
        </div>
        <div className="space-y-3">
          {topRiskCustomers.map((cust, idx) => (
            <div key={cust.name} className="flex items-center gap-3 text-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] text-white ${
                idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
              }`}>
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 dark:text-white truncate">{cust.name}</div>
                <div className="text-slate-400">{cust.count} claim{cust.count !== 1 ? 's' : ''} on file</div>
              </div>
              <div className="text-right">
                <div className={`font-mono font-extrabold text-sm ${
                  cust.score >= 75 ? 'text-rose-600 dark:text-rose-400'
                  : cust.score >= 55 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
                }`}>{cust.score}</div>
                <div className="text-slate-400 text-[10px]">peak score</div>
              </div>
              <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${cust.score}%` }} className={`h-full rounded-full ${getRiskBarColor(cust.score)}`} />
              </div>
            </div>
          ))}
          {topRiskCustomers.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-4">No claim data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Simulator Panel ──────────────────────────────────────────────────────────
const SimulatorPanel: React.FC = () => {
  const [simAmount, setSimAmount] = useState<number>(65000);
  const [simDaysSinceStart, setSimDaysSinceStart] = useState<number>(18);
  const [simHasPriorRejection, setSimHasPriorRejection] = useState<boolean>(true);
  const [simSuspiciousDoc, setSimSuspiciousDoc] = useState<boolean>(true);
  const [simRepeatFrequency, setSimRepeatFrequency] = useState<boolean>(false);
  const [simNearExpiry, setSimNearExpiry] = useState<boolean>(false);
  const [simPremium, setSimPremium] = useState<number>(12000);

  const computeSimulatedScore = () => {
    let score = 12;
    const rules = [];

    if (simDaysSinceStart <= 60) {
      score += 28;
      rules.push({ name: 'Early Inception Velocity', pts: '+28' });
    }
    if (simAmount >= 45000) {
      score += 15;
      rules.push({ name: 'High Monetary Exposure', pts: '+15' });
    }
    if (simPremium > 0 && simAmount / simPremium >= 3.0) {
      score += 25;
      rules.push({ name: `Disproportionate Claim/Premium (${(simAmount / simPremium).toFixed(1)}x)`, pts: '+25' });
    }
    if (simHasPriorRejection) {
      score += 35;
      rules.push({ name: 'Prior Rejection Record', pts: '+35' });
    }
    if (simSuspiciousDoc) {
      score += 20;
      rules.push({ name: 'Suspicious Document Stamp', pts: '+20' });
    }
    if (simRepeatFrequency) {
      score += 18;
      rules.push({ name: 'Elevated Claim Frequency (≥2)', pts: '+18' });
    }
    if (simNearExpiry) {
      score += 15;
      rules.push({ name: 'Imminent Policy Expiry Filing', pts: '+15' });
    }

    const finalScore = Math.min(Math.max(score, 10), 96);
    let level: RiskLevel = 'Low';
    let recommendation = 'Fast-Track Settlement';
    if (finalScore >= 75) { level = 'Critical'; recommendation = 'Refer to SIU (Special Investigation Unit)'; }
    else if (finalScore >= 55) { level = 'High'; recommendation = 'Enhanced Due Diligence (EDD)'; }
    else if (finalScore >= 35) { level = 'Medium'; recommendation = 'Standard Verification'; }

    return { score: finalScore, level, rules, recommendation };
  };

  const sim = computeSimulatedScore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Controls */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Fraud Simulator & Stress-Testing Sandbox</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
            Real-time Model
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Adjust risk factors below to simulate how the ClaimVault AI Risk Model evaluates claims in real-time.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Claim Amount: ₹{simAmount.toLocaleString()}</span>
              <span className="font-mono text-slate-400">{simAmount >= 45000 ? 'High Exposure (+15)' : 'Normal'}</span>
            </div>
            <input type="range" min="5000" max="100000" step="5000" value={simAmount}
              onChange={e => setSimAmount(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#15529E]" />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Annual Policy Premium: ₹{simPremium.toLocaleString()}</span>
              <span className="font-mono text-slate-400">
                Ratio: {simPremium > 0 ? (simAmount / simPremium).toFixed(1) : '—'}x
                {simPremium > 0 && simAmount / simPremium >= 3.0 ? ' ⚠ Disproportionate (+25)' : ''}
              </span>
            </div>
            <input type="range" min="2000" max="50000" step="1000" value={simPremium}
              onChange={e => setSimPremium(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#15529E]" />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Days Since Policy Start: {simDaysSinceStart} days</span>
              <span className="font-mono text-slate-400">{simDaysSinceStart <= 60 ? 'Early Velocity (+28)' : 'Mature Policy'}</span>
            </div>
            <input type="range" min="1" max="180" step="5" value={simDaysSinceStart}
              onChange={e => setSimDaysSinceStart(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#15529E]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              { label: 'Customer Has Prior Rejection', state: simHasPriorRejection, setter: setSimHasPriorRejection, pts: '+35' },
              { label: 'Suspicious Document Stamp', state: simSuspiciousDoc, setter: setSimSuspiciousDoc, pts: '+20' },
              { label: 'Elevated Claim Frequency (≥2)', state: simRepeatFrequency, setter: setSimRepeatFrequency, pts: '+18' },
              { label: 'Near Policy Expiry Filing', state: simNearExpiry, setter: setSimNearExpiry, pts: '+15' },
            ].map(({ label, state, setter, pts }) => (
              <label key={label} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight pr-2">{label} <span className="font-mono text-rose-500">{pts}</span></span>
                <input type="checkbox" checked={state} onChange={e => setter(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0" />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Cpu className="w-4 h-4 text-teal-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Model Evaluation Output</h2>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-md border border-slate-800 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Risk Assessment Result</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRiskColor(sim.level as RiskLevel)}`}>
              {sim.level} Risk
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold font-mono">{sim.score}</span>
            <span className="text-slate-400 font-mono">/100</span>
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div style={{ width: `${sim.score}%` }} className={`h-full rounded-full transition-all duration-300 ${getRiskBarColor(sim.score)}`} />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800 text-xs">
            <div className="text-slate-400 mb-1">AI Recommendation</div>
            <div className="font-semibold text-white">{sim.recommendation}</div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1.5">
            <div className="text-slate-400">Triggered Rules ({sim.rules.length}):</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {sim.rules.map((r, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                  {r.name} <span className="text-rose-400">{r.pts}</span>
                </span>
              ))}
              {sim.rules.length === 0 && (
                <span className="text-emerald-400 font-medium">✓ No fraud indicators — Fast-Track Settlement eligible</span>
              )}
            </div>
          </div>
        </div>

        {/* Score interpretation guide */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          {[
            { label: '75-96', desc: 'Critical', color: 'bg-rose-500' },
            { label: '55-74', desc: 'High', color: 'bg-amber-500' },
            { label: '35-54', desc: 'Medium', color: 'bg-blue-500' },
            { label: '10-34', desc: 'Low', color: 'bg-emerald-500' },
          ].map(({ label, desc, color }) => (
            <div key={desc} className="text-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className={`w-full h-1.5 rounded-full ${color} mb-1`} />
              <div className="text-slate-500">{label}</div>
              <div className="font-bold text-slate-700 dark:text-slate-300">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Rules Panel ──────────────────────────────────────────────────────────────
const RulesPanel: React.FC = () => {
  const RULES = [
    {
      rule: 'Early Inception Velocity',
      impact: '+28 pts',
      severity: 'High',
      desc: 'Claim reported within 60 days of policy start date — indicative of pre-planned loss.',
      triggerCondition: 'Claim_Date − Start_Date ≤ 60 days',
      category: 'Temporal',
    },
    {
      rule: 'Disproportionate Claim-to-Premium Ratio',
      impact: '+25 pts',
      severity: 'High',
      desc: 'Claim amount is ≥ 3.0× the total annual policy premium, suggesting value inflation.',
      triggerCondition: 'Claim_Amount / Premium ≥ 3.0',
      category: 'Financial',
    },
    {
      rule: 'Prior Rejection Violation on Profile',
      impact: '+35 pts',
      severity: 'Critical',
      desc: 'Customer has previously filed a claim that was rejected for policy violation.',
      triggerCondition: 'Customer.Claims contains Rejected status',
      category: 'Behavioural',
    },
    {
      rule: 'High Absolute Monetary Exposure',
      impact: '+15 pts',
      severity: 'Medium',
      desc: 'Single claim amount meets or exceeds the upper risk quartile threshold of ₹45,000.',
      triggerCondition: 'Claim_Amount ≥ ₹45,000',
      category: 'Financial',
    },
    {
      rule: 'Documentation Authentication Flag',
      impact: '+20 pts',
      severity: 'Medium',
      desc: 'Uploaded document lacks authorized OEM garage or hospital billing stamp.',
      triggerCondition: 'Supporting_Doc matches non-OEM pattern or non-PDF',
      category: 'Documentation',
    },
    {
      rule: 'Imminent Policy Expiry Filing',
      impact: '+15 pts',
      severity: 'Medium',
      desc: 'Incident reported within 45 days before mandatory policy expiration.',
      triggerCondition: 'End_Date − Claim_Date ≤ 45 days',
      category: 'Temporal',
    },
    {
      rule: 'Elevated Customer Claim Frequency',
      impact: '+18 pts',
      severity: 'Medium',
      desc: 'Customer has filed 2 or more claims across multiple active or historical policies.',
      triggerCondition: 'COUNT(Claims per Customer) ≥ 2',
      category: 'Behavioural',
    },
  ];

  const categoryColors: Record<string, string> = {
    Temporal: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    Financial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Behavioural: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Documentation: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#15529E]" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Fraud Heuristic Rules — Relational Analysis Engine</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{RULES.length} Active Rules</span>
      </div>

      <div className="space-y-3 text-xs">
        {RULES.map((r, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white">{r.rule}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${categoryColors[r.category] || ''}`}>
                  {r.category}
                </span>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">{r.impact}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
            <div className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1.5 rounded-lg">
              Logic: {r.triggerCondition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ─── Main View ────────────────────────────────────────────────────────────────
export const FraudDetectionView: React.FC = () => {
  const {
    detailedClaims,
    setSelectedClaimForDetail,
    setActiveSection,
    updateFraudStatus,
    runDeepFraudScan,
    addToast,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<TabId>('queue');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaimIdForNotes, setSelectedClaimIdForNotes] = useState<number | null>(null);
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<FraudInvestigationStatus>('Under SIU Review');
  const [expandedClaimId, setExpandedClaimId] = useState<number | null>(null);
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalClaims = detailedClaims.length;
  const criticalClaims = detailedClaims.filter(c => c.fraudAssessment?.Risk_Level === 'Critical');
  const highRiskClaims = detailedClaims.filter(c => c.fraudAssessment?.Risk_Level === 'High');
  const flaggedClaims = detailedClaims.filter(
    c => c.fraudAssessment?.Status === 'Flagged' || c.fraudAssessment?.Status === 'Under SIU Review'
  );
  const confirmedFraud = detailedClaims.filter(c => c.fraudAssessment?.Status === 'Confirmed Fraud');
  const avgScore = totalClaims > 0
    ? Math.round(detailedClaims.reduce((sum, c) => sum + (c.fraudAssessment?.Risk_Score || 0), 0) / totalClaims)
    : 0;

  // ── Filtered claims ────────────────────────────────────────────────────────
  const filteredClaims = useMemo(() =>
    detailedClaims.filter(c => {
      const f = c.fraudAssessment;
      const matchesLevel = filterLevel === 'ALL' || f?.Risk_Level === filterLevel;
      const matchesStatus = filterStatus === 'ALL' || f?.Status === filterStatus;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        String(c.Claim_ID).includes(q) ||
        c.customer.Name.toLowerCase().includes(q) ||
        c.policy.Policy_Type.toLowerCase().includes(q) ||
        (f?.Recommendation || '').toLowerCase().includes(q) ||
        (f?.Status || '').toLowerCase().includes(q);
      return matchesLevel && matchesStatus && matchesSearch;
    }),
    [detailedClaims, filterLevel, filterStatus, searchTerm]
  );

  // ── Batch scan all ─────────────────────────────────────────────────────────
  const handleBatchScan = async () => {
    setIsBatchScanning(true);
    setBatchProgress(0);
    addToast('Batch AI Scan Started', `Scanning all ${totalClaims} claims through the Risk Engine...`, 'info');
    for (let i = 0; i < detailedClaims.length; i++) {
      runDeepFraudScan(detailedClaims[i].Claim_ID);
      setBatchProgress(Math.round(((i + 1) / detailedClaims.length) * 100));
      await new Promise(r => setTimeout(r, 120));
    }
    setIsBatchScanning(false);
    addToast(
      'Batch Scan Complete ✓',
      `AI Risk Engine evaluated all ${totalClaims} claims. ${criticalClaims.length + highRiskClaims.length} flagged for review.`,
      criticalClaims.length > 0 ? 'warning' : 'success'
    );
  };

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Claim_ID', 'Customer', 'Policy_Type', 'Claim_Amount', 'Risk_Score', 'Risk_Level', 'SIU_Status', 'Recommendation', 'Triggered_Rules', 'Investigator_Notes'];
    const rows = detailedClaims.map(c => {
      const f = c.fraudAssessment;
      return [
        c.Claim_ID,
        c.customer.Name,
        c.policy.Policy_Type,
        c.Claim_Amount,
        f?.Risk_Score || 0,
        f?.Risk_Level || 'Low',
        f?.Status || 'Clear',
        f?.Recommendation || '',
        (f?.Triggered_Rules || []).map(r => r.name).join('; '),
        f?.Investigator_Notes || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClaimVault_FraudReport_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Report Exported', 'Fraud detection report downloaded as CSV.', 'success');
  };

  // ── Save SIU status ────────────────────────────────────────────────────────
  const handleSaveStatusModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClaimIdForNotes === null) return;
    updateFraudStatus(selectedClaimIdForNotes, selectedNewStatus, investigatorNote);
    setSelectedClaimIdForNotes(null);
    setInvestigatorNote('');
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'queue', label: 'Risk Queue', icon: <Radar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'simulator', label: 'Simulator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'rules', label: 'Heuristic Rules', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* ── Title Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
              AI Risk Engine v2.4 Active
            </span>
            <span className="text-xs text-slate-400">Heuristic Fraud & SIU Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            AI Fraud Detection & Risk Scoring Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-condition heuristic scoring across policy inceptions, claim amounts, prior rejections, and documentation flags.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={handleBatchScan}
            disabled={isBatchScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15529E] hover:bg-[#114280] text-white text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBatchScanning ? 'animate-spin' : ''}`} />
            {isBatchScanning ? `Scanning… ${batchProgress}%` : 'Batch Scan All Claims'}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Batch progress bar ── */}
      {isBatchScanning && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${batchProgress}%` }}
            className="h-full rounded-full bg-[#15529E] transition-all duration-200"
          />
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Critical Risk', val: criticalClaims.length, sub: 'Score ≥ 75 · Immediate SIU', color: 'text-rose-600 dark:text-rose-400', icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-rose-50 dark:bg-rose-950/60' },
          { label: 'High Risk', val: highRiskClaims.length, sub: 'Score 55-74 · EDD Required', color: 'text-amber-600 dark:text-amber-400', icon: <Activity className="w-4 h-4" />, bg: 'bg-amber-50 dark:bg-amber-950/60' },
          { label: 'Under Review', val: flaggedClaims.length, sub: 'SIU supervision active', color: 'text-indigo-600 dark:text-indigo-400', icon: <Radar className="w-4 h-4" />, bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Confirmed Fraud', val: confirmedFraud.length, sub: 'Defrauding proved', color: 'text-rose-700 dark:text-rose-300', icon: <Ban className="w-4 h-4" />, bg: 'bg-rose-100 dark:bg-rose-950/80' },
          { label: 'Portfolio Risk Index', val: `${avgScore}/100`, sub: 'Normal baseline: 10–35', color: 'text-slate-900 dark:text-white', icon: <Cpu className="w-4 h-4" />, bg: 'bg-blue-50 dark:bg-blue-950/60' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span className="truncate">{kpi.label}</span>
              <div className={`w-7 h-7 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                {kpi.icon}
              </div>
            </div>
            <div className={`mt-2 text-2xl font-extrabold font-mono ${kpi.color}`}>{kpi.val}</div>
            <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto sm:inline-flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Risk Queue ── */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          {/* Table toolbar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-indigo-600" />
                Claim Risk Assessment Queue
              </h2>
              <p className="text-xs text-slate-400">
                {filteredClaims.length} of {totalClaims} claims · Click <Eye className="w-3 h-3 inline" /> to expand forensic evidence
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Risk level filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                {['ALL', 'Critical', 'High', 'Medium', 'Low'].map(lvl => (
                  <button key={lvl} onClick={() => setFilterLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                      filterLevel === lvl
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}>
                    {lvl}
                  </button>
                ))}
              </div>

              {/* SIU status filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Clear">Clear</option>
                <option value="Flagged">Flagged</option>
                <option value="Under SIU Review">Under SIU Review</option>
                <option value="Confirmed Fraud">Confirmed Fraud</option>
                <option value="False Positive">False Positive</option>
              </select>

              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search claims…" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Customer Entity</th>
                  <th className="py-3 px-4">Policy & Amount</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Triggered Rules</th>
                  <th className="py-3 px-4">AI Recommendation</th>
                  <th className="py-3 px-4">SIU Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClaims.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No claims match the current filters.
                    </td>
                  </tr>
                )}
                {filteredClaims.map(claim => {
                  const f = claim.fraudAssessment;
                  const rulesCount = f?.Triggered_Rules.length || 0;
                  const isExpanded = expandedClaimId === claim.Claim_ID;

                  return (
                    <React.Fragment key={claim.Claim_ID}>
                      <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors ${
                        f?.Risk_Level === 'Critical' ? 'border-l-2 border-l-rose-500' :
                        f?.Risk_Level === 'High' ? 'border-l-2 border-l-amber-400' : ''
                      }`}>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#15529E] dark:text-blue-400">
                          #{claim.Claim_ID}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{claim.customer.Name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            #{claim.customer.Customer_ID} · {claim.customer.Phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {claim.policy.Policy_Type} (#{claim.policy.Policy_ID})
                          </div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            ₹{claim.Claim_Amount.toLocaleString()}
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                                {f?.Risk_Score || 10}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskColor(f?.Risk_Level)}`}>
                                {f?.Risk_Level || 'Low'}
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div style={{ width: `${f?.Risk_Score || 10}%` }}
                                className={`h-full rounded-full ${getRiskBarColor(f?.Risk_Score || 10)}`} />
                            </div>
                          </div>
                        </td>

                        {/* Triggered Rules */}
                        <td className="py-3.5 px-4">
                          {rulesCount === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> No red flags
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-800 dark:text-slate-200">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                {rulesCount} Flag{rulesCount !== 1 ? 's' : ''}
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                {f?.Triggered_Rules.map(r => r.name).join(' · ')}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* AI Recommendation */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                            {f?.Recommendation || 'Standard Verification'}
                          </span>
                        </td>

                        {/* SIU Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSIUStatusStyle(f?.Status)}`}>
                            {f?.Status || 'Clear'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setExpandedClaimId(isExpanded ? null : claim.Claim_ID)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isExpanded
                                  ? 'bg-[#15529E] text-white'
                                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title="Expand forensic evidence"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => { setSelectedClaimForDetail(claim); setActiveSection('claims'); }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#15529E] hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              title="Open 7-step verification workflow"
                            >
                              Verify
                            </button>

                            <button
                              onClick={() => {
                                setSelectedClaimIdForNotes(claim.Claim_ID);
                                setSelectedNewStatus(f?.Status || 'Under SIU Review');
                                setInvestigatorNote(f?.Investigator_Notes || '');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Update SIU Investigation Status & Notes"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            </button>

                            <button
                              onClick={() => runDeepFraudScan(claim.Claim_ID)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Re-run Deep AI Fraud Scan"
                            >
                              <Cpu className="w-3.5 h-3.5 text-teal-500" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline evidence drawer */}
                      {isExpanded && <EvidenceDrawer claim={claim} onClose={() => setExpandedClaimId(null)} />}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Analytics ── */}
      {activeTab === 'analytics' && <AnalyticsPanel claims={detailedClaims} />}

      {/* ── Tab: Simulator ── */}
      {activeTab === 'simulator' && <SimulatorPanel />}

      {/* ── Tab: Rules ── */}
      {activeTab === 'rules' && <RulesPanel />}

      {/* ── SIU Status Update Modal ── */}
      {selectedClaimIdForNotes !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  SIU Case Review: Claim #{selectedClaimIdForNotes}
                </h3>
                <p className="text-xs text-slate-500">Update Special Investigation Unit classification</p>
              </div>
              <button onClick={() => setSelectedClaimIdForNotes(null)} className="ml-auto p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Investigation Status</label>
                <select
                  value={selectedNewStatus}
                  onChange={e => setSelectedNewStatus(e.target.value as FraudInvestigationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#15529E]"
                >
                  <option value="Clear">Clear (Legitimate Claim)</option>
                  <option value="Flagged">Flagged (Elevated Risk Indicator)</option>
                  <option value="Under SIU Review">Under SIU Review (Forensic Audit Active)</option>
                  <option value="Confirmed Fraud">Confirmed Fraud (Defrauding Attempt Proved)</option>
                  <option value="False Positive">False Positive (Manually Overruled)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Special Investigator Notes & Evidence
                </label>
                <textarea
                  rows={3}
                  value={investigatorNote}
                  onChange={e => setInvestigatorNote(e.target.value)}
                  placeholder="Record forensic findings, hospital verification, or surveyor remarks…"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#15529E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedClaimIdForNotes(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-xl bg-[#15529E] hover:bg-[#114280] text-white font-bold transition-all">
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
