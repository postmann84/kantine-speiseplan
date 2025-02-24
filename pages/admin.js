import { useState } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Zeige Login-Screen wenn nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Admin-Login</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
              setIsAuthenticated(true);
            } else {
              alert('Falsches Passwort');
            }
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded border p-2"
              placeholder="Passwort"
            />
            <button 
              type="submit"
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Platzhalter für den Admin-Content
  return <div>Admin-Bereich</div>;
}
