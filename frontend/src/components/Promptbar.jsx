import { useState } from 'react';

export default function Promptbar({ onSubmit, disabled }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto pointer-events-auto"
      >
        {/* This wrapper centers it first, then shifts the whole bar right */}
        <div className="translate-x-40"> {/* Adjust this value: 12, 16, 20, 24, 32, etc. */}
          <div className="max-w-4xl mx-auto"> {/* Keeps the bar width consistent */}
            <div className="flex gap-4 items-center bg-parchment/90 backdrop-blur-sm shadow-2xl rounded-3xl p-3 border border-gold/20">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pose your question..."
                disabled={disabled}
                className="flex-1 px-6 py-4 bg-transparent text-deep text-lg placeholder-deep/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={disabled || !query.trim()}
                className="p-4 bg-gold text-deep rounded-2xl hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}