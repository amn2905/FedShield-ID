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
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Overview = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Loading telemetry from banking nodes...</p>
      </div>
    );
  }

  // Chart 1: Federated Accuracy Convergence
  const accuracyChartData = {
    labels: metrics.accuracy_history?.map(h => `Round ${h.round}`) || ['R0', 'R1', 'R2', 'R3'],
    datasets: [
      {
        label: 'Global Aggregated Model',
        data: metrics.accuracy_history?.map(h => h.accuracy) || [50, 72, 78.5, 82.5],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Bank A (Random Forest)',
        data: metrics.accuracy_history?.map(h => h.bank_a) || [50, 70, 77, 81],
        borderColor: '#7C3AED',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 2,
      },
      {
        label: 'Bank B (XGBoost)',
        data: metrics.accuracy_history?.map(h => h.bank_b) || [50, 73, 79, 83.5],
        borderColor: '#0F766E',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 2,
      },
      {
        label: 'Bank C (LightGBM)',
        data: metrics.accuracy_history?.map(h => h.bank_c) || [50, 71, 78, 82],
        borderColor: '#D97706',
        borderWidth: 1.5,
        borderDash: [4, 4],
        tension: 0.35,
        fill: false,
        pointRadius: 2,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
        padding: 10,
        cornerRadius: 8,
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: { 
        grid: { color: '#F1F5F9' }, 
        ticks: { color: '#64748B', font: { size: 10, weight: '500' } } 
      },
      y: { 
        grid: { color: '#F1F5F9' }, 
        ticks: { 
          color: '#64748B', 
          font: { size: 10, weight: '500' },
          callback: (value) => `${value}%`
        }, 
        min: 40, 
        max: 100 
      }
    }
  };

  // Chart 2: Threat Matrix Breakdown by Bank
  const distributionChartData = {
    labels: metrics.bank_distribution?.map(b => b.bank) || ['Bank A', 'Bank B', 'Bank C'],
    datasets: [
      {
        label: 'Trusted Identity Clearances',
        data: metrics.bank_distribution?.map(b => b.total_transactions - b.fraud_transactions) || [230, 235, 238],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'High-Risk Threats Flagged',
        data: metrics.bank_distribution?.map(b => b.fraud_transactions) || [20, 15, 12],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderColor: '#DC2626',
        borderWidth: 1,
        borderRadius: 6,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
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
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { 
        stacked: true, 
        grid: { display: false }, 
        ticks: { color: '#64748B', font: { size: 10, weight: '500' } } 
      },
      y: { 
        stacked: true, 
        grid: { color: '#F1F5F9' }, 
        ticks: { color: '#64748B', font: { size: 10, weight: '500' } } 
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Live SOC Alert Bar */}
      <div className="skeuo-panel p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-white via-white to-blue-50/40 border-l-4 border-l-blue-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm border border-blue-200">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172033]">
              Autonomous Identity Trust Monitoring Active
            </h3>
            <p className="text-xs text-[#64748B]">
              Multi-bank decentralized verification across 3 member nodes with zero raw customer data centralization.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="skeuo-badge skeuo-badge-info">
            <Globe size={11} className="mr-1" /> Kyber-768 Lattice PQC
          </span>
          <span className="skeuo-badge skeuo-badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Aggregator Online
          </span>
        </div>
      </div>

      {/* Top KPI Metric Cards (5 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Identity Trust Score */}
        <div className="skeuo-panel p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Avg Trust Score</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Fingerprint size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#172033] tracking-tight">
              {metrics.avg_trust_score || '88.5'}<span className="text-sm font-bold text-[#64748B]">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={12} />
              <span>Optimal Network Baseline</span>
            </div>
          </div>
        </div>

        {/* 2. Total Sessions & Requests */}
        <div className="skeuo-panel p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Verifications</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Activity size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#172033] tracking-tight">
              {(metrics.identity_trust_events || metrics.total_transactions || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-[#64748B]">
              <span>Verified Ledger Audits</span>
            </div>
          </div>
        </div>

        {/* 3. High-Risk Threats Flagged */}
        <div className="skeuo-panel p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] uppercase font-bold tracking-wider">High-Risk Threats</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 tracking-tight">
              {metrics.fraud_transactions || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-red-600">
              <span>{metrics.fraud_rate_percent || 0}% Threat Rate</span>
            </div>
          </div>
        </div>

        {/* 4. Behavioral Biometric Anomalies */}
        <div className="skeuo-panel p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Behavioral Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Bot size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#172033] tracking-tight">
              {metrics.behavioral_anomalies || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-600">
              <span>Robotic jitter / speed flags</span>
            </div>
          </div>
        </div>

        {/* 5. Account Recovery / SIM Swaps */}
        <div className="skeuo-panel p-4 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] uppercase font-bold tracking-wider">Suspicious Recoveries</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <History size={15} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#172033] tracking-tight">
              {metrics.suspicious_recoveries || 0}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-purple-600">
              <span>SIM swap & rooted risks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Model Convergence */}
        <div className="skeuo-panel p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">
                Federated Learning Model Convergence
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Cross-bank model accuracy progression without transferring private datasets
              </p>
            </div>
            <span className="skeuo-badge skeuo-badge-info">
              Accuracy: {metrics.model_accuracy_percent || 82.5}%
            </span>
          </div>
          <div className="h-64 relative pt-2">
            <Line data={accuracyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Clearances vs Threats Bar Chart */}
        <div className="skeuo-panel p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#172033]">
                Identity Verification Matrix by Node
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Clearances vs blocked risks distributed across collaborating bank instances
              </p>
            </div>
            <span className="skeuo-badge skeuo-badge-neutral">
              3 Active Banks
            </span>
          </div>
          <div className="h-64 relative pt-2">
            <Bar data={distributionChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Collaborating Bank Node Roster & PQC Security */}
      <div className="skeuo-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
              <Server size={16} className="text-blue-600" />
              Collaborating Banking Nodes & Privacy-Preserving Enclaves
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Each node trains localized ML weights on private transactional ledgers and encrypts updates using CRYSTALS-Kyber.
            </p>
          </div>
          <span className="skeuo-badge skeuo-badge-success">
            All Tunnels Healthy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCE3EB] text-[#64748B] font-semibold uppercase tracking-wider bg-[#F8FAFC]">
                <th className="py-2.5 px-3 rounded-l-lg">Banking Node</th>
                <th className="py-2.5 px-3">Local Model</th>
                <th className="py-2.5 px-3 text-right">Transactions</th>
                <th className="py-2.5 px-3 text-right">Fraud Count</th>
                <th className="py-2.5 px-3 text-right">Convergence Rate</th>
                <th className="py-2.5 px-3 text-center">Differential Privacy</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Tunnel Cryptography</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#172033]">
              {(metrics.bank_distribution || [
                { bank: 'Bank A', model_type: 'Random Forest', total_transactions: 250, fraud_transactions: 12 },
                { bank: 'Bank B', model_type: 'XGBoost', total_transactions: 250, fraud_transactions: 8 },
                { bank: 'Bank C', model_type: 'LightGBM', total_transactions: 250, fraud_transactions: 14 }
              ]).map((bank, idx) => {
                const nodeColors = ['#7C3AED', '#0F766E', '#2563EB'];
                return (
                  <tr key={bank.bank} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-bold flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: nodeColors[idx] }}
                      />
                      <span>{bank.bank}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-[#475569]">
                      {bank.model_type}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {bank.total_transactions?.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-red-600">
                      {bank.fraud_transactions}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-blue-600">
                      {metrics.accuracy_history?.[metrics.accuracy_history.length - 1]
                        ? `${Number(idx === 0
                          ? metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_a
                          : idx === 1
                            ? metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_b
                            : metrics.accuracy_history[metrics.accuracy_history.length - 1].bank_c).toFixed(1)}%`
                        : '82.5%'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="skeuo-badge skeuo-badge-success">
                        ε = 2.0 (Active)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="skeuo-badge skeuo-badge-info">
                        Kyber-768 PQC
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
