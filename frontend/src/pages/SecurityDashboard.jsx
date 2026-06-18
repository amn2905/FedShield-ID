import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Key, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Lock, 
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

const SecurityDashboard = ({ fetchSecurityStatus }) => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState('Bank A');

  useEffect(() => {
    const loadSecurityData = async () => {
      setLoading(true);
      try {
        const data = await fetchSecurityStatus();
        setSecurityData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSecurityData();
  }, []);

  if (loading || !securityData) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const benchmarks = securityData.pqc_benchmarks;
  const recentLogs = securityData.recent_logs || [];
  const bioAlerts = securityData.biometric_telemetry || [];

  const nodeLogs = recentLogs.filter(log => log.node_name === selectedNode);
  const latestEncapsLog = nodeLogs.find(log => log.action.includes("Encapsulation"));
  
  const debuggerData = {
    publicKey: debuggerVal(latestEncapsLog?.details?.public_key_preview, "kyber768_pub_a_6d78709e80ba6ea7f..."),
    ciphertext: debuggerVal(latestEncapsLog?.details?.ciphertext_preview, "kyber768_ctx_3f4c6e9a0d8b5c4a7e8..."),
    sharedSecret: "aes256_shared_secret_c3f4e8b91a7c502b4d9a60e87bcf...",
    executionTime: latestEncapsLog?.execution_time_ms || 0.15
  };

  const keyGenChartData = {
    labels: ['Kyber-768 (PQC)', 'ECDH-P256 (Classical)', 'RSA-3072 (Classical)'],
    datasets: [
      {
        label: 'Key Generation Speed (ms)',
        data: [
          benchmarks["Kyber-768"]?.keygen_time_ms || 0.10,
          benchmarks["ECDH-P256"]?.keygen_time_ms || 0.45,
          benchmarks["RSA-3072"]?.keygen_time_ms || 45.5
        ],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 211, 238, 0.6)',
          'rgba(244, 63, 94, 0.6)'
        ],
        borderColor: ['#8b5cf6', '#22d3ee', '#f43f5e'],
        borderWidth: 1.5,
        borderRadius: 8,
      }
    ]
  };

  const speedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Time (ms) [Lower is Better]', color: '#64748b', font: { size: 9 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#e2e8f0', font: { family: 'Inter', size: 9 } }
      }
    }
  };

  const sizeChartData = {
    labels: ['Kyber-768 (PQC)', 'ECDH-P256 (Classical)', 'RSA-3072 (Classical)'],
    datasets: [
      {
        label: 'Public Key Size (Bytes)',
        data: [1184, 65, 384],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8b5cf6',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Ciphertext Size (Bytes)',
        data: [1088, 65, 384],
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderColor: '#22d3ee',
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const sizeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 9 } } }
    },
    scales: {
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.1)' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: 'Size (Bytes)', color: '#64748b', font: { size: 9 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#e2e8f0', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Post-Quantum Security & Threat Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluate CRYSTALS-Kyber encapsulation keys and audit recent behavioral biometrics session threats.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Cryptographic Benchmarks & Logs */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-5 space-y-3">
              <h3 className="font-semibold text-xs font-sans text-slate-200 uppercase tracking-wider">
                Keypair Generation Latency
              </h3>
              <div className="h-48 relative">
                <Bar data={keyGenChartData} options={speedChartOptions} />
              </div>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <h3 className="font-semibold text-xs font-sans text-slate-200 uppercase tracking-wider">
                Payload Overhead (Sizes)
              </h3>
              <div className="h-48 relative">
                <Bar data={sizeChartData} options={sizeChartOptions} />
              </div>
            </div>
          </div>

          {/* Kyber KEM debugger */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-4">
              <div>
                <h3 className="font-semibold text-xs font-sans text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal size={14} />
                  Kyber KEM Tunnel Key Inspector
                </h3>
              </div>
              
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900 self-start sm:self-auto">
                {['Bank A', 'Bank B', 'Bank C'].map(node => (
                  <button
                    key={node}
                    onClick={() => setSelectedNode(node)}
                    className={`py-1 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedNode === node
                        ? 'bg-purple-900/40 text-purple-300 border border-purple-800/60'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {node}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Aggregator Public Key (pk)</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/80 font-mono text-[10px] text-purple-300 break-all select-all">
                  {debuggerData.publicKey}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">{selectedNode} Encapsulation Ciphertext (c)</span>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/80 font-mono text-[10px] text-cyan-400 break-all select-all">
                    {debuggerData.ciphertext}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Decapsulated AES-256 Shared Secret (ss)</span>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/80 font-mono text-[10px] text-emerald-400 break-all select-all">
                    {debuggerData.sharedSecret}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-slate-900/30 rounded-xl p-3 border border-slate-800/50 justify-between text-[11px] text-slate-400">
                <span>Tunnel status: <span className="font-semibold text-emerald-400">PQC_TUNNEL_ESTABLISHED</span></span>
                <span>Latency: <span className="font-mono text-cyan-300 font-bold">{debuggerData.executionTime.toFixed(3)} ms</span></span>
                <span>Crypt: <span className="font-semibold text-purple-300">Kyber-768 (ML-KEM)</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Biometric Alerts and Profile Summary */}
        <div className="space-y-6">
          
          {/* Biometrics threat alerts */}
          <div className="glass-panel p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm font-sans text-red-400 flex items-center gap-1.5">
                <Fingerprint size={16} />
                Biometrics Incident Alert Log
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Outliers flagged by behavioral click-speed and straight mouse jitter audits.
              </p>
            </div>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {bioAlerts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No biometrics alerts logged.</p>
              ) : (
                bioAlerts.map(alert => (
                  <div key={alert.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-bold text-slate-200">{alert.customer_name}</span>
                      <span className="text-red-400 font-bold font-mono">Risk: {alert.risk_score.toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-500 font-mono">
                      <span>Logins: <strong className="text-slate-300">{alert.failed_logins} failed</strong></span>
                      <span>Typing: <strong className="text-slate-300">{alert.typing_speed} KPM</strong></span>
                      <span className="col-span-2">Jitter: <strong className="text-slate-300">{alert.mouse_jitter} SD</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Crypto status */}
          <div className="glass-panel p-5 space-y-5">
            <div>
              <h3 className="font-semibold text-sm font-sans text-slate-200">
                Security Profile Dials
              </h3>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase">Quantum Risk Level</h4>
                  <p className="text-[11px] text-red-400 font-bold">CRITICAL THREAT</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-purple-400">
                  <Key size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase">Asymmetric Cipher</h4>
                  <p className="text-[11px] text-slate-400">CRYSTALS-Kyber-768</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-900/40 text-cyan-400">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase">Symmetric Cipher</h4>
                  <p className="text-[11px] text-slate-400">AES-256-GCM (Weights)</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const debuggerVal = (val, fallback) => {
  if (!val || val === "") return fallback;
  return val;
};

export default SecurityDashboard;
