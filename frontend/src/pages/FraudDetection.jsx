import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Square, 
  Search, 
  SlidersHorizontal, 
  Info,
  Zap,
  UserX,
  Fingerprint,
  Bot,
  History,
  UserCheck
} from 'lucide-react';

const FraudDetection = ({ 
  transactions, 
  loading, 
  streamingActive, 
  onToggleStreaming, 
  onInspectXAI,
  totalCount,
  onFilterChange,
  onTriggerAttack
}) => {
  const [bankFilter, setBankFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulating, setSimulating] = useState(null);

  // Handle filter updates
  useEffect(() => {
    onFilterChange({
      bank: bankFilter,
      is_flagged: statusFilter === '' ? undefined : statusFilter === 'true'
    });
  }, [bankFilter, statusFilter]);

  const handleSimulate = async (type) => {
    setSimulating(type);
    try {
      await onTriggerAttack(type);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            Identity Threats & Live Ledger Feed
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time identity clearances, account takeovers, employee session access, and recovery audits feed.
          </p>
        </div>
        
        {/* Stream control */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Live Feed:</span>
          <button
            onClick={() => onToggleStreaming(!streamingActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              streamingActive
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-glow-green'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {streamingActive ? (
              <>
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                <Square size={10} className="fill-emerald-400 text-emerald-400" />
                Stop Live Stream
              </>
            ) : (
              <>
                <Play size={10} className="fill-slate-400 text-slate-400" />
                Start Live Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upgraded Banking SOC Identity Threat Simulator Console */}
      <div className="glass-panel p-5 space-y-3 relative overflow-hidden bg-slate-900/10">
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-purple-500" />
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Zap size={15} className="text-cyan-400 animate-pulse" />
          <h3 className="font-semibold text-xs font-sans uppercase tracking-wider text-slate-300">
            Banking SOC Identity Threat Simulator Console
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Button 1: Transaction Deviation */}
          <button
            onClick={() => handleSimulate("Transaction Fraud")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <ShieldAlert size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Transaction Deviation</span>
            <span className="text-[8px] text-slate-500">Unrecognized distance/volume</span>
          </button>

          {/* Button 2: Account Takeover */}
          <button
            onClick={() => handleSimulate("Account Takeover")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <UserX size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Account Takeover</span>
            <span className="text-[8px] text-slate-500">Logins + biometric anomalies</span>
          </button>

          {/* Button 3: Synthetic ID Creation */}
          <button
            onClick={() => handleSimulate("Synthetic Identity Fraud")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <Fingerprint size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Synthetic ID Creation</span>
            <span className="text-[8px] text-slate-500">PAN holder mismatch check</span>
          </button>

          {/* Button 4: Bot Script Attack */}
          <button
            onClick={() => handleSimulate("Bot Attack")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <Bot size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Bot Script Attack</span>
            <span className="text-[8px] text-slate-500">Robotic speeds & click offsets</span>
          </button>

          {/* Button 5: Suspicious Recovery */}
          <button
            onClick={() => handleSimulate("Suspicious Recovery")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-yellow-500/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <History size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Suspicious Recovery</span>
            <span className="text-[8px] text-slate-500">Unrecognized device SIM swap</span>
          </button>

          {/* Button 6: Insider Threat */}
          <button
            onClick={() => handleSimulate("Insider Threat")}
            disabled={simulating !== null}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-600/50 hover:bg-slate-900/40 transition-all text-center group disabled:opacity-50"
          >
            <UserCheck size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-slate-300">Insider Threat</span>
            <span className="text-[8px] text-slate-500">SysAdmin massive query exports</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Bank */}
          <div className="space-y-0.5 w-full sm:w-36">
            <span className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">Origin Bank</span>
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Banks</option>
              <option value="Bank A">Bank A</option>
              <option value="Bank B">Bank B</option>
              <option value="Bank C">Bank C</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-0.5 w-full sm:w-36">
            <span className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">Risk Category</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">All Ledger</option>
              <option value="false">Legitimate</option>
              <option value="true">Threat Only</option>
            </select>
          </div>
        </div>

        {/* Text Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2 text-slate-500" size={13} />
          <input
            type="text"
            placeholder="Search merchant, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs pl-8 pr-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-400 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No transaction clearings logged in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Bank</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Merchant</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-center">Threat Class</th>
                  <th className="py-2.5 px-4 text-right">Trust Score</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {transactions
                  .filter(t => 
                    t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.amount.toString().includes(searchTerm)
                  )
                  .map((t) => {
                    const isFraud = t.prediction === 1;
                    return (
                      <tr 
                        key={t.id} 
                        className={`hover:bg-slate-900/10 transition-colors ${
                          isFraud ? 'bg-red-950/5 hover:bg-red-950/10' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-[10px] text-slate-500 font-mono">
                          {formatDate(t.timestamp)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[11px]">
                          {t.bank}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-medium text-slate-200">{t.customer_name}</span>
                          <span className="text-[9px] text-slate-500 font-mono block">PAN: {t.pan_number}</span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-200">
                          {t.merchant}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-100 font-bold">
                          ${t.amount.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {t.fraud_type !== "None" ? (
                            <span className="text-[8px] font-extrabold uppercase bg-red-950/60 border border-red-900 text-red-400 px-1.5 py-0.5 rounded shadow-sm">
                              {t.fraud_type}
                            </span>
                          ) : (
                            <span className="text-[8px] font-medium text-slate-500 uppercase">
                              Verified Clearance
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`font-mono font-bold ${
                            t.trust_score < 50 
                              ? 'text-red-400' 
                              : t.trust_score < 75 
                                ? 'text-yellow-400' 
                                : 'text-emerald-400'
                          }`}>
                            {t.trust_score.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isFraud ? (
                            <span className="inline-flex items-center gap-1 text-red-400 bg-red-950/60 border border-red-900/60 px-2 py-0.5 rounded-full font-bold">
                              FLAGGED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded-full font-bold">
                              CLEARED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onInspectXAI(t.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 border border-cyan-800/40 hover:border-cyan-500 px-2 py-0.5 rounded transition-all"
                          >
                            <Info size={10} />
                            Explain Trust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetection;
