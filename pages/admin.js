import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate } from '../lib/dateUtils';

export default function Admin() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Bestehende States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');
  const [weekMenu, setWeekMenu] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [holidays, setHolidays] = useState({});
  const [contactInfo, setContactInfo] = useState({ phone: '', postcode: '' });
  const [vacationData, setVacationData] = useState({
    isOnVacation: false,
    startDate: '',
    endDate: '',
    message: ''
  });
  const [availableMenus, setAvailableMenus] = useState([]);
  const [analyzingMeal, setAnalyzingMeal] = useState(false);

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

  // Der ursprüngliche Admin-Bereich
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">Menü-Verwaltung</h1>

        {/* Urlaubs-Toggle als kleiner Button */}
        <div className="mb-4 flex items-center justify-end">
          <button
            onClick={() => setVacationData(prev => ({...prev, isOnVacation: !prev.isOnVacation}))}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              vacationData.isOnVacation 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="material-icons text-sm">
              {vacationData.isOnVacation ? '🏖️' : '🏢'}
            </span>
            Urlaubsmodus {vacationData.isOnVacation ? 'aktiv' : 'inaktiv'}
          </button>
        </div>

        {/* Urlaubs-Einstellungen */}
        {vacationData.isOnVacation && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">Urlaubseinstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700">Von</label>
                <input
                  type="date"
                  value={vacationData.startDate}
                  onChange={(e) => setVacationData(prev => ({...prev, startDate: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700">Bis</label>
                <input
                  type="date"
                  value={vacationData.endDate}
                  onChange={(e) => setVacationData(prev => ({...prev, endDate: e.target.value}))}
                  className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700">Urlaubsnachricht</label>
              <textarea
                value={vacationData.message}
                onChange={(e) => setVacationData(prev => ({...prev, message: e.target.value}))}
                placeholder="z.B.: Wir sind im Urlaub und öffnen wieder am 15.08.2024"
                className="mt-1 block w-full rounded-md border-yellow-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Hauptformular */}
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            const response = await fetch('/api/menus', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                weekStart: dateRange.start,
                weekEnd: dateRange.end,
                menus: weekMenu,
                contactInfo,
                vacation: vacationData
              }),
            });

            if (!response.ok) {
              throw new Error('Fehler beim Speichern');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }} className="space-y-6">
          
          {/* Zeitraum */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Zeitraum</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Von</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    const startDate = new Date(e.target.value);
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 4); // 5 Tage später
                    
                    setDateRange({
                      start: e.target.value,
                      end: endDate.toISOString().split('T')[0]
                    });

                    // Hole Feiertage für die neue Woche
                    const holidays = getHolidaysForWeek(startDate);
                    setHolidays(holidays);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bis</label>
                <input
                  type="date"
                  value={dateRange.end}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Kontaktinformationen */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({...prev, phone: e.target.value}))}
                  placeholder="0123 456789"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PLZ</label>
                <input
                  type="text"
                  value={contactInfo.postcode}
                  onChange={(e) => setContactInfo(prev => ({...prev, postcode: e.target.value}))}
                  placeholder="12345"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Speiseplan */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Speiseplan</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((day) => {
                const date = new Date(dateRange.start);
                date.setDate(date.getDate() + day - 1);
                const dateStr = formatDate(date);
                const isHoliday = holidays[dateStr];

                return (
                  <div key={day} className={`p-4 rounded-lg ${isHoliday ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {dateStr}
                        {isHoliday && (
                          <span className="ml-2 text-sm text-red-600">
                            ({isHoliday})
                          </span>
                        )}
                      </h3>
                    </div>
                    <textarea
                      value={weekMenu[day - 1] || ''}
                      onChange={(e) => {
                        const newMenu = [...weekMenu];
                        newMenu[day - 1] = e.target.value;
                        setWeekMenu(newMenu);
                      }}
                      placeholder={isHoliday ? 'Feiertag - geschlossen' : 'Menü eingeben...'}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status und Aktionen */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {error && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-1" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center text-green-600">
                  <Save className="w-5 h-5 mr-1" />
                  Gespeichert!
                </div>
              )}
              {loading && (
                <div className="flex items-center text-blue-600">
                  <Loader className="w-5 h-5 mr-1 animate-spin" />
                  Speichern...
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={async () => {
                  setIsSending(true);
                  try {
                    const response = await fetch('/api/send-menu', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        weekStart: dateRange.start,
                        weekEnd: dateRange.end,
                      }),
                    });
                    
                    if (!response.ok) throw new Error('E-Mail konnte nicht versendet werden');
                    
                    setEmailStatus('E-Mail wurde erfolgreich versendet');
                  } catch (error) {
                    setEmailStatus('Fehler beim Versenden der E-Mail');
                    console.error(error);
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSending ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                    Sende...
                  </>
                ) : (
                  'E-Mail senden'
                )}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Speichern
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
