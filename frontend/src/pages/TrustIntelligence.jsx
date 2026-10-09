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
  Search,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TrustIntelligence = ({ fetchTrustScores, metrics }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles.filter(p => 
    p.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      try {
        const data = await fetchTrustScores();
        setProfiles(data);
        if (data.length > 0) {
          // Select Sanjay Dutt by default if available to show risk alerts in live demo
          const sanjay = data.find(p => p.customer_name?.includes("Sanjay"));
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
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Computing composite trust ratings and telemetry radar...</p>
      </div>
    );
  }

  const currentProfile = profiles.find(p => p.customer_id === selectedProfileId);

  // Configure Radar Chart with Light Theme Colors
  const radarChartData = currentProfile ? {
    labels: [
      'Device Reputation', 
      'Login Consistency', 
      'Biometric Score', 
      'Identity Match', 
      'Recovery Trust', 
      'Insider Clearance', 
      'Session Trust'
    ],
    datasets: [
      {
        label: `${currentProfile.customer_name} Telemetry`,
        data: [
          currentProfile.device_reputation || 0,
          currentProfile.login_consistency || 0,
          currentProfile.trust_score > 50 ? 92 : 20, 
          currentProfile.identity_confidence_score || 0,
          100.0 - (currentProfile.recovery_risk_score || 0),
          100.0 - (currentProfile.insider_risk_score || 0),
          currentProfile.trust_score > 50 ? 95 : 15
        ],
        backgroundColor: currentProfile.trust_score < 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
        borderColor: currentProfile.trust_score < 50 ? '#DC2626' : '#2563EB',
        borderWidth: 2,
        pointBackgroundColor: currentProfile.trust_score < 50 ? '#DC2626' : '#2563EB',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
      }
    ]
  } : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: '#E2E8F0' },
        grid: { color: '#EDF2F7' },
        pointLabels: { 
          color: '#475569', 
          font: { size: 10, family: 'Inter', weight: '600' } 
        },
        ticks: { display: false },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#172033',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 8,
        cornerRadius: 6,
      }
    }
  };

  // SVG Radial Trust Meter Gauge with Skeuomorphic Track
  const renderTrustGauge = (score) => {
    const radius = 75;
    const stroke = 11;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let strokeColor = "#16A34A"; // green
    if (score < 50) strokeColor = "#DC2626"; // red
    else if (score < 75) strokeColor = "#D97706"; // amber

    return (
      <div className="relative flex items-center justify-center h-40 w-40 select-none">
        <svg viewBox="0 0 150 150" className="h-full w-full transform -rotate-90">
          <circle
            stroke="#E9EDF2"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-3xl font-black font-mono text-[#172033]">{score.toFixed(0)}</span>
          <span className="text-[9px] text-[#64748B] uppercase tracking-wider block font-bold mt-0.5">Trust Score</span>
        </div>
      </div>
    );
  };

  // Evaluate authentication actions for RBA decision panel
  const getAuthVerdict = (score) => {
    if (score >= 90) {
      return { action: "Allow Access", color: "border-emerald-200 bg-emerald-50/70 text-emerald-900", icon: ShieldCheck, level: "Minimal Risk", badge: "skeuo-badge-success" };
    } else if (score >= 70) {
      return { action: "Allow Access (Passive Audit)", color: "border-emerald-200 bg-emerald-50/70 text-emerald-900", icon: ShieldCheck, level: "Low Risk", badge: "skeuo-badge-success" };
    } else if (score >= 50) {
      return { action: "Trigger Dynamic OTP Challenge", color: "border-amber-200 bg-amber-50/70 text-amber-900", icon: AlertTriangle, level: "Medium Risk", badge: "skeuo-badge-warning" };
    } else if (score >= 30) {
      return { action: "Trigger Step-Up Biometric Verification", color: "border-amber-200 bg-amber-50/70 text-amber-900", icon: Shield, level: "High Risk", badge: "skeuo-badge-warning" };
    } else {
      return { action: "Block Access & Alert SOC", color: "border-red-200 bg-red-50/70 text-red-900", icon: ShieldX, level: "Critical Threat", badge: "skeuo-badge-danger" };
    }
  };

  const verdict = currentProfile ? getAuthVerdict(currentProfile.trust_score) : null;
  const VerdictIcon = verdict?.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Information */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
          Identity Trust Intelligence & Adaptive Authentication
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Continuously synthesized identity trust scores derived from behavioral keystroke velocity, hardware posture, and cross-session integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Search & Profiles Directory */}
        <div className="skeuo-panel p-4 space-y-3 xl:col-span-1 flex flex-col max-h-[750px]">
          <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">Monitored Profiles</h3>
            <span className="skeuo-badge skeuo-badge-neutral">{profiles.length} Profiles</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skeuo-input w-full py-2 pl-9 pr-3 text-xs placeholder-[#94A3B8]"
            />
          </div>

          {/* Profiles list */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredProfiles.map(p => {
              const isHigh = p.trust_score < 50;
              const isWarning = p.trust_score >= 50 && p.trust_score < 80;
              const isSelected = selectedProfileId === p.customer_id;
              return (
                <button
                  key={p.customer_id}
                  onClick={() => setSelectedProfileId(p.customer_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-50/90 to-blue-100/60 border-blue-300 text-blue-900 shadow-[0_1px_3px_rgba(37,99,235,0.08)]'
                      : 'bg-white border-[#DCE3EB] hover:bg-[#F8FAFC] text-[#172033]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{p.customer_name}</span>
                    <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">ID: #{p.customer_id}</span>
                  </div>
                  <div className="text-right">
                    <span className={`skeuo-badge ${
                      isHigh ? 'skeuo-badge-danger' :
                      isWarning ? 'skeuo-badge-warning' :
                      'skeuo-badge-success'
                    }`}>
                      {p.risk_category}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-[#64748B] block mt-1">
                      {(p.trust_score || 0).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Detail Inspection */}
        {currentProfile ? (
          <div className="xl:col-span-3 space-y-6">
            {/* Top Stat Row: System-wide Identity Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Takeover Risks</span>
                <span className="text-base font-black text-amber-600 mt-1 block">{metrics?.account_takeovers || 0}</span>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Recovery Alerts</span>
                <span className="text-base font-black text-purple-600 mt-1 block">{metrics?.suspicious_recoveries || 0}</span>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Insider Flags</span>
                <span className="text-base font-black text-red-600 mt-1 block">{metrics?.insider_threats || 0}</span>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Rooted Devices</span>
                <span className="text-base font-black text-blue-600 mt-1 block">{metrics?.new_device_risks || 0}</span>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Biometric Flags</span>
                <span className="text-base font-black text-teal-600 mt-1 block">{metrics?.behavioral_anomalies || 0}</span>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Network Nodes</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">3 Active</span>
              </div>
            </div>

            {/* Middle Grid: Trust Meter & Adaptive Authentication Action Decision */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Trust Meter Gauge Card */}
              <div className="skeuo-panel p-6 flex flex-col items-center justify-center text-center relative">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider absolute top-4 left-4">
                  Trust Gauge
                </span>
                {renderTrustGauge(currentProfile.trust_score)}
                <div className="mt-2 text-center">
                  <span className={`skeuo-badge ${
                    currentProfile.trust_score < 50 ? 'skeuo-badge-danger' :
                    currentProfile.trust_score < 75 ? 'skeuo-badge-warning' :
                    'skeuo-badge-success'
                  }`}>
                    Category: {currentProfile.risk_category}
                  </span>
                </div>
              </div>

              {/* RBA Decision Panel */}
              {verdict && (
                <div className={`skeuo-panel p-6 col-span-2 flex flex-col justify-between border-2 ${verdict.color}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        Adaptive Authentication Decision Engine (RBA)
                      </span>
                      <span className={verdict.badge}>
                        {verdict.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-10 h-10 rounded-xl bg-white/80 border border-black/10 flex items-center justify-center shadow-sm">
                        <VerdictIcon size={22} className="stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black tracking-tight">{verdict.action}</h4>
                        <span className="text-xs opacity-75">Automated policy decision triggered by composite trust telemetry</span>
                      </div>
                    </div>

                    {/* Decision Rationale */}
                    <div className="mt-3 p-3.5 rounded-xl bg-white border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] text-xs">
                      <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-1">
                        Reason for Decision
                      </span>
                      <p className="leading-relaxed text-[#172033] font-medium">
                        {currentProfile.customer_id === 4 
                          ? "UNTRUSTED IDENTITY: Device fingerprint matches a known rooted emulator. Keystroke telemetry (typing dynamics at 350 keys/min) exhibits zero-entropy robotic input. SIM Swap recovery window is flagged, triggering an immediate authentication block." 
                          : currentProfile.customer_id === 2
                            ? "SUSPICIOUS IDENTITY: Synthetic registration alert. PAN credential index exhibits mismatch against primary account holder. Geolocation drift detected. Dynamic OTP challenge triggered to verify physical ownership."
                            : "TRUSTED IDENTITY: Behavioral keystroke dynamics, device reputation, and IP telemetry match historical customer baselines. Seamless zero-friction access cleared."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-black/5 text-xs">
                    <div>
                      <span className="opacity-60 block uppercase text-[9px] font-bold tracking-wider">Device Fingerprint</span>
                      <span className="font-mono font-bold text-[#172033]">
                        {currentProfile.customer_id === 4 ? 'dev_rooted_laptop (Blacklisted)' : 'dev_enclave_trusted (Hardware-backed)'}
                      </span>
                    </div>
                    <div>
                      <span className="opacity-60 block uppercase text-[9px] font-bold tracking-wider">Authentication Action</span>
                      <span className="font-bold text-[#172033]">
                        {currentProfile.trust_score < 50 ? "Adaptive Block Rules Applied" : "Frictionless Login Cleared"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Trust Factors (5 Columns) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="skeuo-panel p-3.5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">ID Verification</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold font-mono text-[#172033]">{(currentProfile.identity_confidence_score || 0).toFixed(0)}%</span>
                  <span className="skeuo-badge skeuo-badge-info text-[9px]">Match</span>
                </div>
              </div>

              <div className="skeuo-panel p-3.5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Device Reputation</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold font-mono text-[#172033]">{(currentProfile.device_reputation || 0).toFixed(0)}%</span>
                  <span className={`skeuo-badge text-[9px] ${currentProfile.device_reputation > 70 ? 'skeuo-badge-success' : 'skeuo-badge-danger'}`}>
                    {currentProfile.device_reputation > 70 ? 'Trusted' : 'Rooted'}
                  </span>
                </div>
              </div>

              <div className="skeuo-panel p-3.5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Biometric Score</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold font-mono text-[#172033]">
                    {currentProfile.trust_score > 50 ? '94%' : '20%'}
                  </span>
                  <span className={`skeuo-badge text-[9px] ${currentProfile.trust_score > 50 ? 'skeuo-badge-success' : 'skeuo-badge-danger'}`}>
                    {currentProfile.trust_score > 50 ? 'Human' : 'Bot'}
                  </span>
                </div>
              </div>

              <div className="skeuo-panel p-3.5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Recovery Risk</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold font-mono text-[#172033]">{(currentProfile.recovery_risk_score || 0).toFixed(0)}%</span>
                  <span className={`skeuo-badge text-[9px] ${currentProfile.recovery_risk_score > 50 ? 'skeuo-badge-danger' : 'skeuo-badge-success'}`}>
                    {currentProfile.recovery_risk_score > 50 ? 'SIM Swap' : 'Normal'}
                  </span>
                </div>
              </div>

              <div className="skeuo-panel p-3.5 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider block">Insider Threat</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold font-mono text-[#172033]">{(currentProfile.insider_risk_score || 0).toFixed(0)}%</span>
                  <span className={`skeuo-badge text-[9px] ${currentProfile.insider_risk_score > 30 ? 'skeuo-badge-warning' : 'skeuo-badge-success'}`}>
                    {currentProfile.insider_risk_score > 30 ? 'Warning' : 'Low'}
                  </span>
                </div>
              </div>
            </div>

            {/* Radar Telemetry & Authentication History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart Panel */}
              <div className="skeuo-panel p-5 space-y-3">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
                    Multi-Vector Identity Radar
                  </h3>
                  <p className="text-[11px] text-[#64748B]">Continuous telemetry profile across 7 verification vectors</p>
                </div>
                <div className="h-64 relative pt-2">
                  <Radar data={radarChartData} options={radarOptions} />
                </div>
              </div>

              {/* Authentication History & Session Log */}
              <div className="skeuo-panel p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                      <History size={14} className="text-blue-600" />
                      Recent Authentication Logs
                    </h3>
                    <span className="text-[10px] text-[#64748B]">{currentProfile.auth_history?.length || 0} Events</span>
                  </div>

                  <div className="space-y-2 mt-3 max-h-52 overflow-y-auto pr-1">
                    {(currentProfile.auth_history || []).map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-[#F8FAFC] border border-[#DCE3EB] rounded-lg">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-[#64748B] font-mono block">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[#172033] font-semibold">{log.reason}</span>
                        </div>
                        <span className={`skeuo-badge ${
                          log.action.includes('Allow') ? 'skeuo-badge-success' : 'skeuo-badge-danger'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentProfile.trust_score < 50.0 && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs">
                    <AlertTriangle className="shrink-0 text-red-600" size={18} />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold block text-red-900">Security Escalation Alert</span>
                      Device environment and typing entropy indicators failed clearance. Access recovery locked pending manual SOC authorization.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="xl:col-span-3 text-center py-24 text-[#64748B] text-xs">
            Select a customer profile to inspect trust intelligence metrics.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustIntelligence;
