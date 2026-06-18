import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Download, 
  Cpu, 
  Clock,
  UserCheck,
  UserX,
  History,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ComplianceDashboard = ({ fetchComplianceStatus, fetchSecurityStatus }) => {
  const [compliance, setCompliance] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  
  // V3 additions
  const [insiderThreats, setInsiderThreats] = useState({ rankings: [], logs: [] });
  const [recoveryEvents, setRecoveryEvents] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const compData = await fetchComplianceStatus();
        setCompliance(compData);
        
        const secData = await fetchSecurityStatus();
        setSecurityLogs(secData.recent_logs || []);

        // Fetch insider threat logs
        const insResponse = await fetch(`${API_URL}/insider-threats`);
        if (insResponse.ok) {
          setInsiderThreats(await insResponse.json());
        }

        // Fetch recovery events
        const recResponse = await fetch(`${API_URL}/recovery-events`);
        if (recResponse.ok) {
          setRecoveryEvents(await recResponse.json());
        }
      } catch (e) {
        console.error("Failed to load compliance data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !compliance) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString() + ' ' + d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const score = compliance.compliance_score_percent;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">
            Identity Compliance & Security Auditing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validate compliance scores against regional checklists, audit SIM Swap recoveries, and monitor insider credentials.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-cyan-400 text-xs font-semibold hover:border-cyan-500 transition-all">
          <Download size={13} />
          Export Audit Brief
        </button>
      </div>

      {/* Main Grid: Compliance Meter & Audit Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Progress Score Dial */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-semibold text-sm font-sans text-slate-300">
            Overall Compliance Score
          </h3>
          
          <div className="relative flex items-center justify-center h-40 w-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke={score >= 80 ? "#10b981" : score >= 60 ? "#fbbf24" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 65}
                strokeDashoffset={2 * Math.PI * 65 * (1 - score / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold font-mono text-slate-100">{score}%</span>
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mt-0.5">Compliant</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
            {score === 100 
              ? "All Identity Trust parameters cleared. Sandbox audit score is fully certified."
              : "Complete a federated training round with verified nodes to clear full checks."
            }
          </div>
        </div>

        {/* Audit Checklist Table */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
            <FileCheck size={16} className="text-cyan-400" />
            RBI Compliance Verification List
          </h3>
          <div className="space-y-3">
            {compliance.rbi_checks.map((check, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-slate-950 border border-slate-900 gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${check.status ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <h4 className="text-xs font-bold text-slate-200">{check.check}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{check.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-[10px] font-bold uppercase ${check.status ? 'text-emerald-400' : 'text-red-400'}`}>
                    {check.status ? 'COMPLIANT' : 'PENDING'}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono mt-0.5">Weight: {check.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Insider Threat Alerts & Employee Risk Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employee Risk Rankings */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
            <UserCheck size={16} className="text-cyan-400" />
            Employee Risk Rankings
          </h3>
          <div className="space-y-3">
            {insiderThreats.rankings.map((emp, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-900">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{emp.employee_name}</span>
                  <span className="text-[9px] text-slate-500 font-mono block">ID: {emp.employee_id} • {emp.role}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold uppercase ${
                    emp.score > 70 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {emp.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{emp.score.toFixed(0)} Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privileged Access Violations alerts */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
            <FolderOpen size={16} className="text-cyan-400" />
            Privileged Access & Insider Activity Logs
          </h3>
          
          <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2 px-3">Employee</th>
                  <th className="py-2 px-3">Action performed</th>
                  <th className="py-2 px-3">Resource Target</th>
                  <th className="py-2 px-3 text-right">Anomaly score</th>
                  <th className="py-2 px-3 text-center">Alert status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono text-[10px]">
                {insiderThreats.logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-300">{log.employee_name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{log.action}</td>
                    <td className="py-2.5 px-3 text-purple-400">{log.resource}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-400">{log.risk_score.toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        log.is_suspicious 
                          ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}>
                        {log.is_suspicious ? 'VIOLATION' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SIM Swap Account Recovery Logs */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-1.5">
          <History size={16} className="text-cyan-400" />
          Suspicious Account Recovery & SIM Swap Telemetry
        </h3>

        <div className="space-y-3">
          {recoveryEvents.map((evt, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-900 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-200">Suspicious Recovery attempt for {evt.customer_name}</h4>
                </div>
                <div className="flex gap-2 flex-wrap text-[10px] text-slate-500">
                  <span>Device: {evt.device_id}</span>
                  <span>•</span>
                  <span>Contact: {evt.phone_number}</span>
                  <span>•</span>
                  <span>Time: {formatDate(evt.timestamp)}</span>
                </div>
                {/* Alerts list */}
                <div className="flex gap-2 flex-wrap mt-2">
                  {evt.alerts.map((al, aIdx) => (
                    <span key={aIdx} className="bg-red-950/20 text-red-400 px-2 py-0.5 rounded text-[9px] border border-red-900/20 font-semibold flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {al}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t border-slate-900 md:border-0 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Recovery Risk</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{evt.recovery_risk_score.toFixed(0)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">Verdict Status</span>
                  <span className="text-xs font-bold text-yellow-400">{evt.verdict}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
