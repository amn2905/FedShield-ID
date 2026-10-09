import React, { useState, useEffect } from 'react';
import { 
  GitMerge, 
  Users, 
  ShieldAlert, 
  Laptop, 
  Globe, 
  CreditCard, 
  ShoppingBag, 
  Info,
  Phone,
  Mail,
  UserCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Share2
} from 'lucide-react';

const KnowledgeGraph = ({ fetchGraphData }) => {
  const [graph, setGraph] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Position coordinates for clear visual clustering
  const nodeCoordinates = {
    // Legitimate Customer Cluster
    "CUST_1": { x: 180, y: 220 },
    "DEV_1": { x: 80, y: 150 },
    "IP_1": { x: 280, y: 140 },
    "PAN_1": { x: 80, y: 290 },
    "PHONE_1": { x: 80, y: 70 },
    "EMAIL_1": { x: 180, y: 340 },
    "ACC_1": { x: 280, y: 270 },
    "MERCH_1": { x: 180, y: 100 },

    // Cross-identity / Synthetic Link
    "CUST_2": { x: 380, y: 220 },
    "PAN_2": { x: 440, y: 130 },
    "PHONE_2": { x: 380, y: 320 },
    "EMAIL_2": { x: 440, y: 310 },

    // Collusive Fraud Ring Cluster
    "CUST_3": { x: 620, y: 120 },
    "CUST_4": { x: 680, y: 220 },
    "CUST_5": { x: 620, y: 320 },
    
    "DEV_FRAUD": { x: 550, y: 220 },
    "IP_FRAUD": { x: 500, y: 320 },
    "PHONE_FRAUD": { x: 740, y: 120 },
    "EMAIL_FRAUD": { x: 750, y: 220 },
    "ACC_FRAUD": { x: 620, y: 410 },
    "MERCH_FRAUD": { x: 480, y: 410 },

    // Insider & Employee Activity
    "EMP_1": { x: 280, y: 410 },
    "EMP_INSIDER": { x: 700, y: 360 }
  };

  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true);
      try {
        const data = await fetchGraphData();
        setGraph(data);
        // Default select Sanjay Dutt (CUST_4) to demonstrate fraud ring detection
        setSelectedNodeId("CUST_4");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadGraph();
  }, []);

  if (loading || !graph) {
    return (
      <div className="flex flex-col items-center justify-center h-96 py-20">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-xs text-[#64748B] font-medium">Synthesizing entity knowledge graph and link relationships...</p>
      </div>
    );
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId);

  const getNodeIcon = (label, size = 15, color = "text-[#172033]") => {
    switch (label) {
      case 'Customer': return <Users size={size} className={color} />;
      case 'Device': return <Laptop size={size} className={color} />;
      case 'IP_Address': return <Globe size={size} className={color} />;
      case 'PAN_Card': return <CreditCard size={size} className={color} />;
      case 'Merchant': return <ShoppingBag size={size} className={color} />;
      case 'Phone': return <Phone size={size} className={color} />;
      case 'Email': return <Mail size={size} className={color} />;
      case 'Employee': return <UserCheck size={size} className={color} />;
      case 'Account': return <Activity size={size} className={color} />;
      default: return <Info size={size} className={color} />;
    }
  };

  const getNodeColor = (node) => {
    const props = node.properties || {};
    if (props.alert || props.risk === 'High') return '#DC2626'; // Red
    if (props.risk === 'Medium') return '#D97706'; // Amber
    if (node.label === 'Device') return '#7C3AED'; // Purple
    if (node.label === 'IP_Address') return '#EA580C'; // Orange
    if (node.label === 'PAN_Card') return '#B91C1C'; // Red
    if (node.label === 'Merchant') return '#0284C7'; // Cyan
    if (node.label === 'Phone') return '#CA8A04'; // Yellow
    if (node.label === 'Email') return '#DB2777'; // Pink
    if (node.label === 'Employee') return '#E11D48'; // Rose
    if (node.label === 'Account') return '#059669'; // Green
    return '#2563EB'; // Blue (Customer)
  };

  const isLinkActive = (edge) => {
    return edge.source === selectedNodeId || edge.target === selectedNodeId;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#172033] font-sans">
          Identity Knowledge Graph & Fraud Ring Visualizer
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Detect collusive multi-account collisions, synthetic ID linkages, and resource sharing across decentralized ledger nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left 3 Columns: Graph Visualizer Canvas */}
        <div className="xl:col-span-3 skeuo-panel p-5 space-y-3 relative overflow-hidden bg-white">
          {/* Legend Toolbar */}
          <div className="flex gap-2 flex-wrap text-[11px] pb-2 border-b border-[#F1F5F9]">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> Customer
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-600" /> Device
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-600" /> IP Address
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600" /> PAN Card
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-600" /> Merchant
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-600" /> Phone
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-pink-600" /> Email
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-600" /> Employee
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Account
            </span>
          </div>

          {/* SVG Canvas Viewport */}
          <div className="w-full h-[470px] relative rounded-xl border border-[#DCE3EB] bg-[#FAFCFD] shadow-inner overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 800 480">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                </marker>
              </defs>

              {/* Grid backdrop dots */}
              <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.75" fill="#CBD5E1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dot-grid)" />

              {/* Draw Edges / Relationships */}
              {graph.edges.map((edge) => {
                const srcCoord = nodeCoordinates[edge.source];
                const tgtCoord = nodeCoordinates[edge.target];
                if (!srcCoord || !tgtCoord) return null;
                
                const isActive = isLinkActive(edge);

                return (
                  <g key={edge.id}>
                    <line
                      x1={srcCoord.x}
                      y1={srcCoord.y}
                      x2={tgtCoord.x}
                      y2={tgtCoord.y}
                      stroke={isActive ? '#2563EB' : '#CBD5E1'}
                      strokeWidth={isActive ? 2.5 : 1.2}
                      strokeOpacity={isActive ? 1 : 0.7}
                      strokeDasharray={edge.type === 'CONNECTED_FROM' ? '4,4' : '0'}
                      markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {graph.nodes.map((node) => {
                const coord = nodeCoordinates[node.id];
                if (!coord) return null;

                const isSelected = selectedNodeId === node.id;
                const nodeColor = getNodeColor(node);
                const hasAlert = node.properties?.alert || node.properties?.risk === 'High';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${coord.x}, ${coord.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Pulsing ring for alerts */}
                    {hasAlert && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="1.5"
                        className="animate-ping opacity-35"
                      />
                    )}
                    
                    {/* Selection Highlight */}
                    {isSelected && (
                      <circle
                        r="25"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="opacity-90"
                      />
                    )}

                    {/* Node Circle Surface */}
                    <circle
                      r="17"
                      fill="#FFFFFF"
                      stroke={nodeColor}
                      strokeWidth={isSelected ? 3 : 2}
                      className="group-hover:stroke-blue-600 transition-colors shadow-sm"
                    />

                    {/* Node Icon */}
                    <g transform="translate(-7.5, -7.5)">
                      {getNodeIcon(node.label, 15, hasAlert ? "text-red-600" : isSelected ? "text-blue-600" : "text-[#475569]")}
                    </g>

                    {/* Node Name/ID Tooltip Label */}
                    <text
                      y="28"
                      textAnchor="middle"
                      fill={isSelected ? '#172033' : '#64748B'}
                      fontSize="9.5"
                      fontWeight={isSelected ? 'bold' : '600'}
                      className="font-sans select-none pointer-events-none"
                    >
                      {node.properties.name || node.properties.model || node.properties.ip || node.properties.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right 1 Column: Graph Node Inspector Panel */}
        <div className="skeuo-panel p-5 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
            <Share2 size={15} className="text-blue-600" />
            Entity Relationship Auditor
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Type Card */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-xl border border-[#DCE3EB]">
                <div className="p-2 rounded-lg bg-white border border-[#DCE3EB] shadow-xs">
                  {getNodeIcon(selectedNode.label, 18, "text-blue-600")}
                </div>
                <div>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block">Entity Type</span>
                  <span className="text-xs font-bold text-[#172033] block">{selectedNode.label}</span>
                </div>
              </div>

              {/* Node Properties */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Attributes</span>
                <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-xl border border-[#DCE3EB] font-mono text-[11px]">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5">
                      <span className="text-[#64748B] uppercase text-[9px]">{k}:</span>
                      <span className={k === 'alert' ? 'text-red-600 font-bold' : 'text-[#172033] font-semibold'}>
                        {typeof v === 'boolean' ? (v ? 'True' : 'False') : v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Edges */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Connected Links</span>
                <div className="space-y-1 bg-[#F8FAFC] rounded-xl p-2.5 border border-[#DCE3EB] max-h-36 overflow-y-auto">
                  {graph.edges
                    .filter(isLinkActive)
                    .map(e => {
                      const otherNode = e.source === selectedNodeId ? e.target : e.source;
                      return (
                        <div key={e.id} className="flex justify-between py-1 text-[11px] text-[#64748B] border-b border-[#EDF2F7] last:border-0">
                          <span className="font-semibold text-blue-700">{e.type}</span>
                          <span className="font-bold text-[#172033]">{otherNode}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Fraud Ring Analysis Callout */}
              {selectedNode.properties?.alert || selectedNodeId.includes("FRAUD") || selectedNodeId === "CUST_4" || selectedNodeId === "CUST_5" ? (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-red-900">
                    <ShieldAlert size={13} className="text-red-600" />
                    Collusive Fraud Ring Detected
                  </div>
                  <p className="text-[11px] leading-relaxed text-red-700">
                    This entity participates in a shared hardware collision. 3 distinct customer identities share dev_rooted_laptop and IP 185.220.101.4, indicating coordinated syndicate velocity.
                  </p>
                </div>
              ) : selectedNode.properties?.alert || selectedNodeId === "CUST_2" || selectedNodeId === "PAN_2" ? (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-amber-900">
                    <AlertTriangle size={13} className="text-amber-600" />
                    Synthetic Identity Mismatch
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700">
                    PAN card APXPS5678G is registered to a different individual index. High onboarding risk flags raised.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-900">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Isolated Verified Network
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    Standard isolated device-customer relationships. No multi-account collisions or syndicates detected.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#64748B] text-center py-20">Click any node in the network to inspect its relationships.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
