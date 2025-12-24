// src/components/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="my-8 flex justify-start animate-fade-in">
      <div
        className="
          max-w-3xl w-full px-8 py-6 rounded-3xl shadow-lg backdrop-blur-sm
          bg-parchment/80 border border-gold/20 text-deep
          transition-all duration-300
        "
      >
        <div className="flex items-center gap-4">
          {/* Three pulsing dots */}
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-gold/70 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gold/70 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-gold/70 rounded-full animate-bounce delay-300"></div>
          </div>
          
          <p className="text-deep/80 italic font-serif text-lg">
            Socrates is pondering your question...
          </p>
        </div>
      </div>
    </div>
  );
}
