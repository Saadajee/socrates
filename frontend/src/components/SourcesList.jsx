// src/components/SourcesList.jsx
import { useState } from 'react';

export default function SourcesList({ sources }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-6 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-deep/70 hover:text-deep transition text-sm font-medium"
      >
        <span>{isExpanded ? '▼' : '▶'} Sources ({sources.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-parchment/70 backdrop-blur-sm rounded-2xl border border-gold/20 shadow-md">
          <ul className="space-y-3">
            {sources.map((src, i) => (
              <li key={i} className="text-sm text-deep/90 flex justify-between items-center">
                <span className="font-medium truncate max-w-md">
                  {src.title || `Document ${src.doc_id}`}
                </span>
                <span className="text-gold-dark font-medium ml-4">
                  {src.score.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}