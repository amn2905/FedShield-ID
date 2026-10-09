import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import FederatedMonitor from './pages/FederatedMonitor';
import FraudDetection from './pages/FraudDetection';
import TrustIntelligence from './pages/TrustIntelligence';
import Explainability from './pages/Explainability';
import KnowledgeGraph from './pages/KnowledgeGraph';
import SecurityDashboard from './pages/SecurityDashboard';
import ComplianceDashboard from './pages/ComplianceDashboard';
import IdentityVerification from './pages/IdentityVerification';
import { AlertCircle, Menu, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VALID_PAGES = ['overview', 'verification', 'trust', 'transactions', 'federated', 'explainability', 'graph', 'security', 'compliance'];

function getInitialPage() {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (VALID_PAGES.includes(hash)) return hash;
  }
  return 'overview';
}

function App() {
  const [currentPage, setCurrentPageState] = useState(getInitialPage);
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [streamingActive, setStreamingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [filters, setFilters] = useState({ bank: '', is_flagged: undefined });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      window.location.hash = page;
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (VALID_PAGES.includes(hash)) {
        setCurrentPageState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. Fetch dashboard metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard-metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setStreamingActive(data.streaming_active);
        setBackendError(null);
      } else {
        setBackendError(`Backend returned HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      setBackendError('Backend service unreachable at ' + API_URL);
    }
  }, []);

  // 2. Fetch transactions list
  const fetchTransactions = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    try {
      let url = `${API_URL}/transactions?limit=60`;
      if (activeFilters.bank) {
        url += `&bank=${encodeURIComponent(activeFilters.bank)}`;
      }
      if (activeFilters.is_flagged !== undefined) {
        url += `&is_flagged=${activeFilters.is_flagged}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotalCount(data.total || 0);
        setBackendError(null);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 3. Fetch Trust scores
  const fetchTrustScores = async () => {
    try {
      const response = await fetch(`${API_URL}/trust-score`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch trust scores');
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 4. Fetch Knowledge Graph
  const fetchGraphData = async () => {
    try {
      const response = await fetch(`${API_URL}/graph-data`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch graph data');
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 5. Fetch RBI Compliance status
  const fetchComplianceStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/compliance-status`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch compliance status');
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 6. Trigger Federated Round
  const triggerRound = async (roundParams) => {
    try {
      const response = await fetch(`${API_URL}/federated-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roundParams),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchMetrics();
        return data;
      } else {
        throw new Error('Federated round request failed');
      }
    } catch (error) {
      console.error('Failed to trigger federated round:', error);
      throw error;
    }
  };

  // 7. Start/Stop streaming simulator
  const toggleStreaming = async (active) => {
    try {
      const response = await fetch(`${API_URL}/stream-transactions?active=${active}`, {
        method: 'POST',
      });
      if (response.ok) {
        setStreamingActive(active);
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to toggle streaming simulator:', error);
    }
  };

  // 8. Fetch SHAP explanation
  const fetchXAIExplanation = async (id) => {
    try {
      const response = await fetch(`${API_URL}/explain/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch XAI explanation');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // 9. Fetch GenAI report
  const fetchGenAIReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/fraud-investigation/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch GenAI report');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // 10. Fetch Security status & logs
  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/security-status`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch security status');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // 11. Trigger Simulator attack injection
  const triggerAttack = async (attackType) => {
    try {
      const response = await fetch(`${API_URL}/simulate-attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: attackType, bank: 'Bank A' })
      });
      if (response.ok) {
        const data = await response.json();
        const newTx = data.transaction;

        // Add new injected transaction to ledger
        setTransactions(prev => [newTx, ...prev]);
        setTotalCount(prev => prev + 1);

        // Select transaction and open explainability if requested
        setSelectedTxId(newTx.id);
        if (currentPage !== 'fraud') {
          setCurrentPage('explainability');
        }

        // Refresh metrics
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to inject simulated attack:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const initLoad = async () => {
      await fetchMetrics();
      await fetchTransactions();
    };
    initLoad();
  }, [fetchMetrics, fetchTransactions]);

  // Handle Polling loop when transaction streaming is active
  useEffect(() => {
    let intervalId = null;
    if (streamingActive) {
      intervalId = setInterval(async () => {
        try {
          const responseMetrics = await fetch(`${API_URL}/dashboard-metrics`);
          if (responseMetrics.ok) {
            const mData = await responseMetrics.json();
            setMetrics(mData);
          }

          let txUrl = `${API_URL}/transactions?limit=60`;
          if (filters.bank) txUrl += `&bank=${encodeURIComponent(filters.bank)}`;
          if (filters.is_flagged !== undefined) txUrl += `&is_flagged=${filters.is_flagged}`;

          const responseTx = await fetch(txUrl);
          if (responseTx.ok) {
            const txData = await responseTx.json();
            setTransactions(txData.transactions || []);
            setTotalCount(txData.total || 0);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [streamingActive, filters]);

  const handleInspectXAI = (txId) => {
    setSelectedTxId(txId);
    setCurrentPage('explainability');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  const refreshAll = async () => {
    await fetchMetrics();
    await fetchTransactions();
  };

  // Render current view
  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview metrics={metrics} />;
      case 'identity':
        return <IdentityVerification />;
      case 'trust':
        return <TrustIntelligence fetchTrustScores={fetchTrustScores} metrics={metrics} />;
      case 'fraud':
        return (
          <FraudDetection
            transactions={transactions}
            loading={loading}
            streamingActive={streamingActive}
            onToggleStreaming={toggleStreaming}
            onInspectXAI={handleInspectXAI}
            totalCount={totalCount}
            onFilterChange={handleFilterChange}
            onTriggerAttack={triggerAttack}
            selectedTxId={selectedTxId}
            setSelectedTxId={setSelectedTxId}
            fetchXAIExplanation={fetchXAIExplanation}
            fetchGenAIReport={fetchGenAIReport}
          />
        );
      case 'federated':
        return <FederatedMonitor metrics={metrics} onTriggerRound={triggerRound} />;
      case 'explainability':
        return (
          <Explainability
            selectedTxId={selectedTxId}
            transactions={transactions}
            fetchXAIExplanation={fetchXAIExplanation}
            fetchGenAIReport={fetchGenAIReport}
          />
        );
      case 'graph':
        return <KnowledgeGraph fetchGraphData={fetchGraphData} />;
      case 'security':
        return <SecurityDashboard fetchSecurityStatus={fetchSecurityStatus} />;
      case 'compliance':
        return (
          <ComplianceDashboard
            fetchComplianceStatus={fetchComplianceStatus}
            fetchSecurityStatus={fetchSecurityStatus}
          />
        );
      default:
        return <Overview metrics={metrics} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F8] font-sans text-[#172033] antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          metrics={metrics}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-3 flex justify-end border-b border-[#DCE3EB]">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#172033]"
          >
            <X size={20} />
          </button>
        </div>
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(p) => { setCurrentPage(p); setMobileMenuOpen(false); }}
          metrics={metrics}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Trigger */}
        <div className="lg:hidden bg-white border-b border-[#DCE3EB] p-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-[#DCE3EB] text-[#172033]"
          >
            <Menu size={18} />
          </button>
          <span className="font-extrabold text-sm text-[#172033]">
            FedShield<span className="text-blue-600">-ID</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ONLINE
          </span>
        </div>

        {/* Global Enterprise Header */}
        <Header
          currentPage={currentPage}
          streamingActive={streamingActive}
          onToggleStreaming={toggleStreaming}
          onRefresh={refreshAll}
          onTriggerAttack={triggerAttack}
          metrics={metrics}
        />

        {/* Offline Warning Banner if backend fails */}
        {backendError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-700 shrink-0" />
              <span>{backendError}. Ensure backend container or local server is running on port 8000.</span>
            </div>
            <button
              onClick={refreshAll}
              className="text-[11px] font-bold text-blue-700 underline hover:no-underline ml-2 shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
