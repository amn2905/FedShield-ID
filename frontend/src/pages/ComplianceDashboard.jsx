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
  FolderOpen,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ComplianceDashboard = ({ fetchComplianceStatus, fetchSecurityStatus }) => {
  const [compliance, setCompliance] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [insiderThreats, setInsiderThreats] = useState({ rankings: [], logs: [] });
  const [recoveryEvents, setRecoveryEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const compData = await fetchComplianceStatus();
      setCompliance(compData);
      
      const secData = await fetchSecurityStatus();
      setSecurityLogs(secData.recent_logs || []);

      const insResponse = await fetch(`${API_URL}/insider-threats`);
      if (insResponse.ok) {
        setInsiderThreats(await insResponse.json());
      }

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

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !compliance) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Validating regulatory standards, RBI checklists, and SIM swap logs...</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const score = compliance.compliance_score_percent;

  const handleExportBrief = () => {
    const briefContent = `FEDSHIELD-ID REGULATORY COMPLIANCE BRIEF
Generated: ${new Date().toISOString()}
Compliance Score: ${score}%

RBI VERIFICATION CHECKS:
${compliance.rbi_checks.map(c => `- ${c.check}: ${c.status ? 'COMPLIANT' : 'PENDING'} (${c.weight}%) - ${c.description}`).join('\n')}

INSIDER THREAT RANKINGS:
${insiderThreats.rankings.map(e => `- ${e.employee_name} (${e.role}): Score ${e.score} - ${e.category}`).join('\n')}
`;
    const blob = new Blob([briefContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fedshield_compliance_audit_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
            Regulatory Compliance & Forensic Audit Trail
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time compliance certification with RBI cyber resilience guidelines, SIM-swap recovery verification, and insider access logs.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportBrief}
            className="skeuo-btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
          >
            <Download size={14} className="text-blue-600" />
            <span>Export Audit Brief</span>
          </button>
          <button
            onClick={loadData}
            className="skeuo-btn-secondary p-1.5 text-[#64748B]"
            title="Refresh checklist"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid: Compliance Dial + RBI Verification Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Dial Meter */}
        <div className="skeuo-panel p-6 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
            Regulatory Compliance Index
          </h3>
          
          <div className="relative flex items-center justify-center h-40 w-40 select-none">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="#E9EDF2"
                strokeWidth="11"
              />
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke={score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626"}
                strokeWidth="11"
                strokeDasharray={2 * Math.PI * 65}
                strokeDashoffset={2 * Math.PI * 65 * (1 - score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black font-mono text-[#172033]">{score}%</span>
              <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-wider block mt-0.5">Compliant</span>
            </div>
          </div>

          <div className="text-xs text-[#64748B] max-w-[220px] leading-relaxed">
            {score === 100 
              ? "All regulatory frameworks satisfied. Collaborative learning verified with zero customer data pooling."
              : "Execute at least one federated aggregation round to certify collaborative model synchronization."
            }
          </div>
        </div>

        {/* Audit Checklist Table */}
        <div className="lg:col-span-2 skeuo-panel p-5 space-y-3">
          <div className="border-b border-[#F1F5F9] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              <FileCheck size={15} className="text-blue-600" />
              RBI Cyber Security & Privacy Checklist Evaluation
            </h3>
            <p className="text-[11px] text-[#64748B]">Automated audit verification derived directly from network cryptographic state</p>
          </div>

          <div className="space-y-2.5">
            {compliance.rbi_checks.map((check, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE3EB] gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${check.status ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    <h4 className="text-xs font-bold text-[#172033]">{check.check}</h4>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed pl-4">{check.description}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`skeuo-badge ${check.status ? 'skeuo-badge-success' : 'skeuo-badge-danger'}`}>
                    {check.status ? 'COMPLIANT' : 'PENDING'}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] font-mono mt-1">Weight: {check.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Insider Threat Rankings & Privileged Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Risk Rankings */}
        <div className="skeuo-panel p-5 space-y-3">
          <div className="border-b border-[#F1F5F9] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              <UserCheck size={15} className="text-blue-600" />
              Employee Insider Threat Rankings
            </h3>
            <p className="text-[10px] text-[#64748B]">Privilege escalation & abnormal query monitoring</p>
          </div>

          <div className="space-y-2">
            {insiderThreats.rankings.map((emp, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE3EB]">
                <div>
                  <span className="text-xs font-bold text-[#172033] block">{emp.employee_name}</span>
                  <span className="text-[10px] text-[#64748B] font-mono block">ID: {emp.employee_id} • {emp.role}</span>
                </div>
                <div className="text-right">
                  <span className={`skeuo-badge ${
                    emp.score > 70 ? 'skeuo-badge-danger' : 'skeuo-badge-success'
                  }`}>
                    {emp.category}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono font-bold block mt-1">{emp.score.toFixed(0)} Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privileged Access Activity Logs Table */}
        <div className="lg:col-span-2 skeuo-panel p-5 space-y-3">
          <div className="border-b border-[#F1F5F9] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              <FolderOpen size={15} className="text-blue-600" />
              Privileged Access & Data Vault Audit Logs
            </h3>
            <p className="text-[10px] text-[#64748B]">Audits administrative database queries, volume transfers, and abnormal download size</p>
          </div>
          
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3EB] text-[#64748B] font-semibold uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource Target</th>
                  <th className="py-2.5 px-3 text-right">Anomaly Score</th>
                  <th className="py-2.5 px-3 text-center">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#172033]">
                {insiderThreats.logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-bold">{log.employee_name}</td>
                    <td className="py-2.5 px-3 font-medium text-[#475569]">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-700 font-semibold">{log.resource}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#172033]">{log.risk_score?.toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`skeuo-badge ${
                        log.is_suspicious ? 'skeuo-badge-danger' : 'skeuo-badge-neutral'
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

      {/* SIM Swap & Suspicious Account Recovery Logs */}
      <div className="skeuo-panel p-5 space-y-3">
        <div className="border-b border-[#F1F5F9] pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
            <History size={15} className="text-blue-600" />
            SIM Swap & Suspicious Account Recovery Telemetry
          </h3>
          <p className="text-[10px] text-[#64748B]">Monitors account reset attempts against recent carrier telecom SIM swap registries</p>
        </div>

        <div className="space-y-2.5">
          {recoveryEvents.map((evt, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE3EB] gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-[#172033]">Recovery Assessment: {evt.customer_name}</h4>
                </div>
                <div className="flex gap-2 flex-wrap text-[11px] text-[#64748B] font-mono">
                  <span>Device: {evt.device_id}</span>
                  <span>•</span>
                  <span>Contact: {evt.phone_number}</span>
                  <span>•</span>
                  <span>Time: {formatDate(evt.timestamp)}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-1.5">
                  {evt.alerts?.map((al, aIdx) => (
                    <span key={aIdx} className="skeuo-badge skeuo-badge-danger text-[9px] flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {al}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t border-[#EDF2F7] md:border-0 pt-2 md:pt-0">
                <div className="text-right">
                  <span className="text-[9px] text-[#64748B] block uppercase font-bold tracking-wider">Recovery Risk</span>
                  <span className="text-sm font-mono font-bold text-red-600">{evt.recovery_risk_score?.toFixed(0)}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[#64748B] block uppercase font-bold tracking-wider">Enforced Verdict</span>
                  <span className="skeuo-badge skeuo-badge-warning">{evt.verdict}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic Transmission Audit Logs */}
      {securityLogs.length > 0 && (
        <div className="skeuo-panel p-5 space-y-3">
          <div className="border-b border-[#F1F5F9] pb-2 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              <Terminal size={15} className="text-purple-600" />
              Cryptographic Enclave Audit Telemetry
            </h3>
            <span className="skeuo-badge skeuo-badge-neutral">{securityLogs.length} Events Logged</span>
          </div>

          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3EB] text-[#64748B] font-semibold uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-2.5 px-3">Node</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3 text-right">Payload Bytes</th>
                  <th className="py-2.5 px-3 text-right">Latency</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-[#172033] font-mono text-[11px]">
                {securityLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-3 font-bold font-sans">{log.node_name}</td>
                    <td className="py-2.5 px-3 font-sans text-[#475569]">{log.action}</td>
                    <td className="py-2.5 px-3 text-purple-700">{log.algorithm}</td>
                    <td className="py-2.5 px-3 text-right">{log.bytes_transmitted} B</td>
                    <td className="py-2.5 px-3 text-right text-blue-700">{log.execution_time_ms?.toFixed(3)} ms</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="skeuo-badge skeuo-badge-success text-[9px]">{log.encryption_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;
