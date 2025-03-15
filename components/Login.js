import { useState, useEffect } from 'react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Setze isClient auf true, wenn die Komponente im Browser läuft
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hartcodierte Anmeldedaten
  const ADMIN_USERNAME = 'postmann65@web.de';
  const ADMIN_PASSWORD = 'Hagepatt12';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Einfache Überprüfung der Anmeldedaten
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Speichere den Login-Status im localStorage (nur auf Client-Seite)
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdminLoggedIn', 'true');
      }
      
      // Rufe die Callback-Funktion auf, um den übergeordneten Komponenten-Status zu aktualisieren
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError('Ungültige Anmeldedaten');
    }
    
    setLoading(false);
  };

  // Wenn nicht client-side, zeige ein einfaches Lade-Element
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p>Lade...</p>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin-Bereich
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 