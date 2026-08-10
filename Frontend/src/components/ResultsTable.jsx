import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

export function ResultsTable({ results, onSelectRow, page = 1, totalPages = 1, total = 0, limit = 20, onPageChange }) {
  if (!results || results.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No triage records match current filters.</p>
        <p style={{ fontSize: '0.85rem' }}>Click "Run Full Batch" above to ingest and classify dataset messages.</p>
      </div>
    );
  }

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'P0':
        return <span className="badge badge-p0">P0 URGENT</span>;
      case 'P1':
        return <span className="badge badge-p1">P1 HIGH</span>;
      case 'P2':
        return <span className="badge badge-p2">P2 MEDIUM</span>;
      case 'P3':
        return <span className="badge badge-p3">P3 LOW</span>;
      default:
        return <span className="badge">{prio}</span>;
    }
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="glass-panel table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Category</th>
            <th>Needs Human</th>
            <th>Customer Message Snapshot</th>
            <th>Confidence</th>
            <th>Latency</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => {
            const isHuman = item.needsHuman;
            const isInjection = item.category === 'abuse_or_injection';

            return (
              <tr
                key={item._id}
                className={isHuman ? 'row-needs-human' : ''}
                onClick={() => onSelectRow(item)}
              >
                <td>{getPriorityBadge(item.priority)}</td>
                <td>
                  <span style={{ fontWeight: 600, color: isInjection ? 'var(--p0-red)' : 'inherit' }}>
                    {isInjection && <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                    {item.category}
                  </span>
                </td>
                <td>
                  {isHuman ? (
                    <span className="badge badge-human">
                      <AlertCircle size={12} /> Needs Human
                    </span>
                  ) : (
                    <span className="badge badge-auto">
                      <CheckCircle2 size={12} /> Auto-Resolved
                    </span>
                  )}
                </td>
                <td style={{ maxWidth: '380px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                    {item.rawTextSnapshot || '(empty string)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {item.summary}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '45px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.round((item.confidence || 0) * 100)}%`,
                          height: '100%',
                          background: item.confidence < 0.55 ? 'var(--human-alert)' : 'var(--accent-indigo)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {item.latencyMs || 0}ms
                  </div>
                </td>
                <td style={{ color: 'var(--accent-indigo)' }}>
                  <ChevronRight size={18} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Glassmorphism Pagination Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--table-th-bg)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{startRecord}</strong>–<strong style={{ color: 'var(--text-primary)' }}>{endRecord}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> records (20 per page)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span style={{ fontWeight: 600, color: 'var(--text-primary)', padding: '0 0.5rem' }}>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
