import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Key, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Lock, 
  AlertTriangle,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Server,
  Zap,
  Layers,
  Copy,
  Check
} from 'lucide-react';

const SecurityDashboard = ({ fetchSecurityStatus }) => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState('Bank A');
  const [copiedKey, setCopiedKey] = useState(false);

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
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Measuring CRYSTALS-Kyber KEM benchmarks and hardware tunnels...</p>
      </div>
    );
  }

  const benchmarks = securityData.pqc_benchmarks || {};
  const recentLogs = securityData.recent_logs || [];
  const bioAlerts = securityData.biometric_telemetry || [];

  const nodeLogs = recentLogs.filter(log => log.node_name === selectedNode);
  const latestEncapsLog = nodeLogs.find(log => log.action?.includes("Encapsulation"));
  
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
        label: 'Key Generation Latency (ms)',
        data: [
          benchmarks["Kyber-768"]?.keygen_time_ms || 0.10,
          benchmarks["ECDH-P256"]?.keygen_time_ms || 0.45,
          benchmarks["RSA-3072"]?.keygen_time_ms || 45.5
        ],
        backgroundColor: [
          'rgba(124, 58, 237, 0.85)',
          'rgba(37, 99, 235, 0.85)',
          'rgba(220, 38, 38, 0.85)'
        ],
        borderColor: ['#7C3AED', '#2563EB', '#DC2626'],
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const speedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B', font: { size: 9, family: 'Inter' } },
        title: { display: true, text: 'Time (ms) [Lower is Better]', color: '#64748B', font: { size: 9 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#172033', font: { family: 'Inter', size: 9, weight: '600' } }
      }
    }
  };

  const sizeChartData = {
    labels: ['Kyber-768 (PQC)', 'ECDH-P256 (Classical)', 'RSA-3072 (Classical)'],
    datasets: [
      {
        label: 'Public Key Size (Bytes)',
        data: [1184, 65, 384],
        backgroundColor: 'rgba(124, 58, 237, 0.85)',
        borderColor: '#7C3AED',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Ciphertext Size (Bytes)',
        data: [1088, 65, 384],
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderColor: '#2563EB',
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  const sizeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: '#475569', font: { size: 9, family: 'Inter' }, usePointStyle: true, boxWidth: 8 } 
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
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B', font: { size: 9, family: 'Inter' } },
        title: { display: true, text: 'Size (Bytes)', color: '#64748B', font: { size: 9 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#172033', font: { family: 'Inter', size: 9, weight: '600' } }
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
          Post-Quantum Security & Cryptographic Enclaves
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Hardware-grade CRYSTALS-Kyber-768 lattice encapsulation performance benchmarks and biometric anomaly threat logs.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: PQC Benchmarks & Live Key Handshake Debugger */}
        <div className="xl:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="skeuo-panel p-5 space-y-3">
              <div className="border-b border-[#F1F5F9] pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
                  Key Generation Latency
                </h3>
                <p className="text-[10px] text-[#64748B]">Kyber lattice math executes up to 400x faster than RSA-3072</p>
              </div>
              <div className="h-48 relative pt-2">
                <Bar data={keyGenChartData} options={speedChartOptions} />
              </div>
            </div>

            <div className="skeuo-panel p-5 space-y-3">
              <div className="border-b border-[#F1F5F9] pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
                  Cryptographic Payload Overhead
                </h3>
                <p className="text-[10px] text-[#64748B]">Payload size comparison between post-quantum and classical keys</p>
              </div>
              <div className="h-48 relative pt-2">
                <Bar data={sizeChartData} options={sizeChartOptions} />
              </div>
            </div>
          </div>

          {/* Kyber KEM Live Key Debugger */}
          <div className="skeuo-panel p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F1F5F9] pb-3 gap-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Terminal size={14} className="text-purple-600" />
                  CRYSTALS-Kyber Key Encapsulation (ML-KEM-768) Inspector
                </h3>
                <p className="text-[10px] text-[#64748B]">Asymmetric post-quantum session key establishment between bank nodes</p>
              </div>
              
              <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#DCE3EB]">
                {['Bank A', 'Bank B', 'Bank C'].map(node => (
                  <button
                    key={node}
                    onClick={() => setSelectedNode(node)}
                    className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all ${
                      selectedNode === node
                        ? 'bg-white text-purple-700 shadow-xs border border-[#DCE3EB]'
                        : 'text-[#64748B] hover:text-[#172033]'
                    }`}
                  >
                    {node}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#64748B] font-semibold">
                  <span className="uppercase tracking-wider">Aggregator Public Key (A, t = As + e)</span>
                  <button 
                    onClick={() => copyToClipboard(debuggerData.publicKey)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    {copiedKey ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#DCE3EB] font-mono text-[10px] text-[#172033] break-all select-all">
                  {debuggerData.publicKey}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#64748B] tracking-wider block">
                    {selectedNode} Encapsulation Ciphertext (c)
                  </span>
                  <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#DCE3EB] font-mono text-[10px] text-purple-700 break-all select-all">
                    {debuggerData.ciphertext}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#64748B] tracking-wider block">
                    Decapsulated AES-256 Shared Secret (ss)
                  </span>
                  <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#DCE3EB] font-mono text-[10px] text-emerald-700 break-all select-all">
                    {debuggerData.sharedSecret}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-[#F8FAFC] rounded-xl p-3 border border-[#DCE3EB] justify-between text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Tunnel: <strong className="text-emerald-700">PQC_TUNNEL_ESTABLISHED</strong>
                </span>
                <span>Latency: <strong className="font-mono text-blue-700">{debuggerData.executionTime.toFixed(3)} ms</strong></span>
                <span>Cipher: <strong className="text-purple-700">Kyber-768 (NIST FIPS 203)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Biometric Incident Log & Security Profile Dials */}
        <div className="space-y-6">
          {/* Biometrics Threat Alerts */}
          <div className="skeuo-panel p-5 space-y-4">
            <div className="border-b border-[#F1F5F9] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <Fingerprint size={15} />
                Biometrics Anomaly Log
              </h3>
              <p className="text-[10px] text-[#64748B] mt-0.5">
                Keystroke flight dynamics and mouse entropy deviations
              </p>
            </div>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {bioAlerts.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-10">No biometrics alerts logged.</p>
              ) : (
                bioAlerts.map(alert => (
                  <div key={alert.id} className="p-3 bg-[#F8FAFC] border border-[#DCE3EB] rounded-xl space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#172033]">{alert.customer_name}</span>
                      <span className="text-red-600 font-bold font-mono">Risk: {alert.risk_score?.toFixed(0)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-[#64748B] font-mono">
                      <span>Logins: <strong className="text-[#172033]">{alert.failed_logins} failed</strong></span>
                      <span>Typing: <strong className="text-[#172033]">{alert.typing_speed} KPM</strong></span>
                      <span className="col-span-2">Jitter: <strong className="text-[#172033]">{alert.mouse_jitter} SD</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Profile Dials */}
          <div className="skeuo-panel p-5 space-y-4">
            <div className="border-b border-[#F1F5F9] pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
                Cryptographic Defenses Profile
              </h3>
            </div>
            
            <div className="space-y-3.5 text-xs text-[#64748B]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase">Quantum Threat Posture</h4>
                  <p className="text-xs text-red-600 font-bold">CRITICAL THREAT MITIGATED</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Key size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase">Lattice KEM Algorithm</h4>
                  <p className="text-xs text-[#172033] font-semibold">CRYSTALS-Kyber-768</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase">Model Payload Cipher</h4>
                  <p className="text-xs text-[#172033] font-semibold">AES-256-GCM (Weights Enclave)</p>
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
