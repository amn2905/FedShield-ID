import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
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
  UserCheck, 
  X, 
  Sparkles, 
  AlertOctagon, 
  CheckSquare, 
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const FraudDetection = ({ 
  transactions, 
  loading, 
  streamingActive, 
  onToggleStreaming, 
  onInspectXAI,
  totalCount,
  onFilterChange,
  onTriggerAttack,
  selectedTxId,
  setSelectedTxId,
  fetchXAIExplanation,
  fetchGenAIReport
}) => {
  const [bankFilter, setBankFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulating, setSimulating] = useState(null);

  // XAI drawer state
  const [explanationData, setExplanationData] = useState(null);
  const [genAiReport, setGenAiReport] = useState(null);
  const [loadingXAI, setLoadingXAI] = useState(false);

  useEffect(() => {
    onFilterChange({
      bank: bankFilter,
      is_flagged: statusFilter === '' ? undefined : statusFilter === 'true'
    });
  }, [bankFilter, statusFilter]);

  useEffect(() => {
    const loadXAIData = async () => {
      if (!selectedTxId) {
        setExplanationData(null);
        setGenAiReport(null);
        return;
      }
      setLoadingXAI(true);
      try {
        const xaiData = await fetchXAIExplanation(selectedTxId);
        setExplanationData(xaiData);
        
        const report = await fetchGenAIReport(selectedTxId);
        setGenAiReport(report);
      } catch (e) {
        console.error("Failed to load XAI inline data:", e);
      } finally {
        setLoadingXAI(false);
      }
    };
    loadXAIData();
  }, [selectedTxId]);

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

  const currentTx = transactions.find(t => t.id === selectedTxId);

  const getShapChartData = () => {
    if (!explanationData) return null;
    const shapVals = explanationData.shap_values;
    const featureLabels = {
      amount: "Transaction Amount",
      distance_from_home: "Distance Deviation",
      device_trust_score: "Device Reputation",
      location_deviation: "Location Drift",
      is_synthetic: "Synthetic Identity"
    };

    const labels = Object.keys(shapVals).map(k => featureLabels[k] || k);
    const data = Object.values(shapVals).map(v => v * 100);
    
    const colors = data.map(v => v >= 0 ? 'rgba(220, 38, 38, 0.85)' : 'rgba(16, 185, 129, 0.85)');
    const borderColors = data.map(v => v >= 0 ? '#DC2626' : '#059669');

    return {
      labels,
      datasets: [
        {
          label: 'Risk Contribution (% Probability)',
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 4,
        }
      ]
    };
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#172033',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 8,
        callbacks: {
          label: (context) => `${context.raw >= 0 ? '+' : ''}${context.raw.toFixed(2)}% risk shift`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { 
          color: '#64748B',
          callback: (value) => `${value >= 0 ? '+' : ''}${value}%`,
          font: { size: 9, family: 'Inter' }
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#172033', font: { family: 'Inter', weight: '600', size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
            Continuous Identity Risk Ledger
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time identity verification events, continuous transaction risk scores, and adaptive authentication enforcement.
          </p>
        </div>
        
        {/* Stream Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#64748B] font-medium">Simulator:</span>
          <button
            onClick={() => onToggleStreaming(!streamingActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              streamingActive
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-[inset_0_1px_1px_rgba(217,119,6,0.1)]'
                : 'skeuo-btn-secondary'
            }`}
          >
            {streamingActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Streaming Live (3s)</span>
                <Square size={11} className="fill-amber-700 text-amber-700 ml-1" />
              </>
            ) : (
              <>
                <Play size={11} className="fill-blue-600 text-blue-600" />
                <span>Start Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banking SOC Identity Threat Simulator Panel */}
      <div className="skeuo-panel p-5 space-y-3 bg-gradient-to-b from-white to-[#FAFCFD]">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
              Banking SOC Attack Injection Console
            </h3>
          </div>
          <span className="text-[10px] text-[#64748B] font-medium">Click scenario to inject a live anomalous transaction</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Button 1: Transaction Fraud */}
          <button
            onClick={() => handleSimulate("Transaction Fraud")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-blue-400 hover:bg-blue-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldAlert size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Transaction Fraud</span>
            <span className="text-[9px] text-[#64748B]">Amount / Distance spike</span>
          </button>

          {/* Button 2: Account Takeover */}
          <button
            onClick={() => handleSimulate("Account Takeover")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-amber-400 hover:bg-amber-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <UserX size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Account Takeover</span>
            <span className="text-[9px] text-[#64748B]">Cred stuffing & SIM swap</span>
          </button>

          {/* Button 3: Synthetic ID */}
          <button
            onClick={() => handleSimulate("Synthetic Identity Fraud")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-red-400 hover:bg-red-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Fingerprint size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Synthetic ID</span>
            <span className="text-[9px] text-[#64748B]">PAN mismatch detection</span>
          </button>

          {/* Button 4: Bot Attack */}
          <button
            onClick={() => handleSimulate("Bot Attack")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-purple-400 hover:bg-purple-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Bot size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Bot Attack</span>
            <span className="text-[9px] text-[#64748B]">Zero-jitter automated click</span>
          </button>

          {/* Button 5: Suspicious Recovery */}
          <button
            onClick={() => handleSimulate("Suspicious Recovery")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-amber-400 hover:bg-amber-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <History size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Suspicious Recovery</span>
            <span className="text-[9px] text-[#64748B]">Rooted device recovery</span>
          </button>

          {/* Button 6: Insider Threat */}
          <button
            onClick={() => handleSimulate("Insider Threat")}
            disabled={simulating !== null}
            className="skeuo-panel p-3 text-center flex flex-col items-center gap-1.5 hover:border-red-400 hover:bg-red-50/40 transition-all disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <UserCheck size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#172033]">Insider Threat</span>
            <span className="text-[9px] text-[#64748B]">SysAdmin PII vault export</span>
          </button>
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="skeuo-panel p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Bank Origin Filter */}
          <div className="w-full sm:w-40">
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="skeuo-input w-full px-2.5 py-1.5 text-xs font-medium"
            >
              <option value="">All Origin Banks</option>
              <option value="Bank A">Bank A</option>
              <option value="Bank B">Bank B</option>
              <option value="Bank C">Bank C</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="skeuo-input w-full px-2.5 py-1.5 text-xs font-medium"
            >
              <option value="">All Clearances & Threats</option>
              <option value="false">Verified Clearances</option>
              <option value="true">Flagged Threats Only</option>
            </select>
          </div>
        </div>

        {/* Text Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
          <input
            type="text"
            placeholder="Search customer, merchant, PAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="skeuo-input w-full pl-9 pr-3 py-1.5 text-xs placeholder-[#94A3B8]"
          />
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="skeuo-panel overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2"></div>
            <span className="text-xs text-[#64748B]">Querying verified ledger database...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-[#64748B] text-xs">
            No transaction records match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3EB] text-[#64748B] font-semibold uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Bank</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Threat Scenario</th>
                  <th className="py-3 px-4 text-right">Trust Score</th>
                  <th className="py-3 px-4 text-center">Auth Decision</th>
                  <th className="py-3 px-4 text-center">Forensics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#172033]">
                {transactions
                  .filter(t => 
                    t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.amount?.toString().includes(searchTerm)
                  )
                  .map((t) => {
                    const isThreat = t.prediction === 1;
                    return (
                      <tr 
                        key={t.id} 
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isThreat ? 'bg-red-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-[10px] text-[#64748B] font-mono">
                          {formatDate(t.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-bold text-xs">
                          {t.bank}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#172033] block">{t.customer_name}</span>
                          <span className="text-[10px] text-[#64748B] font-mono block">PAN: {t.pan_number}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#475569]">
                          {t.merchant}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#172033]">
                          ${t.amount?.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.fraud_type !== "None" ? (
                            <span className="skeuo-badge skeuo-badge-danger">
                              {t.fraud_type}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#64748B]">
                              Legitimate Session
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono font-bold ${
                            t.trust_score < 50 
                              ? 'text-red-600' 
                              : t.trust_score < 75 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {t.trust_score?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`skeuo-badge ${
                            t.auth_action === 'Allow' ? 'skeuo-badge-success' :
                            t.auth_action === 'OTP' ? 'skeuo-badge-warning' :
                            t.auth_action === 'Step-Up' ? 'skeuo-badge-warning' :
                            'skeuo-badge-danger'
                          }`}>
                            {t.auth_action || (isThreat ? 'Block' : 'Allow')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedTxId(t.id)}
                            className="skeuo-btn-secondary px-2.5 py-1 text-[11px] font-semibold text-blue-700 flex items-center gap-1 mx-auto"
                          >
                            <Info size={12} />
                            <span>Inspect</span>
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

      {/* Side Drawer for Explainable AI & GenAI SOC Briefing */}
      {selectedTxId && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setSelectedTxId(null)}
          />
          
          {/* Drawer container */}
          <div className="fixed right-0 top-0 h-screen w-full max-w-xl md:max-w-2xl bg-white border-l border-[#DCE3EB] z-50 shadow-[0_25px_60px_rgba(15,23,42,0.2)] flex flex-col transition-all duration-300 ease-out transform translate-x-0 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-[#DCE3EB] flex items-center justify-between bg-gradient-to-b from-white to-[#FAFCFD] sticky top-0 z-10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#172033] font-sans">
                    Identity Trust Case Audit File
                  </h3>
                </div>
                {currentTx && (
                  <p className="text-[11px] text-[#64748B] font-mono">
                    TX #{currentTx.id} • {currentTx.bank} • {formatDate(currentTx.timestamp)}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedTxId(null)}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Content Body */}
            <div className="p-5 flex-1 space-y-6">
              {loadingXAI ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-xs text-[#64748B] font-medium">
                    Computing SHAP Shapley values and synthesizing GenAI briefing...
                  </span>
                </div>
              ) : !explanationData || !currentTx ? (
                <div className="py-24 text-center text-[#64748B] space-y-3">
                  <Eye size={36} className="mx-auto text-[#94A3B8]" />
                  <p className="text-xs">Unable to load case file metrics.</p>
                </div>
              ) : (
                <>
                  {/* Quick Profile Summary */}
                  <div className="skeuo-panel p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC]">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#64748B]">Customer</span>
                      <p className="text-xs font-bold text-[#172033] truncate">{currentTx.customer_name}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#64748B]">PAN Card</span>
                      <p className="text-xs font-bold text-[#172033] font-mono">{currentTx.pan_number}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#64748B]">Device ID</span>
                      <p className="text-xs font-bold text-[#172033] font-mono truncate">{currentTx.device_id}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#64748B]">Verdict</span>
                      <p className={`text-xs font-black uppercase ${
                        currentTx.prediction === 1 ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {currentTx.prediction === 1 ? 'FLAGGED THREAT' : 'CLEARED ID'}
                      </p>
                    </div>
                  </div>

                  {/* GenAI SOC Briefing */}
                  {genAiReport && (
                    <div className="skeuo-panel p-5 space-y-4 border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50/20 to-white">
                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-purple-600" />
                          GenAI Automated Forensic Briefing
                        </h4>
                        <span className="skeuo-badge skeuo-badge-info">
                          {genAiReport.identity_trust_status || "Evaluated"}
                        </span>
                      </div>
     
                      <div className="space-y-3 text-xs leading-relaxed text-[#172033]">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-[#F1F5F9] pb-3">
                          <div>
                            <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Decision</span>
                            <span className="font-extrabold text-xs block mt-0.5 text-[#172033]">
                              {genAiReport.identity_trust_status || "Review Required"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Recommended Action</span>
                            <span className="font-semibold text-xs text-blue-700 block mt-0.5">
                              {genAiReport.recommended_action || "Standard Verification"}
                            </span>
                          </div>
                        </div>
     
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Detected Issues */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider flex items-center gap-1">
                              <AlertOctagon size={11} className="text-red-600" />
                              Detected Discrepancies
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(genAiReport.detected_issues || genAiReport.detected_risks || []).map((issue, idx) => (
                                <span key={idx} className="skeuo-badge skeuo-badge-danger text-[9px]">
                                  {issue}
                                </span>
                              ))}
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-[#64748B] text-[11px] mt-1">
                              {(genAiReport.anomalies_detected || []).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Playbook Steps */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider flex items-center gap-1">
                              <CheckSquare size={11} className="text-emerald-600" />
                              Remediation Playbook
                            </span>
                            <ul className="list-decimal pl-4 space-y-1 text-[#475569] text-[11px]">
                              {(genAiReport.recommended_actions || []).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SHAP Mathematical Feature Attributions */}
                  <div className="skeuo-panel p-5 space-y-3">
                    <div className="border-b border-[#F1F5F9] pb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                        <Eye size={14} className="text-blue-600" />
                        SHAP Mathematical Feature Contribution
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        Additive feature importances shifting baseline identity trust probability (Red = increased risk, Green = trust factor)
                      </p>
                    </div>

                    <div className="h-56 relative pt-2">
                      <Bar data={getShapChartData()} options={chartOptions} />
                    </div>

                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE3EB] text-xs leading-relaxed text-[#475569]">
                      <span className="font-bold text-[#172033] block mb-0.5">XAI Forensic Synthesis:</span>
                      {explanationData.explanation_text}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FraudDetection;
