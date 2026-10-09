import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Eye, 
  Info, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  CheckSquare, 
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';

const Explainability = ({ selectedTxId, transactions, fetchXAIExplanation, fetchGenAIReport }) => {
  const [txId, setTxId] = useState(selectedTxId);
  const [explanationData, setExplanationData] = useState(null);
  const [genAiReport, setGenAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const flaggedTransactions = transactions.filter(t => t.prediction === 1).slice(0, 8);

  const getShapChartData = () => {
    if (!explanationData) return null;
    const shapVals = explanationData.shap_values;
    const featureLabels = {
      amount: "Transaction Amount",
      distance_from_home: "Distance Deviation",
      device_trust_score: "Device Reputation",
      location_deviation: "Location Drift",
      is_synthetic: "Synthetic Identity Flag"
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
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
          Explainable AI (XAI) & Forensic Audit Center
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Mathematical SHAP feature attributions and automated GenAI investigative briefings for regulatory audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Quick Select Incidents */}
        <div className="skeuo-panel p-4 space-y-3">
          <div className="border-b border-[#F1F5F9] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
              Flagged Incidents Roster
            </h3>
            <p className="text-[10px] text-[#64748B]">Select an incident to audit model attribution</p>
          </div>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {flaggedTransactions.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#64748B]">
                No flagged incidents in current ledger. Trigger a threat simulation above.
              </div>
            ) : (
              flaggedTransactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTxId(t.id);
                    setExplanationData(null);
                    setGenAiReport(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    (selectedTxId || txId) === t.id
                      ? 'bg-blue-50/90 border-blue-300 text-blue-900 shadow-sm'
                      : 'bg-white border-[#DCE3EB] hover:bg-[#F8FAFC] text-[#172033]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#64748B] font-mono block">
                      TX #{t.id} • {t.bank}
                    </span>
                    <span className="text-xs font-bold block truncate max-w-[130px]">
                      {t.customer_name}
                    </span>
                    <span className="text-[10px] text-red-600 font-bold block">
                      Risk: {t.risk_score?.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#172033]">
                    ${t.amount?.toFixed(0)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Columns: SHAP Chart & GenAI Briefing */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="skeuo-panel p-20 flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-[#64748B]">Generating mathematical SHAP decomposition and SOC filing...</span>
            </div>
          ) : !explanationData || !currentTx ? (
            <div className="skeuo-panel p-16 text-center text-[#64748B] space-y-3">
              <Eye size={36} className="mx-auto text-[#94A3B8]" />
              <p className="text-xs font-medium">No transaction currently loaded for regulator audit.</p>
              <p className="text-[11px] text-[#94A3B8]">Select an incident from the ledger on the left or inject an attack from the top header.</p>
            </div>
          ) : (
            <>
              {/* Incident Header Summary */}
              <div className="skeuo-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F8FAFC]">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#64748B]">Origin Node</span>
                  <p className="text-xs font-bold text-[#172033]">{currentTx.bank}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#64748B]">Customer Name</span>
                  <p className="text-xs font-bold text-[#172033]">{currentTx.customer_name}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#64748B]">Clearance Value</span>
                  <p className="text-xs font-bold font-mono text-[#172033]">${currentTx.amount?.toFixed(2)}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-[#64748B]">Threat Classification</span>
                  <p className="text-xs font-black text-red-600 flex items-center gap-1">
                    <ShieldAlert size={13} />
                    {currentTx.fraud_type !== "None" ? currentTx.fraud_type : "Risk Anomaly"}
                  </p>
                </div>
              </div>

              {/* GenAI Forensic Briefing */}
              {genAiReport && (
                <div className="skeuo-panel p-5 space-y-4 border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50/20 to-white">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-600" />
                      GenAI Regulatory Forensic Briefing
                    </h3>
                    <span className="skeuo-badge skeuo-badge-info">
                      {genAiReport.identity_trust_status || genAiReport.risk_rating || "Evaluated"}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-[#172033]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-[#F1F5F9] pb-3">
                      <div>
                        <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Decision Verdict</span>
                        <span className="font-extrabold text-xs block mt-0.5 text-red-600">
                          {genAiReport.identity_trust_status || "High Risk Flag"}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Recommended Action</span>
                        <span className="font-semibold text-xs text-blue-700 block mt-0.5">
                          {genAiReport.recommended_action || "Step-Up Multi-Factor Challenge Required"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <ul className="list-disc pl-4 space-y-1 text-[#475569] text-[11px] mt-1.5">
                          {(genAiReport.anomalies_detected || []).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Remediation Playbook */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider flex items-center gap-1">
                          <CheckSquare size={11} className="text-emerald-600" />
                          Remediation Playbook Steps
                        </span>
                        <ul className="list-decimal pl-4 space-y-1 text-[#475569] text-[11px]">
                          {(genAiReport.recommended_actions || []).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#64748B] italic">
                      Analyst Note: {genAiReport.analyst_notes}
                    </div>
                  </div>
                </div>
              )}

              {/* SHAP Chart */}
              <div className="skeuo-panel p-5 space-y-3">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-600" />
                    SHAP Mathematical Feature Decision Attribution
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Quantitative Shapley values computing exact percentage probability shifts from the global validation baseline
                  </p>
                </div>
                <div className="h-56 relative pt-2">
                  <Bar data={getShapChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Additive Math Values (3 Columns) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="skeuo-panel p-3.5 text-center">
                  <span className="text-[9px] font-bold uppercase text-[#64748B] tracking-wider block">Base Prior Probability</span>
                  <p className="text-lg font-mono text-[#475569] font-bold mt-0.5">
                    {(explanationData.base_value * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="skeuo-panel p-3.5 text-center">
                  <span className="text-[9px] font-bold uppercase text-[#64748B] tracking-wider block">Shapley Shift</span>
                  <p className="text-lg font-mono text-purple-700 font-bold mt-0.5">
                    {((explanationData.prediction_probability - explanationData.base_value) * 100) >= 0 ? '+' : ''}
                    {((explanationData.prediction_probability - explanationData.base_value) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="skeuo-panel p-3.5 text-center border-l-4 border-l-red-600">
                  <span className="text-[9px] font-bold uppercase text-[#64748B] tracking-wider block">Final Risk Probability</span>
                  <p className="text-lg font-mono font-bold mt-0.5 text-red-600">
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
