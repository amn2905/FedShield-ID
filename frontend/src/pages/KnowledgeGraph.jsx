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
  Activity
} from 'lucide-react';

const KnowledgeGraph = ({ fetchGraphData }) => {
  const [graph, setGraph] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcode beautiful coordinates for our seeded graph nodes to display clusters clearly
  const nodeCoordinates = {
    // Legitimate Cluster (Star around CUST_1)
    "CUST_1": { x: 180, y: 220 },
    "DEV_1": { x: 80, y: 150 },
    "IP_1": { x: 280, y: 140 },
    "PAN_1": { x: 80, y: 290 },
    "PHONE_1": { x: 80, y: 70 },
    "EMAIL_1": { x: 180, y: 340 },
    "ACC_1": { x: 280, y: 270 },
    "MERCH_1": { x: 180, y: 100 },

    // Cross-identity link / Synthetic
    "CUST_2": { x: 380, y: 220 },
    "PAN_2": { x: 440, y: 130 },
    "PHONE_2": { x: 380, y: 320 },
    "EMAIL_2": { x: 440, y: 310 },

    // Fraud Ring Cluster (Dense links to DEV_FRAUD / IP_FRAUD)
    "CUST_3": { x: 620, y: 120 },
    "CUST_4": { x: 680, y: 220 },
    "CUST_5": { x: 620, y: 320 },
    
    "DEV_FRAUD": { x: 550, y: 220 },
    "IP_FRAUD": { x: 500, y: 320 },
    "PHONE_FRAUD": { x: 740, y: 120 },
    "EMAIL_FRAUD": { x: 750, y: 220 },
    "ACC_FRAUD": { x: 620, y: 410 },
    "MERCH_FRAUD": { x: 480, y: 410 },

    // Insider threat
    "EMP_1": { x: 280, y: 410 },
    "EMP_INSIDER": { x: 700, y: 360 }
  };

  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true);
      try {
        const data = await fetchGraphData();
        setGraph(data);
        // Default select Sanjay Dutt (CUST_4) to highlight fraud ring
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
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId);

  // Helper to choose node icon based on type
  const getNodeIcon = (label, size = 16, color = "text-white") => {
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

  // Helper to color nodes based on risk
  const getNodeColor = (node) => {
    const props = node.properties || {};
    if (props.alert || props.risk === 'High') return 'rgb(239, 68, 68)'; // Red
    if (props.risk === 'Medium') return 'rgb(251, 191, 36)'; // Yellow
    if (node.label === 'Device' && props.reputation > 80) return 'rgb(168, 85, 247)'; // Purple
    if (node.label === 'IP_Address') return 'rgb(249, 115, 22)'; // Orange
    if (node.label === 'PAN_Card') return 'rgb(220, 38, 38)'; // Red
    if (node.label === 'Merchant') return 'rgb(34, 211, 238)'; // Cyan
    if (node.label === 'Phone') return 'rgb(234, 179, 8)'; // Yellow
    if (node.label === 'Email') return 'rgb(236, 72, 153)'; // Pink
    if (node.label === 'Employee') return 'rgb(244, 63, 94)'; // Rose
    if (node.label === 'Account') return 'rgb(16, 185, 129)'; // Green
    return 'rgb(59, 130, 246)'; // Blue (standard customer)
  };

  // Check if a line/link connects to the currently selected node
  const isLinkActive = (edge) => {
    return edge.source === selectedNodeId || edge.target === selectedNodeId;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight font-sans">
          Identity Knowledge Graph Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detect collusive identity networks, resource pooling, and synthetic identity profiles across bank ledgers.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left 3 Columns: Graph Visualizer */}
        <div className="xl:col-span-3 glass-panel p-5 space-y-4 relative overflow-hidden bg-slate-950/40">
          <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap text-[10px]">
            <span className="flex items-center gap-1 bg-blue-950/50 border border-blue-900 px-2 py-0.5 rounded text-blue-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Customer
            </span>
            <span className="flex items-center gap-1 bg-purple-950/50 border border-purple-900 px-2 py-0.5 rounded text-purple-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Device
            </span>
            <span className="flex items-center gap-1 bg-orange-950/50 border border-orange-900 px-2 py-0.5 rounded text-orange-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> IP
            </span>
            <span className="flex items-center gap-1 bg-red-950/50 border border-red-900 px-2 py-0.5 rounded text-red-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> PAN
            </span>
            <span className="flex items-center gap-1 bg-cyan-950/50 border border-cyan-900 px-2 py-0.5 rounded text-cyan-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> Merchant
            </span>
            <span className="flex items-center gap-1 bg-yellow-950/50 border border-yellow-900 px-2 py-0.5 rounded text-yellow-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Phone
            </span>
            <span className="flex items-center gap-1 bg-pink-950/50 border border-pink-900 px-2 py-0.5 rounded text-pink-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Email
            </span>
            <span className="flex items-center gap-1 bg-rose-950/50 border border-rose-900 px-2 py-0.5 rounded text-rose-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Employee
            </span>
            <span className="flex items-center gap-1 bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded text-emerald-300 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Account
            </span>
          </div>

          {/* Responsive SVG Viewport */}
          <div className="w-full h-[450px] relative border border-slate-900 rounded-xl bg-slate-950/80">
            <svg className="w-full h-full" viewBox="0 0 800 480">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                </marker>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Draw Edges / Connections */}
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
                      stroke={isActive ? '#22d3ee' : '#334155'}
                      strokeWidth={isActive ? 2.5 : 1.2}
                      strokeOpacity={isActive ? 0.9 : 0.4}
                      strokeDasharray={edge.type === 'CONNECTED_FROM' ? '4,4' : '0'}
                      markerEnd="url(#arrow)"
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
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for high-risk alerts */}
                    {hasAlert && (
                      <circle
                        r="22"
                        fill="none"
                        stroke="rgb(239, 68, 68)"
                        strokeWidth="1.5"
                        className="animate-ping opacity-40"
                      />
                    )}
                    
                    {/* Selection halo */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2"
                        className="opacity-80"
                      />
                    )}

                    {/* Main Node body */}
                    <circle
                      r="16"
                      fill="#0f172a"
                      stroke={nodeColor}
                      strokeWidth="2.5"
                      className="group-hover:fill-slate-900 transition-colors"
                      filter={hasAlert ? "url(#glow-red)" : ""}
                    />

                    {/* Node symbol icon */}
                    <g transform="translate(-8, -8)">
                      {getNodeIcon(node.label, 16, hasAlert ? "text-red-400" : isSelected ? "text-cyan-400" : "")}
                    </g>

                    {/* Label tooltip text below node */}
                    <text
                      y="26"
                      textAnchor="middle"
                      fill={isSelected ? '#e2e8f0' : '#64748b'}
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="select-none pointer-events-none font-sans"
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
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-semibold text-sm font-sans text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <GitMerge size={16} className="text-cyan-400" />
            Entity Relationship Auditor
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Type & Icon */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-900">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  {getNodeIcon(selectedNode.label, 20, "text-cyan-400")}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Entity Type</span>
                  <span className="text-sm font-bold text-slate-200 block">{selectedNode.label}</span>
                </div>
              </div>

              {/* Node Properties */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Properties</span>
                <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-900 font-mono text-[11px]">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[9px]">{k}:</span>
                      <span className={k === 'alert' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {typeof v === 'boolean' ? (v ? 'True' : 'False') : v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected edges summary */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Network Links</span>
                <div className="space-y-1 bg-slate-950/40 rounded-xl p-2.5 border border-slate-900 max-h-36 overflow-y-auto">
                  {graph.edges
                    .filter(isLinkActive)
                    .map(e => {
                      const otherNode = e.source === selectedNodeId ? e.target : e.source;
                      return (
                        <div key={e.id} className="flex justify-between py-1 text-[10px] text-slate-400 border-b border-slate-900/60 last:border-0">
                          <span>{e.type}</span>
                          <span className="font-semibold text-slate-300">{otherNode}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Collusive Network explanation block */}
              {selectedNode.properties.alert || selectedNodeId.includes("FRAUD") || selectedNodeId === "CUST_4" || selectedNodeId === "CUST_5" ? (
                <div className="bg-red-950/20 border border-red-900/60 p-3 rounded-xl text-red-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                    <ShieldAlert size={12} />
                    Collusive Network Detected
                  </div>
                  <p className="text-[10px] leading-normal text-slate-400">
                    This entity is linked to untrusted device and VPN IP signatures. There is a multi-account collision where 3 distinct customer profiles (Vikram, Sanjay, Anita) share a single rooted device ID and VPN node, suggesting velocity risks.
                  </p>
                </div>
              ) : selectedNode.properties.alert || selectedNodeId === "CUST_2" || selectedNodeId === "PAN_2" ? (
                <div className="bg-orange-950/20 border border-orange-900/60 p-3 rounded-xl text-orange-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                    <ShieldAlert size={12} />
                    Identity Mismatch Warning
                  </div>
                  <p className="text-[10px] leading-normal text-slate-400">
                    Account profile name 'Neha Patel' is linked to PAN card APXPS5678G which is registered to a different individual index 'Rajesh Kumar'. Suspected synthetic profile creation.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-xl text-slate-400 text-[10px] leading-normal">
                  This entity exhibits standard isolated network linkages. Reputation metrics indicate normal trust levels.
                </div>
              )}

            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-20">Click any node in the network to inspect its relationships.</p>
          )}

        </div>

      </div>
    </div>
  );
};

export default KnowledgeGraph;
