import React, { useState, useEffect } from 'react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, isSameDay, formatFullDate } from '../lib/dateUtils';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);

  // Berechnet das Datum für jeden Wochentag
  const getDayDate = (weekStart, dayIndex) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  // Prüft ob der übergebene Tag heute ist
  const isToday = (dayName) => {
    const today = new Date();
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[today.getDay()] === dayName;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        console.log('Geladene Menüdaten:', data.data); // Detaillierter Debug-Log
        if (data.success && data.data) {
          console.log('Tage:', data.data.days); // Debug-Log für Tage
          data.data.days?.forEach((day, index) => {
            console.log(`Tag ${index + 1}:`, day); // Debug-Log für jeden Tag
            day.meals?.forEach((meal, mealIndex) => {
              console.log(`- Gericht ${mealIndex + 1}:`, meal); // Debug-Log für jedes Gericht
            });
          });
          setMenuData(data.data);
          // Hole Feiertage für die aktuelle Woche
          const weekHolidays = getHolidaysForWeek(data.data.weekStart);
          console.log('Fetched holidays:', weekHolidays); // Debug log
          setHolidays(weekHolidays);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Laden...</div>;
  if (!menuData) return <div className="p-4">Kein Speiseplan verfügbar</div>;

  // Wenn Urlaub aktiv ist, zeigen wir nur die Urlaubsmeldung
  if (menuData?.vacation?.isOnVacation) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Betriebskantine</h1>
        </header>

        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-8 text-center">
          <div className="text-6xl mb-6">🏖️</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Wir sind bald wieder für Sie da
          </h2>
          <p className="text-xl text-yellow-700 mb-6">
            {menuData.vacation.message}
          </p>
          <div className="text-lg font-medium text-yellow-800">
            <p>Von: {formatFullDate(menuData.vacation.startDate)}</p>
            <p>Bis: {formatFullDate(menuData.vacation.endDate)}</p>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm space-y-2">
          <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menuData.contactInfo.phone}</p>
          <p>© {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  }

  // Normaler Return für nicht-Urlaubszeit
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Urlaubs-Banner (wenn aktiv) */}
      {menuData?.vacation?.isOnVacation && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {menuData.vacation.message}<br />
                <span className="font-medium">
                  {new Date(menuData.vacation.startDate).toLocaleDateString()} - {new Date(menuData.vacation.endDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nur eine Überschrift im Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Betriebskantine</h1>
      </header>
      
      {/* Zeitraum und Kontaktinfo */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-blue-900">Speiseplan</h2>
          <p className="text-blue-800">
            Gültig vom {formatDate(menuData.weekStart)} bis {formatDate(menuData.weekEnd)}
          </p>
        </div>
        {menuData.contactInfo && (
          <div className="text-sm text-gray-600">
            <p>Telefon: {menuData.contactInfo.phone}</p>
            <p className="italic">Für Postfremde erhöht sich der Preis um {menuData.contactInfo.postcode}€</p>
          </div>
        )}
      </div>

      {/* Tagesmenüs */}
      <main className="space-y-6">
        {menuData?.days?.map((day, index) => {
          const dayDate = new Date(menuData.weekStart);
          dayDate.setDate(dayDate.getDate() + index);
          const dateStr = dayDate.toISOString().split('T')[0];
          const holidayInfo = holidays[dateStr];
          
          const isCurrentDay = isSameDay(dayDate, new Date());
          const todayClass = isCurrentDay
            ? 'transform scale-105 bg-blue-50 shadow-lg' 
            : 'bg-white shadow';
          
          return (
            <div key={index} 
                 className={`${todayClass} p-6 rounded-lg transition-all duration-200 hover:shadow-md`}>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {day.day} ({formatDate(dayDate)})
                </h2>
                {(holidayInfo || day.isClosed) && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    day.isClosed 
                      ? 'bg-gray-100 text-gray-800'
                      : holidayInfo.type === 'holiday'
                        ? 'bg-red-100 text-red-800'
                        : `bg-${holidayInfo.color}-100 text-${holidayInfo.color}-800`
                  }`}>
                    {day.isClosed ? 'Geschlossen' : holidayInfo.name}
                  </span>
                )}
              </div>
              
              {(holidayInfo?.type === 'holiday' || day.isClosed) ? (
                <div className="text-center py-4 text-gray-600">
                  {day.isClosed 
                    ? (day.closedReason || 'Heute bleibt unsere Kantine geschlossen.')
                    : 'An Feiertagen bleibt unsere Kantine geschlossen.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {day.meals?.map((meal, mealIndex) => {
                    console.log('Rendering meal:', meal); // Debug-Log für jedes gerenderte Gericht
                    return (
                      <div key={mealIndex} 
                           className={`relative ${
                             meal.isAction 
                               ? 'bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4' 
                               : 'py-2'
                           }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 font-medium">{meal.name}</span>
                              {meal.isAction && (
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                  Aktionsessen
                                </span>
                              )}
                            </div>
                            {meal.isAction && meal.actionNote && (
                              <p className="text-sm text-yellow-700 mt-1 italic">
                                {meal.actionNote}
                              </p>
                            )}
                          </div>
                          <span className="text-gray-900 font-semibold ml-4 whitespace-nowrap">
                            {meal.price.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm space-y-2 border-t pt-4">
        <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menuData.contactInfo.phone}</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
