import React from 'react';
import { Loader2 } from 'lucide-react';

export function ProgressBar({ percent, message }) {
  if (percent === null || percent === undefined) return null;

  return (
    <div className="progress-container">
      <div className="progress-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 size={16} className="spin" color="var(--accent-indigo)" />
          <span>{message || 'Processing task...'}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-code)', color: 'var(--accent-purple)' }}>
          {Math.min(Math.round(percent), 100)}%
        </span>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${Math.min(Math.max(percent, 5), 100)}%` }}>
          <div className="progress-bar-shimmer" />
        </div>
      </div>
    </div>
  );
}
