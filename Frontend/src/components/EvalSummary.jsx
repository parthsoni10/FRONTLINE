import React from 'react';
import { Award, AlertOctagon, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';

export function EvalSummary({ evalData, onRunEval, loading }) {
  if (!evalData) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>No Ground Truth Evaluation Completed</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Evaluate AI classification accuracy against 10 hand-labeled gold standard rows.
        </p>
        <button className="btn btn-primary" onClick={onRunEval} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Run Evaluation Benchmark
        </button>
      </div>
    );
  }

  const formatPct = (val) => `${(val * 100).toFixed(1)}%`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
            <Award size={22} />
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ground Truth Agreement Scorecard
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Benchmarked against {evalData.nLabeled || 10} hand-labeled gold standard customer messages
          </p>
        </div>

        <button className="btn btn-primary" onClick={onRunEval} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Re-run Evaluation Benchmark
        </button>
      </div>

      {/* 4 Score Card Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-indigo)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Overall Agreement</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', margin: '0.35rem 0' }}>
            {formatPct(evalData.overallAgreement)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exact match across all fields</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Category Agreement</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-title)', margin: '0.35rem 0' }}>
            {formatPct(evalData.categoryAgreement)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Topic classification precision</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--p1-orange)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Priority Agreement</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--p1-orange)', fontFamily: 'var(--font-title)', margin: '0.35rem 0' }}>
            {formatPct(evalData.priorityAgreement)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity level alignment (P0–P3)</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--human-alert)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Needs Human Agreement</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--human-alert)', fontFamily: 'var(--font-title)', margin: '0.35rem 0' }}>
            {formatPct(evalData.needsHumanAgreement)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Routing decision precision</span>
        </div>
      </div>

      {/* Latency & Cost Stats */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <Clock size={18} color="var(--accent-indigo)" />
          <span style={{ color: 'var(--text-secondary)' }}>Avg Latency:</span>
          <strong>{evalData.avgLatencyMs} ms</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <DollarSign size={18} color="#10b981" />
          <span style={{ color: 'var(--text-secondary)' }}>Avg Cost / Msg:</span>
          <strong>${Number(evalData.avgCostUsd || 0).toFixed(6)} USD</strong>
        </div>
      </div>

      {/* Disagreements List */}
      {evalData.disagreements && evalData.disagreements.length > 0 ? (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--p1-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={18} /> Detailed Disagreement Analysis ({evalData.disagreements.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {evalData.disagreements.map((d, idx) => (
              <div key={idx} style={{ background: 'var(--panel-bg-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  [{d.messageId}] "{d.rawText}"
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>Category: <strong style={{ color: 'var(--p0-red)' }}>Pred: {d.predictedCategory}</strong> vs <strong style={{ color: '#10b981' }}>Actual: {d.actualCategory}</strong></span>
                  <span>Priority: <strong style={{ color: 'var(--p0-red)' }}>Pred: {d.predictedPriority}</strong> vs <strong style={{ color: '#10b981' }}>Actual: {d.actualPriority}</strong></span>
                  <span>NeedsHuman: <strong style={{ color: 'var(--p0-red)' }}>Pred: {String(d.predictedNeedsHuman)}</strong> vs <strong style={{ color: '#10b981' }}>Actual: {String(d.actualNeedsHuman)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> Perfect 100% agreement with all ground truth benchmarks!
        </div>
      )}
    </div>
  );
}
