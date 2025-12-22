export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="mx-8 mt-6 p-4 bg-red-100 border-2 border-red-500 text-red-900 rounded-lg flex justify-between items-center animate-fade-in">
      <span>{message}</span>
      {onDismiss && <button onClick={onDismiss} className="ml-4 font-bold">×</button>}
    </div>
  );
}