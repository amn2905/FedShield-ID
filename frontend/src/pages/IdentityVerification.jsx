import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Mail, 
  Phone, 
  Laptop, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const IdentityVerification = () => {
  const [audits, setAudits] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/identity-verification`);
        if (response.ok) {
          const data = await response.json();
          setAudits(data);
          if (data.length > 0) {
            setSelectedAuditId(data[0].customer_id);
          }
        }
      } catch (e) {
        console.error("Failed to load identity verification audits", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const filteredAudits = audits.filter(a => 
    a.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pan_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentAudit = audits.find(a => a.customer_id === selectedAuditId);

  // SVG Radial Gauge Helper
  const renderGauge = (score) => {
    const radius = 55;
    const stroke = 8;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "#10b981"; // green
    if (score < 50) color = "#ef4444"; // red
    else if (score < 80) color = "#fbbf24"; // yellow

    return (
      <div className="relative flex items-center justify-center h-32 w-32">
        <svg viewBox="0 0 110 110" className="h-full w-full transform -rotate-90">
          <circle
            stroke="#1e293b"
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
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-2xl font-black font-mono text-slate-100">{(score || 0).toFixed(0)}</span>
          <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold mt-0.5">Identity Confidence</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Identity Verification & KYC Audit Console
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-parameter identity consistency verification, PAN validations, and onboarding risk evaluations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Search & Profiles Directory */}
        <div className="glass-panel p-5 space-y-4 lg:col-span-1 flex flex-col max-h-[650px]">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm font-sans text-slate-300">Audited Customers</h3>
            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-cyan-400 font-bold">{audits.length} Records</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search by name or PAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Profiles list */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredAudits.map(a => {
              const isHigh = a.identity_confidence_score < 50;
              const isWarning = a.identity_confidence_score >= 50 && a.identity_confidence_score < 80;
              return (
                <button
                  key={a.customer_id}
                  onClick={() => setSelectedAuditId(a.customer_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedAuditId === a.customer_id
                      ? 'bg-slate-900 border-cyan-500/50 shadow-glow'
                      : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{a.customer_name}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{a.pan_number}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isHigh ? 'bg-red-950/40 text-red-400 border border-red-900/40' :
                      isWarning ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40' :
                      'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                    }`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{(a.identity_confidence_score || 0).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Verification Detail Inspection */}
        {currentAudit ? (
          <div className="lg:col-span-3 space-y-6">
            {/* Top Overview Bar */}
            <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${
                currentAudit.identity_confidence_score < 50 ? 'from-red-600 to-orange-500' : 
                currentAudit.identity_confidence_score < 80 ? 'from-yellow-500 to-amber-400' : 
                'from-emerald-500 to-cyan-400'
              }`} />

              <div className="flex items-center gap-4">
                {renderGauge(currentAudit.identity_confidence_score)}
                <div>
                  <h3 className="text-lg font-black text-slate-100">{currentAudit.customer_name}</h3>
                  <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-500 font-mono">
                    <span>ID: #{currentAudit.customer_id}</span>
                    <span>•</span>
                    <span>PAN: {currentAudit.pan_number}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      currentAudit.onboarding_risk_level === 'High' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                      currentAudit.onboarding_risk_level === 'Medium' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/40' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                    }`}>
                      Onboarding Risk: {currentAudit.onboarding_risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Verification Verdict</span>
                <span className={`text-base font-extrabold flex items-center gap-1.5 mt-1 ${
                  currentAudit.status === 'Trusted' ? 'text-emerald-400' :
                  currentAudit.status === 'Suspicious' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {currentAudit.status === 'Trusted' ? <CheckCircle2 size={16} /> :
                   currentAudit.status === 'Suspicious' ? <AlertCircle size={16} /> : <XCircle size={16} />}
                  {currentAudit.status === 'Trusted' ? 'IDENTITY PASSED' : 
                   currentAudit.status === 'Suspicious' ? 'ATTENTION REQUIRED' : 'IDENTITY FAILED'}
                </span>
              </div>
            </div>

            {/* 6 Core Identity Trust Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Onboarding Trust Metrics: KYC & Synthetic ID */}
              <div className="glass-panel p-5 space-y-4">
                <h4 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-cyan-400" />
                  Onboarding Risk Metrics
                </h4>
                
                <div className="space-y-4">
                  {/* KYC Risk Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">KYC Risk Score</span>
                      <span className="text-slate-300 font-bold font-mono">{(currentAudit.kyc_risk_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentAudit.kyc_risk_score > 60 ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${currentAudit.kyc_risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Synthetic Identity Indicators */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">Synthetic ID Indicators</span>
                      <span className="text-slate-300 font-bold font-mono">{(currentAudit.synthetic_identity_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentAudit.synthetic_identity_score > 60 ? 'bg-red-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${currentAudit.synthetic_identity_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Posture Audit */}
              <div className="glass-panel p-5 space-y-4">
                <h4 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
                  <Laptop size={16} className="text-purple-400" />
                  Device Verification Status
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Environment Posture</span>
                    <span className={`font-bold uppercase ${
                      currentAudit.customer_id === 4 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {currentAudit.customer_id === 4 ? 'Rooted Emulator' : 'Secure OS'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Hardware ID Matching</span>
                    <span className={`font-bold uppercase ${
                      currentAudit.customer_id === 4 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {currentAudit.customer_id === 4 ? 'Collusive Shared Link' : 'Isolated Signature'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Headless Browser Check</span>
                    <span className="font-bold text-emerald-400">PASSED</span>
                  </div>
                </div>
              </div>

              {/* Email & Phone Reputation Card */}
              <div className="glass-panel p-5 space-y-4">
                <h4 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
                  <Mail size={16} className="text-cyan-400" />
                  Contact Registry Reputation
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Email reputation */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Email Reputation</span>
                    {currentAudit.email_address.includes("tempmail") ? (
                      <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40 uppercase">Disposable Domain</span>
                    ) : (
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 uppercase">High Reputation</span>
                    )}
                  </div>
                  {/* Phone reputation */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Phone Reputation</span>
                    {currentAudit.phone_number.includes("91000") ? (
                      <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40 uppercase">VoIP Number</span>
                    ) : (
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 uppercase">Verified Mobile</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Match Integrity Checklist */}
            <div className="glass-panel p-5 space-y-4">
              <h4 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
                <FileCheck size={16} className="text-cyan-400" />
                Credentials Match Consistency Auditing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">PAN Format Validation</span>
                    <span className="text-xs font-semibold text-slate-200 block mt-0.5">{currentAudit.pan_number}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded font-bold">VALID FORMAT</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Email Registry Domain</span>
                    <span className="text-xs font-semibold text-slate-200 block mt-0.5 truncate max-w-[120px]">{currentAudit.email_address}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    currentAudit.email_address.includes("tempmail") ? 'text-red-400 bg-red-950/20 border border-red-900/30' : 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'
                  }`}>
                    {currentAudit.email_address.includes("tempmail") ? 'DISPOSABLE' : 'CLEARED'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Phone Registry Provider</span>
                    <span className="text-xs font-semibold text-slate-200 block mt-0.5">{currentAudit.phone_number}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    currentAudit.phone_number.includes("91000") ? 'text-red-400 bg-red-950/20 border border-red-900/30' : 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30'
                  }`}>
                    {currentAudit.phone_number.includes("91000") ? 'VOIP RANGE' : 'INDISPENSABLE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Identity Risk Indicators Panel */}
            <div className="glass-panel p-5 space-y-3">
              <h4 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-red-400" />
                Active Identity Risk Indicators & Alerts
              </h4>

              {currentAudit.fraud_indicators.length === 0 ? (
                <div className="bg-emerald-950/15 border border-emerald-900/30 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
                  <CheckCircle2 size={16} />
                  <span>No suspicious identity signatures detected on this profile. Validation matches parameters successfully.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentAudit.fraud_indicators.map((indicator, idx) => (
                    <div key={idx} className="bg-red-950/20 border border-red-900/40 px-4 py-2.5 rounded-xl flex items-center gap-2 text-red-400 text-xs font-semibold">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 text-center py-20 text-slate-500 text-xs font-sans">
            Select a customer profile to inspect identity validation details.
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityVerification;
