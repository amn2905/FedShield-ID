import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Eye, 
  Info, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles,
  CheckSquare,
  AlertOctagon
} from 'lucide-react';

const Explainability = ({ selectedTxId, transactions, fetchXAIExplanation, fetchGenAIReport }) => {
  const [txId, setTxId] = useState(selectedTxId);
  const [explanationData, setExplanationData] = useState(null);
  const [genAiReport, setGenAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch explanation and GenAI report
  useEffect(() => {
    const loadData = async () => {
      const activeId = selectedTxId || txId;
      if (!activeId) return;
      
      setLoading(true);
      try {
        const xaiData = await fetchXAIExplanation(activeId);
        setExplanationData(xaiData);
        
        const report = await fetchGenAIReport(activeId);
        setGenAiReport(report);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedTxId, txId]);

  const currentTx = transactions.find(t => t.id === (selectedTxId || txId));
  const flaggedTransactions = transactions.filter(t => t.prediction === 1).slice(0, 6);

  const getShapChartData = () => {
    if (!explanationData) return null;
    const shapVals = explanationData.shap_values;
    const featureLabels = {
      amount: "Transaction Amount",
      distance_from_home: "Distance from Home",
      device_trust_score: "Device Reputation",
      location_deviation: "Location Deviation",
      is_synthetic: "Synthetic Identity Flag"
    };

    const labels = Object.keys(shapVals).map(k => featureLabels[k] || k);
    const data = Object.values(shapVals).map(v => v * 100);
    
    const colors = data.map(v => v >= 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)');
    const borderColors = data.map(v => v >= 0 ? '#ef4444' : '#10b981');

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
        callbacks: {
          label: (context) => `${context.raw >= 0 ? '+' : ''}${context.raw.toFixed(2)}% risk shift`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { 
          color: '#94a3b8',
          callback: (value) => `${value >= 0 ? '+' : ''}${value}%`
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#e2e8f0', font: { family: 'Inter', weight: '500', size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Explainable AI (XAI) & GenAI Audit Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect mathematical feature attributions and read automatically compiled GenAI security filings.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Column: Quick Select Alerts */}
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-xs font-sans text-slate-300 uppercase tracking-wider">
              Alerts Directory
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Select any incident below to inspect metrics.
            </p>
          </div>
          
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {flaggedTransactions.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTxId(t.id);
                  setExplanationData(null);
                  setGenAiReport(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  (selectedTxId || txId) === t.id
                    ? 'bg-slate-900 border-cyan-500/50 shadow-glow'
                    : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-semibold font-mono block">
                    ID #{t.id} • {t.bank}
                  </span>
                  <span className="text-xs font-bold text-slate-200 block truncate max-w-[130px]">
                    {t.customer_name}
                  </span>
                  <span className="text-[9px] text-red-400 font-semibold font-mono block">
                    Risk: {t.risk_score.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-200">
                  ${t.amount.toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Columns: SHAP Chart & GenAI Briefing */}
        <div className="xl:col-span-3 space-y-6">
          
          {loading ? (
            <div className="glass-panel p-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
            </div>
          ) : !explanationData || !currentTx ? (
            <div className="glass-panel p-16 text-center text-slate-500 space-y-3">
              <Eye size={36} className="mx-auto text-slate-600 animate-pulse" />
              <p className="text-xs">No transaction currently loaded for regulator audit.</p>
              <p className="text-[10px] text-slate-600">Select an alert from the ledger or run an attack simulation.</p>
            </div>
          ) : (
            <>
              {/* Transaction details card */}
              <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-0.5 w-full bg-gradient-to-r from-red-500 via-purple-600 to-cyan-400" />
                
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Origin Node</span>
                  <p className="text-xs font-semibold text-slate-200">{currentTx.bank}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Customer Name</span>
                  <p className="text-xs font-semibold text-slate-200">{currentTx.customer_name}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Clear Amount</span>
                  <p className="text-xs font-bold text-slate-100 font-mono">${currentTx.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Identity Trust Alert Class</span>
                  <p className="text-xs font-extrabold text-red-400 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    {currentTx.fraud_type !== "None" ? currentTx.fraud_type : "Standard Risk Deviation"}
                  </p>
                </div>
              </div>
 
              {/* GenAI security Analyst Briefing (Upgraded V2!) */}
              {genAiReport && (
                <div className="glass-panel p-5 space-y-4 border border-purple-500/20 bg-purple-950/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-1 bg-purple-500 animate-pulse" />
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-semibold text-sm font-sans text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-purple-400 animate-pulse" />
                      GenAI Identity Trust Briefing
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      genAiReport.risk_color === 'red' ? 'bg-red-950/60 border border-red-800 text-red-300' :
                      genAiReport.risk_color === 'orange' ? 'bg-orange-950/60 border border-orange-800 text-orange-300' :
                      genAiReport.risk_color === 'yellow' ? 'bg-yellow-950/60 border border-yellow-800 text-yellow-300' :
                      'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    }`}>
                      {genAiReport.identity_trust_status || genAiReport.risk_rating}
                    </span>
                  </div>
 
                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Identity Trust Status</span>
                        <span className={`font-black text-xs block mt-1 uppercase ${
                          genAiReport.risk_color === 'red' ? 'text-red-400' :
                          genAiReport.risk_color === 'orange' ? 'text-orange-400' :
                          genAiReport.risk_color === 'yellow' ? 'text-yellow-400' :
                          'text-emerald-400'
                        }`}>
                          {genAiReport.identity_trust_status || "High Risk"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Recommended Action</span>
                        <span className="font-extrabold text-xs text-slate-200 block mt-1 bg-slate-950 border border-slate-900 px-2.5 py-1 rounded-lg">
                          {genAiReport.recommended_action || "Trigger Step-Up Authentication"}
                        </span>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Detected Issues */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                          <AlertOctagon size={11} className="text-red-400" />
                          Detected Issues
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(genAiReport.detected_issues || genAiReport.detected_risks || []).map((issue, idx) => (
                            <span key={idx} className="bg-red-950/20 text-red-400 border border-red-900/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {issue}
                            </span>
                          ))}
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px] mt-2 leading-normal">
                          {genAiReport.anomalies_detected.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Recommended Mitigation Playbook */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                          <CheckSquare size={11} className="text-emerald-400" />
                          Recommended Mitigation Actions
                        </span>
                        <ul className="list-decimal pl-4 space-y-1 text-slate-400 text-[10px] leading-normal">
                          {genAiReport.recommended_actions.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
 
                    <div className="pt-2 border-t border-slate-900/60 text-[10px] text-slate-500 italic">
                      {genAiReport.analyst_notes}
                    </div>
                  </div>
                </div>
              )}

              {/* SHAP Chart */}
              <div className="glass-panel p-5 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm font-sans text-slate-200">
                    SHAP Decision Attribution values
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Quantitative effect of features on global validation boundaries (Probability scale).
                  </p>
                </div>
                <div className="h-56 relative">
                  <Bar data={getShapChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Additive values */}
              <div className="grid grid-cols-3 gap-4">
                
                <div className="glass-panel p-3 text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Base Probability</span>
                  <p className="text-base font-mono text-slate-400 font-bold mt-0.5">
                    {(explanationData.base_value * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="glass-panel p-3 text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Shapley Shift</span>
                  <p className="text-base font-mono text-purple-400 font-bold mt-0.5">
                    {((explanationData.prediction_probability - explanationData.base_value) * 100) >= 0 ? '+' : ''}
                    {((explanationData.prediction_probability - explanationData.base_value) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="glass-panel p-3 text-center relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Final Risk Score</span>
                  <p className="text-base font-mono font-bold mt-0.5 text-red-400">
                    {(explanationData.prediction_probability * 100).toFixed(1)}%
                  </p>
                </div>

              </div>

            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Explainability;
