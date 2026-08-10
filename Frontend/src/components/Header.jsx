import React from 'react';
import { ShieldAlert, Play, RefreshCw, BarChart3, Zap, Sun, Moon } from 'lucide-react';

export function Header({ onBatchRun, onRunEval, onRefresh, loading, activeTab, setActiveTab, theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="brand-title">Frontline Triage AI</h1>
          <p className="brand-subtitle">Enterprise Security & Message Dispatch Engine</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Theme Change Button */}
        <button
          className="btn btn-secondary"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#eab308" /> : <Moon size={16} color="#6366f1" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Zap size={16} /> Dashboard
        </button>

        <button
          className={`btn ${activeTab === 'eval' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('eval')}
        >
          <BarChart3 size={16} /> Evaluation Metrics
        </button>

        <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>

        <button className="btn btn-primary" onClick={onBatchRun} disabled={loading}>
          <Play size={16} /> Run Full Batch
        </button>
      </div>
    </header>
  );
}
