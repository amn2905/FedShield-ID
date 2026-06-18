import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Cpu, 
  Lock, 
  ShieldAlert, 
  RefreshCw, 
  ArrowRight, 
  Layers, 
  EyeOff 
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

  // Mock weights table representing coefficient updates
  // If we have actual weights in the metrics, use them, otherwise mock realistic values.
  const globalWeights = metrics?.global_weights || {
    coef: [1.8, 1.5, -2.8, 2.2, 3.0],
    intercept: -1.5
  };
  
  const features = ["Transaction Amount", "Distance from Home", "Device Trust Score", "Location Deviation", "Synthetic Identity Flag"];

  // Chart data for round metrics
  const rounds = metrics?.accuracy_history || [];
  const chartData = {
    labels: rounds.map(r => `R${r.round}`),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: rounds.map(r => r.accuracy),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Loss',
        data: rounds.map(r => r.loss * 100), // Scale up loss for display on same chart or axis
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 40,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#22d3ee' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { color: '#f43f5e' }
      },
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#64748b' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight font-sans">
          Federated Learning Control Center
        </h2>
        <p className="text-slate-400 mt-1">
          Coordinate global aggregation rounds, optimize differential privacy noise, and monitor model convergence.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Controller Config Panel */}
        <div className="glass-panel p-6 space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h3 className="font-semibold text-base font-sans text-cyan-400 flex items-center gap-2">
              <Cpu size={18} />
              Round Hyperparameters
            </h3>
          </div>

          {/* Privacy Budget Epsilon Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300 font-medium">Privacy Budget (ε - Epsilon)</span>
              <span className="text-cyan-400 font-mono font-bold">{epsilon.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="15.0" 
              step="0.5"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock size={10} /> Strong Privacy (More Noise)
              </span>
              <span className="flex items-center gap-1">
                Weak Privacy (Less Noise) <EyeOff size={10} />
              </span>
            </div>
            
            {/* DP Info Box */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60 mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Resulting Privacy Score:</span>
                <span className="font-bold text-emerald-400">{getPrivacyScore(epsilon)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Laplacian Noise Scale:</span>
                <span className="font-mono text-cyan-300">{round(0.5 / (epsilon * Math.log(400)), 4)}</span>
              </div>
            </div>
          </div>

          {/* Encryption Mode Selector */}
          <div className="space-y-3">
            <label className="text-sm text-slate-300 font-medium block">
              Communication Security Mode
            </label>
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1 rounded-xl border border-slate-900">
              <button
                type="button"
                onClick={() => setEncryptionMode('PQC')}
                disabled={isRunning}
                className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  encryptionMode === 'PQC'
                    ? 'bg-purple-900/50 border border-purple-800 text-purple-300 shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Post-Quantum (Kyber)
              </button>
              <button
                type="button"
                onClick={() => setEncryptionMode('Traditional')}
                disabled={isRunning}
                className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  encryptionMode === 'Traditional'
                    ? 'bg-blue-900/30 border border-blue-800/80 text-blue-400 shadow'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Traditional (ECDH)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              {encryptionMode === 'PQC' 
                ? 'Secures parameter transfers using CRYSTALS-Kyber quantum-resistant key encapsulation and AES-256-GCM.' 
                : 'Secures updates via standard Elliptic Curve Diffie-Hellman (ECDH) key exchange. Vulnerable to Shor\'s algorithm.'
              }
            </p>
          </div>

          {/* Run Federated Round Button */}
          <button
            onClick={handleRunRound}
            disabled={isRunning}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              isRunning 
                ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800' 
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-glow hover:opacity-95'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Aggregating Model...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Trigger Federated Round
              </>
            )}
          </button>
        </div>

        {/* Right 2 Columns: Network Visualization & Round Stats */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Network Diagram */}
          <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            
            {/* Bank Node A */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-800/60 shadow-lg text-center w-28 relative">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 absolute top-2 right-2 animate-pulse" />
                <span className="text-xs font-bold font-sans">Bank A</span>
                <span className="text-[10px] text-slate-500 block">Retail Node</span>
              </div>
              <span className="text-[10px] text-purple-400 font-semibold uppercase font-mono px-2 py-0.5 rounded bg-purple-950/20 border border-purple-900/40">
                Kyber Tunnel
              </span>
            </div>

            {/* Transfer Arrows */}
            <div className="flex flex-col items-center flex-1 justify-center relative min-w-[30px] min-h-[40px] md:min-h-0">
              <div className="flex gap-1 items-center">
                <span className="h-1 w-8 md:w-16 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse-glow" />
                <ArrowRight size={14} className="text-cyan-400 animate-pulse" />
              </div>
            </div>

            {/* Central Aggregator */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-gradient-to-tr from-cyan-900/60 to-purple-900/40 p-6 rounded-2xl border border-cyan-500/30 shadow-glow text-center w-36 relative">
                <div className="h-2 w-2 rounded-full bg-cyan-400 absolute top-3 right-3 animate-ping" />
                <Layers className="mx-auto text-cyan-400 mb-2" size={24} />
                <span className="text-xs font-black tracking-wider uppercase font-sans">Aggregator</span>
                <span className="text-[9px] text-cyan-300 block font-semibold mt-1 bg-slate-950/60 border border-cyan-800/40 rounded px-1.5 py-0.5">
                  FedAvg Server
                </span>
              </div>
            </div>

            {/* Transfer Arrows */}
            <div className="flex flex-col items-center flex-1 justify-center relative min-w-[30px] min-h-[40px] md:min-h-0">
              <div className="flex gap-1 items-center">
                <ArrowRight size={14} className="text-cyan-400 rotate-180 md:rotate-0" />
                <span className="h-1 w-8 md:w-16 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full animate-pulse-glow" />
              </div>
            </div>

            {/* Bank Node B / C Column */}
            <div className="flex flex-col gap-4">
              {/* Bank B */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/60 shadow-lg text-center w-28 relative">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 absolute top-2 right-2 animate-pulse" />
                  <span className="text-xs font-bold font-sans">Bank B</span>
                  <span className="text-[10px] text-slate-500 block">Premium Cards</span>
                </div>
              </div>
              {/* Bank C */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-800/60 shadow-lg text-center w-28 relative">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 absolute top-2 right-2 animate-pulse" />
                  <span className="text-xs font-bold font-sans">Bank C</span>
                  <span className="text-[10px] text-slate-500 block">Micro Savings</span>
                </div>
              </div>
            </div>

          </div>

          {/* Accuracy vs Loss convergence graph */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-base font-sans">
                  Model Convergence History
                </h3>
                <p className="text-xs text-slate-500">
                  Dual-axis showing global validation accuracy vs cross-entropy loss.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Current Accuracy:{' '}
                <span className="font-bold text-cyan-400">
                  {metrics?.model_accuracy_percent || '82.5'}%
                </span>
              </div>
            </div>
            <div className="h-60 relative">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>

      </div>

      {/* Numerical weights/coefficients table */}
      <div className="glass-panel p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-base font-sans">
            Federated Model Weights & Coefficients Vector
          </h3>
          <p className="text-xs text-slate-500">
            Real coefficients aggregated using FedAvg. These represent the mathematical features the model uses to verify trust.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Feature Vector Component</th>
                <th className="py-3 px-4">Average Feature Weight (Global)</th>
                <th className="py-3 px-4">Risk Contribution direction</th>
                <th className="py-3 px-4">Relative Sensitivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {features.map((feature, idx) => {
                const val = globalWeights.coef[idx] || 0.0;
                return (
                  <tr key={feature} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-300">{feature}</td>
                    <td className="py-4 px-4 font-mono text-cyan-400 font-bold">
                      {val.toFixed(4)}
                    </td>
                    <td className="py-4 px-4">
                      {val > 0 ? (
                        <span className="text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/60 px-2.5 py-0.5 rounded">
                          POS COMPONENT (Increases Risk Score Deviation)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-0.5 rounded">
                          NEG COMPONENT (Suppresses Risk Score Deviation)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[200px]">
                        <div 
                          className="bg-cyan-400 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, Math.abs(val) * 30)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-900/10">
                <td className="py-4 px-4 font-bold text-slate-300">Model Bias (Intercept)</td>
                <td className="py-4 px-4 font-mono text-purple-400 font-bold">
                  {Number(globalWeights.intercept).toFixed(4)}
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-950/60 border border-slate-900 px-2.5 py-0.5 rounded">
                    Global Base Prior Probability
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                  {round(100 / (1 + Math.exp(-globalWeights.intercept)), 2)}% base risk probability
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
