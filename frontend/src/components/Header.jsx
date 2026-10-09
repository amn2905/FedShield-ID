import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

const Header = ({ 
  currentPage, 
  streamingActive, 
  onToggleStreaming, 
  onRefresh, 
  onTriggerAttack,
  metrics 
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [injecting, setInjecting] = useState(null);

  const pageTitles = {
    overview: { title: 'Executive Security Operations Center', desc: 'Real-time telemetry, threat levels, and decentralized intelligence.' },
    identity: { title: 'Identity Verification & Onboarding', desc: 'Synthetic identity detection, KYC auditing, and identity confidence scoring.' },
    trust: { title: 'Identity Trust Intelligence Engine', desc: 'Continuous behavioral analytics, device reputation, and dynamic risk scoring.' },
    fraud: { title: 'Continuous Identity Risk Ledger', desc: 'Real-time transaction risk scoring and adaptive multi-factor authentication actions.' },
    federated: { title: 'Federated Learning Monitor', desc: 'Privacy-preserving collaborative training and differential privacy weight aggregation.' },
    explainability: { title: 'Explainable AI & Forensic Audit', desc: 'SHAP mathematical feature attributions and automated GenAI SOC briefings.' },
    graph: { title: 'Identity Knowledge Graph', desc: 'Multi-hop entity graph linking accounts, devices, PAN cards, and fraud rings.' },
    security: { title: 'Post-Quantum Security & Cryptography', desc: 'CRYSTALS-Kyber-768 lattice encryption benchmarks and hardware telemetry.' },
    compliance: { title: 'Regulatory Compliance & Audit Trail', desc: 'RBI regulatory checklist validation, SIM-swap logs, and insider threat audit.' },
  };

  const currentInfo = pageTitles[currentPage] || { title: 'Dashboard', desc: 'FedShield-ID Security Platform' };

  const attackScenarios = [
    { type: 'Transaction Fraud', label: 'Transaction Fraud (Amount / Distance Spike)', icon: Zap },
    { type: 'Account Takeover', label: 'Account Takeover (Cred Stuffing / SIM Swap)', icon: AlertTriangle },
    { type: 'Synthetic Identity Fraud', label: 'Synthetic Identity (PAN / Name Mismatch)', icon: ShieldAlert },
    { type: 'Bot Attack', label: 'Bot Attack (Headless Chrome / Robotic Jitter)', icon: Sparkles },
    { type: 'Suspicious Recovery', label: 'Suspicious Account Recovery (Rooted Device)', icon: RotateCw },
    { type: 'Insider Threat', label: 'Insider Threat (SysAdmin Database Exfiltration)', icon: ShieldAlert }
  ];

  const handleSimulate = async (type) => {
    setInjecting(type);
    try {
      if (onTriggerAttack) await onTriggerAttack(type);
    } finally {
      setInjecting(null);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-[#DCE3EB] px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sticky top-0 z-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Breadcrumb & Title */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] mb-1">
            <span>FedShield-ID</span>
            <ChevronRight size={12} className="text-[#94A3B8]" />
            <span className="text-blue-600 font-bold capitalize">{currentPage}</span>
            <span className="text-[#CBD5E1] mx-1">•</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Federated Core Connected
            </span>
            {metrics?.threat_level && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                metrics.threat_level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                metrics.threat_level === 'Elevated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Threat: {metrics.threat_level}
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-[#172033] tracking-tight font-sans">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {currentInfo.desc}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Simulator Toggle */}
          <button
            onClick={() => onToggleStreaming(!streamingActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              streamingActive
                ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-[inset_0_1px_1px_rgba(217,119,6,0.1)]'
                : 'bg-white text-[#172033] border-[#DCE3EB] hover:bg-[#F8FAFC] shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
            title="Start or pause automated 3-second transaction stream simulator"
          >
            {streamingActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Streaming Live</span>
                <Square size={12} className="text-amber-700 ml-1" />
              </>
            ) : (
              <>
                <Play size={12} className="text-emerald-600 fill-emerald-600" />
                <span>Start Stream</span>
              </>
            )}
          </button>

          {/* Attack Simulator Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="skeuo-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            >
              <Zap size={13} className="text-blue-600" />
              <span>Simulate Threat</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-bold">Demo</span>
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#DCE3EB] shadow-[0_10px_25px_-5px_rgba(15,23,42,0.15)] p-2 z-50 text-xs"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] border-b border-[#F1F5F9] mb-1">
                  Inject Realistic Threat Scenario
                </div>
                {attackScenarios.map((sc) => {
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.type}
                      disabled={injecting === sc.type}
                      onClick={() => handleSimulate(sc.type)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-lg hover:bg-[#F8FAFC] text-[#172033] hover:text-blue-600 font-medium transition-colors"
                    >
                      <Icon size={14} className="text-amber-600 shrink-0" />
                      <span className="truncate">{sc.label}</span>
                      {injecting === sc.type && (
                        <span className="ml-auto text-[10px] text-blue-600 animate-spin">⟳</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={onRefresh}
            className="skeuo-btn-secondary p-1.5 text-[#64748B] hover:text-[#172033]"
            title="Refresh metrics & sync"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
