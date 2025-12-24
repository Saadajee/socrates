// src/components/Promptbar.jsx
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
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none z-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto pointer-events-auto"
      >
        {/* Desktop: keep your exact shift. Mobile: no shift, centered */}
        <div className="translate-x-0 md:translate-x-40">
          <div className="max-w-4xl mx-auto">
            <div className="
              flex gap-3 md:gap-4 items-center 
              bg-parchment/90 backdrop-blur-sm shadow-2xl rounded-3xl 
              p-2 md:p-3 
              border border-gold/20
            ">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pose your question..."
                disabled={disabled}
                className="
                  flex-1 px-4 md:px-6 py-3 md:py-4 
                  bg-transparent text-deep text-base md:text-lg 
                  placeholder-deep/50 focus:outline-none
                "
                autoFocus
              />
              <button
                type="submit"
                disabled={disabled || !query.trim()}
                className="
                  p-3 md:p-4 
                  bg-gold text-deep rounded-2xl 
                  hover:bg-gold-dark transition 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  flex-shrink-0
                "
                aria-label="Send"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
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
