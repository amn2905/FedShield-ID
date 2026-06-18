import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
  Lock,
  TrendingUp,
  Users,
  Globe,
  KeyRound,
  Fingerprint,
  UserX,
  Bot,
  AlertTriangle,
  History,
  Smartphone,
  Eye,
  Activity,
  CheckSquare
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Overview = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  // Chart 1: Federated Accuracy Convergence
  const accuracyChartData = {
    labels: metrics.accuracy_history.map(h => `Round ${h.round}`),
    datasets: [
      {
        label: 'Global Aggregated Model',
        data: metrics.accuracy_history.map(h => h.accuracy),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#22d3ee',
      },
      {
        label: 'Bank A (Random Forest)',
        data: metrics.accuracy_history.map(h => h.bank_a),
        borderColor: '#c084fc',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 1,
      },
      {
        label: 'Bank B (XGBoost)',
        data: metrics.accuracy_history.map(h => h.bank_b),
        borderColor: '#34d399',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 1,
      },
      {
        label: 'Bank C (LightGBM)',
        data: metrics.accuracy_history.map(h => h.bank_c),
        borderColor: '#60a5fa',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(51, 65, 85, 0.15)' }, ticks: { color: '#64748b', font: { size: 9 } } },
      y: { grid: { color: 'rgba(51, 65, 85, 0.15)' }, ticks: { color: '#64748b', font: { size: 9 } }, min: 40, max: 100 }
    }
  };

  // Chart 2: Threat Matrix Breakdown by Bank
  const distributionChartData = {
    labels: metrics.bank_distribution.map(b => b.bank),
    datasets: [
      {
        label: 'Verified Identity Clearances',
        data: metrics.bank_distribution.map(b => b.total_transactions - b.fraud_transactions),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Identity Threat Flags',
        data: metrics.bank_distribution.map(b => b.fraud_transactions),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 6,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#64748b' } },
      y: { stacked: true, grid: { color: 'rgba(51, 65, 85, 0.1)' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            Executive Identity Trust SOC
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Continuous Identity Trust Framework: Real-time identity verification, continuous adaptive authentication metrics, and cross-bank threat analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold">
          <Globe size={13} className="text-cyan-400 animate-spin" />
          <span>Active Tunnel Security: <span className="text-purple-400 font-black">KYBER-768 PQC</span></span>
        </div>
      </div>

      {/* Top Dashboard Cards: Identity Trust KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* 1. Identity Trust Score */}
        <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-800 transition-all bg-slate-900/10">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Identity Trust Score</span>
          <div className="flex justify-between items-end mt-4">
            <h3 className="text-2xl font-black font-sans text-emerald-400">
              {metrics.avg_trust_score || '88.5'}%
            </h3>
            <span className="text-emerald-400 p-2 rounded bg-slate-900"><Fingerprint size={16} /></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">Aggregated network trust average</span>
        </div>

        {/* 2. Behavioral Risk Score */}
        <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-800 transition-all bg-slate-900/10">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Behavioral Risk Score</span>
          <div className="flex justify-between items-end mt-4">
            <h3 className="text-2xl font-black font-sans text-cyan-400">
              {metrics.behavioral_anomalies || 0} Alerts
            </h3>
            <span className="text-cyan-400 p-2 rounded bg-slate-900"><Bot size={16} /></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">Behavioral biometric anomalies</span>
        </div>

        {/* 3. Device Trust Score */}
        <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-800 transition-all bg-slate-900/10">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Device Trust Score</span>
          <div className="flex justify-between items-end mt-4">
            <h3 className="text-2xl font-black font-sans text-purple-400">
              {metrics.new_device_risks || 0} Risks
            </h3>
            <span className="text-purple-400 p-2 rounded bg-slate-900"><Smartphone size={16} /></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">Unrecognized/rooted devices</span>
        </div>

        {/* 4. Recovery Risk Score */}
        <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-800 transition-all bg-slate-900/10">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Recovery Risk Score</span>
          <div className="flex justify-between items-end mt-4">
            <h3 className="text-2xl font-black font-sans text-yellow-400">
              {metrics.suspicious_recoveries || 0} Events
            </h3>
            <span className="text-yellow-400 p-2 rounded bg-slate-900"><History size={16} /></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">SIM Swap & reset anomalies</span>
        </div>

        {/* 5. Insider Threat Score */}
        <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-800 transition-all bg-slate-900/10">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Insider Threat Score</span>
          <div className="flex justify-between items-end mt-4">
            <h3 className="text-2xl font-black font-sans text-red-400">
              {metrics.insider_threats || 0} Alerts
            </h3>
            <span className="text-red-400 p-2 rounded bg-slate-900"><ShieldAlert size={16} /></span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 block">Privileged access violations</span>
        </div>

      </div>

      {/* Primary Telemetry Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Metric 1 */}
        <div className="glass-panel p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Trust Events</span>
            <h3 className="text-2xl font-black text-slate-200">
              {(metrics.identity_trust_events || metrics.total_transactions).toLocaleString()}
            </h3>
            <span className="text-[9px] text-slate-500">Total verified transactions & sessions</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800 text-cyan-400"><Activity size={20} /></div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PQC Keys Security</span>
            <h3 className="text-2xl font-black text-purple-400">{metrics.security_score_percent}%</h3>
            <span className="text-[9px] text-purple-300 font-bold uppercase">{metrics.encryption_type} Enabled</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800 text-purple-400"><Lock size={20} /></div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Threat Status</span>
            <h3 className={`text-2xl font-black uppercase ${metrics.threat_level === 'High' ? 'text-red-400' :
                metrics.threat_level === 'Elevated' ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
              {metrics.threat_level}
            </h3>
            <span className="text-[9px] text-slate-500">Based on active incident alerts rate</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800 text-yellow-400"><ShieldAlert size={20} /></div>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ML model round progression */}
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm font-sans text-slate-300">
              Federated Learning Model Convergence Metrics
            </h3>
            <p className="text-[10px] text-slate-500">
              Shows how Bank A (Random Forest), Bank B (XGBoost), and Bank C (LightGBM) converge collaborative weights.
            </p>
          </div>
          <div className="h-64 relative">
            <Line data={accuracyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Clearances vs flags */}
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm font-sans text-slate-300">
              Identity Clearance Audits vs Flagged Threats
            </h3>
            <p className="text-[10px] text-slate-500">
              Clears vs blocked identity risk events tracked across localized regional nodes.
            </p>
          </div>
          <div className="h-64 relative">
            <Bar data={distributionChartData} options={barChartOptions} />
          </div>
        </div>

      </div>

      {/* Collaborating banks profiles */}
      <div className="glass-panel p-5 space-y-3">
        <h3 className="font-semibold text-sm font-sans text-slate-300">Collaborating Banking Nodes & Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/40">
                <th className="py-2.5 px-3">Bank Node</th>
                <th className="py-2.5 px-3">Local Engine type</th>
                <th className="py-2.5 px-3 text-right">Audited Events</th>
                <th className="py-2.5 px-3 text-right">Convergence accuracy</th>
                <th className="py-2.5 px-3 text-center">DP Noise</th>
                <th className="py-2.5 px-3 text-center">PQC Encrypted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {metrics.bank_distribution.map((bank, idx) => {
                const colors = ['border-purple-500', 'border-emerald-500', 'border-cyan-500'];
                return (
                  <tr key={bank.bank} className="hover:bg-slate-900/10">
                    <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full border-2 ${colors[idx]}`} />
                      {bank.bank}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono font-bold">{bank.model_type}</td>
                    <td className="py-2.5 px-3 text-right">{bank.total_transactions.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-cyan-400">
                      {metrics.accuracy_history[metrics.accuracy_history.length - 1]
                        ? `${Number(idx === 0
                          ? metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_a
                          : idx === 1
                            ? metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_b
                            : metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_c).toFixed(2)}%`
                        : '82.5%'
                      }
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-bold uppercase">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded font-bold uppercase">
                        {metrics.encryption_type} SECURE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
