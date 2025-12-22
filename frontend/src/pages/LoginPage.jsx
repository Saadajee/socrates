// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to="/app" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-marble">
      {/* Elegant layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone/20 via-marble to-stone/30" />
      <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-deep/10 via-transparent to-deep/5" />
      {/* Subtle paper texture via repeating radial gradient */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#D4AF37_1px,_transparent_1px)] bg-[length:40px_40px]" />

      <div className="relative w-full max-w-lg px-8">
        <div className="bg-parchment/95 backdrop-blur-md rounded-3xl shadow-2xl gold-border p-12 animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold font-serif text-deep tracking-wide">Socrates</h1>
            <p className="mt-4 text-deep/70 text-lg font-medium">Enter the Agora of Wisdom</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-5 rounded-2xl border-2 border-gold/40 focus:border-gold focus:outline-none bg-marble/60 text-deep text-lg placeholder-deep/50 transition-all duration-300"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-5 rounded-2xl border-2 border-gold/40 focus:border-gold focus:outline-none bg-marble/60 text-deep text-lg placeholder-deep/50 transition-all duration-300"
            />

            {error && (
              <p className="text-red-600 text-center font-medium bg-red-50/80 py-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gold text-deep font-semibold text-xl rounded-2xl hover:bg-gold-dark transition-all duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Entering...' : 'Enter the Agora'}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-deep/70 text-lg">
              No account yet?{' '}
              <Link
                to="/signup"
                className="text-gold font-semibold hover:text-gold-dark underline underline-offset-4 transition"
              >
                Begin your journey
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center opacity-30">
          <div className="inline-block border-t-4 border-gold w-32" />
          <span className="mx-4 text-gold text-2xl">✦</span>
          <div className="inline-block border-t-4 border-gold w-32" />
        </div>
      </div>
    </div>
  );
}