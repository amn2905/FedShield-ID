import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import FederatedMonitor from './pages/FederatedMonitor';
import FraudDetection from './pages/FraudDetection';
import TrustIntelligence from './pages/TrustIntelligence';
import Explainability from './pages/Explainability';
import KnowledgeGraph from './pages/KnowledgeGraph';
import SecurityDashboard from './pages/SecurityDashboard';
import ComplianceDashboard from './pages/ComplianceDashboard';
import IdentityVerification from './pages/IdentityVerification';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [streamingActive, setStreamingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bank: '', is_flagged: undefined });

  // 1. Fetch dashboard metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard-metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setStreamingActive(data.streaming_active);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
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
        setTransactions(data.transactions);
        setTotalCount(data.total);
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

  // 11. Trigger Simulator attack injection (V2!)
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

        // Add new injected transaction to ledger list
        setTransactions(prev => [newTx, ...prev]);
        setTotalCount(prev => prev + 1);

        // Immediately select transaction and route to explainability/SHAP page
        setSelectedTxId(newTx.id);
        setCurrentPage('explainability');

        // Refresh metrics to update threat counters
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
            setTransactions(txData.transactions);
            setTotalCount(txData.total);
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

  // Route page components (8 Pages)
  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview metrics={metrics} />;
      case 'federated':
        return <FederatedMonitor metrics={metrics} onTriggerRound={triggerRound} />;
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
          />
        );
      case 'trust':
        return <TrustIntelligence fetchTrustScores={fetchTrustScores} metrics={metrics} />;
      case 'identity':
        return <IdentityVerification />;
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
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        metrics={metrics}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
