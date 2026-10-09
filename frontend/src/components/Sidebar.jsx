import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Eye, 
  Key, 
  Cpu, 
  Wifi,
  Users,
  GitMerge,
  FileCheck,
  Fingerprint,
  ShieldCheck,
  Activity,
  Layers,
  Lock
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, metrics }) => {
  const navItems = [
    { id: 'overview', name: 'Executive SOC', icon: LayoutDashboard, badge: 'Live' },
    { id: 'identity', name: 'Identity Verification', icon: Fingerprint },
    { id: 'trust', name: 'Trust Intelligence', icon: Users },
    { id: 'fraud', name: 'Identity Risk Ledger', icon: ShieldAlert, count: metrics?.fraud_transactions },
    { id: 'federated', name: 'Federated Monitor', icon: Cpu },
    { id: 'explainability', name: 'Explainable AI (XAI)', icon: Eye },
    { id: 'graph', name: 'Knowledge Graph', icon: GitMerge },
    { id: 'security', name: 'Security & PQC', icon: Key },
    { id: 'compliance', name: 'Regulatory Compliance', icon: FileCheck },
  ];

  const threatColor = () => {
    if (metrics?.threat_level === 'High') return 'text-red-700 bg-red-50 border-red-200';
    if (metrics?.threat_level === 'Elevated') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  return (
    <aside className="w-64 bg-white border-r border-[#DCE3EB] flex flex-col h-screen sticky top-0 z-30 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#DCE3EB] bg-gradient-to-b from-white to-[#FAFCFD]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-[0_2px_4px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] border border-blue-800">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-[#172033] font-sans">
                FedShield<span className="text-blue-600">-ID</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                v3.2
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] font-medium tracking-wide">
              Privacy-First Banking Trust
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-3">
          Core Workflows
        </span>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                isActive 
                  ? 'bg-gradient-to-b from-blue-50/90 to-blue-100/70 border border-blue-200/90 text-blue-700 shadow-[0_1px_2px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
                  : 'text-[#475569] hover:text-[#172033] hover:bg-[#F8FAFC] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon 
                  size={17} 
                  className={isActive ? 'text-blue-600 stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'} 
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Telemetry & Banking Node Card */}
      <div className="p-4 border-t border-[#DCE3EB] bg-[#F8FAFC]">
        <div className="rounded-xl border border-[#DCE3EB] bg-white p-3 space-y-2.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Activity size={12} className="text-blue-600" />
              Node Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] pt-0.5">
            <div className="flex items-center justify-between text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-[#94A3B8]" />
                Cryptography
              </span>
              <span className="font-semibold text-[#172033] bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[10px] border border-[#E2E8F0]">
                {metrics?.encryption_type === 'PQC' ? 'Kyber-768 PQC' : 'ECDH-TLS'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-[#94A3B8]" />
                Threat Level
              </span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] border ${threatColor()}`}>
                {metrics?.threat_level || 'Normal'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Layers size={12} className="text-[#94A3B8]" />
                Privacy Budget
              </span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-200">
                ε = 2.0 (DP)
              </span>
            </div>
          </div>
        </div>

        {/* System Node Footer */}
        <div className="pt-2.5 flex items-center justify-between text-[10px] text-[#94A3B8]">
          <span>Cluster: Node-Alpha</span>
          <span className="font-mono">RBI / SOC-2</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
