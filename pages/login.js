import { useState } from 'react';
import { useRouter } from 'next/router';
import { Lock, Loader } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        const from = typeof router.query.from === 'string' ? router.query.from : '/admin';
        router.replace(from.startsWith('/') ? from : '/admin');
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen.');
      }
    } catch (err) {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8" data-testid="login-card">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin-Anmeldung</h1>
          <p className="text-sm text-gray-500 mt-1">Rainer Westermann Kantine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Passwort eingeben"
              data-testid="login-password-input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" data-testid="login-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300"
            data-testid="login-submit-btn"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Anmelden…</> : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
