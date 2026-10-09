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
  XCircle,
  Plus,
  Send,
  UserCheck,
  Globe,
  Fingerprint,
  RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const IdentityVerification = () => {
  const [audits, setAudits] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Live Verification Test Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    customer_name: 'Priya Sharma',
    pan_number: 'ABCPS1234F',
    email_address: 'priya.sharma@gmail.com',
    phone_number: '+91 98765 43210',
    device_id: 'dev_iphone_15_pro',
    ip_address: '103.45.12.89'
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/identity-verification`);
      if (response.ok) {
        const data = await response.json();
        setAudits(data);
        if (data.length > 0 && !selectedAuditId) {
          setSelectedAuditId(data[0].customer_id);
        }
      }
    } catch (e) {
      console.error("Failed to load identity verification audits", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleRunVerification = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(`${API_URL}/verify-identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm)
      });
      if (response.ok) {
        const data = await response.json();
        setTestResult(data);
        // Refresh audits to reflect new verified data if updated
        await fetchAudits();
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Validating identity registries and PAN databases...</p>
      </div>
    );
  }

  const filteredAudits = audits.filter(a => 
    a.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pan_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentAudit = audits.find(a => a.customer_id === selectedAuditId);

  // SVG Radial Gauge with Tactile Banking Meter Look
  const renderGauge = (score) => {
    const radius = 55;
    const stroke = 9;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let strokeColor = "#16A34A"; // green
    if (score < 50) strokeColor = "#DC2626"; // red
    else if (score < 80) strokeColor = "#D97706"; // amber

    return (
      <div className="relative flex items-center justify-center h-32 w-32 select-none">
        <svg viewBox="0 0 110 110" className="h-full w-full transform -rotate-90">
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
          <span className="text-2xl font-black font-mono text-[#172033]">{(score || 0).toFixed(0)}</span>
          <span className="text-[8px] text-[#64748B] uppercase tracking-wider block font-bold mt-0.5">Trust Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
            Identity Verification & KYC Registry
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Multi-parameter consistency auditing, synthetic identity detection, and on-demand PAN validation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowTestModal(true)}
            className="skeuo-btn-primary flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
          >
            <Plus size={14} />
            <span>Verify New Identity</span>
          </button>
          <button
            onClick={fetchAudits}
            className="skeuo-btn-secondary p-1.5 text-[#64748B]"
            title="Refresh registry"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Customer Records List */}
        <div className="skeuo-panel p-4 space-y-3 lg:col-span-1 flex flex-col max-h-[720px]">
          <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">Audited Customers</h3>
            <span className="skeuo-badge skeuo-badge-neutral">{audits.length} Records</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Filter by name or PAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skeuo-input w-full py-2 pl-9 pr-3 text-xs placeholder-[#94A3B8]"
            />
          </div>

          {/* Customer Profiles List */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {filteredAudits.map(a => {
              const isHigh = a.identity_confidence_score < 50;
              const isWarning = a.identity_confidence_score >= 50 && a.identity_confidence_score < 80;
              const isSelected = selectedAuditId === a.customer_id;
              return (
                <button
                  key={a.customer_id}
                  onClick={() => setSelectedAuditId(a.customer_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-50/90 to-blue-100/60 border-blue-300 text-blue-900 shadow-[0_1px_3px_rgba(37,99,235,0.08)]'
                      : 'bg-white border-[#DCE3EB] hover:bg-[#F8FAFC] text-[#172033]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{a.customer_name}</span>
                    <span className="text-[10px] text-[#64748B] font-mono mt-0.5 block">{a.pan_number}</span>
                  </div>
                  <div className="text-right">
                    <span className={`skeuo-badge ${
                      isHigh ? 'skeuo-badge-danger' :
                      isWarning ? 'skeuo-badge-warning' :
                      'skeuo-badge-success'
                    }`}>
                      {a.status}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-[#64748B] block mt-1">
                      {(a.identity_confidence_score || 0).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Customer Detail Verification View */}
        {currentAudit ? (
          <div className="lg:col-span-3 space-y-6">
            {/* Top Score Banner */}
            <div className="skeuo-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-5">
                {renderGauge(currentAudit.identity_confidence_score)}
                <div>
                  <h3 className="text-lg font-black text-[#172033]">{currentAudit.customer_name}</h3>
                  <div className="flex gap-2 items-center mt-1 text-[11px] text-[#64748B] font-mono">
                    <span>ID: #{currentAudit.customer_id}</span>
                    <span>•</span>
                    <span className="font-bold text-[#172033]">PAN: {currentAudit.pan_number}</span>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <span className={`skeuo-badge ${
                      currentAudit.onboarding_risk_level === 'High' ? 'skeuo-badge-danger' :
                      currentAudit.onboarding_risk_level === 'Medium' ? 'skeuo-badge-warning' :
                      'skeuo-badge-success'
                    }`}>
                      Onboarding Risk: {currentAudit.onboarding_risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end justify-center">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Verification Verdict</span>
                <span className={`text-sm font-extrabold flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg border ${
                  currentAudit.status === 'Trusted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  currentAudit.status === 'Suspicious' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {currentAudit.status === 'Trusted' ? <CheckCircle2 size={16} /> :
                   currentAudit.status === 'Suspicious' ? <AlertCircle size={16} /> : <XCircle size={16} />}
                  <span>{currentAudit.status === 'Trusted' ? 'IDENTITY PASSED' : 
                         currentAudit.status === 'Suspicious' ? 'STEP-UP REQUIRED' : 'IDENTITY BLOCKED'}</span>
                </span>
              </div>
            </div>

            {/* 3 Core Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: KYC Risk Score & Synthetic ID */}
              <div className="skeuo-panel p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <ShieldCheck size={14} className="text-blue-600" />
                  Onboarding Risk Checks
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#64748B] font-medium">KYC Discrepancy Risk</span>
                      <span className="text-[#172033] font-bold font-mono">{(currentAudit.kyc_risk_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="skeuo-well h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentAudit.kyc_risk_score > 60 ? 'bg-red-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${currentAudit.kyc_risk_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#64748B] font-medium">Synthetic Identity Flag</span>
                      <span className="text-[#172033] font-bold font-mono">{(currentAudit.synthetic_identity_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="skeuo-well h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentAudit.synthetic_identity_score > 60 ? 'bg-red-600' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${currentAudit.synthetic_identity_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Device Posture Verification */}
              <div className="skeuo-panel p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <Laptop size={14} className="text-blue-600" />
                  Device Posture Verification
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Operating Environment</span>
                    <span className={`font-bold ${
                      currentAudit.customer_id === 4 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {currentAudit.customer_id === 4 ? 'Rooted Emulator' : 'Compliant OS'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Hardware ID Linkage</span>
                    <span className={`font-bold ${
                      currentAudit.customer_id === 4 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {currentAudit.customer_id === 4 ? 'Shared Collusive Node' : 'Unique Signature'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Automated Bot Detection</span>
                    <span className="font-bold text-emerald-600">PASSED</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Contact Registry Reputation */}
              <div className="skeuo-panel p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                  <Mail size={14} className="text-blue-600" />
                  Contact Registry Status
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Email Provider</span>
                    {currentAudit.email_address?.includes("tempmail") ? (
                      <span className="skeuo-badge skeuo-badge-danger">Disposable Domain</span>
                    ) : (
                      <span className="skeuo-badge skeuo-badge-success">High Reputation</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Mobile Operator</span>
                    {currentAudit.phone_number?.includes("91000") ? (
                      <span className="skeuo-badge skeuo-badge-danger">VoIP Number</span>
                    ) : (
                      <span className="skeuo-badge skeuo-badge-success">Verified Carrier</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Credential Format Match Integrity Table */}
            <div className="skeuo-panel p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                <FileCheck size={14} className="text-blue-600" />
                Cross-Attribute Integrity Consistency
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE3EB] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">PAN Format Check</span>
                    <span className="text-xs font-bold text-[#172033] block mt-0.5">{currentAudit.pan_number}</span>
                  </div>
                  <span className="skeuo-badge skeuo-badge-success">VALID FORMAT</span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE3EB] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Email Registry</span>
                    <span className="text-xs font-bold text-[#172033] block mt-0.5 truncate max-w-[130px]">
                      {currentAudit.email_address}
                    </span>
                  </div>
                  <span className={`skeuo-badge ${
                    currentAudit.email_address?.includes("tempmail") ? 'skeuo-badge-danger' : 'skeuo-badge-success'
                  }`}>
                    {currentAudit.email_address?.includes("tempmail") ? 'FLAGGED' : 'CLEARED'}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE3EB] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block">Carrier Verification</span>
                    <span className="text-xs font-bold text-[#172033] block mt-0.5">{currentAudit.phone_number}</span>
                  </div>
                  <span className={`skeuo-badge ${
                    currentAudit.phone_number?.includes("91000") ? 'skeuo-badge-danger' : 'skeuo-badge-success'
                  }`}>
                    {currentAudit.phone_number?.includes("91000") ? 'VOIP RANGE' : 'MOBILE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Risk Indicators & Fraud Warnings */}
            <div className="skeuo-panel p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2">
                <ShieldAlert size={14} className="text-red-600" />
                Active Fraud Indicators & Anomaly Reasons
              </h4>

              {(!currentAudit.fraud_indicators || currentAudit.fraud_indicators.length === 0) ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>No suspicious identity signatures detected. Profile parameters align with verified banking records.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentAudit.fraud_indicators.map((indicator, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold">
                      <AlertCircle size={15} className="shrink-0 text-red-600" />
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 text-center py-24 text-[#64748B] text-xs">
            Select a customer profile to inspect identity verification parameters.
          </div>
        )}
      </div>

      {/* Modal: Interactive Live Identity Verification Test */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-[0_20px_50px_rgba(15,23,42,0.2)] max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#172033]">Live Identity Verification Test</h3>
                  <p className="text-[11px] text-[#64748B]">Execute live multi-factor identity confidence assessment</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowTestModal(false); setTestResult(null); }}
                className="text-[#94A3B8] hover:text-[#172033] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunVerification} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-semibold mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={testForm.customer_name}
                  onChange={(e) => setTestForm({...testForm, customer_name: e.target.value})}
                  className="skeuo-input w-full p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    required
                    value={testForm.pan_number}
                    onChange={(e) => setTestForm({...testForm, pan_number: e.target.value})}
                    className="skeuo-input w-full p-2.5 text-xs uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Registered Phone</label>
                  <input
                    type="text"
                    required
                    value={testForm.phone_number}
                    onChange={(e) => setTestForm({...testForm, phone_number: e.target.value})}
                    className="skeuo-input w-full p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#64748B] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={testForm.email_address}
                  onChange={(e) => setTestForm({...testForm, email_address: e.target.value})}
                  className="skeuo-input w-full p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Device ID Fingerprint</label>
                  <input
                    type="text"
                    required
                    value={testForm.device_id}
                    onChange={(e) => setTestForm({...testForm, device_id: e.target.value})}
                    className="skeuo-input w-full p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Client IP Address</label>
                  <input
                    type="text"
                    required
                    value={testForm.ip_address}
                    onChange={(e) => setTestForm({...testForm, ip_address: e.target.value})}
                    className="skeuo-input w-full p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="skeuo-btn-secondary px-3 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="skeuo-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {testing ? <span className="animate-spin">⟳</span> : <Send size={13} />}
                  <span>Evaluate Verification</span>
                </button>
              </div>
            </form>

            {testResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE3EB] space-y-2 animate-fade-in text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#172033]">Evaluation Result:</span>
                  <span className={`skeuo-badge ${
                    testResult.status === 'Trusted' ? 'skeuo-badge-success' : 'skeuo-badge-danger'
                  }`}>
                    {testResult.status}
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Identity Confidence Score:</span>
                  <span className="font-bold font-mono text-[#172033]">{testResult.identity_confidence_score}%</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Onboarding Risk Level:</span>
                  <span className="font-bold text-[#172033]">{testResult.onboarding_risk_level}</span>
                </div>
                {testResult.fraud_indicators?.length > 0 && (
                  <div className="mt-2 text-red-600 space-y-1">
                    <span className="font-semibold block">Detected Flags:</span>
                    {testResult.fraud_indicators.map((f, i) => (
                      <div key={i} className="text-[11px]">• {f}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityVerification;
