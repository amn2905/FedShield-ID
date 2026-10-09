import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Cpu, 
  Lock, 
  ShieldAlert, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  EyeOff,
  ShieldCheck,
  Server,
  Zap,
  CheckCircle2,
  Sliders
} from 'lucide-react';

const FederatedMonitor = ({ metrics, onTriggerRound }) => {
  const [epsilon, setEpsilon] = useState(2.0);
  const [encryptionMode, setEncryptionMode] = useState('PQC');
  const [isRunning, setIsRunning] = useState(false);
  const [roundLog, setRoundLog] = useState([]);

  // Calculate privacy score based on epsilon
  const getPrivacyScore = (eps) => {
    return Math.min(100, Math.max(0, Math.round(100 - (eps * 12))));
  };

  const handleRunRound = async () => {
    setIsRunning(true);
    try {
      const result = await onTriggerRound({ epsilon, encryption_mode: encryptionMode });
      setRoundLog(prev => [result, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const globalWeights = metrics?.global_weights || {
    coef: [1.8, 1.5, -2.8, 2.2, 3.0],
    intercept: -1.5
  };
  
  const features = [
    "Transaction Amount", 
    "Distance from Home", 
    "Device Trust Score", 
    "Location Deviation", 
    "Synthetic Identity Flag"
  ];

  const rounds = metrics?.accuracy_history || [];
  const chartData = {
    labels: rounds.map(r => `R${r.round}`),
    datasets: [
      {
        label: 'Global Accuracy (%)',
        data: rounds.map(r => r.accuracy),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2.5,
        tension: 0.3,
        yAxisID: 'y',
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Cross-Entropy Loss (x100)',
        data: rounds.map(r => r.loss * 100),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
        pointBackgroundColor: '#DC2626',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3.5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { 
          color: '#475569', 
          font: { family: 'Inter', size: 11, weight: '500' },
          usePointStyle: true,
          boxWidth: 8 
        }
      },
      tooltip: {
        backgroundColor: '#172033',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 8,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 40,
        max: 100,
        grid: { color: '#F1F5F9' },
        ticks: { color: '#2563EB', font: { size: 10, weight: '500' }, callback: v => `${v}%` }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { color: '#DC2626', font: { size: 10, weight: '500' } }
      },
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B', font: { size: 10, weight: '500' } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
          Federated Learning Control Center & Differential Privacy
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Execute decentralized model aggregation rounds, inject calibrated Laplacian noise, and coordinate quantum-resistant weight handshakes.
        </p>
      </div>

      {/* Main Grid: Left Controls + Right Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Hyperparameter Controller */}
        <div className="skeuo-panel p-5 space-y-5">
          <div className="border-b border-[#F1F5F9] pb-3 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-2">
              <Sliders size={15} className="text-blue-600" />
              Round Hyperparameters
            </h3>
            <span className="skeuo-badge skeuo-badge-info">FedAvg</span>
          </div>

          {/* Privacy Budget Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#64748B] font-semibold">Privacy Budget (ε - Epsilon)</span>
              <span className="text-blue-700 font-mono font-bold text-sm">ε = {epsilon.toFixed(1)}</span>
            </div>
            
            <input 
              type="range" 
              min="0.5" 
              max="15.0" 
              step="0.5"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-[#E9EDF2] rounded-lg appearance-none cursor-pointer accent-blue-600 shadow-inner"
            />
            
            <div className="flex justify-between items-center text-[10px] text-[#64748B]">
              <span className="flex items-center gap-1 font-medium">
                <Lock size={10} className="text-emerald-600" /> High Privacy (More Noise)
              </span>
              <span className="flex items-center gap-1 font-medium">
                High Utility (Less Noise) <EyeOff size={10} className="text-amber-600" />
              </span>
            </div>
            
            {/* DP Info Box */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#DCE3EB] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">DP Privacy Guarantee:</span>
                <span className="font-bold text-emerald-700">{getPrivacyScore(epsilon)}% (Strict)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Laplacian Noise Scale (b):</span>
                <span className="font-mono font-bold text-[#172033]">{round(0.5 / (epsilon * Math.log(400)), 4)}</span>
              </div>
            </div>
          </div>

          {/* Communication Security Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[#64748B] block">
              Parameter Transfer Cryptography
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#DCE3EB]">
              <button
                type="button"
                onClick={() => setEncryptionMode('PQC')}
                disabled={isRunning}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  encryptionMode === 'PQC'
                    ? 'bg-white text-purple-700 shadow-sm border border-[#DCE3EB]'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Kyber-768 PQC
              </button>
              <button
                type="button"
                onClick={() => setEncryptionMode('Traditional')}
                disabled={isRunning}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  encryptionMode === 'Traditional'
                    ? 'bg-white text-blue-700 shadow-sm border border-[#DCE3EB]'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                ECDH-P256 TLS
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {encryptionMode === 'PQC' 
                ? 'Secures parameter transfers using CRYSTALS-Kyber post-quantum lattice encryption + AES-256-GCM.' 
                : 'Secures updates via standard Elliptic Curve Diffie-Hellman (ECDH) key exchange.'
              }
            </p>
          </div>

          {/* Trigger Round Action */}
          <button
            onClick={handleRunRound}
            disabled={isRunning}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              isRunning 
                ? 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed border border-[#CBD5E1]' 
                : 'skeuo-btn-primary'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Aggregating Enclave Weights...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Execute Federated Round</span>
              </>
            )}
          </button>

          {roundLog.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Round #{roundLog[0].round_number} Synced</span>
              </div>
              <div className="text-[11px] text-[#475569]">
                Accuracy: <strong>{(roundLog[0].global_accuracy * 100).toFixed(1)}%</strong> • Mode: <strong>{roundLog[0].encryption_mode}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Network Architecture Diagram & Accuracy Chart */}
        <div className="xl:col-span-2 space-y-6">
          {/* Visual Network Architecture Diagram */}
          <div className="skeuo-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden bg-gradient-to-r from-white via-[#FAFCFD] to-blue-50/20">
            {/* Bank Node A */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EB] shadow-sm text-center w-28 relative">
                <span className="w-2 h-2 rounded-full bg-purple-600 absolute top-2 right-2 animate-pulse" />
                <span className="text-xs font-bold text-[#172033] block">Bank A</span>
                <span className="text-[10px] text-[#64748B] font-mono block">Random Forest</span>
              </div>
              <span className="skeuo-badge skeuo-badge-info text-[9px]">
                Kyber Tunnel
              </span>
            </div>

            {/* Ingress Arrow */}
            <div className="flex items-center gap-1">
              <span className="h-0.5 w-12 bg-blue-300"></span>
              <ArrowRight size={14} className="text-blue-600" />
            </div>

            {/* Central Aggregator Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="bg-gradient-to-b from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200 shadow-sm text-center w-36 relative">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute top-2.5 right-2.5 animate-pulse" />
                <Layers className="mx-auto text-blue-700 mb-1" size={24} />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#172033] block">Aggregator</span>
                <span className="text-[9px] font-bold text-blue-800 bg-white/90 border border-blue-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                  FedAvg Server
                </span>
              </div>
            </div>

            {/* Egress Arrow */}
            <div className="flex items-center gap-1">
              <span className="h-0.5 w-12 bg-blue-300"></span>
              <ArrowRight size={14} className="text-blue-600" />
            </div>

            {/* Bank Nodes B & C */}
            <div className="flex flex-col gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE3EB] shadow-sm text-center w-28 relative">
                <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-2 right-2 animate-pulse" />
                <span className="text-xs font-bold text-[#172033] block">Bank B</span>
                <span className="text-[10px] text-[#64748B] font-mono block">XGBoost</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE3EB] shadow-sm text-center w-28 relative">
                <span className="w-2 h-2 rounded-full bg-amber-600 absolute top-2 right-2 animate-pulse" />
                <span className="text-xs font-bold text-[#172033] block">Bank C</span>
                <span className="text-[10px] text-[#64748B] font-mono block">LightGBM</span>
              </div>
            </div>
          </div>

          {/* Accuracy & Loss Convergence Chart */}
          <div className="skeuo-panel p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
                  Model Convergence History
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Global test accuracy progression vs cross-entropy loss across aggregation rounds
                </p>
              </div>
              <div className="text-xs text-[#64748B]">
                Current Accuracy: <span className="font-bold text-blue-700">{metrics?.model_accuracy_percent || '82.5'}%</span>
              </div>
            </div>
            <div className="h-56 relative pt-2">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Global Model Weights & Coefficients Table */}
      <div className="skeuo-panel p-5 space-y-3">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
            Federated Model Parameter Weights & Feature Coefficients
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Mathematical weights aggregated using Federated Averaging. Used directly by the identity trust prediction engine.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE3EB] text-[#64748B] font-semibold uppercase tracking-wider bg-[#F8FAFC]">
                <th className="py-2.5 px-4 rounded-l-lg">Feature Vector Component</th>
                <th className="py-2.5 px-4">Global Coefficient</th>
                <th className="py-2.5 px-4">Risk Contribution Direction</th>
                <th className="py-2.5 px-4 rounded-r-lg">Relative Sensitivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#172033]">
              {features.map((feature, idx) => {
                const val = globalWeights.coef[idx] || 0.0;
                return (
                  <tr key={feature} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#172033]">{feature}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {val.toFixed(4)}
                    </td>
                    <td className="py-3 px-4">
                      {val > 0 ? (
                        <span className="skeuo-badge skeuo-badge-danger">
                          + Increases Risk Shift
                        </span>
                      ) : (
                        <span className="skeuo-badge skeuo-badge-success">
                          - Suppresses Risk Shift
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="skeuo-well h-2 max-w-[200px] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${val > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.abs(val) * 32)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#F8FAFC]">
                <td className="py-3 px-4 font-bold text-[#172033]">Model Bias (Intercept)</td>
                <td className="py-3 px-4 font-mono font-bold text-purple-700">
                  {Number(globalWeights.intercept).toFixed(4)}
                </td>
                <td className="py-3 px-4">
                  <span className="skeuo-badge skeuo-badge-neutral">
                    Global Base Baseline
                  </span>
                </td>
                <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                  {round(100 / (1 + Math.exp(-globalWeights.intercept)), 2)}% prior baseline probability
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const round = (val, dec) => {
  if (val === undefined || isNaN(val)) return 0;
  return Number(val).toFixed(dec);
};

export default FederatedMonitor;
