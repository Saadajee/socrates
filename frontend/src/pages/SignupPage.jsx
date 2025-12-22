// src/pages/SignupPage.jsx
import { useState } from 'react';
import api from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Same elegant background as login */}
      <div className="absolute inset-0 bg-gradient-to-br from-marble via-stone/50 to-marble opacity-90" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#D4AF37_1px,_transparent_1px)] bg-[length:40px_40px]" />

      <div className="relative w-full max-w-lg px-8">
        <div className="bg-parchment/95 backdrop-blur-md rounded-3xl shadow-2xl gold-border p-12 animate-fade-in">
          {/* Welcoming header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold font-serif text-deep tracking-wide">Join Socrates</h1>
            <p className="mt-4 text-deep/70 text-lg font-medium">Begin Your Pursuit of Truth</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-5 rounded-2xl border-2 border-gold/40 focus:border-gold focus:outline-none bg-marble/60 text-deep text-lg placeholder-deep/50 transition-all duration-300"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-5 rounded-2xl border-2 border-gold/40 focus:border-gold focus:outline-none bg-marble/60 text-deep text-lg placeholder-deep/50 transition-all duration-300"
              />
            </div>

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
              {loading ? 'Creating...' : 'Begin Your Journey'}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-deep/70 text-lg">
              Already among the seekers?{' '}
              <Link
                to="/login"
                className="text-gold font-semibold hover:text-gold-dark underline underline-offset-4 transition"
              >
                Return to the Agora
              </Link>
            </p>
          </div>
        </div>

        {/* Same decorative Greek border */}
        <div className="mt-8 text-center opacity-30">
          <div className="inline-block border-t-4 border-gold w-32" />
          <span className="mx-4 text-gold text-2xl">✦</span>
          <div className="inline-block border-t-4 border-gold w-32" />
        </div>
      </div>
    </div>
  );
}