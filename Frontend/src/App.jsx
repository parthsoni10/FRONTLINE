import React, { useState, useEffect } from 'react';
import { useTriageData } from './hooks/useTriageData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ResultsTable } from './components/ResultsTable';
import { MessageDetailModal } from './components/MessageDetailModal';
import { EvalSummary } from './components/EvalSummary';
import { LiveTriageForm } from './components/LiveTriageForm';
import { ProgressBar } from './components/ProgressBar';
import { triggerBatchRun, runEvaluation } from './api/client';

export default function App() {
  const { results, total, page, setPage, totalPages, limit, loading, error, filters, updateFilters, evalData, refresh } = useTriageData();
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'eval'
  const [actionStatus, setActionStatus] = useState(null);
  
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  // Task progress state for better UX
  const [progress, setProgress] = useState(null); // { percent: number, message: string } | null

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleBatchRun = async () => {
    setActionStatus('Executing batch classification across dataset...');
    setProgress({ percent: 15, message: 'Ingesting messages and connecting to classifier...' });
    
    let currentPct = 15;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 12) + 5;
      if (currentPct >= 90) {
        clearInterval(interval);
      } else {
        setProgress({ percent: currentPct, message: `Triaging customer messages... (${Math.round(currentPct * 0.4)}/40)` });
      }
    }, 250);

    try {
      await triggerBatchRun();
      clearInterval(interval);
      setProgress({ percent: 100, message: '✓ Batch classification completed!' });
      await refresh();
      setActionStatus('✓ Batch triage completed successfully!');
    } catch (err) {
      clearInterval(interval);
      alert(`Batch run error: ${err.message}`);
    } finally {
      setTimeout(() => {
        setActionStatus(null);
        setProgress(null);
      }, 1500);
    }
  };

  const handleRunEval = async () => {
    setActionStatus('Evaluating agreement metrics against Ground Truth...');
    setProgress({ percent: 25, message: 'Fetching Ground Truth dataset & comparing model predictions...' });

    let currentPct = 25;
    const interval = setInterval(() => {
      currentPct += 20;
      if (currentPct >= 85) {
        clearInterval(interval);
      } else {
        setProgress({ percent: currentPct, message: 'Computing category, priority & routing accuracy scorecards...' });
      }
    }, 200);

    try {
      await runEvaluation();
      clearInterval(interval);
      setProgress({ percent: 100, message: '✓ Benchmark evaluation complete!' });
      await refresh();
      setActionStatus('✓ Evaluation benchmark updated!');
    } catch (err) {
      clearInterval(interval);
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setTimeout(() => {
        setActionStatus(null);
        setProgress(null);
      }, 1500);
    }
  };

  const needsHumanCount = results.filter((r) => r.needsHuman).length;

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', paddingBottom: '3rem' }}>
      <Header
        onBatchRun={handleBatchRun}
        onRunEval={handleRunEval}
        onRefresh={refresh}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {progress && (
        <ProgressBar percent={progress.percent} message={progress.message} />
      )}

      {actionStatus && !progress && (
        <div style={{ background: 'var(--accent-indigo)', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, animation: 'fadeIn 0.2s ease' }}>
          {actionStatus}
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--p0-bg)', border: '1px solid var(--p0-border)', color: 'var(--p0-red)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <strong>Error connecting to backend service:</strong> {error}
        </div>
      )}

      {activeTab === 'dashboard' ? (
        <main>
          <LiveTriageForm
            onTriageComplete={() => refresh()}
            onProgress={(prog) => setProgress(prog)}
          />
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            totalCount={total}
            needsHumanCount={needsHumanCount}
          />
          <ResultsTable
            results={results}
            onSelectRow={(item) => setSelectedRow(item)}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </main>
      ) : (
        <main>
          <EvalSummary evalData={evalData} onRunEval={handleRunEval} loading={loading} />
        </main>
      )}

      {selectedRow && (
        <MessageDetailModal item={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </div>
  );
}
