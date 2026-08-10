import React from 'react';
import { Filter, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';

export function FilterBar({ filters, onChange, totalCount, needsHumanCount }) {
  const hasActiveFilters = filters.needsHuman !== '' || filters.priority !== 'all' || filters.category !== 'all';

  const handleClear = () => {
    onChange({ needsHuman: '', priority: 'all', category: 'all' });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
          <Filter size={18} /> Filters:
        </div>

        {/* Needs Human Dropdown */}
        <select
          value={filters.needsHuman}
          onChange={(e) => onChange({ needsHuman: e.target.value })}
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass-light)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Verification States</option>
          <option value="true">⚠️ Needs Human Attention</option>
          <option value="false">✓ Automated Resolution</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass-light)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Priorities (P0–P3)</option>
          <option value="P0">P0 — Urgent Security/Outage</option>
          <option value="P1">P1 — High Financial/Bug</option>
          <option value="P2">P2 — Medium Usability/Account</option>
          <option value="P3">P3 — Low Inquiry/Spam</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ category: e.target.value })}
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass-light)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Categories</option>
          <option value="billing">Billing</option>
          <option value="bug">Bug Report</option>
          <option value="complaint">Complaint</option>
          <option value="question">Question</option>
          <option value="account">Account & Auth</option>
          <option value="abuse_or_injection">Prompt Injection / Abuse</option>
          <option value="spam">Spam</option>
          <option value="out_of_scope">Out of Scope</option>
          <option value="other">Other / Fallback</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            title="Reset all filters to default"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={14} color="var(--human-alert)" /> Clear Filters
          </button>
        )}
      </div>

      {/* Counter badges */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} color="#10b981" /> Total Records: <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--human-alert)' }}>
          <AlertTriangle size={16} /> Needs Human: <strong style={{ color: 'var(--text-primary)' }}>{needsHumanCount}</strong>
        </div>
      </div>
    </div>
  );
}
