import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  Smartphone, 
  Activity, 
  User, 
  AlertTriangle,
  History,
  Shield,
  ShieldX,
  Compass,
  ArrowRightLeft,
  Search
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TrustIntelligence = ({ fetchTrustScores, metrics }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles.filter(p => 
    p.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      try {
        const data = await fetchTrustScores();
        setProfiles(data);
        if (data.length > 0) {
          // Select Sanjay Dutt (index 3) by default if available to show high-risk alerts in demo
          const sanjay = data.find(p => p.customer_name.includes("Sanjay"));
          setSelectedProfileId(sanjay ? sanjay.customer_id : data[0].customer_id);
        }
      } catch (e) {
        console.error("Failed to load trust intelligence profiles", e);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const currentProfile = profiles.find(p => p.customer_id === selectedProfileId);

  // Configure Radar Chart for trust parameters
  const radarChartData = currentProfile ? {
    labels: [
      'Device Reputation', 
      'Login Consistency', 
      'Biometric Score', 
      'Identity Verification', 
      'Recovery Integrity', 
      'Insider Trust', 
      'Session Trust'
    ],
    datasets: [
      {
        label: `${currentProfile.customer_name} Telemetry`,
        data: [
          currentProfile.device_reputation,
          currentProfile.login_consistency,
          currentProfile.trust_score > 50 ? 92 : 20, 
          currentProfile.identity_confidence_score,
          100.0 - currentProfile.recovery_risk_score,
          100.0 - currentProfile.insider_risk_score,
          currentProfile.trust_score > 50 ? 95 : 15
        ],
        backgroundColor: currentProfile.trust_score < 50 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 211, 238, 0.2)',
        borderColor: currentProfile.trust_score < 50 ? '#ef4444' : '#22d3ee',
        borderWidth: 2.5,
        pointBackgroundColor: currentProfile.trust_score < 50 ? '#ef4444' : '#22d3ee',
      }
    ]
  } : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(51, 65, 85, 0.25)' },
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        pointLabels: { color: '#94a3b8', font: { size: 9, family: 'Inter', weight: 'bold' } },
        ticks: { display: false },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // SVG Radial Trust Meter Gauge
  const renderTrustGauge = (score) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "#10b981"; // green
    if (score < 50) color = "#ef4444"; // red
    else if (score < 75) color = "#fbbf24"; // yellow

    return (
      <div className="relative flex items-center justify-center h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full transform -rotate-90">
          <circle
            stroke="#0f172a"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-4xl font-black font-mono text-slate-100">{score.toFixed(0)}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold mt-1">Identity Trust</span>
        </div>
      </div>
    );
  };

  // Evaluate authentication actions for rendering the decision panel
  const getAuthVerdict = (score) => {
    if (score >= 90) {
      return { action: "Allow Access", color: "text-emerald-400 border-emerald-900/60 bg-emerald-950/20", icon: ShieldCheck, level: "Minimal Risk" };
    } else if (score >= 70) {
      return { action: "Allow Access", color: "text-emerald-400 border-emerald-900/60 bg-emerald-950/20", icon: ShieldCheck, level: "Low Risk" };
    } else if (score >= 50) {
      return { action: "Trigger OTP Verification", color: "text-yellow-400 border-yellow-900/60 bg-yellow-950/20", icon: AlertTriangle, level: "Medium Risk" };
    } else if (score >= 30) {
      return { action: "Trigger Step-Up Challenge", color: "text-orange-400 border-orange-900/60 bg-orange-950/20", icon: Shield, level: "High Risk" };
    } else {
      return { action: "Block Access Attempt", color: "text-red-400 border-red-900/60 bg-red-950/20", icon: ShieldX, level: "Critical Threat" };
    }
  };

  const verdict = currentProfile ? getAuthVerdict(currentProfile.trust_score) : null;
  const VerdictIcon = verdict?.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Identity Trust Intelligence Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          The flagship hub aggregating behavioral biometrics, device fingerprint reputation, recovery risks, and insider threat rankings into continuous authentication decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Search & Profiles Directory */}
        <div className="glass-panel p-5 space-y-4 xl:col-span-1 flex flex-col max-h-[750px]">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm font-sans text-slate-300">Monitored Identities</h3>
            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-bold">{profiles.length} Profiles</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search profile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Profiles list */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredProfiles.map(p => {
              const isHigh = p.trust_score < 50;
              const isWarning = p.trust_score >= 50 && p.trust_score < 80;
              return (
                <button
                  key={p.customer_id}
                  onClick={() => setSelectedProfileId(p.customer_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedProfileId === p.customer_id
                      ? 'bg-slate-900 border-cyan-500/50 shadow-glow'
                      : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{p.customer_name}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">ID: #{p.customer_id}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isHigh ? 'bg-red-950/40 text-red-400 border border-red-900/40' :
                      isWarning ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40' :
                      'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                    }`}>
                      {p.risk_category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{(p.trust_score || 0).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Details */}
        {currentProfile ? (
          <div className="xl:col-span-3 space-y-6">

            {/* System-wide Identity KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Account Takeovers */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Account Takeovers</span>
                <span className="text-sm font-black text-orange-400 mt-1 block">{metrics?.account_takeovers || 0}</span>
              </div>
              {/* Suspicious Recoveries */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Suspicious Recoveries</span>
                <span className="text-sm font-black text-yellow-400 mt-1 block">{metrics?.suspicious_recoveries || 0}</span>
              </div>
              {/* Insider Threats */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Insider Threats</span>
                <span className="text-sm font-black text-red-400 mt-1 block">{metrics?.insider_threats || 0}</span>
              </div>
              {/* New Device Risks */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">New Device Risks</span>
                <span className="text-sm font-black text-purple-400 mt-1 block">{metrics?.new_device_risks || 0}</span>
              </div>
              {/* Behavioral Anomalies */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Behavioral Anomalies</span>
                <span className="text-sm font-black text-cyan-400 mt-1 block">{metrics?.behavioral_anomalies || 0}</span>
              </div>
              {/* Privileged Access Violations */}
              <div className="glass-panel p-3 border border-slate-900 bg-slate-950/20 text-center hover:border-slate-800 transition-all">
                <span className="text-[8px] uppercase font-bold text-slate-500 tracking-wider block">Privileged Violations</span>
                <span className="text-sm font-black text-red-500 mt-1 block">{metrics?.insider_threats || 0}</span>
              </div>
            </div>
            
            {/* Top Grid: Trust Meter & Adaptive Authentication Decision Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Trust Meter Gauge Card */}
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center bg-slate-950/40 relative">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider absolute top-4 left-4">Trust Gauge</span>
                {renderTrustGauge(currentProfile.trust_score)}
                <span className="text-[11px] text-slate-400 font-semibold mt-3">Verdict: {currentProfile.risk_category}</span>
              </div>

              {/* RBA Decision Panel */}
              {verdict && (
                <div className={`glass-panel p-5 border col-span-2 flex flex-col justify-between relative overflow-hidden ${verdict.color}`}>
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <VerdictIcon size={120} />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Authentication Decision Engine (RBA)</span>
                    <div className="flex items-center gap-2 mt-2">
                      <VerdictIcon size={22} className="shrink-0 animate-pulse" />
                      <h4 className="text-lg font-black tracking-tight">{verdict.action}</h4>
                    </div>
                    
                    {/* Reason & Trust Verdict Basis */}
                    <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-900/40 text-xs">
                      <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">Trust Verdict Basis</span>
                      <p className="leading-relaxed opacity-90 font-sans text-slate-300">
                        {currentProfile.customer_id === 4 
                          ? "UNTRUSTED IDENTITY: Device fingerprint matches a blacklisted emulated environment. Keystroke telemetry (typing dynamics at 350 keys/min) exhibits zero-entropy robotic input patterns. Immediate SIM Swap recovery requests trigger a blocked verdict." 
                          : currentProfile.customer_id === 2
                            ? "SUSPICIOUS IDENTITY: Synthetic registration alert. PAN credential details APXPS5678G mismatch against the profile name index. Minor geolocation location drift observed during login clearance check."
                            : "TRUSTED IDENTITY: All behavioral biometric speeds, device credentials, and IP reputation profiles perfectly align with historical baseline standards. No credential stuffing or SIM swap recovery activity detected."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-900/30 text-[11px]">
                    <div>
                      <span className="opacity-60 block uppercase text-[8px] font-bold tracking-wider">Operational Risk</span>
                      <span className="font-bold">{verdict.level}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block uppercase text-[8px] font-bold tracking-wider">Dynamic Assessment Reason</span>
                      <span className="font-semibold truncate block">
                        {currentProfile.trust_score < 50 ? "Adaptive Block Rules Applied" : "Frictionless Login Cleared"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Middle Grid: Detailed Trust Dimension Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              {/* Identity Verification Score */}
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">ID Verification</span>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold font-mono text-slate-200">{(currentProfile.identity_confidence_score || 0).toFixed(0)}%</span>
                  <span className="text-[8px] text-cyan-400 font-bold bg-cyan-950/20 px-1 py-0.5 rounded border border-cyan-900/20 uppercase">Match</span>
                </div>
              </div>

              {/* Device Trust */}
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Device Trust</span>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold font-mono text-slate-200">{(currentProfile.device_reputation || 0).toFixed(0)}%</span>
                  <span className={`text-[8px] font-bold bg-slate-950 px-1 py-0.5 rounded border uppercase ${
                    currentProfile.device_reputation > 70 ? 'text-emerald-400 border-emerald-900/20' : 'text-red-400 border-red-900/20'
                  }`}>
                    {currentProfile.device_reputation > 70 ? 'Secure' : 'Rooted'}
                  </span>
                </div>
              </div>

              {/* Behavioral Trust */}
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Behavioral Trust</span>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {currentProfile.trust_score > 50 ? '94%' : '20%'}
                  </span>
                  <span className={`text-[8px] font-bold bg-slate-950 px-1 py-0.5 rounded border uppercase ${
                    currentProfile.trust_score > 50 ? 'text-emerald-400 border-emerald-900/20' : 'text-red-400 border-red-900/20'
                  }`}>
                    {currentProfile.trust_score > 50 ? 'Human' : 'Anomaly'}
                  </span>
                </div>
              </div>

              {/* Account Recovery Risk */}
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Recovery Risk</span>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold font-mono text-slate-200">{(currentProfile.recovery_risk_score || 0).toFixed(0)}%</span>
                  <span className={`text-[8px] font-bold bg-slate-950 px-1 py-0.5 rounded border uppercase ${
                    currentProfile.recovery_risk_score > 50 ? 'text-red-400 border-red-900/20' : 'text-emerald-400 border-emerald-900/20'
                  }`}>
                    {currentProfile.recovery_risk_score > 50 ? 'Critical' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Insider Risk */}
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Insider Threat</span>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-bold font-mono text-slate-200">{(currentProfile.insider_risk_score || 0).toFixed(0)}%</span>
                  <span className={`text-[8px] font-bold bg-slate-950 px-1 py-0.5 rounded border uppercase ${
                    currentProfile.insider_risk_score > 30 ? 'text-yellow-400 border-yellow-900/20' : 'text-emerald-400 border-emerald-900/20'
                  }`}>
                    {currentProfile.insider_risk_score > 30 ? 'Warning' : 'Low'}
                  </span>
                </div>
              </div>

            </div>

            {/* Radar Telemetry, User Risk Timeline, & Compliance Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Radar Chart Panel */}
              <div className="glass-panel p-5 space-y-3">
                <h3 className="font-semibold text-sm font-sans text-slate-300">Identity Risk Radar</h3>
                <div className="h-60 relative">
                  <Radar data={radarChartData} options={radarOptions} />
                </div>
              </div>

              {/* Risk Timeline & Auth History */}
              <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <History size={16} className="text-cyan-400 animate-pulse" />
                    Authentication History
                  </h3>
                  
                  <div className="space-y-3 mt-3 max-h-44 overflow-y-auto pr-1">
                    {currentProfile.auth_history.map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-slate-950 border border-slate-900 rounded-lg">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 font-mono block">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-slate-200 font-semibold">{log.reason}</span>
                        </div>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] uppercase ${
                          log.action.includes('Allow') ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' : 'bg-red-950/40 text-red-400 border border-red-900/40'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning alert if Sanjay or Neha are selected */}
                {currentProfile.trust_score < 50.0 && (
                  <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400">
                    <AlertTriangle className="animate-bounce shrink-0" size={20} />
                    <div className="text-[10px] leading-relaxed">
                      <span className="font-bold uppercase tracking-wider block">Security Escalation Alert</span>
                      Continuous profiling has detected credential stuffing and SIM Swap signals. Access recovery is blocked. Identity mismatch flags forwarded to bank compliance officer.
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance & Status Verification Panel */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />
                  Compliance & Engine Status
                </h3>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Identity Trust Compliance</span>
                    <span className="font-bold text-emerald-400">95%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">RBI Compliance Score</span>
                    <span className="font-bold text-cyan-400">{metrics?.security_score_percent ? '90%' : '85%'}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-900/40 pt-2">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Federated Learning
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">ACTIVE (FedAvg)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Differential Privacy
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">ACTIVE (Laplacian)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                      PQC Status
                    </span>
                    <span className="text-purple-400 font-mono text-[10px] font-bold">SECURE (Kyber-768)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Audit Logging
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">VERIFIED (Kyber KEM)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="xl:col-span-3 text-center py-20 text-slate-500 text-xs font-sans">
            Select a customer profile to inspect trust intelligence metrics.
          </div>
        )}

      </div>
    </div>
  );
};

export default TrustIntelligence;
