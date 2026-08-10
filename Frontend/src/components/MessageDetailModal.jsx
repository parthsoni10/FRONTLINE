import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, Cpu, DollarSign, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { fetchResultDetail } from '../api/client';

export function MessageDetailModal({ item, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item && item._id) {
      setLoading(true);
      fetchResultDetail(item._id)
        .then((data) => setDetail(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [item]);

  if (!item) return null;

  const result = detail?.triageResult || item;
  const auditLogs = detail?.auditLogs || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', fontWeight: 700 }}>
                Triage Audit Record
              </h2>
              <span className={`badge ${result.needsHuman ? 'badge-human' : 'badge-auto'}`}>
                {result.needsHuman ? '⚠️ Needs Human' : '✓ Auto-Resolved'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              ID: {result._id} • Model: {result.modelUsed} ({result.promptVersion})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit telemetry...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Raw message block */}
            <div style={{ background: 'var(--panel-bg-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                <FileText size={14} /> Raw Customer Message Payload
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, fontFamily: 'var(--font-main)' }}>
                {result.rawTextSnapshot ? `"${result.rawTextSnapshot}"` : <em style={{ color: 'var(--text-muted)' }}>(empty payload)</em>}
              </p>
            </div>

            {/* Classification Decision grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem', color: result.category === 'abuse_or_injection' ? 'var(--p0-red)' : 'var(--accent-indigo)' }}>
                  {result.category}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Priority Level</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {result.priority}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence Score</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem', color: result.confidence < 0.55 ? 'var(--human-alert)' : '#10b981' }}>
                  {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Summary & Suggested Action */}
            <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Summary & Suggested Action</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                <strong>Summary:</strong> {result.summary}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#10b981' }}>
                <strong>Suggested Action:</strong> {result.suggestedAction}
              </p>
              {result.flagReason && (
                <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--p0-border)', borderRadius: '8px', color: 'var(--p0-red)', fontSize: '0.82rem' }}>
                  <strong>Flag Reason:</strong> {result.flagReason}
                </div>
              )}
            </div>

            {/* Security & Audit Events */}
            {auditLogs.length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--p0-red)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={16} /> Security & Rule Audit Events ({auditLogs.length})
                </h4>
                {auditLogs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--p0-red)', fontWeight: 600, textTransform: 'uppercase', marginRight: '0.5rem' }}>[{log.eventType}]</span>
                    <span style={{ color: 'var(--text-primary)' }}>{log.detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Technical Telemetry */}
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem', background: 'var(--panel-bg-subtle)', borderRadius: '8px', flexWrap: 'wrap' }}>
              <span><Cpu size={12} style={{ display: 'inline', marginRight: '3px' }} /> Tokens: In {result.inputTokens || 0} / Out {result.outputTokens || 0}</span>
              <span><Activity size={12} style={{ display: 'inline', marginRight: '3px' }} /> Latency: {result.latencyMs}ms</span>
              <span><DollarSign size={12} style={{ display: 'inline', marginRight: '3px' }} /> Cost: ${Number(result.estCostUsd || 0).toFixed(6)} USD</span>
            </div>

            {/* Full JSON viewer */}
            <div>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Raw Model Output (JSON Audit)</h4>
              <pre className="code-block">
                {JSON.stringify(result.rawModelResponse || result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
