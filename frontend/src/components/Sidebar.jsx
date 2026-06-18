import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Activity, 
  Eye, 
  Key, 
  Cpu, 
  Wifi,
  Users,
  GitMerge,
  FileCheck,
  Fingerprint
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, metrics }) => {
  const navItems = [
    { id: 'overview', name: 'Executive SOC', icon: LayoutDashboard },
    { id: 'identity', name: 'Identity Verification', icon: Fingerprint },
    { id: 'trust', name: 'Trust Intelligence', icon: Users },
    { id: 'compliance', name: 'Compliance Checklist', icon: FileCheck },
    { id: 'federated', name: 'Federated Monitor', icon: Cpu },
    { id: 'explainability', name: 'Explainable AI', icon: Eye },
    { id: 'graph', name: 'Knowledge Graph', icon: GitMerge },
    { id: 'security', name: 'Security Panel', icon: Key },
    { id: 'fraud', name: 'Identity Risk Ledger', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 backdrop-blur-md border-r border-slate-900 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Logo & Name */}
      <div className="p-5 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-purple-600 p-2 rounded-xl shadow-glow">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide font-sans">
              FedShield<span className="text-cyan-400 font-extrabold">-ID</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
              Identity Trust Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Network & Node Status Indicators */}
      <div className="p-5 border-t border-slate-900 space-y-3 bg-slate-950/40">
        <div className="space-y-2">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            System Telemetry
          </h3>
          
          {/* Aggregator Status */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Wifi size={12} className="text-slate-500" />
              Aggregator
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>

          {/* Encryption Tunnels */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Tunnel Security</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[8px] uppercase ${
              metrics?.encryption_type === 'PQC'
                ? 'bg-purple-950/60 border border-purple-800 text-purple-300'
                : 'bg-yellow-950/60 border border-yellow-800 text-yellow-300'
            }`}>
              {metrics?.encryption_type === 'PQC' ? 'Kyber-768' : 'ECDH-TLS'}
            </span>
          </div>

          {/* Threat Level */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Threat Level</span>
            <span className={`font-bold uppercase ${
              metrics?.threat_level === 'High' 
                ? 'text-red-400' 
                : metrics?.threat_level === 'Elevated' 
                  ? 'text-yellow-400' 
                  : 'text-emerald-400'
            }`}>
              {metrics?.threat_level || 'Normal'}
            </span>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="pt-1 text-center">
          <p className="text-[9px] text-slate-700">
            FedShield-ID 3.0 Platform
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
