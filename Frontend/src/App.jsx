import React, { useState } from 'react';
import { useTriageData } from './hooks/useTriageData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ResultsTable } from './components/ResultsTable';
import { MessageDetailModal } from './components/MessageDetailModal';
import { EvalSummary } from './components/EvalSummary';
import { LiveTriageForm } from './components/LiveTriageForm';
import { triggerBatchRun, runEvaluation } from './api/client';

export default function App() {
  const { results, total, loading, error, filters, updateFilters, evalData, refresh } = useTriageData();
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'eval'
  const [actionStatus, setActionStatus] = useState(null);

  const handleBatchRun = async () => {
    setActionStatus('Executing batch classification across dataset...');
    try {
      await triggerBatchRun();
      await refresh();
      setActionStatus('✓ Batch triage completed successfully!');
    } catch (err) {
      alert(`Batch run error: ${err.message}`);
    } finally {
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleRunEval = async () => {
    setActionStatus('Evaluating agreement metrics against Ground Truth...');
    try {
      await runEvaluation();
      await refresh();
      setActionStatus('✓ Evaluation benchmark updated!');
    } catch (err) {
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setTimeout(() => setActionStatus(null), 3000);
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
      />

      {actionStatus && (
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
          <LiveTriageForm onTriageComplete={() => refresh()} />
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            totalCount={total}
            needsHumanCount={needsHumanCount}
          />
          <ResultsTable results={results} onSelectRow={(item) => setSelectedRow(item)} />
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
